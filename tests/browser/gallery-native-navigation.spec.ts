import { expect, test } from "@playwright/test";

// Use the full browser for image-document tabs; headless shell can stall their initialization.
test.use({ channel: "chromium" });

for (const foreground of [false, true]) {
  test(`gallery modified clicks open original images in a ${foreground ? "foreground" : "background"} tab`, async ({
    page,
    context,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop modified link interaction");
    await page.goto("/work/filomena");
    const trigger = page.getByRole("link", { name: /^Enlarge:/ }).first();
    const source = await trigger.getAttribute("href");
    const opened = context.waitForEvent("page");
    const modifiers: ("ControlOrMeta" | "Shift")[] = foreground
      ? ["ControlOrMeta", "Shift"]
      : ["ControlOrMeta"];
    await trigger.click({ modifiers });
    const imagePage = await opened;
    await imagePage.bringToFront();
    await imagePage.waitForURL((url) => url.pathname === source, { timeout: 10_000 });
    await expect(imagePage.locator("img")).toBeVisible();
    await expect
      .poll(() =>
        imagePage
          .locator("img")
          .evaluate((image) => (image instanceof HTMLImageElement ? image.naturalWidth : 0)),
      )
      .toBeGreaterThan(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await imagePage.close();
  });
}
