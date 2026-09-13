import { expect, test } from "@playwright/test";

for (const route of ["/", "/about"]) {
  test(`${route} portrait has a distinct frame in both themes`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    const portrait = page.locator('main img[src*="portrait."]');
    await portrait.scrollIntoViewIfNeeded();
    await expect(portrait).toHaveJSProperty("complete", true);
    await expect(portrait).toHaveCSS("background-image", "none");
    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      const appearance = await portrait.evaluate((image) => {
        const frame = image.parentElement;
        if (!frame) throw new Error("Portrait frame missing");
        const style = getComputedStyle(frame);
        return {
          border: Number.parseFloat(style.borderTopWidth),
          padding: Number.parseFloat(style.paddingTop),
          background: style.backgroundImage,
          mask: getComputedStyle(image).maskImage,
        };
      });
      expect(appearance.border).toBeGreaterThanOrEqual(1);
      expect(appearance.padding).toBeGreaterThanOrEqual(8);
      expect(appearance.background).not.toBe("none");
      expect(appearance.mask).toBe("none");
      const resolution = await portrait.evaluate((image) => {
        const photo = image as HTMLImageElement;
        return {
          natural: photo.naturalWidth,
          required: photo.getBoundingClientRect().width * devicePixelRatio,
        };
      });
      expect(resolution.natural).toBe(1254);
      expect(resolution.natural).toBeGreaterThanOrEqual(resolution.required);
      await portrait.locator("..").screenshot({ path: info.outputPath(`portrait-${theme}.png`) });
    }
  });
}
