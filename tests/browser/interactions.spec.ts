import { expect, test } from "@playwright/test";

test("the scene has reproducible checkpoints and returns to its starting state", async ({
  page,
}, info) => {
  for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
    await page.goto(`/?sceneProgress=${progress}&sceneTime=0`);
    const scene = page.locator("[data-scene]");
    await expect(scene).toHaveAttribute("data-mode", "running");
    await expect(scene).toHaveAttribute("data-scene-progress", String(progress));
    await page.screenshot({ path: info.outputPath(`scene-${progress}.png`) });
  }
  await page.goto("/?sceneProgress=0&sceneTime=0");
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-scene-progress", "0");
});

test("pause and reduced motion leave content available", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
  await page.getByRole("button", { name: "Pause animation", exact: true }).click();
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "paused");
  await page.getByRole("button", { name: "Play animation", exact: true }).click();
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "static");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
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
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
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

test("the layout reflows at a 200 percent text scale", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});
