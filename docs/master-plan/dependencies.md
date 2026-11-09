# Dependencies

Part of the [master plan](README.md). Policy (ecosystem 7): any new runtime dependency passes an ADR with need versus platform, health (Scorecard, deps.dev), license allow-list (MIT, Apache-2.0, BSD, ISC, 0BSD, BlueOak), bundle cost over 10 kB gzip justified, maintainer count and exit cost. **Health and version-currency columns are not verified in this plan**: PF-M1 adds a one-time `tools/dependency-review` report (deps.dev and Scorecard) and the ADR for each addition; "2026 health" below is the planner's expectation, labelled as such. Versions are the ones in `package.json` at `0a1ff56`.

## 1. Runtime (current)

| Package | Purpose | Cost | License | Decision |
|---|---|---|---|---|
| `next` 16.4.2 | App Router, prerender, headers | framework | MIT | Keep; pin to the supported line; subscribe to security releases |
| `react`, `react-dom` 19.3.1 | UI, `<ViewTransition>` | framework | MIT | Keep |
| `three` 0.186.1 (+ `@types/three`) | WebGL2 for hero and solar (shared lazy chunk) | largest lazy chunk (<= 500 KB gz shared; hero adds <= 60 KB) | MIT | Keep; WebGPU not adopted (PF-D16) |
| `gsap` 3.15.0 | `ScrollTrigger` progress in `scene-runtime.ts`, carousel tween in `tool-carousel-client.tsx` | tens of KB gz; vendor license, not OSI | custom (GreenSock) | **Remove** in PF-M3-1 (PF-D2): `ScrollProgress` and CSS carousel replace it |
| `@xyflow/react` 12.12.0 | Architecture diagrams (case studies only) | lazy chunk | MIT | Keep; loader stays lazy; accessibility fixes (PF-M3-9) |
| `@radix-ui/react-dialog` 1.3.1, `@radix-ui/react-slot` 1.5.0 | Accessible dialog and `asChild` | small | MIT | Keep; owned shadcn-derived primitives, no UI kit |
| `class-variance-authority` 0.7.1, `clsx` 2.1.1, `tailwind-merge` 3.7.0 | Variants, class composition | small | Apache-2.0 / MIT | Keep (owned CVA primitives, O4) |
| `lucide-react` 1.61.0 | Icons through a generated sprite | via sprite | ISC | Keep; sprite already enforced by `budget.test` |
| `react-markdown` 10.1.0, `remark-gfm` 4.0.1, `rehype-sanitize` 6.0.0 | Assistant message rendering | only in the assistant chunk (not emitted when disabled) | MIT | Keep; verify no code in the disabled build |

## 2. Dev (current)

| Package | Purpose | Decision |
|---|---|---|
| `typescript` 7.0.2 | Compiler (TS 7 as `tsc`) | Keep; TS 5 only inside `tools/api-contract` |
| `@biomejs/biome` 2.6.2 | Format and lint | Keep, exact pin |
| `tailwindcss` 4.3.3, `@tailwindcss/postcss` 4.3.3, `postcss` 8.5.31, `tw-animate-css` 1.4.0 | Styling | Keep; `tw-animate-css` reviewed against the motion tokens (remove if unused after M5) |
| `@playwright/test` 1.64.1, `@axe-core/playwright` 4.14.0 | E2E, visual, a11y | Keep |
| `@next/swc-wasm-nodejs` 16.4.2 | WASM SWC fallback on glibc 2.28 | Keep, exact match with Next (hosting contract) |
| `@babel/parser` 7.29.9, `yaml` 2.9.1 | Architecture guard parsing, workflow policy | Keep; revisit if the guard moves to the TS compiler API |
| `@types/node` 24.19.2, `@types/react` 19.3.0, `@types/react-dom` 19.3.0 | Types | Keep; Node major ignored while on 24 |

## 3. Proposed additions (dev unless stated)

| Package | Purpose | Alternatives | Cost | License | Decision |
|---|---|---|---|---|---|
| `vitest` 4 and `@vitest/coverage-v8` | Single runner for unit and component tests; Stryker runner | `node:test` (current), Jest | dev only | MIT | Adopt after spike PF-M2-1 (PF-D8) |
| `@stryker-mutator/core`, `vitest-runner`, `typescript-checker` | Mutation testing, incremental PR runs | tap-runner on `node:test` | dev only; nightly time | Apache-2.0 | Adopt (TS 7 checker needs a TS 6 alias until 7.1; verify in the spike) |
| `fast-check` | Property-based tests | hand-written fuzz | dev only | MIT | Adopt |
| `style-dictionary` 5 | DTCG tokens to `theme.css` | Terrazzo (fallback), own generator | dev only | Apache-2.0 | Adopt (PF-D11); ADR 0003 |
| `knip` | Dead files, exports, dependencies | ts-prune | dev only | ISC | Adopt |
| `lighthouse` 13.5.0 | Lighthouse gate | `@lhci/cli` (stalled on 12.6) | dev only; heavy | Apache-2.0 | Adopt (PF-D5) |
| `web-vitals` | Field CWV events | third-party RUM | about 2 KB gz, runtime | Apache-2.0 | Adopt at MV only (PF-D24); runtime ADR then |
| `cspell` (+ es dictionary) | Spelling EN/ES | LanguageTool only | dev only | MIT | Adopt |
| `markdownlint-cli2`, `lychee` (binary), `vale` (binary) | Docs CI | - | CI only | MIT / Apache-2.0 | Adopt via `engineering-standards` workflows |
| `diff-cover` (Python tool in CI) or Vitest diff reporter | Diff coverage | custom | CI only | BSD | Adopt, whichever the standards repo ships |
| `release-please` (GitHub Action) | Changelog and release PR | Changesets | CI only | Apache-2.0 | Adopt (E5 sandbox) |
| `zizmor`, `osv-scanner`, `gitleaks` (existing), CodeQL, `dependency-review-action`, Scorecard action | Security gates | - | CI only | various OSS | Adopt via shared workflows, SHA-pinned |

## 4. Rejected or deferred

| Item | Reason |
|---|---|
| React Three Fiber | Imperative engine with own shaders; R3F adds a reconciler for no gain here (v1 decision kept) |
| Lenis or any smooth-scroll library | Accessibility and iOS risk; native scroll (PF-D22) |
| Storybook | `/_system` behind a build flag reuses build, Playwright and axe |
| Motion (Framer Motion) | A second animation runtime; CSS, WAAPI and `<ViewTransition>` suffice |
| dependency-cruiser | Own guard covers more; does not fit TS 7 (PF-D28) |
| `tsx` | Node strips types natively |
| WebGPU renderer, Partytown, Speculation Rules | No measured upside; revisit in Phase C with data |
| A UI kit (shadcn CLI regeneration, Base UI) | Owned primitives (O4); `components.json` is a provenance record only |

## 5. Update flow

All updates arrive as the single weekly Dependabot PR ([ci-cd.md](ci-cd.md) section 6) with long cooldown (Hostinger ships `main` straight to production). The `update-dependencies` skill reads changelogs, fixes breakages on the same branch and keeps CI green; the owner merges. Urgent security fixes are a normal task-branch PR for one dependency, not a second Dependabot PR.
