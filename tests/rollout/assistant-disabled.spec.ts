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
  await page.screenshot({ path: test.info().outputPath("assistant-disabled.png") });
});
