import { expect, test } from "@playwright/test";

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
      start: journey.getBoundingClientRect().top + scrollY,
      distance: journey.offsetHeight - viewport.offsetHeight,
    };
  });
  const move = async (progress: number) => {
    await page.evaluate(
      ({ start, distance, progress }) => scrollTo(0, start + distance * progress),
      { ...geometry, progress },
    );
    await expect
      .poll(async () =>
        Math.abs(Number(await scene.getAttribute("data-scene-progress")) - progress),
      )
      .toBeLessThan(0.002);
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
  await scene.dispatchEvent("pointerdown", {
    pointerType: "touch",
    pointerId: 1,
    clientX: 180,
    clientY: 550,
  });
  await scene.dispatchEvent("pointerup", {
    pointerType: "touch",
    pointerId: 1,
    clientX: 180,
    clientY: 550,
  });
  await expect(scene).toHaveAttribute("data-scene-tap", "1");
  await scene.dispatchEvent("pointerdown", {
    pointerType: "touch",
    pointerId: 2,
    clientX: 180,
    clientY: 550,
  });
  await scene.dispatchEvent("pointerup", {
    pointerType: "touch",
    pointerId: 2,
    clientX: 180,
    clientY: 450,
  });
  await expect(scene).toHaveAttribute("data-scene-tap", "1");
  await scene.dispatchEvent("pointerdown", {
    pointerType: "touch",
    pointerId: 3,
    clientX: 180,
    clientY: 550,
  });
  await scene.dispatchEvent("pointermove", {
    pointerType: "touch",
    pointerId: 3,
    clientX: 180,
    clientY: 450,
  });
  await scene.dispatchEvent("pointerup", {
    pointerType: "touch",
    pointerId: 3,
    clientX: 180,
    clientY: 550,
  });
  await expect(scene).toHaveAttribute("data-scene-tap", "1");
});
