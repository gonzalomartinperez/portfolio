import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  compareTechnologyNames,
  getStackGroups,
  publicTechnologyCatalog,
  technologyCatalog,
  technologyGroups,
} from "../src/content/technologies.ts";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

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
