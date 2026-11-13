# Testing

Part of the [master plan](README.md). Applies [ecosystem.md](ecosystem.md) section 11 (catalog 11.0, layers 11.1, runners 11.2, cadence 11.3) to a static, bilingual, scene-heavy public site on Hostinger. Pragmatism rule: a test type is kept only if it guards a real risk of this repo; the rest are marked not applicable with the reason.

## 1. Baseline

`node:test` unit and integration 344 tests (342 pass; 2 need git history), 38 Playwright specs (projects `desktop` Chrome 1440, `mobile` Pixel 7, Firefox and WebKit desktop for the assistant and analytics specs only), coverage lines 94.56 / branches 91.36 / functions 90.67 (mostly `tools/`), 12 budget tests, CI browser job in 8 shards with a hash-verified build artifact, `failOnFlakyTests` and `retries: 1` in CI, nightly visual (assertions, no per-route PR baselines), no mutation, no property-based tests, no Lighthouse or fluidity gate. Evidence: [audit.md](audit.md).

## 2. Layers and numeric targets (public site column of ecosystem 11.1)

| Layer | Target |
|---|---|
| Static | Biome 0 warnings, `tsc` 0 errors (TS 7 strict set), knip 0, guard 0 violations |
| Test mix (share of count) | 25% unit / 30% integration / 35% E2E / 10% non-functional |
| Branch coverage floor | whole repo >= 75% now; ratchet upward from the first measured run (current 91.36% is dominated by `tools/`; the floor is recomputed on `src/` + `content/` + `tools/` after Vitest) |
| Diff coverage on PR | >= 85% |
| Mutation (StrykerJS, Vitest runner, scoped) | PR incremental break 60 (parallel job, <= 8 min, PF-D30); weekly full target 75-80 (high 80, low 65) |
| Property-based (fast-check) | 100 runs on PR, 1,000 nightly |
| E2E | 10-20 tagged journeys; PR = Chromium + iPhone WebKit; nightly and release = Chromium, Firefox, WebKit, iPhone and Pixel |
| Visual | 6-10 pages x 2 viewports x each theme x locale samples; Playwright container, `maxDiffPixelRatio` 0.01, animations disabled, fonts ready, reduced-motion variant; hero figure snapshots 52 |
| Accessibility | axe `wcag22aa` on every route and key state, 0 serious/critical per theme and locale; keyboard journeys; manual NVDA/VoiceOver per release |
| Lighthouse (5 runs, median) | perf >= 0.90, a11y 1.0, BP >= 0.95, SEO >= 0.95, LCP <= 2.0 s (repo is stricter than 2.5 s), CLS <= 0.05, TBT <= 200 ms, initial JS <= 90/110 KiB gz (stricter than 170 KB); field p75 after MV |

## 3. Catalog mapping (every row of ecosystem 11.0)

| Family | Test types | Tool | Scope | Threshold | Cadence |
|---|---|---|---|---|---|
| Correctness | Unit | Vitest 4 (PF-D8), spike PF-M2-1 | `src/features/*/{domain,application}`, `shared/motion`, `shared/scene`, hero figures, `content/` validators, `tools/` policy modules | coverage floors above | PR, nightly, release |
| Correctness | Integration | Vitest plus the existing build-output tests (`budget.test.ts`, `rendered.test.ts`) | Built `.next` output: HTML size, scripts, textures per route, rendered routes, headers | 12 budget assertions retained and extended per route | PR (after build), nightly |
| Correctness | Component (all states) | Vitest Browser Mode is excluded from mutation; use Playwright component pages under `/_system` | Primitives and editorial components, five states, variant matrix | variant snapshot plus axe | PR on affected |
| Correctness | Architecture and boundary | `tools/architecture.ts` guard with negative fixtures, Biome `noImportCycles`, knip | whole `src/` | 0 violations (G1-G12) | PR, pre-commit |
| Test quality | Mutation | StrykerJS (Vitest runner) | domain, application, hero geometry and sequence, content validators, tools policy; never UI glue | see section 2 | PR incremental (changed files, parallel required job, 8 min cap, PF-D30), weekly full (90 min) |
| Test quality | Branch and diff coverage | Vitest coverage, `diff-cover` | as unit | 75% floor, 85% diff | PR |
| Test quality | Flake detection | Playwright `--repeat-each` on tagged specs, `failOnFlakyTests` on `main` and release | E2E | 0 flaky over 30 days, quarantine file cap min(2%, 5) | nightly |
| Input space | Property-based | fast-check | slug and URL normalisation, locale routing, catalogue query and filter, cloud layout, timeline continuity, easing monotone ends, figure samplers (finite, bounded, seed-stable), matching permutation validity | 100 PR / 1,000 nightly | PR, nightly |
| Input space | API fuzzing | not applicable | the site has no API of its own | - | - |
| Input space | Parser and validator fuzzing | fast-check on `content` schema and CV snapshot parser | content modules and `export-cv` parsing | no crash, no unsafe link | PR |
| Contracts | Schema and contract tests | Ajv/type checks against `contracts/assistant-api/` snapshot; generated-types compile; `git diff --exit-code` after `contract:generate` | assistant and analytics adapters | 0 drift; consumer compile in the `contract` profile | PR on `contracts/**`, nightly |
| Contracts | Breaking-change detection | oasdiff runs in the producer (API repo); consumer compile job here | snapshot | - | on refresh PR |
| Contracts | SSE conformance | Vitest with recorded SSE frames against `sse.schema.json` (client side: frames, heartbeat, reconnect, early EOF) | `features/assistant/adapters/sse.ts` | existing tests retained | PR |
| Contracts | Event schemas | JSON Schema validation of `product-interaction` and `product-event` examples; new `web-vital` only after handoff | analytics | closed event set | PR |
| End to end | User journeys | Playwright | theme toggle and persistence, locale switch keeps scroll and focus, hero journey into the catalogue, hero controls, solar explorer, filters, lightbox with filter, CV download, contact copy, 404 EN/ES, skip links | 10-20 tagged journeys | PR Chromium + iPhone WebKit; nightly all engines |
| End to end | Checkout hand-off, auth journeys | not applicable | no commerce or auth on this site | - | - |
| End to end | Cross-browser and monthly real-device check | Playwright (Chromium, Firefox, WebKit iPhone and Pixel profiles); owner iPhone checklist per release (PF-D9) | journeys | green | nightly; per release |
| Visual | Screenshot regression | Playwright `toHaveScreenshot`, pinned container | routes x theme x viewport (320/390/768/1280/1920) x EN and ES samples; component matrix; hero figures | 0.01 (hero 0.015) | PR on affected routes; full nightly and release |
| Visual | Per-figure hero snapshots with fixed seed and time | QA clock (`setTime`) | 11 layers x 2 themes x 2 viewports + 8 mid-morph | see [hero-particles.md](hero-particles.md) section 11 | nightly and on `scene` changes |
| Accessibility | axe WCAG 2.2 AA | `@axe-core/playwright` with `wcag22aa` | every route x theme x locale x 390/1280, plus open dialogs and menus | 0 serious/critical, moderate ratcheted to 0 | PR on affected, nightly full |
| Accessibility | Keyboard, focus, reduced motion, zoom | Playwright | primary CTA within 6 tab stops, no trap, focus not obscured, reduced-motion runtime change, 200% and 400% reflow, target size >= 24 px, forced-colors smoke | green | PR, nightly |
| Accessibility | Screen-reader checklist | manual NVDA and VoiceOver | new patterns (transitions, hero controls, diagram) | signed checklist | release |
| Performance | Lighthouse budgets | `tools/lighthouse-gate.ts` (13.5, median of 5) | home, `/work`, both case studies, `/about`, `/cv`, `/es`, `/stack` | section 2 | PR on `scene` or `design` changes (one route), nightly full, release |
| Performance | Bundle budgets | `test:budget` extended with `ratchets/bundle.json` | per-route JS, CSS, fonts, textures, hero chunk, page height | ratchet | PR |
| Performance | Fluidity: frame time, LoAF, INP | Playwright with CDP throttling and `PerformanceObserver` | hero journey, route transitions, five interactions; full and reduced-motion lanes | p95 <= 20 ms, p99 <= 33 ms, 0 LoAF > 100 ms, INP <= 150 ms | nightly; PR on `scene` changes |
| Performance | GPU lane, RUM | scheduled run on the owner's GPU machine; `web-vitals` after MV | frame time per tier | hero-particles.md 11.5 | weekly; MV |
| Performance | API latency, TTFT | not applicable | no API in this repo | - | - |
| Load and resilience | Load, stress, soak | not applicable | static site on managed hosting; no streams served here | - | - |
| Load and resilience | Dependency-failure tests | Playwright route interception | assistant API down or slow with the assistant enabled build (offline, 5xx, early EOF), WebGL unavailable, context loss, storage blocked | graceful degradation, no thrown errors in navigation | PR on affected |
| Security | SAST | CodeQL default setup (JS/TS, actions) | repo | 0 high | PR, weekly |
| Security | Secrets | gitleaks (existing) plus secret scan of the built output and forbidden-string check (G7) | history and artifacts | 0 | PR |
| Security | Dependency and licence review | `dependency-review-action`, osv-scanner daily, `npm audit` | both lockfiles | license allow-list; SLA of ecosystem 5.5 | PR, daily |
| Security | Container scan | not applicable (no image shipped; the Rocky 8 job is a build contract, not a product) | - | - | - |
| Security | DAST baseline | OWASP ZAP baseline against `next start` | public routes | 0 high | nightly |
| Security | Authz matrix, CSRF, sessions, RSC/DTO leaks | not applicable for authz and sessions (no auth); DTO leak check = G5/G7 | client bundles | 0 | PR |
| Security | Headers and CSP snapshots | Playwright `security-headers.spec.ts` | all responses: CSP directives, HSTS, nosniff, frame-ancestors, referrer, permissions, COOP | exact snapshot | PR |
| Security | Prompt-injection and red team | not applicable (assistant behaviour belongs to the API repo; this repo tests the disabled build and the contract) | - | - | - |
| AI quality | Golden set, graders, retrieval, judge | not applicable here (API repo); the site's `test:assistant*` suites cover the client | - | - | - |
| Data | Migrations, restore drills | not applicable (no database) | - | - | - |
| Build and runtime | Hosting contract | Rocky 8 (glibc 2.28) container job: WASM SWC fallback, build, smoke | whole build | green | PR on `hosting` group, nightly |
| Build and runtime | Post-deploy verification | `build-info.json` SHA check after a `main` deploy; read-only smoke | live site | SHA equals merge SHA | after M7 and each release |
| Build and runtime | Container structure, image smoke | not applicable | no image | - | - |
| Infrastructure | Host baseline, Ansible, compose | not applicable | Hostinger managed; `vps-ops` does not host this site | - | - |
| Content and SEO | Copy invariants and facts | Vitest | EN/ES key parity, no duplicated facts, **facts-to-site test** (every number, date, title, employer and metric in the copy derives from the `career-ops` facts snapshot, PF-D29), approved-proof fields (PF-D26) | 100% | PR, release |
| Content and SEO | Spanish spelling and locale | cspell (es-419 and en-US dictionaries), LanguageTool (advisory), Vale (EN) | `content/**`, docs | 0 errors | PR (docs and code) |
| Content and SEO | Structured data, metadata, sitemap, robots, canonical, hreflang | Vitest on rendered HTML plus Schema validator for `Person` JSON-LD | all routes | 0 errors | PR |
| Content and SEO | Link check | lychee | docs and rendered site | 0 broken | PR (docs), nightly, weekly |
| Time and concurrency | Clock-dependent logic | Playwright `page.clock`, fake timers | hero timeline boundaries, motion idle timers, exposure dwell | green | PR |
| Time and concurrency | Race and concurrency | Vitest | analytics exposure session, assistant state machine (existing), hero manual morph interrupt during autoplay | green | PR |
| Observability | Log redaction, metrics contract, request id | not applicable for logs; analytics default-off tests retained | - | - | - |
| Harness | Skill activation evals, docs checks, drift, CI profile coverage | `check-skills`, README heading check, `standards.lock` drift, `tests/unit/ci-profile.test.ts` | repo | no file outside every profile | PR (harness and docs profiles), weekly |
| Production synthetics | Uptime and journey probes | scheduled GitHub Actions Playwright smoke (read-only, 30 min) now; Uptime Kuma at MV | live site | 3 consecutive failures open an issue | continuous |

## 4. Runner and mutation decision (E7, PF-D8)

Spike PF-M2-1 (1-2 days): run StrykerJS with the Vitest runner and with `tap-runner` on `node:test`, and the Stryker TypeScript checker under TS 7 (needs a TS 6 alias until 7.1). Outcome per DR-09: one decision for all four TypeScript repos (Vitest 4 preferred if StrykerJS works with TS 7, otherwise `node:test` with the tap-runner); the Vitest-named rows in this catalog assume the preferred outcome and are renamed if the spike picks the fallback. Vitest Browser Mode is not used for mutation. The 18 `.test.mjs` files convert to TypeScript in M2 with the runner.

Mutation budget (PF-D30, flagged deviation): the ecosystem's 30 min PR figure cannot coexist with the code profile p95 of 10 min if it ran in series. On PRs `mutation-incremental` is a required job that runs in parallel with `build` and e2e, limited to changed mutable files and capped at 8 min wall-clock, so it never extends the p95. Files that exceed the cap are recorded as deferred and mutated in the nightly run; the weekly full run keeps its 90 min budget. The job is excluded from the p95 computation only if it ever exceeds 8 min (which fails it instead).

## 5. Flake policy

Per ecosystem 6.3: no blanket retries on unit tests; Playwright `retries: 1` on CI only and a pass on retry is recorded as flaky, not green; `failOnFlakyTests` on `main` and release (already on in CI); a flaky test is quarantined the same day in `tests/quarantine.json` (non-blocking nightly job) and fixed or deleted within 7 days; quarantine cap min(2%, 5); first-attempt failure rate on `develop` above 2% over 20 runs stops feature work; 0 `waitForTimeout` (spec lint).

## 6. Environment notes

Visual and hero baselines are valid only in the pinned Playwright container with software GL (`mcr.microsoft.com/playwright:v1.64.1-noble@sha256` as in `nightly.yml`); Playwright WebKit on Linux is not Safari and renders WebGL in software, so it checks behaviour, not frame time. The two unit tests that need git history run with `fetch-depth: 0` in CI and create a temp repository locally (PF-M3-14).
