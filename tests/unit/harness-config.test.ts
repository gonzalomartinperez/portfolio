import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { lstatSync, readdirSync, readFileSync, readlinkSync, realpathSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

test("Claude permissions retain destructive-command and secret-read denials", () => {
  const { permissions } = JSON.parse(read(".claude/settings.json"));
  for (const rule of [
    "Bash(git push --force:*)",
    "Bash(git push -f:*)",
    "Bash(git reset --hard:*)",
    "Bash(pkill -f:*)",
    "Bash(rm -rf /:*)",
    ...[
      ".env",
      ".env.local",
      ".env.development",
      ".env.production",
      ".env.test",
      ".env.staging",
    ].flatMap((name) => [`Read(./${name})`, `Read(**/${name})`]),
  ]) {
    assert.ok(permissions.deny.includes(rule), `Missing deny rule: ${rule}`);
  }
  assert.deepEqual(permissions.ask, [
    "Bash(git push:*)",
    "Bash(gh pr merge:*)",
    "Bash(gh release:*)",
  ]);
  assert.deepEqual(permissions.allow, [
    "Bash(npm run lint:*)",
    "Bash(npm run check:*)",
    "Bash(npm run typecheck:*)",
    "Bash(npm run test:*)",
    "Bash(npm run build:*)",
    "Bash(node --test:*)",
    "Bash(npx biome check:*)",
    "Bash(git status:*)",
    "Bash(git diff:*)",
    "Bash(git log:*)",
    "Bash(git show:*)",
    "Bash(gh pr view:*)",
    "Bash(gh pr checks:*)",
    "Bash(gh run view:*)",
    "Bash(gh run list:*)",
  ]);
});

test("Claude wires both isolated Python PreToolUse guards", () => {
  const { hooks } = JSON.parse(read(".claude/settings.json"));
  assert.deepEqual(hooks, {
    PreToolUse: [
      {
        matcher: "Bash",
        hooks: [
          {
            type: "command",
            command: 'python3 -I "$CLAUDE_PROJECT_DIR/.claude/hooks/guard-bash.py"',
          },
        ],
      },
      {
        matcher: "Read|Edit|Write|MultiEdit|NotebookEdit|Grep|Glob",
        hooks: [
          {
            type: "command",
            command: 'python3 -I "$CLAUDE_PROJECT_DIR/.claude/hooks/guard-files.py"',
          },
        ],
      },
    ],
  });
});

test("MCP contains exactly the pinned isolated browser and Next.js servers without env keys", () => {
  const config = JSON.parse(read(".mcp.json"));
  assert.deepEqual(config, {
    mcpServers: {
      playwright: {
        command: "npx",
        args: ["-y", "@playwright/mcp@0.0.85", "--isolated", "--headless"],
      },
      "next-devtools": { command: "npx", args: ["-y", "next-devtools-mcp@0.4.0"] },
    },
  });
  assert.doesNotMatch(JSON.stringify(config), /"env"\s*:/);
});

test("all six Claude skills are relative symlinks to their canonical directories", () => {
  const names = readdirSync(path.join(root, ".agents/skills")).sort();
  assert.equal(names.length, 6);
  assert.deepEqual(readdirSync(path.join(root, ".claude/skills")).sort(), names);
  for (const name of names) {
    const link = path.join(root, ".claude/skills", name);
    assert.ok(lstatSync(link).isSymbolicLink(), name);
    const target = readlinkSync(link);
    assert.equal(path.isAbsolute(target), false, name);
    assert.equal(target, `../../.agents/skills/${name}`, name);
    assert.equal(realpathSync(link), realpathSync(path.join(root, ".agents/skills", name)), name);
  }
});

test("Codex uses an offline writable workspace with experimental hooks left commented", () => {
  const config = read(".codex/config.toml");
  assert.match(config, /^sandbox_mode = "workspace-write"$/m);
  assert.match(config, /^\[sandbox_workspace_write\]\s*\nnetwork_access = false$/m);
  assert.match(config, /^# \[\[hooks.PreToolUse\]\]$/m);
  assert.doesNotMatch(config, /^\s*(?:\[\[hooks\.|codex_hooks\s*=)/m);
});

test("the shared harness files are tracked, not just present locally", () => {
  for (const file of [".codex/config.toml", ".claude/settings.json", ".mcp.json"])
    execFileSync("git", ["ls-files", "--error-unmatch", file], { cwd: root, stdio: "ignore" });
});
