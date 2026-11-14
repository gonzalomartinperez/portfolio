# Portfolio master plan v2 (2026-11-09)

Status: **planning only.** Nothing in this directory authorizes code, deploy, spend or production changes; execution is decided per phase by the owner. This plan replaces the v1 plan of 2026-10-24 in place (v1 stays in git history and in `archive-v1/`). It applies the [ecosystem standard](ecosystem.md) to this repository and documents only justified deviations.

Repository: `gonzalomartinperez/portfolio` (public, default branch `main`, integration branch `develop`). Live: https://gonzalomartinperez.com on Hostinger managed Node.js, built from `main`. Baseline: `develop` `0a1ff56` (same content as `main` `19954ee`), audited 2026-11-09 ([audit.md](audit.md)).

## Purpose

Take the portfolio to at least 95 on every axis of three fixed lenses (senior developer, senior product designer, senior recruiter; [rubrics.md](rubrics.md)) while keeping its identity: a particle sphere that opens into a technology catalogue, a solar-system ambient field, bilingual EN/ES, dark and light. The measured gap is concentrated in visitor-facing speed (mobile Lighthouse 35 on home, LCP 6.2 s, 395-465 KB of JS per route) and in two things the owner now wants raised to the maximum: a master UI/UX system in "Instrument blue" and a 10-figure hero particle system.

## Owner requirements (binding)

Ecosystem requirements ([ecosystem.md](ecosystem.md) section 2.1):

1. Nine master plans, one per repo (quoted from the requirement as first stated, "seven"; `pequeverso-marketing` and `dropshipping-ops` were added the same day), polished to the maximum, grounded in deep 2025-2026 research.
2. "Perpetual excellence": quality does not degrade over time (ratchets, automatic scorecard, cadences).
3. Consistent READMEs across the nine repos.
4. Assistants: a golden set of RAG questions, 100% correct as release gate (API repos; this repo only consumes the contract).
5. Complete testing: unit, integration, mutation, E2E, contract, visual, a11y, performance, security, load, property-based.
6. Agentic harness (skills, reviewers, evals) good enough that the owner does not need to review code.
7. Use the available skills and harness.
8. First-class, consistent containers: LTS versions, same base configuration, same practices.
9. CI at the maximum: dynamic (runs only what is affected), secure, fast.
10. Dependabot identical in all nine: exactly one PR per week per repo.
11. Maximum redesign of both backoffices (sibling plans).
12. Master UI/UX on both public sites (keep identity, polish and elevate, strict performance and accessibility budgets).

Repo-specific (from `owner-decisions.md`, v1 and the session of 2026-11-09):

 1. Keep and elevate the signature scenes; the hero star sphere evolves into a particle system that morphs through **exactly 10 unique figures** (sphere, cube, wormhole, toroidal helix = coiled spring whose ends join into a ring, triangle to tetrahedron, plus five chosen for quality and AI-engineer identity), very dynamic, inside LCP-poster, INP, DPR, off-screen pause and reduced-motion budgets ([hero-particles.md](hero-particles.md)).
 2. Palette, buttons, components and repository presentation taken to the maximum so the site is unique within the shared standard; full creative freedom, blue family as the starting preference: "Instrument blue" (ultramarine hue about 262 to cyan about 210, deep navy dark ground, navy ink on cool off-white light) ([design-playbook.md](design-playbook.md)).
 3. Light mode at the level of dark mode, with its own concept; both themes scored, the minimum counts.
 4. TypeScript everywhere possible; clean architecture applied pragmatically; every `.mjs` gets a destination or a justified exception ([target-state.md](target-state.md)).
 5. Everything lands on `develop` through short task branches with a green gate; `main` (and therefore Hostinger) changes only at M7 (no hotfix before M7; OD-11, DR-01).
 6. The assistant and analytics stay disabled until the VPS exists (Phase V = MV).
 7. After the refactor, all public copy is refreshed to the final state with verified facts only (OD-09), scheduled in M6 before the release (PF-D29, [roadmap.md](roadmap.md)).

## Method

- Read-only audit of `origin/develop` and the live site on 2026-11-09 (Lighthouse 13.5.0, axe-core with `wcag22aa`, Playwright rAF and keyboard probes, repo checks). The machine was loaded (load average 10-13 on 4 cores) and headless Chromium rendered WebGL in software, so lab TBT and LCP carry a wide margin; relative findings and byte counts are reliable ([audit.md](audit.md) section 6).
- Primary sources first; secondary or conflicting figures are flagged in the research notes copied into [research/](research/) and indexed in [sources.md](sources.md).
- Every target is measurable and automated ([scorecard.md](scorecard.md)); scores without evidence are unmet (rubrics v2).
- Pragmatism (owner decision O3): rigor where it reduces real risk, no ceremony. Items that are ceremony for a static, single-author site are listed as such in [testing.md](testing.md) and [target-state.md](target-state.md).

## Decisions

"Status" is **decided** (made by this plan with the reason shown), **resolved (delegated)** (decided by delegation; see the heading "Resolved decisions and owner inputs"), **owner-input** (genuinely needs the owner; the only ones are listed under that same heading), or **closed** (done or superseded). Sources: `R<nn>` are the notes in [research/](research/); `E<n>` are ecosystem sections.

| ID | Decision | Why | Sources | Alternatives rejected | Status |
|---|---|---|---|---|---|
| PF-D1 | Reading routes (`/cv`, `/education`, `/contact`, `/about`) show a rendered per-theme poster of the solar scene; the live scene runs only on home, `/stack` and the explorer (carries v1 D2) | Audit: 1 canvas and 2 `getContext` calls on `/cv` and `/contact` (rule: 0), 1.37 MB (mobile) and 2.22 MB (desktop) of textures on every route; owner requires the background to stay, a poster of the same scene keeps it | audit/webgl-results.json, R13 3.3, R06 10 | Live everywhere (today); generic CSS fallback (changes the identity) | decided |
| PF-D2 | Remove GSAP; easing, timeline and carousel become CSS plus a 1 KB TS easing module (carries v1 D3, reversed against R13 2.1 "keep GSAP") | v1 engineering research found GSAP used only to read scroll progress; hero v2 is a GPU-time design with no JS tweens; scroll-driven CSS is Baseline; fewer bytes and a non-OSI license removed | v1 archive 6A.6, R13 2.1, R06 3 | Keep GSAP for sequencing (a second runtime for no measured gain); add Motion (second runtime) | decided |
| PF-D3 | Light theme is "Ink on paper / celestial atlas" on Instrument blue, not a lightened dark (carries v1 D4) | Audit and R13 1.1: light is a compatibility mode (`--field-additive: 0`, 1.2:1 hairlines, milky planets); the editorial concept contrasts best with dark | R13 3.1-3.2a, R06 8 | Daytime sky; inverted blueprint | decided |
| PF-D4 | Before M7 the owner previews `develop` through a CI screenshot pack plus a local `npm run preview` (Rocky 8 container parity); a second Hostinger staging app is optional (carries v1 D5) | Owner rule: Hostinger stays on `main`; a staging app is a spend and hosting decision | E3.1, E19 (E6) | Per-PR previews on Coolify (VPS-gated) | Resolved (delegated, 2026-11-09) (was: **owner**) |
| PF-D5 | `lighthouse` 13.5.0 directly through `tools/lighthouse-gate.ts` (5 runs, median) in two lanes: 3D-disabled CI lane and a scheduled GPU lane (carries v1 D6) | `@lhci/cli` stalls on Lighthouse 12.6; headless SwiftShader inflates TBT to 138 s on home (audit), so a 3D-disabled lane is the stable gate | audit/lighthouse-summary.md, R13 2.7, R04 | `@lhci/cli` | decided |
| PF-D6 | Feature-first layout stays (`app`, `views`, `shell`, `features/<f>/{domain,application,adapters,presentation}`, `shared`, `content`, `config`); `views` and `shell` remain registered roots (carries v1 D7) | The AST guard already enforces it with negative fixtures; ecosystem 9 allows the number of layers to depend on repo type; `views`/`shell` are the paired-site contract with Pequeverso (`docs/adr/site-architecture-parity.md`) | E9, R01 1.2, repo ADR | Top-level domain/application/adapters (churn without benefit); ports/adapters over static content (ceremony) | decided |
| PF-D7 | Scorecard history lives in the repo: `ratchets/*.json`, nightly `scorecard.json` artifacts, one row per milestone in `progress.md` (closes v1 D9) | Public repo, no secrets; evidence must be reproducible with SHA and date | E16, rubrics | Private `reports/` workspace (not session-independent) | closed |
| PF-D8 | Test runner decided once for all four TypeScript repos by the cross-repo spike E7 (DR-09): Vitest 4 preferred if StrykerJS works with TS 7, otherwise `node:test` with the Stryker tap-runner; this repo takes the same outcome (carries v1 D10) | One runner per package; Stryker's best-supported runner; 18 `.test.mjs` files convert to TS anyway | E11.2, E19 (E7), R04 3.1 | Stryker tap-runner on `node:test` | decided (spike PF-M2-1) |
| PF-D9 | Real-device checks: Playwright WebKit iPhone profile on every PR plus an owner iPhone checklist per release; no paid device cloud (carries v1 D11) | Playwright WebKit on Linux is not Safari.app and renders WebGL in software; frame time is only meaningful on hardware | R04 7, v1 archive | BrowserStack plan (terms unverified) | decided |
| PF-D10 | Mobile hero shows a curated 12-16 brand catalogue with "Skip to projects" first in tab order and inert collapsed chips; the full catalogue lives on `/stack` (carries v1 D12) | Home is 21,497 px tall at 390 px; 100+ tab stops through chips | audit/overflow-chromium.json, R13 3.3 | Full catalogue on mobile (today) | decided |
| PF-D11 | Tokens: DTCG 2025.10 JSON, Style Dictionary v5, generated `src/design/theme.css`, shared `structure` pack plus `pack-instrument` (supersedes v1 D13 "own generator") | Same pipeline as the portfolio backoffice (second consumer exists now); distribution through `engineering-standards` with a hash check | E13, E19 (E14), sibling design-playbook | Own 150-line generator; Terrazzo (fallback only) | decided |
| PF-D12 | Docs: Diataxis folders, MADR 4 in `docs/decisions/`, CODE_OF_CONDUCT and SUPPORT added (closes v1 D14, D15) | Ecosystem 14; public repo | E14.2, R08 | Keep the flat docs layout | decided |
| PF-D13 | Skills follow the ecosystem catalog; `verify-release` is explicit-invocation, the rest are selected implicitly (closes v1 D16) | Execution authority already requires explicit authorization | E15.5 | Implicit release skill | decided |
| PF-D14 | Phase V of v1 is MV: assistant, analytics, RUM and synthetics activation after the owner buys the VPS (carries v1 D17) | Invariant 8 | E3A, E1.4 | - | closed |
| PF-D15 | Hero figure 10 is a **monogram** sampled from stroke data; default is a procedural angular "GMP" draft in `src/shared/identity/monogram.ts`; substitute is a torus knot if the owner declines | No vector monogram exists: `mark.tsx` renders a raster face PNG through `next/image` (not sampleable); a stroke-skeleton monogram needs no owner asset | repo read, R13 3.8.1 | Trace the caricature (likeness decision), wait for an owner SVG | Resolved (delegated, 2026-11-09) (was: **owner**) |
| PF-D16 | Hero engine: three.js on WebGL2, stateless GPU morph (data array texture, curl field, analytic trails by re-evaluating the same function at `t - dt`), no FBO ping-pong, WebGPU rejected for now | Stateless output is replayable at a fixed time (deterministic snapshots), has no half-float render-target dependency, and costs 8 uniforms per frame | R13 2.1, 3.8.2 (improved), hero-particles.md | FBO GPGPU inertia (device-dependent, non-deterministic); raw WebGL2 (saves bytes, loses shared context mgmt); WebGPU (no measured upside) | decided |
| PF-D17 | The hero never owns LCP: the h1 does; the poster is a server-rendered SVG of figure 01 at seed time 0; the canvas mounts after idle and crossfades only after its first frame | Audit: LCP element is SSR text, 90% of the delay is script; a GPU frame that matches the poster avoids a visible jump | audit, R13 3.8.3 | Canvas as LCP | decided |
| PF-D18 | Styling follows OD-41: Tailwind 4 with the complete semantic token system and owned CVA primitives everywhere; page-level CSS Modules migrate to Tailwind as each view is rebuilt in M5; only scene-geometry modules (hero stage, solar field, architecture canvas) remain as tokens-only CSS Modules with zero literals (EX-PF-11 allowed CSS Modules for layout, identity and motion; OD-41 now requires the full token system) | `AGENTS.md` rule, pixel-sensitive scenes, 33 module files; a big-bang move before visual baselines exist (M2) risks the signature layouts | OD-41, EX-PF-11, AGENTS.md, R06 | Full Tailwind migration in M3 (no baselines yet); keep all modules and literals | decided |
| PF-D19 | Node stays on 24 LTS (`>=24.22 <25`) for Hostinger; CI adds a non-blocking Node 26 job; flip only when Hostinger offers 26 and the glibc-2.28 container job passes on it (E10 deviation) | `docs/deployment.md`: SWC native binaries fail on Hostinger's glibc 2.28 and the build relies on the WASM fallback; Node 26 plus Next 16 plus WASM SWC is unverified | E8.1, E19 (E10), R11 1 | Move to 26 with the fleet | decided |
| PF-D20 | Branch-route and PR-title checks run inside the `classify` job on `pull_request`; `branch-policy.yml` (a `pull_request_target` workflow) is removed | zizmor flags `pull_request_target`; the owner's rule is that the flow is kept by discipline, rulesets and checks, not policy automation | E6.4, owner memory | Keep the workflow | Resolved (delegated, 2026-11-09) (was: **owner** (confirm)) |
| PF-D21 | Fonts: Inter Tight variable (display and text) plus JetBrains Mono subset (labels, HUD), self-hosted through `next/font/local`, total <= 100 KB; the Inter body family is dropped | Three families at 133 KB today; Google fonts fetched at build time on Hostinger is a hermetic-build risk; Inter Tight carries the identity | R13 2.6, audit (fontBytes 135 KB) | Keep three families | decided |
| PF-D22 | No smooth-scroll library; native scroll; CSS scroll-driven animations first | Accessibility and iOS risk; the hero journey is already scrubbed on native scroll | R13 2.1 | Lenis | decided |
| PF-D23 | Route transitions use React `<ViewTransition>` at page level plus a circular-reveal theme transition; both are progressive enhancement; canvases are excluded from snapshots | Same-document transitions are Baseline newly available (2025-10-14, R06); none exists today | R13 2.4, 3.6 | Cross-document `@view-transition` only | decided |
| PF-D24 | Field CWV comes from `web-vitals` events through the analytics contract after MV; until then lab proxies gate. Floors: only the D7 field part uses the floor of 90 until MV; D6 has no field floor (it is scored on lab gates to 95, and field p75 is an informational post-MV ratchet) ([scorecard.md](scorecard.md) section 5) | A new `web-vital` event needs a contract handoff with the API owner before it exists; analytics are default-off | E18.1, R07 | A third-party RUM service (privacy, cost) | decided |
| PF-D30 | PR incremental mutation (StrykerJS) is a parallel required job capped at 8 min wall-clock on changed files, off the critical path of the code profile (p95 <= 10 min); overflow scope is deferred to nightly; weekly full run 90 min | The ecosystem figure of 30 min cannot coexist with a 10 min p95 if it ran in series; in parallel with build and e2e an 8 min cap leaves the p95 intact | ecosystem 15 (mutation budget), testing.md section 4 | 30 min serial job (breaks p95); skip PR mutation | decided (deviation from the ecosystem 30 min figure, flagged) |
| PF-D25 | CSP: spike strict `script-src` via hashes or SRI in Report-Only first; HSTS preload stays an owner decision | Nonces would force every route to render per request; the current policy deliberately ships only non-script directives | next.config.mjs comments, R01 8, R05 | Nonce CSP (kills static prerender) | decided (spike PF-M4-6); preload not before M7 (resolved, delegated, 2026-11-09) |
| PF-D26 | No new case-study metric, claim or employer material without owner approval; recruiter axis R2 uses floor 90 until the owner supplies approved proof | AGENTS.md rule and rubric (proof is human input) | AGENTS.md, rubrics lens 3 | Planner-written claims | **owner** |
| PF-D27 | Truchet patterns are not a hero figure (would be the 11th); optional Phase C use as a light-theme poster ground | Owner closed the number at 10 | `owner-decisions.md` (OD-44) | An 11th figure | Resolved (delegated, 2026-11-09) (was: **owner** (optional)) |
| PF-D28 | Keep the custom AST architecture guard with negative fixtures; add Biome `noImportCycles` and `knip`; do not adopt dependency-cruiser | The guard already covers registered roots, features, layers and capabilities; dependency-cruiser does not fit TypeScript 7 | R01, R10, v1 archive | dependency-cruiser | decided |
| PF-D29 | Full copy refresh at M6 (OD-09): every page EN and ES, case studies (Pequeverso and both assistants with measured post-refactor results), project descriptions, stack page and CV-linked facts rewritten to the final reality; facts only from `career-ops` (`perfil/datos/hechos-cv.json`, `perfil/perfil-canonico.md`); natural, non-AI-sounding writing under the `career-ops` positioning v3 rules (`operacion/posicionamiento-v3-2026-10-24`); recruiter evaluation >= 95; a content test ties every number on the site to the facts source | Owner requirement relayed 2026-11-09 (OD-09); copy written before the refactor ends would be stale, and invented or unsourced numbers are forbidden | `owner-decisions.md` OD-09, AGENTS.md, rubrics lens 3 | Copy edits spread across milestones (drift); planner-written claims | decided (owner approves facts and final copy) |

## Changes from v1

| Area | v1 (2026-10-24) | v2 (2026-11-09) | Why |
|---|---|---|---|
| Structure | Phases A, B, C, V, planning only, no estimates | Ecosystem milestones M0-M8 and MV with ordered checklists, acceptance, effort and agent hours ([roadmap.md](roadmap.md)) | Owner: continuous parallel execution, safe points, session independence |
| Scoring | Designer 70, recruiter 72 (stale after PR #194), developer not computed | Ecosystem rubrics v2 on three lenses (D1-D8, P1-P6, R1-R7), provisional baselines until the M2 independent evaluator, ratchets and `scorecard.json` ([scorecard.md](scorecard.md)) | Gaps 1 and 2 of `owner-decisions.md`: no automatic regression, judgement without gates |
| Baseline | Lighthouse 12, GTX 1050 rAF samples, `b5b3c57` | Lighthouse 13.5, axe `wcag22aa` (0 serious, 383 `label-content-name-mismatch` fixed, 8 moderate heading-order), `develop 0a1ff56` | Re-measured 2026-11-09; some v1 issues are fixed (`/es` lang and SEO, tab stops to primary CTA 12) |
| Hero | Keep and elevate the sphere | Particle system v2 with exactly 10 figures, GPU morph, tiers, HUD, posters, snapshot tests ([hero-particles.md](hero-particles.md)) | Owner requirement of 2026-11-09 |
| Palette | Dark observatory, light "celestial atlas" on the existing grey-blue | Instrument blue family with computed contrast, full button states, theme parity gates ([design-playbook.md](design-playbook.md)) | Owner preference for blue and creative freedom |
| GSAP | Open decision D3 | Removed (PF-D2) | Hero v2 and CSS scroll-driven animation make it unnecessary |
| Tokens | Own generator | Style Dictionary v5 and shared packs (PF-D11) | Backoffice is now a second consumer |
| CI | Add jobs without slowing PRs | `classify` plus profiles, `ci-gate`, path map `ci-profile.json`, p50 budget 5 min ([ci-cd.md](ci-cd.md)) | Ecosystem 6 |
| Dependabot | 3 + 2 + 3 PR slots, grouped by type | One weekly PR, all ecosystems, guard | Owner rule O1 |
| Files | 727-row index, Spanish-derived research as plan content | 752-row index plus 110 planned files, `.mjs` destinations, archive of v1 research ([file-index.csv](file-index.csv), [file-moves.md](file-moves.md)) | Brief |
| Decisions D1-D17 | v1 status: open, none decided | Each re-evaluated: PF-D1-D14 (table above) | Owner delegated creative and technical freedom |
| Kept as still right | | Polish before refactor ordering of risks, fixed rubrics idea, WCAG 2.2 AA floor, WebKit tests behaviour not FPS, StrykerJS for mutation, reject Lenis/Storybook/dependency-cruiser, one CSS budget freeze (25 KiB gz), per-theme posters, four-verb motion language, frame-rate-independent damping | Still supported by 2026-11 evidence |

## Limits

- No field data: analytics are default-off until MV; every performance number is a lab measurement.
- Lab runs used SwiftShader; mid-range mobile GPU behaviour for the hero tiers is inferred and must be measured on hardware (owner device checklist, GPU lane).
- No real iPhone run was part of this plan.
- The CV is single-sourced from the owner's `career-ops` repository; this plan never edits CV facts ([target-state.md](target-state.md) section 6).
- Provisional scores are planner estimates until the M2 evaluator run; D6 baseline 42 is marked provisional too, because the scorecard mapping in [scorecard.md](scorecard.md) section 7 is only fully computable by `tools/scorecard.ts` (PF-M2-11).
- Evaluator calibration is part of PF-M2-15 (two runs, delta <= 3); a single run is never trusted for the baseline.
- No MV-R (VPS readiness) tasks exist for this repo: it is a static Hostinger build, so readiness is `build-info.json`, the smoke probe and the `web-vital` contract handoff (PF-M4-9).
- Per-view page-height budgets other than home (12,000 px) and `/stack` (15,000 px) are proposals, ratcheted from the first measurement at M3; they are the planner's, not owner decisions.
- Mutation on PRs is capped at 8 min (PF-D30), a flagged deviation from the ecosystem 30 min budget; scope beyond the cap is checked nightly.
- Declined: none of the evaluator's items was declined.
- Hostinger build behaviour is only partially reproducible (Rocky 8 container, glibc 2.28); a successful hPanel build and `build-info.json` check remain the final confirmation.

## Resolved decisions and owner inputs

The owner delegated every repo decision on 2026-11-09 ("resolve them yourself"), so each row below is resolved as its recommendation; only the two items marked "Owner input needed" wait for the owner (listed under "Owner inputs still needed", identical in [RESUME.md](RESUME.md) and [progress.md](progress.md)).

| ID | Question | Recommendation |
|---|---|---|
| PF-D15 | Which figure 10? Approve the draft angular "GMP" monogram (sketch in [hero-particles.md](hero-particles.md) section 4.10), supply a vector mark, or substitute the torus knot | Resolved (delegated, 2026-11-09): approve the draft angular "GMP" monogram (sketch in [hero-particles.md](hero-particles.md) section 4.10) at the M5 hero review; the torus knot is the zero-effort fallback |
| PF-D4 | Preview of `develop` before M7: screenshot pack and local preview (free), or a second Hostinger app tracking `develop` | Resolved (delegated, 2026-11-09): free option (CI screenshot pack plus local preview); no second Hostinger app |
| PF-D20 | Remove `branch-policy.yml` and fold the checks into the PR classifier | Resolved (delegated, 2026-11-09): Yes |
| PF-D25 | HSTS preload submission | Resolved (delegated, 2026-11-09): no HSTS preload submission before M7; revisit after the M7 release soak (submission is irreversible in practice) |
| PF-D26 | Which measured results and case-study details may be published (evals, latency, production numbers) | **Owner input needed**: provide the approved list of publishable measured results and case-study details before M5 (facts only the owner has); otherwise the floor of 90 on R2 stands |
| PF-D27 | Truchet pattern as an optional light-theme poster ground in Phase C | Resolved (delegated, 2026-11-09): defer |
| E1, E2, E5, E10 | Ecosystem decisions that this repo depends on (central standards repo, Dependabot sandbox proof, release-please location, Node 26 timing) | Resolved (delegated, 2026-11-09): See [ecosystem.md](ecosystem.md) section 19 |
| MV | Buy the VPS and authorize activation of the assistant, analytics and RUM | **Owner input needed** (purchase and spend): buy the VPS and authorize activation of the assistant, analytics and RUM after M6 (MV-R readiness is prepared first; OD-64) |

### Owner inputs still needed

1. PF-D26 and PF-D29: approved list of measured results and case-study details to publish (before M5), and approval of the final copy at PF-M6-5.
2. MV: VPS purchase and activation authorization (after M6; owner steps are purchase, DNS and secret entry only).

## Index of files

| File | Purpose |
|---|---|
| [scorecard.md](scorecard.md) | Axes per lens, baselines with evidence, targets, automatic measurement, ratchets, cadence |
| [rubrics.md](rubrics.md) | Ecosystem rubrics v2 (byte-identical) |
| [audit.md](audit.md) | Measured baseline, findings P0/P1/P2, inventory, unmeasured items |
| [target-state.md](target-state.md) | Architecture, guard rules, TypeScript policy, ADRs, migration order |
| [design-playbook.md](design-playbook.md) | Instrument blue, shared motion and fluidity system, buttons, components, theme parity, pages |
| [hero-particles.md](hero-particles.md) | Hero particle system v2 specification (10 figures) |
| [assistant-widget.md](assistant-widget.md) | Assistant widget: launcher, panel, streaming, accessibility, tokens, events, tests (shared standard, per-site identity) |
| [assistant-experience.md](assistant-experience.md) | Assistant experience v2: performance, grounding, rich blocks contract, web access policy, opt-in memory, harness, evals, rollout |
| [testing.md](testing.md) | Test catalog mapped to this repo, thresholds, cadence, flake policy |
| [ci-cd.md](ci-cd.md), [ci-profile.json](../../.github/ci-profile.json) | CI profiles, budgets, security, Dependabot, release, containers |
| [file-index.csv](file-index.csv), [file-moves.md](file-moves.md) | Every tracked file and its destination; every move with motive |
| [standards.md](standards.md) | Style guide choice and enforcement |
| [docs-and-community.md](docs-and-community.md) | README outline, community files, Diataxis, C4 |
| [skills.md](skills.md) | Skill audit, new skills, activation evals |
| [dependencies.md](dependencies.md) | Each dependency: purpose, cost, license, health, decision |
| [roadmap.md](roadmap.md) | M0-M8 and MV checklists with IDs, hours, Depends, Files and Status per task; critical path; RESUME command (no MV-R tasks for this repo) |
| [progress.md](progress.md), [RESUME.md](RESUME.md) | Milestone log, session-independent resume brief |
| [ecosystem.md](ecosystem.md), [owner-decisions.md](owner-decisions.md), [owner-decisions-existing.md](owner-decisions-existing.md), [readme-template.md](readme-template.md) | Shared standard, owner decisions register and README template (byte-identical copies) |
| [research/](research/), [sources.md](sources.md) | Cited research notes and source list |
| [audit/](audit/) | Audit evidence copied from the baseline run |
| `archive-v1/` | v1 research and rubrics, kept readable (created by file-moves) |
