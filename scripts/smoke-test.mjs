import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";

const port = process.env.SMOKE_TEST_PORT ?? "3100";
const origin = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", port],
  { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
);
let output = "";
let ready = false;
let startupError;
server.on("error", (error) => {
  startupError = error;
});
for (const stream of [server.stdout, server.stderr]) {
  stream.on("data", (chunk) => {
    output = `${output}${chunk}`.slice(-16_384);
    ready ||= /Ready in/.test(output);
  });
}

try {
  const deadline = Date.now() + 45_000;
  while (!ready) {
    if (startupError) throw startupError;
    assert.equal(server.exitCode, null, `Production server exited: ${output}`);
    assert.ok(Date.now() < deadline, `Production server startup timed out: ${output}`);
    await delay(200);
  }
  const response = await fetch(origin, { signal: AbortSignal.timeout(10_000) });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  const html = await response.text();
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /<main[\s>]/);
  const missing = await fetch(`${origin}/__smoke_missing__`, {
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(missing.status, 404);
  console.log("Production smoke test passed: HTML, title, main landmark, and 404.");
} finally {
  if (server.exitCode === null && !startupError) {
    const stopped = once(server, "exit");
    server.kill();
    const fallback = setTimeout(() => server.kill("SIGKILL"), 5_000);
    try {
      await stopped;
    } finally {
      clearTimeout(fallback);
    }
  }
}
