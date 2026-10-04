import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const locale of ["en", "es"]) {
  for (const theme of ["dark", "light"]) {
    test(`${locale} ${theme} solar exploration reuses the canvas and restores portfolio reading`, async ({
      page,
    }, info) => {
      test.setTimeout(90_000);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
      await page.goto(`${locale === "es" ? "/es" : ""}/contact?solarDebug=1`);
      const canvas = page.locator("[data-solar-canvas]");
      await expect(page.locator("[data-solar-system]")).toHaveAttribute("data-renderer", "webgl", {
        timeout: 25_000,
      });
      const original = await canvas.elementHandle();
      const trigger = page.locator("[data-solar-explore]");
      await trigger.scrollIntoViewIfNeeded();
      const scroll = await page.evaluate(() => window.scrollY);
      const rootBackground = await page.evaluate(
        () => getComputedStyle(document.documentElement).backgroundColor,
      );
      await trigger.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      expect(
        await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor),
      ).toBe(await dialog.evaluate((element) => getComputedStyle(element).backgroundColor));
      const bounds = await dialog.boundingBox();
      expect(bounds?.x).toBeCloseTo(0, 0);
      expect(bounds?.y).toBeCloseTo(0, 0);
      await expect(dialog.locator("[data-solar-canvas]")).toHaveCount(1);
      await expect(page.locator("[data-solar-canvas]")).toHaveCount(1);
      expect(await original?.evaluate((node) => node.isConnected)).toBe(true);
      await dialog.getByRole("combobox").selectOption("saturn");
      await dialog
        .getByRole("button", {
          name: locale === "es" ? "Acercar la vista" : "Zoom in",
          exact: true,
        })
        .click();
      await dialog
        .getByRole("button", {
          name: locale === "es" ? "Alejar la vista" : "Zoom out",
          exact: true,
        })
        .click();
      await dialog
        .getByRole("button", {
          name: locale === "es" ? "Rotar hacia la derecha" : "Rotate right",
          exact: true,
        })
        .click();
      await dialog
        .getByRole("button", { name: locale === "es" ? "Restablecer" : "Reset view", exact: true })
        .click();
      expect(
        (await new AxeBuilder({ page }).include('[data-slot="dialog-content"]').analyze())
          .violations,
      ).toEqual([]);
      await page.screenshot({ path: info.outputPath("solar-explorer.png") });
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(page.locator("[data-solar-system] [data-solar-canvas]")).toHaveCount(1);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(scroll, 0);
      expect(
        await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor),
      ).toBe(rootBackground);
      expect(errors).toEqual([]);
    });
  }
}
