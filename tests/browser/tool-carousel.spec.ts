import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const locale of ["en", "es"]) {
  const prefix = locale === "es" ? "/es" : "";
  test(`${locale} tools carousel supports manual navigation without autoplay`, async ({
    page,
  }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (info.project.name === "mobile") await page.setViewportSize({ width: 320, height: 650 });
    await page.goto(process.env.CAROUSEL_PREVIEW ? `${prefix}/carousel-preview` : prefix || "/");
    const section = page.locator("[data-tool-carousel]");
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("listitem")).toHaveCount(12);
    const rail = section.getByRole("list");
    const buttons = section.getByRole("button");
    await expect(buttons.nth(0)).toBeDisabled();
    await expect(buttons.nth(1)).toBeEnabled();
    await buttons.nth(1).focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => rail.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
    await expect(buttons.nth(0)).toBeEnabled();
    const position = await rail.evaluate((node) => node.scrollLeft);
    await page.waitForTimeout(600);
    expect(await rail.evaluate((node) => node.scrollLeft)).toBe(position);
    await buttons.nth(0).click();
    await expect.poll(() => rail.evaluate((node) => node.scrollLeft)).toBe(0);
    await section.getByRole("link").first().focus();
    for (let index = 0; index < 11; index++) await page.keyboard.press("Tab");
    await expect(section.getByRole("link", { name: "DigitalOcean", exact: true })).toBeFocused();
    expect(await rail.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      for (const scale of ["100%", "200%"]) {
        await page.evaluate((value) => {
          document.documentElement.style.fontSize = value;
        }, scale);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        ).toBe(false);
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "";
      });
    }
    const marks = section.locator("img");
    for (const mark of await marks.all()) {
      await expect(mark).toHaveJSProperty("complete", true);
      expect(
        await mark.evaluate((image) => (image as HTMLImageElement).naturalWidth),
      ).toBeGreaterThan(0);
    }
    expect(
      (await new AxeBuilder({ page }).include("[data-tool-carousel]").analyze()).violations,
    ).toEqual([]);
  });

  test(`${locale} additional certifications remain distinct and readable`, async ({
    page,
  }, info) => {
    if (info.project.name === "mobile") await page.setViewportSize({ width: 320, height: 650 });
    await page.goto(`${prefix}/education`);
    await expect(
      page.getByRole("heading", {
        name: locale === "es" ? "Certificaciones adicionales" : "Additional certifications",
        exact: true,
      }),
    ).toBeVisible();
    const list = page.locator("#credentials").locator("../..").getByRole("list");
    await expect(list.getByRole("listitem")).toHaveCount(2);
    for (const scale of ["100%", "200%"]) {
      await page.evaluate((value) => {
        document.documentElement.style.fontSize = value;
      }, scale);
      const first = await list.getByRole("listitem").nth(0).boundingBox();
      const second = await list.getByRole("listitem").nth(1).boundingBox();
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect((second?.y ?? 0) - (first?.y ?? 0) - (first?.height ?? 0)).toBeGreaterThanOrEqual(15);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(
        false,
      );
    }
  });
}

test("concept marks retain an opaque readable surface in the light theme", async ({ page }) => {
  await page.goto("/stack");
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
  });
  const mark = page.locator('[data-representation="illustration"]').first();
  await expect(mark).toBeAttached();
  const colors = await mark.evaluate((node) => {
    const style = getComputedStyle(node);
    return { background: style.backgroundColor, stroke: style.color, outline: style.boxShadow };
  });
  expect(colors.background).toBe("rgb(227, 237, 244)");
  expect(colors.stroke).toBe("rgb(0, 97, 132)");
  expect(colors.outline).not.toBe("none");
});
