import { expect, test } from "@playwright/test";

test("disabled rollout has no launcher, chat requests or reachable assistant routes", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/v1/")) requests.push(request.url());
  });
  for (const path of ["/", "/es", "/about"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("[data-assistant-host]")).toHaveCount(0);
  }
  for (const path of ["/assistant", "/es/assistant"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.locator("[data-assistant-host]")).toHaveCount(0);
  }
  expect(requests).toEqual([]);
  await page.goto("/");
  const privacy = page.locator("[data-privacy-disclosure]");
  await privacy.locator("summary").click();
  await expect(privacy.locator("[data-privacy-assistant]")).toHaveAttribute(
    "data-privacy-assistant",
    "disabled",
  );
  await expect(privacy).toContainText("does not send conversations");
  await expect(privacy.locator("[data-privacy-analytics]")).toHaveAttribute(
    "data-privacy-analytics",
    "disabled",
  );
  expect(requests).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([]);
  await page.screenshot({ path: test.info().outputPath("assistant-disabled.png") });
});
