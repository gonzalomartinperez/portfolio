import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { exportCv, inlineRuns, safeLink } from "./export-cv.mjs";

const cv = JSON.parse(
  readFileSync(new URL("../src/content/cv-public.json", import.meta.url), "utf8"),
);

test("public CV retains bilingual sections, stable IDs, metrics and B2", () => {
  for (const locale of ["es", "en"]) {
    const copy = cv.locales[locale];
    assert.equal(copy.name, "Gonzalo Martin Perez");
    assert.deepEqual(
      copy.sections.map((section) => section.id),
      ["experience", "skills", "education", "projects", "languages", "certifications"],
    );
    const serialized = JSON.stringify(copy);
    assert.match(serialized, /20M\+/);
    assert.match(serialized, /B2/);
    assert(
      !/notion\.(site|so)|rxresu\.me|reactive-resume|phone|evidenceRefs|factsPath|vacancy/.test(
        serialized,
      ),
    );
    const ids = copy.sections.flatMap((section) => section.entries.map((entry) => entry.id));
    assert.equal(new Set(ids).size, ids.length);
  }
  assert.match(cv.provenance.sourceSha256, /^[a-f0-9]{64}$/);
  assert.match(cv.provenance.factsSha256, /^[a-f0-9]{64}$/);
  for (const locale of ["en", "es"]) {
    const pdf = readFileSync(
      new URL(`../public/gonzalo-martin-perez-ai-software-engineer-${locale}.pdf`, import.meta.url),
    );
    assert.equal(
      createHash("sha256").update(pdf).digest("hex"),
      cv.provenance.pdfSha256[locale],
      "Web CV must match its reviewed PDF release",
    );
  }
});

test("editorial formatting becomes text runs, never injected HTML", () => {
  assert.deepEqual(inlineRuns("<p><strong>AI</strong> &amp; software</p>"), [
    { text: "AI", bold: true, href: "" },
    { text: " & software", bold: false, href: "" },
  ]);
  for (const html of [
    "<script>alert(1)</script>",
    '<img src="x">',
    '<a href="javascript:alert(1)">x</a>',
    "<strong>unclosed",
  ]) {
    assert.throws(() => inlineRuns(html));
  }
  assert.throws(() => safeLink("https://example.notion.site/page"));
  assert.throws(() => safeLink("https://app.notion.com/p/example"));
  assert.throws(() => safeLink("https://user:password@example.com"));
  assert.throws(() => safeLink("file:///private.pdf"));
});

test("exports fail closed for missing facts and mismatched revisions", () => {
  assert.throws(() =>
    exportCv({ schemaVersion: 1, revision: "2" }, { schemaVersion: 1, revision: "1" }),
  );
  assert.throws(() =>
    exportCv(
      { schemaVersion: 1, revision: "1", identityRef: "missing" },
      { schemaVersion: 1, revision: "1", facts: [] },
    ),
  );
});
