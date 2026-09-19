import { expect, test } from "@playwright/test";

const routes = ["", "/about", "/work", "/work/filomena", "/stack", "/education", "/contact", "/cv"];

for (const width of [320, 390, 768, 1440, 1920]) {
  test(`all localized routes fit a ${width}px viewport in both themes`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "Explicit viewport matrix runs once.");
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const prefix of ["", "/es"]) {
      for (const route of routes) {
        await page.goto(`${prefix}${route || "/"}`);
        for (const theme of ["dark", "light"]) {
          await page.evaluate((value) => {
            document.documentElement.dataset.theme = value;
          }, theme);
          await expect(page.locator("main h1")).toBeVisible();
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `${prefix}${route} ${theme}`,
          ).toBe(true);
        }
      }
    }
    await page.goto("/cv");
    const header = await page.locator("main h1").boundingBox();
    const summary = await page.locator("#cv-summary").boundingBox();
    expect(Math.abs((header?.x ?? 0) - (summary?.x ?? 0))).toBeLessThan(2);
    await page.screenshot({ path: info.outputPath(`cv-${width}.png`) });
  });
}
