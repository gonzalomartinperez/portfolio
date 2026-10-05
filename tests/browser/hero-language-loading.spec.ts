import { expect, test } from "@playwright/test";

for (const theme of ["dark", "light"]) {
  const mode = theme === "dark" ? "paused" : "running";
  test(`${theme} ${mode} warm language changes keep the hero visible without a static-layout flash`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
    await page.goto("/");
    const scene = page.locator("[data-scene]");
    await expect(scene).toHaveAttribute("data-mode", "running");
    if (mode === "paused") {
      await scene.getByRole("button", { name: "Pause animation", exact: true }).click();
      await expect(scene).toHaveAttribute("data-mode", mode);
    }
    await page.evaluate(() => document.fonts.ready);

    for (const locale of ["es", "en", "es", "en"]) {
      const continuity = await page.evaluate(
        ({ locale, mode }) =>
          new Promise<{
            frames: number;
            staticFrames: number;
            hiddenCanvasFrames: number;
            replacedCanvasFrames: number;
            viewportHeightChanges: number;
            scrollChanges: number;
          }>((resolve, reject) => {
            const initial = document.querySelector<HTMLElement>("[data-scene-viewport]");
            const link = document.querySelector<HTMLAnchorElement>(
              `header a[hreflang="${locale}"]`,
            );
            if (!initial || !link) throw new Error("Hero or language control is missing");
            const initialCanvas = document.querySelector("[data-scene] canvas");
            const height = initial.clientHeight;
            const position = scrollY;
            const result = {
              frames: 0,
              staticFrames: 0,
              hiddenCanvasFrames: 0,
              replacedCanvasFrames: 0,
              viewportHeightChanges: 0,
              scrollChanges: 0,
            };
            let settledFrames = 0;
            let frame = 0;
            const timeout = setTimeout(() => {
              cancelAnimationFrame(frame);
              reject(new Error("Language navigation did not settle"));
            }, 20_000);
            const sample = () => {
              const stage = document.querySelector<HTMLElement>("[data-scene]");
              const viewport = stage?.querySelector<HTMLElement>("[data-scene-viewport]");
              const canvas = stage?.querySelector("canvas");
              result.frames += 1;
              if (canvas !== initialCanvas) result.replacedCanvasFrames += 1;
              if (stage?.dataset.mode === "static") result.staticFrames += 1;
              if (!canvas || getComputedStyle(canvas).opacity !== "1") {
                result.hiddenCanvasFrames += 1;
              }
              if (viewport?.clientHeight !== height) result.viewportHeightChanges += 1;
              if (scrollY !== position) result.scrollChanges += 1;
              const path = locale === "es" ? "/es" : "/";
              if (location.pathname === path && stage?.dataset.mode === mode) {
                settledFrames += 1;
              }
              if (settledFrames >= 3) {
                clearTimeout(timeout);
                resolve(result);
              } else {
                frame = requestAnimationFrame(sample);
              }
            };
            frame = requestAnimationFrame(sample);
            link.click();
          }),
        { locale, mode },
      );
      expect(continuity.frames).toBeGreaterThanOrEqual(3);
      expect(continuity.staticFrames).toBe(0);
      expect(continuity.hiddenCanvasFrames).toBe(0);
      expect(continuity.replacedCanvasFrames).toBe(0);
      expect(continuity.viewportHeightChanges).toBe(0);
      expect(continuity.scrollChanges).toBe(0);
      await expect(scene).toHaveAttribute("data-mode", mode);
      await expect(page.locator("[data-scene-avatar]")).toBeVisible();
    }
  });
}
