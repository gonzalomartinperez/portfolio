# Audit: measured baseline (2026-11-09)

Part of the [master plan](README.md). Revision: `origin/develop` `0a1ff56` (same content as `main` `19954ee`). Live site: https://gonzalomartinperez.com. Evidence is under [audit/](audit/) (`audit/SUMMARY.md` and the raw files named below). The v1 UX audit of 2026-10-24 is kept at `docs/master-plan/audit/baseline-2026-10.md` (revision `b5b3c57`) for history.

Method: Lighthouse 13.5.0 (Chromium 1252, headless, SwiftShader WebGL; 3 runs per route and preset except `/es`: 1), axe-core with `wcag22aa` through Playwright (72 page states), keyboard tab-stop probe, WebGL/network probe per route, overflow probe (216 Chromium states from 320 to 1920 px, both themes), WebKit iPhone 15 and Firefox 390 captures, and a clean checkout run of `npm ci`, lint, typecheck, unit tests with coverage, build and budget tests. The machine was loaded (load average 10-13 on 4 cores, concurrent audit agents), so TBT and LCP carry a wide margin of error; byte counts, counts of contexts, tab stops and violations are not affected.

## 1. Numbers

### 1.1 Lighthouse (lab, median of runs; `audit/lighthouse-summary.md`)

| Route preset | Runs | Perf | A11y | BP | SEO | FCP s | LCP s | TBT ms | CLS | JS KiB transferred |
|---|---|---|---|---|---|---|---|---|---|---|
| home mobile | 3 | **35** | 100 | 100 | 100 | 2.54 | **6.20** | 153,711 | 0.004 | 451 |
| home desktop | 3 | 55 | 100 | 100 | 100 | 0.87 | 1.57 | 33,298 | 0 | 451 |
| `/es` mobile | 1 | 43 | 100 | 100 | 100 | 2.33 | 4.58 | 142,774 | 0.004 | 451 |
| `/es` desktop | 1 | 57 | 100 | 100 | 100 | 0.72 | 1.60 | 24,032 | 0 | 451 |
| Filomena mobile | 3 | **39** | 99 | 100 | 100 | 2.38 | **5.82** | 149,253 | 0 | 465 |
| Filomena desktop | 3 | 59 | 99 | 100 | 100 | 0.66 | 1.56 | 27,206 | 0 | 465 |
| `/cv` mobile | 3 | 55 | 100 | 100 | 100 | 1.85 | **3.50** | 142,416 | 0 | 395 |
| `/cv` desktop | 3 | 58 | 100 | 100 | 100 | 0.63 | 1.58 | 30,168 | 0 | 395 |
| `/contact` mobile | 3 | 50 | 100 | 100 | 100 | 1.98 | 4.18 | 137,082 | 0 | 395 |
| `/contact` desktop | 3 | 60 | 100 | 100 | 100 | 0.67 | 1.44 | 20,665 | 0 | 395 |
| `/es/contact` mobile | 1 | 42 | 100 | 100 | 100 | 1.89 | 5.61 | 140,188 | 0 | 395 |
| `/es/contact` desktop | 1 | 58 | 100 | 100 | 100 | 0.67 | 1.54 | 24,506 | 0 | 395 |

TBT of 20-154 seconds is a SwiftShader artifact (WebGL on the CPU) and is not a user-facing number; it is the reason the CI lane disables 3D APIs (PF-D5). Reference for that lane from v1 (2026-10-24, `--disable-3d-apis`, `docs/master-plan/audit/baseline-2026-10.md` 1.2): home mobile perf 60, LCP 4.39 s, TBT 991 ms; Filomena mobile 52 / 5.88 s; about mobile 65 / 5.94 s. The LCP element is server-rendered text; the delay is render delay behind JavaScript. SEO for `/es` is now 100 (v1: 92, `lang` and hreflang fixed).

### 1.2 Transfer and scripts (`audit/webgl-results.json`, `audit/bundle-per-route.txt`)

| Measure | Value |
|---|---|
| JS transferred per route (Lighthouse) | 395-465 KiB (target 90-110 KiB gzip initial) |
| Sum of `<script src>` in prerendered HTML, gzip | 226.2-239.9 KiB per route in 12-15 files (raw 712-746 KiB); `/` 234.9 KiB gz, 13 scripts |
| Prerendered HTML gzip | `/` 64.6 KiB, `/es` 66.0 KiB, other routes 10.9-30.5 KiB |
| Desktop total bytes | `/` 3.48 MB (172 requests), `/work` 3.23 MB, `/work/pequeverso` 4.26 MB, `/cv` 3.14 MB, `/contact` 3.13 MB |
| Solar textures ("other" bytes) on desktop | 2.21-2.25 MB on **every** route; Lighthouse mobile total 2.2 MB of which 1.37 MB textures |
| Fonts | 135 KB, three families (Inter, Inter Tight, JetBrains Mono through `next/font/google`) |
| CSS | 27.1-27.6 KB on the wire (budget test: 25 KiB gzip) |
| Existing budget test (`audit/budget.log`) | 12 of 12 pass: deferred scenes 250 KiB gz, non-scene chunks < 80 KiB gz each, HTML < 70 KB gz, textures < 8 MiB |

### 1.3 WebGL contexts and canvases (`audit/webgl-results.json`)

| Route | getContext calls | Canvases | Rule |
|---|---|---|---|
| `/` | 3 (two renderers plus the software-renderer probe canvas in `solar-system-engine.ts:78`) | 2 | at most 1 animating context |
| `/work`, `/work/filomena`, `/work/pequeverso`, `/about`, `/education`, `/stack`, `/cv`, `/contact` | 2 | 1 | `/cv`, `/education`, `/contact`, `/about` must be 0 |

### 1.4 Accessibility and layout

| Check | Result | Evidence |
|---|---|---|
| axe `wcag22aa`, 72 states (routes x EN/ES x dark/light x 390/1280) | 0 serious or critical; 8 moderate `heading-order` (1 node each, Filomena diagram, 2 locales x 2 themes x 2 widths); 383 `label-content-name-mismatch` nodes reported in v1 are fixed | `audit/axe-results.json` |
| Lighthouse accessibility | 100 on 10 of 12 route presets; 99 on both Filomena presets | `audit/lighthouse-summary.md` |
| Tab stops to the primary CTA | 12 on `/` and `/es`, desktop and mobile, both themes (v1: 100+); focus ring 2 px on the first 12 stops; several 20 px high inline stops in the carousel and cards | `audit/keyboard-results.json` |
| Horizontal overflow | 0 of 216 Chromium states (320, 390, 768, 1024, 1440, 1920 x 2 themes x routes) | `audit/overflow-chromium.json` |
| Page height at 390 | `/` 21,497 px, `/work/filomena` 20,441, `/stack` 29,994, `/cv` 8,803 (at 320: 24,797 / 21,313 / 30,752 / 10,241) | same |
| WebKit iPhone 15, Firefox 390 captures | No overflow; screenshots retained in the audit workspace | `audit/engines-results.json` |

### 1.5 Repository checks on a clean checkout (`audit/timings.txt`, `audit/npm-ci-timing.txt`)

| Step | Result |
|---|---|
| `npm ci` | cold 3 m 43 s, warm 37 s |
| Biome | exit 0 in 1 s, 3 warnings (`noDescendingSpecificity`, `src/shell/site-header.module.css:147`) |
| `tsc` (TypeScript 7.0.2) | exit 0, 5 s |
| Unit tests (`node:test`) | 344 tests, 342 pass, 2 fail (`tests/unit/content.test.mjs`, `tests/unit/repository.test.mjs`: they need git history, absent in the audit copy; CI uses `fetch-depth: 0`) |
| Coverage (all files, mostly `tools/`) | lines 94.56, branches 91.36, functions 90.67 |
| Build (`next build --webpack`) | 91 s |
| Budget tests | 12 of 12 pass in 1 s |
| `check:quality` aggregate | exit 1 in 9 s because of the two unit failures above |
| Tracked files | 752 (src 173 files / 19,403 lines; tests 87 / 13,847; tools 27 / 4,397; content 35 / 7,966; docs 136 / 14,373) |
| JavaScript files | 39 `.mjs` (18 tests, 19 tools, `next.config.mjs`, `postcss.config.mjs`) |

## 2. Findings

Severity: P0 = blocks the 95 target for a primary lens and is visible to every visitor; P1 = required for 95; P2 = polish or hygiene. IDs are used by [roadmap.md](roadmap.md) acceptance criteria.

### P0

| ID | Finding | Evidence | Plan |
|---|---|---|---|
| F1 | Mobile performance far from budget: home 35 / LCP 6.2 s, Filomena 39 / 5.8 s, `/cv` 55 / 3.5 s; 395-465 KiB JS per route against 90-110 KiB | lighthouse-summary.md; bundle-per-route.txt | PF-M3-1, PF-M3-3 |
| F2 | 1.37 MB (mobile) and 2.22 MB (desktop) of solar textures downloaded on every route, including reading routes | webgl-results.json (`otherBytes`, `bigOther`) | PF-M3-2 (PF-D1) |
| F3 | WebGL contexts where the rule says none (`/cv`, `/contact`, `/education`, `/about`) and an extra probe context on home | webgl-results.json; `solar-system-engine.ts:78` | PF-M3-2 |

### P1

| ID | Finding | Evidence | Plan |
|---|---|---|---|
| F4 | No motion pause UI: `setPageMotionPaused` in `src/shared/motion/motion-state.ts` is exported but nothing calls it (WCAG 2.2.2 for the ambient scenes) | repo read | PF-M3-4 |
| F5 | Gallery lightbox ignores the active filter | `gallery-carousel.tsx:137-141` | PF-M3-5 |
| F6 | Header not sticky below 26 rem | Open from v1 per the 2026-11-09 re-baseline brief; fix belongs to `src/shell/site-header.module.css` | PF-M3-6 |
| F7 | `/es` 404 renders English | `src/app/not-found.tsx` (single, non-locale) | PF-M3-7 |
| F8 | 11 unoptimised raster images in `public/` (jpg/png under `public/images/companies`, `institutions`, `certificates`): 9 get action `convert` in file-index.csv and 2 (`rampy-original.jpg`, `teamcubation-original.jpg`) are source masters with action `move` to `media/` | file-index.csv actions `convert` and `move` | PF-M3-8 |
| F9 | Light mode is a compatibility theme (ground `#fafafb`, accent teal-leaning `#0a6e9b`, `--field-additive: 0`, 1.2:1 hairlines, no card shadow token, milky planet night sides, dark portrait rectangle) | `src/app/globals.css`; v1 audit 3.3 | PF-M5-1, PF-M3-10 |
| F10 | Home is 21,497 px tall at 390 (hero journey `300svh` plus full catalogue); `/stack` is 29,994 px | overflow-chromium.json; `hero-stage.module.css:154` | PF-M3-3 (PF-D10), PF-M5-6 |
| F11 | Dependabot config opens up to 3 + 2 + 3 PRs per week in grouped slots; owner rule is exactly one | `.github/dependabot.yml` | PF-M1-3 |
| F12 | CI lacks CodeQL, zizmor, Scorecard, dependency-review, SBOM, release automation, `security.txt`, `build-info.json`; `branch-policy.yml` uses `pull_request_target` | `.github/workflows/*` | PF-M1-4, PF-M1-6, PF-M2-14 |
| F13 | No mutation, property-based, visual (per route) PR gate, Lighthouse gate or fluidity test; visual only nightly; 2 unit tests depend on git history | package.json, nightly.yml | PF-M2-* |
| F14 | 39 `.mjs` files; `allowJs`; no `erasableSyntaxOnly` | file-index.csv | PF-M4-1, PF-M4-4 |

### P2

| ID | Finding | Evidence | Plan |
|---|---|---|---|
| F15 | 8 moderate axe `heading-order` findings in the Filomena architecture diagram | axe-results.json | PF-M3-9 |
| F16 | Biome: 3 warnings | lint.log | PF-M3-14 |
| F17 | Three font families, 135 KB, loaded through `next/font/google` (build-time network on Hostinger) | fonts.ts; webgl-results.json | PF-M3-13 (PF-D21) |
| F18 | CSP ships only non-script directives (documented tradeoff); no `security.txt` | `next.config.mjs` | PF-M4-6 (PF-D25) |
| F19 | `content/technologies.ts` 2,766 lines; `scene-runtime.ts` 635 and `solar-system-engine.ts` 620 lines | file-index.csv | PF-M4-3 |
| F20 | README 416 lines (template 80-180); docs flat, one ADR | repo read | PF-M3-11 |
| F21 | Cold `npm ci` 3 m 43 s and build 91 s feed the 5-minute PR budget | timings.txt | PF-M1-2 (caches) |

Fixed since v1 (kept out of the plan): `/es` served with `lang="en"` and failing hreflang; tab stops to the primary CTA reduced from 100+ to 12; 383 `label-content-name-mismatch` nodes.

## 3. Component and flow inventory

| Area | Inventory |
|---|---|
| Routes (EN and ES mirror under `/es`) | `/`, `/work`, `/work/filomena`, `/work/pequeverso`, `/about`, `/stack`, `/education`, `/cv`, `/contact`, `/assistant` (disabled in production builds), 404; `robots.ts`, `sitemap.ts` |
| Features | `hero` (sphere engine, catalogue journey, static constellation), `solar-system` (ambient field, explorer, quality, textures), `technology-catalogue`, `tool-carousel`, `project-gallery`, `architecture-diagrams` (React Flow), `assistant` (domain, application ports, SSE adapter, chat UI; disabled), `analytics` (default-off, click grid, exposure, interactions) |
| Shared | `ui` (badge, button, card, dialog, input, label, native-select, skeleton), `editorial` (eval-case, metric-list, page-header, production-badge), `identity` (mark: raster face PNG via `next/image`; brand and company marks), `motion` (pause and hold state), `technology`, `navigation`, `contact`, `styles` |
| Shell | header, footer, locale switcher, theme toggle, page motion |
| Content | `content/` typed EN/ES modules, `cv-public.json` (synced with career-ops), experience facts, image dimension manifests |
| Contracts | `contracts/assistant-api/` snapshot (OpenAPI, SSE and product-event schemas) generated by the isolated `tools/api-contract` package |
| Flows | theme toggle with pre-paint replay; locale switch preserving scroll and focus; hero sphere opens into the catalogue on scroll; solar explorer dialog; carousel and lightbox; CV PDF downloads (EN/ES); contact links; assistant and analytics gated by build flags |
| Hosting | Hostinger managed Node.js from `main`, `next build --webpack`, WASM SWC fallback on glibc 2.28, Rocky 8 container job in CI |
| CI | `ci.yml` (workflows, secrets, quality, build once, hosting, browser x8 shards, performance, `Required checks`), `nightly.yml` (prepare, quality, browser x8, visual, links, bundle), `branch-policy.yml`, `dependency-policy.yml` |

## 4. Current-state strengths to keep

Original identity; `data-theme` as the single theme authority with pre-paint replay; CLS 0 on all measured routes; axe clean on serious issues; Playwright `failOnFlakyTests` in CI; build once with a hash-verified artifact reused by browser and performance jobs; SHA-pinned actions and checksum-verified tools; secret scan of the transferred build; AST architecture guard with negative fixtures; budget test suite; reduced-motion honoured on every layer (static scene, zero canvases); CV sync check; feature `entry.tsx` facades.

## 5. Single-sourcing (CV and facts)

`content/cv-public.json` and the CV PDFs are synced from the owner's `career-ops` repository (`tools/export-cv.mjs`, `npm run cv:sync:check`); company dates and titles live in `content/experience-facts.ts`. v2 keeps one source per fact: the sync check stays a required job, a unit test fails on duplicated facts across copy modules, and no plan task edits CV content. Facts the plan needs (positioning, case-study metrics) are owner inputs (PF-D26).

## 6. What could not be measured

| Item | Why | Mitigation |
|---|---|---|
| Field Core Web Vitals (p75 LCP, INP, CLS) | Analytics default-off; CrUX/PSI without usable quota or traffic | Lab lanes plus post-MV RUM (PF-D24) |
| GPU frame time of the scenes on a mid-range phone | Headless SwiftShader; no device in this audit | Scheduled GPU lane on the owner's WSLg GPU; owner iPhone checklist (PF-D9) |
| Real Safari (iOS) behaviour and iOS Low Power Mode cadence | WSL cannot run Xcode or the Simulator | Per-release owner checklist; cadence-based tiering in hero v2 |
| Hostinger build parity | Only glibc 2.28 and WASM SWC are reproduced | Post-deploy `build-info.json` check (PF-M2-14) |
| TBT/LCP precision | Machine load 10-13 on 4 cores during runs | Relative findings only; re-baseline in M2 on a quiet runner |
| Per-chunk attribution of the 395-465 KiB | Not part of this audit | `tools/bundle-attribution.ts` (PF-M3-1); causes listed in the roadmap are hypotheses until measured |
| Mutation score, complexity maxima, dead code | No tools installed | Baselines recorded at M2 |
| Designer and recruiter scores | Need the independent evaluator | PF-M2-15 |
