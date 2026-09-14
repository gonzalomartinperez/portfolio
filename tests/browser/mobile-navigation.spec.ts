import { expect, test } from "@playwright/test";

test("both navigation languages fit one row on common mobile widths", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const prefix of ["", "/es"]) {
    await page.goto(`${prefix}/contact`);
    await page.evaluate(() => document.fonts.ready);
    const nav = page.getByRole("navigation", { name: prefix ? "Principal" : "Main", exact: true });
    for (const width of [360, 375, 390, 412, 430]) {
      await page.setViewportSize({ width, height: 839 });
      await expect
        .poll(
          () =>
            nav.locator("a").evaluateAll((links) => {
              const rows = links.map((link) => link.getBoundingClientRect().top);
              return Math.max(...rows) - Math.min(...rows);
            }),
          { message: `${prefix || "en"} navigation at ${width}px` },
        )
        .toBeLessThan(2);
      const geometry = await nav.locator("a").evaluateAll((links) =>
        links.map((link) => {
          const rect = link.getBoundingClientRect();
          return { top: rect.top, right: rect.right, height: rect.height };
        }),
      );
      expect(geometry).toHaveLength(6);
      expect(Math.max(...geometry.map((link) => link.right))).toBeLessThanOrEqual(width);
      expect(Math.min(...geometry.map((link) => link.height))).toBeGreaterThanOrEqual(44);
    }
    await expect(page.getByRole("heading", { name: "CV", exact: true })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/\bResume\b/);
    await page.screenshot({
      path: test.info().outputPath(`navigation-${prefix ? "es" : "en"}.png`),
    });
    await page.setViewportSize({ width: 320, height: 700 });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const enlargedLinks = await nav.locator("a").evaluateAll((links) =>
      links.map((link) => ({
        left: link.getBoundingClientRect().left,
        right: link.getBoundingClientRect().right,
      })),
    );
    expect(Math.min(...enlargedLinks.map((link) => link.left))).toBeGreaterThanOrEqual(0);
    expect(Math.max(...enlargedLinks.map((link) => link.right))).toBeLessThanOrEqual(320);
    await expect(
      nav.getByRole("link", { name: prefix ? "Contacto" : "Contact", exact: true }),
    ).toBeVisible();
  }
});
