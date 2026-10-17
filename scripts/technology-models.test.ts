import assert from "node:assert/strict";
import test from "node:test";
import {
  getTechnology,
  publicTechnologyCatalog,
  technologyGroups,
} from "../src/content/technologies.ts";
import { filterCatalogue } from "../src/features/technology-catalogue/domain/query.ts";
import { buildCarouselRows } from "../src/features/tool-carousel/domain/rows.ts";

function technology(id: string) {
  const value = getTechnology(id);
  assert.ok(value, `Missing reviewed technology: ${id}`);
  return value;
}

const groups = [
  {
    id: "test",
    name: "Ingeniería",
    evidence: "Production",
    technologies: [technology("python"), technology("postgresql")],
  },
];

test("catalogue search handles accents, surrounding space, aliases and evidence", () => {
  assert.equal(filterCatalogue(groups, "  INGENIERIA  ", "")[0].technologies.length, 2);
  assert.deepEqual(
    filterCatalogue(groups, "Postgres", "")[0].technologies.map(({ id }) => id),
    ["postgresql"],
  );
  const label = groups[0].technologies[0].evidence[0].label;
  assert.ok(filterCatalogue(groups, label, "")[0].technologies.length > 0);
  assert.deepEqual(filterCatalogue(groups, "Python", "another-category"), []);
  assert.deepEqual(filterCatalogue(groups, "no-such-tool", ""), []);
});

test("catalogue filtering preserves reviewed source ordering and data", () => {
  const snapshot = structuredClone(groups);
  filterCatalogue(groups, "Python", "test");
  assert.deepEqual(groups, snapshot);
});

test("carousel rows retain every public technology once, sorted within each category", () => {
  const rows = buildCarouselRows(publicTechnologyCatalog, technologyGroups);
  const tools = rows.flat();
  assert.equal(new Set(tools.map(({ id }) => id)).size, publicTechnologyCatalog.length);
  assert.deepEqual(
    tools.map(({ id }) => id).sort(),
    publicTechnologyCatalog.map(({ id }) => id).sort(),
  );
  for (const row of rows) {
    for (const group of technologyGroups) {
      const names = row.filter((tool) => tool.category === group.id).map(({ name }) => name);
      assert.deepEqual(
        names,
        [...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base", numeric: true })),
      );
    }
  }
  assert.ok(tools.every((tool) => !("evidence" in tool) && !("aliases" in tool)));
});
