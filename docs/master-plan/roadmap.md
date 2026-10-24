# Master plan roadmap

Status: planning only. No phase is authorized until the owner starts it explicitly; see
[how to execute](README.md#how-to-execute-phase-by-phase). Part of the [master plan](README.md).

Effort units follow the UX audit: **S** ≤ ½ day, **M** 1–3 days, **L** > 3 days. The research did
not produce calendar estimates for Phases B and C; each workstream estimates itself in its spec
before starting. Phase V reuses the estimates of the assistant API and backoffice plans.

| Phase | Theme | Changes code structure | Gated by |
| --- | --- | --- | --- |
| A | UX polish on the current code | No | owner start |
| B | Clean Architecture, TypeScript and design-system refactor | Yes, behind the guard; same UI, HTML and URLs | Phase A guardrails (A-E1 to A-E5) in place |
| C | End state | Completes B; adds field data and optional upgrades | B acceptance criteria met |
| V | VPS-gated activation of assistant and backoffice | Configuration and contracts | VPS purchased plus explicit owner authorization |

## Phase A: UX polish on the current code

**Goal.** Raise the [designer](rubrics/designer.md) and [recruiter](rubrics/recruiter.md) scores
without refactoring, while installing the measurement needed to refactor safely later.

**Scope.**

1. Engineering guardrails (from the [engineering target state](research/engineering-target-state.md) §4):
   - A-E1: measurement baseline before touching UI (local Lighthouse, 5 mobile runs, on `/`,
     `/work`, `/work/pequeverso`, `/about`, `/cv` and `/es`; Performance traces on `/` and `/cv`
     on a mid-range mobile profile to confirm or refute the double-WebGL hypothesis), stored in
     `docs/verification/`.
   - A-E2: add `wcag21a` and `wcag22aa` to the `AxeBuilder` in `routes.spec.ts`.
   - A-E3: first `toHaveScreenshot` captures (static renderer forced, canvas masked) for 6 routes
     × 2 themes × desktop/mobile, baselines generated in the CI image.
   - A-E4: rewrite the scene contrast test so it is decoupled from copy.
   - A-E5: freeze the CSS budget at 25 KiB; raising it requires an ADR.
2. The 20 prioritized issues of the [UX audit](audit/baseline-2026-10.md) §6, in its Top 15
   impact order. P0: mobile LCP 4.4–6.1 s (lab) with 395–465 KB of JS per route (L); solar
   textures of 1.3 MB mobile / 2.2 MB desktop on every route with a continuous rAF and two WebGL
   contexts on home (M); a 9,628 px mobile hero journey with the full catalog and 100+ tab stops
   (M). P1 and P2 cover the signature-moment hitch, light-mode identity parity, lightbox filter
   bug, sticky header below 416 px, a pause control (WCAG 2.2.2), case-study wayfinding,
   responsive images, the Spanish 404, the 0.62× DPR background, label/heading semantics, diagram
   tab stops, hover transitions, page transitions, Pequeverso on home and minor targets.
3. The 75 polish rules of the [design and UX playbook](research/design-ux-playbook.md) §11 that
   apply to the current code, including the signature-scene work of §9 (motion language with four
   verbs, frame-rate-independent damping, quality tiers, per-theme posters) and the light-mode
   concept of §10, both under the owner's requirement to keep the sphere and the solar system.
4. Skills slices 1–5 of the [skills plan](research/skills-plan.md) §8 (catalog accuracy, metadata
   lint, rewrite of the six skills, `release-to-production` and `sync-cv`, the three audit skills),
   because the audit skills are the tools that measure Phase A.

**Acceptance criteria.**

- AC-A1: A-E1 to A-E5 merged; the baseline report is committed under `docs/verification/`.
- AC-A2: every P0 and P1 issue closed with before/after evidence (metric, screenshot or test).
- AC-A3: axe 0 serious/critical with WCAG 2.2 AA tags on every route in both themes and locales.
- AC-A4: light mode reviewed screen by screen against dark mode, scored separately; the lower
  score is reported.
- AC-A5: designer and recruiter re-scores recorded with the fixed rubrics; no copy claim added
  without the owner's approval.
- AC-A6: the sphere and the solar-system background are still present and visibly improved, not
  replaced.

**Effort.** The audit's 20 issues are 2 L, 7 M, 1 S–M and 10 S: at least 13 working days for the
L and M items alone (L has no upper bound) plus up to 5½ days for S and S–M items. Guardrails
A-E1 to A-E5 and the playbook rules are additional and estimated per spec.

**Risks.** Polishing without visual diffs (mitigated by A-E3 first); performance fixes that
weaken the signature scenes (mitigated by AC-A6 and per-theme posters); concurrent copy work in
another worktree (copy changes do not touch the design system or guard; visual diff separates
them).

**Dependencies.** None on other repositories. A-E3 precedes any CSS consolidation.

## Phase B: Clean Architecture, TypeScript and design-system refactor

**Goal.** Same UI, same semantic HTML and same URLs, verified by visual diff on every PR, with a
code base that can reach 95+ on every developer axis. Each workstream is a series of small PRs to
`develop`, each with its spec in `docs/specs/`.

**Scope** (from the [engineering target state](research/engineering-target-state.md) §5 and §6A,
and the [standards and index](research/standards-and-index.md)):

- B1 design system: DTCG tokens with mandatory dark/light modes, generated CSS and TS; closed
  scales (4 breakpoints, 6 z-index layers, 3 elevations); primitives and layout components;
  `/_system` catalog behind a build flag.
- B2 page → section composition: `views/<page>/view.tsx` + `model.ts` + `sections/`; Filomena and
  Pequeverso compose the same sections.
- B3 3D isolation: a single `SceneHost` contract (per-route opt-in, one active WebGL context,
  tiering, pause, budgets, dispose, determinism), a shared `FrameScheduler` and `QualityGovernor`,
  per-theme rendered posters, GSAP removal (decision D3).
- B4 content layer: schema, EN/ES parity in types, `technologies.ts` (2,704 lines) split by
  category with stable IDs.
- B5 Clean Architecture across `src/` with guard rules G1–G10 in report mode and a baseline
  ratchet, flipped to enforce when the baseline reaches 0.
- B6 quality gates: visual regression, axe 2.2, Lighthouse, per-route budgets, StrykerJS mutation
  testing, the Chromium/WebKit-iPhone/Firefox matrix, flake and quarantine policy.
- B7 cookie-free RUM through the existing default-off analytics feature.
- B8 documentation: the 8 ADRs of §3.9, updated architecture and design docs, generated token
  table.
- 6A.1 TypeScript everywhere: the 39 JavaScript files migrate to `.ts`; `postcss.config.mjs` is
  the only owner-approved exception; guard rule G10 forbids new JavaScript.
- 6A.3 light mode as a first-class theme: two-mode tokens, build-time contrast checks,
  `SceneTheme`, `ReadingVeil`, theme change without re-mount.
- 6A.4 CI/CD: parallel `build`, caching, new `visual`, `lighthouse` and `mutation-incremental`
  jobs, docs-only path filters, staging, release-please, post-deploy monitor.
- Standards: Google TypeScript Style Guide baseline with the documented deviations, enforced with
  Biome; renames and moves from the move map and
  [file index](research/file-index-current.csv); community files.
- Skills slices 6–7 (design/content skills, behavior evals).

**Acceptance criteria.** The rows tagged B1–B8 in the [scorecard gates](scorecard.md#measurable-experience-gates), plus:

- AC-B0: the first automated scorecard is published (`tools/scorecard.ts`), giving the developer
  lens its baseline.
- AC-B1: 0 unapproved visual diffs across the refactor; URLs unchanged.
- AC-B2: guard in enforce with an empty baseline; 0 new JavaScript outside the exception list.
- AC-B3: mutation break thresholds 85 → 90 for domain/application and 80 → 90 for tools on the
  quarterly ratchet.
- AC-B4: iPhone 15 and iPhone SE WebKit projects green in PR journeys and nightly matrix.
- AC-B5: PR CI p50 ≤ 7 min and p90 ≤ 10 min despite the new gates.

**Effort.** Not estimated by the research; each of the eight workstreams and three 6A tracks
estimates itself in its spec. The migration order is fixed by §3.8 (guard rules in report mode,
design system, scene host, views, shell server with islands, content schema, enforce).

**Risks** (from §8): CSS refactor changing pixels; flaky visual tests from fonts/GPU; noisy
Lighthouse on shared runners; Clean Architecture over-engineering; a ratchet that never ends;
removing the live scene from reading routes changing the identity (decision D2); `[locale]`
routing breaking reload-free navigation (decision D8); RUM contract changes needing the API
owner's handoff.

**Dependencies.** Phase A guardrails. RUM (B7) needs an analytics contract handoff with the
assistant API owner. Shared tokens become an input for the backoffice (see
[ecosystem](ecosystem.md)).

## Phase C: end state

**Goal.** Every axis of every lens at 95 or more, sustained by automated gates.

**Scope** (engineering target state §6): layers `app` → `views`/`shell` → `features` →
`design-system` → `content`/`config` with the guard in enforce and an empty baseline; DTCG tokens
as the single source for CSS and scenes, optionally a workspace package if Pequeverso consumes
them; a single `SceneHost`, with an OffscreenCanvas worker spike only if traces justify it (WebGPU
still not selected); `<ViewTransition>` when stable; optional MDX for long case-study prose;
total prerendering; CSP Report-Only with strict `script-src` moving to enforce if the SRI/hash
spike covers inline scripts; HSTS preload remains a domain-owner decision; monthly review of RUM
p75.

**Acceptance criteria.**

- AC-C1: every developer axis ≥ 95 on two consecutive nightly scorecards; mutation ≥ 95 in
  domain/application.
- AC-C2: field p75 LCP ≤ 2.0 s, INP ≤ 150 ms and CLS ≤ 0.05 with ≥ 500 views/month per grouped
  route (requires analytics enabled, so it depends on Phase V or another approved collector).
- AC-C3: designer ≥ 95 and recruiter ≥ 95 under the fixed rubrics, light and dark scored
  separately.

**Effort.** Not estimated; depends on the B outcome and on traffic for field data.

**Risks.** Experimental APIs (View Transitions, SRI, Cache Components) reconsidered only with
updated sources; field data may need months of traffic.

**Dependencies.** Phase B; Phase V for field data if RUM is collected by the assistant API.

## Phase V: VPS-gated activation

**Goal.** Activate the native assistant, analytics collection and the backoffice once the
infrastructure exists. **The VPS has not been purchased**; nothing in this phase starts before
the owner buys it and authorizes activation, spending and deployment.

**Scope.**

- Portfolio: build with `ASSISTANT_ENABLED=true` and the analytics flag only after the API is
  deployed and verified; contract snapshot refresh in `contracts/assistant-api/`; production
  browser acceptance with the API's exact HTTPS origin.
- Assistant API: its P6 (live capability suite, red team, daily canaries, Neo4j decision) and
  deployment by VPS operations.
- Backoffice: image publication, attestation and SBOM, versioned migrations, Coolify deployment
  with health checks, OpenTelemetry and the deploy/rollback runbook.
- Optional: per-PR previews on Coolify (decision D5) and the RUM dashboard in the backoffice.

**Acceptance criteria.**

- AC-V1: the portfolio's enabled assistant passes the enabled conversation suite against the
  deployed API, and the disabled build still passes `test:assistant-disabled`.
- AC-V2: assistant API P6 thresholds met (correct facts/abstention ≥ 95 %, citation support ≥ 95 %,
  language ≥ 99 %, 0 critical security findings, TTFT p95 ≤ 3 s, cost p95 ≤ USD 0.005 per answer).
- AC-V3: backoffice F4 criteria met (`gh attestation verify` documented and tested in a dry run,
  traces visible in a collector, re-evaluated scorecard ≥ 95 on every axis).
- AC-V4: coordinated release recorded across the three repositories (see [ecosystem](ecosystem.md)).

**Effort.** From the sister plans: assistant API P0 1–2 days, P1 1–2 weeks, P2 2–3 weeks, P3 1–2
weeks (partly parallel to P2), P4 1 week, P5 1 week, P6 not estimated (needs authorization and
budget); backoffice F0 about 1 week, F1 about 2, F2 about 2–3, F3 about 2, F4 about 1–2 weeks.
Their pre-activation phases can run before the VPS exists.

**Risks.** Spending authorization; without P6, the assistant's eval quality tops out around 90;
cross-origin cookies, CORS and CSRF between sibling subdomains; contract drift between repositories.

**Dependencies.** VPS purchase; the assistant API and backoffice plans; Phase B7 if RUM uses the
analytics contract.
