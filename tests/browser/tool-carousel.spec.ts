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
    const labels = await section.locator("[data-tool-id] a").evaluateAll((links) =>
      links.map((link) => {
        const label = link.lastElementChild;
        if (!label) throw new Error("A carousel card is missing its label");
        const card = link.getBoundingClientRect();
        const text = label.getBoundingClientRect();
        const style = getComputedStyle(label);
        return {
          height: card.height,
          lines: text.height / Number.parseFloat(style.lineHeight),
          fits: text.left >= card.left && text.right <= card.right,
        };
      }),
    );
    for (const label of labels) {
      expect(label.height).toBeLessThanOrEqual(info.project.name === "mobile" ? 65 : 73);
      expect(label.lines).toBeLessThanOrEqual(1.05);
      expect(label.fits).toBe(true);
    }
    const positions = () =>
      rows.evaluateAll((elements) =>
        elements.map((element) => {
          const tile = element.querySelector("li");
          return tile ? new DOMMatrixReadOnly(getComputedStyle(tile).transform).m41 : 0;
        }),
      );
    await expect.poll(async () => Math.abs((await positions())[0])).toBeGreaterThan(0.1);
    const cycleWidths = await rows.evaluateAll((elements) =>
      elements.map((element) => {
        const list = element.querySelector("ul");
        return list ? list.offsetWidth + Number.parseFloat(getComputedStyle(list).columnGap) : 0;
      }),
    );
    const before = await positions();
    await page.waitForTimeout(350);
    const after = await positions();
    const movement = after.map((offset, index) => {
      const cycleWidth = cycleWidths[index];
      expect(cycleWidth).toBeGreaterThan(0);
      const shift = offset - before[index];
      return shift - Math.round(shift / cycleWidth) * cycleWidth;
    });
    expect(movement[0]).toBeLessThan(0);
    expect(movement[1]).toBeGreaterThan(0);
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
    const header = await page.locator("header").boundingBox();
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.getBoundingClientRect().top ?? -1))
      .toBeGreaterThan((header?.height ?? 0) + 8);
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

test("carousel keeps both rows filled through multiple complete cycles", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  if (info.project.name === "mobile") await page.setViewportSize({ width: 320, height: 650 });
  await page.goto("/?carouselDebug=1");
  const section = page.locator("[data-tool-carousel]");
  await section.scrollIntoViewIfNeeded();
  await section.getByRole("button").click();
  const rows = section.locator("[data-tool-row]");
  await expect
    .poll(() =>
      rows
        .first()
        .evaluate(
          (node) =>
            typeof (node as HTMLDivElement & { setCarouselDebugProgress?: unknown })
              .setCarouselDebugProgress,
        ),
    )
    .toBe("function");
  for (const cycles of [0, 0.25, 0.5, 0.75, 0.99999, 1, 1.5, 1.99999, 2, 3]) {
    const coverage = await rows.evaluateAll(
      (elements, progress) =>
        elements.map((node) => {
          const row = node as HTMLDivElement & { setCarouselDebugProgress(cycles: number): void };
          row.setCarouselDebugProgress(progress);
          const bounds = row.getBoundingClientRect();
          const visible = Array.from(row.querySelectorAll("li"))
            .map((tile) => tile.getBoundingClientRect())
            .filter((tile) => tile.right > bounds.left && tile.left < bounds.right)
            .sort((a, b) => a.left - b.left);
          const first = visible[0];
          const last = visible.at(-1);
          if (!first || !last) throw new Error("A carousel row has no visible tiles");
          return {
            leftGap: first.left - bounds.left,
            rightGap: bounds.right - last.right,
            gaps: visible.slice(1).map((tile, index) => tile.left - visible[index].right),
            overflow: Array.from(row.querySelectorAll("a")).map((tile) => {
              const label = tile.lastElementChild;
              if (!label) throw new Error("A carousel tile has no visible label");
              const text = label.getBoundingClientRect();
              const card = tile.getBoundingClientRect();
              const padding = Number.parseFloat(getComputedStyle(tile).paddingTop) + 1;
              return Math.max(card.top + padding - text.top, text.bottom - card.bottom + padding);
            }),
          };
        }),
      cycles,
    );
    for (const row of coverage) {
      expect(row.leftGap).toBeLessThanOrEqual(13);
      expect(row.rightGap).toBeLessThanOrEqual(13);
      for (const gap of row.gaps) {
        expect(gap).toBeGreaterThanOrEqual(11);
        expect(gap).toBeLessThanOrEqual(13);
      }
      for (const overflow of row.overflow) expect(overflow).toBeLessThanOrEqual(0);
    }
  }
});
