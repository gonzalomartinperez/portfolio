# Target state

Part of the [master plan](README.md). Applies [ecosystem.md](ecosystem.md) sections 9, 10 and 13 to this repository. Pragmatic Clean Architecture: the dependency rule is mandatory and enforced by a guard with negative fixtures and an empty violation baseline (rubric D1); layers exist only where they carry weight. A static, single-author site with a handful of I/O boundaries does not get use-case classes, repositories over static content or a DI container (owner decision O3).

## 1. Principles

1. Inward dependencies: `domain` imports nothing from the app; `application` orchestrates ports; `adapters` touch the world (WebGL, network, storage, DOM observers); `presentation` renders. Content, copy and config are plain typed data.
2. Server by default. Client islands are small, named and justified; a client module never imports a content module wholesale.
3. One owner per concern: GPU contexts (`shared/scene`), page motion state (`shared/motion`), theme authority (`data-theme`), tokens (`src/design`), facts (`content/` single-sourced from `career-ops` for the CV).
4. Everything that can be pure is pure and unit-tested at the domain layer (hero figure geometry, timeline, matching, easing, tier selection, cloud layout, catalogue queries, analytics rules).
5. Keep what the guard already proves; add rules, do not replace the guard (PF-D28).

## 2. Target layout

```
app/                 Next.js routes only; wraps views, no logic
src/
  app/               routes, layout, fonts, globals.css (12 lines), metadata
  design/            tokens/*.tokens.json (DTCG), theme.css (generated), motion tokens
  views/             page compositions (registered root, paired-site contract)
  shell/             header, footer, locale and theme controls, motion toggle, progress rail
  features/<f>/      domain | application | adapters | presentation (+ entry.tsx facade)
    hero/            domain/figures/*, sequence, matching, rng, easing, tier
                     adapters/gpu/* (engine, shaders, worker, satellites), catalogue-journey
                     presentation/ (stage, hud, controls, posters)
    solar-system/    unchanged layers; ambient 512 px set; route policy
    assistant/, analytics/, architecture-diagrams/, technology-catalogue/, tool-carousel/, project-gallery/
  shared/            ui, editorial, identity (mark, monogram), motion, scene, technology, navigation, contact, styles
content/             typed EN/ES copy, CV snapshot, facts, technologies/*.ts (split)
config/              locales, routes, site, solar-textures, env.ts
contracts/assistant-api/   imported snapshot (revision + SHA-256)
media/               source masters (identity, company originals)
tools/               TypeScript scripts, guard, scorecard; tools/api-contract (isolated)
tests/               unit | integration | browser | helpers | rollout
ratchets/            monotonic baselines (JSON)
```

New registered roots to add to the architecture policy: `src/design`, `src/shared/scene`, `ratchets`. `src/views` and `src/shell` stay registered (PF-D6).

## 3. Dependency rules and guard

The guard stays `tools/architecture.ts` (converted from `.mjs`) plus its policy file, tested by `tests/unit/architecture.test.ts` with negative fixtures. It runs in `npm run check`, pre-commit and CI.

| Rule | Statement | Negative fixture (must fail) |
|---|---|---|
| G1 | Within a feature: domain imports nothing from application, adapters or presentation; application imports domain; adapters import domain and application; presentation imports domain and application, never adapters (except through the feature `entry.tsx`) | `domain` importing an adapter |
| G2 | A feature imports another feature only through its registered public entry | `features/hero` importing `features/solar-system/adapters/*` |
| G3 | `src/app` imports only `views`, `shell`, `config`, `content`, `shared` and registered feature entries | route importing a feature adapter |
| G4 | Production modules never import `tools/` or `tests/` | `src/` importing `tools/` |
| G5 | Client modules (`"use client"` and their imports) never import `content/technologies/*`, `content/cv-public.json` or any module over 20 KB; they receive serialisable props | client component importing the technologies catalogue |
| G6 | `process.env` is read only in `config/env.ts` (and `next.config.mjs`) | `src/` reading `process.env.X` |
| G7 | No provider key, analytics write key or secret-shaped string in client output (forbidden-string scan of `.next/static`) | fixture build containing a fake key |
| G8 | No colour, spacing, z-index, duration, easing or breakpoint literals in CSS, CSS Modules or TSX class strings outside `src/design` and a listed allowlist (`tools/css-policy.ts`) | `color: #fff` in a module |
| G9 | `WebGLRenderer`, `getContext("webgl*")` and `OffscreenCanvas` allowed only in registered scene adapters under `shared/scene` and `features/*/adapters/gpu`; every renderer is created through `SceneHost` | `new WebGLRenderer` in a view |
| G10 | No new `.js/.mjs/.cjs` outside the exception list (section 7) | new `.mjs` file |
| G11 | No `gsap` import (after PF-D2), no `transition: all`, no animation of layout properties (`width`, `height`, `top`, `left`, `margin`) in CSS | `transition: all` |
| G12 | A component that mounts a continuous render loop reads `usePageMotionPaused` and `prefers-reduced-motion` (registered scene components only) | scene component without the hook |

Additional static gates: Biome `noImportCycles`, `noRestrictedImports`, `noPrivateImports`, `noUndeclaredDependencies`, `knip` (unused files, exports, dependencies), cognitive complexity <= 15 ratcheting to 10 (`noExcessiveCognitiveComplexity`; Biome has no cyclomatic rule, so the deviation from "complexity <= 10" is the cognitive metric at the same ratchet). The violation baseline is empty at M4; until then the guard runs in report mode with the count in `ratchets/static.json`.

## 4. Server and client boundaries

| Concern | Rule |
|---|---|
| Pages | Server Components; `views/*` compose sections; copy is passed as props |
| Client islands | Header interactions (menu, theme, locale, motion toggle), hero stage, ambient field, solar explorer, catalogue filters, carousel, gallery lightbox, architecture canvas (lazy), assistant host (not emitted when disabled) |
| `server-only` | Content loaders and metadata builders that read `content/` are marked; `config/env.ts` is server-only plus a typed public subset |
| Static rendering | Every public route prerendered; `generateStaticParams` for locales; no per-request rendering (keeps the CSP decision open, PF-D25) |
| Third parties | None in the initial route; analytics and assistant ship no code when their build flags are off (kept test: `test:assistant-disabled`) |

## 5. Scene architecture (hero and solar)

One contract for every GPU scene; the hero v2 and the solar field both implement it ([hero-particles.md](hero-particles.md), [design-playbook.md](design-playbook.md) section 7).

| Part | Responsibility |
|---|---|
| `SceneHost` (`shared/scene/scene-host.ts`) | Route opt-in table, the only place a context is created, at most one animating context on mobile, tier selection, pause and dispose, context-loss handling, budget counters exposed to tests (`window.__scene` in QA builds only) |
| `FrameScheduler` | Single `requestAnimationFrame` owner; `dt`-based damping (`1 - exp(-k dt)`); 30 fps cap behind content; render on demand after 10 s idle |
| `QualityGovernor` | Pure function from a 2 s frame-time average, `deviceMemory`, `hardwareConcurrency`, pointer type and Save-Data to tier 0-3; DPR drops before density; never re-attempts a higher tier in the session |
| `ScrollProgress` (`shared/scene/scroll-progress.ts`) | Replaces GSAP `ScrollTrigger` (used only to read journey progress in `scene-runtime.ts`): passive scroll plus `ResizeObserver`, rAF-coalesced |
| Route policy | `/` hero live (tier-gated) plus solar live on desktop only (30 fps) and frozen poster on mobile; `/stack` solar live; solar explorer dialog streams 1024/2048 maps on open; `/work`, `/work/*`, `/about`, `/education`, `/cv`, `/contact`, 404: poster, 0 contexts, 0 texture requests |

## 6. Content, facts and single sourcing

- `content/` stays typed data; EN and ES modules share one interface; a test fails when keys differ; plurals and numbers go through `Intl`.
- `content/technologies.ts` (2,766 lines) splits by category into `content/technologies/*.ts` with stable ids and a schema test; client bundles receive only the fields they render (G5).
- CV: `career-ops` owns the CV. `content/cv-public.json` and the PDFs are snapshots produced by `tools/export-cv.ts` with a hash; `cv:sync:check` stays required; a unit test asserts that dates, titles and employers appear in exactly one module and that copy modules reference `content/experience-facts.ts`.
- Facts-to-site test (PF-D29): `tests/unit/facts-sync.test.ts` loads `career-ops` facts through the synced snapshot (`content/cv-public.json` plus `content/facts-snapshot.json`, hash-checked against `perfil/datos/hechos-cv.json`) and fails when any number, date, title, employer or metric rendered in EN or ES copy is not derivable from it; M6 copy refresh depends on it.
- Proof content (metrics, evals, production numbers): each entry carries `source` and `approvedBy` fields; unapproved entries cannot render (PF-D26).
- Assistant contract: `contracts/assistant-api/` is a snapshot with revision and SHA-256 (ecosystem 18.1); the site consumes generated types; refreshes are task PRs; the consumer compile job runs in the `contract` profile.
- Events: the site emits product-interaction events (default-off); `web-vital` is a new event that needs a handoff with the API owner before it exists (PF-D24, roadmap PF-M4-9).
- Single-theme authority: `data-theme` on `<html>`, pre-paint script in the root layout, cookie mirror added so the server can render the theme without a flash (ecosystem 13).

## 7. TypeScript policy and `.js/.mjs/.cjs` destinations

Policy (ecosystem 10.1): TypeScript 7 as `tsc` hard gate; `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` (per-file opt-out with a comment), `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noImplicitOverride`; `allowJs` off at M4; Node subpath `imports` instead of `paths` aliases where the toolchain allows (Next resolves `tsconfig` paths; migrate when `typedRoutes` is on); scripts are `.ts` run by Node type stripping (>= 24.12, the repo pins 24.22.0), never `tsx`.

Every one of the 39 `.mjs` files has a destination below; there are no `.js` or `.cjs` files.

| # | File | Lines | Destination | Reason |
|---|---|---|---|---|
| 1 | `next.config.mjs` | 77 | `next.config.mjs (exception)` | Must stay .mjs: Hostinger glibc 2.28 cannot load next.config.ts through SWC (docs/deployment.md); JSDoc-typed and checked by tsc; adds CSP report-only, image config |
| 2 | `postcss.config.mjs` | 5 | `postcss.config.mjs (exception)` | Tailwind PostCSS loader cannot load TS config; the only other .mjs exception |
| 3 | `tests/integration/budget.test.mjs` | 189 | `tests/integration/budget.test.ts` | Same; budget and rendered tests stay build-output integration tests |
| 4 | `tests/integration/rendered.test.mjs` | 297 | `tests/integration/rendered.test.ts` | Same; budget and rendered tests stay build-output integration tests |
| 5 | `tests/unit/academic.test.mjs` | 54 | `tests/unit/academic.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 6 | `tests/unit/architecture.test.mjs` | 800 | `tests/unit/architecture.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 7 | `tests/unit/browser-ci-planner.test.mjs` | 177 | `tests/unit/browser-ci-planner.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 8 | `tests/unit/catalogue.test.mjs` | 401 | `tests/unit/catalogue.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 9 | `tests/unit/ci-build-artifact.test.mjs` | 118 | `tests/unit/ci-build-artifact.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 10 | `tests/unit/ci-build-provenance.test.mjs` | 321 | `tests/unit/ci-build-provenance.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 11 | `tests/unit/cloud-layout.test.mjs` | 169 | `tests/unit/cloud-layout.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 12 | `tests/unit/content-migration.test.mjs` | 92 | `tests/unit/content-migration.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 13 | `tests/unit/content.test.mjs` | 325 | `tests/unit/content.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 14 | `tests/unit/cv-export.test.mjs` | 82 | `tests/unit/cv-export.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 15 | `tests/unit/dependency-policy.test.mjs` | 446 | `tests/unit/dependency-policy.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 16 | `tests/unit/nightly-candidate.test.mjs` | 217 | `tests/unit/nightly-candidate.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 17 | `tests/unit/repository.test.mjs` | 262 | `tests/unit/repository.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 18 | `tests/unit/scene-budget.test.mjs` | 105 | `tests/unit/scene-budget.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 19 | `tests/unit/secret-scan.test.mjs` | 241 | `tests/unit/secret-scan.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 20 | `tests/unit/workflow-policy.test.mjs` | 557 | `tests/unit/workflow-policy.test.ts` | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| 21 | `tools/architecture-policy.mjs` | 133 | `tools/architecture-policy.ts` | Guard stays custom (AST, registered roots, negative fixtures); adds Biome noImportCycles and knip alongside |
| 22 | `tools/architecture.mjs` | 540 | `tools/architecture.ts` | Guard stays custom (AST, registered roots, negative fixtures); adds Biome noImportCycles and knip alongside |
| 23 | `tools/browser-ci-planner.mjs` | 239 | `tools/browser-ci-planner.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 24 | `tools/capture-gallery.mjs` | 180 | `tools/capture-gallery.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 25 | `tools/check-assistant-contract.mjs` | 16 | `tools/check-assistant-contract.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 26 | `tools/check-browser-runtime.mjs` | 22 | `tools/check-browser-runtime.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 27 | `tools/ci-build-artifact.mjs` | 113 | `tools/ci-build-artifact.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 28 | `tools/ci-build-provenance.mjs` | 283 | `tools/ci-build-provenance.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 29 | `tools/dependency-policy.mjs` | 312 | `tools/dependency-policy.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 30 | `tools/export-cv.mjs` | 181 | `tools/export-cv.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 31 | `tools/generate-identity.mjs` | 75 | `tools/generate-identity.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 32 | `tools/nightly-candidate.mjs` | 73 | `tools/nightly-candidate.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 33 | `tools/scene-budget-plugin.mjs` | 70 | `tools/scene-budget-plugin.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 34 | `tools/secret-scan.mjs` | 256 | `tools/secret-scan.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 35 | `tools/smoke-test.mjs` | 69 | `tools/smoke-test.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 36 | `tools/technology-illustrations.mjs` | 53 | `tools/technology-illustrations.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 37 | `tools/test-server.mjs` | 62 | `tools/test-server.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 38 | `tools/test-site.mjs` | 27 | `tools/test-site.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| 39 | `tools/workflow-policy.mjs` | 313 | `tools/workflow-policy.ts` | Node type stripping (>= 24.12) runs .ts directly; no tsx |

Guard rule G10 (section 3) forbids new JavaScript; `next.config.mjs` stays JSDoc-typed (`// @ts-check`) and is covered by `tsc`.

## 8. ADRs to write (MADR 4, `docs/decisions/`)

| # | Title | Decision and confirmation |
|---|---|---|
| 0001 | Site architecture parity (moved from `docs/adr/`) | Existing |
| 0002 | Feature-first layers and registered roots (PF-D6, PF-D28) | Guard output empty baseline |
| 0003 | Instrument blue tokens and theme parity (PF-D3, PF-D11) | Token tests, contrast, snapshot |
| 0004 | Styling approach: Tailwind plus CVA and tokens-only CSS Modules (PF-D18) | G8 literals = 0 |
| 0005 | Scene host contract and route policy (PF-D1) | `no-webgl-on-reading-routes.spec.ts` |
| 0006 | Hero particle system v2: stateless GPU morph, WebGL2 (PF-D16, PF-D17) | Figure snapshots, frame budgets |
| 0007 | GSAP removal (PF-D2) | Bundle ratchet, G11 |
| 0008 | Motion system and View Transitions (PF-D22, PF-D23) | Fluidity and view-transition specs |
| 0009 | Hosting contract: Node 24, WASM SWC, `next.config.mjs` exception (PF-D19) | Rocky 8 job |
| 0010 | Test runner and mutation scope (PF-D8) | Spike result |
| 0011 | CSP and security headers (PF-D25) | Headers snapshot |
| 0012 | Analytics and RUM contract (PF-D24) | Contract test |
| 0013 | CV and facts single-sourcing | Sync check |
| 0014 | Dependency policy for runtime additions (ecosystem 7) | `dependency-policy` tool |

## 9. Migration order

1. M1: CI, rulesets, Dependabot, harness; no source change.
2. M2: tests and gates first (visual baselines, axe, Lighthouse, fluidity, mutation, scorecard) so every later change is measured.
3. M3: defects and budgets (scripts, textures, contexts, pause, lightbox, header, 404, images, fonts) without architecture change; `SceneHost` lands here because it is the performance fix.
4. M4: `.mjs` to TS, guard enforce with empty baseline, split of `scene-runtime.ts` and `technologies.ts`, token pipeline with aliases (no visual change), CSP spike, ADRs, content schema.
5. M5: palette swap, primitives, motion system, hero v2, solar elevation, pages, signature moments.
6. M6: mutation thresholds, residual gaps, docs, skills, independent re-score.
7. M7: release; MV: activation.

## 10. Where ceremony is declined

Ports and adapters over static content; a DI container; repository interfaces for one adapter; use-case classes for UI orchestration; a monorepo or published packages (revisit at three shared runtime packages, ecosystem E14); Storybook (the component states live in a `/_system` route behind a build flag that reuses build, Playwright and axe); a global state library (the existing `useSyncExternalStore` stores suffice); an OffscreenCanvas worker for the scenes (only if traces justify it; hero target generation is already in a worker).

## 11. Cross-repo view (kept from v1 `ecosystem.md`)

| Counterpart | Relation | Rule |
|---|---|---|
| `portfolio-assistant-api` | Provides the REST/SSE contract and session cookie; the site never sets the cookie | Snapshot with revision and SHA-256; expand/contract; site builds with `ASSISTANT_ENABLED=false` until MV |
| `portfolio-backoffice` | Reads analytics from the API; shares the Instrument blue pack | Token files copied from `engineering-standards` with a hash check; no runtime import |
| `engineering-standards` | Reusable workflows, rulesets, templates, token package | Pinned by SHA; `standards.lock` |
| `career-ops` | CV source of truth | Snapshot and hash check |
| `vps-ops` | Not a consumer: the site runs on Hostinger | No digest pins; post-deploy `build-info.json` check instead |

Release order at M7: APIs, backoffices, sites (this repo), `vps-ops` pins (no change for this repo).
