import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { answer, fixture, open } from "./helpers/assistant-fixture";

for (const locale of ["en", "es"] as const) {
  test(`${locale} voluntary question context goes only to the conversation API`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const events: unknown[] = [];
    await page.route("**/api/v1/analytics/events", async (route) => {
      events.push(route.request().postDataJSON());
      await route.fulfill({ status: 204 });
    });
    const backend = await fixture(page);
    await open(page, locale);
    const question =
      locale === "en"
        ? "I am Synthetic Example, qa-context@example.invalid. How does Gonzalo approach software quality?"
        : "Soy Persona de Ejemplo, qa-context@example.invalid. ¿Cómo aborda Gonzalo la calidad del software?";
    await page.locator("#question").fill(question);
    await page
      .getByRole("button", { name: locale === "en" ? "Send" : "Enviar", exact: true })
      .click();
    await expect(page.getByText(answer, { exact: true })).toBeVisible();
    expect(backend.submissions()).toEqual([expect.objectContaining({ content: question, locale })]);
    await expect
      .poll(
        () =>
          events.filter((event) => (event as { schema_version?: number }).schema_version === 1)
            .length,
      )
      .toBe(1);
    expect(JSON.stringify(events)).not.toContain("qa-context@example.invalid");
    expect(JSON.stringify(events)).not.toContain(question);
    const privacy = page.locator("[data-assistant-privacy]");
    await privacy.locator("summary").click();
    await expect(privacy).toContainText("OpenAI");
    await expect(privacy).not.toContainText(
      /do not share|do not include|no compartas|no incluyas/i,
    );
    await expect(page.locator("#portfolio-assistant")).not.toContainText(
      /public questions only|solo preguntas públicas/i,
    );
  });

  test(`${locale} privacy disclosures are keyboard accessible and match enabled features`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await fixture(page);
    const apiRequests: string[] = [];
    page.on("request", (request) => {
      const path = new URL(request.url()).pathname;
      if (path.startsWith("/api/v1/") && path !== "/api/v1/analytics/events")
        apiRequests.push(request.url());
    });
    await page.goto(locale === "es" ? "/es/contact" : "/contact");
    const disclosure = page.locator("[data-privacy-disclosure]");
    const summary = disclosure.locator("summary");
    await summary.focus();
    await expect(summary).toBeFocused();
    await expect(summary).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(disclosure).toHaveAttribute("open", "");
    await expect(disclosure.getByRole("link")).toHaveAttribute(
      "href",
      "mailto:gonzalomartinperez2002@gmail.com",
    );
    await expect(disclosure.locator("[data-privacy-assistant]")).toHaveAttribute(
      "data-privacy-assistant",
      "enabled",
    );
    await expect(disclosure.locator("[data-privacy-analytics]")).toHaveAttribute(
      "data-privacy-analytics",
      "enabled",
    );
    expect(apiRequests).toEqual([]);
    expect(await page.context().cookies()).toEqual([]);
    expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
        document.documentElement.style.fontSize = "200%";
      }, theme);
      await expect(page.locator("body")).toHaveCSS(
        "background-color",
        theme === "light" ? "rgb(250, 250, 251)" : "rgb(0, 0, 0)",
      );
      await expect(disclosure.getByRole("link")).toHaveCSS(
        "color",
        theme === "light" ? "rgb(10, 110, 155)" : "rgb(76, 214, 255)",
      );
      await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
      );
      await disclosure.getByRole("link").focus();
      await page.keyboard.press("Shift+Tab");
      await expect(summary).toBeFocused();
      const headerBottom = await page
        .locator("header")
        .first()
        .evaluate((element) => element.getBoundingClientRect().bottom);
      expect((await summary.boundingBox())?.y).toBeGreaterThanOrEqual(headerBottom);
      expect(
        await disclosure.evaluate((element) => element.scrollWidth <= element.clientWidth),
      ).toBe(true);
      const scan = await new AxeBuilder({ page })
        .include("[data-privacy-disclosure]")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(scan.violations).toEqual([]);
      await disclosure.screenshot({ path: test.info().outputPath(`privacy-${theme}.png`) });
    }
    await summary.focus();
    await page.keyboard.press("Space");
    await expect(disclosure).not.toHaveAttribute("open", "");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "";
    });
    await open(page, locale);
    const assistantPrivacy = page.locator("[data-assistant-privacy]");
    expect(
      await assistantPrivacy
        .locator("summary")
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).minHeight)),
    ).toBeGreaterThanOrEqual(44);
    await assistantPrivacy.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(assistantPrivacy).toHaveAttribute("open", "");
    await expect(assistantPrivacy).toContainText(locale === "en" ? "7 days" : "7 días");
    await expect(assistantPrivacy).toContainText(
      locale === "en" ? "session cookies" : "cookies de sesión",
    );
    await expect(assistantPrivacy).not.toContainText(/anonymous|anónima/);
    await page.screenshot({ path: test.info().outputPath("assistant-privacy.png") });
  });
  test(`${locale} unavailable assistant does not invent a retention period`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const backend = await fixture(page, "unavailable");
    await open(page, locale);
    await expect(page.locator("#portfolio-assistant").getByRole("alert")).toBeVisible();
    const privacy = page.locator("[data-assistant-privacy]");
    await privacy.locator("summary").click();
    await expect(privacy).toContainText(
      locale === "en"
        ? "The history retention period is not available yet."
        : "El plazo de conservación del historial aún no está disponible.",
    );
    await expect(privacy).not.toContainText(locale === "en" ? "7 days" : "7 días");
    expect(backend.requests()).toBe(0);
  });
}
