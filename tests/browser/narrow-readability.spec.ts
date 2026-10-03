import { expect, test } from "@playwright/test";

for (const locale of ["en", "es"]) {
  test(`${locale} keeps long content within a narrow viewport at 200% text size`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 650 });
    for (const route of ["", "/stack", "/education", "/cv", "/work/filomena"]) {
      const path = locale === "es" ? `/es${route}` : route || "/";
      await page.goto(path);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      for (const theme of ["dark", "light"]) {
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect
          .poll(
            () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `${path}, ${theme}, 200% text`,
          )
          .toBe(true);
      }
    }
  });
}
