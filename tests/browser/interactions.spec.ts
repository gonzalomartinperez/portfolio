import { expect, test } from "@playwright/test";

for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
  test(`the scene reproduces its ${progress} checkpoint`, async ({ page }, info) => {
    await page.goto(`/?sceneProgress=${progress}&sceneTime=0`);
    const scene = page.locator("[data-scene]");
    await expect(scene).toHaveAttribute("data-mode", "running");
    await expect
      .poll(async () => Number(await scene.getAttribute("data-scene-progress")))
      .toBe(progress);
    if (progress >= 0.75) {
      const glyphs = scene.locator(".scene-logo img, .scene-logo svg");
      expect(await glyphs.count()).toBeGreaterThan(0);
      for (const glyph of await glyphs.all()) await expect(glyph).toBeVisible();
    }
    await page.screenshot({ path: info.outputPath(`scene-${progress}.png`) });
  });
}

test("pause and reduced motion leave content available", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
  await page.getByRole("button", { name: "Pause animation", exact: true }).click();
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "paused");
  const pausedProgress = await page.locator("[data-scene]").getAttribute("data-scene-progress");
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect(page.locator("[data-scene]")).toHaveAttribute(
    "data-scene-progress",
    pausedProgress ?? "",
  );
  await page.getByRole("button", { name: "Play animation", exact: true }).click();
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "static");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
});

test("native scrolling reverses the scene without replacing the canvas", async ({ page }) => {
  await page.goto("/");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-mode", "running");
  const canvas = await scene.locator("canvas").elementHandle();
  await page.evaluate(() => window.scrollTo(0, innerHeight));
  await expect
    .poll(async () => Number(await scene.getAttribute("data-scene-progress")))
    .toBeGreaterThan(0.1);
  expect((await scene.locator("canvas").boundingBox())?.y).toBeGreaterThanOrEqual(-1);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect
    .poll(async () => Number(await scene.getAttribute("data-scene-progress")))
    .toBeLessThan(0.01);
  expect(await canvas?.evaluate((element) => element.isConnected)).toBe(true);
});

test("catalogue search and categories preserve a recoverable empty state", async ({ page }) => {
  await page.goto("/stack");
  const results = page.locator("#technology-results");
  const search = page.getByRole("searchbox", { name: "Search technologies", exact: true });
  await search.fill("LangGraph");
  await expect(results.getByRole("heading", { name: "LangGraph", exact: true })).toBeVisible();
  await expect(results.getByRole("heading", { name: "React", exact: true })).toHaveCount(0);
  await search.fill("MCP");
  await expect(
    results.getByRole("heading", { name: "Model Context Protocol", exact: true }),
  ).toBeVisible();
  await search.fill("a-technology-that-does-not-exist");
  await expect(results.locator("li[id^='tech-']")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters", exact: true }).first().click();
  await expect(results.getByRole("heading", { name: "React", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Category", exact: true }).selectOption("applied-ai");
  await expect(results.getByRole("heading", { name: "LangGraph", exact: true })).toBeVisible();
  await expect(results.getByRole("heading", { name: "React", exact: true })).toHaveCount(0);
});

test("WebGL unavailability preserves the static scene and technology links", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        if (type.startsWith("webgl")) return null;
        return Reflect.apply(original, this, [type, ...args]);
      },
    });
  });
  await page.goto("/");
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "static");
  await expect(page.getByRole("link", { name: "LangGraph", exact: true }).first()).toBeVisible();
});

test("gallery enlargement supports Escape and restores focus", async ({ page }) => {
  await page.goto("/work/filomena");
  const trigger = page.getByRole("link", { name: /^Enlarge:/ }).first();
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const firstImage = await page.getByRole("dialog").locator("img").getAttribute("src");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("dialog").locator("img")).not.toHaveAttribute(
    "src",
    firstImage ?? "",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("real WebGL context loss preserves content and recovers", async ({ page }) => {
  await page.goto("/");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-mode", "running");
  const extension = await scene
    .locator("canvas")
    .evaluateHandle((canvas: HTMLCanvasElement) =>
      canvas.getContext("webgl2")?.getExtension("WEBGL_lose_context"),
    );
  expect(await extension.evaluate((value) => Boolean(value))).toBe(true);
  await extension.evaluate((value) => value?.loseContext());
  await expect(scene).toHaveAttribute("data-mode", "static");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await extension.evaluate((value) => value?.restoreContext());
  await expect(scene).toHaveAttribute("data-mode", "running");
  await extension.dispose();
});

test("client navigation mounts only one scene and releases the previous canvas", async ({
  page,
}) => {
  await page.goto("/");
  for (let visit = 0; visit < 3; visit += 1) {
    const scene = page.locator("[data-scene]");
    await expect(scene).toHaveAttribute("data-mode", "running");
    await expect(scene.locator("canvas")).toHaveCount(1);
    const oldCanvas = await scene.locator("canvas").elementHandle();
    await page.locator("header").getByRole("link", { name: "Work", exact: true }).click();
    await expect(scene).toHaveCount(0);
    expect(await oldCanvas?.evaluate((element) => element.isConnected)).toBe(false);
    await page.locator("header a[href='/']").first().click();
  }
  await expect(page.locator("[data-scene]")).toHaveCount(1);
});

test("scene libraries are not requested on an unrelated direct navigation", async ({ page }) => {
  const { readFileSync } = await import("node:fs");
  const report: { files: string[] } = JSON.parse(readFileSync(".next/scene-budget.json", "utf8"));
  const sceneRequests: string[] = [];
  page.on("request", (request) => {
    if (report.files.some((file) => request.url().endsWith(file)))
      sceneRequests.push(request.url());
  });
  await page.goto("/education");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("main").scrollIntoViewIfNeeded();
  expect(sceneRequests).toEqual([]);
});

test("every catalogue entry has a logo or a labelled-context illustration", async ({ page }) => {
  await page.goto("/stack");
  const entries = page.locator("#technology-results li[id^='tech-']");
  expect(await entries.count()).toBeGreaterThan(100);
  for (const entry of await entries.all()) {
    await expect(entry.getByRole("heading", { level: 3 })).toBeVisible();
    await expect(entry.locator("svg, img")).toHaveCount(1);
  }
  await expect(page.locator("#tech-rag [data-representation='illustration']")).toHaveCount(1);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "LangGraph", exact: true })).toHaveAttribute(
    "href",
    "/stack#tech-langgraph",
  );
});

test("the layout reflows at a 200 percent text scale", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});

test("short mobile viewports keep pause visible and use a static landscape fallback", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/");
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
  const button = page.getByRole("button", { name: "Pause animation", exact: true });
  const box = await button.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.y ?? -1) + (box?.height ?? 0)).toBeLessThanOrEqual(700);
  expect(box?.y).toBeGreaterThanOrEqual(0);
  await button.click();
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "paused");
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "static");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
