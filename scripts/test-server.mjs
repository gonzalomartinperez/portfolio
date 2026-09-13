import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";

export async function startTestServer(port) {
  assert(/^\d{4,5}$/.test(String(port)), "Invalid test port");
  const processHandle = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)],
    { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
  );
  let output = "";
  let error;
  processHandle.on("error", (cause) => {
    error = cause;
  });
  for (const stream of [processHandle.stdout, processHandle.stderr]) {
    stream.on("data", (chunk) => {
      output = `${output}${chunk}`.slice(-16_384);
    });
  }
  async function stop() {
    if (processHandle.exitCode !== null || processHandle.signalCode !== null || error) return;
    const stopped = once(processHandle, "exit");
    processHandle.kill();
    const fallback = setTimeout(() => processHandle.kill("SIGKILL"), 5_000);
    try {
      await Promise.race([
        stopped,
        delay(6_000, undefined, { ref: false }).then(() => {
          throw new Error("Test server did not stop within six seconds");
        }),
      ]);
    } finally {
      clearTimeout(fallback);
    }
  }
  try {
    const deadline = Date.now() + 45_000;
    while (!/Ready in/.test(output)) {
      if (error) throw error;
      assert.equal(processHandle.exitCode, null, `Production server exited: ${output}`);
      assert.equal(processHandle.signalCode, null, `Production server terminated: ${output}`);
      assert(Date.now() < deadline, `Server startup timed out: ${output}`);
      await delay(100);
    }
  } catch (cause) {
    await stop();
    throw cause;
  }
  return { origin: `http://127.0.0.1:${port}`, stop };
}

export function localTestOrigin(value) {
  const url = new URL(value);
  assert(
    url.protocol === "http:" && url.hostname === "127.0.0.1" && url.port,
    "Tests must use the owned loopback production server",
  );
  return url.origin;
}
