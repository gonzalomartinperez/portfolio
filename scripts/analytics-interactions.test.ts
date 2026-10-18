import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { sections } from "../src/features/analytics/domain/events.ts";
import {
  interactionIntent,
  layoutRevision,
  pageRegions,
  sharedRegions,
  viewportCohort,
  viewports,
} from "../src/features/analytics/domain/interactions.ts";

const exposure = {
  event_name: "section_exposure",
  section: "home",
  locale: "en",
  region_id: "home-featured",
  layout_revision: layoutRevision,
  viewport: "desktop",
} as const;
const click = { ...exposure, event_name: "public_click", cell_x: 3, cell_y: 4 } as const;

test("the public v2 snapshot is exact and agrees with every closed client dimension", () => {
  const bytes = readFileSync(
    new URL("../src/contracts/product-interaction.schema.json", import.meta.url),
  );
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    "1397c486b1160e80be92ecce269888cd2eb3cfbce8f3aec3c367de58487363b9",
  );
  const schema = JSON.parse(bytes.toString());
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.schema_version.const, 2);
  assert.equal(schema.properties.layout_revision.const, layoutRevision);
  assert.deepEqual(schema.properties.section.enum, sections);
  assert.deepEqual(schema.properties.viewport.enum, viewports);
  assert.deepEqual(schema.properties.region_id.enum, [
    ...sharedRegions,
    ...Object.values(pageRegions).flat(),
  ]);
  const metadata = JSON.parse(
    readFileSync(
      new URL("../src/contracts/product-interaction-source.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(metadata.commit, "284bc0474f66326ffa79082fd9fa53523e0ba27c");
  for (const file of metadata.files) {
    const content = readFileSync(new URL(`../src/contracts/${file.local}`, import.meta.url));
    assert.equal(createHash("sha256").update(content).digest("hex"), file.sha256);
  }
  const examples = JSON.parse(
    readFileSync(
      new URL("../src/contracts/product-interaction.examples.json", import.meta.url),
      "utf8",
    ),
  );
  for (const example of examples) {
    const { schema_version, project, source, event_id, ...intent } = example;
    assert.equal(schema_version, 2);
    assert.equal(project, "portfolio");
    assert.equal(source, "site");
    assert.match(event_id, new RegExp(schema.properties.event_id.pattern));
    assert.deepEqual(interactionIntent(intent), intent);
  }
});

test("all reviewed page-region pairs qualify and other pages reject those region IDs", () => {
  for (const section of sections) {
    const allowed = [...sharedRegions, ...pageRegions[section]] as readonly string[];
    for (const region of [...sharedRegions, ...Object.values(pageRegions).flat()]) {
      for (const viewport of viewports) {
        const candidate = { ...exposure, section, region_id: region, viewport };
        assert.deepEqual(interactionIntent(candidate), allowed.includes(region) ? candidate : null);
      }
    }
  }
});

test("clicks require paired integer cells while exposures forbid coordinate and target fields", () => {
  assert.deepEqual(interactionIntent(click), click);
  for (const cell of [
    -1,
    8,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    true,
    "3",
    null,
    undefined,
  ]) {
    assert.equal(interactionIntent({ ...click, cell_x: cell }), null);
    assert.equal(interactionIntent({ ...click, cell_y: cell }), null);
  }
  for (const field of ["cell_x", "cell_y", "target"]) {
    assert.equal(interactionIntent({ ...exposure, [field]: null }), null);
    assert.equal(interactionIntent({ ...exposure, [field]: 0 }), null);
  }
  const { cell_x: _x, ...missing } = click;
  assert.equal(interactionIntent(missing), null);
});

test("free fields, private data, inherited dimensions and unknown revisions never become events", () => {
  for (const field of [
    "text",
    "selector",
    "url",
    "query",
    "country",
    "cookie",
    "token",
    "prompt",
    "session_id",
    "visitor_id",
    "screen_width",
    "x",
    "y",
    "target",
  ]) {
    assert.equal(interactionIntent({ ...click, [field]: "synthetic-private-value" }), null);
  }
  for (const value of [
    null,
    [],
    {},
    Object.create(click),
    { ...click, [Symbol("extra")]: 1 },
    { ...click, section: "assistant" },
    { ...click, locale: "es-AR" },
    { ...click, viewport: "unknown" },
    { ...click, layout_revision: "next" },
    { ...click, region_id: "input[name=email]" },
    { ...click, event_name: "page_view" },
  ])
    assert.equal(interactionIntent(value), null);
});

test("viewport cohorts honor both layout boundaries without emitting actual dimensions", () => {
  for (const [width, result] of [
    [1, "mobile"],
    [831.9, "mobile"],
    [832, "tablet"],
    [1023.9, "tablet"],
    [1024, "desktop"],
  ] as const)
    assert.equal(viewportCohort(width), result);
  for (const width of [0, -1, Number.NaN, Number.POSITIVE_INFINITY])
    assert.equal(viewportCohort(width), null);
});
