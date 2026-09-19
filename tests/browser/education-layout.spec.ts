import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const locale of ["en", "es"]) {
  test(`${locale} academic evidence and grade chips stay readable in both themes`, async ({
    page,
  }) => {
    await page.goto(locale === "es" ? "/es/education" : "/education");
    for (const summary of await page.locator("details > summary").all()) await summary.click();
    const grades = page.locator("[data-academic-grade]");
    expect(await grades.count()).toBeGreaterThan(34);
    await expect(page.locator('[data-academic-grade="AP"]').first()).toContainText("AP");
    for (const grade of await grades.all()) {
      const value = await grade.getAttribute("data-academic-grade");
      await expect(grade).toContainText(value === "AP" ? "AP" : `${value} / 10`);
    }
    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      const evidence = page.locator('ul[aria-labelledby="evidence"]');
      await expect(evidence.locator("li")).toHaveCount(2);
      for (const card of await evidence.locator("li").all()) {
        await expect(card.locator("h3")).toBeVisible();
        await expect(card).toContainText(/PDF · \d+\.\d KiB/);
        await expect(card.locator("a")).toHaveCount(2);
        await expect(card.locator("a[download]")).toHaveCount(1);
        for (const link of await card.locator("a").all()) {
          const bounds = await link.boundingBox();
          expect(bounds?.height).toBeGreaterThanOrEqual(44);
        }
      }
      await expect(page.locator("main")).toContainText(
        locale === "es"
          ? "validez administrativa de seis meses finalizó"
          : "six-month administrative validity has expired",
      );
      for (const issuer of ["uns", "kognite"]) {
        const logo = page.locator(`main img[src="/images/institutions/${issuer}.jpg"]`);
        await expect(logo).toBeVisible();
        expect(await logo.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBe(100);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect((await new AxeBuilder({ page }).include("main").analyze()).violations).toEqual([]);
      await evidence
        .locator("..")
        .screenshot({ path: test.info().outputPath(`evidence-${theme}.png`) });
      await page
        .locator("details")
        .first()
        .screenshot({ path: test.info().outputPath(`grades-${theme}.png`) });
      await page
        .locator("main article")
        .filter({ has: page.locator("[data-academic-grade]") })
        .first()
        .screenshot({ path: test.info().outputPath(`featured-grades-${theme}.png`) });
    }
  });
}
