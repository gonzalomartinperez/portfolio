import { expect, test } from "@playwright/test";

test("owned filters preserve native semantics and localized footer labels", async ({
  page,
}, info) => {
  await page.goto("/es/stack");
  const search = page.getByRole("searchbox", { name: "Buscar tecnologías" });
  const category = page.getByRole("combobox", { name: "Categoría", exact: true });
  await expect(search).toHaveAttribute("data-slot", "input");
  await expect(category).toHaveAttribute("data-slot", "native-select");
  const bodyFont = await page
    .locator("body")
    .evaluate((element) => getComputedStyle(element).fontFamily);
  for (const control of [
    search,
    category,
    page.getByRole("button", { name: "Limpiar filtros", exact: true }).first(),
  ]) {
    await expect(control).toHaveCSS("font-family", bodyFont);
  }
  await category.selectOption("fintech");
  await search.fill("Privy");
  await expect(page.locator("#technology-results h3")).toHaveText(["Privy"]);
  await expect(
    page.getByRole("contentinfo").getByRole("link", {
      name: "LinkedIn (se abre en una pestaña nueva)",
      exact: true,
    }),
  ).toBeAttached();
  for (const theme of ["dark", "light"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    await category.focus();
    await expect(category).toHaveCSS("outline-style", "solid");
    await page.screenshot({ path: info.outputPath(`filters-${theme}.png`) });
  }
});

test("gallery skeleton reflects a pending image and disappears on load", async ({ page }) => {
  await page.goto("/work/filomena");
  let release = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/filomena/**", async (route) => {
    await pending;
    await route.continue();
  });
  try {
    await page
      .getByRole("link", { name: /^Enlarge:/ })
      .first()
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-slot="skeleton"]')).toBeVisible();
    await expect(dialog.getByRole("status")).toHaveText("Loading image");
    release();
    await expect(dialog.locator('[data-slot="skeleton"]')).toHaveCount(0);
    await expect(dialog.locator("img")).toBeVisible();
  } finally {
    release();
  }
});

test("gallery failures expose a direct recovery link without a stuck skeleton", async ({
  page,
}) => {
  await page.goto("/es/work/filomena");
  await page.route("**/filomena/**", (route) => route.abort());
  const trigger = page.getByRole("link", { name: /^Ampliar:/ }).first();
  const source = await trigger.getAttribute("href");
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("alert")).toContainText("No se pudo cargar la imagen");
  await expect(dialog.getByRole("link", { name: "Abrir el archivo original" })).toHaveAttribute(
    "href",
    source ?? "",
  );
  await expect(dialog.locator('[data-slot="skeleton"]')).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("gallery links remain direct navigation with modified clicks", async ({
  page,
  context,
  isMobile,
}) => {
  test.skip(isMobile, "Desktop modified link interaction");
  await page.goto("/work/filomena");
  const trigger = page.getByRole("link", { name: /^Enlarge:/ }).first();
  const source = await trigger.getAttribute("href");
  const opened = context.waitForEvent("page");
  await trigger.click({ modifiers: ["ControlOrMeta"] });
  const imagePage = await opened;
  await imagePage.waitForLoadState();
  expect(new URL(imagePage.url()).pathname).toBe(source);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await imagePage.close();
});
