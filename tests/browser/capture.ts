import type { Page } from "@playwright/test";

/** Capture after fonts and native layout settle; scripted pages also wait for paint frames. */
export async function captureSettledPage(
  page: Page,
  options: NonNullable<Parameters<Page["screenshot"]>[0]>,
  scriptsEnabled = true,
) {
  await page.bringToFront();
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.body.getBoundingClientRect();
  });
  // No-JavaScript contexts suppress RAF callbacks even when CDP evaluation is permitted.
  if (scriptsEnabled) {
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );
  }
  return page.screenshot(options);
}
