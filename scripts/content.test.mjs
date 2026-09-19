import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/**
 * Source-level invariants for published content.
 *
 * These encode the editorial rules the portfolio must not break: figures never appear without
 * a qualifier, the two locales stay in step, and claims the owner's sources prohibit cannot be
 * reintroduced. They read the TypeScript as text rather than importing it, so they run with no
 * build step and no transform.
 */

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => readFileSync(path.join(root, file), "utf8");

/** Published text only — comments legitimately name the very claims these guards forbid. */
const readWithoutComments = (file) =>
  read(file)
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1 ");

const tracked = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { cwd: root, encoding: "utf8" },
)
  .split("\0")
  .filter((file) => file && existsSync(path.join(root, file)));

const sourceFiles = tracked.filter((file) => /^src\/.*\.(ts|tsx|css)$/.test(file));
const contentFiles = tracked.filter((file) => /^src\/content\/.*\.ts$/.test(file));
const localeFiles = contentFiles.filter((file) => /^src\/content\/(en|es)\//.test(file));

test("every published metric carries a qualifier", () => {
  // Data modules only: the shared files declare types, and site.ts holds the hero summary
  // strip, which the attribution-note test below governs instead.
  const metricFiles = localeFiles.filter((file) => !file.endsWith("/site.ts"));
  assert.ok(metricFiles.length >= 8, "expected data modules in both locales");
  for (const file of metricFiles) {
    for (const match of readWithoutComments(file).matchAll(/\{\s*value:[\s\S]*?\}/g)) {
      const literal = match[0];
      if (!literal.includes("label:")) continue;
      assert.ok(
        literal.includes("qualifier:"),
        `${file}: a metric has no qualifier in ${literal.slice(0, 160)}`,
      );
    }
  }
});

test("the hero figure strip carries its attribution note", () => {
  // The strip summarises product-scale figures under one shared note instead of per-figure
  // qualifiers, and links to where each figure is broken down.
  for (const locale of ["en", "es"]) {
    const source = read(`src/content/${locale}/site.ts`);
    assert.match(source, /proofNote:/, `${locale}: hero figures need an attribution note`);
    assert.match(source, /proofNoteLink:/, `${locale}: hero figures need a link to the detail`);
  }
});

test("no claim exceeds the owner's verified position", () => {
  // Each entry is a claim the canonical career sources explicitly prohibit.
  const forbidden = [
    /\bSenior (Engineer|Developer|Software)\b/i,
    /\bTech Lead\b/i,
    /\bStaff Engineer\b/i,
    /\bSolutions? Architect\b/i,
    /\b(fluent|native|advanced|C1|C2) English\b/i,
    /\bingl[eé]s\s+(avanzado|fluido|nativo)\b/i,
    /\bDevOps (engineer|ownership|owner)\b/i,
    /\bexpert in\b/i,
    /\bexperto en\b/i,
    /\baward[- ]winning\b/i,
    /\bpremiad[oa]\b/i,
  ];
  for (const file of contentFiles) {
    const source = readWithoutComments(file);
    for (const pattern of forbidden) {
      assert.ok(!pattern.test(source), `${file}: prohibited claim matching ${pattern}`);
    }
  }
});

test("Filomena always names the team", () => {
  for (const locale of ["en", "es"]) {
    const source = read(`src/content/${locale}/projects.ts`);
    assert.ok(
      /three-person|equipo de tres/i.test(source),
      `${locale}/projects.ts must state the three-person team`,
    );
  }
});

test("production profile preserves corrected scope and metric qualifications", () => {
  for (const locale of ["en", "es"]) {
    const source = read(`src/content/${locale}/experience.ts`);
    assert.match(source, /~1 h → 10 min/);
    assert.match(source, /~30%/);
    assert.doesNotMatch(source, /90[,.]000|\bSGA\b|\bIT Lead\b/);
    assert.match(source, /https:\/\/rampyapp\.com\//);
    assert.match(source, /https:\/\/pequeverso\.com\//);
    assert.match(source, /historical client projects|proyectos históricos/);
    const tokenMetric = source.slice(source.indexOf('value: "~30%"'));
    assert.match(tokenMetric.slice(0, 450), /estimat|estimación/i);
  }
});

test("client-estimated figures are labelled as estimates", () => {
  for (const [locale, marker] of [
    ["en", /estimat/i],
    ["es", /estimad/i],
  ]) {
    const source = read(`src/content/${locale}/experience.ts`);
    const position = source.indexOf("70%");
    assert.ok(position > -1, `${locale}: the cost-reduction figure is missing`);
    assert.match(
      source.slice(position, position + 400),
      marker,
      `${locale}: the 70% figure must be marked as a client estimate`,
    );
  }
});

test("locales export the same names", () => {
  const names = (file) =>
    [...read(file).matchAll(/export \{([^}]+)\} from/g)]
      .flatMap((match) => match[1].split(","))
      .map((name) =>
        name
          .trim()
          .split(/\s+as\s+/)
          .pop(),
      )
      .filter(Boolean)
      .sort();
  assert.deepEqual(names("src/content/es/index.ts"), names("src/content/en/index.ts"));
});

test("locales agree on every identifier used for routing or styling", () => {
  const identifiers = (file, key) =>
    [...read(file).matchAll(new RegExp(`${key}: "([^"]+)"`, "g"))].map((match) => match[1]).sort();
  for (const [file, key] of [
    ["projects.ts", "slug"],
    ["experience.ts", "slug"],
    ["stack.ts", "id"],
  ]) {
    assert.deepEqual(
      identifiers(`src/content/es/${file}`, key),
      identifiers(`src/content/en/${file}`, key),
      `${file}: ${key} values differ between locales`,
    );
  }
});

test("the private phone number never reaches tracked source", () => {
  // Held as fragments so the number itself is not written into this repository.
  const digits = ["2984", "686913"];
  for (const file of tracked.filter((name) => /\.(ts|tsx|css|md|json|mjs)$/.test(name))) {
    // The guard tests themselves hold the fragments they search for.
    if (file.startsWith("scripts/")) continue;
    assert.ok(
      !digits.every((fragment) => read(file).includes(fragment)),
      `${file}: contains the private phone number`,
    );
  }
});

test("external links are https and evidence links are not placeholders", () => {
  for (const file of contentFiles) {
    for (const match of read(file).matchAll(/href: "([^"]+)"/g)) {
      const href = match[1];
      if (href.startsWith("/") || href.startsWith("mailto:")) continue;
      assert.ok(href.startsWith("https://"), `${file}: ${href} is not https`);
      assert.ok(!/example\.com|TODO|PLACEHOLDER/i.test(href), `${file}: ${href} is a placeholder`);
    }
  }
});

test("the Spanish site links Spanish evidence", () => {
  const spanish = read("src/content/es/projects.ts");
  assert.ok(
    spanish.includes('href: "/es/education"'),
    "Spanish projects should link the local Spanish academic page",
  );
  assert.ok(
    read("src/content/es/education.ts").includes("academicDocuments"),
    "Spanish education should reuse the shared local evidence catalogue",
  );
});

test("university rankings always carry their edition", () => {
  for (const locale of ["en", "es"]) {
    const source = read(`src/content/${locale}/education.ts`);
    const rankings = source.slice(source.indexOf("rankings"));
    const positions = [...rankings.matchAll(/position: "([^"]+)"/g)];
    const editions = [...rankings.matchAll(/edition: "([^"]+)"/g)];
    assert.ok(positions.length >= 2, `${locale}: expected at least two rankings`);
    assert.equal(
      editions.length,
      positions.length,
      `${locale}: every ranking position needs an edition`,
    );
    for (const edition of editions) {
      assert.match(edition[1], /\d{4}/, `${locale}: edition "${edition[1]}" names no year`);
    }
  }
});

test("no source file leaks a local filesystem path", () => {
  for (const file of sourceFiles) {
    const source = read(file);
    assert.ok(!/[A-Z]:\\\\?[Uu]sers/.test(source), `${file}: contains a Windows user path`);
    assert.ok(!source.includes("career-ops"), `${file}: references the private career repository`);
  }
});

test("client components receive content as props instead of importing the barrel", () => {
  // A "use client" file pulling the whole content index would ship both locales to the browser.
  for (const file of sourceFiles.filter((name) => name.endsWith(".tsx"))) {
    const source = read(file);
    if (!source.startsWith('"use client"')) continue;
    assert.ok(
      !/from "@\/content"/.test(source),
      `${file}: a client component must receive content as props, not import the barrel`,
    );
  }
});
