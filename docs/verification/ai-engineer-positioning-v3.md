# AI Engineer positioning v3 verification

Date: 2026-10-24. Base: `origin/develop` at `2f32dfc`.
Specification: [AI Engineer positioning v3](../specs/ai-engineer-positioning-v3.md).

## Results

| Criterion | Evidence | Result |
| --- | --- | --- |
| AC-1 | `tests/integration/rendered.test.mjs` asserts the new identity line in the server HTML | Pass |
| AC-2, AC-3 | Diff review of both locales; hero principles test in `tests/unit/content.test.mjs` | Pass |
| AC-4 | `content.test.mjs` architecture, metric and retired-claim checks; `professional-profile.spec.ts`; `work-architecture.spec.ts` | Pass |
| AC-5 | `content.test.mjs` retired-claim check; `professional-profile.spec.ts` (Teamcubation 95%+) | Pass |
| AC-6 | `catalogue.test.mjs` and `content-migration.test.mjs` evidence assertions; `architecture-diagrams.test.ts` | Pass |
| AC-7 | Locale parity and metric qualifier checks in `content.test.mjs` | Pass |

Commands: `npm run check` and `git diff --check` passed locally. Focused Chromium
desktop runs of the profile, work architecture, about and route specs passed
locally; the full browser matrix runs in required CI.

## Remaining limits

- `/cv` and the PDFs still show the previous reviewed CV release until the
  separate CV sync. The Rampy architecture assertion accepts the superseded
  hexagonal wording only in the CV projection; tighten it after that sync.
- Copy quality was reviewed against the owner's brief, not by an external reader.

## Proof-first follow-up (AC-8 to AC-16)

Date: 2026-10-24. Base: `origin/develop` at `a40aa7a`.

| Criterion | Evidence | Result |
| --- | --- | --- |
| AC-8 | Production build measured with Playwright at 375, 390, 414 and 1440 px in both locales: each proof part renders on one line on phones, the status pill is one 36 px line with its dot, no horizontal overflow; nav labels sit 11–17 px from the edge (previously 6–12) while `mobile-navigation.spec.ts` keeps full-width hit areas | Pass |
| AC-9, AC-12, AC-14 | `content.test.mjs`, `about-profile.spec.ts` (2.5+ years, no as-of date), diff review of both locales | Pass |
| AC-10 | New `catalogue.test.mjs` case: the eight entries keep source records, are excluded from the public catalogue and hero, and are absent from Rampy's stack; the hero still has 35 marks | Pass |
| AC-11 | `grep` for U+2014 in `content/` and `src/` returns only code comments | Pass |
| AC-13 | Visual review of the `/work` project card at 1440 and 390 px in both locales | Pass |
| AC-15 | Visual review of the gallery at 1440 and 390 px: 16 captures in even 3:2 rows; panel captures shown whole and not enlarged | Pass |
| AC-16 | `npm run cv:sync:check` against the approved inputs; `documents.spec.ts` and `rendered.test.mjs` check new paths, hashes and download names; a local `next start` returns 308 from the old PDF paths | Pass |

Item 4 evidence: the portfolio docs record owner confirmation only for Fine-tuning
(general skill, `docs/research/engineering-profile-2026-10-10.md`). The other eight
are not in the v3 brief or the canonical profile. The private career inventory
(`career-ops/perfil/inventario-tecnologico.md`, confirmations of 2026-09-20 to
2026-10-03) lists them for Rampy, with "application/integration only" limits for the
ML libraries. They are therefore excluded, not deleted: removing an id from
`publicTechnologyExclusions` restores it if the owner wants it back.

Commands: `npm run check`, `npm run test:architecture` (inside check), `git diff --check`
and the content-relevant Chromium desktop and mobile specs ran locally; the full
matrix runs in required CI. The `/es/cv` tagline stays in English because it comes from
the reviewed CV source.

## Restored technologies (AC-17)

Date: 2026-10-24. Base: `origin/develop` at `649ed07`.

Provenance: the owner's private career inventory
(`career-ops/perfil/inventario-tecnologico.md`, updated 2026-10-03, from direct
confirmations of 2026-09-20, 2026-09-26 and 2026-10-03) lists all eight for Rampy.
Its scope wording, applied here:

- Pydantic AI: language and API stack. Gemini: provider integration/configuration
  and evaluation/selection or fallback between providers, without training
  foundation models. MoonPay and ZeroDev: financial and Web3 integrations (fiat
  on/off-ramp; smart accounts), without inferring custody or implementation of
  every account-abstraction standard.
- NumPy, pandas, PyTorch and TensorFlow: "application/integration of models,
  processing and evaluation for agents and user experience". The inventory forbids
  claiming training, fine-tuning, ML research or building own models with them.

No private text is copied into public content; only the scope limits shape the labels.

| Check | Evidence | Result |
| --- | --- | --- |
| Four integrations restored with Rampy evidence | `catalogue.test.mjs` restored-technologies case; records unchanged since before #194 | Pass |
| ML libraries on `/stack` only, labelled application/integration use | Same case: in `publicTechnologyCatalog`, absent from `highlightedTechnologyCatalog` and the hero scene, absent from Rampy's stack; `tool-carousel.spec.ts` compares against the highlighted list | Pass |
| No training claim | Labels and Rampy copy checked for "training" / "entrenamiento" / "fine-tun"; Fine-tuning keeps `/work` evidence only | Pass |
| Visual | `/stack` screenshots at 1440 and 390 px in EN and ES | Pass |
