import { defineConfig, devices } from "@playwright/test";

if (process.env.ANALYTICS_LIVE_AUTHORIZED !== "disposable-fixture") {
  throw new Error("Real analytics verification requires an explicitly leased disposable fixture");
}

export default defineConfig({
  testDir: "./tests/integration/analytics-live",
  outputDir: ".artifacts/analytics-live/results",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["json", { outputFile: ".artifacts/analytics-live/report.json" }]],
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 1000 },
    baseURL: "https://127.0.0.1:3381",
    ignoreHTTPSErrors: true,
    trace: "off",
    screenshot: "off",
    video: "off",
    serviceWorkers: "block",
  },
  projects: [{ name: "analytics-live-chromium" }],
});
