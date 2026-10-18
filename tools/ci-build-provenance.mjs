import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const archiveName = "portfolio-production-build.tar.gz";
const receiptName = "portfolio-build-provenance.json";
const repository = "gonzalomartinperez/portfolio";
const ingest = "https://127.0.0.1:3160/api/v1/analytics/events";
const assistant = "https://assistant.gonzalomartinperez.com";
const configFiles = [
  ".nvmrc",
  "package.json",
  "package-lock.json",
  "next.config.mjs",
  "playwright.config.ts",
];
const maxArchiveBytes = 256 * 1024 * 1024;
const sha40 = /^[a-f0-9]{40}$/;
const sha256 = /^[a-f0-9]{64}$/;

function requireCondition(condition) {
  if (!condition) throw new Error("Invalid CI build provenance.");
}
function exactKeys(value, keys) {
  requireCondition(value !== null && typeof value === "object" && !Array.isArray(value));
  requireCondition(
    Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key)),
  );
}
function regularFile(file, maximum) {
  const info = lstatSync(file);
  requireCondition(
    info.isFile() && !info.isSymbolicLink() && info.size > 0 && info.size <= maximum,
  );
  const fd = openSync(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const actual = fstatSync(fd);
    requireCondition(
      actual.isFile() &&
        actual.dev === info.dev &&
        actual.ino === info.ino &&
        actual.size === info.size,
    );
    return { fd, size: actual.size };
  } catch (error) {
    closeSync(fd);
    throw error;
  }
}
function boundedBytes(file, maximum) {
  const { fd, size } = regularFile(file, maximum);
  try {
    const buffer = Buffer.alloc(size + 1);
    let length = 0;
    while (length < buffer.length) {
      const count = readSync(fd, buffer, length, buffer.length - length, null);
      if (!count) break;
      length += count;
    }
    requireCondition(length === size);
    return buffer.subarray(0, length);
  } finally {
    closeSync(fd);
  }
}
function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
function archiveDigest(directory) {
  requireCondition(lstatSync(directory).isDirectory() && !lstatSync(directory).isSymbolicLink());
  const { fd, size } = regularFile(path.join(directory, archiveName), maxArchiveBytes);
  try {
    const hash = createHash("sha256");
    const buffer = Buffer.alloc(1024 * 1024);
    let length = 0;
    while (true) {
      const count = readSync(fd, buffer, 0, buffer.length, null);
      if (!count) break;
      if (length === 0)
        requireCondition(count >= 3 && buffer[0] === 0x1f && buffer[1] === 0x8b && buffer[2] === 8);
      length += count;
      requireCondition(length <= maxArchiveBytes);
      hash.update(buffer.subarray(0, count));
    }
    requireCondition(length === size && size >= 18);
    return { file: archiveName, sha256: hash.digest("hex"), bytes: size };
  } finally {
    closeSync(fd);
  }
}

/** Only selected public CI identity and build configuration enter this context. */
export function readContext({ root = process.cwd(), env = process.env, runtime = process } = {}) {
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 2 * 1024 * 1024,
    }).trim();
  requireCondition(git("status", "--porcelain", "--untracked-files=normal") === "");
  const source = {
    sha: git("rev-parse", "HEAD"),
    tree: git("rev-parse", "HEAD^{tree}"),
    headSha: env.CI_HEAD_SHA || env.CI_SOURCE_SHA,
    baseSha: env.CI_BASE_SHA || null,
  };
  requireCondition(source.sha === env.CI_SOURCE_SHA);
  const files = configFiles.map((file) => {
    const bytes = boundedBytes(path.join(root, file), 2 * 1024 * 1024);
    const committed = execFileSync("git", ["show", `HEAD:${file}`], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 2 * 1024 * 1024,
    });
    requireCondition(bytes.equals(committed));
    return { path: file, sha256: digest(bytes) };
  });
  requireCondition(
    boundedBytes(path.join(root, ".nvmrc"), 128).toString("utf8").trim() === "24.22.0",
  );
  return validateContext({
    source,
    workflow: {
      repository: env.GITHUB_REPOSITORY,
      runId: env.GITHUB_RUN_ID,
      runAttempt: env.GITHUB_RUN_ATTEMPT,
      sha: env.GITHUB_WORKFLOW_SHA,
      ref: env.GITHUB_WORKFLOW_REF,
      family: env.CI_WORKFLOW_FAMILY,
    },
    inputs: {
      assistantEnabled: env.ASSISTANT_ENABLED === "true",
      analyticsEnabled: env.ANALYTICS_ENABLED === "true",
      analyticsIngestUrl: env.ANALYTICS_INGEST_URL,
      assistantApiUrl: env.NEXT_PUBLIC_ASSISTANT_API_URL ?? assistant,
    },
    runtime: { node: runtime.version, platform: runtime.platform, arch: runtime.arch },
    configuration: { files },
  });
}

export function validateContext(context) {
  exactKeys(context, ["source", "workflow", "inputs", "runtime", "configuration"]);
  const { source: s, workflow: w, inputs: i, runtime: r, configuration: c } = context;
  exactKeys(s, ["sha", "tree", "headSha", "baseSha"]);
  requireCondition(
    [s.sha, s.tree, s.headSha].every((value) => typeof value === "string" && sha40.test(value)) &&
      (s.baseSha === null || (typeof s.baseSha === "string" && sha40.test(s.baseSha))),
  );
  exactKeys(w, ["repository", "runId", "runAttempt", "sha", "ref", "family"]);
  requireCondition(
    w.repository === repository &&
      [w.runId, w.runAttempt].every(
        (value) => typeof value === "string" && /^[1-9][0-9]{0,19}$/.test(value),
      ) &&
      typeof w.sha === "string" &&
      sha40.test(w.sha),
  );
  requireCondition(
    ["ci", "nightly"].includes(w.family) &&
      typeof w.ref === "string" &&
      new RegExp(
        `^${repository}/\\.github/workflows/${w.family}\\.yml@refs/(heads|pull|tags)/[A-Za-z0-9][A-Za-z0-9._/-]{0,180}$`,
      ).test(w.ref) &&
      !w.ref.includes("..") &&
      !w.ref.includes("//") &&
      !w.ref.endsWith("/") &&
      !w.ref.endsWith(".lock"),
  );
  exactKeys(i, ["assistantEnabled", "analyticsEnabled", "analyticsIngestUrl", "assistantApiUrl"]);
  requireCondition(
    i.assistantEnabled === true &&
      i.analyticsEnabled === true &&
      i.analyticsIngestUrl === ingest &&
      i.assistantApiUrl === assistant,
  );
  exactKeys(r, ["node", "platform", "arch"]);
  requireCondition(r.node === "v24.22.0" && r.platform === "linux" && r.arch === "x64");
  exactKeys(c, ["files"]);
  requireCondition(Array.isArray(c.files) && c.files.length === configFiles.length);
  c.files.forEach((file, index) => {
    exactKeys(file, ["path", "sha256"]);
    requireCondition(
      file.path === configFiles[index] &&
        typeof file.sha256 === "string" &&
        sha256.test(file.sha256),
    );
  });
  return { source: s, workflow: w, inputs: i, runtime: r, configuration: c };
}

export function createProvenance(directory, { context = readContext(), output } = {}) {
  const reviewed = validateContext(context);
  const archive = archiveDigest(directory);
  const receipt = { schemaVersion: 1, ...reviewed, archive };
  const file = path.join(directory, receiptName);
  const fd = openSync(
    file,
    constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW,
    0o600,
  );
  try {
    writeFileSync(fd, `${JSON.stringify(receipt, null, 2)}\n`);
  } finally {
    closeSync(fd);
  }
  if (output !== undefined) {
    const info = lstatSync(output);
    requireCondition(info.isFile() && !info.isSymbolicLink());
    const outputFd = openSync(
      output,
      constants.O_WRONLY | constants.O_APPEND | constants.O_NOFOLLOW,
    );
    try {
      writeSync(outputFd, `archive_sha256=${archive.sha256}\n`);
    } finally {
      closeSync(outputFd);
    }
  }
  return receipt;
}

export function verifyProvenance(directory, { context = readContext(), expectedHash } = {}) {
  requireCondition(typeof expectedHash === "string" && sha256.test(expectedHash));
  const receipt = JSON.parse(
    boundedBytes(path.join(directory, receiptName), 10 * 1024).toString("utf8"),
  );
  exactKeys(receipt, [
    "schemaVersion",
    "source",
    "workflow",
    "inputs",
    "runtime",
    "configuration",
    "archive",
  ]);
  requireCondition(receipt.schemaVersion === 1);
  const { schemaVersion: _, archive, ...recorded } = receipt;
  validateContext(recorded);
  requireCondition(JSON.stringify(recorded) === JSON.stringify(validateContext(context)));
  exactKeys(archive, ["file", "sha256", "bytes"]);
  requireCondition(
    archive.file === archiveName &&
      typeof archive.sha256 === "string" &&
      sha256.test(archive.sha256) &&
      typeof archive.bytes === "number" &&
      Number.isSafeInteger(archive.bytes) &&
      archive.bytes >= 18 &&
      archive.bytes <= maxArchiveBytes,
  );
  const actual = archiveDigest(directory);
  requireCondition(
    actual.sha256 === expectedHash &&
      archive.sha256 === expectedHash &&
      archive.bytes === actual.bytes,
  );
  return receipt;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [mode, directory, ...extra] = process.argv.slice(2);
    requireCondition(directory && extra.length === 0 && ["create", "verify"].includes(mode));
    if (mode === "create") createProvenance(directory, { output: process.env.GITHUB_OUTPUT });
    else verifyProvenance(directory, { expectedHash: process.env.CI_ARTIFACT_SHA256 });
    console.log("CI build provenance verified.");
  } catch {
    console.error("CI build provenance rejected.");
    process.exitCode = 1;
  }
}
