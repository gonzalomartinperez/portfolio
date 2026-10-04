import { expect, type Locator, test } from "@playwright/test";
import { captureSettledPage } from "./capture";

type SolarSnapshot = {
  elapsed: number;
  framesRendered: number;
  paused: boolean;
  contextAvailable: boolean;
  pixelRatio: number;
  textureCount: number;
  gpuTextures: number;
  bodies: {
    name: string;
    texture: string;
    textureColorSpace: string;
    geometry: string;
    parent: string;
    world: number[];
    screen: { x: number; y: number; radius: number };
  }[];
  rings: { saturn: string; depthTest: boolean };
  meteorVisible: boolean;
};
const snapshot = (canvas: Locator) =>
  canvas.evaluate((node) => {
    const target = node as HTMLCanvasElement & { getSolarDebugSnapshot(): SolarSnapshot };
    return target.getSolarDebugSnapshot();
  });

for (const theme of ["light", "dark"] as const) {
  test(`textured solar bodies preserve readable native navigation in ${theme} mode`, async ({
    page,
  }, info) => {
    await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
    await page.emulateMedia({ colorScheme: theme });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/about?solarDebug=1&solarTime=0");
    const solar = page.locator("[data-solar-system]");
    const canvas = solar.locator("[data-solar-canvas]");
    await expect(solar).toHaveAttribute("data-renderer", "webgl");
    const frame = await snapshot(canvas);
    expect(frame.bodies.map((body) => body.name).sort()).toEqual([
      "earth",
      "jupiter",
      "mars",
      "mercury",
      "moon",
      "neptune",
      "pluto",
      "saturn",
      "sun",
      "uranus",
      "venus",
    ]);
    expect(frame.textureCount).toBe(16);
    expect(frame.gpuTextures).toBeGreaterThanOrEqual(16);
    expect(frame.bodies.every((body) => body.geometry === "SphereGeometry")).toBe(true);
    expect(frame.bodies.find((body) => body.name === "moon")?.parent).toBe("earth-orbit");
    expect(frame.rings).toMatchObject({ saturn: "RingGeometry", depthTest: true });
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("A viewport is required");
    for (const body of frame.bodies) {
      expect(body.texture, body.name).toContain(`/images/solar-system/${body.name}.webp`);
      expect(body.textureColorSpace, body.name).toBe("srgb");
      expect(body.screen.x + body.screen.radius, body.name).toBeGreaterThan(0);
      expect(body.screen.x - body.screen.radius, body.name).toBeLessThan(viewport.width);
      expect(body.screen.y + body.screen.radius, body.name).toBeGreaterThan(0);
      expect(body.screen.y - body.screen.radius, body.name).toBeLessThan(viewport.height);
    }
    expect(frame.pixelRatio).toBeLessThanOrEqual(2);
    await expect(solar).toHaveCSS("pointer-events", "none");
    await page.mouse.move(viewport.width / 2, viewport.height / 2);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await captureSettledPage(page, {
      path: info.outputPath(`solar-${theme}-${viewport.width}.png`),
    });
    await page
      .getByRole("navigation", { name: "Main", exact: true })
      .getByRole("link", { name: "Work", exact: true })
      .click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(solar).toHaveAttribute("data-renderer", "webgl");
    expect(errors).toEqual([]);
  });
}

test("a lost GPU context retains the complete fallback and can recover", async ({ page }) => {
  await page.goto("/contact?solarDebug=1");
  const solar = page.locator("[data-solar-system]");
  const canvas = solar.locator("[data-solar-canvas]");
  await expect(solar).toHaveAttribute("data-renderer", "webgl");
  const extension = await canvas.evaluateHandle((node: HTMLCanvasElement) =>
    node.getContext("webgl2")?.getExtension("WEBGL_lose_context"),
  );
  await extension.evaluate((value) => value?.loseContext());
  await expect(solar).toHaveAttribute("data-renderer", "static");
  await expect(solar.locator("[data-planet]")).toHaveCount(9);
  await expect(solar.locator("[data-sun]")).toHaveCount(1);
  await expect(solar.locator("[data-moon]")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await extension.evaluate((value) => value?.restoreContext());
  await expect(solar).toHaveAttribute("data-renderer", "webgl");
  await expect.poll(async () => (await snapshot(canvas)).contextAvailable).toBe(true);
});

test("shooting stars appear only during their short orbit-independent interval", async ({
  page,
}) => {
  await page.goto("/about?solarDebug=1&solarTime=18.6");
  const solar = page.locator("[data-solar-system]");
  await expect(solar).toHaveAttribute("data-renderer", "webgl");
  expect((await snapshot(solar.locator("[data-solar-canvas]"))).meteorVisible).toBe(true);
  await page.goto("/about?solarDebug=1&solarTime=22");
  await expect(solar).toHaveAttribute("data-renderer", "webgl");
  expect((await snapshot(solar.locator("[data-solar-canvas]"))).meteorVisible).toBe(false);
});

test("visual credits remain available in both locales without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    for (const route of ["/contact", "/es/contact"]) {
      await page.goto(route);
      const credits = page.locator("[data-visual-credits]");
      await expect(credits.getByRole("link", { name: "Solar System Scope" })).toHaveAttribute(
        "href",
        "https://www.solarsystemscope.com/textures/",
      );
      await expect(credits.getByRole("link", { name: "CC BY 4.0" })).toHaveAttribute(
        "href",
        "https://creativecommons.org/licenses/by/4.0/",
      );
      await expect(credits.getByRole("link", { name: "NASA/JHUAPL/SwRI" })).toHaveAttribute(
        "href",
        "https://science.nasa.gov/resource/pluto-global-color-map/",
      );
      await expect(page.locator("[data-solar-system] [data-planet]")).toHaveCount(9);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
    }
  } finally {
    await context.close();
  }
});

test("a failed optional texture preserves the other GPU materials", async ({ page }) => {
  await page.route("**/earth-night.webp", (route) => route.abort());
  await page.goto("/contact?solarDebug=1");
  const solar = page.locator("[data-solar-system]");
  await expect(solar).toHaveAttribute("data-renderer", "webgl");
  const frame = await snapshot(solar.locator("[data-solar-canvas]"));
  expect(frame.textureCount).toBe(15);
  expect(frame.bodies).toHaveLength(11);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("a failed core texture retains the complete static fallback", async ({ page }) => {
  await page.route("**/jupiter.webp", (route) => route.abort());
  await page.goto("/contact?solarDebug=1");
  const solar = page.locator("[data-solar-system]");
  await expect(solar).toHaveAttribute("data-renderer", "static");
  await expect(solar.locator("[data-planet]")).toHaveCount(9);
  await expect(solar.locator("[data-sun]")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("visibility events freeze the solar clock and resume without hidden-time catch-up", async ({
  page,
}) => {
  await page.goto("/about?solarDebug=1");
  const solar = page.locator("[data-solar-system]");
  const canvas = solar.locator("[data-solar-canvas]");
  await expect(solar).toHaveAttribute("data-renderer", "webgl");
  // Headless Chromium keeps all tabs visible; inject the event's browser state explicitly.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(solar).toHaveAttribute("data-state", "paused");
  const hidden = await snapshot(canvas);
  await page.waitForTimeout(750);
  const stillHidden = await snapshot(canvas);
  expect(stillHidden.elapsed).toBe(hidden.elapsed);
  expect(stillHidden.framesRendered).toBe(hidden.framesRendered);
  const firstResume = await canvas.evaluate(async (node) => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    document.dispatchEvent(new Event("visibilitychange"));
    const target = node as HTMLCanvasElement & { getSolarDebugSnapshot(): SolarSnapshot };
    return new Promise<SolarSnapshot>((resolve) => {
      requestAnimationFrame(() => resolve(target.getSolarDebugSnapshot()));
    });
  });
  expect(firstResume.framesRendered).toBeGreaterThan(hidden.framesRendered);
  expect(firstResume.elapsed).toBeGreaterThanOrEqual(hidden.elapsed);
  expect(firstResume.elapsed - hidden.elapsed).toBeLessThanOrEqual(0.05);
  await expect(solar).toHaveAttribute("data-state", "running");
  await expect.poll(async () => (await snapshot(canvas)).elapsed).toBeGreaterThan(hidden.elapsed);
});
