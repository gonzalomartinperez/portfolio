import { expect, test } from "@playwright/test";

for (const locale of ["", "/es"]) {
  for (const progress of [0.7, 0.8, 0.85]) {
    test(`${locale || "en"} cloud reserves copy and mark space at ${progress}`, async ({
      page,
    }) => {
      await page.goto(`${locale || "/"}?sceneProgress=${progress}&sceneTime=0`);
      const scene = page.locator("[data-scene]");
      await expect(scene).toHaveAttribute("data-mode", "running");
      await scene.evaluate((element) => {
        scrollTo({ top: element.getBoundingClientRect().top + scrollY, behavior: "instant" });
      });
      const layout = await scene.evaluate((element) => {
        const bounds = (node: Element) => {
          const rect = node.getBoundingClientRect();
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
        };
        const copy = element.querySelector(".scene-cloud-copy");
        const viewport = element.querySelector("[data-scene-viewport]");
        const backdrop = element.querySelector("[data-scene-backdrop]");
        if (!copy || !viewport || !backdrop) throw new Error("Missing scene layout");
        return {
          copy: bounds(copy),
          viewport: bounds(viewport),
          backdrop: bounds(backdrop),
          visibleHeight: innerHeight,
          marks: [...element.querySelectorAll(".scene-logo")].map(bounds),
        };
      });
      const overlaps = (a: typeof layout.copy, b: typeof layout.copy) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      expect(layout.marks).toHaveLength(35);
      for (const [index, mark] of layout.marks.entries()) {
        expect(overlaps(mark, layout.copy), `mark ${index} covers the copy`).toBe(false);
        for (const other of layout.marks.slice(index + 1)) {
          expect(overlaps(mark, other), `mark ${index} overlaps another mark`).toBe(false);
        }
      }
      expect(layout.viewport.bottom - layout.viewport.top).toBe(layout.visibleHeight);
      expect(layout.viewport.top).toBeLessThanOrEqual(1);
      expect(layout.viewport.bottom).toBeGreaterThanOrEqual(layout.visibleHeight - 1);
      expect(layout.backdrop.bottom).toBeGreaterThan(layout.viewport.bottom);
      if (progress === 0.8)
        await page.screenshot({ path: test.info().outputPath("cloud-spacing.png") });
    });
  }
}

test("compact cloud reflows after viewport height changes without covering its copy", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 650 });
  await page.goto("/es?sceneProgress=0.8&sceneTime=0");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-mode", "running");
  for (const [width, height] of [
    [320, 650],
    [320, 780],
    [767, 650],
    [768, 650],
    [820, 650],
    [1024, 650],
    [320, 650],
  ]) {
    await page.setViewportSize({ width, height });
    await expect
      .poll(() => scene.locator("[data-scene-viewport]").evaluate((node) => node.clientHeight))
      .toBe(height);
    await expect
      .poll(() =>
        scene.evaluate((element) => {
          const copy = element.querySelector(".scene-cloud-copy")?.getBoundingClientRect();
          if (!copy) return false;
          return [...element.querySelectorAll(".scene-logo")].every((mark) => {
            const rect = mark.getBoundingClientRect();
            return (
              rect.right <= copy.left ||
              rect.left >= copy.right ||
              rect.bottom <= copy.top ||
              rect.top >= copy.bottom
            );
          });
        }),
      )
      .toBe(true);
  }
});
