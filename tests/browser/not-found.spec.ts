import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const locale of ["en", "es"]) {
  const prefix = locale === "es" ? "/es" : "";
  test(`${locale} missing pages provide usable recovery routes and retain a real 404`, async ({
    page,
  }) => {
    const hydrationErrors: string[] = [];
    page.on("pageerror", (error) => hydrationErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && /hydration|Minified React error/i.test(message.text())) {
        hydrationErrors.push(message.text());
      }
    });
    const response = await page.goto(`${prefix}/this-page-does-not-exist/nested`);
    expect(response?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    await expect(page.locator("main h1")).toHaveText("This page does not exist");
    await expect(page.locator('main [lang="es"]')).toContainText("Esta página no existe");
    await expect(page.locator('main a[href="/es"]')).toBeVisible();
    const language = page.getByRole("navigation", { name: "Language", exact: true });
    await expect(language.getByRole("link", { name: "EN", exact: true })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(language.getByRole("link", { name: "ES", exact: true })).toHaveAttribute(
      "href",
      "/es",
    );
    for (const path of ["/", "/work", "/cv", "/contact"]) {
      const href = path;
      await expect(page.locator(`main a[href="${href}"]`)).toBeVisible();
    }
    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      await page.locator("main").evaluate(async (main) => {
        await Promise.all(
          main.getAnimations({ subtree: true }).map((animation) => animation.finished),
        );
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect((await new AxeBuilder({ page }).include("main").analyze()).violations).toEqual([]);
      await page.screenshot({
        path: test.info().outputPath(`not-found-${theme}.png`),
        fullPage: true,
      });
    }
    expect(hydrationErrors).toEqual([]);
    const work = page.locator('main a[href="/work"]');
    await work.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/work$/);
  });

  test(`${locale} recovery navigation works without JavaScript`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    try {
      const page = await context.newPage();
      const response = await page.goto(`${prefix}/missing-page`);
      expect(response?.status()).toBe(404);
      await expect(page.locator("main h1")).toHaveText("This page does not exist");
      await expect(page.locator('main [lang="es"]')).toContainText("Esta página no existe");
      await page.locator(`main a[href="${locale === "es" ? "/es" : "/cv"}"]`).click();
      await expect(page).toHaveURL(locale === "es" ? /\/es$/ : /\/cv$/);
    } finally {
      await context.close();
    }
  });
}
