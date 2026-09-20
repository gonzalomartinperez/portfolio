import { expect, test } from "@playwright/test";

for (const locale of ["", "/es"]) {
  test(`${locale || "en"} viewport resizing never resets active native scrolling`, async ({
    page,
  }) => {
    await page.goto(locale || "/");
    const scene = page.locator("[data-scene]");
    await expect(scene).toHaveAttribute("data-mode", "running");
    const writes = await scene.evaluate(async (element) => {
      const viewport = element.querySelector<HTMLElement>("[data-scene-viewport]");
      if (!viewport) throw new Error("Missing scene viewport");
      const nativeScroll = window.scrollTo.bind(window);
      const originalScroll = window.scrollTo;
      const writes: number[] = [];
      window.scrollTo = ((x: number | ScrollToOptions, y?: number) => {
        writes.push(typeof x === "number" ? (y ?? 0) : (x.top ?? scrollY));
        if (typeof x === "number") nativeScroll(x, y ?? 0);
        else nativeScroll(x);
      }) as typeof window.scrollTo;
      try {
        for (let index = 0; index < 30; index += 1) {
          nativeScroll({ top: 200 + index * 8, behavior: "instant" });
          viewport.style.height = `${innerHeight - 40 + index}px`;
          await new Promise(requestAnimationFrame);
        }
        return writes;
      } finally {
        window.scrollTo = originalScroll;
        viewport.style.removeProperty("height");
      }
    });
    expect(writes, "resize refresh must not rewrite scroll position during a gesture").toEqual([]);
    await expect
      .poll(() =>
        scene.evaluate((element) => {
          const journey = element.querySelector<HTMLElement>("[data-scene-journey]");
          const viewport = element.querySelector<HTMLElement>("[data-scene-viewport]");
          if (!journey || !viewport) return 1;
          const start = journey.getBoundingClientRect().top + scrollY;
          const expected = Math.max(
            0,
            Math.min(1, (scrollY - start) / (journey.offsetHeight - viewport.offsetHeight)),
          );
          return Math.abs(Number((element as HTMLElement).dataset.sceneProgress) - expected);
        }),
      )
      .toBeLessThan(0.001);
  });
}
