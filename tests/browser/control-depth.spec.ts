import { expect, test } from "@playwright/test";

test("control depth respects pointer capabilities and leaves native filters stable", async ({
  page,
  isMobile,
}, testInfo) => {
  await page.goto("/stack");
  const clear = page.locator("main button.button").first();
  await expect(clear).toBeDisabled();
  await clear.hover();
  await expect(clear).toHaveCSS("transform", "none");

  const search = page.getByRole("searchbox");
  await search.fill("Python");
  await expect(clear).toBeEnabled();
  await clear.hover();
  if (isMobile) {
    await expect(clear).toHaveCSS("transform", "none");
  } else {
    await expect(clear).not.toHaveCSS("transform", "none");
  }

  const select = page.getByRole("combobox");
  await select.focus();
  await expect(select).toBeFocused();
  await expect(select).toHaveCSS("transform", "none");
  await expect(select).toHaveCSS("outline-style", "solid");
  await page.screenshot({ path: testInfo.outputPath("control-depth.png") });
  await select.selectOption({ index: 1 });
  await expect(select).not.toHaveValue("");
  await clear.click();
  await expect(search).toHaveValue("");
  await expect(select).toHaveValue("");
  await expect(clear).toBeDisabled();
});

test("reduced motion keeps interactive depth static in both themes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  for (const theme of ["dark", "light"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    const action = page.locator("main .button").first();
    await action.hover();
    await expect(action).toHaveCSS("transform", "none");
    await action.focus();
    await expect(action).toHaveCSS("outline-style", "solid");
    await expect(action).toHaveCSS("transform", "none");
  }
});
