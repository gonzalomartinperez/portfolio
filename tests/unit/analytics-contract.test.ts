import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { eventIntent, sections } from "../../src/features/analytics/domain/events.ts";

test("ingest schema remains the reviewed upstream snapshot", () => {
  const bytes = readFileSync(
    new URL("../../contracts/assistant-api/product-event.schema.json", import.meta.url),
  );
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    "8203591a5b8768ffaa8bfa13399c50de1802be9075a8f78808e61c94aaa9f6ca",
  );
  const schema = JSON.parse(bytes.toString());
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.properties.section.enum, sections);
  assert.deepEqual(schema.properties.locale.enum, ["en", "es"]);
  for (const event_name of schema.properties.event_name.enum) {
    const section = ["section_open", "company_link_open"].includes(event_name) ? "work" : "cv";
    const target =
      event_name === "cv_link_open" ? "en" : event_name === "contact_link_open" ? "email" : "rampy";
    const intent = {
      event_name,
      section,
      locale: "en",
      ...(["page_view", "navigation_click"].includes(event_name) ? {} : { target }),
    };
    assert.deepEqual(eventIntent(intent), intent);
  }
});

test("cross-field restrictions match the versioned ingestion semantics", () => {
  for (const intent of [
    { event_name: "page_view", section: "home", locale: "en", target: "en" },
    { event_name: "page_view", section: "home", locale: "en", target: null },
    { event_name: "navigation_click", section: "home", locale: "en", target: "cv" },
    { event_name: "cv_link_open", section: "contact", locale: "en", target: "en" },
    { event_name: "section_open", section: "home", locale: "en", target: "rampy" },
    { event_name: "company_link_open", section: "work", locale: "en", target: "independent" },
    { event_name: "contact_link_open", section: "contact", locale: "en", target: "other" },
    { event_name: "contact_link_open", section: "contact", locale: "en" },
    { event_name: "unknown", section: "home", locale: "en" },
    { event_name: "page_view", section: "home", locale: "es-AR" },
  ])
    assert.equal(eventIntent(intent), null);
});

test("forbidden identifiers, content and free dimensions are rejected rather than stripped", () => {
  const valid = { event_name: "page_view", section: "home", locale: "en" };
  for (const field of [
    "cookie",
    "authorization",
    "token",
    "query",
    "url",
    "referrer",
    "text",
    "prompt",
    "country",
    "occurred_at",
    "visitor_id",
    "session_id",
    "run_id",
    "user_agent",
    "properties",
  ]) {
    assert.equal(eventIntent({ ...valid, [field]: "synthetic-sensitive-value" }), null, field);
  }
  for (const value of [null, [], {}, Object.create(valid), { ...valid, [Symbol("extra")]: 1 }])
    assert.equal(eventIntent(value), null);
});
