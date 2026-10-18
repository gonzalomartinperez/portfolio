import { expect, test } from "@playwright/test";
import { captureAnalytics, createAnalyticsDeliveryBarrier } from "./helpers/analytics-fixture";

for (const locale of ["en", "es"] as const) {
  const prefix = locale === "es" ? "/es" : "";
  const navName = locale === "es" ? "Principal" : "Main";

  test(`${locale} public pointer clicks send coarse cells without URL, content or identity`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const waitForDelivery = createAnalyticsDeliveryBarrier(page);
    const events = await captureAnalytics(page);
    await page.goto(`${prefix}/cv?private=synthetic-only`);
    await expect.poll(() => events.some((event) => event.event_name === "page_view")).toBe(true);
    const region = page.locator('[data-analytics-region="cv-summary"]');
    await region.scrollIntoViewIfNeeded();
    await waitForDelivery();
    const box = await region.boundingBox();
    expect(box).not.toBeNull();
    await region.click({
      position: { x: (box?.width ?? 0) * 0.4375, y: (box?.height ?? 0) * 0.6875 },
    });
    await expect
      .poll(() => events.filter((event) => event.event_name === "public_click").length)
      .toBe(1);
    expect(events.find((event) => event.event_name === "public_click")).toMatchObject({
      schema_version: 2,
      section: "cv",
      locale,
      region_id: "cv-summary",
      cell_x: 3,
      cell_y: 5,
    });
    expect(JSON.stringify(events)).not.toContain("synthetic-only");
    expect(await page.context().cookies()).toEqual([]);
    expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
    expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([]);
    expect(new Set(events.map((event) => event.event_id)).size).toBe(events.length);
  });

  test(`${locale} private descendants, canvases, unknown regions and keyboard actions never fabricate cells`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const events = await captureAnalytics(page);
    await page.goto(`${prefix}/cv`);
    await expect.poll(() => events.some((event) => event.event_name === "page_view")).toBe(true);
    const count = await page.evaluate(() => {
      const region = document.querySelector('[data-analytics-region="cv-summary"]');
      if (!region) throw new Error("Missing reviewed region");
      const controls = document.createElement("div");
      controls.style.cssText =
        "display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:4px";
      region.append(controls);
      const cases = [
        "form",
        "input",
        "textarea",
        "editable",
        "textbox",
        "assistant",
        "private",
        "graph",
        "canvas",
        "custom",
      ];
      for (const [index, kind] of cases.entries()) {
        const wrapper = document.createElement(
          kind === "form" ? "form" : kind === "custom" ? "qa-private-element" : "div",
        );
        if (kind === "editable") wrapper.contentEditable = "true";
        if (kind === "textbox") wrapper.setAttribute("role", "textbox");
        if (kind === "assistant") wrapper.dataset.assistantHost = "";
        if (kind === "private") wrapper.dataset.analyticsPrivate = "";
        if (kind === "graph") wrapper.className = "react-flow";
        const leaf = document.createElement(
          ["input", "textarea", "canvas"].includes(kind) ? kind : "button",
        );
        leaf.id = `qa-private-${index}`;
        leaf.textContent = "synthetic-private-value";
        leaf.style.cssText = "display:block;width:100%;height:44px";
        if (leaf instanceof HTMLButtonElement) leaf.type = "button";
        wrapper.append(leaf);
        controls.append(wrapper);
      }
      for (const [index, id] of ["home-featured", "unknown-region"].entries()) {
        const wrapper = document.createElement("div");
        wrapper.dataset.analyticsRegion = id;
        const button = document.createElement("button");
        button.type = "button";
        button.id = `qa-private-${cases.length + index}`;
        button.textContent = "synthetic-private-value";
        button.style.cssText = "display:block;width:100%;height:44px";
        wrapper.append(button);
        controls.append(wrapper);
      }
      const synthetic = document.createElement("button");
      synthetic.textContent = "synthetic-private-value";
      synthetic.type = "button";
      region.append(synthetic);
      synthetic.click();
      return cases.length + 2;
    });
    for (let index = 0; index < count; index += 1)
      await page.locator(`#qa-private-${index}`).click();
    const nav = page.getByRole("navigation", { name: navName, exact: true });
    const work = nav.locator(`a[data-analytics-destination="${prefix}/work"]`);
    await work.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(`${prefix}/work`);
    await expect
      .poll(() => events.filter((event) => event.event_name === "navigation_click").length)
      .toBe(1);
    expect(events.filter((event) => event.event_name === "public_click")).toEqual([]);
    expect(JSON.stringify(events)).not.toContain("synthetic-private-value");
  });

  test(`${locale} section exposure survives theme updates and resets only for a new route visit`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const waitForDelivery = createAnalyticsDeliveryBarrier(page);
    const events = await captureAnalytics(page);
    await page.goto(`${prefix}/about`);
    const story = page.locator(
      '[data-analytics-exposure="about-story"] [data-analytics-exposure-target]',
    );
    await story.scrollIntoViewIfNeeded();
    const count = () =>
      events.filter(
        (event) => event.event_name === "section_exposure" && event.region_id === "about-story",
      ).length;
    await expect.poll(count).toBe(1);
    await page.evaluate(() => {
      document.documentElement.dataset.theme = "light";
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
    });
    await page.waitForTimeout(650);
    expect(count()).toBe(1);
    const nav = page.getByRole("navigation", { name: navName, exact: true });
    // Delivery is intentionally lossy while both interaction slots are occupied. Finish the
    // Work header measurement before asserting that a second navigation click is delivered.
    const [workHeaderResponse] = await Promise.all([
      page.waitForResponse(
        (response) => {
          const request = response.request();
          if (!response.url().endsWith("/api/v1/analytics/events") || request.method() !== "POST")
            return false;
          const event = request.postDataJSON();
          return (
            event.event_name === "section_exposure" &&
            event.section === "work" &&
            event.locale === locale &&
            event.region_id === "site-header"
          );
        },
        { timeout: 10_000 },
      ),
      nav.locator(`a[data-analytics-destination="${prefix}/work"]`).click(),
    ]);
    await expect(page).toHaveURL(`${prefix}/work`);
    await expect
      .poll(() =>
        events.some((event) => event.event_name === "page_view" && event.section === "work"),
      )
      .toBe(true);
    expect(await workHeaderResponse.finished()).toBeNull();
    await waitForDelivery();
    await nav.locator(`a[data-analytics-destination="${prefix}/about"]`).click();
    await expect(page).toHaveURL(`${prefix}/about`);
    await story.scrollIntoViewIfNeeded();
    await expect.poll(count).toBe(2);
    await expect
      .poll(
        () =>
          events.filter(
            (event) => event.event_name === "public_click" && event.region_id === "site-header",
          ).length,
      )
      .toBe(2);
    const clicks = events.filter(
      (event) => event.event_name === "public_click" && event.region_id === "site-header",
    );
    expect(clicks.map((event) => event.section)).toEqual(["about", "work"]);
    expect(
      events.filter((event) => event.event_name === "page_view" && event.section === "about"),
    ).toHaveLength(2);
  });
}

test("viewport cohorts stay separate through resize and large text without inventing new page views", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const events = await captureAnalytics(page);
  await page.setViewportSize({ width: 831, height: 1000 });
  await page.goto("/about");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  const story = page.locator(
    '[data-analytics-exposure="about-story"] [data-analytics-exposure-target]',
  );
  for (const [width, viewport] of [
    [831, "mobile"],
    [832, "tablet"],
    [1024, "desktop"],
  ] as const) {
    await page.setViewportSize({ width, height: 1000 });
    await story.scrollIntoViewIfNeeded();
    await expect
      .poll(
        () =>
          events.filter(
            (event) =>
              event.event_name === "section_exposure" &&
              event.region_id === "about-story" &&
              event.viewport === viewport,
          ).length,
      )
      .toBe(1);
  }
  await page.setViewportSize({ width: 1024, height: 300 });
  await page.setViewportSize({ width: 1024, height: 1000 });
  await story.scrollIntoViewIfNeeded();
  await page.waitForTimeout(650);
  expect(
    events.filter(
      (event) => event.event_name === "section_exposure" && event.region_id === "about-story",
    ),
  ).toHaveLength(3);
  expect(events.filter((event) => event.event_name === "page_view")).toHaveLength(1);
});

test("measurement listeners leave ordinary scrolling and public navigation usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await captureAnalytics(page);
  await page.goto("/about");
  await page.mouse.move(120, 450);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  const nav = page.getByRole("navigation", { name: "Main", exact: true });
  await nav.locator('a[data-analytics-destination="/contact"]').click();
  await expect(page).toHaveURL("/contact");
  await expect(page.locator("main h1")).toBeVisible();
});

test("native ingest omits existing cookies and cannot store a response cookie", async ({
  page,
  context,
  baseURL,
}) => {
  if (!baseURL) throw new Error("Missing owned loopback fixture origin");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await context.addCookies([
    { name: "qa-native-existing", value: "synthetic", url: baseURL, secure: true, sameSite: "Lax" },
  ]);
  const before = await context.cookies();
  expect(before.map((cookie) => cookie.name)).toEqual(["qa-native-existing"]);
  const received = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/v1/analytics/events" &&
      response.request().method() === "POST",
  );
  await page.goto("/cv");
  const response = await received;
  expect(response.status()).toBe(204);
  expect(await response.headerValue("set-cookie")).toContain("qa-native-challenge=synthetic");
  const headers = await response.request().allHeaders();
  for (const name of ["cookie", "authorization", "referer"]) expect(headers[name]).toBeUndefined();
  await response.finished();
  expect(await context.cookies()).toEqual(before);
  // Positive control belongs only to this discarded loopback sink, never the real API.
  const status = await page.evaluate(() =>
    fetch("/api/v1/analytics/events", { method: "POST", credentials: "include" }).then(
      (response) => response.status,
    ),
  );
  expect(status).toBe(204);
  expect((await context.cookies()).some((cookie) => cookie.name === "qa-native-challenge")).toBe(
    true,
  );
});
