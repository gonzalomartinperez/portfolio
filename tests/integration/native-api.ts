import { chromium, expect, firefox, webkit } from "@playwright/test";

function loopbackOrigin(name: string): string {
  const value = process.env[name];
  if (!value || !/^https:\/\/localhost:\d{4,5}$/.test(value))
    throw new Error(`${name} must be an HTTPS localhost origin`);
  return value;
}

if (process.env.ASSISTANT_API_FIXTURE !== "1")
  throw new Error("This smoke test requires an explicitly authorized fixture-provider API");
const site = loopbackOrigin("SITE_TEST_ORIGIN");
const api = loopbackOrigin("ASSISTANT_API_TEST_ORIGIN");

for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      reducedMotion: "reduce",
      viewport: { width: 1100, height: 800 },
    });
    const page = await context.newPage();
    const responses: { path: string; method: string; status: number }[] = [];
    const generationHeaders: { csrf: boolean }[] = [];
    page.on("response", (response) => {
      if (response.url().startsWith(`${api}/api/v1/`))
        responses.push({
          path: new URL(response.url()).pathname,
          method: response.request().method(),
          status: response.status(),
        });
    });
    page.on("request", (request) => {
      if (request.url().endsWith("/messages/stream"))
        generationHeaders.push({
          csrf: Boolean(request.headers()["x-csrf-token"]),
        });
    });
    await page.goto(`${site}/assistant`);
    const surface = page.locator("#portfolio-assistant");
    const question = page.locator("#question");
    await expect(question).toBeEditable();
    await expect
      .poll(() =>
        responses.some(
          (item) => item.path.endsWith("/knowledge/suggestions") && item.status === 200,
        ),
      )
      .toBe(true);
    await question.fill("What projects has Gonzalo built?");
    await surface.getByRole("button", { name: "Send", exact: true }).click();
    await expect(surface.getByRole("button", { name: "Copy answer", exact: true })).toBeVisible({
      timeout: 30000,
    });
    await expect(surface.locator("article")).toHaveCount(2);
    await surface.locator("summary").click();
    const source = surface.locator("details a").first();
    await expect(source).toHaveAttribute("href", /^https:\/\//);
    await expect(source).toHaveAttribute("rel", "noopener noreferrer");
    expect(generationHeaders).toHaveLength(1);
    expect(generationHeaders[0]?.csrf).toBe(true);
    const cookies = await context.cookies(api);
    expect(cookies.some((cookie) => cookie.secure && cookie.httpOnly)).toBe(true);
    await page.reload();
    await expect(surface.getByRole("button", { name: "Copy answer", exact: true })).toBeVisible();
    await surface.getByRole("button", { name: "Conversations", exact: true }).click();
    await surface
      .getByRole("button", { name: /^Delete / })
      .first()
      .click();
    await surface.getByRole("button", { name: "Delete conversation", exact: true }).click();
    await expect(surface.getByRole("button", { name: "New chat", exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(
      surface.getByRole("heading", { name: "Where would you like to start?" }),
    ).toBeVisible();
    expect(responses.filter((item) => item.status >= 400 && item.status !== 401)).toEqual([]);
    expect(
      responses.some(
        (item) => item.method === "POST" && item.path.endsWith("/session") && item.status === 200,
      ),
    ).toBe(true);
    expect(responses.some((item) => item.method === "DELETE" && item.status === 204)).toBe(true);
    console.log(`${name}: real fixture API session/catalog/CSRF/SSE/sources/history/delete passed`);
    await context.close();
  } finally {
    await browser.close();
  }
}
