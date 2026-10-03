import { expect, test } from "@playwright/test";

for (const prefix of ["", "/es"]) {
  test(`${prefix || "en"} mobile header, actions and technology chips stay balanced`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(prefix || "/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("button", { name: /Ask AI|Preguntar/, exact: true })).toHaveCount(
      0,
    );
    await expect(page.locator('[data-featured-project="filomena"]')).toHaveCount(1);
    for (const role of ["rampy", "teamcubation", "cooperativa-obrera"]) {
      await expect(page.locator(`main a[href="${prefix}/work#${role}"]`)).toHaveCount(1);
    }
    for (const width of [320, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      const geometry = await page.locator("header").evaluate((header) => {
        const required = (selector: string) => {
          const element = header.querySelector(selector);
          if (!element) throw new Error(`Missing header element: ${selector}`);
          return element;
        };
        const brand = required('a[href="/"], a[href="/es"]').getBoundingClientRect();
        const theme = required("button").getBoundingClientRect();
        const languageNav = required('a[hreflang="en"]').closest("nav");
        if (!languageNav) throw new Error("Missing language navigation");
        const language = languageNav.getBoundingClientRect();
        const nav = required(
          'nav[aria-label="Main"], nav[aria-label="Principal"]',
        ).getBoundingClientRect();
        return {
          brandRight: brand.right,
          brandCenter: brand.top + brand.height / 2,
          themeCenter: theme.top + theme.height / 2,
          languageLeft: language.left,
          languageCenter: language.top + language.height / 2,
          rowBottom: Math.max(brand.bottom, theme.bottom, language.bottom),
          navTop: nav.top,
        };
      });
      expect(Math.abs(geometry.brandCenter - geometry.themeCenter)).toBeLessThan(1);
      expect(Math.abs(geometry.languageCenter - geometry.themeCenter)).toBeLessThan(1);
      expect(geometry.brandRight).toBeLessThanOrEqual(geometry.languageLeft);
      expect(geometry.navTop).toBeGreaterThanOrEqual(geometry.rowBottom);
      const chips = await page.locator('a[href*="/stack#tech-"]').evaluateAll((links) =>
        links.map((link) => ({
          height: link.getBoundingClientRect().height,
          mark: !!link.querySelector("img,svg"),
        })),
      );
      expect(chips.length).toBeGreaterThan(35);
      expect(
        Math.max(...chips.map((chip) => chip.height)) -
          Math.min(...chips.map((chip) => chip.height)),
      ).toBeLessThan(1);
      expect(chips.every((chip) => chip.mark)).toBe(true);
      const actions = await page.locator("main .actions").evaluateAll((groups) =>
        groups.map((group) => {
          const children = [...group.children].map((child) => child.getBoundingClientRect());
          const bounds = group.getBoundingClientRect();
          return (
            children.every(
              (child) =>
                Math.abs(child.left + child.width / 2 - (bounds.left + bounds.width / 2)) < 1,
            ) ||
            Math.abs(
              Math.min(...children.map((child) => child.left)) +
                (Math.max(...children.map((child) => child.right)) -
                  Math.min(...children.map((child) => child.left))) /
                  2 -
                (bounds.left + bounds.width / 2),
            ) < 1
          );
        }),
      );
      expect(actions.every(Boolean)).toBe(true);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
    }
  });
}
