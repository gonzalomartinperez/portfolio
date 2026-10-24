# Engineering current state and target state (Phases B and C)

> Status: planning research, not executed. Translated from the owner's Spanish working file `reports/portfolio-ux/engineering-target-state.md` (kept outside this repository), dated as in the source. Part of the [master plan](../README.md).

Date: 2026-10-24 · Audited source: `origin/main` @ `b5b3c57` (PR #192) of
`gonzalomartinperez/portfolio` (read-only; extracted with `git archive`, no build or execution).
Scope: the engineering half of the master roadmap. Phase A (UX/design polish on the current code,
no refactor) is defined by another document; here only the engineering *guardrails* worth having
before or during Phase A are listed. File paths are relative to the repo root.

> Convention: **[measured]** = counted in the code; **[hypothesis]** = inferred from the code, requires
> a trace/measurement before acting; **[source]** = external practice cited inline.

---

## 0. Executive summary

- The repo is already **exceptionally disciplined in process**: its own AST architecture guard
  (`tools/architecture.mjs` + `tools/architecture-policy.mjs`, 540 + 133 lines, with negative fixtures
  in `tests/unit/architecture.test.mjs`), CI with a single build bound to provenance and 8
  browser shards, `failOnFlakyTests`, transfer budgets, a full-history secret scan,
  frozen API contracts. The deficit is not rigor but the **visual system and experience
  measurement**: there is no design system with a contract, no real visual regression, no
  Lighthouse/RUM, and the budgets measure bytes, not experience.
- Main pain points: CSS spread over 33 CSS Modules (~5,000 lines) with ~20 distinct breakpoints,
  39 hex + 43 `rgb()` literals and 66 `font-size` literals outside tokens; the CSS budget
  raised 4 times (20→22→24→25 KiB); the **WebGL solar system is mounted in the root layout on all
  routes** (including `/cv`), and on `/` it coexists with the hero's WebGL; the contrast test over the
  scene (`tests/browser/solar-system.spec.ts:331`) is intrinsically fragile (pixel sampling
  over a live scene); axe runs without `wcag22aa`.
- **Phase B** (incremental refactor, behind the guard): (B1) design system as a presentation
  infrastructure with typed tokens (DTCG format) + primitives + motion tokens; (B2) page→sections
  composition; (B3) 3D performance contract and a single "scene host"; (B4) content layer with
  schema and parity; (B5) Clean Architecture extended to all of `src/` with new guard rules;
  (B6) experience quality gates (deterministic visual diff, axe 2.2, Lighthouse CI, per-route JS budgets,
  flake policy); (B7) cookie-free RUM; (B8) ADRs/docs.
- **Phase C** (final state): thin routes → views → sections → design system; features with
  explicit layers only where there is logic; 3D isolated behind a `SceneHost` with a contract (per-route opt-in,
  device tiering, offscreen pause, frame and byte budget); measurable gates:
  Lighthouse mobile ≥ 95 (perf) / 100 (a11y, best practices, SEO) on key routes, CWV p75
  LCP ≤ 2.0 s · INP ≤ 150 ms · CLS ≤ 0.05 (stricter than Google's "good" thresholds),
  0 axe serious/critical violations with WCAG 2.2 AA, initial JS ≤ 90 KiB gzip per route,
  visual diff with 0 unapproved changes, 0 tests in quarantine > 14 days.
- **Additional owner requirements** (§6A): 100% TypeScript except `postcss.config.mjs` (39 JS files
  inventoried; Node 24 type stripping, no `tsx`); signature scenes with a unified `FrameScheduler`/`QualityGovernor`,
  a DPR ceiling per tier, real offscreen pause, per-theme posters for reduced motion/low-end and
  **removal of GSAP** (it is only used to read scroll progress); light mode as a first-class theme
  (tokens with two mandatory modes, contrast computed at build time, `SceneTheme` per theme, `ReadingVeil`);
  CI/CD with visual/lighthouse/mutation jobs in parallel, staging on `develop`, release-please and a
  p50 ≤ 7 min budget; testing with coverage per layer, **StrykerJS** (domain/application/tools, break 85→95),
  a Chromium/WebKit-iPhone/Firefox matrix with per-engine visual and iOS quirks; a dependency plan that is net −1 at
  runtime; automatic scorecard with 8 axes ≥ 95 (§7.1).

---

## 1. Current state (repo map)

### 1.1 Stack, build and hosting

| Aspect | State | Evidence |
| --- | --- | --- |
| Framework | Next.js 16.4.2, React 19.3.1, TypeScript 7.0.2, exact pins | `package.json` |
| Bundler | **Webpack** (`next build --webpack`), not Turbopack; custom budget plugins (`SceneBudgetPlugin`, `AssistantBudgetPlugin`) read the Webpack chunk graph | `next.config.mjs`, `tools/scene-budget-plugin.mjs`, `tools/assistant-budget-plugin.ts` |
| Rendering | Prerendered routes (Server Components); no `generateStaticParams`, no `cacheComponents`/`"use cache"`, no Server Actions (the guard rejects them) | `src/app/**`, `docs/research/clean-architecture.md` |
| Hosting | Hostinger managed Node.js (no static export); Node 24.6 / GLIBC 2.28 verified in the `hosting` job with SWC WASM | `.github/workflows/ci.yml` job `hosting`, `docs/deployment.md` |
| Lint/format | Biome 2.5.15 | `biome.json` |
| Headers | Partial CSP (`base-uri`, `form-action`, `frame-ancestors`, `object-src`, `upgrade-insecure-requests`), HSTS without preload, XFO, nosniff, Referrer-Policy, Permissions-Policy, COOP. **No `script-src`** (documented decision because of inline hydration scripts) | `next.config.mjs` |
| i18n | Duplicated routes: EN without prefix, ES under `/es` (20 thin `page.tsx` files that call the same view with `locale`); a single root layout so the page does not reload when switching language; `<html lang>` is served as `en` and corrected on the client, each ES page wraps in `<div lang="es">` | `src/app/layout.tsx`, `src/app/es/**`, `config/locales.ts`, `config/routes.ts` |
| Content | Typed bilingual TS in `content/{en,es}/*.ts` + shared registries (`technologies.ts` 2,704 lines), image-dimension JSON, document manifest with hashes; `content/index.ts` is `server-only` | `content/**`, `tests/unit/content.test.mjs` |
| Feature flags | `ASSISTANT_ENABLED`, `ANALYTICS_ENABLED` evaluated at build in the root layout; default off; "disabled" build verified separately | `src/app/layout.tsx`, `tests/rollout/assistant-disabled.spec.ts` |

### 1.2 Module architecture and guard

Roots (ADR `docs/adr/site-architecture-parity.md`): `src/app` (Next composition) → `src/views`
(server page composition) / `src/shell` (header, footer, theme/locale, `PageMotion`) →
`src/features/<f>` (layers `domain/application/adapters/presentation` as used) → `src/shared/<cap>`
(ui, styles, motion, identity, technology, navigation, contact, editorial) → `content`/`config`.

The guard (`tools/architecture.mjs`, rules in `boundaryViolation`) already enforces:
dependency direction, explicit public entries per feature (`publicEntries` in
`tools/architecture-policy.mjs`), cycles (including type-only), transitive closure client→`server-only`
/Node builtins, API contracts only in `adapters`, clock purity in domain/application,
exact classification of every file (`contentPaths`, `configPaths`, etc.).

**Guard gaps [measured]:**

1. `src/app`, `src/views` and `src/shell` accept **any file** (`/^src\/(?:app|views|shell)\/.+/`
   in `placementViolation`): there is no internal structure or size/shape limits.
2. **There is no npm package allowlist per layer**: `three` and `gsap` appear in
   `features/hero/adapters/scene-runtime.ts` and also in
   `features/tool-carousel/presentation/tool-carousel-client.tsx` (GSAP imported from presentation);
   `@xyflow/react` and Radix are not bounded by any rule.
3. CSS is classified but **not validated** (colors, durations, breakpoints, z-index are free).
4. There is no control over where `"use client"` may appear (26 client files; most are correct,
   but `shell/site-footer.tsx` and `shell/site-header.tsx` are entirely client).
5. Domain/application exist in `assistant` and `analytics`; in `hero`, `solar-system`,
   `architecture-diagrams` the layer rules apply but `presentation` contains significant
   orchestration (e.g. the engine lifecycle in `solar-system/presentation/solar-system.tsx`,
   347 lines, with idle loading, generations, context loss and debug URL params).

### 1.3 Styling

- Tailwind v4 **without Preflight** + `@layer theme, base, components, utilities` + CSS tokens in
  `src/app/globals.css` (516 lines; token authority: surfaces, text, accent, spacing 1–10,
  measures, type scale with `clamp()`, radius, 2 easings, 2 durations, control depth) + shadcn/ui
  "radix-nova" adapted in `src/shared/ui/` (8 primitives: button, badge, card, dialog, input, label,
  native-select, skeleton) + 33 CSS Modules.
- Theme: `data-theme` as the single authority, dark by default, inline pre-paint script.
- **Sprawl [measured]**: ~5,017 CSS lines; ~20 distinct media queries mixing `rem`/`px` and
  syntax (`width < 52rem`, `max-width: 620px`, `width <= 620px`, `max-width: 640px`,
  `width < 768px`…); 39 hex + 43 `rgb()/rgba()` literals in modules; 66 `font-size` literals in
  modules; 47 `border-radius` without a token vs 23 with a token; 14 `z-index` values without a scale
  (−1…110); literal durations (900, 300, 220, 180, 160, 150 ms) next to only 2 duration tokens;
  3 `cubic-bezier` (one outside tokens).
- **Budget creep**: non-assistant CSS 20 → 22 → 24 → 25 KiB gzip (`docs/specs/engineering-profile-polish.md`,
  `docs/specs/product-analytics.md`, `tests/integration/budget.test.mjs`); HTML per page raised to 70 KiB
  because of the full server-rendered catalog (`docs/specs/continuous-technology-carousel.md`).
- Components: 20 files use `Button`, but the dominant pattern is `buttonVariants()`/`cardVariants()`
  applied to `<Link>`/`<a>` mixed with global classes (`section`, `frame`, `prose`, `flow`,
  `muted`, `eyebrow`, `tags`, `actions`) and per-page modules. There are three styling "languages" at once
  (utilities, semantic globals, modules), with no rule on when to use which beyond `docs/design.md`.

### 1.4 3D, motion and interactive features

| Feature | Implementation | Evidence |
| --- | --- | --- |
| Hero sphere | Three.js `Points` + shaders, GSAP ScrollTrigger over native scroll, dynamic import of the runtime, static fallback, deterministic `?sceneProgress=&sceneTime=` | `src/features/hero/**` (`scene-runtime.ts` 633 l.) |
| Solar system | Three.js with versioned textures (manifest + hashes), adaptive resolution quality controller, idle load, context-loss recovery, static fallback, `?solarTime=&solarDebug=` | `src/features/solar-system/**` (`solar-system-engine.ts` 620 l., `solar-system-quality.ts`) |
| Ambient field | **`<AmbientField>` in the root layout mounts `<SolarSystem>` on all routes**; the engine is loaded with `requestIdleCallback` except under reduced-motion | `src/app/layout.tsx`, `src/features/solar-system/presentation/ambient-field.tsx`, `solar-system.tsx:152–240` |
| Diagrams | Lazy React Flow (`next/dynamic`) with a server-rendered figure | `src/features/architecture-diagrams/**` |
| Galleries | Radix Dialog with fallback to direct links | `src/features/project-gallery/**` |
| Carousel | GSAP via `import("gsap")` in presentation | `src/features/tool-carousel/presentation/tool-carousel-client.tsx:71` |
| Page motion | WAAPI + IntersectionObserver per `section.section` in a client wrapper around all of `main` | `src/shell/page-motion.tsx` |
| Motion state | Shared pause store (the assistant can "hold" motion) | `src/shared/motion/motion-state.ts` |

Scene budget: deferred hero+solar closure ≤ 250 KiB gzip, solar textures < 8 MiB, thumbnails ≤ 320 KiB,
reading mode ≤ 2.5 MiB, non-scene chunks ≤ 80 KiB gzip (`tests/integration/budget.test.mjs`).
**[hypothesis]** On `/`, 2 WebGL contexts can coexist (hero + ambient solar), and on reading routes
(`/cv`, `/education`) Three.js + textures are downloaded and executed for a decorative background; this is
the first thing to trace on a mid-range mobile (Performance panel + `chrome://gpu`, Moto G Power-class / Pixel 6a).

### 1.5 Tests and CI

| Layer | What exists | Notes |
| --- | --- | --- |
| Static | Biome, `tsc` (2 projects), architecture guard, workflow policy, dependency policy | `npm run check:quality` |
| Unit (node:test) | ~40 files: assistant (state, SSE, transport, budget…), analytics, content/parity, catalogue, CV export, cloud layout, diagrams, policies | `tests/unit/**` |
| Integration | budgets over `.next`, rendered HTML, server smoke | `tests/integration/{budget,rendered}.test.mjs`, `tools/smoke-test.mjs` |
| Browser (Playwright 1.64.1) | 40 specs; desktop Chrome 1440×1000 + Pixel 7; Firefox/WebKit only for assistant and analytics; `workers: 1`, `retries: 1` + `failOnFlakyTests` in CI; axe in `routes.spec.ts` with `wcag2a/2aa/21aa` | `playwright.config.ts`, `tests/browser/**` |
| Visual | **There is no `toHaveScreenshot`** in any spec. The nightly "visual inventory" is 3 functional specs (`routes`, `shadcn-controls`, `work-architecture`) | `tools/browser-ci-planner.mjs:160` |
| Perf | Only byte budgets and a `lab.spec.ts` that *records* local LCP/CLS/cadence without asserting thresholds; **no Lighthouse, no RUM** | `tests/browser/lab.spec.ts`, `budget.test.mjs` ("Field performance is not established anywhere") |
| CI | `workflows`, `secrets`, `quality`, `build` (once, packaged with provenance), `hosting` (GLIBC 2.28), `browser` ×8 shards, `performance` (budgets), `Required checks`; nightly with a frozen candidate | `.github/workflows/{ci,nightly}.yml` |

**Known flakes**: history of contrast/scene-stability fixes (`28d4e2d`, `2fad54a`, `567c3f1`,
`aa64496`, `68df556`, `5e78524`). The latest (`28d4e2d`, 2026-10-24) changed the sampling because a line
0.4 px from the viewport edge read transparent pixels. The test hides the text, captures the scene and
computes luminance per line: it **couples the copy's accessibility to the text reflow position and to the
scene frame**, which is why any copy change can break it. 10 `waitForTimeout` in specs.

### 1.6 Strengths (preserve)

1. A real architecture guard with negative fixtures; transitive client/server closure.
2. A single build with provenance reused by shards; `failOnFlakyTests`; strict required aggregate.
3. 3D with complete fallbacks, reduced-motion, visibility pause, context-loss, adaptive quality, deterministic
   URLs for tests (`sceneProgress`, `solarTime`).
4. Typed bilingual content with parity tests; documents with hashes; strong analytics privacy
   (no credentials, no storage, UUID per event).
5. Documentation and specs with ACs and evidence (ADR, specs, research).

### 1.7 Prioritized pain points

| # | Problem | Impact | Evidence |
| --- | --- | --- | --- |
| P1 | No design system with a contract: incomplete tokens (z-index, breakpoints, motion, elevation), literals in modules, 3 styling languages | Visual inconsistency across pages/themes; each UX polish touches N modules; growing CSS budget | §1.3 |
| P2 | Global WebGL solar in the root layout; possible double context on `/` | CPU/GPU/battery on mobile, LCP/INP on reading routes; contrast noise | §1.4 |
| P3 | No visual regression or experience perf in CI | UX regressions only detectable by hand; the rubric (Lighthouse, CWV) has no gate | §1.5 |
| P4 | Fragile contrast test over a live scene | Recurring flakes tied to copy | `solar-system.spec.ts:331`, `28d4e2d` |
| P5 | axe without WCAG 2.2 (`target-size`, focus) and without a breakdown by impact | The rubric requires WCAG 2.2 AA | `routes.spec.ts:72` |
| P6 | Large views with markup + classes (`education-view.tsx` 361 l., `home-view.tsx` 293 l.) and parallel case studies (`filomena-view.tsx`/`pequeverso-view.tsx` share `case-study.module.css` but not section components) | Duplication when adding a third case study | `src/views/**` |
| P7 | Entirely client shell (header/footer) and `PageMotion` wrapping all of `main` in a client component | Initial JS on all routes; entry animation not tied to navigation (no View Transitions) | `src/shell/**` |
| P8 | `<html lang="en">` corrected on the client on ES routes | SEO/a11y (readers read the `div lang`, but the document declares `en`) | `src/app/layout.tsx` |
| P9 | GSAP in the carousel's presentation; no package allowlist per layer | Erosion of boundaries; GSAP does not tree-shake | `tool-carousel-client.tsx:71` |
| P10 | Aggregated byte budgets, not per route; no initial-JS budget per route nor long-task budget | Cannot answer "how much JS does /cv pay?" | `budget.test.mjs` |

---

## 2. Research: 2025–2026 practices and their local implications

### 2.1 Next.js 16 App Router, RSC and caching

- Next 16 (stable since 2025-10-21) introduces **Cache Components** (`cacheComponents: true`, PPR +
  `"use cache"`), Turbopack by default for new projects and `proxy.ts` instead of middleware
  [source: [Next.js 16](https://nextjs.org/blog/next-16)]. Implication: the site is 100% content
  reviewed at build time; it **does not need PPR or `"use cache"`**. Keep full prerender; adopt
  `cacheComponents` only if dynamic content appears (e.g. an assistant with server state). Record
  the decision in an ADR so nobody enables it "just because".
- Server/Client: keep Client Components as leaves, passing minimal serializable props
  [source: [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)].
  Implication: split `site-header.tsx` into a server shell + client islands (mobile menu, theme, locale).
- `next/dynamic` with `ssr: false` only from Client Components; `React.lazy` prerenders by default
  [source: [Lazy Loading](https://nextjs.org/docs/app/guides/lazy-loading)]. Already used well in diagrams and assistant.
- Experimental bundle analyzer `next experimental-analyze` (16.1+) with a per-route filter and client/server
  import trace, static output with `--output` [source: [Next.js 16.1](https://nextjs.org/blog/next-16-1),
  [Package bundling](https://nextjs.org/docs/app/guides/package-bundling)]. Implication: it is Turbopack-only;
  with Webpack the repo already has its own plugin. **Migrating to Turbopack is not a goal of B** (it would break
  `SceneBudgetPlugin` and the SRI option, see 2.9); evaluate it in C with a spike that reimplements budgets
  on the build manifest.

### 2.2 View Transitions

`<ViewTransition>` comes from React and is enabled with `experimental.viewTransition`; route
navigations are transitions, and without browser support the app works the same; Next marks it experimental and
not recommended for production [source: [View Transitions guide](https://nextjs.org/docs/app/guides/view-transitions),
[`viewTransition` config](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition)].
The repo's policy forbids experimental APIs (`docs/engineering-standards.md`). Recommendation: in B
design the motion system so that page transitions are a **replaceable layer** (today
`PageMotion` with WAAPI); in C adopt `<ViewTransition>` when it leaves experimental, with
`prefers-reduced-motion` and without depending on it for state.

### 2.3 Three.js: splitting, pause, workers

- Three.js does not free resources on its own; you must `dispose()` geometries, materials, textures and renderer
  [source: [three.js manual: cleanup](https://threejs.org/manual/en/cleanup.html)]. The repo already does this;
  turn it into a **tested contract** of the `SceneHost` (`renderer.info.memory` counters at 0 after unmount).
- OffscreenCanvas in a worker keeps animation smooth when the main thread is busy, with gotchas
  (Three expects `style.width/height`; no DOM in the worker; the main thread loses the canvas)
  [sources: [web.dev OffscreenCanvas](https://web.dev/articles/offscreen-canvas),
  [Evil Martians](https://evilmartians.com/chronicles/faster-webgl-three-js-3d-graphics-with-offscreencanvas-and-web-workers)].
  Implication: the hero depends on ScrollTrigger and pointer on the main thread, and the explorer's solar does too; a
  worker requires a message protocol (progress, pointer, theme, pause). **Spike in C**, only if
  traces show render-loop long tasks affecting INP; not in B.
- Offscreen pause: the repo pauses on `document.hidden`; what is missing is pause by the **host's IntersectionObserver**
  and by route (do not mount the solar where it adds nothing). This goes into the 3D contract (§5 B3).

### 2.4 Design tokens and components

- DTCG (`$value`, `$type`, `$description`) is the standard format; Style Dictionary v4+ supports it
  natively and emits CSS custom properties with aliases as `var(--…)` [sources:
  [Design Tokens Community Group](https://www.designtokens.org/),
  [Style Dictionary](https://github.com/style-dictionary/style-dictionary),
  [OpenReplay: intro to design tokens](https://blog.openreplay.com/es/introduccion-design-tokens/)].
  Pragmatic implication: the repo avoids new dependencies and already has its own generators in `tools/`.
  Author tokens in **DTCG JSON** and generate them with its own `tools/generate-tokens.mjs` (≈150 lines,
  with `--check` as `test:identity`), which keeps the door open to Style Dictionary if a second
  consumer appears (e.g. Pequeverso or Figma) without paying for it today.
- Primitives: they are already "owned" shadcn/Radix (`components.json`). Correct: Radix for accessible
  behavior (Dialog), shadcn as our own code. Do not add another library.
- Workshop: Storybook has the ecosystem (a11y, visual, Chromatic); Ladle is faster but React-only
  and with less clear React 19 support [sources: [Ladle docs](https://ladle.dev/docs/),
  [PkgPulse 2026](https://www.pkgpulse.com/guides/storybook-8-vs-ladle-vs-histoire-2026),
  [DEV: Storybook 10 vs Ladle](https://dev.to/saswatapal/storybook-10-why-i-chose-it-over-ladle-and-histoire-for-component-documentation-2omn)].
  Recommendation: **do not** add Storybook (a second toolchain, conflict with exact pins and the single build).
  Instead, an internal route `/_system` (or `/design-system`) **excluded from the production build via a
  build flag** (same pattern as `ASSISTANT_ENABLED`) that renders every primitive × variant × theme ×
  locale; Playwright uses it for visual diff and axe. It reuses the whole existing pipeline.

### 2.5 Motion system

Motion (formerly Framer Motion) is MIT with `LazyMotion` ≈ 4.6 KB initial; GSAP core ≈ 23 KB + ScrollTrigger,
without tree-shaking, and a license with a usage restriction on tools competing with Webflow
[sources (vendor, take with caution): [Motion: GSAP vs Motion](https://motion.dev/docs/gsap-vs-motion),
[Reduce bundle size](https://www.framer.com/motion/guide-reduce-bundle-size/)]. Implication: the site
**does not need a UI animation library**: CSS transitions + WAAPI cover micro-interactions and
reveals; GSAP is today only used in the hero to read scroll progress (no pin or scrub) and in the carousel:
both uses are replaceable by an own adapter and CSS, so **the goal of B3 is to remove GSAP** (§6A.2).
Until then, confine it to `features/hero/adapters/**`. Motion tokens:
`--duration-{instant,micro,short,medium,long}`, `--ease-{standard,enter,exit,emphasized}`,
`--distance-{xs,sm,md}`, and a table of "patterns" (reveal, press, hover-lift, dialog, page) with their
reduced-motion variant.

### 2.6 UI testing

- Visual regression: `toHaveScreenshot` waits for stable captures, disables CSS/WAAPI animations and hides
  the caret by default; screenshots depend on browser and platform (the name includes
  `chromium-linux`) and must be generated in the same environment; `stylePath` and `mask` for volatile areas;
  `maxDiffPixels`/`threshold` are configurable [sources: [Playwright: visual comparisons](https://playwright.dev/docs/test-snapshots),
  [Hyperping guide](https://hyperping.com/learn/playwright/playwright-screenshots-visual-testing)].
  Implication: CI already runs on the Playwright Noble image pinned by digest → generate baselines **in
  that same image** (a manual `update-snapshots` job) and never locally in WSL. Canvas: capture with fixed
  `sceneProgress`/`solarTime` **or** force the static renderer and mask the canvas; the WebGL scenes
  have their own suite of a few captures with explicit tolerance.
- Flakes: retries only hide; a pass after retry is a flake signal [sources:
  [Playwright retries](https://playwright.dev/docs/test-retries),
  [Nx flaky tests](https://nx.dev/docs/technologies/test-tools/playwright/guides/flaky-tests)].
  The repo already fails on flaky; what is missing is a **dated quarantine policy** (§5 B6).
- Pyramid/trophy: strong static base, integration in the middle, selective E2E
  [source: [Kent C. Dodds, Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)].
  The repo has a lot of E2E (40 specs, 8 shards) and little "component integration": the `/_system` catalog
  covers that gap at low cost.
- Accessibility: `target-size` (WCAG 2.5.8) has existed in axe since 4.5 and requires enabling 2.2 rules;
  the recommended set is `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`
  [sources: [Deque: axe-core 4.5 WCAG 2.2](https://www.deque.com/?p=33165),
  [QASkills: axe + Playwright 2026](https://qaskills.sh/blog/axe-core-playwright-accessibility-testing-2026)].
  Verify with `@axe-core/playwright` 4.14 which rules fall under `wcag22aa` before fixing the gate.

### 2.7 Performance: Lighthouse CI, budgets, RUM

- CWV "good" at p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, evaluated with field data
  [source: [web.dev thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)].
- Lighthouse varies between runs; use the median of ≥ 5 runs and isolated environments; free CI is volatile
  [source: [Lighthouse variability](https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md)].
- LHCI: `assert` with presets and thresholds per category/metric or a `budget.json` per path; action
  `treosh/lighthouse-ci-action`; LHCI 0.15.x uses Lighthouse 12.6 [sources:
  [Unlighthouse: LHCI budgets](https://unlighthouse.dev/learn-lighthouse/lighthouse-ci/budgets),
  [treosh/lighthouse-ci-action](https://github.com/treosh/lighthouse-ci-action)].
  Implication: run LHCI against the **already packaged build** (`performance` job) over loopback, 5 runs,
  emulated mobile, and gate on the median. Pin the action by digest (repo policy).
- RUM: `web-vitals` (with the `attribution` build +~0.6 KB brotli) and sending with `sendBeacon`/`fetch keepalive`;
  beware of payloads that include the full URL, UA, device memory [sources:
  [GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals),
  [OneUptime 2026](https://oneuptime.com/blog/post/2026-01-15-track-web-vitals-lcp-fid-cls-react/view)].
  Implication: the repo **already has a private, default-off event channel** (`src/features/analytics`,
  contract `contracts/assistant-api/product-event.schema.json`). The aligned option is to add a closed
  `web-vital` event (name, rounded value, rating, canonical route from the allowlist, `navigationType`,
  device bucket: `saveData`, `effectiveType`, `hardwareConcurrency` in buckets) **without** UA, without a free
  URL, without IDs; it requires a contract handoff with the API owner (`docs/engineering-standards.md`).
- Error observability: Sentry Next.js has `instrumentation-client.ts`, opt-in replay, and
  `sendDefaultPii` controls IP/headers [source: [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs)].
  For a static portfolio the value is low against the cost (SDK, third party, CSP). Recommendation: **no
  Sentry in B**; in C, a minimal `window.onerror`/`unhandledrejection` via the same analytics channel, with
  sampling and truncated messages, or OTel only if the assistant is enabled (the backend already has its own observability).

### 2.8 Typed content / MDX

Velite generates a typed layer from MD/MDX/YAML/JSON with Zod; Contentlayer was abandoned; for small
sites `@next/mdx` without an intermediate layer is enough [sources: [Velite](https://velite.js.org/guide/introduction),
[Wisp: Contentlayer alternatives](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives)].
Implication: the current content is **structured** (metrics, dates, technology IDs, galleries), not
long prose; TS + parity tests is the right choice. Improve in B: explicit schemas in
`content/types.ts` with `satisfies`, a single `Locale`-keyed record per document (instead of two
parallel files that diverge) and reference validation (technology IDs, images, routes). MDX only if a
case study needs rich prose with embedded components (C, optional).

### 2.9 Security: CSP in prerendered Next

A nonce CSP requires dynamic rendering (incompatible with prerender/PPR); there is hash-based CSP via
`experimental.sri` (webpack-only, App Router, experimental) [sources:
[Next.js CSP guide](https://nextjs.org/docs/app/guides/content-security-policy),
[Report URI: Next.js](https://docs.ams.report-uri.com/frameworks/next-js/)].
Implication: the current decision (no `script-src`) is reasonable. In C: a spike of `script-src 'self'
'sha256-…'` (hash of the fixed theme script + SRI of chunks) **only** if Next leaves experimental or if it is
shown to cover the inline scripts of the RSC payload; meanwhile add `Content-Security-Policy-Report-Only`
with a strict `script-src` to measure without breaking anything. The build stays on Webpack, which keeps that option alive.

### 2.10 Clean Architecture and alternatives for the frontend (owner requirement)

- **Dependency rule**: source code only depends inward; entities → use cases → interface
  adapters → frameworks & drivers; the UI and the web are details [source:
  [R. C. Martin, The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)].
- **Ports & Adapters**: allow the application to be driven equally by users, programs, tests or
  scripts, and developed/tested in isolation from devices and databases; ports = core interfaces,
  adapters = technology; the hexagon is just a drawing, not layers [sources:
  [A. Cockburn, Hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture/),
  [H. Graça, Ports & Adapters](https://herbertograca.com/2017/09/14/ports-adapters-architecture/)].
- **Frontend**: Stemmler separates presentation (components + UI logic), interaction (state/use cases),
  and infrastructure (network, storage) [source: [K. Stemmler, Client-Side Architecture Basics](https://khalilstemmler.com/articles/client-side-architecture/introduction/)].
  Fowler: presentation/domain/data, with no mandatory build order [source:
  [M. Fowler, PresentationDomainDataLayering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html)].
- **FSD vs CA**: FSD combines business layers (app/pages/widgets/features/entities/shared) with slices and
  segments and a public API per slice; CA pays off when there is a rich shared domain model
  [sources: [Feature-Sliced Design](https://feature-sliced.design/),
  [DEV: FSD vs Clean Architecture](https://dev.to/skorphil/feature-sliced-design-vs-clean-architecture-3m5k),
  [codecentric: FSD](https://www.codecentric.de/en/knowledge-hub/blog/feature-sliced-design-and-good-frontend-architecture)].
  Bulletproof React: shared → features → app, cross-feature forbidden, composition in app, enforcement with
  import rules [source: [alan2207/bulletproof-react](https://github.com/alan2207/bulletproof-react)].
- **Next.js specific**: L. Nikolov's example (Sentry, 2024) maps entities, application (use cases +
  interfaces), infrastructure (repos/services), interface adapters (controllers/presenters) and frameworks
  (pages, route handlers, server actions, components), with an IoC container (`ioctopus`) and
  `eslint-plugin-boundaries` [source: [nikolovlazar/nextjs-clean-architecture](https://github.com/nikolovlazar/nextjs-clean-architecture)].
  That design targets apps with auth, DB and mutations; **its IoC container and repositories are ceremony
  for a reviewed-content site** (the repo already rejected a DI container and CRUD repos in
  `docs/research/clean-architecture.md` § "Alternatives rejected"; the decision is still correct).

---

## 3. Clean Architecture for this portfolio (specification)

### 3.1 Concept mapping

| CA concept | In this repo (target) | Examples |
| --- | --- | --- |
| **Entities** (enterprise rules) | `content/types.ts` + pure feature domain models | `Technology`, `Project`, `Experience`, `Metric` (with its mandatory qualifier), `SolarBody`, `ArchitectureGraph` |
| **Entity data** | `content/**` (reviewed data, immutable at build). It is not "infrastructure": it is the compiled domain *dataset* | `content/technologies.ts`, `content/{en,es}/*.ts` |
| **Use cases** (application rules) | Pure selection/projection functions: "featured projects for home", "filtered catalog", "case study by slug", "scene progress → composition" | `features/technology-catalogue/domain/query.ts`, `tool-carousel/domain/rows.ts`, `hero/domain/cloud-layout.ts`; assistant `application/assistant.ts` is the only use case with state and ports |
| **Ports** | TS interfaces owned by `application`: only where there is real I/O or time | assistant (`application/ports.ts`), analytics (transport), `Clock`, `SceneRenderer` (new, §3.3) |
| **Adapters** | HTTP/SSE transport, Three.js renderers, GSAP, `matchMedia`/`IntersectionObserver`/storage | `assistant/adapters/*`, `hero/adapters/*`, `solar-system/adapters/*` |
| **Presenters / view-models** | `toXViewModel(content, locale)` functions in `views/<page>/model.ts` (server-only) that prepare serializable props | New in B2 |
| **Delivery mechanism** | React (Server Components + client islands) and Next.js routing | `src/app`, `src/views`, `src/shell`, `presentation/` |
| **Composition root** | Server: each `app/**/page.tsx` + root layout (build flags). Client: one `entry.tsx` per feature with a runtime (assistant, analytics, scene host) | `src/app/layout.tsx`, `features/assistant/entry.tsx` |
| **Presentation infrastructure** | Design system: tokens, primitives, layout, motion. It is *frameworks & drivers* for the UI, not domain | New `src/design-system/**` (§5 B1) |

### 3.2 Where it adds value and where it is ceremony

| Apply with rigor (value) | Apply lightly | Do not apply (ceremony) |
| --- | --- | --- |
| Assistant: conversation state, SSE, reconnection, ports testable without network (already in place) | Catalog/carousel: a pure `domain/` is enough; no `application/` | Repositories over static `content/` (`getProjects()` wrapping an import) |
| Analytics: closed event policies, measurement budget, bounded transport (already in place) | Diagrams: layout/routing domain + presentation; no ports | DI container / Symbols / decorators |
| 3D scenes: separate the **scene model** (pure, testable: progress→composition, orbits, quality policy) from the **renderer** (adapter) and the **React host** (presentation) | Gallery: presentation only | Use-case classes for every page; "interactors" to read copy |
| Content contract (entities + validation + parity) | Views: presenters as functions, not classes | Empty layers "for symmetry" (the ADR already forbids it) |

Decision rule (for the ADR): **a feature earns a layer when it has at least one of: I/O, time,
state persisting across navigations, or a policy worth testing without a DOM**. Otherwise, `domain/` +
`presentation/` or just `presentation/`.

### 3.3 Layers by module type (target)

```
src/
  app/                    server composition root (thin routes, metadata, flags)       → views, shell, design-system, features(entries)
  views/<page>/           page composition: view.tsx + model.ts (presenter, server-only) + sections/*.tsx
                                                                                         → features(entries), design-system, content (via model.ts)
  shell/                  header/footer/theme/locale/page-transition (server + islands) → design-system, features(entries), config
  features/<f>/
    domain/               pure; no React, no DOM, no packages except allowlist (none)   → content/types, config
    application/          use cases + ports (only if there is I/O/time/state)           → domain
    adapters/             Three.js, GSAP, fetch/SSE, browser observers                  → application, domain, contracts
    presentation/         React (server by default; "use client" only here)            → application, domain, design-system
    entry.tsx             client composition root (if there is a runtime)               → everything in the feature
  design-system/
    tokens/               generated from tokens/*.tokens.json (DTCG) → tokens.css + tokens.ts
    primitives/           Button, Link-as-button, Card, Badge, Dialog, Input, Select, Skeleton, VisuallyHidden
    layout/               Section, Frame, Stack, Grid, Prose, Cluster (replace global classes)
    motion/               motion tokens, `useReducedMotion`, `reveal`, pause store (today shared/motion)
  shared/                 reusable capabilities with neutral content (identity, technology, contact, editorial, navigation)
content/  config/  contracts/  media/  tools/  tests/
```

Dependency: `app → views/shell → features(entry) → design-system → (nothing product-specific)`; `features/domain →
content/types`; **design-system does not import content/config/features** (already true today for `shared/ui|styles|motion`).

**Scenes** (the only place where CA pays off strongly besides the assistant):

- `features/scene-host/` (new, or `shared/scene` if a capability is preferred): `application/scene-policy.ts`
  (pure: mount?, quality tier, pause?) with a `SceneEnvironment` port {reducedMotion, saveData,
  deviceTier, visible, inViewport, routeAllowsScene} and a `SceneRenderer` port {mount, setProgress, setPaused,
  setTheme, dispose, onUnavailable}; `adapters/browser-environment.ts` (matchMedia, IO, visibility,
  `navigator.connection`); `presentation/scene-host.tsx` (canvas, fallback, data-attrs for tests).
- `hero` and `solar-system` expose **only** a `SceneRenderer` (adapter) + their `domain`.
- Tests: the policy is tested with `node:test` without a DOM (full environment matrix); the renderer is tested
  in the browser with a few deterministic captures; the host with a `FakeRenderer`.

### 3.4 Server vs client

- Server by default. `"use client"` allowed only in `features/*/presentation/**`, `features/*/entry.tsx`,
  interactive `design-system/primitives/**` (Dialog, Select) and `shell/islands/**`.
- Shell: `site-header.tsx` becomes server with islands (`MobileMenu`, `ThemeToggle`, `LocaleSwitcher`).
- `PageMotion` stops wrapping `main`; reveals move to CSS (`@starting-style`/`animation-timeline` where
  supported, with a no-animation fallback) or to a single observer mounted as an island without children.
- Server→client props: display fields only (already practiced in the carousel); RSC payload size test
  per route (§6).

### 3.5 Composition root and DI without a framework

- **DI = parameters**: `createX(deps)` factories and props. Existing correct example:
  `createSolarSystemEngine(surface, {…})`, `createQualityController({initialLevel, onChange})`.
- One composition root per runtime: `app/layout.tsx` decides flags and mounts hosts; each feature's `entry.tsx`
  builds concrete adapters and injects them into application. React Context only in those entries (never in domain).
- Time and environment are injected (`Clock`, `SceneEnvironment`); the guard already forbids ambient `Date.now()`/`performance`
  in domain/application: extend to `matchMedia`, `navigator`, `window`, `document` (already partial).
- Test fakes live in `tests/helpers/` and are built against the ports, never by mocking modules.

### 3.6 Testing per layer

| Layer | Tool | What it ensures | Gate |
| --- | --- | --- | --- |
| content | node:test | schema, EN/ES parity, references (IDs, images, routes), no forbidden claims | `test:content` |
| domain | node:test | pure policies (catalog, layout, scene, quality, events) | `test:domain` (new grouping) |
| application | node:test + port fakes | use cases with simulated I/O (assistant, analytics, scene-policy) | `test:assistant`, `test:analytics`, `test:scene` |
| adapters | node:test (SSE/HTTP) + browser (renderers) | parsing, timeouts, dispose, context loss | existing + `scene-dispose.spec.ts` |
| design-system | Playwright over `/_system` | variants × theme × locale: visual diff + axe + focus + target-size | `test:system` (new) |
| views/sections | `rendered.test.mjs` (HTML) + visual per section | landmarks, headings, links, `lang`, JSON-LD | existing + visual |
| E2E | Playwright | key journeys (home→work→case study→CV/contact), keyboard, mobile nav | subset of the current 40 specs |
| perf | budgets + LHCI + traces | bytes per route, Lighthouse median, long tasks in scene | `performance` job |

### 3.7 Guard extension (`tools/architecture-policy.mjs` / `tools/architecture.mjs`)

Each new rule with a failing fixture + a passing fixture in `tests/unit/architecture.test.mjs`
(current convention):

| ID | Rule | Reason |
| --- | --- | --- |
| G1 | **Package allowlist per layer**: `three` only in `features/{hero,solar-system}/adapters/**`; `gsap` only in `features/hero/adapters/**` (and forbidden after B3); `@xyflow/react` only in `architecture-diagrams/presentation/*-canvas.tsx`; `@radix-ui/*`, `class-variance-authority`, `tailwind-merge` only in `design-system/**`; `react-markdown`/`rehype-*`/`remark-*` only in `assistant/presentation/**`; `domain/**` no packages | Predictable bundles; P9 |
| G2 | **`views` placement**: `src/views/<page>/{view.tsx,model.ts,sections/*.tsx,*.module.css}`; `model.ts` must be `server-only`; sections do not import `content` directly (they receive props) | Explicit presenters; P6 |
| G3 | **`app` placement**: each `page.tsx` ≤ 15 lines, only imports from `views` (and `config`); each EN route has its ES twin (cross-checked with `config/routes.ts`) | Thin routes + i18n parity |
| G4 | **`"use client"` only in allowed locations** (§3.4) and a client-entry budget (reviewed maximum count) | Server-first; P7 |
| G5 | **Neutral design system**: `design-system/**` does not import `content`, `config`, `features`, `shell`, `views`, `app` | Reusable/portable |
| G6 | **CSS policy** (new `tools/css-policy.mjs`, same pattern as the guard, PostCSS parser already installed): in `*.module.css`, literal hex/`rgb()`/`hsl()`, literal `font-size`, literal `z-index`, literal durations/easings and media queries outside the breakpoint set are forbidden; allowed in `design-system/tokens` and in an exact list of exceptions (brand marks, shaders) | P1; avoid budget creep |
| G7 | **Extended environment purity**: domain/application without `window`, `document`, `navigator`, `matchMedia`, `localStorage`, `location` (today partially) | Scene testable without a DOM |
| G8 | **Cross-feature only via `entry`/public entries** (already) + forbid a feature from importing another's `presentation` except listed entries with a reason | Already exists; keep the list short |
| G9 | **Per-route budget** (not part of the guard, but in `test:budget`): initial JS per route from the build manifest | P10 |
| G10 | **No new JavaScript**: any `.js/.mjs/.cjs` outside the exact exception list fails (§6A.1) | Full TypeScript |

### 3.8 Migration order (strangler, behind the guard)

1. Add rules G1, G5, G7 in **report** mode (list of known violations frozen in a file
   `tools/architecture-baseline.json`; the guard fails only when a new violation appears). This way the refactor
   is incremental without `--no-verify` or open exemptions; each PR shrinks the baseline.
2. Design system (B1): generated tokens → primitives → layout → motion; migrate module by module and lower
   the G6 baseline.
3. Scene host (B3): extract `scene-policy` + ports; move solar out of the root layout to per-route hosts.
4. Views (B2): `views/<page>/` with `model.ts` and `sections/`; start with the case studies (maximum duplication).
5. Shell server + islands (B3/§3.4); `PageMotion` replaced.
6. Content schema (B4).
7. Flip G2–G4, G6 to **enforce** when the baseline reaches 0; delete `architecture-baseline.json`.

### 3.9 ADRs to write (in `docs/adr/`)

1. `clean-architecture-scope.md` — layer decision rule (§3.2), what is rejected (DI container, repos),
   CA ↔ folders mapping.
2. `design-system-as-presentation-infrastructure.md` — location, neutrality, DTCG tokens + own generator,
   why not Storybook.
3. `scene-host-contract.md` — per-route opt-in, tiers, pause, budgets, worker as a non-goal of B.
4. `motion-system.md` — CSS/WAAPI by default, GSAP confined, View Transitions as a future layer.
5. `quality-gates-experience.md` — visual diff, axe 2.2, LHCI, RUM, flake/quarantine policy.
6. `rendering-and-caching.md` — full prerender, no Cache Components/PPR until there is dynamic data; Webpack vs Turbopack.
7. `csp-roadmap.md` — Report-Only with a strict `script-src`, criterion for enforce.
8. `architecture-baseline-ratchet.md` — report/enforce mode of the guard and its expiry.

---

## 4. Engineering guardrails for Phase A (no refactor)

Phase A changes UX on the current code; so as not to "fly blind":

- A-E1: **Measurement baseline before touching UI**: local LHCI (5 runs, mobile) on `/`, `/work`,
  `/work/pequeverso`, `/about`, `/cv` and `/es`; Performance traces on `/` and `/cv` on a mid-range mobile to
  confirm/refute the double-WebGL hypothesis (P2). Save results in `docs/verification/`.
- A-E2: Add `wcag21a` and `wcag22aa` to the `AxeBuilder` in `routes.spec.ts` (a one-line change; fix
  whatever shows up as part of Phase A).
- A-E3: First `toHaveScreenshot` captures (forced static renderer, masked canvas) for 6 routes ×
  2 themes × desktop/mobile, baselines generated in the CI image; they serve as the safety net for the polish.
- A-E4: Rewrite the scene contrast test (P4) to **decouple it from the copy**: measure the contrast of
  the text tokens against the *worst* pixel of a fixed set of sample rectangles (or against the color of the
  veil/reading mask), with a deterministic scene (`solarTime=0`), instead of each real line of text.
- A-E5: Freeze the CSS budget at the current value (25 KiB) and forbid raising it without an ADR: the polish must
  consolidate, not add.

---

## 5. Phase B: refactor scope

Principle: **same UI, same semantic HTML, same URLs**, verified by visual diff (A-E3) on every PR.
Each workstream is a series of small PRs to `develop`, with its spec in `docs/specs/`.

### B1. Design system (tokens, primitives, layout, motion)

- `design/tokens/{color,space,type,radius,elevation,z,breakpoint,motion}.tokens.json` (DTCG) with modes
  `dark`/`light` → `tools/generate-tokens.mjs --write|--check` → `src/design-system/tokens/tokens.css`
  (custom properties in `@layer theme`, `:root` and `:root[data-theme="light"]`) + `tokens.ts` (for Three.js:
  `--field-near`, `--field-far`, etc., read from CSS today).
- Closed scales: **breakpoints** 4 (`sm 40rem`, `md 52rem`, `lg 64rem`, `xl 80rem`) exposed as
  Tailwind `@theme` + `@custom-variant`; **z-index** 6 layers (`base, raised, sticky, overlay, modal, toast`);
  **elevation** 3; **radius** 3 (already); **type** 7 (already, plus `label`); **motion** §2.5.
- Primitives (`design-system/primitives/`): move the 8 from `shared/ui` + `ButtonLink`/`CardLink` as
  components (not loose `buttonVariants()`), `Chip`/`Tag`, `IconButton` (target ≥ 24 px, ≥ 44 px on
  coarse pointers), `VisuallyHidden`, `Disclosure` (over `<details>`).
- Layout (`design-system/layout/`): `Section`, `Frame`, `Stack`, `Cluster`, `Grid`, `Prose` replace the global
  `section/frame/flow/prose/tags/actions`.
- `/_system` catalog (build flag `DESIGN_SYSTEM_ROUTE`, 404 in production like the assistant).
- Output: G5 and G6 in enforce for `design-system/**`; migrated modules without literals.

### B2. Page → sections composition

- `views/<page>/view.tsx` + `model.ts` (pure server-only presenter: `content + locale → props`) +
  `sections/*.tsx`. Reusable section components: `CaseStudyHero`, `MetricsBand`, `ArchitectureFigure`,
  `GalleryFlow`, `BeforeAfter`, `ChangesTable`, `CTASection`. Filomena and Pequeverso come to compose the
  same sections (adding a third case study = content + 1 view of ~40 lines).
- `app/**/page.tsx` remain 1 line per locale (G3), optionally generated by `tools/` with `--check`.
- `<html lang>`: evaluate with a spike of `app/[locale]` + `generateStaticParams` + typed root params (Next 16.3+)
  **without** reloading the page when switching language; if it is not possible without two root layouts, document the
  trade-off in an ADR and keep the current state.

### B3. 3D isolation and performance contract

`SceneHost` (§3.3) with a contract:

| Clause | Rule |
| --- | --- |
| Per-route opt-in | The ambient solar mounts only where the route declares it (`/stack`, explorer, and the background of `/` if the design asks for it); reading routes (`/cv`, `/education`, `/contact`) use a static CSS fallback |
| One active WebGL context | Never 2 contexts animating at once; the host suspends the one that leaves the viewport |
| Tiering | `tier0` (reduced-motion, `saveData`, `effectiveType` 2g/3g, no WebGL) → static; `tier1` (≤ 4 cores or `deviceMemory` ≤ 4) → reduced particles/resolution; `tier2` full. Pure, tested policy |
| Pause | `document.hidden`, outside the viewport (IO), assistant pause (already), and ≥ 30 s without interaction on mobile for the ambient |
| Loading | Never before LCP: `requestIdleCallback` after `load` + first input or 2 s; the canvas cannot be the LCP element |
| Budgets | Scene JS ≤ 250 KiB gzip (already); **per scene** hero ≤ 150 / solar ≤ 170 KiB; textures per tier; frame p95 ≤ 16.7 ms tier2 / ≤ 33 ms tier1 in a lab trace; no long task > 50 ms attributable to the render loop after startup |
| Dispose | After unmount `renderer.info.memory.{geometries,textures}` = 0 and context released (browser test) |
| Determinism | `sceneProgress`, `sceneTime`, `solarTime` remain as the documented test API |

Remove GSAP: carousel to CSS (`animation` + `animation-play-state`) and the hero's ScrollTrigger replaced by a `scroll-progress` adapter (§6A.2). Full scene quality plan in §6A.2.

### B4. Content layer

- `content/schema/*.ts`: entity types + lightweight validators (no new dependency; if one is accepted, Zod
  dev-only for tests). Rules: every `Metric` has a `qualifier`; every technology reference exists in
  `technologies.ts`; every image has dimensions; every route exists in `config/routes.ts`.
- EN/ES pairs per document with an identical shape verified in the type (`Record<Locale, T>` or `satisfies LocalizedDoc<T>`).
- Split `technologies.ts` (2,704 lines) by category, keeping IDs stable.

### B5. Clean Architecture across all of `src/` (§3) + guard (G1–G9) with baseline ratchet

### B6. Quality gates and flake policy

- Visual regression: `visual/` suite (system + sections + routes), baselines in the pinned CI image, a manual
  `update-snapshots` job that opens a PR with the images; `maxDiffPixelRatio` ≤ 0.001 for UI, explicit and
  documented tolerance for WebGL captures; `mask` for canvas in UI captures.
- axe: `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa` + `best-practice` on `/_system`; gate at
  `serious|critical` = 0; `moderate` reported.
- LHCI in the `performance` job: 5 runs, median, mobile (emulated Moto G Power, default throttling) and
  desktop, on the packaged build over loopback.
- Per-route budgets (initial JS, CSS, HTML, RSC payload) from the build manifests.
- Mutation testing (StrykerJS) and coverage per layer per §6A.5; Chromium/WebKit-iPhone/Firefox matrix with per-engine visual.
- Flake policy: `failOnFlakyTests` is kept; a flake opens an issue and may be moved to `@quarantine`
  (run only in nightly) with a 14-day expiry date and an owner; at most 3 in quarantine; replace
  the 10 `waitForTimeout` with conditional waits.

### B7. Observability (cookie-free RUM)

A closed `web-vital` event in the existing analytics feature (§2.7), default-off, same bounded transport
(no credentials, no storage, 5 s timeout), sampling configurable at build; dashboard in the API
backoffice (outside this repo, via contract handoff).

### B8. Documentation

ADRs §3.9; `docs/architecture.md` and `docs/design.md` updated to the new map; `docs/design-system.md` partially
generated from tokens (token table with `--check`).

B also includes: JS→TS migration (§6A.1), light-mode theme engineering (§6A.3) and CI/CD (§6A.4).

**Out of scope for B**: migration to Turbopack, OffscreenCanvas/worker, View Transitions, MDX, Storybook,
Sentry, nonce CSP, monorepo/npm package of the design system.

---

## 6. Phase C: target architecture

1. **Layers**: `app` (server composition root) → `views/<page>` (presenter + sections) / `shell` (server +
   islands) → `features/<f>` (layers as needed, public entries) → `design-system` (tokens, primitives,
   layout, motion) → `content` (entities + reviewed data) / `config`. Guard in enforce, empty baseline.
2. **Design system**: DTCG tokens as the single source (CSS + TS for scenes), `/_system` catalog with visual +
   axe, 0 style literals outside tokens/listed exceptions. Option C+: extract to a workspace package if
   Pequeverso consumes it (the parity ADR already shares vocabulary).
3. **3D**: a single `SceneHost` with the §B3 contract; an OffscreenCanvas worker spike for the solar if traces
   justify it; WebGPU remains unselected (consistent with `docs/research/motion-performance.md`).
4. **Motion**: tokens + patterns; `<ViewTransition>` for navigation when stable; reveals in CSS.
5. **Content**: typed TS with schema and parity; optional MDX for long case-study prose.
6. **Rendering**: full prerender; Cache Components only if dynamic data appears; Turbopack evaluated with
   budgets reimplemented on the manifest.
7. **Security**: CSP Report-Only with a strict `script-src` → enforce if the SRI/hashes spike covers the inline
   scripts; HSTS preload remains the domain owner's decision.
8. **Continuous quality**: §7 gates in `Required checks`; RUM p75 reviewed monthly; nightly with the full
   suite + quarantine.

---

## 6A. Additional owner requirements

### 6A.1 All code in TypeScript

State [measured]: the repo already runs `.ts` with **native Node 24 type stripping** (`node tools/documents.ts`,
`node --test tests/unit/assistant-*.test.ts`, `tools/assistant-budget-plugin.ts` imported from
`next.config.mjs`), with `allowImportingTsExtensions` in `tsconfig.json`. `tsx` is not needed at runtime.

JavaScript inventory (39 files, ~7,900 lines):

| Group | Files | Destination | Notes |
| --- | --- | --- | --- |
| Next config | `next.config.mjs` (69 l.) | `next.config.ts` | Supported by Next; keep `// @ts-check` until migrated |
| PostCSS config | `postcss.config.mjs` (5 l.) | **stays JS** | Next loads PostCSS with its own loader; 5 declarative lines; not worth the risk |
| Guard and policies | `tools/architecture{,-policy}.mjs`, `dependency-policy.mjs`, `workflow-policy.mjs`, `secret-scan.mjs`, `browser-ci-planner.mjs`, `nightly-candidate.mjs`, `ci-build-{artifact,provenance}.mjs` | `.ts` | Critical CI logic: typing + mutation testing pays off here |
| Generators | `tools/{export-cv,generate-identity,capture-gallery,technology-illustrations}.mjs` | `.ts` | — |
| Server/test helpers | `tools/{test-server,test-site,smoke-test,check-browser-runtime,check-assistant-contract}.mjs` | `.ts` | `check-browser-runtime` runs inside the Playwright container (container's Node: verify version ≥ 22.18 for stripping) |
| Webpack plugin | `tools/scene-budget-plugin.mjs` | `.ts` | The assistant's plugin is already `.ts` |
| Unit/integration tests | 17 `tests/unit/*.test.mjs`, 2 `tests/integration/*.test.mjs` | `.test.ts` | `node --test` picks them up the same |
| `hosting` job | — | — | Node **24.6** on Rocky 8: type stripping is enabled by default in Node 24; confirm it with the job's smoke before migrating the tools that job runs |

Rules: `erasableSyntaxOnly: true` and `verbatimModuleSyntax: true` in a `tsconfig.tools.json` (no `enum`,
`namespace`, parameter properties: stripping does not transform them); imports with the `.ts` extension; `tsc --noEmit`
of tools in `check:quality`. Guard rule G10: **no new `.js/.mjs/.cjs`** outside the exact list of
exceptions (`postcss.config.mjs`, third-party generated files). `tools/api-contract/` keeps its own
TypeScript 5.9.3 (required by `openapi-typescript`), as a documented exception.

### 6A.2 Signature scenes: hero sphere and solar system at their best

They are kept as identity elements. Findings [measured]: the hero uses GSAP **only** for
`ScrollTrigger.create({onUpdate: progress})` (`src/features/hero/adapters/scene-runtime.ts:245`), with no pin or
scrub; there are **two distinct quality controllers** (3 s windows in `scene-runtime.ts:256` and the
percentile-based controller in `solar-system/adapters/solar-system-quality.ts`); a different DPR cap per scene
(`field-engine.ts:220`: 1.75/1.4/1; solar: `min(dpr, 2, pixel budget)`); MSAA only if DPR < 1.5;
in light mode the scenes only "recede" (`solar-system-engine.ts:356–360`, `--field-additive: 0`).

Plan (B3, extending the `SceneHost` of §3.3):

| Topic | Action | Acceptance metric |
| --- | --- | --- |
| Frame budget | A shared `FrameScheduler` (a single rAF for both scenes, priority hero > solar), CPU budget per frame ≤ 4 ms main thread (tier2) measured with `performance.measure` in debug mode | Trace: p95 frame ≤ 16.7 ms on mid-range desktop, ≤ 33 ms on mid-range mobile; 0 long tasks > 50 ms after startup |
| Adaptive quality | Unify into a pure `QualityGovernor` (domain) with the solar's percentiles, hysteresis and retry lock (already tested) and a common output: `dpr`, `particleCount`, `msaa`, `textureTier`, `effectsLevel` | Domain test with synthetic frame sequences; mutation ≥ 90% |
| DPR | Ceiling per tier: tier2 `min(dpr, 2)`, tier1 1.5, mobile 1.25 with a pixel budget (≤ 2.1 MP on mobile); detection of stable 30 fps (iOS Low Power Mode, see 6A.5) → do not degrade resolution for "slow frames" when the cap comes from the system | Spec: with rAF sustained at 30 Hz the governor does not lower the level |
| Offscreen pause | Host IO + `document.hidden` + `pagehide`/bfcache + assistant pause (already) + 30 s mobile idle for the ambient; a real `renderer.setAnimationLoop(null)` (not just skipping) | Spec: 0 frames rendered with the host outside the viewport (debug counter) |
| Reduced motion | Do not mount WebGL (already); also offer a **rendered static frame** (WebP/AVIF poster per theme, generated with fixed `sceneProgress`/`solarTime` by `tools/capture-scene-posters.ts`) in place of the generic CSS fallback: same identity, 0 3D JS | Visual diff of the poster vs WebGL at frame 0 within tolerance |
| Low-end fallback | tier0 → poster; tier1 → particles −50%, no MSAA, 1K textures; detection: `saveData`, `effectiveType`, `deviceMemory ≤ 4`, `hardwareConcurrency ≤ 4`, software renderer (already detected in `solar-system-engine.ts:88`), `failIfMajorPerformanceCaveat` | Policy matrix in unit tests; tier0 does not download `three` |
| Loading | Three.js and textures off the critical path (already deferred); poster as `<img fetchpriority="low">` to avoid a flash; pre-warm shaders with `renderer.compileAsync` before the fade-in | LCP is never the canvas; no compile jank on the first visible frame |
| Visual quality | Hero: consistent tone mapping, depth fade, particles with stable physical-pixel size across DPR; Solar: cheap atmosphere and bloom in a custom shader (no `postprocessing` unless a spike shows ≤ 1 ms/frame on tier2) | Visual review with deterministic captures per theme |
| Remove GSAP | Replace ScrollTrigger with a `scroll-progress.ts` adapter (~60 lines: passive scroll + `ResizeObserver` + reading in the shared rAF); carousel to CSS `@keyframes` + `animation-play-state` | −1 dependency with a non-OSI license; −~30 KiB min from the scene closure (verify with the budget plugin) |
| Move math to domain | Extract orbits, cloud layout, progress easing and policies from the adapter (4,658 lines in `adapters/`) to `domain/` | Domain testable without a GPU and subject to mutation testing |
| Context loss | Keep recovery; add a limit of 1 active context (WebKit recycles the oldest context when the cap is reached) | Spec with `WEBGL_lose_context` in Chromium and WebKit |

**React Three Fiber/drei: no.** The code is already an imperative engine with its own shaders; R3F adds a
reconciler and a declarative model that the repo explicitly rejected (`docs/design.md`: "no React Three Fiber
or second animation engine"), and does not improve frame time. **Lenis: no.** The design is based on native scroll
(`docs/design.md`); synthetic smooth-scroll harms accessibility, keyboard use and iOS scrolling.

### 6A.3 Light mode at the level of dark (theme engineering)

Today dark is the identity and light is "attenuated dark": particles without additive blending, a scene that
recedes to leave contrast (`solar-system-engine.ts:358`), stars and nebula with one-off overrides
(`ambient-field.module.css:52`, `solar-system.module.css:164`).

1. **Tokens with modes** (B1): each semantic token has a `dark` and a `light` value in the DTCG JSON; the
   generator rejects a token without both modes. A full tonal scale for light (not an inversion): surfaces
   with 4 levels, borders 3, text 4, accent with `ink`/`wash`/`on-accent` variants; elevation in light via
   soft shadows (in dark via surface luminance).
2. **Contrast verified at build**: `tools/generate-tokens.ts --check` computes WCAG 2.x (and informational APCA)
   for each declared text/surface pair (`text-primary` over `surface-*`, `accent` over `surface-void`,
   etc.) in both themes: it fails if < 4.5:1 (text) or < 3:1 (UI/non-text, focus ring). This replaces most of
   the pixel sampling of the current contrast test.
3. **Per-theme scenes as first-class variants**: `SceneTheme` in domain (`palette`, `blending`,
   `particleSize`, `fog`, `skyGradient`, `readingVeil`) with two reviewed instances. Light: "ink" particles
   with normal blending and a slight dark shadow/halo, a paper sky with a cool gradient, orbits as a thin line,
   planets with higher lighting and a soft terminator; not merely lowering opacity. Scene colors are
   read from `tokens.ts` (not from `getComputedStyle`), so CSS and WebGL share a source.
4. **Contrast-safe overlays**: a design-system `ReadingVeil` (per-theme gradient/scrim behind
   text blocks over the scene), with its minimum opacity derived from the worst-case contrast of the scene's
   poster in that theme (computed at build over the 6A.2 posters), and `prefers-contrast: more` /
   `prefers-reduced-transparency` → opaque veil (the repo already has a media query of this type; generalize it).
5. **Theme switch without flash or re-mount**: `data-theme` pre-paint is kept; the scene interpolates
   `SceneTheme` in ~300 ms (or instantly with reduced motion) instead of rebuilding; `color-scheme` and
   `theme-color` meta per theme.
6. **Verifiable parity**: every visual capture and every axe/LHCI run is executed in both themes; the
   scorecard (§7.1) scores light and dark separately and takes the minimum.

### 6A.4 CI/CD

State [measured with `gh run list`, last 100 CI runs since 2026-10-17]: 85 success, 11 failure,
4 cancelled; duration p50 7.6 min, p90 8.4 min; Nightly 8/8 success. Current graph: `workflows`, `secrets`,
`quality` in parallel → `build` (once) and `hosting` → `browser` ×8 + `performance` → `Required checks`.
npm cache via `actions/setup-node` (`cache: npm`), Playwright image pinned by digest. It is a good starting
point; the improvements are incremental:

| Area | Proposal | Goal |
| --- | --- | --- |
| Graph | `build` stops waiting for `quality` (runs in parallel; the aggregate still requires both) → saves ~1 job of latency; `hosting` likewise | p50 ≤ 7 min despite new gates |
| Caching | Webpack `.next/cache` with `actions/cache` (key: lockfile + `next.config` + hash of `src/**`), Playwright cache not needed (image); Stryker incremental cache | build −30–50% [estimate to verify] |
| New jobs | `visual` (2 shards, same build, Noble image), `lighthouse` (5 runs × 7 routes × mobile/desktop over the build), `mutation-incremental` (only if `domain/`, `application/`, `tools/` change); all in parallel with `browser` | No job > 10 min |
| Sharding | Keep 8 shards balanced by `tools/browser-ci-timings.json`; add WebKit/Firefox mobile projects (6A.5) to the planner and rebalance; regenerate timings automatically in nightly (bot PR) | Max imbalance between shards ≤ 20% |
| Path filters | Docs-only PRs: run `workflows`, `secrets`, markdown lint and the aggregate with jobs marked as not required via an explicit condition (the aggregate already rejects skipped: introduce a "not-applicable" state audited by `workflow-policy`) | Docs PR ≤ 3 min |
| Flakes | `failOnFlakyTests` (already) + `@quarantine` tag with date/owner in an annotation, run only in nightly; `tools/flake-report.ts` reads the nightly Playwright JSON files and publishes a per-test rate; policy: flake → issue + fix or quarantine ≤ 14 days; max 3 | Flake rate (retries that passed) ≤ 0.5% of tests per week |
| Preview deploys | Hostinger managed Node deploys from `main` (`docs/deployment.md`); no per-PR preview support was identified. Options: (a) a second Hostinger app that follows `develop` as **staging** (`staging.` subdomain, `noindex`, `X-Robots-Tag`); (b) per-PR previews on the existing VPS/Coolify (`docs/specs/coolify-reverse-proxy.md`) — requires the VPS operations owner. Recommended: (a) in B, (b) evaluable in C | Staging URL verified after merge to `develop` |
| Release | Conventional Commits already in use → `release-please` (GitHub Action, pinned by digest; not an npm dependency) generates a `develop→main` release PR with changelog and tag; `docs/release-history.md` is updated from there | Reproducible release in 1 PR |
| Post-deploy | A scheduled/`workflow_dispatch` workflow that, after the Hostinger deploy, verifies served routes, headers, document hashes (tools already exist) and runs LHCI against production (3 runs) as a **monitor**, not a gate | Alert if prod degrades > 5 pts |
| Required checks | Keep `Required checks` as the only protected context; add `visual`, `lighthouse` (after 2 weeks in warn) and `mutation-incremental` as constituents | — |
| Duration budget | p50 ≤ 7 min, p90 ≤ 10 min PR; nightly ≤ 45 min (includes full mutation and full cross-browser) | Measured weekly by `tools/ci-duration-report.ts` |

### 6A.5 Complete testing strategy (with mobile/cross-browser)

| Level | Tool | Scope | Goal |
| --- | --- | --- | --- |
| Static | TS strict (app, assistant, tools), Biome, guard G1–G10, `css-policy`, optional `knip` for dead exports | Everything | 0 errors; 0 dead exports/files |
| Unit | `node:test` + native coverage (`--experimental-test-coverage` with `--test-coverage-lines/branches/functions`) — no new dependency | domain, application, content validators, tools/policies | Line/branch coverage: domain ≥ 95/90%, application ≥ 95/90%, CI tools ≥ 90/85%, content validators 100% of rules |
| Mutation | **StrykerJS** (`@stryker-mutator/core` + `tap-runner` over `node --test --test-reporter=tap` + `typescript-checker`) | `src/features/*/domain/**`, `src/features/*/application/**`, `content/schema/**`, `tools/{architecture,architecture-policy,dependency-policy,workflow-policy,browser-ci-planner,css-policy}.ts`. **Excluded**: presentation, GPU/network adapters (covered by browser/contract), CSS, `content/` data | Break: domain/application 85 → 90 → **95** (ratchet per quarter), tools 80 → 90; equivalents marked with `// Stryker disable next-line <mutator>: <reason>` and counted in the scorecard |
| Integration | `node:test` over a real build: per-route budgets, rendered HTML (landmarks, `lang`, JSON-LD), headers, server smoke | `.next` + loopback server | All routes × locales |
| Contract | `tools/check-assistant-contract` (already) + validation of SSE/REST fixtures against `contracts/assistant-api/*.schema.json` in both directions (frontend fixtures valid per schema; API examples consumable by the adapter) + the new `web-vital` event against its schema | assistant, analytics | 100% of schema messages covered by fixtures |
| Component/system | Playwright over `/_system` | primitives × variants × states (hover/focus/active/disabled) × theme × locale | visual + axe + target-size + visible focus |
| E2E | Playwright: journeys (home→work→case study→CV/contact; language and theme switch preserving position; full keyboard; mobile menu) | 7 key routes | See engine matrix below |
| Visual | `toHaveScreenshot` per engine, baselines generated in the CI image; WebGL with a deterministic scene and its own tolerance | system, sections, routes | 0 unapproved diffs |
| A11y | `@axe-core/playwright` with `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa` (+ `best-practice` in system); automated manual specs: focus order, skip link, `target-size`, 200%/400% zoom without overflow, reduced motion | All routes × themes × locales × viewports | 0 serious/critical; moderate ones with an issue |
| Performance lab | LHCI (`@lhci/cli`) + Playwright/CDP frame-time traces for scenes | 7 routes, mobile + desktop | §7 |
| Performance field | `web-vitals` (attribution build) → closed analytics event | Production with analytics enabled | p75 §7 |

**Cost of mutation testing [estimate]**: the mutable code is ~2,200 lines of domain/application + ~1,900
of tools → on the order of 2,000–4,000 mutants. The tap-runner runs one process per test file and measures
coverage per file (not per test) [source: [Stryker tap-runner](https://stryker-mutator.io/docs/stryker-js/tap-runner/)],
so a full run can take 20–45 min on 4 vCPU: **nightly full**, and on PRs `--incremental`
(incremental report cached with `actions/cache`) only on changed files, typically 2–6 min.
Alternative if time becomes a problem: migrate unit tests to Vitest and use `vitest-runner` (per-test
coverage, much faster) — cost: a second runner; decide with data from the first month.

**Browser matrix** (Playwright 1.64.1, extend `playwright.config.ts`):

| Project | Engine / device | Coverage |
| --- | --- | --- |
| `desktop-chromium` | Desktop Chrome 1440×1000 | Everything (current) |
| `android-chromium` | Pixel 7 (current) + Galaxy S-class 360×780 DPR 3 | Everything |
| `iphone-15-webkit` | `devices["iPhone 15"]` (393×852, DPR 3, touch, `isMobile`) | E2E, visual, a11y, scenes (behavior) |
| `iphone-se-webkit` | `devices["iPhone SE"]` (375×667, DPR 2) | Key E2E, visual, short-screen layout |
| `desktop-webkit` | Desktop Safari | Key E2E, visual, assistant/analytics (current) |
| `desktop-firefox` | Desktop Firefox | Key E2E, visual, assistant/analytics (current) |

Visual regression **per engine** (Playwright platform suffix), with separate baselines: Chromium and
WebKit always; Firefox only key routes to contain maintenance. PR: full Chromium + WebKit iPhone 15
on key journeys; nightly: full matrix.

**WebKit/iOS quirks to cover explicitly:**

| Quirk | Risk | Test/mitigation |
| --- | --- | --- |
| Low Power Mode limits rAF to ~30 fps (intentional) [sources: [WebKit bug 215745](https://bugs.webkit.org/show_bug.cgi?id=215745), [Motion: rAF throttling](https://motion.dev/magazine/when-browsers-throttle-requestanimationframe)]; CSS animations with `linear()` also drop to 30 fps [source: [WebKit bug 281429](https://bugs.webkit.org/show_bug.cgi?id=281429)] | The governor degrades quality unnecessarily; choppy motion | The governor detects a stable 30 Hz cap (unit test with frames at 33.3 ms); animations do not depend on `linear()` for long movements; time-based motion, not frame-based (already) |
| WebGL context limit: WebKit recycles the oldest context when the cap is reached (16 on macOS; reports of 8 on iOS) [sources: [WebKit commit](https://webkit.googlesource.com/WebKit/+/70e10861eb2fbd9d0862fd8702874c25ae5d8bfd), [WebKit bug 200031](https://bugs.webkit.org/show_bug.cgi?id=200031)]; context lost when returning from background on iOS [source: [three.js forum](https://discourse.threejs.org/t/context-lost-when-backgrounding-safari-on-ios-17-developer-beta-8/55772)] | Repeated navigations accumulate contexts | "1 active context" contract + verified dispose; a spec of 20 consecutive navigations without the "too many active WebGL contexts" warning |
| `100vh` vs `dvh/svh`, dynamic URL bar, `env(safe-area-inset-*)` | Clipped hero, CTAs under the bar/notch | Layout tokens use `svh/dvh`; `viewport-fit=cover` + safe-area padding; visual on iPhone 15 and SE |
| Expensive `backdrop-filter` (header veil, toggles) | Scroll jank on iPhone | Measure on a real device; fall back to a solid background with `prefers-reduced-transparency` and on tier1 |
| View Transitions: Safari 18 (same-document) / 18.2 (cross-document) [source: [Chrome for Developers](https://developer.chrome.com/docs/web-platform/view-transitions)] | Animation differences between engines | Feature-detect; the UI does not depend on the transition (C) |
| Playwright's WebKit on Linux renders WebGL in software and is not Safari.app [source: [Endform: WebKit support](https://endform.dev/docs/explanation/webkit-browser-support)] | False negatives/positives in 3D performance | In CI, WebKit tests **behavior** (fallbacks, pause, context loss, layout), never FPS; FPS only on a real device |

**Real devices (budget-conscious):** WSL does not allow Xcode/Simulator. Recommendation: (1) apply for
BrowserStack's **open source** plan (public MIT repo; an aggregator reports unlimited testing with 5
parallels, verify terms) [source: [AgentDeals: BrowserStack free tier](https://agentdeals.dev/vendor/browserstack)];
use it in a **nightly/manual** workflow with a subset (iPhone 15 and SE Safari, Pixel/Galaxy Chrome) that
runs the key journeys + a "scene health" spec (context created, mean fps ≥ 50 without Low Power Mode,
no context lost in 60 s) against **staging**; (2) a manual checklist per release on the owner's own iPhone
(Low Power Mode on/off, Safari + Chrome iOS, rotation, light/dark theme) with remote Web Inspector if a Mac
is available; (3) if the OSS plan does not apply, LambdaTest/Sauce Labs free tiers only for manual release
verification. Do not pay for a device cloud in B.

### 6A.6 Dependency plan (vetted)

Repo policy (kept): exact versions, lockfile, Dependabot with manual review
(`tools/dependency-policy.mjs` only auto-classifies patches of `@types/react*`), Actions/images by digest,
no canaries. npm registry data queried 2026-10-24 (`npm view`).

| Package | Purpose | Alternatives | Runtime cost | License | Health (version / last publish) | Security / policy | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `three` 0.186.1 | 3D rendering (already) | R3F/drei, Babylon, OGL | Deferred, within the 250 KiB scene budget | MIT | 0.186.1 / 2026-09 (monthly) | runtime dep, exact pin | **Keep** |
| `gsap` 3.15.0 | Hero ScrollTrigger + carousel (already) | own adapter, Motion, CSS scroll-driven | ~23 KB core + ~10 KB ScrollTrigger gz (vendor), no tree-shaking | "Standard no-charge" (non-OSI) | 3.15.0 / 2026-04 (slower cadence) | Proprietary license is a minor legal risk | **Remove in B3** (6A.2) |
| `motion` 14.6.0 | UI animations (layout/shared element) | CSS/WAAPI, GSAP | `LazyMotion`+`m` ≈ 4.6 KB initial (vendor) | MIT | 14.6.0 / 2026-10 | runtime | **Not in B**; only if C requires layout animations that CSS/View Transitions do not cover |
| `@react-three/fiber` 9.8.2 / `drei` 10.7.9 | Declarative 3D | Three.js directly | reconciler + helpers | MIT | active (2026-10/09) | — | **Rejected** (6A.2) |
| `lenis` 1.3.27 | Smooth scroll | native scroll | ~3 KB + scroll hijack | MIT | active (2026-10) | — | **Rejected** (a11y/iOS) |
| `@radix-ui/react-dialog` 1.3.1 (+ `slot`) | Accessible primitives (already) | Ark UI, React Aria | per component | MIT | 2026-10 | runtime | **Keep**; add Radix primitives only for a concrete need (e.g. `react-tooltip`, `react-toggle-group`) |
| `@axe-core/playwright` 4.14.0 | a11y in E2E (already) | Pa11y, Lighthouse a11y | dev | MPL-2.0 | 2026-10 | dev | **Keep**; extend tags |
| `@playwright/test` 1.64.1 | E2E/visual (already) | Cypress | dev | Apache-2.0 | 2026-10 (monthly) | image by digest | **Keep** |
| `@lhci/cli` 0.15.1 | Lighthouse CI (asserts, median) | `lighthouse` 13.5.0 directly with an own script; Unlighthouse; treosh action | dev, CI only | Apache-2.0 | **0.15.1 / 2025-06** (stalled; uses Lighthouse 12.6) | dev | **Adopt `lighthouse` 13.5.0 directly** with `tools/lighthouse-gate.ts` (5 runs, `computeMedianRun`, own asserts); LHCI only if its server is wanted |
| `web-vitals` 6.2.3 | CWV RUM | own PerformanceObserver | a few KB (attribution build +~0.6 KB brotli); measure with the budget plugin | Apache-2.0 | 2026-10 | runtime, only with `ANALYTICS_ENABLED` | **Adopt** (B7), loaded in the analytics chunk |
| `@stryker-mutator/core` + `tap-runner` + `typescript-checker` 10.1.1 | Mutation testing | — (alternative: vitest-runner) | dev, CI only | Apache-2.0 | 10.1.1 / 2026-10-23 | dev; review the transitive dependency tree in the audit | **Adopt** (B6) |
| `style-dictionary` 5.7.1 | DTCG tokens → CSS/TS | own generator | dev | Apache-2.0 | 2026-10-24 | dev | **Not in B** (own generator ~150 l., compatible DTCG format); adopt in C if there is a second consumer/Figma |
| `storybook` 10.6.3 / `@ladle/react` 5.1.1 | Component workshop | `/_system` route | heavy dev, second build | MIT | Storybook 2026-10; Ladle 2025-11 | dev | **Rejected**: `/_system` reuses the build, Playwright and axe |
| `tsx` 4.23.15 | Run TS | native Node 24 type stripping | dev | MIT | 2026-09 | dev | **Rejected**: not needed (6A.1) |
| `zod` 4.6.7 | Content schema validation | own TS validators, `satisfies` | dev-only if used in tests | MIT | 2026-10 | dev | **Optional**; prefer own validators while the schema is small |
| `stylelint` 17.16.0 | CSS lint | `tools/css-policy.ts` over PostCSS | dev | MIT | 2026-10 | dev | **Optional**: adopt if the own rules exceed ~200 lines; Biome covers part of the CSS |
| `knip` 6.43.0 | Dead exports/files/deps | own guard | dev | ISC | 2026-10-24 | dev | **Adopt** in `check:quality` (cheap, high value) |
| `@argos-ci/playwright` / `chromatic` / Percy | Visual review SaaS | local `toHaveScreenshot` | SaaS | MIT / proprietary | active | sends captures to a third party | **Not in B**; reconsider if reviewing diffs in artifacts turns out to be slow |
| `dependency-cruiser` 18.7.0 / `eslint-plugin-boundaries` 7.3.0 | Layer enforcement | own guard | dev | MIT | active | dev | **Rejected** (the own guard already covers more and the repo documented the incompatibility with TS 7) |

Net runtime result: **−1** (`gsap`) and **+1** only conditional (`web-vitals`, behind a flag). Dev: +3
Stryker packages, +`lighthouse`, +`knip`.

---

## 7. Measurable acceptance criteria

| Area | Criterion | How it is measured | Phase |
| --- | --- | --- | --- |
| Lighthouse | Perf ≥ 95 mobile and ≥ 98 desktop; A11y = 100; Best Practices ≥ 95; SEO = 100, on `/`, `/work`, `/work/pequeverso`, `/work/filomena`, `/about`, `/cv`, `/es` | LHCI median of 5 runs in the `performance` job | gate in B6, goal in C |
| CWV lab | LCP ≤ 2.0 s, TBT ≤ 150 ms, CLS ≤ 0.05 mobile on the same routes | LHCI | B6 |
| CWV field | p75 LCP ≤ 2.0 s, INP ≤ 150 ms, CLS ≤ 0.05 (Google "good" threshold: 2.5 s / 200 ms / 0.1) with ≥ 500 views/month per grouped route | RUM B7 | C |
| JS per route | Initial JS ≤ 90 KiB gzip on reading routes, ≤ 110 KiB on `/`; deferred scene hero ≤ 150, solar ≤ 170, total ≤ 250 KiB | `test:budget` per route | B3/B6 |
| CSS | ≤ 25 KiB gzip total and falling; 0 color/size/duration/z-index/breakpoint literals outside tokens/exceptions | `tools/css-policy.mjs` + budget | B1 |
| 3D | 0 WebGL contexts on `/cv`, `/education`, `/contact`; ≤ 1 context animating on any route; dispose to 0 resources; tier0 never downloads Three.js | SceneHost browser specs | B3 |
| A11y | 0 axe `serious`/`critical` violations with WCAG 2.2 AA on all routes × themes × locales × viewports and on `/_system`; target-size ≥ 24 px (≥ 44 px on coarse pointers for primary controls) | axe + target size spec | B6 |
| Visual | 0 unapproved diffs in the visual suite; baselines only regenerated by a CI job | Playwright `toHaveScreenshot` | A-E3 → B6 |
| Flakes | 0 flaky in `Required checks` for 30 days; ≤ 3 tests in quarantine, none > 14 days; 0 `waitForTimeout` in specs | Playwright JSON report + spec lint | B6 |
| Architecture | Guard in enforce without a baseline; 0 imports of `three`/`gsap`/`@xyflow`/Radix outside their allowlist; `"use client"` only in allowed locations; `app` pages ≤ 15 lines and EN/ES parity | `test:architecture` | B5 |
| Maintainability | No view > 150 lines; no `src/` file > 400 lines except listed exceptions (shaders, engine); new case study = content only + view ≤ 60 lines | metrics script in `test:repository` | B2 |
| CI | `Required checks` p50 duration ≤ current + 15% despite new gates (visual and LHCI in parallel with shards) | Actions timings | B6 |
| Docs | 8 ADRs of §3.9 accepted; `architecture.md`/`design.md` reflect the map; token table generated with `--check` | review + `--check` | B8 |

### 7.1 Quality scorecard (goal ≥ 95 on each axis)

Generated by `tools/scorecard.ts` in nightly (and on every release) from the CI artifacts; it publishes
`.artifacts/scorecard.json` + a summary in the job summary. Each axis is 0–100; the site "passes" only if **all**
axes ≥ 95 (no averages that hide a weak axis). Light and dark are measured separately and the minimum counts.

| Axis | Formula (automatic) | Source | Goal |
| --- | --- | --- | --- |
| Code quality | 100 − penalties: guard/baseline violations (−5 each), CSS literals outside tokens (−1 each), files > 400 l. not excepted (−2 each), knip dead exports (−1 each), TS/Biome errors (= 0 or the axis is 0) | `test:architecture`, `css-policy`, `knip`, metrics script | ≥ 95 |
| Test quality | 0.5 × mutation score (domain+application+tools) + 0.3 × branch coverage of those layers + 0.2 × (100 − 20 × tests in quarantine) | Stryker JSON, Node native coverage, quarantine report | ≥ 95 (mutation ≥ 95 in domain/application at the end of C) |
| Accessibility | 100 if 0 serious/critical in all combinations, −10 for each unique serious/critical violation, −1 per moderate; minimum with Lighthouse A11y | axe JSON, LHCI | ≥ 95 (and Lighthouse A11y = 100) |
| Performance | Minimum of: Lighthouse perf mobile median of the 7 routes; % of routes within JS/CSS/HTML budget × 100; and (when there is data) % of CWV p75 metrics on target × 100 | LHCI, budgets, RUM | ≥ 95 |
| UX (automatable proxy) | 100 − unapproved visual diffs (−10) − overflow/target-size/zoom failures (−5) − failed E2E journeys on any engine (−10) − motion regressions (scene not `running` where it should be, frame p95 outside the contract) (−5) | Playwright visual/E2E per engine | ≥ 95; the human rubric `RUBRIC.md` remains the UX authority |
| Docs | % of required ADRs accepted, `--check` of token table and generated docs up to date, 0 broken internal links (nightly already verifies links), each `docs/specs/*.md` with status and ACs | docs scripts | ≥ 95 |
| CI reliability | 100 × (successful non-flaky runs / runs with valid code) over 30 days, penalized −5 if p90 > 10 min | `gh run list` + Playwright reports | ≥ 95 (today 85% success in the last 100 runs; some are legitimate failures, the report must distinguish flake vs. real failure) |
| Security | Expected headers present in prod (monitor), 0 high advisories in `npm audit` of both lockfiles, clean secret scan, CSP report-only without new violations | post-deploy monitor, CI | ≥ 95 |

---

## 8. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| CSS refactor changes pixels unintentionally | Visual diff from A-E3 before B1; PRs per module; explicit tolerances |
| Flaky visual tests due to fonts/GPU | Baselines only in the pinned CI image; static renderer + `mask` for UI; separate, small WebGL suite |
| Noisy LHCI on shared runners | Median of 5, loopback, thresholds with margin; start in warn mode 2 weeks before gating |
| CA over-engineering | Decision rule §3.2 in an ADR; explicit rejection of DI container/repos; review per PR |
| Guard ratchet drags on forever | Baseline with an expiry date; each workstream lowers its part; enforce as an AC of B5 |
| Removing the solar from reading routes changes the visual identity | Design decision with A/B captures; CSS fallback (nebula/stars already exist in `ambient-field.module.css`) |
| `[locale]` routing breaks navigation without reload | Isolated spike; if it fails, the ADR keeps the current state |
| Analytics contract changes for RUM | Handoff with the API owner (`docs/engineering-standards.md`); default-off until approved |
| Experimental APIs (View Transitions, SRI, Cache Components) | Out of B by policy; review in C with updated sources |
| Concurrent worktrees (another agent edits copy) | One coordinator per repo; copy changes must not touch `design-system/` or the guard; the visual diff separates them |

---

## 9. Sources

Repo (at `origin/main` `b5b3c57`): `package.json`, `next.config.mjs`, `playwright.config.ts`, `tsconfig.json`,
`components.json`, `.github/workflows/{ci,nightly}.yml`, `docs/architecture.md`,
`docs/adr/site-architecture-parity.md`, `docs/engineering-standards.md`, `docs/code-quality.md`,
`docs/design.md`, `docs/research/{clean-architecture,motion-performance}.md`, `docs/specs/*`,
`tools/architecture.mjs`, `tools/architecture-policy.mjs`, `tools/browser-ci-planner.mjs`,
`tests/integration/budget.test.mjs`, `tests/browser/{routes,solar-system,lab}.spec.ts`,
`tests/browser/capture.ts`, `src/app/{layout.tsx,globals.css}`, `src/shell/page-motion.tsx`,
`src/features/solar-system/presentation/{ambient-field,solar-system}.tsx`,
`src/features/solar-system/adapters/solar-system-quality.ts`, `src/views/*`, `content/index.ts`.

External (consulted 2026-10-24):

1. [Next.js 16](https://nextjs.org/blog/next-16) · 2. [Next.js 16.1](https://nextjs.org/blog/next-16-1) ·
3. [Next.js 16.3 preview](https://nextjs.org/blog/next-16-3-preview) ·
4. [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) ·
5. [Lazy Loading](https://nextjs.org/docs/app/guides/lazy-loading) ·
6. [Package bundling / analyzer](https://nextjs.org/docs/app/guides/package-bundling) ·
7. [View Transitions guide](https://nextjs.org/docs/app/guides/view-transitions) ·
8. [`viewTransition` config](https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition) ·
9. [Next.js CSP](https://nextjs.org/docs/app/guides/content-security-policy) ·
10. [Report URI: Next.js CSP](https://docs.ams.report-uri.com/frameworks/next-js/) ·
11. [web.dev: CWV thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds) ·
12. [GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals) ·
13. [OneUptime: web vitals RUM (2026)](https://oneuptime.com/blog/post/2026-01-15-track-web-vitals-lcp-fid-cls-react/view) ·
14. [Lighthouse variability](https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md) ·
15. [Unlighthouse: LHCI budgets](https://unlighthouse.dev/learn-lighthouse/lighthouse-ci/budgets) ·
16. [treosh/lighthouse-ci-action](https://github.com/treosh/lighthouse-ci-action) ·
17. [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots) ·
18. [Playwright retries](https://playwright.dev/docs/test-retries) ·
19. [Hyperping: Playwright visual testing](https://hyperping.com/learn/playwright/playwright-screenshots-visual-testing) ·
20. [Nx: Playwright flaky tests](https://nx.dev/docs/technologies/test-tools/playwright/guides/flaky-tests) ·
21. [Deque: axe-core 4.5 and WCAG 2.2](https://www.deque.com/?p=33165) ·
22. [QASkills: axe-core + Playwright 2026](https://qaskills.sh/blog/axe-core-playwright-accessibility-testing-2026) ·
23. [three.js manual: cleanup](https://threejs.org/manual/en/cleanup.html) ·
24. [web.dev: OffscreenCanvas](https://web.dev/articles/offscreen-canvas) ·
25. [Evil Martians: Three.js + OffscreenCanvas](https://evilmartians.com/chronicles/faster-webgl-three-js-3d-graphics-with-offscreencanvas-and-web-workers) ·
26. [Motion: GSAP vs Motion](https://motion.dev/docs/gsap-vs-motion) ·
27. [Motion: reduce bundle size](https://www.framer.com/motion/guide-reduce-bundle-size/) ·
28. [Design Tokens Community Group](https://www.designtokens.org/) ·
29. [Style Dictionary](https://github.com/style-dictionary/style-dictionary) ·
30. [OpenReplay: design tokens](https://blog.openreplay.com/es/introduccion-design-tokens/) ·
31. [Ladle docs](https://ladle.dev/docs/) ·
32. [PkgPulse: Storybook vs Ladle vs Histoire 2026](https://www.pkgpulse.com/guides/storybook-8-vs-ladle-vs-histoire-2026) ·
33. [DEV: Storybook 10 vs Ladle](https://dev.to/saswatapal/storybook-10-why-i-chose-it-over-ladle-and-histoire-for-component-documentation-2omn) ·
34. [Velite](https://velite.js.org/guide/introduction) ·
35. [Wisp: Contentlayer alternatives](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives) ·
36. [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs) ·
37. [R. C. Martin: The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) ·
38. [A. Cockburn: Hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture/) ·
39. [H. Graça: Ports & Adapters](https://herbertograca.com/2017/09/14/ports-adapters-architecture/) ·
40. [K. Stemmler: Client-Side Architecture Basics](https://khalilstemmler.com/articles/client-side-architecture/introduction/) ·
41. [M. Fowler: PresentationDomainDataLayering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html) ·
42. [Feature-Sliced Design](https://feature-sliced.design/) ·
43. [DEV: FSD vs Clean Architecture](https://dev.to/skorphil/feature-sliced-design-vs-clean-architecture-3m5k) ·
44. [codecentric: FSD and good frontend architecture](https://www.codecentric.de/en/knowledge-hub/blog/feature-sliced-design-and-good-frontend-architecture) ·
45. [alan2207/bulletproof-react](https://github.com/alan2207/bulletproof-react) ·
46. [L. Nikolov: nextjs-clean-architecture](https://github.com/nikolovlazar/nextjs-clean-architecture) ·
47. [K. C. Dodds: Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) ·
48. [Stryker tap-runner](https://stryker-mutator.io/docs/stryker-js/tap-runner/) ·
49. [OneUptime: mutation testing with Stryker (2026)](https://oneuptime.com/blog/post/2026-01-25-mutation-testing-with-stryker/view) ·
50. [WebKit bug 215745: rAF at 30 fps in Low Power Mode](https://bugs.webkit.org/show_bug.cgi?id=215745) ·
51. [WebKit bug 281429: `linear()` at 30 fps](https://bugs.webkit.org/show_bug.cgi?id=281429) ·
52. [Motion: when browsers throttle rAF](https://motion.dev/magazine/when-browsers-throttle-requestanimationframe) ·
53. [WebKit: WebGL context recycling](https://webkit.googlesource.com/WebKit/+/70e10861eb2fbd9d0862fd8702874c25ae5d8bfd) ·
54. [WebKit bug 200031: context limit](https://bugs.webkit.org/show_bug.cgi?id=200031) ·
55. [three.js forum: context lost on iOS when backgrounding](https://discourse.threejs.org/t/context-lost-when-backgrounding-safari-on-ios-17-developer-beta-8/55772) ·
56. [Chrome for Developers: View Transitions (Safari support)](https://developer.chrome.com/docs/web-platform/view-transitions) ·
57. [Endform: WebKit on Linux](https://endform.dev/docs/explanation/webkit-browser-support) ·
58. [AgentDeals: BrowserStack free/open source](https://agentdeals.dev/vendor/browserstack) ·
59. npm registry (`npm view <pkg> version license time.modified`, 2026-10-24) for the §6A.6 table ·
60. `gh run list -R gonzalomartinperez/portfolio` (100 CI runs and 20 Nightly runs, 2026-10-17 → 2026-10-24)

Confidence notes: the Motion/GSAP bundle figures come from vendor sources; the "experimental" status of
View Transitions/SRI corresponds to the Next 16.x docs consulted and must be re-verified against 16.4 when
executing C; the exact coverage of `wcag22aa` in axe 4.14 must be verified by running the suite.
