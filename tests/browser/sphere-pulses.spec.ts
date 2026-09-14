import { expect, test } from "@playwright/test";
import { dispatchTouchSequence } from "./touch-sequence";

test("sphere and avatar have distinct bounded pulses without changing scroll progress", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.goto("/");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-mode", "running");
  await page.clock.pauseAt(new Date("2026-01-01T01:00:00Z"));
  const avatar = scene.getByRole("button", { name: "Interact with Gonzalo’s avatar" });
  const position = await avatar.boundingBox();
  if (!position) throw new Error("Avatar is missing");
  const x = position.x + position.width / 2 + 60;
  const y = position.y + position.height / 2;
  await dispatchTouchSequence(scene, [
    { type: "pointerdown", clientX: x, clientY: y },
    { type: "pointerup", clientX: x, clientY: y },
  ]);
  await expect(scene).toHaveAttribute("data-scene-pulse", "sphere");
  await expect(scene.locator("canvas")).toHaveCSS("z-index", "3");
  await expect(scene.locator("canvas")).toHaveCSS("pointer-events", "none");
  await page.clock.runFor(300);
  const uniform = (name: string) =>
    scene.locator("canvas").evaluate((canvas: HTMLCanvasElement, name) => {
      const gl = canvas.getContext("webgl2");
      const program = gl?.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram | null;
      if (!gl || !program) throw new Error("Scene program is missing");
      const location = gl.getUniformLocation(program, name);
      if (!location) throw new Error(`Missing ${name} uniform`);
      return gl.getUniform(program, location) as number;
    }, name);
  expect(await uniform("pulsePhase")).toBeGreaterThan(0.2);
  expect(await uniform("avatarPulse")).toBe(0);
  await page.clock.runFor(600);
  await expect(scene).toHaveAttribute("data-scene-pulse", "idle");
  await expect(scene.locator("canvas")).toHaveCSS("z-index", "auto");
  await avatar.focus();
  await avatar.press("Enter");
  await page.clock.runFor(350);
  await expect(scene).toHaveAttribute("data-scene-pulse", "avatar");
  await expect(scene.locator("canvas")).toHaveCSS("z-index", "3");
  const heroLink = scene.locator("[data-scene-hero] a").first();
  expect(
    await heroLink.evaluate((link) => {
      const bounds = link.getBoundingClientRect();
      return link.contains(
        document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2),
      );
    }),
  ).toBe(true);
  expect(await uniform("avatarPulse")).toBe(1);
  await expect(scene.locator("[data-scene-avatar-art]")).not.toHaveCSS("transform", "none");
  for (let index = 0; index < 5; index += 1) await avatar.press("Enter");
  await expect(scene).toHaveAttribute("data-scene-pulse-count", "2");
  await expect(scene).toHaveAttribute("data-scene-progress", "0.0000");
  await page.screenshot({ path: test.info().outputPath("avatar-pulse.png") });
  await page.clock.runFor(1100);
  await expect(scene).toHaveAttribute("data-scene-pulse", "idle");
  await expect(scene.locator("[data-scene-avatar-art]")).toHaveCSS("transform", "none");
  await expect(scene.locator("canvas")).toHaveCSS("z-index", "auto");
  await avatar.press("Space");
  await expect(scene).toHaveAttribute("data-scene-pulse-count", "3");
});

test("real pointer activation works on avatar and the sphere shows a hand only inside", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-mode", "running");
  const avatar = scene.locator("[data-scene-avatar]");
  const box = await avatar.boundingBox();
  if (!box) throw new Error("Avatar is missing");
  if (!isMobile) {
    await page.mouse.move(box.x + box.width + 20, box.y + box.height / 2);
    await expect(scene.locator("[data-scene-viewport]")).toHaveCSS("cursor", "pointer");
    await page.mouse.move(2, box.y + box.height / 2);
    await expect(scene.locator("[data-scene-viewport]")).not.toHaveCSS("cursor", "pointer");
    await page.mouse.click(box.x + box.width + 20, box.y + box.height / 2);
    await expect(scene).toHaveAttribute("data-scene-pulse", "sphere");
    await expect(scene).toHaveAttribute("data-scene-pulse", "idle");
    await avatar.click();
  } else {
    await avatar.tap();
  }
  await expect(scene).toHaveAttribute("data-scene-pulse", "avatar");
  await expect(scene).toHaveAttribute("data-scene-pulse-count", isMobile ? "1" : "2");
});

test("drag, outside taps, secondary pointers and paused activation do not pulse", async ({
  page,
}) => {
  await page.goto("/");
  const scene = page.locator("[data-scene]");
  await expect(scene).toHaveAttribute("data-mode", "running");
  const avatar = scene.locator("[data-scene-avatar]");
  const box = await avatar.boundingBox();
  if (!box) throw new Error("Avatar is missing");
  const point = { clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 };
  await dispatchTouchSequence(avatar, [
    { type: "pointerdown", ...point },
    { type: "pointermove", ...point, clientY: point.clientY - 50 },
    { type: "pointerup", ...point },
  ]);
  await dispatchTouchSequence(avatar, [
    { type: "pointerdown", ...point },
    { type: "pointerdown", ...point, pointerId: 2, isPrimary: false },
    { type: "pointerup", ...point },
  ]);
  await dispatchTouchSequence(scene, [
    { type: "pointerdown", clientX: 2, clientY: point.clientY },
    { type: "pointerup", clientX: 2, clientY: point.clientY },
  ]);
  await expect(scene).not.toHaveAttribute("data-scene-pulse-count");
  await page.getByRole("button", { name: "Pause animation", exact: true }).click();
  await avatar.focus();
  await avatar.press("Enter");
  await expect(scene).not.toHaveAttribute("data-scene-pulse-count");
});

test("reduced motion keeps static focus feedback and scroll hides the avatar hit target", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es");
  const scene = page.locator("[data-scene]");
  const avatar = page.getByRole("button", { name: "Interactuar con el avatar de Gonzalo" });
  await avatar.focus();
  await avatar.press("Enter");
  await expect(avatar).toBeFocused();
  await expect(avatar).toHaveCSS("outline-style", "solid");
  await expect(scene).toHaveAttribute("data-mode", "static");
  await expect(scene.locator("[data-scene-avatar-art]")).toHaveCSS("transform", "none");
  await expect(scene).not.toHaveAttribute("data-scene-pulse-count");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?sceneProgress=0.75&sceneTime=0");
  await expect(scene).toHaveAttribute("data-mode", "running");
  await expect(scene.locator("[data-scene-avatar]")).toBeDisabled();
  await expect(scene.locator("[data-scene-avatar]")).toBeHidden();
});
