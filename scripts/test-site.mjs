import { spawn } from "node:child_process";
import { startTestServer } from "./test-server.mjs";

const server = await startTestServer(process.env.SITE_TEST_PORT ?? "3160");
async function run(args) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      windowsHide: true,
      stdio: "inherit",
      env: { ...process.env, SITE_TEST_ORIGIN: server.origin },
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${args[0]} exited ${code}`)),
    );
  });
}
try {
  await run(["--test", "scripts/rendered.test.mjs"]);
  await run(["node_modules/@playwright/test/cli.js", "test"]);
} finally {
  await server.stop();
}
