import { expect, test } from "@playwright/test";

test("mobile navigation gives each centered label a content-aware share of the row", async ({
  page,
}) => {
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
          const range = document.createRange();
          range.selectNodeContents(link);
          const text = range.getBoundingClientRect();
          return {
            label: link.textContent,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height,
            textWidth: text.width,
            centerOffset: Math.abs(text.left + text.width / 2 - (rect.left + rect.width / 2)),
          };
        }),
      );
      expect(geometry).toHaveLength(6);
      const headerWidth = await page
        .locator("header")
        .evaluate((header) => header.getBoundingClientRect().width);
      for (const link of geometry) {
        expect(link.centerOffset).toBeLessThan(1);
        expect(link.textWidth).toBeLessThanOrEqual(link.width);
        expect(link.width).toBeGreaterThanOrEqual(44);
      }
      expect(
        Math.abs(geometry.reduce((sum, link) => sum + link.width, 0) - headerWidth),
      ).toBeLessThan(1);
      const education = geometry.find(
        (link) => link.label === (prefix ? "Educación" : "Education"),
      );
      const cv = geometry.find((link) => link.label === "CV");
      expect(education?.width).toBeGreaterThan(cv?.width ?? 0);
      expect(geometry[0].left).toBeLessThan(1);
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
