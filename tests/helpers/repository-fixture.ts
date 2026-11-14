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
  const git = (args: string[]) =>
    execFileSync("git", args, {
      cwd: directory,
      encoding: "utf8",
      // Ignore hook-provided GIT_* variables and machine-level Git config.
      env: {
        ...Object.fromEntries(
          Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")),
        ),
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_SYSTEM: "/dev/null",
      },
    });
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
