import { expect, test } from "@playwright/test";

for (const prefix of ["", "/es"]) {
  test(`${prefix || "en"} production experience retains qualified outcomes and public marks`, async ({
    page,
  }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${prefix}/work`);
    const rampy = page.locator("#rampy");
    await expect(rampy.getByRole("link", { name: "Rampy", exact: true })).toHaveAttribute(
      "href",
      "https://rampyapp.com/",
    );
    await expect(rampy).toContainText("~1 h → 10 min");
    await expect(rampy).toContainText("~30%");
    await expect(rampy).toContainText(prefix ? /estimación/i : /estimat/i);
    await rampy.locator("summary").click();
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
      for (const company of ["rampy", "teamcubation", "cooperativa-obrera", "pequeverso"]) {
        const mark = page.locator(`main img[src="/images/companies/${company}.png"]`);
        await mark.scrollIntoViewIfNeeded();
        await expect(mark).toBeVisible();
        expect(
          await mark.evaluate((element) => (element as HTMLImageElement).naturalWidth),
        ).toBeGreaterThan(0);
      }
      await rampy.scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath(`experience-${theme}.png`) });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
    }
  });
}
