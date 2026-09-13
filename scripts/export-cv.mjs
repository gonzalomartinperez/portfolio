import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const sectionIds = ["experience", "skills", "education", "projects", "languages", "certifications"];
const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (text) => text.replace(/&([a-z]+);/g, (match, name) => entities[name] ?? match);
const localized = (value, locale) =>
  value && typeof value === "object" && !Array.isArray(value) && "en" in value && "es" in value
    ? value[locale]
    : value;

export function safeLink(value) {
  if (!value) return "";
  const url = new URL(value);
  assert.equal(url.protocol, "https:", "Only HTTPS evidence links are exportable");
  assert(!url.username && !url.password, "Credentials are not public evidence");
  assert(
    !["notion.site", "notion.so", "notion.com", "rxresu.me", "reactive-resume.com"].some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
    ),
    "External resume dependency",
  );
  return url.href;
}

export function inlineRuns(html) {
  const runs = [];
  let bold = false;
  let href = "";
  for (const token of html.match(/<[^>]*>|[^<]+/g) ?? []) {
    if (!token.startsWith("<")) {
      runs.push({ text: decode(token), bold, href });
    } else if (token === "<strong>") bold = true;
    else if (token === "</strong>") bold = false;
    else if (token === "</a>") href = "";
    else if (/^<a\s/.test(token)) {
      assert(
        /^<a href="[^"]+"(?: target="_blank")?(?: rel="noreferrer")?>$/.test(token),
        "Unsupported link markup",
      );
      href = safeLink(token.match(/href="([^"]+)"/)[1]);
    } else assert(/^<\/?(?:p|li)>$/.test(token), `Unsupported editorial markup: ${token}`);
  }
  assert(!bold && !href, "Unclosed inline formatting");
  return runs;
}

export function exportCv(source, facts) {
  assert.equal(source.schemaVersion, 1);
  assert.equal(facts.schemaVersion, 1);
  assert.equal(source.revision, facts.revision, "Source revision differs from facts");
  const byId = new Map(facts.facts.map((fact) => [fact.id, fact]));
  assert.equal(byId.size, facts.facts.length, "Duplicate fact IDs");
  const resolveFact = (id) => {
    const fact = byId.get(id);
    assert.equal(fact?.status, "confirmed", `Unconfirmed or missing fact: ${id}`);
    return fact.fields;
  };
  const identity = resolveFact(source.identityRef);
  assert.equal(identity.name, "Gonzalo Martin Perez");
  const locales = Object.fromEntries(
    ["en", "es"].map((locale) => {
      const text = (value) => localized(value, locale) ?? "";
      const resolve = (html) =>
        inlineRuns(
          text(html).replace(/\{\{fact:([a-z0-9-]+)\}\}/g, (_, id) => text(resolveFact(id).value)),
        );
      return [
        locale,
        {
          name: identity.name,
          email: identity.email,
          location: text(identity.location),
          headline: text(source.headlines.general),
          summaryTitle: text(source.summaryTitle),
          summary: resolve(source.summaries.general),
          sections: source.sectionOrder
            .filter((id) => sectionIds.includes(id))
            .map((id) => {
              const section = source.sections.find((item) => item.id === id);
              assert(section && !section.hidden, `Missing public CV section: ${id}`);
              return {
                id,
                title: text(section.title),
                entries: section.entries
                  .filter((entry) => !entry.hidden)
                  .map((entry) => {
                    const fields = resolveFact(entry.factRef);
                    const website = text(fields.website);
                    return {
                      id: entry.id,
                      title: text(
                        fields.company ??
                          fields.school ??
                          fields.name ??
                          fields.language ??
                          fields.title,
                      ),
                      subtitle: text(
                        fields.position ?? fields.degree ?? fields.fluency ?? fields.issuer,
                      ),
                      details: [fields.period, fields.location, fields.grade, fields.date]
                        .filter(Boolean)
                        .map(text),
                      href: safeLink(website?.url),
                      keywords: fields.keywords ?? [],
                      blocks: entry.blocks.map((block) => {
                        for (const evidence of block.evidenceRefs) resolveFact(evidence);
                        assert(["paragraph", "bullet"].includes(block.kind));
                        return { id: block.id, kind: block.kind, runs: resolve(block.html) };
                      }),
                    };
                  }),
              };
            }),
        },
      ];
    }),
  );
  return { schemaVersion: 1, revision: source.revision, locales };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [sourcePath, factsPath, releasePath] = process.argv.slice(2);
  assert(
    sourcePath && factsPath && releasePath && process.argv.length === 5,
    "Usage: node scripts/export-cv.mjs <approved-editorial-json> <verified-facts-json> <reviewed-release-manifest>",
  );
  const sourceBytes = await readFile(sourcePath);
  const factsBytes = await readFile(factsPath);
  const result = exportCv(JSON.parse(sourceBytes), JSON.parse(factsBytes));
  const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
  result.provenance = { sourceSha256: sha256(sourceBytes), factsSha256: sha256(factsBytes) };
  const release = JSON.parse(await readFile(releasePath, "utf8"));
  assert.equal(release.revision, result.revision, "PDF release revision is stale");
  assert.equal(
    release.sourceHash,
    result.provenance.sourceSha256,
    "PDF source differs from web source",
  );
  assert.equal(release.factsHash, result.provenance.factsSha256, "PDF facts differ from web facts");
  assert.equal(release.review?.visualQA, true, "PDF release needs visual review");
  result.provenance.pdfSha256 = Object.fromEntries(
    ["en", "es"].map((locale) => {
      const hash = release.files[`gonzalo-martin-perez-ai-software-engineer-${locale}.pdf`];
      assert.match(hash, /^[a-f0-9]{64}$/, "Missing reviewed PDF hash");
      return [locale, hash];
    }),
  );
  await writeFile(
    new URL("../src/content/cv-public.json", import.meta.url),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(`Exported bilingual public CV revision ${result.revision}; private fields excluded.`);
}
