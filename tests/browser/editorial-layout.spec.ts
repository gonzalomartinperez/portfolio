import { expect, test } from "@playwright/test";

for (const locale of ["", "/es"]) {
  test(`${locale || "en"} About separates the introduction, biography and personal facts`, async ({
    page,
  }) => {
    await page.goto(`${locale}/about`);
    await expect(page.locator(".skip-link")).toHaveText(
      locale ? "Ir al contenido" : "Skip to content",
    );
    const biography = page.locator("main .prose");
    await expect(page.locator("main h1 + p")).toContainText("Universidad Nacional del Sur");
    await expect(biography.locator("p")).toHaveCount(5);
    await expect(biography.locator("p").nth(3)).toContainText("Coolify");
    await expect(biography.locator("p").nth(3)).toContainText(
      locale ? "proxies inversos" : "reverse proxies",
    );
    await expect(biography).not.toContainText("Soy Gonzalo");
    await expect(biography).not.toContainText("I’m Gonzalo");
    await expect(page.locator("main aside dl")).toContainText("Bahía Blanca, Argentina");
    await expect(page.locator("main aside dl")).toContainText("2024");
    if (locale) {
      await expect(biography).not.toContainText(/founders|AI engineering|mobile/);
    }
    const lastPrinciple = page
      .locator('main section[aria-labelledby="about-principles-heading"] ol > li')
      .last();
    await expect(lastPrinciple).toHaveCSS("border-bottom-width", "0px");
    await expect(page.locator("main section").first()).toHaveCSS("padding-top", "0px");
  });
}
