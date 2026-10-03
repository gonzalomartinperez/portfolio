import { expect, test } from "@playwright/test";
import { dispatchTouchSequence } from "./touch-sequence";

for (const { prefix, theme } of [
  { prefix: "", theme: "dark" },
  { prefix: "", theme: "light" },
  { prefix: "/es", theme: "dark" },
  { prefix: "/es", theme: "light" },
]) {
  test(`${prefix || "en"} ${theme} hero availability remains clear above the resting sphere`, async ({
    page,
    isMobile,
  }) => {
    await page.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
    for (const height of isMobile ? [650, 844] : [866, 1080]) {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.setViewportSize({ width: isMobile ? 393 : 1760, height });
      await page.goto(`${prefix || "/"}?sceneProgress=0&sceneTime=0`);
      const scene = page.locator("[data-scene]");
      await expect(scene).toHaveAttribute("data-mode", "running");
      await page.evaluate(() => document.fonts.ready);
      const geometry = () =>
        scene.evaluate((element) => {
          const viewport = element.querySelector<HTMLElement>("[data-scene-viewport]");
          const hero = element.querySelector<HTMLElement>("[data-scene-hero]");
          const core = element.querySelector<HTMLElement>("[data-scene-core]");
          if (!viewport || !hero || !core) throw new Error("Scene geometry is missing");
          const bounds = core.getBoundingClientRect();
          const radius = Number.parseFloat(
            viewport.style.getPropertyValue("--scene-sphere-radius"),
          );
          return {
            heroBottom: hero.getBoundingClientRect().bottom,
            sphereTop: bounds.top + bounds.height / 2 - radius,
            sphereBottom: bounds.top + bounds.height / 2 + radius,
            viewportBottom: Math.min(viewport.getBoundingClientRect().bottom, innerHeight),
          };
        });
      await expect
        .poll(async () => {
          const bounds = await geometry();
          return (
            bounds.sphereTop >= bounds.heroBottom + 20 &&
            bounds.sphereBottom <= bounds.viewportBottom - 20
          );
        })
        .toBe(true);
      const availability = scene.locator("[data-scene-hero] p").last();
      await expect(availability).toBeVisible();
      const spans = await availability.locator("span:not([aria-hidden])").evaluateAll((elements) =>
        elements.map((element) => ({
          top: element.getBoundingClientRect().top,
          bottom: element.getBoundingClientRect().bottom,
        })),
      );
      expect(spans).toHaveLength(2);
      if (isMobile) {
        expect(spans[1].top).toBeGreaterThanOrEqual(spans[0].bottom);
        await expect(availability.locator("span[aria-hidden]").first()).not.toBeVisible();
      } else {
        expect(Math.abs(spans[0].top - spans[1].top)).toBeLessThan(1);
        await expect(availability.locator("span[aria-hidden]").first()).toBeVisible();
      }
      await scene.screenshot({ path: test.info().outputPath(`hero-${height}-${theme}.png`) });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(scene).toHaveAttribute("data-mode", "static");
      const fallback = await scene.locator("svg").first().boundingBox();
      const hero = await scene.locator("[data-scene-hero]").boundingBox();
      expect(fallback).not.toBeNull();
      expect(hero).not.toBeNull();
      if (fallback && hero) expect(fallback.y).toBeGreaterThanOrEqual(hero.y + hero.height + 20);
    }
  });
}

for (const prefix of ["", "/es"]) {
  test(`${prefix || "en"} mobile hero actions use available width and reflow safely`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 844 });
    await page.goto(`${prefix || "/"}?sceneProgress=0&sceneTime=0`);
    const actions = page.locator("[data-scene-hero] a");
    const first = await actions.first().boundingBox();
    const second = await actions.last().boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    if (first && second) {
      expect(Math.abs(first.y - second.y)).toBeLessThan(1);
      expect(first.height).toBeGreaterThanOrEqual(44);
      expect(second.height).toBeGreaterThanOrEqual(44);
      expect(Math.abs((first.x + second.x + second.width) / 2 - 393 / 2)).toBeLessThan(9);
    }
    await page.setViewportSize({ width: 320, height: 650 });
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await expect(actions.first()).toBeVisible();
    await expect(actions.last()).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      .toBe(true);
  });
}

test("scene mounting preserves an already focused hero link", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?sceneProgress=0.75&sceneTime=0");
  const scene = page.locator("[data-scene]");
  const hero = scene.locator("[data-scene-hero]");
  const link = hero.locator("a").first();
  await link.focus();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(scene).toHaveAttribute("data-mode", "running");
  await expect(link).toBeFocused();
  await expect(hero).toHaveCSS("opacity", "1");
  await expect(hero).toHaveCSS("transform", "none");
});

test("focused hero links remain readable while the scene is expanded", async ({ page }) => {
  await page.goto("/?sceneProgress=0.75&sceneTime=0");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-mode", "running");
  const hero = scene.locator("[data-scene-hero]");
  await expect(hero).toHaveCSS("opacity", "0");
  await hero.locator("a").first().focus();
  await expect(hero).toHaveCSS("opacity", "1");
  await expect(hero).toHaveCSS("transform", "none");
  await page.getByRole("button", { name: "Pause animation", exact: true }).focus();
  await expect(hero).toHaveCSS("opacity", "0");
});

test("twenty rapid reversals retain deterministic logo positions and a single canvas", async ({
  page,
}) => {
  await page.goto("/");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-mode", "running");
  const geometry = await scene.evaluate((element) => {
    const journey = element.querySelector<HTMLElement>("[data-scene-journey]");
    const viewport = element.querySelector<HTMLElement>("[data-scene-viewport]");
    if (!journey || !viewport) throw new Error("Scene geometry is missing");
    return {
      start: Math.round(journey.getBoundingClientRect().top + scrollY),
      distance:
        journey.offsetHeight -
        viewport.offsetHeight -
        Number.parseFloat(journey.style.getPropertyValue("--scene-reading-hold") || "0"),
    };
  });
  const move = async (progress: number) => {
    const target = await page.evaluate(
      ({ start, distance, progress }) => {
        scrollTo({ top: start + distance * progress, behavior: "instant" });
        return Math.max(0, Math.min(1, (scrollY - start) / distance));
      },
      { ...geometry, progress },
    );
    // Compare settled states, accounting for the browser's integer scroll position.
    await expect
      .poll(async () => Math.abs(Number(await scene.getAttribute("data-scene-progress")) - target))
      .toBeLessThan(0.0001);
  };
  const positions = () =>
    scene.locator(".scene-logo").evaluateAll((elements) =>
      elements.map((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, left: style.left, top: style.top };
      }),
    );
  const forward = new Map<number, Awaited<ReturnType<typeof positions>>>();
  for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
    await move(progress);
    const current = await positions();
    const initial = forward.get(0);
    if (initial)
      current.forEach((position, index) => {
        expect(position.left).toBe(initial[index].left);
        expect(position.top).toBe(initial[index].top);
      });
    forward.set(progress, current);
  }
  await page.evaluate(async ({ start, distance }) => {
    for (let index = 0; index < 20; index += 1) {
      scrollTo(0, start + distance * (index % 2));
      await new Promise(requestAnimationFrame);
    }
  }, geometry);
  for (const progress of [1, 0.75, 0.5, 0.25, 0]) {
    await move(progress);
    const before = forward.get(progress) ?? [];
    const after = await positions();
    expect(after.length).toBe(before.length);
    after.forEach((position, index) => {
      expect(Math.abs(position.x - before[index].x)).toBeLessThan(5);
      expect(Math.abs(position.y - before[index].y)).toBeLessThan(5);
      expect(position.left).toBe(before[index].left);
      expect(position.top).toBe(before[index].top);
    });
  }
  await expect(scene.locator("canvas")).toHaveCount(1);
  const brands = await scene
    .locator(".scene-logo [data-tech-icon]")
    .evaluateAll((elements) =>
      elements.map(
        (element) =>
          (element as HTMLElement).dataset.sceneBrand ?? (element as HTMLElement).dataset.techIcon,
      ),
    );
  expect(new Set(brands).size).toBe(brands.length);
});

test("touch impulses ignore scrolling gestures", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Touch interaction is a mobile enhancement");
  await page.goto("/");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-mode", "running");
  await dispatchTouchSequence(scene, [{ type: "pointerdown" }, { type: "pointerup" }]);
  await expect(scene).toHaveAttribute("data-scene-tap", "1");
  await dispatchTouchSequence(scene, [
    { type: "pointerdown", pointerId: 2 },
    { type: "pointerup", pointerId: 2, clientY: 450 },
  ]);
  await expect(scene).toHaveAttribute("data-scene-tap", "1");
  await dispatchTouchSequence(scene, [
    { type: "pointerdown", pointerId: 3 },
    { type: "pointermove", pointerId: 3, clientY: 450 },
    { type: "pointerup", pointerId: 3 },
  ]);
  await expect(scene).toHaveAttribute("data-scene-tap", "1");
});
