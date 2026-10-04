import { expect, test } from "@playwright/test";

test("the shared solar star field drifts, pauses and survives localized client navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/about?solarDebug=1");
  const field = page.locator("[data-ambient-field]");
  const canvas = field.locator("canvas[data-solar-canvas]");
  await expect(field).toHaveAttribute("data-state", "running");
  await expect(canvas).toHaveCount(1);
  await expect(field).toHaveCSS("pointer-events", "none");
  await expect(field).toHaveAttribute("aria-hidden", "true");
  const solar = field.locator("[data-solar-system]");
  await expect(solar.locator("[data-planet]")).toHaveCount(9);
  await expect(solar).toHaveAttribute("data-renderer", "webgl");
  const solarCanvas = solar.locator("[data-solar-canvas]");
  const solarTime = () =>
    solarCanvas.evaluate((node) => {
      const canvas = node as HTMLCanvasElement & { getSolarDebugSnapshot(): { elapsed: number } };
      return canvas.getSolarDebugSnapshot().elapsed;
    });
  const initialOrbit = await solarTime();
  await expect.poll(solarTime).toBeGreaterThan(initialOrbit);
  const element = await canvas.elementHandle();
  const renderedFrames = () =>
    solarCanvas.evaluate((node) => {
      const target = node as HTMLCanvasElement & {
        getSolarDebugSnapshot(): { framesRendered: number };
      };
      return target.getSolarDebugSnapshot().framesRendered;
    });
  const firstFrame = await renderedFrames();
  await expect.poll(renderedFrames).toBeGreaterThan(firstFrame);

  const toggle = page.locator("[data-motion-toggle]");
  await toggle.click();
  await expect(field).toHaveAttribute("data-state", "paused");
  await page.waitForTimeout(150);
  const pausedFrame = await renderedFrames();
  const pausedOrbit = await solarTime();
  await page.waitForTimeout(400);
  expect(await renderedFrames()).toBe(pausedFrame);
  expect(await solarTime()).toBe(pausedOrbit);

  await page
    .getByRole("navigation", { name: "Main", exact: true })
    .getByRole("link", { name: "Work", exact: true })
    .click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(field).toHaveAttribute("data-state", "paused");
  expect(await element?.evaluate((node) => node.isConnected)).toBe(true);
  await page.getByRole("link", { name: "ES", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/work$/);
  await expect(toggle).toHaveText(/Reanudar/);
  await toggle.click();
  await expect(field).toHaveAttribute("data-state", "running");
  await page
    .getByRole("link", { name: /Gonzalo Martin Perez/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/es$/);
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
  await page.getByRole("button", { name: "Pausar la animación", exact: true }).click();
  await expect(field).toHaveAttribute("data-state", "paused");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(canvas).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test("reduced motion keeps the static field and can remove an already loaded canvas", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es/contact");
  const field = page.locator("[data-ambient-field]");
  await expect(field).toHaveAttribute("data-state", "static");
  await expect(field.locator("canvas")).toHaveCount(0);
  await expect(field.locator("[data-planet]")).toHaveCount(9);
  await expect(field.locator("[data-sun]")).toHaveCount(1);
  await expect(field.locator("[data-moon]")).toHaveCount(1);
  await expect(field.locator("[data-solar-system]")).toHaveAttribute("data-renderer", "static");
  await expect(page.locator("[data-motion-toggle]")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(field).toHaveAttribute("data-state", "running");
  await expect(field.locator("canvas")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(field.locator("canvas")).toHaveCount(0);
  await expect(field).toHaveAttribute("data-state", "static");
});

test("without JavaScript the background remains decorative and the CV remains usable", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/cv");
    await expect(page.locator("[data-ambient-field]")).toHaveAttribute("data-state", "static");
    await expect(page.locator("[data-ambient-field] canvas")).toHaveCount(0);
    await expect(page.locator("[data-motion-toggle]")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("a[download]").first()).toBeVisible();
  } finally {
    await context.close();
  }
});
