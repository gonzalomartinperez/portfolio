import { createHash } from "node:crypto";
import { expect, test } from "@playwright/test";
import documents from "../../src/content/public-documents.json" with { type: "json" };

test("approved evidence downloads preserve their MIME types and reviewed bytes", async ({
  request,
}) => {
  for (const document of documents) {
    const response = await request.get(document.href);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain(document.mime);
    const bytes = await response.body();
    expect(bytes.length).toBe(document.bytes);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(document.sha256);
  }
});

test("all academic outcomes and CV content remain usable without JavaScript", async ({
  browser,
  baseURL,
}, info) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    viewport: info.project.use.viewport,
  });
  try {
    const page = await context.newPage();
    for (const locale of ["", "/es"]) {
      await page.goto(`${locale}/education`);
      const summaries = page.locator("details > summary");
      await expect(summaries).toHaveCount(6);
      for (const summary of await summaries.all()) {
        await summary.focus();
        await page.keyboard.press("Enter");
      }
      await expect(page.locator("li[id^='uns-']:visible")).toHaveCount(36);
      await expect(page.locator("#uns-7680")).toContainText("Ingeniería de Aplicaciones de Web");
      await expect(page.locator("#uns-7922")).toContainText("7 / 10");
      await page.screenshot({
        path: info.outputPath(`education${locale ? "-es" : "-en"}.png`),
        fullPage: true,
      });
      await page.goto(`${locale}/cv`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gonzalo Martin Perez");
      await expect(page.locator("#cv-experience")).toBeVisible();
      await expect(page.locator("a[download]")).toHaveAttribute(
        "href",
        /ai-software-engineer-(en|es)\.pdf/,
      );
      await page.screenshot({
        path: info.outputPath(`cv${locale ? "-es" : "-en"}.png`),
        fullPage: true,
      });
    }
  } finally {
    await context.close();
  }
});

test("CV and education remain readable at 200 percent zoom and retain history", async ({
  page,
}, info) => {
  for (const route of ["/cv", "/es/cv", "/education", "/es/education"]) {
    await page.goto(route);
    await page.evaluate(() => {
      document.documentElement.style.zoom = "2";
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await page.screenshot({ path: info.outputPath(`zoom-${route.replaceAll("/", "-")}.png`) });
  }
  await page.evaluate(() => {
    document.documentElement.style.zoom = "";
  });
  await page.goto("/cv");
  await page
    .getByRole("navigation", { name: "CV sections" })
    .getByRole("link", { name: "Education", exact: true })
    .click();
  await expect(page).toHaveURL(/#cv-education$/);
  await page.getByRole("link", { name: "Let’s talk", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/cv#cv-education$/);
});
