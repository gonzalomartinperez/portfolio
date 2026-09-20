import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  compareTechnologyNames,
  getSceneMarkIdentity,
  getStackGroups,
  getTechnology,
  publicTechnologyCatalog,
  publicTechnologyExclusions,
  technologyCatalog,
  technologyGroups,
} from "../src/content/technologies.ts";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("confirmed toolkit additions retain their applied experience context", () => {
  const rampy = [
    "agent-harness",
    "pydantic-ai",
    "pytorch",
    "tensorflow",
    "pydantic",
    "sqlalchemy",
    "sqlmodel",
    "pandas",
    "numpy",
    "lifi",
    "hyperliquid",
    "moonpay",
    "cross-chain-bridges",
    "fiat-on-ramp",
    "fiat-off-ramp",
  ];
  for (const id of rampy) {
    const technology = getTechnology(id);
    assert.equal(technology?.status, "applied", id);
    assert.deepEqual(
      technology.evidence.map(({ href }) => href),
      ["/work#rampy"],
      id,
    );
  }
  for (const id of ["typeorm", "prisma"]) {
    const technology = getTechnology(id);
    assert.equal(technology?.status, "applied", id);
    assert.deepEqual(
      technology.evidence.map(({ href }) => href),
      ["/work#teamcubation", "/work#cooperativa-obrera"],
    );
  }
  for (const id of ["google-analytics", "meta-pixel", "product-analytics"]) {
    const technology = getTechnology(id);
    assert.equal(technology?.status, "applied", id);
    assert.deepEqual(
      technology.evidence.map(({ href }) => href),
      ["/work#rampy", "/work#independent"],
    );
  }
  for (const [alias, id] of [
    ["SQL Alchemy", "sqlalchemy"],
    ["SQL Model", "sqlmodel"],
    ["PydanticAI", "pydantic-ai"],
    ["LiFi", "lifi"],
    ["Tracking", "product-analytics"],
  ])
    assert.equal(getTechnology(alias)?.id, id);
  assert.equal(technologyCatalog.filter(({ name }) => name === "OpenTelemetry").length, 1);
});

test("the curated hero prioritizes applied AI while preserving source knowledge", () => {
  for (const id of [
    "pydantic-ai",
    "google-vertex-ai",
    "openai-api",
    "pytest",
    "sentry",
    "pytorch",
    "numpy",
    "pandas",
    "sqlalchemy",
    "expo",
  ])
    assert.ok(getSceneMarkIdentity(getTechnology(id)), id);
  for (const id of [
    "slack",
    "discord",
    "microsoft-teams",
    "jira",
    "trello",
    "php",
    "wordpress",
    "mockito",
    "maven",
  ]) {
    const technology = getTechnology(id);
    assert.equal(technology?.status, "applied", id);
    assert.equal(getSceneMarkIdentity(technology), undefined, id);
  }
  assert.equal(
    getSceneMarkIdentity(getTechnology("pydantic")),
    getSceneMarkIdentity(getTechnology("pydantic-ai")),
  );
  assert.equal(getTechnology("spec-driven-development")?.status, "applied");
});

test("additional Rampy confirmations describe integrations without inventing model training", () => {
  for (const id of [
    "alembic",
    "pytest",
    "sentry",
    "expo",
    "tanstack-query",
    "zod",
    "viem",
    "zerodev",
    "vitest",
    "google-vertex-ai",
    "google-gemini",
    "openai-api",
    "graphrag",
    "llm-provider-fallback",
    "server-sent-events",
    "transaction-idempotency",
    "transaction-reconciliation",
    "quote-aggregation-routing",
    "transaction-signing",
  ]) {
    const technology = getTechnology(id);
    assert.equal(technology?.status, "applied", id);
    assert.deepEqual(
      technology.evidence.map(({ href }) => href),
      ["/work#rampy"],
      id,
    );
  }
  for (const id of [
    "rag",
    "spec-driven-development",
    "user-authorization",
    "protocol-integrations",
  ])
    assert.ok(
      getTechnology(id)?.evidence.some(({ href }) => href === "/work#rampy"),
      id,
    );
  for (const [alias, id] of [
    ["Vertex", "google-vertex-ai"],
    ["Gemini", "google-gemini"],
    ["OpenAI", "openai-api"],
    ["SDD", "spec-driven-development"],
    ["SSE", "server-sent-events"],
    ["On-chain integrations", "protocol-integrations"],
    ["React Query", "tanstack-query"],
  ])
    assert.equal(getTechnology(alias)?.id, id);
  assert.equal(getTechnology("foundation-model-training"), undefined);
  assert.equal(getTechnology("fine-tuning"), undefined);
});

test("the hero fills seven desktop and five mobile columns with 35 unique marks", () => {
  const selected = publicTechnologyCatalog.filter(getSceneMarkIdentity);
  const identities = new Set(selected.map(getSceneMarkIdentity));
  assert.equal(identities.size, 35);
  assert.equal(identities.size % 7, 0);
  assert.equal(identities.size % 5, 0);
  for (const technology of selected) assert.equal(technology.status, "applied");
  assert.deepEqual(
    selected
      .filter(({ icon }) => !icon)
      .map(({ id }) => id)
      .sort(),
    ["agent-evaluation", "pgvector", "rag"],
  );
});

test("catalogue preserves category priority and sorts technology names alphabetically", () => {
  const original = technologyCatalog.map(({ id }) => id);
  for (const locale of ["en", "es"]) {
    const groups = getStackGroups(locale);
    assert.deepEqual(
      groups.map(({ id }) => id),
      technologyGroups.map(({ id }) => id),
    );
    for (const group of groups) {
      const expected = publicTechnologyCatalog
        .filter(({ category }) => category === group.id)
        .toSorted(compareTechnologyNames)
        .map(({ name }) => name);
      assert.deepEqual(group.items, expected);
    }
  }
  assert.deepEqual(
    technologyCatalog.map(({ id }) => id),
    original,
  );
});

test("editorial exclusions preserve applied source records and name valid IDs", () => {
  for (const [id, reason] of Object.entries(publicTechnologyExclusions)) {
    const technology = getTechnology(id);
    assert.equal(technology?.id, id);
    assert.equal(technology.status, "applied");
    assert.ok(reason.length > 20);
    assert.ok(!publicTechnologyCatalog.includes(technology));
  }
  for (const technology of publicTechnologyCatalog) {
    assert.equal(technology.status, "applied");
    assert.ok(!Object.hasOwn(publicTechnologyExclusions, technology.id));
  }
});

test("technology identifiers, categories and evidence remain complete", () => {
  const ids = technologyCatalog.map(({ id }) => id);
  const categories = new Set(technologyGroups.map(({ id }) => id));
  assert.equal(new Set(ids).size, ids.length, "duplicate technology ID");
  for (const technology of technologyCatalog) {
    assert.match(technology.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(categories.has(technology.category), `${technology.id}: unknown category`);
    assert.ok(technology.evidence.length > 0, `${technology.id}: missing context`);
    assert.ok(["applied", "developing"].includes(technology.status));
    if (technology.kind === "concept") assert.equal(technology.icon, undefined);
    for (const { href } of technology.evidence) {
      assert.match(href, /^\/(?:work(?:#[a-z0-9-]+|\/filomena)?|about)$/);
      if (href.includes("#")) {
        const slug = href.split("#")[1];
        for (const locale of ["en", "es"])
          assert.ok(read(`src/content/${locale}/experience.ts`).includes(`slug: "${slug}"`));
      }
    }
  }
  for (const locale of ["en", "es"])
    assert.deepEqual(
      getStackGroups(locale)
        .flatMap(({ items }) => items)
        .sort(),
      publicTechnologyCatalog.map(({ name }) => name).sort(),
      `${locale}: derived groups lose or duplicate a technology`,
    );
});

test("every assigned logo resolves to a safe local resource", () => {
  const sprite = read("public/brands.svg");
  const component = read("src/components/brand-mark.tsx");
  const localNames = component.match(/new Set\(\[([\s\S]*?)\]\)/)?.[1] ?? "";
  const rasterNames = component.match(/const rasterMarks = new Set\(\[([\s\S]*?)\]\)/)?.[1] ?? "";
  for (const { id, icon } of technologyCatalog) {
    if (!icon) continue;
    if (rasterNames.includes(`"${icon}"`)) {
      const png = readFileSync(new URL(`../public/brands/${icon}.png`, import.meta.url));
      assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert.ok(png.readUInt32BE(16) >= 40, `${id}: insufficient source width`);
      assert.ok(png.readUInt32BE(20) >= 40, `${id}: insufficient source height`);
      continue;
    }
    if (localNames.includes(`"${icon}"`)) {
      const resource = new URL(`../public/brands/${icon}.svg`, import.meta.url);
      assert.ok(existsSync(resource), `${id}: missing local SVG`);
      const svg = readFileSync(resource, "utf8");
      assert.match(svg, /<svg\b/);
      assert.doesNotMatch(
        svg,
        /<script\b|<image\b|<foreignObject\b|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|\/\/|data:|javascript:)/i,
      );
    } else {
      assert.ok(sprite.includes(`id="${icon}"`), `${id}: unresolved sprite ${icon}`);
    }
  }
});
