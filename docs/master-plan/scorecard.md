# Scorecard

Part of the [master plan](README.md). Rubrics: [rubrics.md](rubrics.md) (ecosystem v2, fixed). Evidence: [audit.md](audit.md) and `audit/`. Target: **at least 95 on every axis** of the three lenses; floor **90** only where an unauthorized input blocks the axis (stated per row). Scores never compensate across axes. Where two themes exist each is scored and the minimum counts.

Scores marked **prov.** are planner estimates from the measured evidence; they are replaced by the first independent evaluator run (PF-M2-15) and rubric v2 is frozen once that run is recorded. Measured values are exact and dated 2026-11-09 at `develop` `0a1ff56`.

## 1. Lens 1: senior developer (D1-D8)

| Axis | Baseline | Measured evidence | Target | Automatic measurement | Ratchet file |
|---|---|---|---|---|---|
| D1 Architecture | **82 prov.** | AST guard (`tools/architecture.mjs`) with negative fixtures, registered roots, features, layers, capabilities; composition via feature `entry.tsx` facades; `scene-runtime.ts` 635 lines and `solar-system-engine.ts` 620 mix concerns; no import-cycle or dead-code check | 95 | `npm run test:architecture` (guard rules G1-G12), Biome `noImportCycles`, `knip`; scorecard reads violation counts | `ratchets/static.json` (guard violations, cycles, knip findings = 0) |
| D2 Code quality | **78 prov.** | `tsc` 0 errors (5 s), Biome 3 warnings (`noDescendingSpecificity`, `audit/lint.log`), 39 `.mjs` (37 convertible), `allowJs` on, no complexity gate, `content/technologies.ts` 2,766 lines | 95 | `tsc` (TS 7, strict + `erasableSyntaxOnly`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), Biome 0 warnings, cognitive complexity <= 15 ratcheting to 10, knip | `ratchets/static.json` |
| D3 Tests | **74 prov.** | `node:test` unit 342/344 (2 fail without git history: `repository.test.mjs`, `content.test.mjs`), coverage lines 94.56 / branches 91.36 / functions 90.67 (mostly `tools/`), 38 browser specs, visual baselines nightly only, no mutation, no property tests, Playwright `failOnFlakyTests` on in CI | 95 | Vitest coverage floors, diff coverage >= 85% on PR, Stryker incremental (PR) and full (weekly), flake detector nightly, 0 flaky over 30 days | `ratchets/coverage.json`, `ratchets/mutation.json` |
| D4 CI/CD | **76 prov.** | Aggregate `Required checks`, build once and verified artifact, 8 browser shards, SHA-pinned actions, Rocky 8 hosting job; no `classify`/profiles, three-plus-two-plus-three Dependabot PR slots (violates the single-PR rule), no release automation, no `build-info.json` post-deploy check, cold `npm ci` 3 m 43 s, build 91 s | 95 | Workflow run data (`gh run list`): PR p50 <= 5 min, p95 <= 10 min; `ci-profile.json` test; weekly Dependabot guard result; release checks | `ratchets/static.json` (CI duration baseline in nightly artifact) |
| D5 Security and supply chain | **80 prov.** | SHA-pinned actions, gitleaks with checksum, `npm audit`, workflow-policy tool with negative fixtures, security headers (no `script-src`), secret scan of the transferred build; no CodeQL, zizmor, Scorecard, SBOM, dependency-review, `security.txt`, SECURITY.md lacks private reporting | 95 | zizmor, CodeQL default setup, osv-scanner daily, dependency-review, gitleaks, Scorecard weekly (no drop > 1 point), headers snapshot test | `ratchets/static.json` (security findings = 0), Scorecard floor |
| D6 Performance | **42 prov.** | Mobile Lighthouse 35 (home), 39 (Filomena), 55 (`/cv`); LCP 6.2 / 5.8 / 3.5 s; JS transferred 395-465 KiB vs 90-110 KiB target; all `<script src>` per route 227-240 KiB gz; solar textures 1.37 MB (mobile) and 2.22 MB (desktop) on every route; lab values inflated by load and SwiftShader | 95 | `tools/lighthouse-gate.ts` (median of 5; perf >= 0.90 mobile; LCP <= 2.0 s, TBT <= 200 ms, CLS <= 0.05 on the 3D-disabled lane), `test:budget` per-route bundle budgets, fluidity specs (frames p95 <= 20 ms, LoAF <= 100 ms, INP <= 150 ms), GPU lane scheduled | `ratchets/bundle.json`, `ratchets/lighthouse.json` |
| D7 Observability | **50 prov.** | Static site; analytics default-off; no `/api/health`, no `build-info.json`, no uptime probe, no error tracking; SLOs undefined | 95 for build, health and synthetics; **floor 90** for the field-data part (RUM needs the collector, MV) | `build-info.json` check against merge SHA after `main` deploys, scheduled synthetic Playwright smoke (read-only), `web-vitals` events after MV | `ratchets/scorecard.json` |
| D8 Docs and DX | **70 prov.** | README 416 lines (template: 80-180), AGENTS.md good, 39 specs and verification notes, no MADR ADRs (one ADR), no CHANGELOG (release-history.md), no CODE_OF_CONDUCT, SUPPORT, issue forms, no devcontainer, no skill evals, six skills | 95 | README heading and length check, lychee, markdownlint, Vale (EN), skills validator and activation evals, `npm run check` equals CI static job (test), devcontainer smoke | `ratchets/static.json` |

## 2. Lens 2: senior product designer (P1-P6)

Each axis is scored per theme (dark, light) and per locale on the screenshot matrix; the minimum counts. The v1 designer score was 70/100 (7 dimensions); the mapping to P1-P6 is recorded in the first evaluator run.

| Axis | Baseline | Measured evidence | Target | Automatic measurement | Ratchet |
|---|---|---|---|---|---|
| P1 Visual design and system | **70 prov.** | Tokens in one file (`globals.css`, 517 lines) but literals in 33 CSS Modules, hex values not DTCG, `#000` ground, three font families (135 KB), hover lift `perspective rotateX(3deg)` | 95 | Token build and contrast/CVD test, literal-lint (G8) = 0, font budget <= 100 KB, snapshot of `theme.css` | `ratchets/static.json` (literals = 0), `ratchets/bundle.json` (fonts) |
| P2 Interaction and motion | **66 prov.** | No pause UI (`setPageMotionPaused` has no caller), two easings and two durations, page transition is a 180 ms opacity fade, button states snap, hero hitch measured p99 1,067 ms in v1 | 95 | Motion-token lint (durations 100-400 ms except named cinematic), `transition: all` ban, reduced-motion spec, fluidity specs, view-transition spec, five-state matrix | `ratchets/static.json` |
| P3 Accessibility | **88 prov.** | axe `wcag22aa` 0 serious across 72 page states (216 overflow states, 0 overflow); 8 moderate `heading-order` (Filomena diagram, 2 locales x 2 themes x 2 widths); Lighthouse a11y 100 on 10 of 12 route presets (99 on both Filomena presets); tab stops to primary CTA 12; focus rings 2 px; no pause control; `/es` 404 English | 95 and Lighthouse a11y = 100 | axe both themes x both locales x all routes (0 serious/critical, moderate <= 0), keyboard journeys, target size >= 24 px (44 px primary on coarse pointers), 200%/400% zoom reflow, forced-colors smoke, manual NVDA/VoiceOver per release | `ratchets/a11y.json` |
| P4 Responsive and cross-browser | **80 prov.** | 0 horizontal overflow in 216 Chromium states (320-1920), WebKit iPhone 15 and Firefox 390 capture clean; header not sticky below 26 rem; home 21,497 px at 390 and `/stack` 29,994 px | 95 | Playwright projects Chromium, Firefox, WebKit iPhone and Pixel on journeys; visual baselines; page-height budgets (home <= 12,000 px, `/stack` <= 15,000 px at 390) | visual baselines + `ratchets/bundle.json` (page height) |
| P5 Theme parity | **55 prov.** | Light is a compatibility mode (v1 audit 3.3; `--field-additive: 0`, 1.2:1 hairlines, milky planet night sides, dark portrait rectangle) | 95; light within 2 points of dark | Per-theme contrast tests on worst frame, per-theme visual baselines, evaluator scores each theme, `scorecard.json` uses the minimum | `ratchets/scorecard.json` |
| P6 Consistency and identity | **78 prov.** | Strong identity (face mark, sphere, solar field), shared primitives in `src/shared/ui` (8), editorial components; buttons and cards drift between modules and Tailwind | 95 | Component inventory test (every route uses primitives; no ad hoc button CSS), evaluator, identity checklist in `design-playbook.md` section 8 | `ratchets/scorecard.json` |

## 3. Lens 3: senior recruiter (R1-R7)

The v1 recruiter score was 72/100 before PR #194 (proof-first copy); v2 axes follow the rubric text (first-screen clarity, proof, writing, credibility, calls to action, polish, differentiation).

| Axis | Baseline | Evidence | Target | Automatic measurement |
|---|---|---|---|---|
| R1 First screen clarity | **78 prov.** | h1, CTAs and sphere present; blank 4+ s on a mid phone (LCP 6.2 s lab); eyebrow wraps to 3 lines at 390 | 95 | 5-second test checklist by the evaluator on a 3D-disabled capture; LCP <= 2.0 s lane; mobile eyebrow one line (spec) |
| R2 Proof | **80 prov.** | Case studies for Filomena and Pequeverso, production badge, eval-case component, metric list; metrics need owner approval (PF-D26) | 95; **floor 90** until the owner supplies approved proof | Evaluator against the approved-claims list; content test that every metric has a source field |
| R3 Writing quality | **80 prov.** | Editorial guide exists; bilingual; voice consistent | 95 | Vale (EN prose), cspell with es-419 dictionary, LanguageTool on ES (advisory), editorial-guide checklist |
| R4 Credibility and consistency | **84 prov.** | CV synced with career-ops (`cv:sync:check`), facts in `content/experience-facts.ts`, no unverified claims (AGENTS.md); a Teamcubation end-date fix landed 2026-11 (PR #219) | 95 | `cv:sync:check` in CI, single-source test (no duplicated dates or titles), links (lychee) |
| R5 Calls to action and navigation | **76 prov.** | Tab stops to primary CTA now 12 (was 100+, P0 fixed); contact action not persistent on mobile; header not sticky below 26 rem | 95 | Keyboard journey spec (primary CTA within 6 tab stops with skip links), persistent contact chip spec, CTA click-path E2E |
| R6 Visual and responsive polish | **70 prov.** | No overflow; light mode weaker; hitch on first hero scroll; no page transitions | 95 | Visual baselines both themes, fluidity gates, evaluator |
| R7 Differentiation | **82 prov.** | Particle identity, solar explorer, native architecture diagrams; hero v2 raises it | 95 | Evaluator against the hero v2 acceptance list ([hero-particles.md](hero-particles.md) section 12) |

## 4. Evidence rules and caps (rubrics v2)

A criterion without evidence (CI run, report artifact, screenshot set, metric file, signed checklist, with SHA and date) is unmet. Caps: a failing required check caps the lens at 70; a committed secret caps Security at 40; a contract break without the major-version path caps Architecture at 60. Evaluators are independent agents that see the repo, the evidence and the rubric, never the planner's reasoning.

## 5. Floors stated explicitly

| Axis | Floor | Reason (unauthorized input) | Path to 95 |
|---|---|---|---|
| D7 field part | 90 | Real-user monitoring needs the collector on the VPS (MV) and consent | MV: analytics enabled, `web-vitals` events, p75 gates |
| R2 Proof | 90 | Metrics and claims are owner-only (PF-D26) | Owner supplies an approved list |
| D6 field p75 | no floor (informational only) | D6 is scored on lab gates to 95 and never uses a floor; field p75 LCP <= 2.0 s, INP <= 150 ms, CLS <= 0.05 becomes a post-MV ratchet that does not change the D6 score | MV (ratchet only) |

Single statement used everywhere (README PF-D24, PF-MV-2): floored parts are D7 field (90 until MV, then 95) and R2 (90 until the owner supplies the PF-D26 list); every other axis is 95. D6 never has a field floor (field p75 is a post-MV ratchet only). Only D7 field and R2 depend on the VPS or the owner; no other axis relies on the VPS, paid model calls or human labels.

## 6. Automatic measurement

`tools/scorecard.ts` (PF-M2-11) runs nightly and on the `release` profile, reads CI artifacts (guard output, knip, tsc, Biome, Vitest coverage, Stryker report, axe JSON, Lighthouse medians, `test:budget`, Playwright JSON and visual results, `gh run list` timings, Scorecard SARIF, zizmor, osv) and writes `.artifacts/scorecard.json`: per axis the criterion inputs and pass or fail, and a regression verdict against `ratchets/*.json`. Judgement axes (P1-P6, R1-R7) are recorded per release by `designer-evaluator` and a recruiter-evaluator run against screenshots, the scorecard and the rubric, with evidence links, and stored in `docs/master-plan/progress.md` milestone rows.

### Ratchet files

| File | Holds | Tightens when | Loosening needs |
|---|---|---|---|
| `ratchets/coverage.json` | line, branch, function floors; diff-coverage floor | every merge that raises coverage (bot PR from nightly) | ADR plus owner |
| `ratchets/mutation.json` | score per scope (domain, application, content validators, tools policy, hero geometry) | weekly full run | ADR plus owner |
| `ratchets/bundle.json` | per-route JS gzip (<= 90 KiB reading, <= 110 KiB home), CSS (25 KiB gz frozen), fonts (<= 100 KB), textures per route, hero chunk (<= 60 KB gz above the shared three chunk), page heights | every merge | ADR plus owner |
| `ratchets/lighthouse.json` | per-route perf, a11y, BP, SEO floors and LCP/TBT/CLS ceilings | nightly median improves | ADR plus owner |
| `ratchets/static.json` | Biome warnings, tsc errors, knip findings, cycles, guard violations, literals, `.mjs` count, complexity maxima, security findings, doc-lint findings | any decrease | ADR plus owner |
| `ratchets/a11y.json` | axe violation counts by impact, target-size findings | any decrease | ADR plus owner |
| `ratchets/scorecard.json` | per-axis score floors from the last evaluator run | each evaluator run | ADR plus owner |

### Re-score cadence

Automatic axes: nightly and per release. Judgement axes: per milestone from M2 (baseline), M3, M5, M6 and each release by the independent evaluator; quarterly independent fresh-agent re-audit after M7. The M6 exit needs two consecutive nightly scorecards with every axis at target.

## 7. Mapping from automatic inputs to numeric scores

`tools/scorecard.ts` converts criterion inputs to a 0-100 axis score with one rule: **axis score = sum over criteria of weight x clamp(measured / target, 0, 1) x 100**, where weights per axis sum to 1, "measured / target" is inverted for ceilings (target / measured), and boolean criteria score 0 or 1. Caps from section 4 apply afterwards. Judgement axes (P, R) use the evaluator score; the automatic inputs only set the evidence checklist.

| Axis | Criteria (weight) | Measured input today | Baseline from the rule |
|---|---|---|---|
| D6 | Mobile Lighthouse perf median of 5 vs 90 (0.35); per-route JS gz vs 90/110 KiB (0.25); LCP vs 2.0 s on the 3D-disabled lane (0.15); TBT and CLS gates (0.10); fluidity gates frames p95, LoAF, INP (0.15) | perf mean 43 (35, 39, 55); JS 395-465 KiB transferred (ceiling ratio 0.19-0.28); LCP 6.2 / 5.8 / 3.5 s (ratio 0.32-0.57); TBT, CLS and fluidity not yet measured on the gated lane | partial computation gives about 0.35 x 0.48 + 0.25 x 0.24 + 0.15 x 0.40 = 28.8 points from measured criteria; the 10 + 15 weight of unmeasured criteria is estimated at 13 points, so the baseline is **42 prov.** until the first `scorecard.ts` run replaces it |
| D3 | Line coverage vs 90 (0.15), branch vs 85 (0.15), diff coverage vs 85 (0.10), mutation vs target (0.25), flake-free over 30 days (0.15), property and contract suites present (0.20) | lines 94.56, branches 91.36 (both >= target: full marks); no mutation, no property tests, flake data absent | 0.30 x 100 from coverage, remainder from presence checks; reported prov. 74 |
| D4 | p50 vs 5 min (0.30), p95 vs 10 min (0.20), `ci-gate` fail-closed (0.15), single Dependabot PR (0.15), release automation (0.10), `build-info.json` check (0.10) | no profiles, three-plus-two-plus-three Dependabot slots, no release automation | prov. 76 |
| D1, D2, D5, D7, D8 | violation counts and presence checks, each criterion equal weight within its row of section 1 | see section 1 evidence | prov. as listed |

Rows other than D6 keep the provisional marker because the planner did not run the computation; D6 is also provisional (the evaluator flagged that 42 was stated as measured). The first `tools/scorecard.ts` run (PF-M2-11) replaces every provisional value and the mapping table is then frozen with rubric v2.
