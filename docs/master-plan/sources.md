# Sources

Part of the [master plan](README.md). "Commercial interest" flags vendor or product pages. Research notes were copied unchanged into [research/](research/); primary URLs behind them are in each note and in [ecosystem.md](ecosystem.md) section 20. URLs marked (author knowledge) were added by the planner from general knowledge and were **not fetched** during this planning session.

## Research notes (copied)

| Note | Used for | Date | Commercial |
|---|---|---|---|
| [01](research/01-nextjs-architecture.md) Next.js architecture | Layout, guards, tokens, Next releases | 2026-11-09 | no |
| [04](research/04-testing.md) Testing | Layers, Stryker, Playwright, flake policy | 2026-11-09 | mixed (tool vendors flagged in the note) |
| [05](research/05-cicd-supply-chain.md) CI/CD and supply chain | CI design, SLA, Dependabot, release | 2026-11-09 | mixed |
| [06](research/06-ui-ux-design.md) UI/UX | Tokens, motion, a11y, dark mode, budgets | 2026-11-09 | no |
| [07](research/07-cro-seo-analytics.md) CRO, SEO, analytics | Structured data, privacy, analytics | 2026-11-09 | mixed |
| [08](research/08-docs-readme-skills.md) Docs, README, skills | README, ADR, skills | 2026-11-09 | no |
| [10](research/10-standards-dependencies.md) Standards and dependencies | Style, dependency policy | 2026-11-09 | no |
| [11](research/11-containers-dynamic-ci.md) Containers and dynamic CI | LTS matrix, dynamic CI | 2026-11-09 | mixed |
| [13](research/13-sites-master-uiux.md) Master UI/UX for the sites | Motion system, Instrument blue, hero v2 | 2026-11-09 | no |
| [14](research/14-codex-harness.md), [15](research/15-claude-code-harness.md) | Harness | 2026-11-09 | vendor docs |

## External sources (primary where available)

| Source | URL | Used for | Commercial |
|---|---|---|---|
| WCAG 2.2 | https://www.w3.org/TR/WCAG22/ | AA criteria, target size, focus not obscured | no |
| WCAG 2.2.2 Pause, Stop, Hide (author knowledge) | https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html | Hero and solar pause control | no |
| Design Tokens Community Group | https://www.w3.org/community/design-tokens/ | DTCG token format | no |
| Next.js `output` | https://nextjs.org/docs/app/api-reference/config/next-config-js/output | Hosting and build mode | vendor docs |
| Tailwind theme | https://tailwindcss.com/docs/theme | `@theme inline` | vendor docs |
| StrykerJS incremental | https://stryker-mutator.io/docs/stryker-js/incremental/ | Mutation in PRs | no |
| Playwright CLI and snapshots | https://playwright.dev/docs/test-cli | Sharding, visual, flaky | vendor docs |
| GitHub Dependabot options | https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference | Multi-ecosystem groups | vendor docs |
| GitHub Actions secure use | https://docs.github.com/en/actions/reference/security/secure-use | Hardening | vendor docs |
| release-please | https://github.com/googleapis/release-please-action | Changelog and release | no |
| zizmor | https://docs.zizmor.sh | Workflow audit | no |
| OpenSSF Scorecard | https://securityscorecards.dev | Weekly scorecard | no |
| SLSA | https://slsa.dev/spec/v1.2 | Provenance claims | no |
| Google TypeScript style | https://google.github.io/styleguide/tsguide.html | Style baseline | no |
| Biome | https://biomejs.dev | Format and lint | no |
| TypeScript 7 | https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/ | Compiler | vendor blog |
| Node release schedule | https://raw.githubusercontent.com/nodejs/Release/main/schedule.json | LTS matrix | no |
| endoflife.date | https://endoflife.date | LTS matrix | no |
| MADR | https://adr.github.io/madr/ | ADRs | no |
| Diataxis | https://diataxis.fr | Docs system | no |
| Keep a Changelog | https://keepachangelog.com | Changelog | no |
| Agent Skills spec | https://agentskills.io/specification | Skills | no |
| Chrome Long Animation Frames | https://developer.chrome.com/docs/web-platform/long-animation-frames | LoAF gate | vendor docs |
| three.js WebGPURenderer manual | https://threejs.org/manual/pages/webgpurenderer.html | WebGPU deferred | no |
| Thoughtworks Radar on Lenis | https://www.thoughtworks.com/radar/languages-and-frameworks/lenis | No smooth-scroll library | vendor (consultancy) |
| `EXT_disjoint_timer_query_webgl2` (author knowledge) | https://developer.mozilla.org/en-US/docs/Web/API/EXT_disjoint_timer_query_webgl2 | GPU time in the GPU lane | no |
| `KHR_parallel_shader_compile` (author knowledge) | https://developer.mozilla.org/en-US/docs/Web/API/KHR_parallel_shader_compile | `compileAsync` | no |
| Awwwards evaluation (v1 archive) | https://www.awwwards.com/about-evaluation/ | Usability weight | commercial (award site) |
| Stephan Livera's Claude motion reel | https://x.com/stephanlivera/status/2103315922098470926 | Hero inspiration | not opened; traits from the owner's description |

## Repository and local sources

`origin/develop` `0a1ff56` (files read: `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `package.json`, `next.config.mjs`, `tsconfig.json`, `biome.json`, `playwright.config.ts`, workflows, `dependabot.yml`, `src/app/globals.css`, `src/app/fonts.ts`, hero, solar-system, shared motion and identity sources, `docs/deployment.md`, `docs/design.md`, `docs/specs/interactive-sphere.md`); v1 plan at `origin/main` `docs/master-plan/`; audit under [audit/](audit/); sibling plan `portfolio-backoffice` (token pack consistency); `shared/` standards (`ecosystem.md`, `rubrics.md`, `owner-decisions*.md`); `career-ops` repository layout (facts source `perfil/datos/hechos-cv.json`, `perfil/perfil-canonico.md`, `operacion/posicionamiento-v3-2026-10-24`), read for paths only; no CV content copied.
