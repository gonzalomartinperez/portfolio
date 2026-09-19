import { defineConfig, devices } from "@playwright/test";

const port = 3160;
const externalOrigin = process.env.SITE_TEST_ORIGIN;
if (externalOrigin && !/^http:\/\/127\.0\.0\.1:\d{4,5}$/.test(externalOrigin)) {
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
    baseURL: externalOrigin ?? `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } },
    },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: externalOrigin
    ? undefined
    : {
        command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${port}`,
        url: `http://127.0.0.1:${port}`,
        reuseExistingServer: false,
        timeout: 45_000,
      },
});
