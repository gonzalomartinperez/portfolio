import { expect, test } from "@playwright/test";

test("journey-only resizing does not reallocate the unchanged drawing buffer", async ({ page }) => {
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
  await page.getByRole("button", { name: "Pause animation", exact: true }).click();
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
  const canvas = scene.locator("canvas");
  const writes = await canvas.getAttribute("data-buffer-writes");
  expect(Number(writes)).toBeGreaterThan(0);
  await scene.locator("[data-scene-journey]").evaluate(async (journey: HTMLElement) => {
    journey.style.height = `${journey.offsetHeight + 10}px`;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
  await expect(canvas).toHaveAttribute("data-buffer-writes", writes ?? "");
});

test("wide touch screens release tap impulses and reject secondary-pointer gestures", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-mode", "running");
  const primary = {
    pointerType: "touch",
    isPrimary: true,
    pointerId: 1,
    clientX: 500,
    clientY: 550,
  };
  await scene.dispatchEvent("pointerdown", primary);
  await scene.dispatchEvent("pointerup", primary);
  await expect(scene).toHaveAttribute("data-scene-tap", "1");
  const pointerX = () =>
    scene.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
      const gl = canvas.getContext("webgl2");
      const program = gl?.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram | null;
      if (!gl || !program) throw new Error("The scene program is unavailable");
      const location = gl.getUniformLocation(program, "pointer");
      if (!location) throw new Error("The pointer uniform is unavailable");
      return (gl.getUniform(program, location) as Float32Array)[0];
    });
  await expect.poll(pointerX).toBeLessThan(5);
  await expect.poll(pointerX).toBeGreaterThan(9);
  await scene.dispatchEvent("pointerdown", primary);
  await scene.dispatchEvent("pointerdown", { ...primary, pointerId: 2, isPrimary: false });
  await scene.dispatchEvent("pointerup", primary);
  await scene.dispatchEvent("pointerup", { ...primary, pointerId: 2, isPrimary: false });
  await expect(scene).toHaveAttribute("data-scene-tap", "1");
});
