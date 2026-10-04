import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const locale of ["en", "es"]) {
  test(`${locale} solar exploration reuses the canvas and restores portfolio reading`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${locale === "es" ? "/es" : ""}/contact?solarDebug=1`);
    const canvas = page.locator("[data-solar-canvas]");
    await expect(page.locator("[data-solar-system]")).toHaveAttribute("data-renderer", "webgl");
    const original = await canvas.elementHandle();
    const trigger = page.locator("[data-solar-explore]");
    await trigger.scrollIntoViewIfNeeded();
    const scroll = await page.evaluate(() => window.scrollY);
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-solar-canvas]")).toHaveCount(1);
    await expect(page.locator("[data-solar-canvas]")).toHaveCount(1);
    expect(await original?.evaluate((node) => node.isConnected)).toBe(true);
    await dialog.getByRole("combobox").selectOption("saturn");
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
      (await new AxeBuilder({ page }).include('[data-slot="dialog-content"]').analyze()).violations,
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator("[data-solar-system] [data-solar-canvas]")).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(scroll, 0);
    expect(errors).toEqual([]);
  });
}
