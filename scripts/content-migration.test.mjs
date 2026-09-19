import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { filomenaGallery } from "../src/content/filomena-gallery.ts";
import { getTechnology, technologyCatalog, technologyGroups } from "../src/content/technologies.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("catalogue preserves AI-first breadth with grounded additions", () => {
  assert.ok(technologyCatalog.length >= 109, "preserve the existing catalogue breadth");
  for (const id of [
    "agno",
    "mem0",
    "celery",
    "react-native",
    "kotlin",
    "digitalocean",
    "infisical",
    "morpho",
    "aave",
    "compound",
    "defi",
    "privy",
    "token-swaps",
    "vaults",
    "protocol-integrations",
    "perpetual-futures",
    "non-custodial-wallets",
    "user-authorization",
    "transaction-execution",
  ]) {
    assert.equal(getTechnology(id)?.status, "applied", `${id}: approved production experience`);
    assert.ok(getTechnology(id)?.evidence.some(({ href }) => href === "/work#rampy"));
  }
  for (const id of [
    "erc-4337",
    "erc-4626",
    "eip-712",
    "account-abstraction",
    "smart-accounts",
    "erc-20",
  ]) {
    assert.equal(
      getTechnology(id)?.status,
      "developing",
      `${id}: integration work does not automatically establish every standard`,
    );
  }
  assert.deepEqual(
    technologyGroups.slice(0, 4).map((entry) => entry.id),
    ["applied-ai", "languages", "backend", "data"],
  );
  for (const id of [
    "docker-compose",
    "server-side-rendering",
    "single-page-applications",
    "input-validation",
    "health-checks",
  ]) {
    const entry = getTechnology(id);
    assert.equal(entry?.status, "applied");
    assert.deepEqual(entry.evidence, [{ label: "Filomena", href: "/work/filomena" }]);
  }
  assert.equal(getTechnology("SSR")?.id, "server-side-rendering");
  assert.equal(getTechnology("SPA")?.id, "single-page-applications");
  assert.equal(getTechnology("Swagger")?.id, "openapi");
  assert.equal(getTechnology("Data modeling")?.id, "data-modelling");
});

test("localized case studies retain local context and the safe gallery", () => {
  assert.equal(filomenaGallery.length, 43);
  for (const locale of ["en", "es"]) {
    const project = read(`src/content/${locale}/projects.ts`);
    assert.doesNotMatch(project, /notion\.(?:site|com)|rxresu\.me/);
    assert.ok(project.includes(locale === "en" ? 'href: "/education"' : 'href: "/es/education"'));
    assert.ok(project.includes("Docker Compose"));
    assert.ok(project.includes("43"));
    assert.match(project, /three-person|tres personas/);
    assert.match(project, /snapshot|versiones públicas/);
  }
});
