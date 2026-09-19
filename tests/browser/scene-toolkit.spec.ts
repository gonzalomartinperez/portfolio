import { expect, test } from "@playwright/test";

for (const { height, extraMarks } of [
  { height: 650, extraMarks: 0 },
  { height: 770, extraMarks: 0 },
  { height: 1000, extraMarks: 0 },
  { height: 650, extraMarks: 30 },
]) {
  test(`settled toolkit keeps every row reachable at ${height}px with ${extraMarks} extra marks`, async ({
    page,
    isMobile,
  }) => {
    await page.setViewportSize({ width: isMobile ? 393 : 1920, height });
    if (extraMarks) await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    if (extraMarks) {
      await page
        .locator("[data-tech-icon]")
        .first()
        .evaluate((source, count) => {
          for (let index = 0; index < count; index += 1) {
            const mark = source.cloneNode(true) as HTMLElement;
            mark.dataset.techIcon = `layout-fixture-${index}`;
            mark.dataset.sceneBrand = `layout-fixture-${index}`;
            source.parentElement?.append(mark);
          }
        }, extraMarks);
      await page.emulateMedia({ reducedMotion: "no-preference" });
    }
    const scene = page.locator("[data-scene]");
    await expect(scene).toHaveAttribute("data-mode", "running");
    await scene.evaluate((element) => {
      const journey = element.querySelector<HTMLElement>("[data-scene-journey]");
      const viewport = element.querySelector<HTMLElement>("[data-scene-viewport]");
      if (!journey || !viewport) throw new Error("Scene geometry is missing");
      scrollTo({
        top:
          journey.getBoundingClientRect().top +
          scrollY +
          journey.offsetHeight -
          viewport.offsetHeight,
        behavior: "instant",
      });
    });
    await expect
      .poll(async () => Number(await scene.getAttribute("data-scene-progress")))
      .toBeGreaterThan(0.9998);
    const layout = await scene.evaluate((element) => {
      const header = document.querySelector("header");
      const logos = [...element.querySelectorAll<HTMLElement>(".scene-logo")].map((logo) => {
        const rect = logo.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
      });
      return { headerBottom: Math.max(0, header?.getBoundingClientRect().bottom ?? 0), logos };
    });
    expect(layout.logos.length).toBeGreaterThan(40);
    for (const [index, logo] of layout.logos.entries()) {
      expect(logo.top).toBeGreaterThanOrEqual(layout.headerBottom + 12);
      expect(logo.left).toBeGreaterThanOrEqual(0);
      expect(logo.right).toBeLessThanOrEqual(isMobile ? 393 : 1920);
      const nextRow = layout.logos[index + (isMobile ? 5 : 7)];
      if (nextRow) expect(nextRow.top - logo.bottom).toBeGreaterThanOrEqual(2);
    }
    await page.screenshot({ path: test.info().outputPath("toolkit.png") });
    const last = scene.locator(".scene-logo").last();
    await last.evaluate((element) => {
      scrollBy({
        top: Math.max(0, element.getBoundingClientRect().bottom - innerHeight + 64),
        behavior: "instant",
      });
    });
    const lastBounds = await last.boundingBox();
    expect(lastBounds).not.toBeNull();
    if (!lastBounds) return;
    expect(lastBounds.y).toBeGreaterThanOrEqual(layout.headerBottom);
    expect(lastBounds.y + lastBounds.height).toBeLessThanOrEqual(height - 60);
    const catalogue = await page.locator("#technology-heading").boundingBox();
    expect(catalogue?.y).toBeGreaterThan(lastBounds.y + lastBounds.height);
    await expect(scene.locator("[data-scene-viewport]")).toHaveCSS("overflow", "visible");
    await page.screenshot({ path: test.info().outputPath("toolkit-last-row.png") });
  });
}
