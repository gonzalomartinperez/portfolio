import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const gitleaksVersion = "8.30.1";
const findingsExitCode = 23;

// Reviewed immutable history: these 24 findings are public Git provenance or SHA-256
// metadata, not credentials. Never extend this to a path, rule or current-tree exclusion.
export const historicalProvenanceExceptions = Object.freeze([
  "afea06a04650db65059a8900d58554b8952b2c99:docs/verification/polished-ai-assistant.md:generic-api-key:4",
  "ac47c4ab01653b51266d2803a8240b145b8c2426:docs/verification/polished-ai-assistant.md:generic-api-key:4",
  "afea06a04650db65059a8900d58554b8952b2c99:src/contracts/source.json:generic-api-key:2",
  "afea06a04650db65059a8900d58554b8952b2c99:src/contracts/source.json:generic-api-key:5",
  "ac47c4ab01653b51266d2803a8240b145b8c2426:src/contracts/source.json:generic-api-key:2",
  "ac47c4ab01653b51266d2803a8240b145b8c2426:src/contracts/source.json:generic-api-key:5",
  "4690ab367408f1df445d9e5675271ff4b8757405:src/contracts/source.json:generic-api-key:2",
  "422a1dcfcac566eb0ef276129ac7676cf5046421:src/contracts/source.json:generic-api-key:2",
  "5b6946712a41652c00ec936c10384fd354692f09:src/contracts/source.json:generic-api-key:2",
  "83a4ecde0591da9c35c939a8c6b82dc9b010fdc6:src/contracts/source.json:generic-api-key:2",
  "cafba963dcce0aa0620aead44374840637890a29:src/contracts/source.json:generic-api-key:2",
  "30f058cc0382c5e97f2c7a30fdcb482422b2a673:src/contracts/source.json:generic-api-key:2",
  "c69b19a2a42cc4dca13b021c3f2b13f41b46a834:src/contracts/source.json:generic-api-key:2",
  "c69b19a2a42cc4dca13b021c3f2b13f41b46a834:src/contracts/source.json:generic-api-key:3",
  "e411c0a775b16fd7de962774d875e47191f96b09:src/contracts/source.json:generic-api-key:2",
  "e411c0a775b16fd7de962774d875e47191f96b09:src/contracts/source.json:generic-api-key:3",
  "81cb103307756a05a6a05a4e00599f5dfb162110:src/contracts/source.json:generic-api-key:2",
  "81cb103307756a05a6a05a4e00599f5dfb162110:src/contracts/source.json:generic-api-key:3",
  "df809192aa00f53c68bf64826004a61b8c7a0fc6:src/contracts/source.json:generic-api-key:2",
  "df809192aa00f53c68bf64826004a61b8c7a0fc6:src/contracts/source.json:generic-api-key:5",
  "df809192aa00f53c68bf64826004a61b8c7a0fc6:docs/verification/polished-ai-assistant.md:generic-api-key:4",
  "7753d397afaa80e3ea6b19c9aa8affda5f02ba02:src/contracts/source.json:generic-api-key:2",
  "9d8219e725408495a381f195180e948edd53b3be:src/contracts/source.json:generic-api-key:2",
  "9d8219e725408495a381f195180e948edd53b3be:src/contracts/source.json:generic-api-key:3",
]);

function git(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: 30_000,
    stdio: ["ignore", "pipe", "ignore"],
  });
  if (result.error || result.status !== 0) {
    throw new Error("Secret scan could not inspect Git metadata.");
  }
  return result.stdout;
}

function snapshotTrackedFiles(root, snapshot) {
  const files = git(root, ["ls-files", "--cached", "-z"]).split("\0").filter(Boolean);
  for (const file of new Set(files)) {
    const source = path.resolve(root, file);
    const relative = path.relative(root, source);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error("Secret scan rejected an unsafe tracked path.");
    }
    let info;
    try {
      info = lstatSync(source);
    } catch (error) {
      // A locally deleted tracked file is still covered by the history scan.
      if (error.code === "ENOENT") continue;
      throw new Error("Secret scan could not inspect a tracked file.");
    }
    if (!info.isFile()) {
      throw new Error("Secret scan requires regular tracked files, not links or submodules.");
    }
    const resolved = path.relative(root, realpathSync(source));
    if (resolved.startsWith("..") || path.isAbsolute(resolved)) {
      throw new Error("Secret scan rejected a tracked path outside the repository.");
    }
    const destination = path.join(snapshot, relative);
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(source, destination);
  }
  return files.length;
}

/** Scanner output is deliberately discarded: even filenames and errors may contain secrets. */
export function scanSecrets({
  root = process.cwd(),
  binary = process.env.GITLEAKS_BIN || "gitleaks",
  additionalTestRules = "",
  artifacts = false,
} = {}) {
  root = realpathSync(root);
  const version = spawnSync(binary, ["version"], {
    encoding: "utf8",
    maxBuffer: 1024,
    timeout: 10_000,
    stdio: ["ignore", "pipe", "ignore"],
  });
  if (version.error || version.status !== 0 || version.stdout.trim() !== gitleaksVersion) {
    throw new Error(`Secret scan requires Gitleaks ${gitleaksVersion}.`);
  }
  if (!artifacts && git(root, ["rev-parse", "--is-shallow-repository"]).trim() !== "false") {
    throw new Error("Secret scan requires full Git history; fetch with depth 0.");
  }
  if (!artifacts) git(root, ["rev-parse", "--verify", "HEAD"]);
  const temporary = mkdtempSync(path.join(tmpdir(), "portfolio-secret-scan-"));
  try {
    const snapshot = path.join(temporary, "tracked");
    mkdirSync(snapshot);
    let fileCount;
    if (artifacts) {
      const staticRoot = path.join(root, ".next", "static");
      // Inspect parents too: a symlinked .next must not expose unrelated files.
      if (
        !lstatSync(path.join(root, ".next")).isDirectory() ||
        !lstatSync(staticRoot).isDirectory()
      ) {
        throw new Error("Secret scan requires built .next/static artifacts.");
      }
      function copyArtifacts(source, destination) {
        let count = 0;
        mkdirSync(destination, { recursive: true });
        for (const entry of readdirSync(source, { withFileTypes: true })) {
          const from = path.join(source, entry.name);
          if (from === path.join(root, ".next", "cache")) continue;
          const to = path.join(destination, entry.name);
          if (entry.isDirectory()) count += copyArtifacts(from, to);
          else if (entry.isFile()) {
            copyFileSync(from, to);
            count++;
          } else throw new Error("Secret scan requires regular artifact files, not links.");
        }
        return count;
      }
      if (!readdirSync(staticRoot).length)
        throw new Error("Secret scan requires nonempty built static artifacts.");
      fileCount = copyArtifacts(path.join(root, ".next"), path.join(snapshot, "build"));
      function optionalDirectory(directory) {
        let info;
        try {
          info = lstatSync(directory);
        } catch (error) {
          if (error.code === "ENOENT") return false;
          throw error;
        }
        if (!info.isDirectory())
          throw new Error("Secret scan requires regular artifact directories.");
        return true;
      }
      const ci = path.join(root, ".artifacts", "ci");
      if (optionalDirectory(path.join(root, ".artifacts"))) {
        if (optionalDirectory(ci)) {
          fileCount += copyArtifacts(ci, path.join(snapshot, "ci"));
        }
      }
      if (!fileCount) throw new Error("Secret scan requires nonempty built static artifacts.");
    } else fileCount = snapshotTrackedFiles(root, snapshot);
    const config = path.join(temporary, "gitleaks.toml");
    writeFileSync(config, `[extend]\nuseDefault = true\n${additionalTestRules}`, {
      mode: 0o600,
    });
    const snapshotConfig = path.join(temporary, "snapshot.toml");
    // This API revision is public provenance. Both its exact value AND reviewed
    // source path must match; other values, rules and build artifacts remain scanned.
    const provenanceAllowance = artifacts
      ? ""
      : String.raw`
[[allowlists]]
description = "Reviewed public API Git revision in contract provenance"
targetRules = ["generic-api-key"]
condition = "AND"
regexTarget = "secret"
regexes = ['''^61da393520014ed2c8b1f8a0635b3b4e615f9e53$''']
paths = ['''(?:^|/)(?:contracts/assistant-api/source\.json|docs/verification/polished-ai-assistant\.md)$''']
`;
    writeFileSync(
      snapshotConfig,
      `[extend]\nuseDefault = true\n${additionalTestRules}\n${provenanceAllowance}`,
      { mode: 0o600 },
    );
    const ignore = path.join(temporary, "empty-ignore");
    writeFileSync(ignore, "", { mode: 0o600 });
    const historyIgnore = path.join(temporary, "history-provenance-ignore");
    writeFileSync(historyIgnore, `${historicalProvenanceExceptions.join("\n")}\n`, {
      mode: 0o600,
    });
    const common = [
      "--ignore-gitleaks-allow",
      "--redact=100",
      "--no-banner",
      "--exit-code",
      String(findingsExitCode),
    ];
    let findings = false;
    const scans = [
      ["dir", "--config", snapshotConfig, ...common, "--gitleaks-ignore-path", ignore, snapshot],
    ];
    if (!artifacts)
      scans.push([
        "git",
        "--config",
        config,
        ...common,
        "--gitleaks-ignore-path",
        historyIgnore,
        "--log-opts=--all --full-history -m",
        root,
      ]);
    for (const args of scans) {
      const result = spawnSync(binary, args, {
        cwd: temporary,
        stdio: "ignore",
        timeout: 300_000,
      });
      if (result.error || (result.status !== 0 && result.status !== findingsExitCode)) {
        throw new Error("Secret scanner failed; no successful scan can be claimed.");
      }
      findings ||= result.status === findingsExitCode;
    }
    if (findings) {
      throw new Error(
        "Secret scan detected findings. Details are suppressed; use the private incident procedure.",
      );
    }
    return { fileCount };
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 1 || args[0] !== "--artifacts")) {
      throw new Error("Secret scan received unsupported arguments.");
    }
    const artifacts = args[0] === "--artifacts";
    const { fileCount } = scanSecrets({ artifacts });
    console.log(
      artifacts
        ? `Secret scan passed: ${fileCount} uploaded build artifact files.`
        : `Secret scan passed: ${fileCount} tracked files and all fetched Git history.`,
    );
  } catch (error) {
    // Only fixed messages created above are public; do not expose filesystem/process errors.
    const safe = error instanceof Error && error.message.startsWith("Secret scan");
    console.error(safe ? error.message : "Secret scan failed; details suppressed.");
    process.exitCode = 1;
  }
}
