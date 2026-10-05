import { expect, test } from "@playwright/test";

test("locale navigation reuses the hero GPU context and releases it when leaving Home", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    for (const property of ["width", "height"] as const) {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, property);
      if (!descriptor?.set) throw new Error("Canvas dimensions are unavailable");
      const original = descriptor.set;
      Object.defineProperty(HTMLCanvasElement.prototype, property, {
        ...descriptor,
        set(this: HTMLCanvasElement, value: number) {
          this.dataset.bufferWrites = String(Number(this.dataset.bufferWrites ?? 0) + 1);
          original.call(this, value);
        },
      });
    }
  });
  await page.goto("/");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-mode", "running");
  await page.evaluate(() => scrollTo(0, innerHeight));
  await expect
    .poll(async () => Number(await scene.getAttribute("data-scene-progress")))
    .toBeGreaterThan(0.1);
  await scene.getByRole("button", { name: "Pause animation", exact: true }).click();
  await expect(scene).toHaveAttribute("data-mode", "paused");
  const progress = await scene.getAttribute("data-scene-progress");
  const position = await page.evaluate(() => scrollY);
  const resources = await page.evaluateHandle(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("[data-scene] canvas");
    const context = canvas?.getContext("webgl2");
    if (!canvas || !context) throw new Error("Hero WebGL resources missing");
    const program = context.getParameter(context.CURRENT_PROGRAM) as WebGLProgram | null;
    if (!program) throw new Error("Hero shader program missing");
    const resources = {
      canvas,
      context,
      program,
      bufferWrites: canvas.dataset.bufferWrites,
      deletedPrograms: 0,
    };
    const original = context.deleteProgram.bind(context);
    context.deleteProgram = (program) => {
      resources.deletedPrograms += 1;
      original(program);
    };
    return resources;
  });
  for (const locale of ["es", "en", "es", "en"]) {
    // Native activation avoids Playwright scrolling an offscreen mobile header
    // into view before the navigation whose scroll preservation we are checking.
    await page
      .locator(`header a[hreflang="${locale}"]`)
      .evaluate((link: HTMLAnchorElement) => link.click());
    await expect(page).toHaveURL(locale === "es" ? /\/es$/ : /\/$/);
    await expect(scene).toHaveAttribute("data-mode", "paused");
    await expect(scene).toHaveAttribute("data-scene-progress", progress ?? "");
    expect(await page.evaluate(() => scrollY)).toBe(position);
    expect(
      await resources.evaluate(({ canvas, context, program, bufferWrites, deletedPrograms }) => ({
        sameCanvas: canvas === document.querySelector("[data-scene] canvas"),
        sameContext: canvas.getContext("webgl2") === context,
        sameProgram: context.getParameter(context.CURRENT_PROGRAM) === program,
        bufferUnchanged: canvas.dataset.bufferWrites === bufferWrites,
        deletedPrograms,
      })),
    ).toEqual({
      sameCanvas: true,
      sameContext: true,
      sameProgram: true,
      bufferUnchanged: true,
      deletedPrograms: 0,
    });
  }
  const extension = await resources.evaluateHandle(({ context }) =>
    context.getExtension("WEBGL_lose_context"),
  );
  expect(await extension.evaluate((value) => Boolean(value))).toBe(true);
  await extension.evaluate((value) => value?.loseContext());
  await expect(scene).toHaveAttribute("data-mode", "static");
  await extension.evaluate((value) => value?.restoreContext());
  await expect(scene).toHaveAttribute("data-mode", "paused");
  await extension.dispose();
  const deletedBeforeDeparture = await resources.evaluate((resources) => resources.deletedPrograms);
  await page.locator('header a[href="/work"]').click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(scene).toHaveCount(0);
  await expect
    .poll(() => resources.evaluate((resources) => resources.deletedPrograms))
    .toBeGreaterThan(deletedBeforeDeparture);
  expect(await resources.evaluate(({ canvas }) => canvas.isConnected)).toBe(false);
  await page.locator('header a[href="/"]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(scene).toHaveAttribute("data-mode", "paused");
  expect(
    await resources.evaluate(
      ({ canvas }) => canvas === document.querySelector("[data-scene] canvas"),
    ),
  ).toBe(false);
  await resources.dispose();
});
