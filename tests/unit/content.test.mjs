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

const root = fileURLToPath(new URL("../../", import.meta.url));
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

const sourceFiles = tracked.filter((file) =>
  /^(src|content|config|contracts)\/.*\.(ts|tsx|css)$/.test(file),
);
const contentFiles = tracked.filter((file) => /^content\/.*\.ts$/.test(file));
const localeFiles = contentFiles.filter((file) => /^content\/(en|es)\//.test(file));

test("published-content checks include every relocated input root", () => {
  assert.ok(contentFiles.includes("content/en/profile.ts"));
  assert.ok(contentFiles.includes("content/es/profile.ts"));
  assert.equal(localeFiles.length, 18);
  for (const file of ["config/site.ts", "contracts/assistant-api/types.d.ts"]) {
    assert.ok(sourceFiles.includes(file), `${file}: missing from public-source checks`);
  }
});

test("experience architecture claims agree with the reviewed CV in both locales", () => {
  const cv = JSON.parse(read("content/cv-public.json"));
  for (const locale of ["en", "es"]) {
    const source = readWithoutComments(`content/${locale}/experience.ts`);
    const entries = cv.locales[locale].sections.find(
      (section) => section.id === "experience",
    ).entries;
    for (const [slug, cvId] of [
      ["rampy", "rampy"],
      ["teamcubation", "teamcubation"],
      ["cooperativa-obrera", "cooperativa"],
    ]) {
      const start = source.indexOf(`slug: "${slug}"`);
      assert.ok(start >= 0, `${locale}: missing experience ${slug}`);
      const next = source.indexOf("\n  {\n    slug:", start);
      const role = source.slice(start, next === -1 ? undefined : next);
      const entry = entries.find((entry) => entry.id === cvId);
      assert.ok(entry, `${locale}: missing CV experience ${cvId}`);
      for (const copy of [role, JSON.stringify(entry)]) {
        assert.match(copy, /design system/i, `${locale}: ${slug} frontend uses a design system`);
        assert.match(
          copy,
          /feature|funcionalidad/i,
          `${locale}: ${slug} frontend has feature domains`,
        );
        if (slug === "rampy") {
          // The reviewed CV release adopts Clean Architecture in a separate sync; until then it
          // may still carry the superseded hexagonal wording, which the site must not repeat.
          if (copy === role) {
            assert.match(copy, /Clean Architecture/, `${locale}: Rampy uses Clean Architecture`);
            assert.doesNotMatch(copy, /hexagonal/i, `${locale}: Rampy no longer claims hexagonal`);
            assert.doesNotMatch(copy, /OpenAI/, `${locale}: Rampy models come from Claude`);
            assert.ok(copy.includes("Claude"), `${locale}: Rampy names its primary model`);
          } else {
            assert.match(copy, /Clean Architecture|hexagonal/i, `${locale}: CV Rampy architecture`);
          }
          for (const provider of ["pgvector", "Mem0", "Vertex AI", "DeepInfra"]) {
            assert.ok(copy.includes(provider), `${locale}: Rampy includes ${provider}`);
          }
        } else {
          assert.match(
            copy,
            /layered|en capas/i,
            `${locale}: ${slug} backend uses layered architecture`,
          );
          assert.doesNotMatch(
            copy,
            /hexagonal/i,
            `${locale}: ${slug} must not claim hexagonal architecture`,
          );
        }
      }
    }
  }
});

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

test("the hero presents engineering principles rather than unattributed figures", () => {
  for (const locale of ["en", "es"]) {
    const source = read(`content/${locale}/site.ts`);
    assert.match(source, /principlesLabel:/, `${locale}: principles need an accessible label`);
    assert.match(source, /principlesLink:/, `${locale}: principles link to applied experience`);
    assert.doesNotMatch(source, /proofNote:|proof:/);
  }
});

test("Rampy response improvements retain load-test evidence and comparable workflow scope", () => {
  for (const locale of ["en", "es"]) {
    const source = read(`content/${locale}/experience.ts`);
    assert.match(source, /value: "≥2×"/);
    const agentMetric = source.slice(
      source.indexOf('value: "≥2×"'),
      source.indexOf('value: "40%"'),
    );
    assert.match(agentMetric, locale === "en" ? /[Ll]oad tests/ : /pruebas de carga/);
    assert.match(
      agentMetric,
      locale === "en"
        ? /comparable optimized agent workflows/
        : /flujos agénticos optimizados comparables/,
    );
    assert.doesNotMatch(agentMetric, /estimat|estimación/i);
    const financialMetric = source.slice(
      source.lastIndexOf('value: "≥2×"'),
      source.indexOf('value: "~1 h'),
    );
    assert.match(financialMetric, locale === "en" ? /[Ll]oad-tested/ : /pruebas de carga/);
    assert.match(financialMetric, /vault|mercados/);
    assert.doesNotMatch(financialMetric, /estimat|estimación/i);
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
    const source = read(`content/${locale}/projects.ts`);
    assert.ok(
      /three-person|equipo de tres/i.test(source),
      `${locale}/projects.ts must state the three-person team`,
    );
  }
});

test("production profile preserves corrected scope and metric qualifications", () => {
  for (const locale of ["en", "es"]) {
    const source = read(`content/${locale}/experience.ts`);
    assert.match(source, /~1 h → 10 min/);
    assert.match(source, /value: "40%"/);
    assert.match(source, /value: "90%\+"/);
    assert.match(source, /value: "95%\+"/);
    assert.doesNotMatch(source, /value: "~7–8 s/);
    assert.doesNotMatch(source, /90[,.]000|\bSGA\b|\bIT Lead\b/);
    assert.match(source, /https:\/\/getrampy\.com\//);
    assert.match(source, /https:\/\/pequeverso\.com\//);
    assert.match(source, /historical client projects|proyectos históricos/);
    const tokenMetric = source.slice(source.indexOf('value: "40%"')).slice(0, 450);
    assert.match(tokenMetric, locale === "en" ? /load tests and evals/ : /pruebas de carga/);
    assert.doesNotMatch(tokenMetric, /estimat|estimación/i);
  }
});

test("retired claims stay out of the published experience", () => {
  for (const locale of ["en", "es"]) {
    const source = readWithoutComments(`content/${locale}/experience.ts`);
    assert.doesNotMatch(source, /70%/, `${locale}: the client cost estimate was retired`);
    assert.doesNotMatch(source, /7–8 s/, `${locale}: mobile startup is no longer featured`);
    const rampy = source.slice(
      source.indexOf('slug: "rampy"'),
      source.indexOf('slug: "teamcubation"'),
    );
    assert.doesNotMatch(rampy, /Kotlin|Swift/, `${locale}: Rampy mobile is React Native`);
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
  assert.deepEqual(names("content/es/index.ts"), names("content/en/index.ts"));
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
      identifiers(`content/es/${file}`, key),
      identifiers(`content/en/${file}`, key),
      `${file}: ${key} values differ between locales`,
    );
  }
});

test("the private phone number never reaches tracked source", () => {
  // Held as fragments so the number itself is not written into this repository.
  const digits = ["2984", "686913"];
  for (const file of tracked.filter((name) => /\.(ts|tsx|css|md|json|mjs)$/.test(name))) {
    // These two existing guards own fragmented sentinels; production files have no exemption.
    if (["tests/unit/content.test.mjs", "tests/integration/rendered.test.mjs"].includes(file))
      continue;
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
  const spanish = read("content/es/projects.ts");
  assert.ok(
    spanish.includes('href: "/es/education"'),
    "Spanish projects should link the local Spanish academic page",
  );
  assert.ok(
    read("content/es/education.ts").includes("academicDocuments"),
    "Spanish education should reuse the shared local evidence catalogue",
  );
});

test("university rankings always carry their edition", () => {
  for (const locale of ["en", "es"]) {
    const source = read(`content/${locale}/education.ts`);
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
