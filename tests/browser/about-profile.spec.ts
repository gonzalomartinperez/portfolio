import { expect, test } from "@playwright/test";

for (const locale of ["en", "es"]) {
  const route = locale === "es" ? "/es/about" : "/about";
  test(`${route} presents a grounded profile and general engineering standards`, async ({
    page,
  }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (info.project.name === "mobile") await page.setViewportSize({ width: 320, height: 650 });
    await page.goto(route);

    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(main).toContainText("Universidad Nacional del Sur");
    await expect(main).toContainText("B2");
    await expect(main).toContainText(locale === "es" ? "septiembre de 2026" : "September 2026");
    await expect(main).toContainText(
      locale === "es" ? "cinco instituciones argentinas" : "five institutions in Argentina",
    );
    await expect(main).toContainText(
      locale === "es" ? "equipo de tres personas" : "three-person team",
    );

    const focus = page.locator('section[aria-labelledby="about-focus-heading"]');
    await expect(focus.locator("article")).toHaveCount(3);
    const approach = page.locator('section[aria-labelledby="about-principles-heading"]');
    await expect(approach.getByRole("listitem")).toHaveCount(5);
    expect(await approach.innerText()).not.toMatch(
      /Rampy|Teamcubation|Cooperativa|Filomena|Morpho|Aave|Compound|Hyperliquid/,
    );
    await expect(approach).toContainText(locale === "es" ? "arranque" : "startup");
    await expect(approach).toContainText("guardrails");

    const portrait = main.locator('img[src*="portrait."]');
    await portrait.scrollIntoViewIfNeeded();
    await expect(portrait).toHaveJSProperty("complete", true);
    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      await page.waitForTimeout(350);
      expect(
        await portrait.locator("..").evaluate((frame) => getComputedStyle(frame).backgroundImage),
      ).not.toBe("none");
      for (const scale of ["100%", "200%"]) {
        await page.evaluate((value) => {
          document.documentElement.style.fontSize = value;
        }, scale);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
          `${route}: ${theme} at ${scale}`,
        ).toBe(false);
        for (const heading of await approach.getByRole("heading", { level: 3 }).all()) {
          const box = await heading.boundingBox();
          expect(box).not.toBeNull();
          expect(box?.width).toBeGreaterThan(0);
          expect(box?.x).toBeGreaterThanOrEqual(0);
          expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
            page.viewportSize()?.width ?? 0,
          );
        }
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
    }

    const next = page.locator('section[aria-labelledby="about-looking-heading"]');
    await expect(next.getByRole("link")).toHaveCount(2);
    await expect(next.locator(`a[href="${locale === "es" ? "/es/work" : "/work"}"]`)).toBeVisible();
    await expect(
      next.locator(`a[href="${locale === "es" ? "/es/contact" : "/contact"}"]`),
    ).toBeVisible();
  });
}
