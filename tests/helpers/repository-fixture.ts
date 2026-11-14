import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { onTestFinished } from "vitest";

/**
 * Inventory the non-ignored source tree through an empty temporary Git directory, so the
 * result honours `.gitignore` without depending on the checkout's Git metadata or history.
 */
export function repositoryFiles(root: string | URL): string[] {
  const directory = mkdtempSync(path.join(tmpdir(), "portfolio-repository-"));
  onTestFinished(() => rmSync(directory, { recursive: true, force: true }));
  // Ignore hook-provided GIT_* variables and machine-level Git config.
  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const name of Object.keys(env)) if (name.startsWith("GIT_")) delete env[name];
  env.GIT_CONFIG_GLOBAL = "/dev/null";
  env.GIT_CONFIG_SYSTEM = "/dev/null";
  const git = (args: string[]) =>
    execFileSync("git", args, { cwd: directory, encoding: "utf8", env });
  git(["init", "--quiet", "--initial-branch=main"]);
  const files = git([
    "--work-tree",
    root instanceof URL ? root.pathname : root,
    "ls-files",
    "-z",
    "--others",
    "--exclude-standard",
  ])
    .split("\0")
    .filter((file) => file && file !== ".git");
  return files.sort();
}
