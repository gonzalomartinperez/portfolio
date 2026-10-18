import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  truncateSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";
import {
  createProvenance,
  readContext,
  validateContext,
  verifyProvenance,
} from "../../tools/ci-build-provenance.mjs";

const sha = "a".repeat(40);
const configFiles = [
  ".nvmrc",
  "package.json",
  "package-lock.json",
  "next.config.mjs",
  "playwright.config.ts",
];
const context = () => ({
  source: { sha, tree: "b".repeat(40), headSha: "c".repeat(40), baseSha: "d".repeat(40) },
  workflow: {
    repository: "gonzalomartinperez/portfolio",
    runId: "123",
    runAttempt: "1",
    sha: "e".repeat(40),
    ref: "gonzalomartinperez/portfolio/.github/workflows/ci.yml@refs/pull/164/merge",
    family: "ci",
  },
  inputs: {
    assistantEnabled: true,
    analyticsEnabled: true,
    analyticsIngestUrl: "https://127.0.0.1:3160/api/v1/analytics/events",
    assistantApiUrl: "https://assistant.gonzalomartinperez.com",
  },
  runtime: { node: "v24.22.0", platform: "linux", arch: "x64" },
  configuration: { files: configFiles.map((name) => ({ path: name, sha256: "f".repeat(64) })) },
});
function fixture(t) {
  const directory = mkdtempSync(path.join(tmpdir(), "portfolio-provenance-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const archive = path.join(directory, "portfolio-production-build.tar.gz");
  const receipt = path.join(directory, "portfolio-build-provenance.json");
  writeFileSync(archive, gzipSync("synthetic owned archive bytes; no extraction"));
  return { directory, archive, receipt, context: context() };
}
const options = (f, hash) => ({ context: f.context, expectedHash: hash });
function created(f) {
  return createProvenance(f.directory, { context: f.context });
}

test("producer and consumer bind the same archive, context and trusted job hash", (t) => {
  const f = fixture(t);
  const output = path.join(f.directory, "github-output");
  writeFileSync(output, "existing=retained\n");
  const receipt = createProvenance(f.directory, { context: f.context, output });
  assert.equal(
    readFileSync(output, "utf8"),
    `existing=retained\narchive_sha256=${receipt.archive.sha256}\n`,
  );
  assert.deepEqual(verifyProvenance(f.directory, options(f, receipt.archive.sha256)), receipt);
  assert.equal(
    receipt.archive.sha256,
    createHash("sha256").update(readFileSync(f.archive)).digest("hex"),
  );
});

test("nightly uses its own exact workflow identity and optional base", (t) => {
  const f = fixture(t);
  f.context.workflow.family = "nightly";
  f.context.workflow.ref =
    "gonzalomartinperez/portfolio/.github/workflows/nightly.yml@refs/heads/main";
  f.context.source.baseSha = null;
  const receipt = created(f);
  assert.deepEqual(verifyProvenance(f.directory, options(f, receipt.archive.sha256)), receipt);
});

test("archive tampering cannot be legitimized by rewriting its self-reported hash", (t) => {
  const f = fixture(t);
  const receipt = created(f);
  const trustedHash = receipt.archive.sha256;
  writeFileSync(f.archive, gzipSync("replaced archive"));
  receipt.archive.sha256 = createHash("sha256").update(readFileSync(f.archive)).digest("hex");
  receipt.archive.bytes = readFileSync(f.archive).length;
  writeFileSync(f.receipt, JSON.stringify(receipt));
  assert.throws(() => verifyProvenance(f.directory, options(f, trustedHash)));
  for (const value of [undefined, "", "a\n".repeat(32), "0".repeat(64)])
    assert.throws(() => verifyProvenance(f.directory, options(f, value)));
});

for (const [group, field, value] of [
  ["source", "sha", "1".repeat(40)],
  ["source", "tree", "1".repeat(40)],
  ["source", "headSha", "1".repeat(40)],
  ["source", "baseSha", null],
  ["workflow", "runId", "124"],
  ["workflow", "runAttempt", "2"],
  ["workflow", "sha", "1".repeat(40)],
  ["workflow", "ref", "gonzalomartinperez/portfolio/.github/workflows/ci.yml@refs/heads/main"],
])
  test(`consumer rejects mismatched ${group}.${field}`, (t) => {
    const f = fixture(t);
    const receipt = created(f);
    f.context[group][field] = value;
    assert.throws(() => verifyProvenance(f.directory, options(f, receipt.archive.sha256)));
  });

test("configuration file drift is rejected even with unchanged source fields", (t) => {
  const f = fixture(t);
  const receipt = created(f);
  f.context.configuration.files[1].sha256 = "0".repeat(64);
  assert.throws(() => verifyProvenance(f.directory, options(f, receipt.archive.sha256)));
});

for (const [group, field, value] of [
  ["workflow", "repository", "other/portfolio"],
  ["workflow", "runId", 123],
  ["workflow", "runAttempt", "0"],
  ["workflow", "sha", "not-a-sha"],
  ["workflow", "family", "deploy"],
  ["workflow", "ref", "gonzalomartinperez/portfolio/.github/workflows/nightly.yml@refs/heads/main"],
  ["workflow", "ref", "gonzalomartinperez/portfolio/.github/workflows/ci.yml@refs/heads/../main"],
  ["inputs", "assistantEnabled", false],
  ["inputs", "analyticsEnabled", "true"],
  ["inputs", "analyticsIngestUrl", "https://external.invalid/events"],
  ["inputs", "assistantApiUrl", "https://external.invalid"],
  ["runtime", "node", "v24.21.0"],
  ["runtime", "platform", "win32"],
  ["runtime", "arch", "arm64"],
])
  test(`producer rejects invalid ${group}.${field} context`, (t) => {
    const f = fixture(t);
    f.context[group][field] = value;
    assert.throws(() => created(f));
  });

test("receipt closed fields, bounds and unsafe types fail before acceptance", (t) => {
  const f = fixture(t);
  const receipt = created(f);
  const original = JSON.stringify(receipt);
  const mutations = [
    (x) => {
      x.unknown = "unreviewed";
    },
    (x) => {
      x.source.unknown = true;
    },
    (x) => {
      delete x.workflow;
    },
    (x) => {
      x.schemaVersion = "1";
    },
    (x) => {
      x.archive.bytes = true;
    },
    (x) => {
      x.archive.bytes += 1;
    },
    (x) => {
      x.archive.file = "../other.tar.gz";
    },
    (x) => {
      x.configuration.files.push({ path: "extra", sha256: "0".repeat(64) });
    },
  ];
  for (const mutate of mutations) {
    const changed = JSON.parse(original);
    mutate(changed);
    writeFileSync(f.receipt, JSON.stringify(changed));
    assert.throws(() => verifyProvenance(f.directory, options(f, receipt.archive.sha256)));
  }
  writeFileSync(f.receipt, " ".repeat(10241));
  assert.throws(() => verifyProvenance(f.directory, options(f, receipt.archive.sha256)));
});

test("consumer requires a real bounded receipt and producer never overwrites it", (t) => {
  const f = fixture(t);
  const hash = createHash("sha256").update(readFileSync(f.archive)).digest("hex");
  assert.throws(() => verifyProvenance(f.directory, options(f, hash)));
  created(f);
  assert.throws(() => created(f));
  writeFileSync(f.receipt, "{invalid");
  assert.throws(() => verifyProvenance(f.directory, options(f, hash)));
});

test("missing, symlinked, oversized and non-gzip archives reject without extraction", (t) => {
  const f = fixture(t);
  rmSync(f.archive);
  assert.throws(() => created(f));
  writeFileSync(path.join(f.directory, "target"), gzipSync("owned"));
  symlinkSync(path.join(f.directory, "target"), f.archive);
  assert.throws(() => created(f));
  rmSync(f.archive);
  writeFileSync(f.archive, "not gzip");
  assert.throws(() => created(f));
  truncateSync(f.archive, 256 * 1024 * 1024 + 1);
  assert.throws(() => created(f));
});

test("symlinked receipt cannot redirect reads or overwrite unrelated files", (t) => {
  const f = fixture(t);
  const receipt = created(f);
  const target = path.join(f.directory, "target");
  writeFileSync(target, readFileSync(f.receipt));
  rmSync(f.receipt);
  symlinkSync(target, f.receipt);
  assert.throws(() => verifyProvenance(f.directory, options(f, receipt.archive.sha256)));
  assert.throws(() => created(f));
});

test("symlinked workflow output is rejected without changing its target", (t) => {
  const f = fixture(t);
  const target = path.join(f.directory, "output-target");
  const output = path.join(f.directory, "github-output");
  writeFileSync(target, "keep unchanged\n");
  symlinkSync(target, output);
  assert.throws(() => createProvenance(f.directory, { context: f.context, output }));
  assert.equal(readFileSync(target, "utf8"), "keep unchanged\n");
});

test("default context binds actual Git files and rejects dirty config or wrong checkout/runtime", (t) => {
  const f = fixture(t);
  const root = path.join(f.directory, "repository");
  execFileSync("git", ["init", "--quiet", root]);
  for (const name of configFiles)
    writeFileSync(path.join(root, name), name === ".nvmrc" ? "24.22.0\n" : "{}\n");
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync(
    "git",
    [
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "-c",
      "commit.gpgsign=false",
      "commit",
      "--quiet",
      "-m",
      "synthetic fixture",
    ],
    { cwd: root },
  );
  const source = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const env = {
    CI_SOURCE_SHA: source,
    GITHUB_REPOSITORY: "gonzalomartinperez/portfolio",
    GITHUB_RUN_ID: "123",
    GITHUB_RUN_ATTEMPT: "1",
    GITHUB_WORKFLOW_SHA: sha,
    GITHUB_WORKFLOW_REF: "gonzalomartinperez/portfolio/.github/workflows/ci.yml@refs/heads/main",
    CI_WORKFLOW_FAMILY: "ci",
    ASSISTANT_ENABLED: "true",
    ANALYTICS_ENABLED: "true",
    ANALYTICS_INGEST_URL: "https://127.0.0.1:3160/api/v1/analytics/events",
  };
  const runtime = { version: "v24.22.0", platform: "linux", arch: "x64" };
  const reviewed = readContext({ root, env, runtime });
  assert.equal(
    readContext({ root, env: { ...env, CI_HEAD_SHA: "", CI_BASE_SHA: "" }, runtime }).source
      .baseSha,
    null,
  );
  assert.equal(reviewed.source.sha, source);
  assert.equal(reviewed.source.headSha, source);
  assert.equal(reviewed.source.baseSha, null);
  assert.throws(() => readContext({ root, env: { ...env, CI_SOURCE_SHA: sha }, runtime }));
  assert.throws(() => readContext({ root, env, runtime: { ...runtime, version: "v24.23.0" } }));
  writeFileSync(path.join(root, "package.json"), "changed\n");
  assert.throws(() => readContext({ root, env, runtime }));
});

test("CLI failures are generic and never echo arguments or subprocess diagnostics", () => {
  const result = spawnSync(
    process.execPath,
    ["tools/ci-build-provenance.mjs", "verify", "/synthetic-private-path"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "CI build provenance rejected.\n");
});

test("public provenance hashes and run identity reject trailing line breaks", () => {
  for (const mutate of [
    (c) => {
      c.source.sha += "\n";
    },
    (c) => {
      c.source.baseSha += "\n";
    },
    (c) => {
      c.workflow.sha += "\n";
    },
    (c) => {
      c.workflow.runId += "\n";
    },
    (c) => {
      c.workflow.ref += "\n";
    },
    (c) => {
      c.configuration.files[0].sha256 += "\n";
    },
  ]) {
    const candidate = context();
    mutate(candidate);
    assert.throws(() => validateContext(candidate), /Invalid CI build provenance/);
  }
});
