import { expect, test } from "@playwright/test";

for (const locale of ["", "/es"]) {
  test(`${locale || "en"} settled toolkit has breathing room and a native reading hold`, async ({
    page,
  }) => {
    await page.goto(locale || "/");
    const scene = page.locator("[data-scene]");
    await expect(scene).toHaveAttribute("data-mode", "running");
    const hold = await scene.evaluate((element) => {
      const journey = element.querySelector<HTMLElement>("[data-scene-journey]");
      const viewport = element.querySelector<HTMLElement>("[data-scene-viewport]");
      if (!journey || !viewport) throw new Error("Scene geometry is missing");
      const hold = Number.parseFloat(journey.style.getPropertyValue("--scene-reading-hold"));
      scrollTo({
        top:
          journey.getBoundingClientRect().top +
          scrollY +
          journey.offsetHeight -
          viewport.offsetHeight -
          hold,
        behavior: "instant",
      });
      return hold;
    });
    expect(hold).toBeGreaterThanOrEqual(200);
    expect(hold).toBeLessThanOrEqual(320);
    await expect
      .poll(async () => Number(await scene.getAttribute("data-scene-progress")))
      .toBeGreaterThan(0.9998);
    const bounds = () =>
      scene.evaluate((element) => {
        const viewport = element.querySelector<HTMLElement>("[data-scene-viewport]");
        const header = document.querySelector<HTMLElement>("header");
        const logos = [...element.querySelectorAll<HTMLElement>(".scene-logo")].map((node) =>
          node.getBoundingClientRect(),
        );
        if (!viewport || !header || !logos.length) throw new Error("Toolkit bounds are missing");
        return {
          top: Math.min(...logos.map((node) => node.top)),
          bottom: Math.max(...logos.map((node) => node.bottom)),
          headerBottom: Math.max(0, header.getBoundingClientRect().bottom),
          viewportTop: viewport.getBoundingClientRect().top,
          height: innerHeight,
        };
      });
    const before = await bounds();
    expect(before.top).toBeGreaterThanOrEqual(before.headerBottom + 44);
    expect(before.bottom).toBeLessThanOrEqual(before.height - 92);
    await page.evaluate((distance) => scrollBy({ top: distance, behavior: "instant" }), hold / 2);
    const after = await bounds();
    expect(Math.abs(after.viewportTop - before.viewportTop)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.top - before.top)).toBeLessThanOrEqual(1);
    await expect(scene).toHaveAttribute("data-scene-settled", "true");
    await page.screenshot({ path: test.info().outputPath("toolkit-reading-hold.png") });
  });
}

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
          const item = source.closest("li");
          if (!item?.parentElement) throw new Error("Technology catalogue item is missing");
          for (let index = 0; index < count; index += 1) {
            const clone = item.cloneNode(true) as HTMLElement;
            const mark = clone.querySelector<HTMLElement>("[data-tech-icon]");
            if (!mark) throw new Error("Technology identity is missing");
            mark.dataset.techIcon = `layout-fixture-${index}`;
            mark.dataset.sceneBrand = `layout-fixture-${index}`;
            item.parentElement.append(clone);
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
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      isMobile ? 393 : 1920,
    );
    const layout = await scene.evaluate((element) => {
      const header = document.querySelector("header");
      const logos = [...element.querySelectorAll<HTMLElement>(".scene-logo")].map((logo) => {
        const rect = logo.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
      });
      return { headerBottom: Math.max(0, header?.getBoundingClientRect().bottom ?? 0), logos };
    });
    expect(layout.logos).toHaveLength(35 + extraMarks);
    if (!extraMarks) expect(layout.logos.length % (isMobile ? 5 : 7)).toBe(0);
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
    const backdrop = scene.locator("[data-scene-backdrop]");
    const backdropBounds = await backdrop.boundingBox();
    expect(backdropBounds).not.toBeNull();
    if (backdropBounds)
      expect(backdropBounds.y + backdropBounds.height).toBeGreaterThan(
        lastBounds.y + lastBounds.height,
      );
    await expect(backdrop).toHaveCSS("mask-image", /linear-gradient/);
    if (!extraMarks && height === 770) {
      await page.evaluate(() => scrollBy({ top: 160, behavior: "instant" }));
      const control = await page
        .getByRole("button", { name: "Pause animation", exact: true })
        .boundingBox();
      const heading = await page.locator("#technology-heading").boundingBox();
      expect(control).not.toBeNull();
      expect(heading).not.toBeNull();
      if (control && heading) expect(control.y + control.height).toBeLessThan(heading.y);
      await page.screenshot({ path: test.info().outputPath("toolkit-fade.png") });
    }
  });
}
