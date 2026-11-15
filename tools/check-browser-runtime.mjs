import { chromium, firefox, webkit } from "@playwright/test";

const runtimes = [
  ["Chromium headless shell", chromium, {}],
  ["Chromium full browser", chromium, { channel: "chromium" }],
  ["Firefox", firefox, {}],
  ["WebKit", webkit, {}],
];

// The pull-request lane only needs Chromium and WebKit.
const required =
  process.env.BROWSER_LANE === "pr"
    ? runtimes.filter(([name]) => !name.startsWith("Firefox"))
    : runtimes;

for (const [name, engine, options] of required) {
  const browser = await engine.launch({ ...options, headless: true, timeout: 30_000 });
  try {
    const page = await browser.newPage();
    await page.setContent("<title>Browser runtime verification</title>");
    if ((await page.title()) !== "Browser runtime verification") {
      throw new Error(`${name} could not render the verification document`);
    }
    console.log(`${name}: ready`);
  } finally {
    await browser.close();
  }
}
