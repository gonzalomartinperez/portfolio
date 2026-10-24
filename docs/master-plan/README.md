# Portfolio master plan (October 2026)

Status: **planning only, not executed.** Nothing in this directory authorizes code, dependency,
hosting, activation or spending changes. The owner decides when, and whether, each phase starts.

This directory consolidates the planning research made on 2026-10-24 for the public site, its
engineering, its agent skills and its two sister repositories. The working files were written in
Spanish and remain in the owner's private `reports/` workspace, outside this repository; the
documents here are faithful English translations or syntheses of them. Screenshots used as
evidence (134 files, about 67 MB) are deliberately not committed.

## Contents

| Document | Purpose |
| --- | --- |
| [Roadmap](roadmap.md) | Phases A, B, C and V with scope, acceptance criteria, effort, risks and dependencies |
| [Scorecard](scorecard.md) | Axes, baselines, 95+ targets and automated measurement |
| [Developer rubric](rubrics/developer.md) | Senior developer lens: 8 engineering axes |
| [Designer rubric](rubrics/designer.md) | Senior designer lens: fixed UX rubric (baseline 70/100) |
| [Recruiter rubric](rubrics/recruiter.md) | Senior recruiter lens: fixed message rubric (baseline 72/100) |
| [UX audit baseline](audit/baseline-2026-10.md) | Measured UX baseline with metrics and 20 prioritized issues |
| [Design and UX playbook](research/design-ux-playbook.md) | Visual, motion, 3D, performance, accessibility and light-mode research: 65 sources, 75 rules |
| [Engineering target state](research/engineering-target-state.md) | Current state, Clean Architecture, TypeScript migration, testing incl. mutation, CI/CD, dependencies, scorecard |
| [Standards and index](research/standards-and-index.md) | Master file index, move map, Google TypeScript baseline and deviations, docs and community files |
| [File index (CSV)](research/file-index-current.csv) | One row per tracked file at the audited revision |
| [Skills plan](research/skills-plan.md) | Agent skills audit, rewrites, new skills and evals |
| [Ecosystem](ecosystem.md) | Portfolio, assistant API and backoffice: contracts, shared tokens, releases and deployment |

## Goal

Take the portfolio to **95+ on every axis** of three fixed lenses (senior developer, senior
designer, senior recruiter) while keeping its identity, and leave a plan that can be executed
phase by phase with measurable acceptance criteria.

## Owner requirements

These requirements were stated by the owner and bind every phase:

1. **Planning only until the owner decides.** This plan is documentation; each phase needs an
   explicit start.
2. **Keep and elevate the signature scenes.** The hero star/particle sphere and the solar-system
   background stay; the work is to raise their craft, not replace them.
3. **Light mode at the level of dark mode.** Light is a first-class theme with its own concept,
   not an attenuated dark theme; both themes are scored separately and the minimum counts.
4. **TypeScript everywhere possible.** The only accepted exception is `postcss.config.mjs`;
   `tools/api-contract/` keeps its own pinned TypeScript as a documented exception.
5. **Clean Architecture under the best standards, applied pragmatically.** Layers where they pay
   (I/O, time, persistent state, policies worth testing without a DOM); no ceremony.
6. **Full testing**, including mutation testing and mobile Safari on iPhone.
7. **CI/CD optimization**: more gates without slower PRs.
8. **All justified libraries are allowed**, each vetted for purpose, alternatives, runtime cost,
   license, health and security.
9. **Evaluations always through the three lenses** with fixed rubrics.
10. **95+ on every axis.**
11. **A VPS-gated activation phase** for the assistant and the backoffice. The VPS has not been
    purchased yet.

## Method

- **Read-only audits.** The UX audit ran against the live site (code reference `origin/main` at
  `b5b3c57`) with Lighthouse 12, axe-core 4.11 through `@axe-core/playwright` 4.14, Playwright 1.64
  and rAF sampling on a real GPU. The engineering audit read the same revision without building.
  The sister repositories were audited from temporary exports without secrets or paid calls.
- **Primary sources first.** W3C, web.dev, framework documentation, MDN browser-compat-data and
  the authors' own essays; secondary or conflicting figures are marked as such in the research.
- **Fixed rubrics.** Scores are comparable only under the same rubric version; the rubrics are
  reproduced verbatim in [rubrics/](rubrics/developer.md).
- **Measured vs. hypothesis.** The research labels findings as measured, read or hypothesis;
  hypotheses must be measured before acting.

## Key decisions and reasons

| Decision | Reason | Sources |
| --- | --- | --- |
| Polish before refactor (Phase A before B) | The largest score losses are visitor-facing (mobile performance 7/15, light-mode parity, mobile journey); a behavior-neutral refactor cannot fix them, and visual baselines from Phase A make the refactor safe | [UX audit](audit/baseline-2026-10.md), [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots) |
| The last 10 % is a system, not decoration | Awwwards weighs Design 40 % / Usability 30 % / Creativity 20 % / Content 10 %, so usability weighs almost as much as visuals; tokens applied consistently across components and both themes | [Awwwards evaluation](https://www.awwwards.com/about-evaluation/) |
| 3D may not cost LCP or INP | DPR ≤ 2 (≤ 1.5 mobile), < 100 draw calls, pause off-screen and in hidden tabs, static poster as LCP, fallback for weak devices | [Three.js tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips), [R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance), [web.dev Web Vitals](https://web.dev/articles/vitals) |
| Targets stricter than "good" CWV | Lab Lighthouse does not measure INP; p75 field data decides, so the plan adds cookie-free RUM | [web.dev CWV thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds), [web-vitals](https://github.com/GoogleChrome/web-vitals) |
| WCAG 2.2 AA as the accessibility floor | The most omitted criteria are 2.4.11, 2.5.8, 2.5.7 and visible focus; axe must run with `wcag22aa` | [What's new in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/), [axe-core API](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md) |
| Light mode as a re-imagined "day space" | A night sky on white does not work; no additive blending on light backgrounds, tinted shadows, scrims tested on the worst frame | [Design and UX playbook](research/design-ux-playbook.md) §10, [APCA](https://github.com/Myndex/apca-introduction), [WCAG F83](https://www.w3.org/WAI/GL/2016/WD-WCAG20-TECHS-20160719/F83.html) |
| Pragmatic Clean Architecture | Inward dependencies and ports where there is I/O, time or state; no DI container or repositories over static content | [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), [Hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture/), [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure) |
| Google TypeScript style as the baseline, enforced by Biome | One toolchain (no `gts`, which brings ESLint and Prettier), with documented deviations such as kebab-case files and default exports only where Next.js requires them | [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) |
| StrykerJS for mutation testing | Coverage does not prove assertions; the tap runner works with `node --test`, nightly full runs and incremental PR runs keep CI time bounded | [Stryker tap-runner](https://stryker-mutator.io/docs/stryker-js/tap-runner/) |
| WebKit iPhone projects test behavior, not FPS | Playwright WebKit on Linux renders WebGL in software and is not Safari.app; FPS only on real devices; iOS Low Power Mode caps rAF at about 30 fps | [Endform: WebKit support](https://endform.dev/docs/explanation/webkit-browser-support), [WebKit bug 215745](https://bugs.webkit.org/show_bug.cgi?id=215745) |
| DTCG design tokens as the single source | One token source for CSS, scenes and, later, the backoffice | [Design Tokens Community Group](https://www.designtokens.org/) |
| Rejected: React Three Fiber, Lenis, Storybook, `tsx`, dependency-cruiser | The scenes are an imperative engine with own shaders; synthetic smooth scroll hurts accessibility and iOS; `/_system` reuses build, Playwright and axe; Node 24 strips types natively; the own guard covers more and dependency-cruiser does not fit TypeScript 7 | [Engineering target state](research/engineering-target-state.md) §6A.6 |

Every rule, threshold and source behind these summaries is in the research documents.

## Limits

- No field data: CrUX and PageSpeed Insights had no usable quota or traffic, so all performance
  numbers are lab measurements.
- Lighthouse headless renders WebGL through SwiftShader (CPU); the audit ran it with and without
  3D APIs, and measured scenes on one real GPU (GTX 1050). Mid-range mobile GPU behavior is
  inferred.
- No real iPhone run was part of the research; WSL cannot run Xcode or the iOS Simulator.
- The audits target `origin/main` at `b5b3c57` (engineering, UX) and the production build
  (message). Later merges, such as the proof-first copy update in PR #194, are not reflected and
  require re-scoring.
- The developer lens has no numeric baseline until the scorecard tool exists.
- Effort for Phases B and C was not estimated by the research.
- This plan covers this repository. The assistant API and backoffice plans live in those
  repositories' own workspaces; [ecosystem](ecosystem.md) only summarizes them.

## How to execute phase by phase

1. The owner picks a phase (normally A first) and the decisions it needs from the
   [decision log](#decision-log).
2. Each workstream gets a spec in `docs/specs/` from the [template](../specs/template.md), with
   acceptance criteria copied or refined from the [roadmap](roadmap.md), on a task branch from
   `develop` in its own worktree, following [the development workflow](../development.md).
3. Implement in small vertical slices; every slice records verification in `docs/verification/`.
4. Close the phase only when its acceptance criteria pass, then re-score with the three fixed
   rubrics and update the [scorecard](scorecard.md).
5. Release through the normal `develop` → `main` PR. Activation, hosting and spending stay
   outside any phase unless the owner authorizes them explicitly (Phase V).

## Decision log

Open owner decisions, each with the research's recommendation. None is decided yet.

| ID | Decision | Options | Recommendation | Needed by |
| --- | --- | --- | --- | --- |
| D1 | Start Phase A | start now; wait | Start with guardrails A-E1 to A-E5, then the P0 issues in the audit's impact order | A |
| D2 | Solar background on reading routes (`/cv`, `/education`, `/contact`) | live scene everywhere (today); SceneHost opt-in with a CSS fallback (engineering research); opt-in with a rendered poster of the same scene | Rendered per-theme poster of the same scene on reading routes, live scene on home, stack and explorer; decide with A/B captures. This keeps the background as the owner requires while removing 1.3–2.2 MB of textures and a WebGL context from reading routes | A (performance) / B3 |
| D3 | GSAP | keep (the playbook drives uniforms and DOM from one timeline); remove (engineering: used only to read scroll progress, non-OSI license) | Remove in B3 with a `scroll-progress` adapter and CSS carousel; −1 runtime dependency | B3 |
| D4 | Light-mode concept | celestial atlas / ink on paper; daytime sky; inverted blueprint | Celestial atlas: the playbook calls it the most editorial option with the strongest contrast to dark, and it matches the current "ink-and-paper atlas" direction | A |
| D5 | Staging and previews | second Hostinger app tracking `develop` as staging; per-PR previews on the VPS/Coolify | Staging on Hostinger in B; Coolify previews evaluated in C or V | B |
| D6 | Lighthouse tooling | `lighthouse` 13.5.0 with an own gate script; `@lhci/cli` 0.15.1 | `lighthouse` 13.5.0 directly; `@lhci/cli` is stalled on Lighthouse 12.6 | A-E1 / B6 |
| D7 | Source layout | feature-first with layers inside each feature (engineering §3.3); top-level `domain/application/adapters/presentation` (standards §2.1) | Feature-first: the guard already enforces it, it is the least disruptive and the standards document lists it as a valid alternative with the same rules | B5 |
| D8 | `[locale]` routing for `<html lang>` | isolated spike; keep current routing | Spike; if it requires two root layouts or full reloads on locale change, record an ADR and keep the current state | B2 |
| D9 | Where scorecard and skill-eval history live | public repository; private `reports/` | Decide before B6; the research leaves it open | B6 |
| D10 | Mutation runner | Stryker tap-runner; Vitest runner | Tap-runner first; revisit with the first month of data | B6 |
| D11 | Real-device testing | BrowserStack open-source plan (terms to verify); LambdaTest/Sauce Labs free tiers for manual checks; owner's iPhone checklist | Apply for the open-source plan, keep the per-release iPhone checklist, no paid device cloud in B | B6 |
| D12 | Mobile hero catalog | full catalog (today); 12–16 curated brands plus a link to `/stack` | Curated set on mobile with the sphere animation intact; the full catalog stays on `/stack` | A |
| D13 | Token generator | own generator (engineering, about 150 lines); Style Dictionary (backoffice plan) | Own DTCG-compatible generator in B; adopt Style Dictionary when the backoffice becomes the second consumer, which is the trigger the engineering research names | B1 |
| D14 | Docs reorganization | Diátaxis folders and numbered MADR ADRs; keep the current layout | Reorganize in B8 together with the new ADRs, keeping existing links resolving | B8 |
| D15 | `CODE_OF_CONDUCT.md` | add Contributor Covenant 2.1; skip | Add (recommended, optional in the standards research) | B |
| D16 | Release skill invocation | implicit selection (current test rule); explicit-only | Keep implicit selection; execution authority already requires explicit authorization | A (skills) |
| D17 | Phase V activation | buy the VPS and authorize activation and spending; wait | Wait until A and the assistant API P0–P5 are done; then decide | V |

## Related repository documents

- [Architecture](../architecture.md) and [placement decision](../adr/site-architecture-parity.md)
- [Design system](../design.md) and [engineering standards](../engineering-standards.md)
- [Clean Architecture research](../research/clean-architecture.md) and
  [motion performance research](../research/motion-performance.md)
- [Native assistant](../native-assistant.md) and [deployment](../deployment.md)
