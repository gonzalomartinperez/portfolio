import { expect, test } from "@playwright/test";

for (const prefix of ["", "/es"]) {
  test(`${prefix || "en"} production experience retains qualified outcomes and public marks`, async ({
    page,
  }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${prefix}/work`);
    const rampy = page.locator("#rampy");
    await expect(rampy.locator('a[href="https://rampyapp.com/"]')).toHaveAttribute(
      "href",
      "https://rampyapp.com/",
    );
    await expect(rampy).toContainText("~1 h → 10 min");
    await expect(rampy).toContainText("~7–8 s → 1–2 s");
    await expect(rampy).toContainText("~30%");
    await expect(rampy).toContainText(prefix ? /estimación/i : /estimat/i);
    for (const slug of ["rampy", "teamcubation", "cooperativa-obrera", "independent"]) {
      const role = page.locator(`#${slug}`);
      await expect(role).toContainText(prefix ? "En producción" : "In production");
      const summary = role.locator("summary");
      if (await summary.count()) {
        expect((await summary.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      }
    }
    const outcomes = await rampy.locator(".metric-grid").boundingBox();
    const architecture = await rampy.locator("figure").boundingBox();
    expect(outcomes).not.toBeNull();
    expect(architecture).not.toBeNull();
    if (outcomes && architecture) {
      expect(outcomes.y + outcomes.height).toBeLessThan(architecture.y);
    }
    await rampy.locator("summary").click();
    await expect(rampy).toContainText("Singular SDK");
    for (const protocol of ["Morpho", "Aave", "Compound"]) {
      await expect(rampy.locator(".marked-list").last()).toContainText(protocol);
    }
    await expect(page.locator("#teamcubation")).not.toContainText(/90[,.]000/);
    await expect(page.locator("#cooperativa-obrera")).not.toContainText(/\bSGA\b/);
    await expect(page.locator('a[href="https://pequeverso.com/"]')).toBeVisible();

    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      for (const file of [
        "rampy-original.jpg",
        "teamcubation-original.jpg",
        "cooperativa-obrera-100.jpg",
        "pequeverso-isotipo.webp",
        "independent.jpg",
      ]) {
        const mark = page.locator(`main img[src="/images/companies/${file}"]`);
        await mark.scrollIntoViewIfNeeded();
        await expect(mark).toBeVisible();
        await expect
          .poll(() => mark.evaluate((element) => (element as HTMLImageElement).naturalWidth), {
            message: `${file} loads after entering the viewport`,
          })
          .toBeGreaterThan(0);
      }
      for (const company of ["rampy", "teamcubation", "cooperativa-obrera", "independent"]) {
        const tile = page.locator(`main [data-company="${company}"]`);
        const image = tile.locator("img");
        expect(await image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBe(100);
        await expect(image).toHaveCSS("filter", "none");
        if (company !== "independent") await expect(image).toHaveCSS("object-fit", "contain");
        await expect(tile).toHaveCSS("overflow", "hidden");
      }
      await rampy.scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath(`experience-${theme}.png`) });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
    }
  });
}

for (const prefix of ["", "/es"]) {
  test(`${prefix || "en"} CV achievement lists show visible, indented bullets`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/cv`);
    const bullets = page.locator("main article ul li");
    expect(await bullets.count()).toBeGreaterThan(10);
    const visibleMarkers = await bullets.evaluateAll((items) =>
      items.every((item) => {
        const list = item.parentElement;
        if (!list) return false;
        const marker = getComputedStyle(item, "::marker");
        return (
          getComputedStyle(list).listStyleType !== "none" &&
          marker.color !== "transparent" &&
          marker.color !== "rgba(0, 0, 0, 0)" &&
          item.getBoundingClientRect().left - list.getBoundingClientRect().left >= 12
        );
      }),
    );
    expect(visibleMarkers, "Every achievement has a visible marker and space for it").toBe(true);
  });
}

for (const prefix of ["", "/es"]) {
  test(`${prefix || "en"} Work content and client links reflow at 200 percent text size`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(`${prefix}/work`);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      .toBe(true);
    const client = page.locator('a[href="https://pequeverso.com/"]');
    await client.scrollIntoViewIfNeeded();
    const bounds = await client.boundingBox();
    expect(bounds).not.toBeNull();
    if (bounds) {
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
    }
  });
}
