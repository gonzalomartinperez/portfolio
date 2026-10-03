import { expect, test } from "@playwright/test";

const enabled = false;

test.skip(!enabled, "Assistant launch is disabled pending explicit release approval");

test("native panel streams cited fixture content and restores focus", async ({ page }) => {
  await page.goto("/");
  const launch = page.getByRole("button", { name: "Ask AI" });
  await launch.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "New chat" })).toBeEnabled();
  await page.getByRole("textbox", { name: "Ask a question" }).fill("What is Filomena?");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText("Sources")).toBeVisible();
  await expect(page.getByRole("link", { name: /projects\.ts/ }).first()).toHaveAttribute(
    "href",
    /github\.com\/gonzalomartinperez\/portfolio\/blob\/[0-9a-f]{40}/,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(launch).toBeFocused();
});

test("Spanish panel works on mobile without horizontal overflow", async ({ page }) => {
  await page.goto("/es");
  await page.getByRole("button", { name: "Preguntar" }).click();
  await expect(page.getByRole("button", { name: "Nueva conversación" })).toBeEnabled();
  await page.getByRole("textbox", { name: "Escribe tu pregunta" }).fill("¿Qué es Filomena?");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(page.getByText("Fuentes")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("panel explains API unavailability", async ({ page }) => {
  await page.route("http://127.0.0.1:8000/api/v1/session", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Ask AI" }).click();
  await expect(page.getByRole("alert")).toContainText("unavailable");
});
