import { spawn } from "node:child_process";

const port = Number(process.env.SITE_TEST_PORT ?? "3160");
if (!Number.isInteger(port) || port < 1024 || port > 65534)
  throw new Error("Invalid site test port");

async function run(args, environment) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      windowsHide: true,
      stdio: "inherit",
      env: { ...process.env, SITE_TEST_ORIGIN: undefined, ...environment },
    });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${args[0]} exited ${code}`)),
    );
  });
}

await run(["--test", "scripts/rendered.test.mjs"], {
  RENDERED_TEST_PORT: process.env.RENDERED_TEST_PORT ?? String(port),
});
await run(["node_modules/@playwright/test/cli.js", "test", ...process.argv.slice(2)], {
  BROWSER_TEST_PORT: process.env.BROWSER_TEST_PORT ?? String(port),
  BROWSER_TEST_UPSTREAM_PORT: process.env.BROWSER_TEST_UPSTREAM_PORT ?? String(port + 1),
});
