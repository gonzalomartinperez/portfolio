import { expect, type Locator, test } from "@playwright/test";
import textureManifest from "../../public/images/solar-system/manifest.json" with { type: "json" };
import { captureSettledPage } from "./capture";

type SolarSnapshot = {
  elapsed: number;
  framesRendered: number;
  paused: boolean;
  contextAvailable: boolean;
  pixelRatio: number;
  textureCount: number;
  gpuTextures: number;
  estimatedGpuBytes: number;
  earthOceanRoughnessPatched: boolean;
  camera: { type: string };
  bodies: {
    name: string;
    texture: string;
    textureColorSpace: string;
    textureWidth: number;
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
    await expect(solar).toHaveAttribute("data-renderer", "webgl", { timeout: 25_000 });
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
    const bounds = await canvas.boundingBox();
    if (!bounds) throw new Error("Canvas must have layout bounds");
    const sun = frame.bodies.find((body) => body.name === "sun");
    expect(sun?.screen.x).toBeCloseTo(bounds.width / 2, 0);
    expect(sun?.screen.y).toBeCloseTo(bounds.height / 2, 0);
    expect(frame.camera.type).toBe("PerspectiveCamera");
    expect(frame.earthOceanRoughnessPatched).toBe(true);
    expect(sun?.textureWidth).toBe(bounds.width < 640 ? 2048 : 4096);
    expect(frame.estimatedGpuBytes).toBeLessThanOrEqual(
      (bounds.width < 640 ? 128 : 256) * 1024 * 1024,
    );
    for (const body of frame.bodies) {
      expect(body.texture, body.name).toContain(`/images/solar-system/${body.name}.webp`);
      expect(new URL(body.texture, page.url()).searchParams.get("v"), body.name).toBe(
        textureManifest.assets.find(({ file }) => file === `${body.name}.webp`)?.sha256,
      );
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
    await expect(solar).toHaveAttribute("data-renderer", "webgl", { timeout: 25_000 });
    expect(errors).toEqual([]);
  });
}

test("cold load and reload preserve the initial solar composition", async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  for (let load = 0; load < 2; load++) {
    let release!: () => void;
    const loading = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/images/solar-system/*.webp*", async (route) => {
      await loading;
      await route.continue();
    });
    if (load === 0)
      await page.goto("/about?solarDebug=1&solarTime=0", { waitUntil: "domcontentloaded" });
    else await page.reload({ waitUntil: "domcontentloaded" });
    const solar = page.locator("[data-solar-system]");
    await expect(solar).toHaveAttribute("data-renderer", "static");
    const initial = await solar
      .locator("[data-planet], [data-sun], [data-moon]")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const body = node as HTMLElement;
          const bounds = body.getBoundingClientRect();
          return {
            name: body.dataset.planet ?? (body.hasAttribute("data-sun") ? "sun" : "moon"),
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
            radius: bounds.width / 2,
          };
        }),
      );
    expect(initial).toHaveLength(11);
    release();
    await expect(solar).toHaveAttribute("data-renderer", "webgl", { timeout: 25_000 });
    const canvas = solar.locator("[data-solar-canvas]");
    const bounds = await canvas.boundingBox();
    if (!bounds) throw new Error("Solar canvas requires bounds");
    const rendered = await snapshot(canvas);
    for (const body of initial) {
      const settled = rendered.bodies.find(({ name }) => name === body.name);
      if (!settled) throw new Error(`Missing rendered body: ${body.name}`);
      expect(
        Math.abs(body.x - bounds.x - settled.screen.x),
        `${body.name} horizontal jump`,
      ).toBeLessThan(1);
      expect(
        Math.abs(body.y - bounds.y - settled.screen.y),
        `${body.name} vertical jump`,
      ).toBeLessThan(1);
      expect(Math.abs(body.radius - settled.screen.radius), `${body.name} size jump`).toBeLessThan(
        1,
      );
    }
    await page.unroute("**/images/solar-system/*.webp*");
  }
});

test("a lost GPU context retains the complete fallback and can recover", async ({ page }) => {
  await page.goto("/contact?solarDebug=1");
  const solar = page.locator("[data-solar-system]");
  const canvas = solar.locator("[data-solar-canvas]");
  await expect(solar).toHaveAttribute("data-renderer", "webgl", { timeout: 25_000 });
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
  await expect(solar).toHaveAttribute("data-renderer", "webgl", { timeout: 25_000 });
  await expect.poll(async () => (await snapshot(canvas)).contextAvailable).toBe(true);
});

test("shooting stars appear only during their short orbit-independent interval", async ({
  page,
}) => {
  await page.goto("/about?solarDebug=1&solarTime=18.6");
  const solar = page.locator("[data-solar-system]");
  await expect(solar).toHaveAttribute("data-renderer", "webgl", { timeout: 25_000 });
  expect((await snapshot(solar.locator("[data-solar-canvas]"))).meteorVisible).toBe(true);
  await page.goto("/about?solarDebug=1&solarTime=22");
  await expect(solar).toHaveAttribute("data-renderer", "webgl", { timeout: 25_000 });
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
  await page.route("**/earth-night.webp*", (route) => route.abort());
  await page.goto("/contact?solarDebug=1");
  const solar = page.locator("[data-solar-system]");
  await expect(solar).toHaveAttribute("data-renderer", "webgl", { timeout: 25_000 });
  const frame = await snapshot(solar.locator("[data-solar-canvas]"));
  expect(frame.textureCount).toBe(15);
  expect(frame.bodies).toHaveLength(11);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("a failed core texture retains the complete static fallback", async ({ page }) => {
  await page.route("**/jupiter.webp*", (route) => route.abort());
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
  await expect(solar).toHaveAttribute("data-renderer", "webgl", { timeout: 25_000 });
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
  await expect(solar).toHaveAttribute("data-state", "running", { timeout: 25_000 });
  await expect.poll(async () => (await snapshot(canvas)).elapsed).toBeGreaterThan(hidden.elapsed);
});
