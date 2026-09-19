import { expect, test } from "@playwright/test";

for (const theme of ["dark", "light"]) {
  test(`${theme} avatar depth rises, pauses and recovers without moving the page`, async ({
    page,
  }) => {
    await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await page.goto("/");
    const scene = page.locator("[data-scene]");
    await expect(scene).toHaveAttribute("data-mode", "running");
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    await page.clock.pauseAt(new Date("2026-01-01T01:00:00Z"));
    const avatar = scene.locator("[data-scene-avatar]");
    const art = scene.locator("[data-scene-avatar-art]");
    const base = await art.boundingBox();
    if (!base) throw new Error("Avatar art is missing");
    await avatar.focus();
    const scroll = await page.evaluate(() => scrollY);
    await avatar.press("Enter");
    await page.clock.runFor(450);
    const raised = await art.boundingBox();
    if (!raised) throw new Error("Raised avatar is missing");
    expect(raised.height).toBeGreaterThan(base.height * 1.15);
    expect(raised.height).toBeLessThan(base.height * 1.6);
    expect(raised.y).toBeLessThan(base.y);
    await expect(scene).toHaveAttribute("data-scene-pulse", "avatar");
    await expect(scene.locator("[data-scene-core]")).toHaveCSS("z-index", "4");
    await page.screenshot({ path: test.info().outputPath("avatar-shell-wave.png") });
    await page.getByRole("button", { name: "Pause animation", exact: true }).click();
    const pausedTransform = await art.evaluate((element) => getComputedStyle(element).transform);
    await page.clock.runFor(500);
    await expect(art).toHaveCSS("transform", pausedTransform);
    await page.getByRole("button", { name: "Play animation", exact: true }).click();
    await page.clock.runFor(1600);
    await expect(scene).toHaveAttribute("data-scene-pulse", "idle");
    await expect(art).toHaveCSS("transform", "none");
    await expect(scene.locator("[data-scene-core]")).toHaveCSS("z-index", "1");
    await expect(scene).toHaveAttribute("data-scene-pulse-count", "1");
    await expect(scene).toHaveAttribute("data-scene-progress", "0.0000");
    expect(await page.evaluate(() => scrollY)).toBe(scroll);
    await expect(scene.locator("canvas")).toHaveCount(1);
  });
}
