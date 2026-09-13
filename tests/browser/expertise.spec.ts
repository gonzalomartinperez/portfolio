import { expect, test } from "@playwright/test";
import { filomenaGallery } from "../../src/content/filomena-gallery";
import { certificateFiles } from "../../src/content/site-config";

test("reviewed gallery screens remain available across filters and certificate files open", async ({
  page,
  request,
}) => {
  for (const route of ["/work/filomena", "/es/work/filomena"]) {
    await page.goto(route);
    const images = page.locator('main a[href^="/filomena/"]');
    await expect(images).toHaveCount(filomenaGallery.length);
    for (const image of await images.all()) {
      await expect(image.locator("img")).toHaveAttribute("alt", /\S+/);
      const response = await request.get((await image.getAttribute("href")) as string);
      expect(response.ok()).toBe(true);
    }
    const filters = page.locator("fieldset button");
    const covered = new Set<string>();
    for (let index = 1; index < (await filters.count()); index++) {
      await filters.nth(index).click();
      for (const href of await images.evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? ""),
      )) {
        expect(covered.has(href)).toBe(false);
        covered.add(href);
      }
    }
    expect(covered.size).toBe(filomenaGallery.length);
  }
  for (const route of ["/education", "/es/education"]) {
    await page.goto(route);
    for (const file of Object.values(certificateFiles)) {
      await expect(page.locator(`main a[href="${file.href}"]`)).toBeVisible();
      const response = await request.get(file.href);
      expect(response.ok()).toBe(true);
      expect(response.headers()["content-type"]).toContain(
        file.format === "PDF" ? "application/pdf" : "image/png",
      );
    }
  }
});

for (const [route, label] of [
  ["/", "In development"],
  ["/es", "En consolidación"],
]) {
  test(`${route} home chips separate status from the technology name`, async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(route);
    const chips = page.getByText(label, { exact: true });
    expect(await chips.count()).toBeGreaterThan(0);
    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      await chips.first().scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath(`expertise-${theme}.png`) });
      for (const chip of await chips.all()) {
        const metrics = await chip.evaluate((element) => {
          const box = element.getBoundingClientRect();
          const parent = element.parentElement?.getBoundingClientRect();
          const identity = element.previousElementSibling?.getBoundingClientRect();
          return {
            gap: box.top - (identity?.bottom ?? box.top),
            fits: box.left >= (parent?.left ?? 0) && box.right <= (parent?.right ?? innerWidth),
            unclipped: element.scrollWidth <= element.clientWidth + 1,
          };
        });
        expect(metrics.fits).toBe(true);
        expect(metrics.unclipped).toBe(true);
        expect(metrics.gap).toBeGreaterThanOrEqual(3);
      }
    }
  });
}

test("the scene shows Spring once while the catalogue keeps every tool", async ({ page }) => {
  await page.goto("/?sceneProgress=0.75&sceneTime=0");
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
  await expect(page.locator('.scene-logo [data-scene-brand="spring"]')).toHaveCount(1);
  for (const name of [
    "Spring Boot",
    "Spring WebFlux",
    "Spring MVC",
    "Spring Security",
    "Spring Data JPA",
  ]) {
    await expect(page.getByRole("link", { name, exact: true })).toHaveCount(1);
  }
});

test("mobile contact preserves the email domain and a recognizable header avatar", async ({
  page,
}, info) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/contact");
    const avatar = await page.locator("header img").boundingBox();
    expect(avatar?.width).toBeGreaterThanOrEqual(44);
    expect(avatar?.height).toBeGreaterThanOrEqual(44);
    const email = page.locator('main a[href^="mailto:"]');
    const domain = email.getByText("@gmail.com", { exact: true });
    await expect(domain).toBeVisible();
    expect(await domain.evaluate((element) => element.getClientRects().length)).toBe(1);
    const bounds = await email.boundingBox();
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await email.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`contact-${width}.png`) });
  }
});

test("education shows the official UNS identity and filters retain native controls", async ({
  page,
}) => {
  await page.goto("/education");
  await expect(
    page.getByRole("img", { name: "Universidad Nacional del Sur", exact: true }),
  ).toBeVisible();
  await page.goto("/stack");
  const category = page.getByRole("combobox", { name: "Category", exact: true });
  await category.selectOption("fintech");
  await expect(page.locator("#fintech")).toBeVisible();
  await category.focus();
  expect(
    await category.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
  ).toBeGreaterThanOrEqual(16);
});
