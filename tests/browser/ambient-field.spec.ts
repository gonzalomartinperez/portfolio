import { expect, test } from "@playwright/test";

test("the particle field drifts, pauses and survives localized client navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/about");
  const field = page.locator("[data-ambient-field]");
  const canvas = field.locator("canvas");
  await expect(field).toHaveAttribute("data-state", "running");
  await expect(canvas).toHaveCount(1);
  await expect(field).toHaveCSS("pointer-events", "none");
  await expect(field).toHaveAttribute("aria-hidden", "true");
  const solar = field.locator("[data-solar-system]");
  await expect(solar.locator("[data-planet]")).toHaveCount(8);
  const earthOrbit = solar.locator('[data-orbit="earth"]');
  const initialOrbit = await earthOrbit.evaluate((node) => getComputedStyle(node).transform);
  await expect
    .poll(() => earthOrbit.evaluate((node) => getComputedStyle(node).transform))
    .not.toBe(initialOrbit);
  const element = await canvas.elementHandle();
  const firstFrame = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  await expect
    .poll(() => canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL()))
    .not.toBe(firstFrame);

  const toggle = page.locator("[data-motion-toggle]");
  await toggle.click();
  await expect(field).toHaveAttribute("data-state", "paused");
  await page.waitForTimeout(150);
  const pausedFrame = await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL());
  const pausedOrbit = await earthOrbit.evaluate((node) => getComputedStyle(node).transform);
  await page.waitForTimeout(400);
  expect(await canvas.evaluate((node: HTMLCanvasElement) => node.toDataURL())).toBe(pausedFrame);
  expect(await earthOrbit.evaluate((node) => getComputedStyle(node).transform)).toBe(pausedOrbit);

  await page
    .getByRole("navigation", { name: "Main", exact: true })
    .getByRole("link", { name: "Work", exact: true })
    .click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(field).toHaveAttribute("data-state", "paused");
  expect(await element?.evaluate((node) => node.isConnected)).toBe(true);
  await page.getByRole("link", { name: "ES", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/work$/);
  await expect(toggle).toHaveText(/Reanudar/);
  await toggle.click();
  await expect(field).toHaveAttribute("data-state", "running");
  await page
    .getByRole("link", { name: /Gonzalo Martin Perez/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/es$/);
  await expect(page.locator("[data-scene]")).toHaveAttribute("data-mode", "running");
  await page.getByRole("button", { name: "Pausar la animación", exact: true }).click();
  await expect(field).toHaveAttribute("data-state", "paused");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(canvas).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test("reduced motion keeps the static field and can remove an already loaded canvas", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es/contact");
  const field = page.locator("[data-ambient-field]");
  await expect(field).toHaveAttribute("data-state", "static");
  await expect(field.locator("canvas")).toHaveCount(0);
  await expect(field.locator("[data-planet]")).toHaveCount(8);
  const staticOrbit = field.locator('[data-orbit="saturn"]');
  const staticPosition = await staticOrbit.evaluate((node) => getComputedStyle(node).transform);
  await page.waitForTimeout(300);
  expect(await staticOrbit.evaluate((node) => getComputedStyle(node).transform)).toBe(
    staticPosition,
  );
  await expect(page.locator("[data-motion-toggle]")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(field).toHaveAttribute("data-state", "running");
  await expect(field.locator("canvas")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(field.locator("canvas")).toHaveCount(0);
  await expect(field).toHaveAttribute("data-state", "static");
});

test("without JavaScript the background remains decorative and the CV remains usable", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/cv");
    await expect(page.locator("[data-ambient-field]")).toHaveAttribute("data-state", "static");
    await expect(page.locator("[data-ambient-field] canvas")).toHaveCount(0);
    await expect(page.locator("[data-motion-toggle]")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("a[download]").first()).toBeVisible();
  } finally {
    await context.close();
  }
});
