import { expect, type Page, test } from "@playwright/test";

type RecordedEvent = {
  event_name: string;
  section: string;
  locale: string;
  target?: string;
  event_id: string;
};

async function capture(page: Page, failure?: number | "offline") {
  const events: RecordedEvent[] = [];
  await page.route("**/api/v1/analytics/events", async (route) => {
    const request = route.request();
    expect(request.method()).toBe("POST");
    const headers = await request.allHeaders();
    for (const name of ["cookie", "authorization", "referer"])
      expect(headers[name]).toBeUndefined();
    const body = request.postDataJSON();
    expect(Object.keys(body).sort()).toEqual(
      [
        "schema_version",
        "project",
        "source",
        "event_id",
        "event_name",
        "section",
        "locale",
        ...(body.target ? ["target"] : []),
      ].sort(),
    );
    expect(body.schema_version).toBe(1);
    expect(body.project).toBe("portfolio");
    expect(body.source).toBe("site");
    expect(body.event_id).toMatch(
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/,
    );
    expect(Buffer.byteLength(request.postData() ?? "")).toBeLessThanOrEqual(1_024);
    events.push(body);
    if (failure === "offline") await route.abort();
    else
      await route.fulfill({
        status: failure ?? 204,
        headers: {
          "Set-Cookie": "synthetic-analytics-cookie=must-not-store; Secure; SameSite=Lax; Path=/",
        },
        body: failure ? "synthetic unavailable" : undefined,
      });
  });
  return events;
}

for (const locale of ["en", "es"] as const) {
  const prefix = locale === "es" ? "/es" : "";
  const mainNavigation = locale === "es" ? "Principal" : "Main";

  test(`${locale} analytics records reviewed interactions without identity or render duplicates`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.context().addCookies([
      {
        name: "synthetic-existing-cookie",
        value: "not-for-analytics",
        url: (test.info().project.use.baseURL as string | undefined) ?? "https://127.0.0.1:3160",
      },
    ]);
    await page
      .context()
      .route("https://github.com/**", (route) =>
        route.fulfill({ status: 200, body: "synthetic external destination" }),
      );
    const events = await capture(page);
    await page.goto(`${prefix}/cv?private=synthetic-only#cv-summary`);
    await expect.poll(() => events.length).toBe(1);
    expect(events[0]).toMatchObject({ event_name: "page_view", section: "cv", locale });
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "light";
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
    });
    const navigation = page.getByRole("navigation", { name: mainNavigation, exact: true });
    await navigation
      .getByRole("link", { name: locale === "es" ? "Sobre mí" : "About", exact: true })
      .hover();
    await Promise.all([
      page.waitForEvent("download"),
      page.locator('a[data-analytics-event="cv_link_open"][download]').click(),
    ]);
    await expect.poll(() => events.length).toBe(2);
    expect(events[1]).toMatchObject({
      event_name: "cv_link_open",
      section: "cv",
      target: locale,
      locale,
    });
    await navigation
      .getByRole("link", { name: locale === "es" ? "Contacto" : "Contact", exact: true })
      .click();
    await expect(page).toHaveURL(`${prefix}/contact`);
    await expect.poll(() => events.length).toBe(4);
    expect(events.slice(2)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event_name: "navigation_click", section: "contact", locale }),
        expect.objectContaining({ event_name: "page_view", section: "contact", locale }),
      ]),
    );
    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      page.locator('main [data-analytics-target="github"]').click(),
    ]);
    await popup.close();
    await expect.poll(() => events.length).toBe(5);
    expect(events[4]).toMatchObject({
      event_name: "contact_link_open",
      section: "contact",
      target: "github",
      locale,
    });
    expect(new Set(events.map((event) => event.event_id)).size).toBe(events.length);
    expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
    expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([]);
    expect((await page.context().cookies()).map((cookie) => cookie.name)).toEqual([
      "synthetic-existing-cookie",
    ]);
  });

  test(`${locale} experience events require explicit reviewed link or disclosure activation`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page
      .context()
      .route("https://getrampy.com/**", (route) =>
        route.fulfill({ status: 200, body: "synthetic company destination" }),
      );
    const events = await capture(page);
    await page.goto(`${prefix}/work`);
    await expect.poll(() => events.length).toBe(1);
    const summary = page.locator('summary[data-analytics-target="rampy"]');
    await summary.click({ button: "middle" });
    await expect(summary.locator("..")).not.toHaveAttribute("open", "");
    expect(events.filter((event) => event.event_name === "section_open")).toHaveLength(0);
    await summary.click();
    await expect
      .poll(() => events.filter((event) => event.event_name === "section_open").length)
      .toBe(1);
    await summary.click();
    await summary.evaluate((element) => {
      (element.parentElement as HTMLDetailsElement).open = true;
    });
    await summary.evaluate((element) => {
      (element.parentElement as HTMLDetailsElement).open = false;
    });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect
      .poll(() => events.filter((event) => event.event_name === "section_open").length)
      .toBe(2);
    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      page.locator('a[data-analytics-target="rampy"]').click(),
    ]);
    await popup.close();
    await expect
      .poll(() => events.filter((event) => event.event_name === "company_link_open").length)
      .toBe(1);
    await page.evaluate(() => {
      const link = document.createElement("a");
      link.href = "#synthetic";
      link.dataset.analyticsEvent = "contact_link_open";
      link.dataset.analyticsTarget = "synthetic-private-text";
      link.textContent = "synthetic invalid dimension";
      link.id = "invalid-analytics-link";
      document.body.append(link);
    });
    await page.locator("#invalid-analytics-link").click();
    expect(events).toHaveLength(4);
  });
}

test("analytics delivery failures leave navigation usable without retrying", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const failure of [429, 500, "offline"] as const) {
    const events = await capture(page, failure);
    await page.goto("/cv");
    await expect.poll(() => events.length).toBe(1);
    await page
      .getByRole("navigation", { name: "Main", exact: true })
      .getByRole("link", { name: "Contact", exact: true })
      .click();
    await expect(page).toHaveURL("/contact");
    await expect(page.locator("main h1")).toBeVisible();
    await expect.poll(() => events.length).toBe(3);
    expect(errors).toEqual([]);
    await page.unroute("**/api/v1/analytics/events");
  }
});
