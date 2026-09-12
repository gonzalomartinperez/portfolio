import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["", "/about", "/work", "/work/filomena", "/stack", "/education", "/contact"];

for (const locale of ["", "/es"]) {
  for (const route of routes) {
    const url = `${locale}${route}` || "/";
    test(`${url} is accessible, responsive and complete in both themes`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(url);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      for (const theme of ["dark", "light"]) {
        await page.evaluate(
          (value) => document.documentElement.setAttribute("data-theme", value),
          theme,
        );
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(
          result.violations.map(({ id, nodes }) => ({
            id,
            targets: nodes.map((node) => node.target),
          })),
        ).toEqual([]);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        );
        expect(overflow, `${url} overflows in ${theme}`).toBe(false);
      }
      expect(errors).toEqual([]);
    });
  }
}

test("keyboard users can skip navigation", async ({ page }) => {
  await page.goto("/about");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("the portrait identity and icon endpoints are available", async ({ request }) => {
  const icon = await request.get("/icon.png");
  expect(icon.ok()).toBe(true);
  expect(icon.headers()["content-type"]).toContain("image/png");
  expect((await icon.body()).subarray(1, 4).toString()).toBe("PNG");
  expect((await request.get("/favicon.ico")).ok()).toBe(true);
});

test("content and the full catalogue work without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/stack");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("LangGraph", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("React", { exact: true }).first()).toBeVisible();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "LangGraph", exact: true }).first()).toBeVisible();
  } finally {
    await context.close();
  }
});
