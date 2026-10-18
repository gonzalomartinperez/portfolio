import { expect, type Page, type Request, type Route } from "@playwright/test";
import { interactionIntent } from "../../../src/features/analytics/domain/interactions";

export type AnalyticsEvent = {
  schema_version: number;
  event_id: string;
  event_name: string;
  section: string;
  locale: string;
  region_id?: string;
  viewport?: string;
  cell_x?: number;
  cell_y?: number;
  target?: string;
};

export function expectInteractionPayload(body: Record<string, unknown>) {
  const keys = [
    "schema_version",
    "project",
    "source",
    "event_id",
    "event_name",
    "section",
    "locale",
    "region_id",
    "layout_revision",
    "viewport",
  ];
  if (body.event_name === "public_click") keys.push("cell_x", "cell_y");
  expect(Object.keys(body).sort()).toEqual(keys.sort());
  const { schema_version, project, source, event_id, ...intent } = body;
  expect(schema_version).toBe(2);
  expect(project).toBe("portfolio");
  expect(source).toBe("site");
  expect(event_id).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  expect(interactionIntent(intent)).toEqual(intent);
}

export async function expectAnonymousRequest(request: Request) {
  expect(request.method()).toBe("POST");
  const headers = await request.allHeaders();
  for (const name of ["cookie", "authorization", "referer"]) expect(headers[name]).toBeUndefined();
  expect(Buffer.byteLength(request.postData() ?? "")).toBeLessThanOrEqual(1_024);
}

export async function respondAnalytics(route: Route, failure?: number | "offline") {
  if (failure === "offline") await route.abort();
  else
    await route.fulfill({
      status: failure ?? 204,
      body: failure ? "synthetic unavailable" : undefined,
    });
}

/** Browser-only sink: this is not evidence of real API persistence or BO reporting. */
export async function captureAnalytics(page: Page) {
  const events: AnalyticsEvent[] = [];
  await page.route("**/api/v1/analytics/events", async (route) => {
    await expectAnonymousRequest(route.request());
    const body = route.request().postDataJSON();
    if (body.schema_version === 2) expectInteractionPayload(body);
    else expect(body.schema_version).toBe(1);
    events.push(body);
    await respondAnalytics(route);
  });
  return events;
}
