import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { type BrowserContext, expect, type Page, type Request, test } from "@playwright/test";
import { eventIntent } from "../../../src/features/analytics/domain/events";
import { interactionIntent } from "../../../src/features/analytics/domain/interactions";

const siteOrigin = "https://127.0.0.1:3381";
const apiOrigin = "https://127.0.0.1:8317";
const backofficeOrigin = "http://127.0.0.1:3317";
const endpoint = `${apiOrigin}/api/v1/analytics/events`;

type Event = {
  schema_version: number;
  event_id: string;
  event_name: string;
  section: string;
  locale: string;
  target?: string;
  region_id?: string;
  layout_revision?: string;
  viewport?: string;
  cell_x?: number;
  cell_y?: number;
};

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid disposable fixture metadata");
  }
  return value as Record<string, unknown>;
}

async function viewerCookie() {
  const directory = process.env.ANALYTICS_DEMO_DIR;
  if (!directory || !path.isAbsolute(directory))
    throw new Error("Missing absolute fixture directory");
  const resolved = await realpath(directory);
  const parent = await lstat(directory);
  const filename = path.join(directory, "sessions.json");
  const file = await lstat(filename);
  if (
    resolved !== directory ||
    !parent.isDirectory() ||
    parent.isSymbolicLink() ||
    (parent.mode & 0o777) !== 0o700 ||
    !file.isFile() ||
    file.isSymbolicLink() ||
    (file.mode & 0o777) !== 0o600 ||
    file.size > 16_384 ||
    file.uid !== process.getuid?.()
  ) {
    throw new Error("Fixture session must be an owned private file in its private directory");
  }
  try {
    const viewer = object(object(JSON.parse(await readFile(filename, "utf8"))).viewer);
    const cookie = object(viewer.cookie);
    if (
      viewer.role !== "viewer" ||
      typeof cookie.name !== "string" ||
      !/^[A-Za-z0-9_.-]{1,100}$/.test(cookie.name) ||
      typeof cookie.value !== "string" ||
      !/^[A-Za-z0-9%_.~-]{1,4096}$/.test(cookie.value) ||
      cookie.url !== backofficeOrigin ||
      cookie.httpOnly !== true ||
      cookie.secure !== false ||
      cookie.sameSite !== "Lax"
    ) {
      throw new Error("Invalid fixture session");
    }
    return {
      name: cookie.name,
      value: cookie.value,
      url: backofficeOrigin,
      httpOnly: true,
      secure: false,
      sameSite: "Lax" as const,
    };
  } catch {
    throw new Error("Fixture viewer session could not be validated; private values are omitted");
  }
}

function observeDelivery(page: Page, context: BrowserContext) {
  const events: Event[] = [];
  const pending = new Set<Request>();
  const validated = new Set<Request>();
  const accepted = new Set<Request>();
  const problems: string[] = [];
  const checks = new Set<Promise<void>>();
  let activity = Date.now();
  let postAttempts = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === "/api/v1/analytics/events" && request.method() === "POST") {
      postAttempts += 1;
      if (postAttempts >= 32) {
        problems.push("Native ingestion reached the emergency POST-attempt limit");
        void context.close();
        return;
      }
    }
    if (![siteOrigin, apiOrigin].includes(url.origin)) {
      problems.push("Unexpected public browser network origin");
      void context.close();
      return;
    }
    if (url.pathname !== "/api/v1/analytics/events") return;
    activity = Date.now();
    if (request.url() === endpoint && request.method() === "OPTIONS") return;
    if (request.url() !== endpoint || request.method() !== "POST") {
      problems.push("Unexpected ingestion destination, method or event budget");
      void context.close();
      return;
    }
    try {
      const body = object(request.postDataJSON());
      const { schema_version, project, source, event_id, ...intent } = body;
      const reviewed = schema_version === 1 ? eventIntent(intent) : interactionIntent(intent);
      if (
        (schema_version !== 1 && schema_version !== 2) ||
        project !== "portfolio" ||
        source !== "site" ||
        typeof event_id !== "string" ||
        !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(event_id) ||
        !reviewed ||
        JSON.stringify(reviewed) !== JSON.stringify(intent) ||
        Buffer.byteLength(request.postData() ?? "") > 1_024
      ) {
        throw new Error("Invalid event");
      }
      events.push({ schema_version, event_id, ...reviewed });
      validated.add(request);
      pending.add(request);
      const check = request
        .allHeaders()
        .then((headers) => {
          if (["cookie", "authorization", "referer"].some((name) => headers[name] !== undefined)) {
            problems.push("Native ingestion carried a prohibited header");
          }
        })
        .catch(() => {
          problems.push("Native ingestion headers could not be checked");
        });
      checks.add(check);
      void check.finally(() => checks.delete(check));
    } catch {
      problems.push("Native ingestion did not match the reviewed public contract");
    }
  });
  page.on("response", (response) => {
    if (response.url() === endpoint && response.request().method() === "POST") {
      if (response.status() !== 204) problems.push("Native ingestion was not accepted");
      else if (validated.has(response.request())) accepted.add(response.request());
    }
  });
  page.on("requestfinished", (request) => {
    if (pending.delete(request)) activity = Date.now();
  });
  page.on("requestfailed", (request) => {
    if (pending.delete(request)) problems.push("Native ingestion failed");
  });
  return {
    events,
    get attempted() {
      return postAttempts;
    },
    get accepted() {
      return accepted.size;
    },
    async settle() {
      await expect.poll(() => pending.size === 0 && Date.now() - activity >= 700).toBe(true);
      await Promise.all(checks);
      expect(problems).toEqual([]);
      expect(postAttempts).toBeLessThan(32);
      expect(validated.size).toBe(postAttempts);
      expect(accepted.size).toBe(validated.size);
      expect(new Set(events.map((event) => event.event_id)).size).toBe(events.length);
    },
  };
}

async function metric(page: Page, heading: string, count: number) {
  await expect(
    page.getByRole("heading", { name: heading, exact: true }).locator("..").locator(".metric"),
  ).toHaveText(String(count));
}

function grouped(events: Event[], interaction: boolean) {
  const groups = new Map<string, Record<string, string | number | null>>();
  for (const event of events.filter((item) => (item.schema_version === 2) === interaction)) {
    const dimensions = {
      event_name: event.event_name,
      section: event.section,
      locale: event.locale,
      ...(interaction
        ? {
            region_id: event.region_id ?? null,
            layout_revision: event.layout_revision ?? null,
            viewport: event.viewport ?? null,
            cell_x: event.cell_x ?? null,
            cell_y: event.cell_y ?? null,
          }
        : { target: event.target ?? null }),
    };
    const key = JSON.stringify(dimensions);
    const group = groups.get(key);
    if (group) group.count = Number(group.count) + 1;
    else groups.set(key, { ...dimensions, count: 1 });
  }
  return [...groups.values()];
}

test("native public events persist into authorized product reports", async ({
  browser,
  page,
  context,
}, info) => {
  const startedDay = new Date().toISOString().slice(0, 10);
  const backoffice = await browser.newContext({ serviceWorkers: "block" });
  const anonymous = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: "block" });
  try {
    await backoffice.addCookies([await viewerCookie()]);
    const report = await backoffice.newPage();
    backoffice.on("request", (request) => {
      if (new URL(request.url()).origin !== backofficeOrigin) void backoffice.close();
    });
    const reportPath = `${backofficeOrigin}/analytics?locale=en&period=day&offset=0&section=cv&region=cv-summary&viewport=desktop&eventLocale=all`;
    await report.goto(reportPath);
    await expect(
      report.getByRole("heading", { name: "Portfolio interactions", exact: true }),
    ).toBeVisible();
    for (const title of ["Page views", "Public pointer clicks", "Section exposures"]) {
      await metric(report, title, 0);
    }

    const unauthorized = await anonymous.newPage();
    await unauthorized.goto(`${backofficeOrigin}/analytics?locale=en`);
    await expect(unauthorized).toHaveURL(`${backofficeOrigin}/sign-in`);
    const denied = await anonymous.request.get(`${backofficeOrigin}/api/operations`);
    expect(denied.status()).toBe(401);

    await page.emulateMedia({ reducedMotion: "reduce" });
    const delivery = observeDelivery(page, context);
    for (const locale of ["en", "es"] as const) {
      await page.goto(locale === "en" ? "/cv" : "/es/cv");
      await expect
        .poll(
          () =>
            delivery.events.filter(
              (event) => event.event_name === "page_view" && event.locale === locale,
            ).length,
        )
        .toBe(1);
      const region = page.locator('[data-analytics-region="cv-summary"]');
      await region.scrollIntoViewIfNeeded();
      await delivery.settle();
      for (const x of [0.4375, 0.4375, 0.4375, 0.6875]) {
        const box = await region.boundingBox();
        if (!box) throw new Error("Reviewed CV region is not visible");
        await region.click({ position: { x: box.width * x, y: box.height * 0.6875 } });
        await delivery.settle();
      }
    }
    await page
      .getByRole("navigation", { name: "Principal", exact: true })
      .getByRole("link", { name: "Contacto", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(`${siteOrigin}/es/contact`);
    await delivery.settle();
    await context.close();
    expect(new Date().toISOString().slice(0, 10)).toBe(startedDay);
    const count = (name: string) =>
      delivery.events.filter((event) => event.event_name === name).length;
    expect(count("page_view")).toBe(3);
    expect(count("navigation_click")).toBe(1);
    expect(count("public_click")).toBe(8);
    expect(count("section_exposure")).toBeGreaterThan(0);
    await report.reload();
    await metric(report, "Page views", count("page_view"));
    await metric(report, "Public pointer clicks", count("public_click"));
    await metric(report, "Section exposures", count("section_exposure"));
    await expect(
      report.getByText("Current period · still in progress", { exact: true }),
    ).toBeVisible();
    await expect(
      report.getByText("Country collection is off. Retained historical buckets may still appear.", {
        exact: true,
      }),
    ).toBeVisible();
    const countries = report
      .getByRole("table")
      .filter({ has: report.getByRole("columnheader", { name: "Country bucket", exact: true }) });
    await expect(countries.locator("tbody tr")).toHaveCount(1);
    await expect(countries.locator("tbody tr").locator("th,td")).toHaveText(["Unknown", "3"]);
    const grid = report.getByRole("table", {
      name: "Published grid cells · columns and rows numbered 1–8",
      exact: true,
    });
    await expect(grid.locator("tbody tr")).toHaveCount(1);
    await expect(grid.locator("tbody tr").first().locator("th,td")).toHaveText(["4", "6", "6"]);
    await expect(
      report
        .getByText("Clicks withheld from the grid", { exact: true })
        .locator("..")
        .locator("dd"),
    ).toHaveText("2");
    const selectedExposures = delivery.events.filter(
      (event) => event.event_name === "section_exposure" && event.region_id === "cv-summary",
    ).length;
    expect(selectedExposures).toBeGreaterThan(0);
    await expect(
      report.getByText("Selected-region exposures", { exact: true }).locator("..").locator("dd"),
    ).toHaveText(String(selectedExposures));
    await report.goto(`${backofficeOrigin}/analytics?view=legacy&locale=en`);
    await expect(report.getByRole("table").locator("tbody tr td")).toHaveText(["3"]);
    await report.getByLabel("Interaction", { exact: true }).selectOption("navigation_click");
    await expect(report.getByRole("table").locator("tbody tr td")).toHaveText(["1"]);
    await info.attach("native-browser-and-backoffice.json", {
      contentType: "application/json",
      body: Buffer.from(
        JSON.stringify(
          {
            scope: "disposable-native-browser-and-authenticated-backoffice",
            utc_day: startedDay,
            attempted: delivery.attempted,
            validated: delivery.events.length,
            accepted: delivery.accepted,
            distinct_event_ids: new Set(delivery.events.map((event) => event.event_id)).size,
            v1: delivery.events.filter((event) => event.schema_version === 1).length,
            v2: delivery.events.filter((event) => event.schema_version === 2).length,
            page_views: count("page_view"),
            public_clicks: count("public_click"),
            section_exposures: count("section_exposure"),
            navigation_clicks: count("navigation_click"),
            semantic_groups: grouped(delivery.events, false),
            interaction_groups: grouped(delivery.events, true),
            published_grid_clicks: 6,
            withheld_grid_clicks: 2,
            country_collection: "disabled",
            paid_calls: 0,
            database_assertion: "separate API-owner receipt required",
          },
          null,
          2,
        ),
      ),
    });
  } finally {
    await Promise.all([backoffice.close(), anonymous.close()]);
  }
});
