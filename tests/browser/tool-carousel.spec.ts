import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { publicTechnologyCatalog } from "../../src/content/technologies";

for (const locale of ["en", "es"]) {
  const prefix = locale === "es" ? "/es" : "";
  test(`${locale} carousel exposes the complete catalog without duplicate accessible links`, async ({
    page,
  }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (info.project.name === "mobile") await page.setViewportSize({ width: 320, height: 650 });
    await page.goto(prefix || "/");
    const section = page.locator("[data-tool-carousel]");
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator("[data-tool-row]")).toHaveCount(2);
    await expect(section).toHaveAttribute("data-animated", "false");
    const ids = await section
      .locator("[data-tool-id]")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-tool-id")));
    expect(ids.length).toBe(publicTechnologyCatalog.length);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(publicTechnologyCatalog.map((tool) => tool.id).sort());
    await expect(section.getByRole("button")).toHaveCount(0);
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
      await mark.scrollIntoViewIfNeeded();
      await expect(mark).toHaveJSProperty("complete", true);
      expect(
        await mark.evaluate((image) => (image as HTMLImageElement).naturalWidth),
      ).toBeGreaterThan(0);
    }
    expect(
      (await new AxeBuilder({ page }).include("[data-tool-carousel]").analyze()).violations,
    ).toEqual([]);
  });

  test(`${locale} carousel moves in opposite directions and pauses accessibly`, async ({
    page,
  }, info) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(prefix || "/");
    const section = page.locator("[data-tool-carousel]");
    await expect(section).toHaveAttribute("data-animated", "true");
    await section.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const rows = section.locator("[data-tool-row]");
    await expect(rows.nth(0)).toHaveAttribute("data-motion", "running");
    await expect(rows.nth(1)).toHaveAttribute("data-motion", "running");
    const positions = () =>
      rows.evaluateAll((elements) =>
        elements.map((element) => {
          const tile = element.querySelector("li");
          return tile ? new DOMMatrixReadOnly(getComputedStyle(tile).transform).m41 : 0;
        }),
      );
    await expect.poll(async () => Math.abs((await positions())[0])).toBeGreaterThan(0.1);
    const before = await positions();
    await page.waitForTimeout(350);
    const after = await positions();
    expect(after[0]).toBeLessThan(before[0]);
    expect(after[1]).toBeGreaterThan(before[1]);
    const pause = section.getByRole("button", {
      name: locale === "es" ? "Pausar tecnologías" : "Pause technologies",
    });
    await pause.click();
    await expect(rows.nth(0)).toHaveAttribute("data-motion", "paused");
    const pausedPositions = await positions();
    await page.waitForTimeout(200);
    expect(await positions()).toEqual(pausedPositions);
    await section.getByRole("button").click();
    await page.mouse.move(0, 0);
    await expect(rows.nth(0)).toHaveAttribute("data-motion", "running");
    if (info.project.name !== "mobile") {
      await rows.nth(0).hover();
      await expect(rows.nth(0)).toHaveAttribute("data-motion", "paused");
      await expect(rows.nth(1)).toHaveAttribute("data-motion", "running");
      await page.mouse.move(0, 0);
    }
    await section.getByRole("button").focus();
    await page.keyboard.press("Tab");
    await expect(section).toHaveAttribute("data-animated", "false");
    const firstLink = section.locator("[data-tool-id] a").first();
    await expect(firstLink).toBeFocused();
    const lastLink = section.locator("[data-tool-id] a").last();
    await lastLink.focus();
    await expect(lastLink).toBeInViewport();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(section).toHaveAttribute("data-animated", "true");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(section).toHaveAttribute("data-animated", "false");
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

test("carousel preserves its complete linked catalog without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const section = page.locator("[data-tool-carousel]");
    expect(
      await section
        .locator("ul")
        .first()
        .evaluate((node) => getComputedStyle(node).display),
    ).toBe("grid");
    await expect(section.locator("[data-tool-id] a")).toHaveCount(publicTechnologyCatalog.length);
    await expect(section.getByRole("button")).toHaveCount(0);
    const last = section.locator("[data-tool-id] a").last();
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  } finally {
    await context.close();
  }
});

test("carousel suspends work when hidden or offscreen and respects global pause", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const section = page.locator("[data-tool-carousel]");
  const row = section.locator("[data-tool-row]").first();
  await section.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(row).toHaveAttribute("data-motion", "running");
  await row.dispatchEvent("pointerdown", { pointerType: "touch" });
  await expect(row).toHaveAttribute("data-motion", "paused");
  await row.dispatchEvent("pointercancel", { pointerType: "touch" });
  await expect(row).toHaveAttribute("data-motion", "running");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(row).toHaveAttribute("data-motion", "paused");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(row).toHaveAttribute("data-motion", "running");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(row).toHaveAttribute("data-motion", "paused");
  await page.locator("[data-motion-toggle]").click();
  await section.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(row).toHaveAttribute("data-motion", "paused");
  await page.locator("[data-motion-toggle]").click();
  await section.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(row).toHaveAttribute("data-motion", "running");
});
