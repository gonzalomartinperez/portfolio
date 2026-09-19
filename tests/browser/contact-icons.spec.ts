import { expect, test } from "@playwright/test";

test("contact icons retain circular backgrounds and centered square artwork", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of isMobile ? [320, 390] : [768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/es/contact");
    const footer = page.getByRole("contentinfo");
    const icons = footer.locator("a:has(svg use)");
    await expect(icons).toHaveCount(3);
    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      for (const icon of await icons.all()) {
        const geometry = await icon.evaluate((link) => {
          const chip = link.querySelector("span")?.getBoundingClientRect();
          const artwork = link.querySelector("svg")?.getBoundingClientRect();
          const target = link.getBoundingClientRect();
          return { chip, artwork, target };
        });
        const { chip, artwork, target } = geometry;
        expect(chip).toBeDefined();
        expect(artwork).toBeDefined();
        if (!chip || !artwork) throw new Error("Missing contact icon geometry");
        expect(Math.abs(chip.width - chip.height)).toBeLessThan(0.5);
        expect(Math.abs(artwork.width - artwork.height)).toBeLessThan(0.5);
        expect(Math.abs(chip.x + chip.width / 2 - target.x - target.width / 2)).toBeLessThan(0.5);
        expect(Math.abs(chip.y + chip.height / 2 - target.y - target.height / 2)).toBeLessThan(0.5);
        expect(artwork.width).toBeLessThanOrEqual(chip.width);
        expect(target.width).toBeGreaterThanOrEqual(44);
        expect(target.height).toBeGreaterThanOrEqual(44);
      }
      await footer.scrollIntoViewIfNeeded();
      await footer.screenshot({
        path: test.info().outputPath(`contact-icons-${width}-${theme}.png`),
      });
    }
  }
});
