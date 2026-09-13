import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  academicAreas,
  academicCatalogue,
  academicEntry,
  highlightedCourseIds,
  localizedCurriculum,
} from "../src/content/academic-catalogue.ts";

test("all curriculum subjects and English requirements have unique documented outcomes", () => {
  assert.equal(academicCatalogue.length, 36);
  assert.equal(new Set(academicCatalogue.map((entry) => entry.id)).size, 36);
  assert.equal(academicCatalogue.filter((entry) => entry.year > 0).length, 34);
  assert.equal(academicCatalogue.filter((entry) => entry.kind === "english").length, 2);
  assert.equal(academicCatalogue.filter((entry) => entry.kind === "practice").length, 1);
  assert.equal(academicCatalogue.filter((entry) => entry.kind === "project").length, 1);
  for (const entry of academicCatalogue) {
    assert.match(entry.completed, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(entry.name.en && entry.name.es && entry.evidence.result);
    assert.ok(entry.grade === "AP" || (entry.grade >= 1 && entry.grade <= 10));
  }
});

test("featured courses and academic areas resolve only to documented curriculum IDs", () => {
  for (const id of [...highlightedCourseIds, ...academicAreas.flatMap((area) => area.courseIds)]) {
    assert.equal(academicEntry(id).kind, "subject");
  }
  assert.throws(() => academicEntry("invented-course"), /Unknown academic/);
  assert.equal(academicEntry("uns-7680").name.es, "Ingeniería de Aplicaciones de Web");
  assert.equal(academicEntry("uns-7820").year, 2);
  assert.equal(academicEntry("uns-7552").year, 3);
  assert.equal(academicEntry("uns-5949").grade, 5);
  assert.equal(academicEntry("uns-7886").grade, "AP");
  for (const locale of ["es", "en"]) {
    assert.equal(localizedCurriculum(locale).flatMap((year) => year.subjects).length, 34);
  }
});

test("authorized academic PDF originals retain their reviewed bytes", () => {
  const files = {
    "uns-academic-transcript-2025.pdf":
      "39f0209f9ccf733bb5751c7c4e8faea090160993587c32b9f5deab83bbad779d",
    "uns-information-systems-plan-2012.pdf":
      "acb00660434c1f140fb43ead87b1181e3abb328fd57f6893ad075c9aca3554d8",
  };
  for (const [name, hash] of Object.entries(files)) {
    const bytes = readFileSync(new URL(`../public/documents/${name}`, import.meta.url));
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    assert.equal(createHash("sha256").update(bytes).digest("hex"), hash);
  }
});
