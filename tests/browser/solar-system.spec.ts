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
  glError: number | null;
  software: boolean;
  earthOceanGlint: boolean;
  readingShadeBlocks: number;
  veil: number;
  camera: { type: string };
  immersive: boolean;
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
/** The published map a body samples at an uploaded width: the original or a downscaled variant. */
function expectedMap(name: string, width: number) {
  const asset = textureManifest.assets.find(({ file }) => file === `${name}.webp`);
  if (!asset) throw new Error(`Missing texture manifest entry: ${name}`);
  const covering = [...(asset.variants ?? []), asset]
    .sort((a, b) => a.width - b.width)
    .find((entry) => entry.width >= width);
  return covering ?? asset;
}
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
    expect(frame.glError).toBe(0);
    expect(frame.earthOceanGlint).toBe(true);
    // Reading mode uploads the lighter maps; the explorer decodes finer detail on demand.
    expect(sun?.textureWidth).toBe(bounds.width < 640 ? 1024 : 2048);
    expect(frame.estimatedGpuBytes).toBeLessThanOrEqual(
      (bounds.width < 640 ? 128 : 256) * 1024 * 1024,
    );
    for (const body of frame.bodies) {
      // Reading mode downloads the variant that matches its upload size, not the original.
      const map = expectedMap(body.name, body.textureWidth);
      expect(map.width, body.name).toBe(body.textureWidth);
      const url = new URL(body.texture, page.url());
      expect(url.pathname, body.name).toBe(`/images/solar-system/${map.file}`);
      expect(url.searchParams.get("v"), body.name).toBe(map.sha256.slice(0, 16));
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
  await page.route("**/earth-night*.webp*", (route) => route.abort());
  await page.goto("/contact?solarDebug=1");
  const solar = page.locator("[data-solar-system]");
  await expect(solar).toHaveAttribute("data-renderer", "webgl", { timeout: 25_000 });
  const frame = await snapshot(solar.locator("[data-solar-canvas]"));
  expect(frame.textureCount).toBe(15);
  expect(frame.bodies).toHaveLength(11);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("a failed core texture retains the complete static fallback", async ({ page }) => {
  await page.route("**/jupiter*.webp*", (route) => route.abort());
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

test("scrolling orbits the camera around a centered Sun and recedes behind reading text", async ({
  page,
}) => {
  await page.goto("/about?solarDebug=1&solarTime=0");
  const solar = page.locator("[data-solar-system]");
  const canvas = solar.locator("[data-solar-canvas]");
  await expect(solar).toHaveAttribute("data-renderer", "webgl", { timeout: 25_000 });
  const top = await snapshot(canvas);
  expect(top.readingShadeBlocks).toBeGreaterThan(0);
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Solar canvas requires bounds");
  await page.evaluate(() => window.scrollTo({ top: innerHeight * 2, behavior: "instant" }));
  await expect
    .poll(async () => (await snapshot(canvas)).veil, { timeout: 10_000 })
    .toBeLessThan(top.veil - 0.2);
  const read = await snapshot(canvas);
  const sun = read.bodies.find(({ name }) => name === "sun");
  expect(sun?.screen.x).toBeCloseTo(bounds.width / 2, 0);
  expect(sun?.screen.y).toBeCloseTo(bounds.height / 2, 0);
  const jupiter = (frame: SolarSnapshot) => frame.bodies.find(({ name }) => name === "jupiter");
  expect(
    Math.hypot(
      (jupiter(read)?.screen.x ?? 0) - (jupiter(top)?.screen.x ?? 0),
      (jupiter(read)?.screen.y ?? 0) - (jupiter(top)?.screen.y ?? 0),
    ),
  ).toBeGreaterThan(10);
});

// The static scene has no reading mask; it is also what shows while the canvas fades in.
for (const renderer of ["webgl", "static"] as const)
  for (const theme of ["dark", "light"] as const)
    test(`reading text keeps WCAG contrast over the ${renderer} scene in ${theme} mode`, async ({
      page,
    }) => {
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
      if (renderer === "static")
        await page.addInitScript(() => {
          const original = HTMLCanvasElement.prototype.getContext;
          Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
            value(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
              if (type.startsWith("webgl")) return null;
              return Reflect.apply(original, this, [type, ...args]);
            },
          });
        });
      await page.goto("/about?solarDebug=1&solarTime=0");
      await expect(page.locator("[data-solar-system]")).toHaveAttribute("data-renderer", renderer, {
        timeout: 25_000,
      });
      await page.locator("main p").first().waitFor();
      const runs = await page.evaluate(() =>
        [...document.querySelectorAll("main :is(h1, p)")].flatMap((element) => {
          const style = getComputedStyle(element);
          const color = style.color.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
          const large = Number.parseFloat(style.fontSize) >= 24;
          const range = document.createRange();
          range.selectNodeContents(element);
          return [...range.getClientRects()]
            .filter((rect) => rect.width > 8 && rect.bottom > 0 && rect.top < innerHeight)
            .map((rect) => ({
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              color,
              large,
            }));
        }),
      );
      expect(runs.length).toBeGreaterThan(0);
      // Hide only the text, then measure the brightest scene pixels behind each line.
      await page.addStyleTag({
        content:
          "main * { color: transparent !important; -webkit-text-fill-color: transparent !important; }",
      });
      await page.waitForTimeout(300);
      const background = (await captureSettledPage(page, {})).toString("base64");
      const ratios = await page.evaluate(
        async ({ image, runs }) => {
          const response = await fetch(`data:image/png;base64,${image}`);
          const bitmap = await createImageBitmap(await response.blob());
          const surface = new OffscreenCanvas(bitmap.width, bitmap.height);
          const context = surface.getContext("2d");
          if (!context) throw new Error("2D canvas is required");
          context.drawImage(bitmap, 0, 0);
          const scale = bitmap.width / innerWidth;
          const channel = (value: number) => {
            const linear = value / 255;
            return linear <= 0.04045 ? linear / 12.92 : ((linear + 0.055) / 1.055) ** 2.4;
          };
          const luminance = ([r, g, b]: number[]) =>
            0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
          return runs.map((run) => {
            const x = Math.max(0, Math.floor(run.x * scale));
            const y = Math.max(0, Math.floor(run.y * scale));
            const width = Math.max(1, Math.min(bitmap.width - x, Math.ceil(run.width * scale)));
            const height = Math.max(1, Math.min(bitmap.height - y, Math.ceil(run.height * scale)));
            const pixels = context.getImageData(x, y, width, height).data;
            const samples: number[] = [];
            for (let index = 0; index < pixels.length; index += 16)
              samples.push(luminance([pixels[index], pixels[index + 1], pixels[index + 2]]));
            samples.sort((a, b) => a - b);
            const text = luminance(run.color);
            const lightText = text > samples[Math.floor(samples.length / 2)];
            const worst = samples[Math.floor(samples.length * (lightText ? 0.95 : 0.05))];
            const ratio = (Math.max(text, worst) + 0.05) / (Math.min(text, worst) + 0.05);
            return { ratio, required: run.large ? 3 : 4.5 };
          });
        },
        { image: background, runs },
      );
      for (const { ratio, required } of ratios) expect(ratio).toBeGreaterThanOrEqual(required);
    });

test("the explorer decodes detailed maps on demand and releases them afterwards", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const requested: string[] = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.startsWith("/images/solar-system/")) requested.push(pathname);
  });
  await page.goto("/contact?solarDebug=1");
  const canvas = page.locator("[data-solar-canvas]");
  await expect(page.locator("[data-solar-system]")).toHaveAttribute("data-renderer", "webgl", {
    timeout: 25_000,
  });
  const earth = async () => (await snapshot(canvas)).bodies.find(({ name }) => name === "earth");
  const earthWidth = async () => (await earth())?.textureWidth;
  const compact = (page.viewportSize()?.width ?? 0) < 640;
  expect(await earthWidth()).toBe(compact ? 1024 : 2048);
  // Reading mode downloads reading-size variants only; the originals wait for the explorer.
  expect(requested).not.toContain("/images/solar-system/earth.webp");
  expect(requested).not.toContain("/images/solar-system/jupiter.webp");
  const software = (await snapshot(canvas)).software;
  await page.locator("[data-solar-explore]").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  if (software) {
    // CPU rasterizers (CI) keep reading-size maps and never fetch the larger variants.
    await expect.poll(async () => (await snapshot(canvas)).immersive).toBe(true);
    await page.waitForTimeout(1_000);
    expect(await earthWidth()).toBe(compact ? 1024 : 2048);
    expect(requested).not.toContain("/images/solar-system/earth.webp");
    return;
  }
  await expect.poll(earthWidth, { timeout: 30_000 }).toBe(compact ? 2048 : 4096);
  expect(new URL((await earth())?.texture ?? "", page.url()).pathname).toBe(
    `/images/solar-system/${compact ? "earth-2048" : "earth"}.webp`,
  );
  expect((await snapshot(canvas)).glError).toBe(0);
  expect((await snapshot(canvas)).estimatedGpuBytes).toBeLessThanOrEqual(
    (compact ? 128 : 256) * 1024 * 1024,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect.poll(earthWidth, { timeout: 30_000 }).toBe(compact ? 1024 : 2048);
  expect((await snapshot(canvas)).glError).toBe(0);
});

test("crossing the compact breakpoint refits maps without GPU errors", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 640, "Already compact");
  await page.goto("/contact?solarDebug=1");
  const canvas = page.locator("[data-solar-canvas]");
  await expect(page.locator("[data-solar-system]")).toHaveAttribute("data-renderer", "webgl", {
    timeout: 25_000,
  });
  const sunWidth = async () =>
    (await snapshot(canvas)).bodies.find(({ name }) => name === "sun")?.textureWidth;
  expect(await sunWidth()).toBe(2048);
  await page.setViewportSize({ width: 600, height: 900 });
  await expect.poll(sunWidth, { timeout: 30_000 }).toBe(1024);
  expect((await snapshot(canvas)).glError).toBe(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect.poll(sunWidth, { timeout: 30_000 }).toBe(2048);
  expect((await snapshot(canvas)).glError).toBe(0);
});
