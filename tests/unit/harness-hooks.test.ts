import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));

function runHook(hook: string, toolName: string, toolInput: Record<string, string>) {
  return new Promise<{ status: number | null; stderr: string }>((resolve, reject) => {
    const child = spawn("python3", ["-I", `.claude/hooks/${hook}.py`], {
      cwd: root,
      timeout: 5_000,
    });
    let stderr = "";
    child.stderr.setEncoding("utf8").on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.stdout.resume();
    child.on("error", reject);
    child.on("close", (status, signal) => {
      if (signal) reject(new Error(`Hook terminated by ${signal}: ${stderr}`));
      else resolve({ status, stderr });
    });
    child.stdin.on("error", reject);
    child.stdin.end(
      JSON.stringify({
        hook_event_name: "PreToolUse",
        tool_name: toolName,
        tool_input: toolInput,
      }),
    );
  });
}

for (const command of [
  "pkill -f node",
  "git push --force origin develop",
  "git push -f origin main",
  "git reset --hard HEAD~1",
  "cat .env",
  "cat .env.local",
]) {
  test(`guard-bash blocks ${command}`, async () => {
    const result = await runHook("guard-bash", "Bash", { command });
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, /BLOCKED by guard-bash:/);
  });
}

for (const command of ["npm run check", "git status", "cat .env.example", "cat README.md"]) {
  test(`guard-bash allows ${command}`, async () => {
    const result = await runHook("guard-bash", "Bash", { command });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
  });
}

for (const filePath of [".env", ".env.local"]) {
  test(`guard-files blocks reading ${filePath}`, async () => {
    const result = await runHook("guard-files", "Read", { file_path: filePath });
    assert.equal(result.status, 2, result.stderr);
    assert.match(result.stderr, /BLOCKED by guard-files:/);
  });
}

test("guard-files blocks hand edits of package-lock.json", async () => {
  const result = await runHook("guard-files", "Edit", {
    file_path: "package-lock.json",
    old_string: "old",
    new_string: "new",
  });
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stderr, /changes only through the package manager/);
});

for (const filePath of [".env.example", "README.md"]) {
  test(`guard-files allows reading ${filePath}`, async () => {
    const result = await runHook("guard-files", "Read", { file_path: filePath });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
  });
}
