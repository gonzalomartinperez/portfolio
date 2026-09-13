import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const definitions = [
  [
    "/documents/uns-academic-transcript-2025.pdf",
    "Academic transcript (2025)",
    "Analítico académico (2025)",
    "application/pdf",
  ],
  [
    "/documents/uns-information-systems-plan-2012.pdf",
    "University curriculum (2012)",
    "Plan universitario (2012)",
    "application/pdf",
  ],
  [
    "/certificates/docker-fundamentals-2024.pdf",
    "Docker Fundamentals",
    "Fundamentos de Docker",
    "application/pdf",
  ],
  [
    "/certificates/professional-power-skills-2026.png",
    "Professional Power Skills",
    "Professional Power Skills",
    "image/png",
  ],
  [
    "/gonzalo-martin-perez-ai-software-engineer-en.pdf",
    "CV in English",
    "CV en inglés",
    "application/pdf",
  ],
  [
    "/gonzalo-martin-perez-ai-software-engineer-es.pdf",
    "CV in Spanish",
    "CV en español",
    "application/pdf",
  ],
];
const records = await Promise.all(
  definitions.map(async ([href, en, es, mime]) => {
    const bytes = await readFile(new URL(`../public${href}`, import.meta.url));
    assert(
      mime === "application/pdf"
        ? bytes.subarray(0, 5).toString() === "%PDF-"
        : bytes.subarray(1, 4).toString() === "PNG",
      `Wrong document type: ${href}`,
    );
    return {
      href,
      title: { en, es },
      mime,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  }),
);
const target = new URL("../src/content/public-documents.json", import.meta.url);
const args = process.argv.slice(2);
assert(
  args.length <= 1 && (!args.length || args[0] === "--write"),
  "Usage: node scripts/documents.mjs [--write]",
);
if (args[0] === "--write") {
  await writeFile(target, `${JSON.stringify(records, null, 2)}\n`);
  console.log("Updated explicit public document manifest; review changed hashes before release.");
} else {
  assert.deepEqual(
    JSON.parse(await readFile(target, "utf8")),
    records,
    "Public document manifest is stale",
  );
  console.log(
    `Verified ${records.length} approved public documents, signatures, sizes and hashes.`,
  );
}
