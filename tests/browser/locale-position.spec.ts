import { expect, test } from "@playwright/test";

for (const { route, progress } of [
  { route: "/", progress: 0.15 },
  { route: "/", progress: 0.5 },
  { route: "/", progress: 1 },
  { route: "/work", progress: null },
]) {
  test(`${route} at ${progress ?? "content"} preserves position when changing theme and language`, async ({
    page,
  }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    if (progress !== null) {
      await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
    }
    await page.evaluate((progress) => {
      const journey = document.querySelector<HTMLElement>("[data-scene-journey]");
      const viewport = document.querySelector<HTMLElement>("[data-scene-viewport]");
      const top =
        journey && viewport && progress !== null
          ? Math.round(journey.getBoundingClientRect().top + scrollY) +
            progress *
              (journey.offsetHeight -
                viewport.offsetHeight -
                Number.parseFloat(journey.style.getPropertyValue("--scene-reading-hold") || "0"))
          : 900;
      scrollTo({ top, behavior: "instant" });
    }, progress);
    const position = await page.evaluate(() => scrollY);
    // Activate without Playwright first scrolling the offscreen mobile header into view.
    await page.locator("header button").evaluate((button) => (button as HTMLButtonElement).click());
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(position);
    await page
      .locator('header a[hreflang="es"]')
      .evaluate((link) => (link as HTMLAnchorElement).click());
    await expect(page).toHaveURL(route === "/" ? /\/es$/ : /\/es\/work$/);
    await page.evaluate(() => document.fonts.ready);
    if (progress !== null) {
      await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
    }
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(position);
    await page
      .locator('header a[hreflang="en"]')
      .evaluate((link) => (link as HTMLAnchorElement).click());
    await expect(page).toHaveURL(route === "/" ? /\/$/ : /\/work$/);
    if (progress !== null) {
      await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
    }
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(position);
  });
}
