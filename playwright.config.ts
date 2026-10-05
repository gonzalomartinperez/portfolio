import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.BROWSER_TEST_PORT ?? 3160);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid browser test port");
const externalOrigin = process.env.SITE_TEST_ORIGIN;
if (externalOrigin && !/^https?:\/\/(?:127\.0\.0\.1|localhost):\d{4,5}$/.test(externalOrigin)) {
  throw new Error("Browser tests require a loopback production server");
}

export default defineConfig({
  testDir: "./tests/browser",
  outputDir: ".artifacts/playwright/results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  failOnFlakyTests: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { outputFolder: ".artifacts/playwright/report", open: "never" }]],
  use: {
    ignoreHTTPSErrors: true,
    baseURL: externalOrigin ?? `https://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } },
    },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    {
      name: "assistant-firefox",
      testMatch: "assistant.spec.ts",
      use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "assistant-webkit",
      testMatch: "assistant.spec.ts",
      use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 1000 } },
    },
  ],
  webServer: externalOrigin
    ? undefined
    : {
        command: "node scripts/browser-test-server.ts",
        url: `https://127.0.0.1:${port}`,
        ignoreHTTPSErrors: true,
        reuseExistingServer: false,
        gracefulShutdown: { signal: "SIGTERM", timeout: 7000 },
        timeout: 45_000,
      },
});
