import assert from "node:assert/strict";
import test from "node:test";
import { extractAnalyticsReceipt } from "../../tools/analytics-live-receipt.ts";

function ledger() {
  const click = (locale: string, cell_x: number, count: number) => ({
    event_name: "public_click",
    section: "cv",
    locale,
    region_id: "cv-summary",
    layout_revision: "portfolio-v1",
    viewport: "desktop",
    cell_x,
    cell_y: 5,
    count,
  });
  const exposure = (locale: string) => ({
    event_name: "section_exposure",
    section: "cv",
    locale,
    region_id: "cv-summary",
    layout_revision: "portfolio-v1",
    viewport: "desktop",
    cell_x: null,
    cell_y: null,
    count: 1,
  });
  return {
    scope: "disposable-native-browser-and-authenticated-backoffice",
    utc_day: "2026-10-18",
    attempted: 14,
    validated: 14,
    accepted: 14,
    distinct_event_ids: 14,
    v1: 4,
    v2: 10,
    page_views: 3,
    public_clicks: 8,
    section_exposures: 2,
    navigation_clicks: 1,
    semantic_groups: [
      { event_name: "page_view", section: "cv", locale: "en", target: null, count: 1 },
      { event_name: "page_view", section: "cv", locale: "es", target: null, count: 1 },
      { event_name: "page_view", section: "contact", locale: "es", target: null, count: 1 },
      { event_name: "navigation_click", section: "contact", locale: "es", target: null, count: 1 },
    ],
    interaction_groups: [
      click("en", 3, 3),
      click("es", 3, 3),
      click("en", 5, 1),
      click("es", 5, 1),
      exposure("en"),
      exposure("es"),
    ],
    published_grid_clicks: 6,
    withheld_grid_clicks: 2,
    country_collection: "disabled",
    paid_calls: 0,
    database_assertion: "separate API-owner receipt required",
  };
}

function report(value: unknown = ledger()) {
  return {
    stats: { expected: 1, unexpected: 0, flaky: 0, skipped: 0 },
    errors: [],
    suites: [
      {
        specs: [
          {
            ok: true,
            tests: [
              {
                status: "expected",
                expectedStatus: "passed",
                results: [
                  {
                    status: "passed",
                    retry: 0,
                    errors: [],
                    attachments: [
                      {
                        name: "native-browser-and-backoffice.json",
                        contentType: "application/json",
                        body: Buffer.from(JSON.stringify(value)).toString("base64"),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function rejects(value: unknown) {
  assert.throws(() => extractAnalyticsReceipt(value), {
    message: "Analytics receipt validation failed; report values are omitted",
  });
}

test("extracts the closed native ledger without copying reporter metadata", () => {
  const input = { ...report(), config: { syntheticDiagnostic: "excluded" } };
  assert.deepEqual(extractAnalyticsReceipt(input), ledger());
});

test("rejects malformed, noncanonical and oversized attachment base64", () => {
  for (const encoded of ["!invalid!", "e30", "e31=", "", "A".repeat(87_384)]) {
    const input = report();
    input.suites[0].specs[0].tests[0].results[0].attachments[0].body = encoded;
    rejects(input);
  }
});

test("requires a unique matching attachment and a single first-attempt pass", () => {
  const missing = report();
  missing.suites[0].specs[0].tests[0].results[0].attachments = [];
  rejects(missing);
  const duplicate = report();
  duplicate.suites[0].specs[0].tests[0].results[0].attachments.push(
    duplicate.suites[0].specs[0].tests[0].results[0].attachments[0],
  );
  rejects(duplicate);
  const flaky = report();
  flaky.stats.flaky = 1;
  rejects(flaky);
  const retried = report();
  retried.suites[0].specs[0].tests[0].results[0].retry = 1;
  rejects(retried);
  const extraResult = report();
  extraResult.suites[0].specs[0].tests[0].results.push(
    extraResult.suites[0].specs[0].tests[0].results[0],
  );
  rejects(extraResult);
});

test("rejects unknown ledger fields, unsupported dimensions and duplicate groups", () => {
  rejects(report({ ...ledger(), arbitrary: "excluded" }));
  const dimensions = ledger();
  dimensions.interaction_groups[0].region_id = "unknown-region";
  rejects(report(dimensions));
  const duplicate = ledger();
  duplicate.interaction_groups.push({ ...duplicate.interaction_groups[0] });
  rejects(report(duplicate));
  const target = ledger();
  rejects(
    report({
      ...target,
      semantic_groups: target.semantic_groups.map((group, index) =>
        index === 0 ? { ...group, target: "en" } : group,
      ),
    }),
  );
  const unknown = ledger();
  rejects(
    report({
      ...unknown,
      interaction_groups: unknown.interaction_groups.map((group, index) =>
        index === 0 ? { ...group, arbitrary: "excluded" } : group,
      ),
    }),
  );
});

test("rejects missing click cells, exposure coordinates and out-of-range cells", () => {
  const missing = ledger();
  rejects(
    report({
      ...missing,
      interaction_groups: missing.interaction_groups.map((group, index) =>
        index === 0 ? { ...group, cell_x: null } : group,
      ),
    }),
  );
  const exposure = ledger();
  rejects(
    report({
      ...exposure,
      interaction_groups: exposure.interaction_groups.map((group, index) =>
        index === 4 ? { ...group, cell_x: 0 } : group,
      ),
    }),
  );
  const outside = ledger();
  outside.interaction_groups[0].cell_x = 8;
  rejects(report(outside));
});

test("rejects incorrect totals, per-event group counts, unsafe budgets and malformed entries", () => {
  rejects(report({ ...ledger(), attempted: 15 }));
  rejects(report({ ...ledger(), accepted: 32 }));
  rejects(report({ ...ledger(), paid_calls: 1 }));
  const events = ledger();
  events.semantic_groups[0].event_name = "navigation_click";
  rejects(report(events));
  const mixed = ledger();
  mixed.interaction_groups[0].count = 2;
  mixed.interaction_groups[4].count = 2;
  rejects(report(mixed));
  rejects(report({ ...ledger(), semantic_groups: [null] }));
  rejects({ ...report(), suites: [null] });
});
