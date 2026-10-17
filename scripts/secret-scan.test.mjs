import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { historicalProvenanceExceptions, scanSecrets } from "./secret-scan.mjs";

const binary = process.env.GITLEAKS_BIN || "gitleaks";
// Deliberately not a provider key. A test-only rule proves detection without credentials.
const marker = ["SYNTHETIC", "PORTFOLIO", "SECRET", "PROBE"].join("_");
const additionalTestRules = `
[[rules]]
id = "synthetic-portfolio-probe"
description = "Inert test marker"
regex = '''${marker}'''
`;

function git(root, ...args) {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  assert.equal(result.status, 0, "Synthetic fixture Git command must succeed");
  return result.stdout;
}

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "portfolio-secret-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  git(root, "init", "--initial-branch=main");
  git(root, "config", "user.name", "Synthetic Test");
  git(root, "config", "user.email", "test@example.invalid");
  writeFileSync(path.join(root, "README.md"), "Public synthetic repository.\n");
  git(root, "add", "README.md");
  git(root, "commit", "-m", "test: initialize synthetic fixture");
  return root;
}

function scan(root, options = {}) {
  return scanSecrets({ root, binary, additionalTestRules, ...options });
}

test("accepts a clean tracked tree and ignores untracked private files", (t) => {
  const root = fixture(t);
  writeFileSync(path.join(root, ".gitignore"), ".env.local\n");
  writeFileSync(path.join(root, ".env.local"), marker);
  git(root, "add", ".gitignore");
  assert.deepEqual(scan(root), { fileCount: 2 });
});

test("rejects an ignored file that is already tracked", (t) => {
  const root = fixture(t);
  writeFileSync(path.join(root, ".gitignore"), "private.txt\n");
  writeFileSync(path.join(root, "private.txt"), marker);
  git(root, "add", ".gitignore");
  git(root, "add", "--force", "private.txt");
  assert.throws(() => scan(root), /detected findings/);
});

test("rejects unstaged changes in a tracked file", (t) => {
  const root = fixture(t);
  writeFileSync(path.join(root, "README.md"), marker);
  assert.throws(() => scan(root), /detected findings/);
});

test("detects removed history on another fetched local branch", (t) => {
  const root = fixture(t);
  git(root, "switch", "-c", "historical-fixture");
  writeFileSync(path.join(root, "removed.txt"), marker);
  git(root, "add", "removed.txt");
  git(root, "commit", "-m", "test: add inert marker");
  git(root, "rm", "removed.txt");
  git(root, "commit", "-m", "test: remove inert marker");
  git(root, "switch", "main");
  assert.throws(() => scan(root), /detected findings/);
});

test("detects a marker introduced only by a merge resolution and later removed", (t) => {
  const root = fixture(t);
  git(root, "switch", "-c", "feature");
  writeFileSync(path.join(root, "feature.txt"), "feature work\n");
  git(root, "add", "feature.txt");
  git(root, "commit", "-m", "test: feature work");
  git(root, "switch", "main");
  writeFileSync(path.join(root, "main.txt"), "main work\n");
  git(root, "add", "main.txt");
  git(root, "commit", "-m", "test: parallel work");
  git(root, "merge", "--no-ff", "--no-commit", "feature");
  writeFileSync(path.join(root, "merge-only.txt"), marker);
  git(root, "add", "merge-only.txt");
  git(root, "commit", "-m", "test: merge-only synthetic marker");
  git(root, "rm", "merge-only.txt");
  git(root, "commit", "-m", "test: remove merge-only marker");
  assert.throws(() => scan(root), /detected findings/);
});

test("provenance exceptions match only 24 immutable historical fingerprints", () => {
  assert.equal(historicalProvenanceExceptions.length, 24);
  assert.equal(new Set(historicalProvenanceExceptions).size, 24);
  for (const fingerprint of historicalProvenanceExceptions) {
    assert.match(
      fingerprint,
      /^[a-f0-9]{40}:(?:src\/contracts\/source\.json|docs\/verification\/polished-ai-assistant\.md):generic-api-key:\d+$/,
    );
    const parts = fingerprint.split(":");
    const changedLine = [...parts.slice(0, -1), Number(parts.at(-1)) + 100].join(":");
    const changedCommit = ["0".repeat(40), ...parts.slice(1)].join(":");
    assert.ok(!historicalProvenanceExceptions.includes(changedLine));
    assert.ok(!historicalProvenanceExceptions.includes(changedCommit));
  }
});

test("current provenance exception requires the exact reviewed value and source path", (t) => {
  const root = fixture(t);
  const directory = path.join(root, "src", "contracts");
  mkdirSync(directory, { recursive: true });
  const source = path.join(directory, "source.json");
  const publicRevision = "61da393520014ed2c8b1f8a0635b3b4e615f9e53";
  const content = `"api_commit": "${publicRevision}"\n`;
  writeFileSync(source, content);
  git(root, "add", "src/contracts/source.json");
  assert.deepEqual(scan(root), { fileCount: 2 });
  writeFileSync(source, marker);
  assert.throws(() => scan(root), /detected findings/);
  writeFileSync(source, content);
  writeFileSync(path.join(root, "different-path.json"), content);
  git(root, "add", "different-path.json");
  assert.throws(() => scan(root), /detected findings/);
});

test("the same provenance path and generic rule still reject a different commit or line", (t) => {
  const root = fixture(t);
  mkdirSync(path.join(root, "src", "contracts"), { recursive: true });
  // An existing public Git commit ID exercises the generic detector without a credential.
  const provenance = "7753d397afaa80e3ea6b19c9aa8affda5f02ba02";
  const file = path.join(root, "src", "contracts", "source.json");
  writeFileSync(file, `\n"api_commit": "${provenance}"\n`);
  git(root, "add", "src/contracts/source.json");
  git(root, "commit", "-m", "test: public provenance at a different commit");
  git(root, "rm", "src/contracts/source.json");
  git(root, "commit", "-m", "test: remove synthetic provenance fixture");
  assert.throws(() => scan(root), /detected findings/);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${"\n".repeat(100)}"api_commit": "${provenance}"\n`);
  git(root, "add", "src/contracts/source.json");
  assert.throws(() => scan(root), /detected findings/);
});

test("does not accept allow comments or repository allowlist configuration", (t) => {
  const root = fixture(t);
  writeFileSync(path.join(root, "README.md"), `${marker} # gitleaks:allow\n`);
  writeFileSync(path.join(root, ".gitleaks.toml"), "[allowlist]\npaths = ['.*']\n");
  writeFileSync(path.join(root, ".gitleaksignore"), "README.md:synthetic-portfolio-probe:1\n");
  git(root, "add", ".gitleaks.toml", ".gitleaksignore");
  assert.throws(() => scan(root), /detected findings/);
});

test("fails closed on shallow history", (t) => {
  const root = fixture(t);
  const shallow = path.join(root, "shallow");
  git(root, "clone", "--depth", "1", pathToFileURL(root).href, shallow);
  assert.throws(() => scan(shallow), /requires full Git history/);
});

test("rejects a tracked symlink without scanning its untracked target", (t) => {
  const root = fixture(t);
  writeFileSync(path.join(root, ".env.local"), marker);
  symlinkSync(".env.local", path.join(root, "link.txt"));
  git(root, "add", "link.txt");
  assert.throws(() => scan(root), /regular tracked files/);
});

test("a missing or wrong-version scanner cannot pass", (t) => {
  const root = fixture(t);
  assert.throws(() => scan(root, { binary: path.join(root, "missing") }), /requires Gitleaks/);
  const wrong = path.join(root, "wrong-scanner");
  writeFileSync(wrong, "#!/bin/sh\nprintf '0.0.0\\n'\n", { mode: 0o700 });
  assert.throws(() => scan(root, { binary: wrong }), /requires Gitleaks/);
});

test("scanner errors and their raw output never reach CLI logs", (t) => {
  const root = fixture(t);
  const fake = path.join(root, "failing-scanner");
  writeFileSync(
    fake,
    `#!/bin/sh\nif [ "$1" = version ]; then echo 8.30.1; exit 0; fi\necho '${marker}'\necho '${marker}' >&2\nexit 2\n`,
  );
  chmodSync(fake, 0o700);
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(new URL("./secret-scan.mjs", import.meta.url))],
    {
      cwd: root,
      env: { ...process.env, GITLEAKS_BIN: fake },
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 1);
  assert.doesNotMatch(result.stdout + result.stderr, new RegExp(marker));
  assert.match(result.stderr, /Secret scanner failed/);
});

test("artifact mode scans uploaded static, server and CI files while excluding cache", (t) => {
  const root = fixture(t);
  const directory = path.join(root, ".next", "static");
  mkdirSync(directory, { recursive: true });
  const cache = path.join(root, ".next", "cache");
  mkdirSync(cache);
  writeFileSync(path.join(cache, "ignored.txt"), marker);
  writeFileSync(path.join(directory, "public.js"), "console.log('public');\n");
  assert.deepEqual(scan(root, { artifacts: true }), { fileCount: 1 });
  writeFileSync(path.join(directory, "public.js"), marker);
  assert.throws(() => scan(root, { artifacts: true }), /detected findings/);
  writeFileSync(path.join(directory, "public.js"), "public output\n");
  const server = path.join(root, ".next", "server");
  mkdirSync(server);
  writeFileSync(path.join(server, "page.rsc"), marker);
  assert.throws(() => scan(root, { artifacts: true }), /detected findings/);
  rmSync(path.join(server, "page.rsc"));
  const ci = path.join(root, ".artifacts", "ci");
  mkdirSync(ci, { recursive: true });
  writeFileSync(path.join(ci, "browser-plan.json"), marker);
  assert.throws(() => scan(root, { artifacts: true }), /detected findings/);
});

test("artifact mode fails closed when absent, empty or symlinked", (t) => {
  const root = fixture(t);
  assert.throws(() => scan(root, { artifacts: true }));
  const directory = path.join(root, ".next", "static");
  mkdirSync(directory, { recursive: true });
  assert.throws(() => scan(root, { artifacts: true }), /nonempty/);
  symlinkSync(path.join(root, "README.md"), path.join(directory, "linked.js"));
  assert.throws(() => scan(root, { artifacts: true }), /regular artifact files/);
  rmSync(path.join(directory, "linked.js"));
  writeFileSync(path.join(directory, "public.js"), "public output\n");
  mkdirSync(path.join(root, ".artifacts"));
  symlinkSync("missing-directory", path.join(root, ".artifacts", "ci"));
  assert.throws(() => scan(root, { artifacts: true }), /regular artifact directories/);
});
