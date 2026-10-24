# Master file index, move map and coding standards

> Status: planning research, not executed. Translated from the owner's Spanish working file `reports/portfolio-ux/master-index-and-standards.md` (kept outside this repository), dated as in the source. Part of the [master plan](../README.md).

> Planning-only. Source: `gonzalomartinperez/portfolio` at `origin/main` @ `b5b3c57` (merge of PR #192), surveyed on 2026-10-24.
> No repo or worktree was modified. Raw index: [file-index-current.csv](file-index-current.csv) (726 rows: path, area, purpose, layer_role, naming, lines, bytes, is_js, notes).
> Fits the master roadmap: **Phase A** (UX polish) does not move files; **Phase B** (Clean Architecture refactor) executes §2 and §3; **Phase C** (end state) = the layout, standards and docs of §2–§4 in force and enforced.
> Owner requirement incorporated: **TypeScript wherever possible, no mixed JS** (§1.3, §2.4, §3).

## 0. Executive summary

| Area | Files | Text lines | Main observation |
|---|---:|---:|---|
| `src/app` | 29 | 858 | 14 pairs of nearly identical EN/ES routes (9–13 lines each) |
| `src/views` | 23 | 3,513 | mixes views, SEO (`metadata.ts`, `profile-json-ld.tsx`) and one section (`hero-view.tsx`) |
| `src/shell` | 9 | 827 | coherent |
| `src/features/*` (8) | 85 | 12,813 | already feature-first with internal layers; redundant prefixes, `catalogue`, `*-state` stores |
| `src/shared/*` (8) | 26 | 1,043 | design system (`ui`, `styles`) mixed with composite components |
| `content` | 35 | 7,595 | data + types + rules mixed; two i18n patterns; `chrome` copy duplicated with drift |
| `config` | 4 | 130 | OK; missing `feature-flags` (parser duplicated in 2 features) |
| `contracts` | 9 | 5,019 | frozen, OK |
| `media` | 3 | — | OK |
| `public` | 222 | (12.2 MiB) | URL contracts; inconsistent brand slugs |
| `tools` | 27 | 4,407 | **19 `.mjs` + 5 `.ts`** flat, ungrouped |
| `tests/*` | 87 | 13,774 | **18 `.mjs` + 69 `.ts`**; helpers inside `tests/browser` |
| `docs/*` | 123 | 8,365 | 38 specs + 16 verifications + 8 research; no Diátaxis; 1 unnumbered ADR |
| `.github` | 6 | 915 | no CODEOWNERS, issue templates or `release.yml` |
| `.agents` / `.claude` | 14 | 393 | canonical + adapters, OK |
| root | 24 | 5,983 | no CHANGELOG / CODE_OF_CONDUCT; `next.config.mjs`, `postcss.config.mjs` |
| **Total** | **726** | | **39 JS files** (all `.mjs`; 0 `.js/.cjs/.jsx`) |

**Top naming/structure issues**

1. **Mixed JS**: 39 `.mjs` files (19 tools, 18 tests, `next.config.mjs`, `postcss.config.mjs`) coexist with `.ts` run through Node type stripping (`tools/documents.ts`, 23 `tests/unit/*.test.ts`). Migration is viable today (Node 24.22 dev / 24.6 hosting).
2. **`content/` mixes three things**: data (`technologies.ts`, 2,704 lines), types (`types.ts`, `about-copy.ts`, `site-copy.ts`) and rules (`getStackGroups`, `tech-marks.ts`, `experience-facts.ts`, `content/index.ts`).
3. **Two i18n patterns**: `content/en|es/*` folders vs. `Record<Locale, …>` in a single file (`chrome.ts`, `privacy.ts`, `tool-carousel-copy.ts`, `academic-catalogue.ts` with its own `AcademicLocale`).
4. **Duplication with drift**: `content/chrome.ts` and `SiteCopy.chrome` (`content/*/site.ts`) define the same keys; the ES text says "Ir al contenido" vs. "Saltar al contenido". The shell reads `chrome.ts`; the `site.ts` block looks dead (there is no `copy.chrome` in `src/`).
5. **Duplicated flag parser**: `isAssistantEnabled` / `isAnalyticsEnabled` are identical except for the message.
6. **Inconsistent naming**: `catalogue` (86 uses) vs. `catalog` (54) despite the US English rule; redundant prefixes (`solar-system/adapters/solar-system-*.ts`, `architecture-diagrams/domain/architecture-*.ts`); hooks/stores in `*-state.ts`; `about.module.css` ↔ `about-view.tsx`; `chat.module.css` in kebab-case (47 classes) vs. camelCase elsewhere (139) and a `cx()` string mapper that defeats type safety.
7. **Imports**: 13 modules use an explicit `.ts` extension and the rest do not; 8 deep relative imports (`../../../../config/…`, `../../../public/…`) coexist with `@config/*` aliases.
8. **Tests**: helpers (`capture.ts`, `document-visibility.ts`, `touch-sequence.ts`, `integration/native-api.ts`) live outside `tests/helpers`; prefixes (`analytics-*`, `assistant-*`) instead of folders; `lab.spec.ts` is not a test; `solar-system-scene.ts` (pure domain, 242 lines) has no unit test.
9. **Docs**: `development.md` (415 lines) mixes tutorial/how-to/reference; 13 variants of `Status:` in specs and 4 specs with no `Status`; 6 verifications without a paired spec; research with and without a date; a single ADR with no number; `CONTRIBUTING.md` links `README.md#rights` (nonexistent anchor; the section is "Software license").
10. **GitHub community**: CODEOWNERS, issue forms + `config.yml`, `release.yml`, CHANGELOG and (optionally) CODE_OF_CONDUCT are missing; private vulnerability reporting is disabled.

**Recommended standard (§3)**: baseline **Google TypeScript Style Guide**, enforced with **Biome** (not `gts`, which brings ESLint+Prettier as a second toolchain), complemented by the TypeScript Handbook *Do's and Don'ts*. Key deviations: **kebab-case** files (including components), `default export` only where Next.js requires it, `type` for data shapes and `interface` only for ports, explicit `.ts`/`.tsx` extensions in relative imports + Node **subpath imports** (`#domain/*`) instead of `paths`, `erasableSyntaxOnly`, the assistant's strictness promoted to the whole repo, TSDoc only on contracts.

**Proposed docs/community set (§4)**: redesigned README (≤ 200 lines), CONTRIBUTING (fix), SECURITY (+ private vulnerability reporting), CODE_OF_CONDUCT (Contributor Covenant 2.1, optional-recommended), CHANGELOG (Keep a Changelog + SemVer + GitHub release notes), `.github/ISSUE_TEMPLATE/*.yml` + `config.yml`, `CODEOWNERS`, `release.yml`, `docs/` by Diátaxis (`tutorials/ how-to/ reference/ explanation/`) + records (`specs/ verification/ decisions/`), numbered MADR 4 ADRs, C4 diagrams (L1–L3) in Mermaid.

---

## 1. Master index (current state)

### 1.1 Methodology

- `git ls-tree -r -l origin/main` (726 files) + `git archive origin/main` into a temporary snapshot (scratchpad) to count lines and grep; Python scripts in the scratchpad generate the CSV and tables.
- **Layer/role**: according to the current contract (`docs/architecture.md#source-module-contract`, `tools/architecture-policy.mjs`).
- **Naming**: detected on the file stem. Result: 690 kebab-case, 22 UPPERCASE by convention (README, SKILL.md…), 6 dotfiles, 7 "other" (dotted configs: `playwright.*.config.ts`, `tsconfig.assistant.json`), 1 snake_case (`pull_request_template.md`, a GitHub convention). **File naming is already almost 100% kebab-case**; the inconsistencies are in *which* name is used (prefixes, suffixes, spelling), not in the case.
- **"untested" notes**: heuristic based on a direct reference from `tests/`/`tools/`. Presentation is covered by Playwright (41 specs), so gaps are only flagged in domain/application/content.

### 1.2 Cross-cutting findings

| Topic | Evidence | Impact |
|---|---|---|
| Client boundaries | 26 `"use client"` modules, 6 `import "server-only"`; the AST guard verifies them transitively | Well handled; preserve in Phase B |
| Exports | `export function Xxx` in all views; 3 `default export` outside `app/` (lazy chunks: `assistant/entry.tsx`, `chat.tsx`, `experience-architecture-canvas.tsx`) | Explicit rule needed |
| Types | 73 `export type` vs. 2 `export interface` (ports); 0 `enum`/`namespace`/`any`; 1 `class` (`AssistantError`) | Already compatible with `erasableSyntaxOnly` |
| Suppressions | 8 `biome-ignore`, all with a justification | Good standard; keep "justification required" |
| Doc comments | `/** */` in 41 files; policy in `docs/code-quality.md` | Align to TSDoc syntax |
| Strictness | global `strict`; `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` only in `tsconfig.assistant.json`; `allowJs: true`; `target: ES2017` | Promote and close off JS |
| CSS Modules | 21 `.module.css`; camelCase dominant except `chat.module.css` and `experience-architecture.module.css` (6) | Rule + check |
| Hooks | `useChat` (`use-chat.ts`), `usePageMotionPaused` (`motion-state.ts`), `useSolarExplorer` (`solar-explorer-state.ts`) | `use-*.ts` for hooks, `*-store.ts` for external stores |

### 1.3 JS inventory (TS-everywhere requirement)

Node already runs TS in this repo (type stripping, enabled by default since Node 23.6 and present in 24.x): `node tools/documents.ts`, `node --test tests/unit/*-*.test.ts`. Constraints: erasable syntax only (no `enum`, `namespace`, parameter properties), explicit extensions in relative imports and **no** `tsconfig.paths` resolution (see [Node TypeScript](https://nodejs.org/api/typescript.html)).

| File(s) | Count | Target | Exception? |
|---|---:|---|---|
| `tools/*.mjs` | 19 | `tools/<group>/<name>.ts` (see §2.4) | No. They run on Node 24.22 (CI/dev). `smoke-test` also runs in the GLIBC 2.28 container with Node 24.6, which already supports type stripping → verify in the `hosting` job before merging. |
| `tests/unit/*.test.mjs` | 16 | `tests/unit/<context>/*.test.ts` | No. `node --test` already runs `.test.ts`. |
| `tests/integration/{budget,rendered}.test.mjs` | 2 | `.test.ts` | No. |
| `next.config.mjs` | 1 | `next.config.ts` | No. Next.js supports `next.config.ts` ([docs](https://nextjs.org/docs/app/api-reference/config/typescript#type-checking-nextconfigts)); today it already imports `./tools/assistant-budget-plugin.ts`. |
| `postcss.config.mjs` | 1 | — | **Yes, keep `.mjs`**. Verified in the installed Next: `next/dist/lib/find-config.js` only looks for `.postcssrc.json`, `postcss.config.json`, `.postcssrc.js`, `postcss.config.js/.mjs/.cjs` (also the [PostCSS guide](https://nextjs.org/docs/app/guides/post-css)). A `postcss.config.ts` would be ignored and Tailwind would stop compiling. 5 lines with no logic. Only exception registered in the guard; re-evaluate on each Next major. |
| `contracts/assistant-api/types.d.ts` | — | — | Already TS (generated). |
| `tools/api-contract/` | — | — | No JS; uses its own TS 5.9 for `openapi-typescript` (no change). |

Consumers to migrate together with the files: `package.json` scripts (28 `.mjs` references), `.github/workflows/*.yml` (27 `.mjs` mentions), `tools/architecture-policy.mjs` (registry), `docs/*` (links), `tools/technology-illustrations.mjs` → imports `../src/...ts`.

### 1.4 Index by area

> Tables generated from the CSV. Binaries are summarized by count; `public/` by pattern.

#### `src/app` — 29 files, 858 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/app/about/page.tsx` | EN /about route: metadata + view | composition root (Next routes) | kebab-case | 9 |  |
| `src/app/assistant/page.tsx` | EN /assistant route: metadata + view | composition root (Next routes) | kebab-case | 11 |  |
| `src/app/contact/page.tsx` | EN /contact route: metadata + view | composition root (Next routes) | kebab-case | 9 |  |
| `src/app/cv/page.tsx` | EN /cv route: metadata + view | composition root (Next routes) | kebab-case | 9 |  |
| `src/app/education/page.tsx` | EN /education route: metadata + view | composition root (Next routes) | kebab-case | 9 |  |
| `src/app/es/about/page.tsx` | ES /about route: metadata + view | composition root (Next routes) | kebab-case | 13 | EN/ES route duplication |
| `src/app/es/assistant/page.tsx` | ES /assistant route: metadata + view | composition root (Next routes) | kebab-case | 11 | EN/ES route duplication |
| `src/app/es/contact/page.tsx` | ES /contact route: metadata + view | composition root (Next routes) | kebab-case | 13 | EN/ES route duplication |
| `src/app/es/cv/page.tsx` | ES /cv route: metadata + view | composition root (Next routes) | kebab-case | 9 | EN/ES route duplication |
| `src/app/es/education/page.tsx` | ES /education route: metadata + view | composition root (Next routes) | kebab-case | 13 | EN/ES route duplication |
| `src/app/es/page.tsx` | ES home route | composition root (Next routes) | kebab-case | 9 |  |
| `src/app/es/stack/page.tsx` | ES /stack route: metadata + view | composition root (Next routes) | kebab-case | 13 | EN/ES route duplication |
| `src/app/es/work/filomena/page.tsx` | ES /work/filomena route: metadata + view | composition root (Next routes) | kebab-case | 13 | EN/ES route duplication |
| `src/app/es/work/page.tsx` | ES /work route: metadata + view | composition root (Next routes) | kebab-case | 13 | EN/ES route duplication |
| `src/app/es/work/pequeverso/page.tsx` | ES /work/pequeverso route: metadata + view | composition root (Next routes) | kebab-case | 13 | EN/ES route duplication |
| `src/app/fonts.ts` | next/font declarations | composition root (Next routes) | kebab-case | 26 |  |
| `src/app/globals.css` | Tailwind entry, design tokens, global resets | composition root (Next routes) | kebab-case | 516 |  |
| `src/app/layout.tsx` | Root layout: shell, theme pre-paint script, gated assistant/analytics hosts | composition root (Next routes) | kebab-case | 60 |  |
| `src/app/not-found.tsx` | 404 route delegating to NotFoundView | composition root (Next routes) | kebab-case | 15 |  |
| `src/app/page.tsx` | EN home route | composition root (Next routes) | kebab-case | 5 |  |
| `src/app/robots.ts` | robots.txt metadata route | composition root (Next routes) | kebab-case | 9 |  |
| `src/app/sitemap.ts` | sitemap.xml metadata route | composition root (Next routes) | kebab-case | 24 |  |
| `src/app/stack/page.tsx` | EN /stack route: metadata + view | composition root (Next routes) | kebab-case | 9 |  |
| `src/app/work/filomena/page.tsx` | EN /work/filomena route: metadata + view | composition root (Next routes) | kebab-case | 9 |  |
| `src/app/work/page.tsx` | EN /work route: metadata + view | composition root (Next routes) | kebab-case | 9 |  |
| `src/app/work/pequeverso/page.tsx` | EN /work/pequeverso route: metadata + view | composition root (Next routes) | kebab-case | 9 |  |

Binaries: 3 files (50 KiB), e.g. `apple-icon.png`, `favicon.ico`, `icon.png`.

#### `src/views` — 23 files, 3513 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/views/about-view.tsx` | Server page composition: about | presentation: page composition | kebab-case | 177 |  |
| `src/views/about.module.css` | CSS Module for about | presentation: page composition | kebab-case | 139 | name mismatch with about-view.tsx |
| `src/views/case-study.module.css` | Shared styles for Filomena/Pequeverso case studies | presentation: page composition | kebab-case | 161 | shared by two views; no owning component |
| `src/views/contact-view.tsx` | Server page composition: contact | presentation: page composition | kebab-case | 73 |  |
| `src/views/contact.module.css` | CSS Module for contact | presentation: page composition | kebab-case | 87 |  |
| `src/views/cv-view.tsx` | Server page composition: cv | presentation: page composition | kebab-case | 166 |  |
| `src/views/cv.module.css` | CSS Module for cv | presentation: page composition | kebab-case | 65 |  |
| `src/views/education-view.tsx` | Server page composition: education | presentation: page composition | kebab-case | 361 |  |
| `src/views/education.module.css` | CSS Module for education | presentation: page composition | kebab-case | 313 |  |
| `src/views/filomena-view.tsx` | Server page composition: filomena | presentation: page composition | kebab-case | 238 |  |
| `src/views/hero-view.tsx` | Home hero section (used only by home-view) | presentation: page composition | kebab-case | 79 | section, not a page view; name collides with features/hero |
| `src/views/hero.module.css` | CSS Module for hero | presentation: page composition | kebab-case | 145 |  |
| `src/views/home-view.tsx` | Server page composition: home | presentation: page composition | kebab-case | 293 |  |
| `src/views/home.module.css` | CSS Module for home | presentation: page composition | kebab-case | 249 |  |
| `src/views/metadata.ts` | Per-route Metadata builder (title, OG, canonical, hreflang) | presentation: page composition | kebab-case | 120 | SEO adapter living in views |
| `src/views/not-found-view.tsx` | Server page composition: not-found | presentation: page composition | kebab-case | 86 |  |
| `src/views/not-found.module.css` | CSS Module for not-found | presentation: page composition | kebab-case | 97 |  |
| `src/views/pequeverso-view.tsx` | Server page composition: pequeverso | presentation: page composition | kebab-case | 161 |  |
| `src/views/profile-json-ld.tsx` | Person JSON-LD script | presentation: page composition | kebab-case | 39 |  |
| `src/views/stack-view.tsx` | Server page composition: stack | presentation: page composition | kebab-case | 78 |  |
| `src/views/stack.module.css` | CSS Module for stack | presentation: page composition | kebab-case | 14 |  |
| `src/views/work-view.tsx` | Server page composition: work | presentation: page composition | kebab-case | 215 |  |
| `src/views/work.module.css` | CSS Module for work | presentation: page composition | kebab-case | 157 |  |

#### `src/shell` — 9 files, 827 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/shell/locale-switcher.module.css` | CSS Module for locale-switcher | presentation: persistent shell | kebab-case | 46 |  |
| `src/shell/locale-switcher.tsx` | EN/ES switch preserving path/position | presentation: persistent shell | kebab-case | 50 |  |
| `src/shell/page-motion.tsx` | Route transition/motion wrapper | presentation: persistent shell | kebab-case | 58 |  |
| `src/shell/site-footer.module.css` | CSS Module for site-footer | presentation: persistent shell | kebab-case | 124 |  |
| `src/shell/site-footer.tsx` | Persistent footer + footer nav | presentation: persistent shell | kebab-case | 151 |  |
| `src/shell/site-header.module.css` | CSS Module for site-header | presentation: persistent shell | kebab-case | 171 |  |
| `src/shell/site-header.tsx` | Persistent header + main nav | presentation: persistent shell | kebab-case | 98 |  |
| `src/shell/theme-toggle.module.css` | CSS Module for theme-toggle | presentation: persistent shell | kebab-case | 34 |  |
| `src/shell/theme-toggle.tsx` | Light/dark toggle with localStorage | presentation: persistent shell | kebab-case | 95 |  |

#### `src/features/analytics` — 15 files, 849 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/features/analytics/adapters/exposure.ts` | analytics: exposure | feature analytics: adapters | kebab-case | 192 |  |
| `src/features/analytics/adapters/http.ts` | analytics: http | feature analytics: adapters | kebab-case | 81 |  |
| `src/features/analytics/adapters/interactions.ts` | analytics: interactions | feature analytics: adapters | kebab-case | 46 |  |
| `src/features/analytics/adapters/public-clicks.ts` | analytics: public clicks | feature analytics: adapters | kebab-case | 46 |  |
| `src/features/analytics/adapters/public-regions.ts` | analytics: public regions | feature analytics: adapters | kebab-case | 65 |  |
| `src/features/analytics/application/availability.ts` | analytics: availability | feature analytics: application | kebab-case | 6 | duplicates assistant availability flag parser |
| `src/features/analytics/application/exposure-dwell.ts` | analytics: exposure dwell | feature analytics: application | kebab-case | 50 |  |
| `src/features/analytics/application/exposure-session.ts` | analytics: exposure session | feature analytics: application | kebab-case | 49 |  |
| `src/features/analytics/application/measurement-budget.ts` | analytics: measurement budget | feature analytics: application | kebab-case | 21 |  |
| `src/features/analytics/application/page-visits.ts` | analytics: page visits | feature analytics: application | kebab-case | 17 |  |
| `src/features/analytics/config.ts` | analytics: config | feature facade/entry | kebab-case | 3 |  |
| `src/features/analytics/domain/click-grid.ts` | analytics: click grid | feature analytics: domain | kebab-case | 23 |  |
| `src/features/analytics/domain/events.ts` | analytics: events | feature analytics: domain | kebab-case | 86 |  |
| `src/features/analytics/domain/interactions.ts` | analytics: interactions | feature analytics: domain | kebab-case | 94 |  |
| `src/features/analytics/entry.tsx` | analytics: entry | feature facade/entry | kebab-case | 70 |  |

#### `src/features/architecture-diagrams` — 8 files, 1457 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/features/architecture-diagrams/domain/architecture-edge-routing.ts` | architecture-diagrams: architecture edge routing | feature architecture-diagrams: domain | kebab-case | 159 |  |
| `src/features/architecture-diagrams/domain/architecture-types.ts` | architecture-diagrams: architecture types | feature architecture-diagrams: domain | kebab-case | 25 |  |
| `src/features/architecture-diagrams/domain/enterprise-architecture-layout.ts` | architecture-diagrams: enterprise architecture layout | feature architecture-diagrams: domain | kebab-case | 378 |  |
| `src/features/architecture-diagrams/domain/filomena-architecture-layout.ts` | architecture-diagrams: filomena architecture layout | feature architecture-diagrams: domain | kebab-case | 75 |  |
| `src/features/architecture-diagrams/presentation/architecture-canvas-loader.tsx` | architecture-diagrams: architecture canvas loader | feature architecture-diagrams: presentation | kebab-case | 21 |  |
| `src/features/architecture-diagrams/presentation/experience-architecture-canvas.tsx` | architecture-diagrams: experience architecture canvas | feature architecture-diagrams: presentation | kebab-case | 403 | default export (lazy chunk) |
| `src/features/architecture-diagrams/presentation/experience-architecture.module.css` | CSS Module for experience-architecture | feature architecture-diagrams: presentation | kebab-case | 317 |  |
| `src/features/architecture-diagrams/presentation/experience-architecture.tsx` | architecture-diagrams: experience architecture | feature architecture-diagrams: presentation | kebab-case | 79 |  |

#### `src/features/assistant` — 23 files, 3262 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/features/assistant/adapters/api.ts` | assistant: api | feature assistant: adapters | kebab-case | 190 |  |
| `src/features/assistant/adapters/sse.ts` | assistant: sse | feature assistant: adapters | kebab-case | 148 |  |
| `src/features/assistant/adapters/suggestions.ts` | assistant: suggestions | feature assistant: adapters | kebab-case | 49 |  |
| `src/features/assistant/adapters/validate.ts` | assistant: validate | feature assistant: adapters | kebab-case | 101 |  |
| `src/features/assistant/application/assistant.ts` | assistant: assistant | feature assistant: application | kebab-case | 366 |  |
| `src/features/assistant/application/availability.ts` | assistant: availability | feature assistant: application | kebab-case | 5 | duplicates analytics availability flag parser |
| `src/features/assistant/application/ports.ts` | assistant: ports | feature assistant: application | kebab-case | 32 | AssistantError class lives with ports; belongs in domain |
| `src/features/assistant/domain/models.ts` | assistant: models | feature assistant: domain | kebab-case | 133 |  |
| `src/features/assistant/domain/visitor-context.ts` | assistant: visitor context | feature assistant: domain | kebab-case | 30 |  |
| `src/features/assistant/entry.tsx` | assistant: entry | feature facade/entry | kebab-case | 31 | default export outside Next file convention (lazy chunk) |
| `src/features/assistant/presentation/assistant-host.module.css` | CSS Module for assistant-host | feature assistant: presentation | kebab-case | 224 |  |
| `src/features/assistant/presentation/assistant-host.tsx` | assistant: assistant host | feature assistant: presentation | kebab-case | 258 |  |
| `src/features/assistant/presentation/assistant-loading.tsx` | assistant: assistant loading | feature assistant: presentation | kebab-case | 17 |  |
| `src/features/assistant/presentation/chat-message.tsx` | assistant: chat message | feature assistant: presentation | kebab-case | 112 |  |
| `src/features/assistant/presentation/chat.module.css` | CSS Module for chat | feature assistant: presentation | kebab-case | 606 | kebab-case classes (repo uses camelCase elsewhere) |
| `src/features/assistant/presentation/chat.tsx` | assistant: chat | feature assistant: presentation | kebab-case | 533 | default export (lazy chunk) |
| `src/features/assistant/presentation/copy-answer.tsx` | assistant: copy answer | feature assistant: presentation | kebab-case | 55 |  |
| `src/features/assistant/presentation/copy.ts` | assistant: copy | feature assistant: presentation | kebab-case | 165 | localized copy inside presentation, outside content/ |
| `src/features/assistant/presentation/identity-avatar.module.css` | CSS Module for identity-avatar | feature assistant: presentation | kebab-case | 64 |  |
| `src/features/assistant/presentation/identity-avatar.tsx` | assistant: identity avatar | feature assistant: presentation | kebab-case | 71 |  |
| `src/features/assistant/presentation/presentation.ts` | assistant: presentation | feature assistant: presentation | kebab-case | 9 |  |
| `src/features/assistant/presentation/styles.ts` | assistant: styles | feature assistant: presentation | kebab-case | 7 | cx() maps kebab strings to CSS module keys, silently falls back to global names |
| `src/features/assistant/presentation/use-chat.ts` | assistant: use chat | feature assistant: presentation | kebab-case | 56 |  |

#### `src/features/hero` — 11 files, 1910 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/features/hero/adapters/field-engine.ts` | hero: field engine | feature hero: adapters | kebab-case | 307 |  |
| `src/features/hero/adapters/scene-runtime.ts` | hero: scene runtime | feature hero: adapters | kebab-case | 633 |  |
| `src/features/hero/domain/cloud-layout.ts` | hero: cloud layout | feature hero: domain | kebab-case | 143 |  |
| `src/features/hero/domain/constellation.ts` | hero: constellation | feature hero: domain | kebab-case | 121 |  |
| `src/features/hero/domain/scene-technologies.ts` | hero: scene technologies | feature hero: domain | kebab-case | 50 |  |
| `src/features/hero/presentation/hero-stage.module.css` | CSS Module for hero-stage | feature hero: presentation | kebab-case | 287 |  |
| `src/features/hero/presentation/hero-stage.tsx` | hero: hero stage | feature hero: presentation | kebab-case | 148 |  |
| `src/features/hero/presentation/static-constellation.module.css` | CSS Module for static-constellation | feature hero: presentation | kebab-case | 4 |  |
| `src/features/hero/presentation/static-constellation.tsx` | hero: static constellation | feature hero: presentation | kebab-case | 35 |  |
| `src/features/hero/presentation/tech-constellation.module.css` | CSS Module for tech-constellation | feature hero: presentation | kebab-case | 95 |  |
| `src/features/hero/presentation/tech-constellation.tsx` | hero: tech constellation | feature hero: presentation | kebab-case | 87 |  |

#### `src/features/project-gallery` — 2 files, 357 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/features/project-gallery/presentation/gallery-carousel.module.css` | CSS Module for gallery-carousel | feature project-gallery: presentation | kebab-case | 116 |  |
| `src/features/project-gallery/presentation/gallery-carousel.tsx` | project-gallery: gallery carousel | feature project-gallery: presentation | kebab-case | 241 |  |

#### `src/features/solar-system` — 19 files, 4189 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/features/solar-system/adapters/solar-system-bodies.ts` | solar-system: solar system bodies | feature solar-system: adapters | kebab-case | 534 |  |
| `src/features/solar-system/adapters/solar-system-engine.ts` | solar-system: solar system engine | feature solar-system: adapters | kebab-case | 620 |  |
| `src/features/solar-system/adapters/solar-system-quality.ts` | solar-system: solar system quality | feature solar-system: adapters | kebab-case | 113 |  |
| `src/features/solar-system/adapters/solar-system-reading.ts` | solar-system: solar system reading | feature solar-system: adapters | kebab-case | 274 |  |
| `src/features/solar-system/adapters/solar-system-resources.ts` | solar-system: solar system resources | feature solar-system: adapters | kebab-case | 113 |  |
| `src/features/solar-system/adapters/solar-system-shaders.ts` | solar-system: solar system shaders | feature solar-system: adapters | kebab-case | 520 |  |
| `src/features/solar-system/adapters/solar-system-sky.ts` | solar-system: solar system sky | feature solar-system: adapters | kebab-case | 359 |  |
| `src/features/solar-system/adapters/solar-system-textures.ts` | solar-system: solar system textures | feature solar-system: adapters | kebab-case | 252 |  |
| `src/features/solar-system/adapters/texture-versions.ts` | solar-system: texture versions | feature solar-system: adapters | kebab-case | 15 | deep relative imports into config/ and public/ |
| `src/features/solar-system/domain/solar-system-scene.ts` | solar-system: solar system scene | feature solar-system: domain | kebab-case | 242 | pure domain without direct unit test; redundant prefix |
| `src/features/solar-system/domain/texture-contract.ts` | solar-system: texture contract | feature solar-system: domain | kebab-case | 5 |  |
| `src/features/solar-system/presentation/ambient-field.module.css` | CSS Module for ambient-field | feature solar-system: presentation | kebab-case | 62 |  |
| `src/features/solar-system/presentation/ambient-field.tsx` | solar-system: ambient field | feature solar-system: presentation | kebab-case | 25 |  |
| `src/features/solar-system/presentation/solar-explorer-state.ts` | solar-system: solar explorer state | feature solar-system: presentation | kebab-case | 61 | hook/store in *-state file; untested |
| `src/features/solar-system/presentation/solar-explorer.module.css` | CSS Module for solar-explorer | feature solar-system: presentation | kebab-case | 221 |  |
| `src/features/solar-system/presentation/solar-explorer.tsx` | solar-system: solar explorer | feature solar-system: presentation | kebab-case | 240 |  |
| `src/features/solar-system/presentation/solar-system.module.css` | CSS Module for solar-system | feature solar-system: presentation | kebab-case | 183 |  |
| `src/features/solar-system/presentation/solar-system.tsx` | solar-system: solar system | feature solar-system: presentation | kebab-case | 347 |  |
| `src/features/solar-system/texture-data.ts` | solar-system: texture data | feature facade/entry | kebab-case | 3 |  |

#### `src/features/technology-catalogue` — 3 files, 293 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/features/technology-catalogue/domain/query.ts` | technology-catalogue: query | feature technology-catalogue: domain | kebab-case | 35 | British 'catalogue'; generic name 'query' |
| `src/features/technology-catalogue/presentation/technology-catalogue.module.css` | CSS Module for technology-catalogue | feature technology-catalogue: presentation | kebab-case | 124 |  |
| `src/features/technology-catalogue/presentation/technology-catalogue.tsx` | technology-catalogue: technology catalogue | feature technology-catalogue: presentation | kebab-case | 134 | British 'catalogue' |

#### `src/features/tool-carousel` — 4 files, 496 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/features/tool-carousel/domain/rows.ts` | tool-carousel: rows | feature tool-carousel: domain | kebab-case | 18 |  |
| `src/features/tool-carousel/presentation/tool-carousel-client.tsx` | tool-carousel: tool carousel client | feature tool-carousel: presentation | kebab-case | 294 |  |
| `src/features/tool-carousel/presentation/tool-carousel.module.css` | CSS Module for tool-carousel | feature tool-carousel: presentation | kebab-case | 173 |  |
| `src/features/tool-carousel/presentation/tool-carousel.tsx` | tool-carousel: tool carousel | feature tool-carousel: presentation | kebab-case | 11 |  |

#### `src/shared/contact` — 2 files, 228 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/shared/contact/contact-links.module.css` | CSS Module for contact-links | presentation: shared components | kebab-case | 136 |  |
| `src/shared/contact/contact-links.tsx` | Contact channel list | presentation: shared components | kebab-case | 92 |  |

#### `src/shared/editorial` — 5 files, 80 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/shared/editorial/metric-list.tsx` | Metric list | presentation: shared components | kebab-case | 16 |  |
| `src/shared/editorial/page-header.module.css` | CSS Module for page-header | presentation: shared components | kebab-case | 21 |  |
| `src/shared/editorial/page-header.tsx` | Editorial page header | presentation: shared components | kebab-case | 25 |  |
| `src/shared/editorial/production-badge.module.css` | CSS Module for production-badge | presentation: shared components | kebab-case | 5 |  |
| `src/shared/editorial/production-badge.tsx` | 'In production' badge | presentation: shared components | kebab-case | 13 |  |

#### `src/shared/identity` — 5 files, 226 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/shared/identity/brand-mark.module.css` | CSS Module for brand-mark | presentation: shared components | kebab-case | 17 |  |
| `src/shared/identity/brand-mark.tsx` | Technology/brand logo renderer | presentation: shared components | kebab-case | 136 |  |
| `src/shared/identity/company-mark.module.css` | CSS Module for company-mark | presentation: shared components | kebab-case | 29 |  |
| `src/shared/identity/company-mark.tsx` | Employer/customer logo renderer | presentation: shared components | kebab-case | 30 |  |
| `src/shared/identity/mark.tsx` | Avatar mark at resolution-matched size | presentation: shared components | kebab-case | 14 |  |

#### `src/shared/motion` — 1 file, 34 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/shared/motion/motion-state.ts` | External store + hook for page-motion pause/holds | presentation: shared state | kebab-case | 34 | hook in *-state file; name as *-store |

#### `src/shared/navigation` — 1 file, 19 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/shared/navigation/external-link.tsx` | Safe external anchor | presentation: shared components | kebab-case | 19 |  |

#### `src/shared/styles` — 1 file, 6 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/shared/styles/cn.ts` | clsx + tailwind-merge helper | presentation: design system | kebab-case | 6 |  |

#### `src/shared/technology` — 3 files, 168 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/shared/technology/technology-illustrations.ts` | Generated sprite index of technology illustrations | presentation: shared components | kebab-case | 116 |  |
| `src/shared/technology/technology-mark.module.css` | CSS Module for technology-mark | presentation: shared components | kebab-case | 15 |  |
| `src/shared/technology/technology-mark.tsx` | Technology mark/illustration component | presentation: shared components | kebab-case | 37 |  |

#### `src/shared/ui` — 8 files, 282 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `src/shared/ui/badge.tsx` | Owned shadcn/ui primitive: badge | presentation: design system | kebab-case | 32 |  |
| `src/shared/ui/button.tsx` | Owned shadcn/ui primitive: button | presentation: design system | kebab-case | 46 |  |
| `src/shared/ui/card.tsx` | Owned shadcn/ui primitive: card | presentation: design system | kebab-case | 52 |  |
| `src/shared/ui/dialog.tsx` | Owned shadcn/ui primitive: dialog | presentation: design system | kebab-case | 70 |  |
| `src/shared/ui/input.tsx` | Owned shadcn/ui primitive: input | presentation: design system | kebab-case | 18 |  |
| `src/shared/ui/label.tsx` | Owned shadcn/ui primitive: label | presentation: design system | kebab-case | 22 |  |
| `src/shared/ui/native-select.tsx` | Owned shadcn/ui primitive: native-select | presentation: design system | kebab-case | 27 |  |
| `src/shared/ui/skeleton.tsx` | Owned shadcn/ui primitive: skeleton | presentation: design system | kebab-case | 15 |  |

#### `content` — 35 files, 7595 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `content/about-copy.ts` | AboutCopy type only | domain data + types (reviewed input) | kebab-case | 23 | type-only file in data root; move to domain types |
| `content/academic-catalogue.ts` | Bilingual academic curriculum data + helpers | domain data + types (reviewed input) | kebab-case | 301 | British 'catalogue' vs US English rule; own AcademicLocale type duplicates Locale |
| `content/chrome.ts` | Shell copy type + both locales (duplicates SiteCopy.chrome) | domain data + types (reviewed input) | kebab-case | 100 | duplicates SiteCopy.chrome keys; ES skip-link text differs (drift) |
| `content/cv-public.json` | Generated public CV projection (export-cv) | domain data + types (reviewed input) | kebab-case | 1075 |  |
| `content/en/about.ts` | EN locale content: about | domain data + types (reviewed input) | kebab-case | 75 |  |
| `content/en/education.ts` | EN locale content: education | domain data + types (reviewed input) | kebab-case | 108 |  |
| `content/en/experience.ts` | EN locale content: experience | domain data + types (reviewed input) | kebab-case | 295 |  |
| `content/en/gallery.ts` | EN locale content: gallery | domain data + types (reviewed input) | kebab-case | 64 |  |
| `content/en/index.ts` | EN locale content: index | domain data + types (reviewed input) | kebab-case | 26 |  |
| `content/en/profile.ts` | EN locale content: profile | domain data + types (reviewed input) | kebab-case | 109 |  |
| `content/en/projects.ts` | EN locale content: projects | domain data + types (reviewed input) | kebab-case | 421 |  |
| `content/en/site.ts` | EN locale content: site | domain data + types (reviewed input) | kebab-case | 234 |  |
| `content/en/stack.ts` | EN locale content: stack | domain data + types (reviewed input) | kebab-case | 4 | 4-line derivation; logic not data |
| `content/es/about.ts` | ES locale content: about | domain data + types (reviewed input) | kebab-case | 75 |  |
| `content/es/education.ts` | ES locale content: education | domain data + types (reviewed input) | kebab-case | 109 |  |
| `content/es/experience.ts` | ES locale content: experience | domain data + types (reviewed input) | kebab-case | 294 |  |
| `content/es/gallery.ts` | ES locale content: gallery | domain data + types (reviewed input) | kebab-case | 67 |  |
| `content/es/index.ts` | ES locale content: index | domain data + types (reviewed input) | kebab-case | 26 |  |
| `content/es/profile.ts` | ES locale content: profile | domain data + types (reviewed input) | kebab-case | 106 |  |
| `content/es/projects.ts` | ES locale content: projects | domain data + types (reviewed input) | kebab-case | 424 |  |
| `content/es/site.ts` | ES locale content: site | domain data + types (reviewed input) | kebab-case | 238 |  |
| `content/es/stack.ts` | ES locale content: stack | domain data + types (reviewed input) | kebab-case | 4 | 4-line derivation; logic not data |
| `content/experience-facts.ts` | Reads titles/dates from CV projection | domain data + types (reviewed input) | kebab-case | 12 | use-case logic in data root; untested |
| `content/filomena-gallery.ts` | Filomena screenshot list | domain data + types (reviewed input) | kebab-case | 54 |  |
| `content/filomena-image-dimensions.json` | Generated image dimensions | domain data + types (reviewed input) | kebab-case | 174 |  |
| `content/index.ts` | server-only getContent(locale) registry | domain data + types (reviewed input) | kebab-case | 14 |  |
| `content/pequeverso-gallery.ts` | Pequeverso screenshot list | domain data + types (reviewed input) | kebab-case | 33 |  |
| `content/pequeverso-image-dimensions.json` | Generated image dimensions | domain data + types (reviewed input) | kebab-case | 26 |  |
| `content/privacy.ts` | Bilingual privacy page copy (Record<Locale>) | domain data + types (reviewed input) | kebab-case | 38 | Record<Locale> pattern differs from content/en\|es folders |
| `content/public-documents.json` | Approved document manifest (sizes/hashes) | domain data + types (reviewed input) | kebab-case | 62 |  |
| `content/site-copy.ts` | SiteCopy type (interface copy contract) | domain data + types (reviewed input) | kebab-case | 183 | chrome block appears unused (shell reads content/chrome.ts) |
| `content/tech-marks.ts` | Derived list of technology icons | domain data + types (reviewed input) | kebab-case | 5 | derived rule in data root |
| `content/technologies.ts` | Technology catalog data + query helpers (2.7k lines) | domain data + types (reviewed input) | kebab-case | 2704 | mixes 2.5k lines of data with query functions; split data vs domain rules |
| `content/tool-carousel-copy.ts` | Bilingual carousel copy (Record<Locale>) | domain data + types (reviewed input) | kebab-case | 32 | Record<Locale> pattern differs from content/en\|es folders |
| `content/types.ts` | Profile domain types (Role, Project, Metric...) | domain data + types (reviewed input) | kebab-case | 80 |  |

#### `config` — 4 files, 130 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `config/locales.ts` | Locale list/types and helpers | configuration | kebab-case | 38 |  |
| `config/routes.ts` | Public route registry | configuration | kebab-case | 24 |  |
| `config/site.ts` | Site URL, headline, resume files | configuration | kebab-case | 43 |  |
| `config/solar-textures.ts` | Solar texture cache/version rules | configuration | kebab-case | 25 |  |

#### `contracts` — 9 files, 5019 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `contracts/assistant-api/openapi.json` | Frozen assistant API OpenAPI snapshot | external contract (frozen) | kebab-case | 2215 |  |
| `contracts/assistant-api/product-event.schema.json` | Analytics event schema | external contract (frozen) | kebab-case | 93 |  |
| `contracts/assistant-api/product-interaction-source.json` | Interaction contract provenance | external contract (frozen) | kebab-case | 19 |  |
| `contracts/assistant-api/product-interaction.examples.json` | Interaction examples | external contract (frozen) | kebab-case | 28 |  |
| `contracts/assistant-api/product-interaction.schema.json` | Interaction schema | external contract (frozen) | kebab-case | 147 |  |
| `contracts/assistant-api/source.json` | Contract provenance (upstream revision) | external contract (frozen) | kebab-case | 14 |  |
| `contracts/assistant-api/sse.examples.json` | SSE examples | external contract (frozen) | kebab-case | 83 |  |
| `contracts/assistant-api/sse.schema.json` | SSE event JSON Schema | external contract (frozen) | kebab-case | 578 |  |
| `contracts/assistant-api/types.d.ts` | Generated OpenAPI types | external contract (frozen) | kebab-case | 1842 |  |

#### `media` — 3 files, 0 lines of text


Binaries: 3 files (2136 KiB), e.g. `avatar.png`, `portrait-source.png`, `portrait.avif`.

#### `public` — 222 files, 794 lines of text

Summarized by pattern (the `public/` paths are URL contracts; see the note in §2).

| Pattern | Files | Purpose | Naming | Notes |
|---|---|---|---|---|
| `public/avatar/*.png` | 5 | Avatar `face-<px>.png` generated by `tools/generate-identity.mjs` | kebab-case (e.g. `face-16.png`, `face-192.png`) |  |
| `public/*.svg` | 2 | EN/ES PDF CVs at the root + illustration SVGs | kebab-case (e.g. `brands.svg`, `technology-illustrations.svg`) |  |
| `public/brands/*.md` | 1 | Technology logos (simple-icons/vendors) + Coolify NOTICE/license | kebab-case (e.g. `NOTICE.md`) |  |
| `public/brands/*.svg` | 92 | Technology logos (simple-icons/vendors) + Coolify NOTICE/license | kebab-case (e.g. `aave.svg`, `agno.svg`) | mixed slugs: `amazon-api-gateway` (kebab) vs. `apachemaven`, `nodedotjs`-style (simple-icons without hyphens) |
| `public/brands/*.png` | 9 | Technology logos (simple-icons/vendors) + Coolify NOTICE/license | kebab-case (e.g. `clarity.png`, `deepinfra.png`) |  |
| `public/brands/*.txt` | 1 | Technology logos (simple-icons/vendors) + Coolify NOTICE/license | kebab-case (e.g. `coolify-LICENSE.txt`) |  |
| `public/certificates/*.pdf` | 1 | Certificates (PDF/PNG) | kebab-case (e.g. `docker-fundamentals-2024.pdf`) |  |
| `public/certificates/*.png` | 1 | Certificates (PDF/PNG) | kebab-case (e.g. `professional-power-skills-2026.png`) |  |
| `public/documents/*.pdf` | 2 | Approved academic documents (PDF) | kebab-case (e.g. `uns-academic-transcript-2025.pdf`, `uns-information-systems-plan-2012.pdf`) |  |
| `public/filomena/*.webp` | 43 | Screenshots of the Filomena case (`filomena-NNN.webp`) | kebab-case (e.g. `filomena-001.webp`, `filomena-004.webp`) |  |
| `public/*.pdf` | 2 | EN/ES PDF CVs at the root + illustration SVGs | kebab-case (e.g. `gonzalo-martin-perez-ai-software-engineer-en.pdf`, `gonzalo-martin-perez-ai-software-engineer-es.pdf`) | CVs at the root while other PDFs live in `documents/`/`certificates/`; NOTICE references them by path |
| `public/images/companies/*.jpg` | 4 | Employer/client logos | kebab-case (e.g. `cooperativa-obrera-100.jpg`, `independent.jpg`) |  |
| `public/images/companies/*.png` | 4 | Employer/client logos | kebab-case (e.g. `cooperativa-obrera.png`, `pequeverso.png`) |  |
| `public/images/companies/*.webp` | 1 | Employer/client logos | kebab-case (e.g. `pequeverso-isotipo.webp`) |  |
| `public/images/companies/*.svg` | 1 | Employer/client logos | kebab-case (e.g. `teamcubation.svg`) |  |
| `public/images/institutions/*.jpg` | 2 | Institutional logos (UNS) | kebab-case (e.g. `kognite.jpg`, `uns.jpg`) |  |
| `public/images/*.svg` | 1 | Standalone SVG | kebab-case (e.g. `scene-stars.svg`) |  |
| `public/images/solar-system/*.webp` | 42 | Multi-width planet textures (`<body>[-<width>].webp`) + `manifest.json` with SHA-256 | kebab-case (e.g. `earth-1024.webp`, `earth-2048.webp`) |  |
| `public/images/solar-system/*.json` | 1 | Multi-width planet textures (`<body>[-<width>].webp`) + `manifest.json` with SHA-256 | kebab-case (e.g. `manifest.json`) |  |
| `public/pequeverso/*.webp` | 6 | Screenshots of the Pequeverso case | kebab-case (e.g. `pequeverso-assistant-desktop.webp`, `pequeverso-assistant-mobile.webp`) |  |
| `public/social/*.png` | 1 | Dated OG image | kebab-case (e.g. `portfolio-og-2026-10-24.png`) | date in the name: manual cache busting |

#### `tools` — 27 files, 4407 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `tools/analytics-live-receipt.ts` | Extracts live analytics acceptance receipt | tooling | kebab-case | 252 |  |
| `tools/api-contract/package-lock.json` | Lockfile for contract generator | tooling | kebab-case | 395 |  |
| `tools/api-contract/package.json` | Isolated openapi-typescript generator package | tooling | kebab-case | 14 |  |
| `tools/architecture-policy.mjs` | Registered roots/features/entries/frozen inputs | tooling | kebab-case | 133 | JS: migrate to tools/architecture-policy.ts |
| `tools/architecture.mjs` | AST architecture guard (layers, cycles, client/server) | tooling | kebab-case | 540 | JS: migrate to tools/architecture.ts; 540 lines; split |
| `tools/assistant-budget-plugin.ts` | Webpack plugin: assistant bundle budget | tooling | kebab-case | 54 |  |
| `tools/assistant-fixture-json.ts` | Assistant fixture JSON helpers | tooling | kebab-case | 31 |  |
| `tools/browser-ci-planner.mjs` | Duration-balanced browser shard planner | tooling | kebab-case | 239 | JS: migrate to tools/browser-ci-planner.ts |
| `tools/browser-ci-timings.json` | Recorded browser test timings | tooling | kebab-case | 418 |  |
| `tools/browser-test-server.ts` | Fixture API server for browser tests | tooling | kebab-case | 140 |  |
| `tools/capture-gallery.mjs` | Captures README gallery screenshots | tooling | kebab-case | 180 | JS: migrate to tools/capture-gallery.ts |
| `tools/check-assistant-contract.mjs` | Checks generated contract types drift | tooling | kebab-case | 16 | JS: migrate to tools/check-assistant-contract.ts |
| `tools/check-browser-runtime.mjs` | Verifies Playwright browser/runtime alignment | tooling | kebab-case | 22 | JS: migrate to tools/check-browser-runtime.ts |
| `tools/ci-build-artifact.mjs` | Normalizes/packs CI build artifact | tooling | kebab-case | 113 | JS: migrate to tools/ci-build-artifact.ts |
| `tools/ci-build-provenance.mjs` | Build provenance verification | tooling | kebab-case | 283 | JS: migrate to tools/ci-build-provenance.ts |
| `tools/dependency-policy.mjs` | Exact-pin/lock dependency policy checks | tooling | kebab-case | 312 | JS: migrate to tools/dependency-policy.ts |
| `tools/documents.ts` | Verifies public documents vs manifest | tooling | kebab-case | 86 |  |
| `tools/export-cv.mjs` | Exports approved CV projection from private sources | tooling | kebab-case | 181 | JS: migrate to tools/export-cv.ts |
| `tools/generate-identity.mjs` | Generates avatar/portrait derivatives | tooling | kebab-case | 75 | JS: migrate to tools/generate-identity.ts |
| `tools/nightly-candidate.mjs` | Resolves frozen nightly candidate | tooling | kebab-case | 73 | JS: migrate to tools/nightly-candidate.ts |
| `tools/scene-budget-plugin.mjs` | Webpack plugin: 3D scene bundle budget | tooling | kebab-case | 70 | JS: migrate to tools/scene-budget-plugin.ts |
| `tools/secret-scan.mjs` | Redacted secret scan (tree/history/artifacts) | tooling | kebab-case | 256 | JS: migrate to tools/secret-scan.ts |
| `tools/smoke-test.mjs` | Hosting smoke test of built server | tooling | kebab-case | 69 | JS: migrate to tools/smoke-test.ts |
| `tools/technology-illustrations.mjs` | Generates technology illustration sprite/index | tooling | kebab-case | 53 | JS: migrate to tools/technology-illustrations.ts |
| `tools/test-server.mjs` | Local production server for tests | tooling | kebab-case | 62 | JS: migrate to tools/test-server.ts |
| `tools/test-site.mjs` | Build+serve+test site orchestration | tooling | kebab-case | 27 | JS: migrate to tools/test-site.ts |
| `tools/workflow-policy.mjs` | Workflow YAML structure policy | tooling | kebab-case | 313 | JS: migrate to tools/workflow-policy.ts |

#### `tests/browser` — 41 files, 5601 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `tests/browser/about-profile.spec.ts` | Playwright spec: about-profile | test: browser | kebab-case | 75 |  |
| `tests/browser/ambient-field.spec.ts` | Playwright spec: ambient-field | test: browser | kebab-case | 118 |  |
| `tests/browser/analytics-interactions.spec.ts` | Playwright spec: analytics-interactions | test: browser | kebab-case | 286 |  |
| `tests/browser/analytics.spec.ts` | Playwright spec: analytics | test: browser | kebab-case | 205 |  |
| `tests/browser/assistant.spec.ts` | Playwright spec: assistant | test: browser | kebab-case | 651 |  |
| `tests/browser/avatar-depth.spec.ts` | Playwright spec: avatar-depth | test: browser | kebab-case | 49 |  |
| `tests/browser/capture.ts` | Browser test helper: capture (misplaced; belongs in tests/helpers) | test: browser | kebab-case | 24 |  |
| `tests/browser/cloud-spacing.spec.ts` | Playwright spec: cloud-spacing | test: browser | kebab-case | 113 |  |
| `tests/browser/contact-icons.spec.ts` | Playwright spec: contact-icons | test: browser | kebab-case | 43 |  |
| `tests/browser/control-depth.spec.ts` | Playwright spec: control-depth | test: browser | kebab-case | 56 |  |
| `tests/browser/document-visibility.ts` | Browser test helper: document-visibility (misplaced; belongs in tests/helpers) | test: browser | kebab-case | 13 |  |
| `tests/browser/documents.spec.ts` | Playwright spec: documents | test: browser | kebab-case | 151 |  |
| `tests/browser/editorial-layout.spec.ts` | Playwright spec: editorial-layout | test: browser | kebab-case | 31 |  |
| `tests/browser/education-layout.spec.ts` | Playwright spec: education-layout | test: browser | kebab-case | 69 |  |
| `tests/browser/expertise.spec.ts` | Playwright spec: expertise | test: browser | kebab-case | 155 |  |
| `tests/browser/gallery-native-navigation.spec.ts` | Playwright spec: gallery-native-navigation | test: browser | kebab-case | 35 |  |
| `tests/browser/hero-language-loading.spec.ts` | Playwright spec: hero-language-loading | test: browser | kebab-case | 106 |  |
| `tests/browser/hero-locale-performance.spec.ts` | Playwright spec: hero-locale-performance | test: browser | kebab-case | 127 |  |
| `tests/browser/interactions.spec.ts` | Playwright spec: interactions | test: browser | kebab-case | 235 |  |
| `tests/browser/lab.spec.ts` | Playwright spec: lab | test: browser | kebab-case | 51 | observation recorder, not an assertion test; move to tools or tag |
| `tests/browser/locale-position.spec.ts` | Playwright spec: locale-position | test: browser | kebab-case | 52 |  |
| `tests/browser/mobile-navigation.spec.ts` | Playwright spec: mobile-navigation | test: browser | kebab-case | 82 |  |
| `tests/browser/mobile-refinements.spec.ts` | Playwright spec: mobile-refinements | test: browser | kebab-case | 96 |  |
| `tests/browser/mobile-scroll.spec.ts` | Playwright spec: mobile-scroll | test: browser | kebab-case | 61 |  |
| `tests/browser/narrow-readability.spec.ts` | Playwright spec: narrow-readability | test: browser | kebab-case | 29 |  |
| `tests/browser/not-found.spec.ts` | Playwright spec: not-found | test: browser | kebab-case | 74 |  |
| `tests/browser/portrait.spec.ts` | Playwright spec: portrait | test: browser | kebab-case | 42 |  |
| `tests/browser/privacy.spec.ts` | Playwright spec: privacy | test: browser | kebab-case | 153 |  |
| `tests/browser/professional-profile.spec.ts` | Playwright spec: professional-profile | test: browser | kebab-case | 124 |  |
| `tests/browser/responsive-layout.spec.ts` | Playwright spec: responsive-layout | test: browser | kebab-case | 32 |  |
| `tests/browser/routes.spec.ts` | Playwright spec: routes | test: browser | kebab-case | 121 |  |
| `tests/browser/scene-runtime-regressions.spec.ts` | Playwright spec: scene-runtime-regressions | test: browser | kebab-case | 78 |  |
| `tests/browser/scene-stability.spec.ts` | Playwright spec: scene-stability | test: browser | kebab-case | 229 |  |
| `tests/browser/scene-toolkit.spec.ts` | Playwright spec: scene-toolkit | test: browser | kebab-case | 163 |  |
| `tests/browser/shadcn-controls.spec.ts` | Playwright spec: shadcn-controls | test: browser | kebab-case | 86 | named after library, not behavior |
| `tests/browser/solar-explorer.spec.ts` | Playwright spec: solar-explorer | test: browser | kebab-case | 121 |  |
| `tests/browser/solar-system.spec.ts` | Playwright spec: solar-system | test: browser | kebab-case | 474 |  |
| `tests/browser/sphere-pulses.spec.ts` | Playwright spec: sphere-pulses | test: browser | kebab-case | 170 |  |
| `tests/browser/tool-carousel.spec.ts` | Playwright spec: tool-carousel | test: browser | kebab-case | 314 |  |
| `tests/browser/touch-sequence.ts` | Browser test helper: touch-sequence (misplaced; belongs in tests/helpers) | test: browser | kebab-case | 28 |  |
| `tests/browser/work-architecture.spec.ts` | Playwright spec: work-architecture | test: browser | kebab-case | 479 |  |

#### `tests/helpers` — 2 files, 299 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `tests/helpers/analytics-fixture.ts` | Test helpers: analytics-fixture | test: helpers | kebab-case | 125 |  |
| `tests/helpers/assistant-fixture.ts` | Test helpers: assistant-fixture | test: helpers | kebab-case | 174 |  |

#### `tests/integration` — 4 files, 927 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `tests/integration/analytics-live/real-flow.spec.ts` | Test integration: real-flow | test: integration | kebab-case | 352 |  |
| `tests/integration/budget.test.mjs` | Test integration: budget | test: integration | kebab-case | 189 | JS: migrate to tests/integration/budget.test.ts |
| `tests/integration/native-api.ts` | Test integration: native-api | test: integration | kebab-case | 90 | helper inside integration; belongs in tests/helpers |
| `tests/integration/rendered.test.mjs` | Test integration: rendered | test: integration | kebab-case | 296 | JS: migrate to tests/integration/rendered.test.ts |

#### `tests/rollout` — 1 file, 38 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `tests/rollout/assistant-disabled.spec.ts` | Test rollout: assistant-disabled | test: rollout | kebab-case | 38 |  |

#### `tests/unit` — 39 files, 6909 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `tests/unit/academic.test.mjs` | Unit test: academic | test: unit | kebab-case | 54 | JS: migrate to tests/unit/academic.test.ts |
| `tests/unit/analytics-availability.test.ts` | Unit test: analytics-availability | test: unit | kebab-case | 12 |  |
| `tests/unit/analytics-click-grid.test.ts` | Unit test: analytics-click-grid | test: unit | kebab-case | 51 |  |
| `tests/unit/analytics-contract.test.ts` | Unit test: analytics-contract | test: unit | kebab-case | 72 |  |
| `tests/unit/analytics-events.test.ts` | Unit test: analytics-events | test: unit | kebab-case | 41 |  |
| `tests/unit/analytics-exposure-adapter.test.ts` | Unit test: analytics-exposure-adapter | test: unit | kebab-case | 608 | 608 lines |
| `tests/unit/analytics-exposure-dwell.test.ts` | Unit test: analytics-exposure-dwell | test: unit | kebab-case | 99 |  |
| `tests/unit/analytics-exposure-session.test.ts` | Unit test: analytics-exposure-session | test: unit | kebab-case | 121 |  |
| `tests/unit/analytics-http.test.ts` | Unit test: analytics-http | test: unit | kebab-case | 200 |  |
| `tests/unit/analytics-interactions.test.ts` | Unit test: analytics-interactions | test: unit | kebab-case | 154 |  |
| `tests/unit/analytics-live-receipt.test.ts` | Unit test: analytics-live-receipt | test: unit | kebab-case | 205 |  |
| `tests/unit/analytics-measurement-budget.test.ts` | Unit test: analytics-measurement-budget | test: unit | kebab-case | 37 |  |
| `tests/unit/analytics-page-visits.test.ts` | Unit test: analytics-page-visits | test: unit | kebab-case | 36 |  |
| `tests/unit/architecture-diagrams.test.ts` | Unit test: architecture-diagrams | test: unit | kebab-case | 80 |  |
| `tests/unit/architecture.test.mjs` | Unit test: architecture | test: unit | kebab-case | 800 | JS: migrate to tests/unit/architecture.test.ts; 800 lines; split by rule family |
| `tests/unit/assistant-availability.test.ts` | Unit test: assistant-availability | test: unit | kebab-case | 12 |  |
| `tests/unit/assistant-boundaries.test.ts` | Unit test: assistant-boundaries | test: unit | kebab-case | 20 |  |
| `tests/unit/assistant-budget.test.ts` | Unit test: assistant-budget | test: unit | kebab-case | 48 |  |
| `tests/unit/assistant-context.test.ts` | Unit test: assistant-context | test: unit | kebab-case | 29 |  |
| `tests/unit/assistant-motion.test.ts` | Unit test: assistant-motion | test: unit | kebab-case | 25 |  |
| `tests/unit/assistant-network.test.ts` | Unit test: assistant-network | test: unit | kebab-case | 107 |  |
| `tests/unit/assistant-sse.test.ts` | Unit test: assistant-sse | test: unit | kebab-case | 179 |  |
| `tests/unit/assistant-state.test.ts` | Unit test: assistant-state | test: unit | kebab-case | 244 |  |
| `tests/unit/assistant-transport.test.ts` | Unit test: assistant-transport | test: unit | kebab-case | 159 |  |
| `tests/unit/browser-ci-planner.test.mjs` | Unit test: browser-ci-planner | test: unit | kebab-case | 177 | JS: migrate to tests/unit/browser-ci-planner.test.ts |
| `tests/unit/catalogue.test.mjs` | Unit test: catalogue | test: unit | kebab-case | 343 | JS: migrate to tests/unit/catalogue.test.ts |
| `tests/unit/ci-build-artifact.test.mjs` | Unit test: ci-build-artifact | test: unit | kebab-case | 118 | JS: migrate to tests/unit/ci-build-artifact.test.ts |
| `tests/unit/ci-build-provenance.test.mjs` | Unit test: ci-build-provenance | test: unit | kebab-case | 321 | JS: migrate to tests/unit/ci-build-provenance.test.ts |
| `tests/unit/cloud-layout.test.mjs` | Unit test: cloud-layout | test: unit | kebab-case | 169 | JS: migrate to tests/unit/cloud-layout.test.ts |
| `tests/unit/content-migration.test.mjs` | Unit test: content-migration | test: unit | kebab-case | 92 | JS: migrate to tests/unit/content-migration.test.ts |
| `tests/unit/content.test.mjs` | Unit test: content | test: unit | kebab-case | 321 | JS: migrate to tests/unit/content.test.ts |
| `tests/unit/cv-export.test.mjs` | Unit test: cv-export | test: unit | kebab-case | 85 | JS: migrate to tests/unit/cv-export.test.ts |
| `tests/unit/dependency-policy.test.mjs` | Unit test: dependency-policy | test: unit | kebab-case | 446 | JS: migrate to tests/unit/dependency-policy.test.ts |
| `tests/unit/nightly-candidate.test.mjs` | Unit test: nightly-candidate | test: unit | kebab-case | 217 | JS: migrate to tests/unit/nightly-candidate.test.ts |
| `tests/unit/repository.test.mjs` | Unit test: repository | test: unit | kebab-case | 262 | JS: migrate to tests/unit/repository.test.ts |
| `tests/unit/scene-budget.test.mjs` | Unit test: scene-budget | test: unit | kebab-case | 105 | JS: migrate to tests/unit/scene-budget.test.ts |
| `tests/unit/secret-scan.test.mjs` | Unit test: secret-scan | test: unit | kebab-case | 241 | JS: migrate to tests/unit/secret-scan.test.ts |
| `tests/unit/technology-models.test.ts` | Unit test: technology-models | test: unit | kebab-case | 62 |  |
| `tests/unit/workflow-policy.test.mjs` | Unit test: workflow-policy | test: unit | kebab-case | 557 | JS: migrate to tests/unit/workflow-policy.test.ts |

#### `docs` — 14 files, 1881 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `docs/architecture.md` | Portfolio architecture | documentation: guide | kebab-case | 208 |  |
| `docs/code-quality.md` | Readable code and useful documentation | documentation: guide | kebab-case | 101 |  |
| `docs/dependency-updates.md` | Manual dependency updates | documentation: guide | kebab-case | 102 |  |
| `docs/deployment.md` | Deployment · Hostinger | documentation: guide | kebab-case | 157 |  |
| `docs/design.md` | Design system | documentation: guide | kebab-case | 137 | uses British 'Colour' despite US English rule |
| `docs/development.md` | Development workflow | documentation: guide | kebab-case | 415 | 415 lines mixing tutorial/how-to/reference |
| `docs/editorial-guidelines.md` | Editorial guidelines | documentation: guide | kebab-case | 81 |  |
| `docs/engineering-standards.md` | Engineering standards and session ownership | documentation: guide | kebab-case | 114 |  |
| `docs/linkedin-branding.md` | Social preview and LinkedIn brand assets | documentation: guide | kebab-case | 19 |  |
| `docs/native-assistant.md` | Native portfolio assistant | documentation: guide | kebab-case | 217 |  |
| `docs/public-content.md` | Public content and documentary evidence | documentation: guide | kebab-case | 107 |  |
| `docs/release-history.md` | Public-launch label and historical source anchors | documentation: guide | kebab-case | 56 | no CHANGELOG; tag-normalization log instead of release notes |
| `docs/skill-discovery.md` | Repository skill discovery | documentation: guide | kebab-case | 48 |  |
| `docs/technology.md` | Technology and support | documentation: guide | kebab-case | 119 |  |

#### `docs/adr` — 1 file, 65 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `docs/adr/site-architecture-parity.md` | ADR: shared physical site architecture (unnumbered) | documentation: adr | kebab-case | 65 | unnumbered; not MADR |

#### `docs/assets` — 6 files, 498 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `docs/assets/company-marks.md` | Company and client marks | documentation: assets | kebab-case | 116 |  |
| `docs/assets/credential-marks.md` | Credential issuer marks | documentation: assets | kebab-case | 19 |  |
| `docs/assets/profile-images.md` | Profile portrait | documentation: assets | kebab-case | 13 |  |
| `docs/assets/shadcn-ui.md` | Owned shadcn/ui primitives | documentation: assets | kebab-case | 40 |  |
| `docs/assets/solar-system.md` | Solar system texture assets | documentation: assets | kebab-case | 103 |  |
| `docs/assets/technology-marks.md` | Additional technology marks | documentation: assets | kebab-case | 207 |  |

#### `docs/diagrams` — 10 files, 158 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `docs/diagrams/README.md` | README diagram sources | documentation: diagrams | UPPERCASE (community/agent convention) | 93 |  |
| `docs/diagrams/architecture-overview-dark.svg` | Diagram source/artwork (svg) | documentation: diagrams | kebab-case |  |  |
| `docs/diagrams/architecture-overview-light.svg` | Diagram source/artwork (svg) | documentation: diagrams | kebab-case |  |  |
| `docs/diagrams/architecture-overview.mmd` | Diagram source/artwork (mmd) | documentation: diagrams | kebab-case | 20 |  |
| `docs/diagrams/delivery-flow-dark.svg` | Diagram source/artwork (svg) | documentation: diagrams | kebab-case |  |  |
| `docs/diagrams/delivery-flow-light.svg` | Diagram source/artwork (svg) | documentation: diagrams | kebab-case |  |  |
| `docs/diagrams/delivery-flow.mmd` | Diagram source/artwork (mmd) | documentation: diagrams | kebab-case | 30 |  |
| `docs/diagrams/solar-rendering-dark.svg` | Diagram source/artwork (svg) | documentation: diagrams | kebab-case |  |  |
| `docs/diagrams/solar-rendering-light.svg` | Diagram source/artwork (svg) | documentation: diagrams | kebab-case |  |  |
| `docs/diagrams/solar-rendering.mmd` | Diagram source/artwork (mmd) | documentation: diagrams | kebab-case | 15 |  |

#### `docs/gallery` — 21 files, 24 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `docs/gallery/README.md` | README gallery | documentation: gallery | UPPERCASE (community/agent convention) | 24 |  |

Binaries: 20 files (2176 KiB), e.g. `about-light.webp`, `contact-dark.webp`, `education-dark.webp`, `explorer-earth.webp` ….

#### `docs/research` — 8 files, 959 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `docs/research/ci-efficiency.md` | CI efficiency | documentation: research | kebab-case | 144 | undated research file (others dated) |
| `docs/research/clean-architecture.md` | Clean architecture research and local decisions | documentation: research | kebab-case | 102 | undated research file (others dated) |
| `docs/research/dependency-review-2026-10-18.md` | Dependency compatibility review — 2026-10-18 | documentation: research | kebab-case | 48 |  |
| `docs/research/engineering-profile-2026-10-10.md` | Engineering profile: evidence and editorial decisions | documentation: research | kebab-case | 142 |  |
| `docs/research/motion-performance.md` | Interactive 3D motion and scroll performance | documentation: research | kebab-case | 157 | undated research file (others dated) |
| `docs/research/portfolio-2026-09-12.md` | Portfolio research synthesis | documentation: research | kebab-case | 203 |  |
| `docs/research/recruiter-journey-2026-09-19.md` | A clear recruiter journey | documentation: research | kebab-case | 73 |  |
| `docs/research/toolchain-2026-10-17.md` | Supported toolchain review — 2026-10-17 | documentation: research | kebab-case | 90 |  |

#### `docs/specs` — 39 files, 3354 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `docs/specs/about-profile-polish.md` | About profile and engineering approach | documentation: specs | kebab-case | 79 |  |
| `docs/specs/aggregate-interaction-analytics.md` | Aggregate public interactions and local verification | documentation: specs | kebab-case | 169 |  |
| `docs/specs/ai-engineer-positioning-v3.md` | AI Engineer positioning v3 | documentation: specs | kebab-case | 49 |  |
| `docs/specs/ambient-particles.md` | Ambient particles across the portfolio | documentation: specs | kebab-case | 69 |  |
| `docs/specs/applied-ai-profile-2026-10-10.md` | Applied AI profile reconciliation | documentation: specs | kebab-case | 72 |  |
| `docs/specs/ci-efficiency.md` | Efficient complete CI | documentation: specs | kebab-case | 44 |  |
| `docs/specs/cinematic-solar-system.md` | Cinematic solar background | documentation: specs | kebab-case | 117 |  |
| `docs/specs/clean-architecture.md` | Enforced modular portfolio architecture | documentation: specs | kebab-case | 80 |  |
| `docs/specs/common-site-layout.md` | Shared physical site architecture | documentation: specs | kebab-case | 145 |  |
| `docs/specs/continuous-technology-carousel.md` | Continuous technology carousel | documentation: specs | kebab-case | 58 |  |
| `docs/specs/coolify-reverse-proxy.md` | Coolify, reverse proxy experience, and compact motion controls | documentation: specs | kebab-case | 107 |  |
| `docs/specs/engineering-profile-polish.md` | Engineering profile polish — October 2026 | documentation: specs | kebab-case | 156 | missing Status line |
| `docs/specs/enterprise-architecture-maps.md` | Enterprise architecture maps | documentation: specs | kebab-case | 193 |  |
| `docs/specs/experience-architecture-diagrams.md` | Experience architecture diagrams | documentation: specs | kebab-case | 25 |  |
| `docs/specs/home-tools-carousel.md` | Home tools carousel and additional certifications | documentation: specs | kebab-case | 31 | missing Status line |
| `docs/specs/immersive-solar-scene.md` | Immersive solar scene | documentation: specs | kebab-case | 100 |  |
| `docs/specs/interactive-sphere.md` | Interactive sphere and tactile controls | documentation: specs | kebab-case | 45 |  |
| `docs/specs/manual-dependency-review.md` | Manual dependency review | documentation: specs | kebab-case | 39 |  |
| `docs/specs/mobile-cloud-spacing.md` | Mobile cloud spacing and confirmed toolkit additions | documentation: specs | kebab-case | 61 |  |
| `docs/specs/mobile-polish-verification.md` | Mobile polish and public evidence | documentation: specs | kebab-case | 34 | missing Status line |
| `docs/specs/native-assistant.md` | Native assistant migration | documentation: specs | kebab-case | 48 | missing Status line |
| `docs/specs/paired-ci-profiles.md` | Paired validation profiles | documentation: specs | kebab-case | 53 |  |
| `docs/specs/pequeverso-case-study.md` | Pequeverso case study, case-study alignment and CV 2026-10-24.1 | documentation: specs | kebab-case | 69 |  |
| `docs/specs/polished-ai-assistant.md` | Polished native assistant | documentation: specs | kebab-case | 79 |  |
| `docs/specs/portfolio-autonomy.md` | Portfolio autonomy and motion stability | documentation: specs | kebab-case | 62 |  |
| `docs/specs/portfolio-initial-release.md` | Portfolio initial release | documentation: specs | kebab-case | 173 |  |
| `docs/specs/portfolio-redesign.md` | Personal identity and immersive portfolio | documentation: specs | kebab-case | 69 |  |
| `docs/specs/product-analytics.md` | Minimal product analytics and privacy notice | documentation: specs | kebab-case | 409 |  |
| `docs/specs/production-repository-polish.md` | Production repository polish | documentation: specs | kebab-case | 42 |  |
| `docs/specs/professional-profile.md` | Production experience and public profile | documentation: specs | kebab-case | 84 |  |
| `docs/specs/profile-release-polish.md` | Profile release polish | documentation: specs | kebab-case | 29 |  |
| `docs/specs/release-2026-09-19.md` | Professional portfolio and design-system release | documentation: specs | kebab-case | 124 |  |
| `docs/specs/release-2026-10-03.md` | October career and portfolio release | documentation: specs | kebab-case | 89 |  |
| `docs/specs/resting-sphere-size.md` | Resting sphere size and toolkit reading space | documentation: specs | kebab-case | 60 |  |
| `docs/specs/shadcn-migration.md` | Owned UI primitives without a visual reset | documentation: specs | kebab-case | 59 |  |
| `docs/specs/solar-explorer-and-toolkit.md` | Solar explorer and continuous engineering toolkit | documentation: specs | kebab-case | 92 |  |
| `docs/specs/template.md` | Feature title | documentation: specs | kebab-case | 29 |  |
| `docs/specs/verified-toolchain.md` | Verified toolchain and agent procedures | documentation: specs | kebab-case | 64 |  |
| `docs/specs/work-profile-polish.md` | Work profile polish | documentation: specs | kebab-case | 47 |  |

#### `docs/verification` — 24 files, 1450 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `docs/verification/academic-evidence.md` | Academic evidence reconciliation | documentation: verification | kebab-case | 67 | no matching spec |
| `docs/verification/ai-engineer-positioning-v3.md` | AI Engineer positioning v3 verification | documentation: verification | kebab-case | 26 |  |
| `docs/verification/analytics-real-flow.md` | Disposable native analytics verification | documentation: verification | kebab-case | 168 | no matching spec |
| `docs/verification/content-migration.md` | Self-contained content migration | documentation: verification | kebab-case | 60 | no matching spec |
| `docs/verification/immersive-solar-scene.md` | Immersive solar scene verification | documentation: verification | kebab-case | 144 |  |
| `docs/verification/interactive-sphere.md` | Interactive sphere verification | documentation: verification | kebab-case | 85 |  |
| `docs/verification/native-assistant.md` | Native assistant verification | documentation: verification | kebab-case | 185 |  |
| `docs/verification/pequeverso-case-study.md` | Pequeverso case study, case-study alignment and CV sync: verification | documentation: verification | kebab-case | 52 |  |
| `docs/verification/polished-ai-assistant.md` | Polished native assistant verification | documentation: verification | kebab-case | 134 |  |
| `docs/verification/portfolio-autonomy.md` | Portfolio autonomy verification | documentation: verification | kebab-case | 107 |  |
| `docs/verification/portfolio-initial-release.md` | Verification — portfolio initial release | documentation: verification | kebab-case | 91 |  |
| `docs/verification/portfolio-redesign.md` | Portfolio redesign verification | documentation: verification | kebab-case | 67 |  |
| `docs/verification/portrait-quality.md` | Portrait asset — 2026-10-03 | documentation: verification | kebab-case | 9 | no matching spec |
| `docs/verification/responsive-polish-2026-10-24.md` | Responsive and visual QA pass: verification | documentation: verification | kebab-case | 63 | no matching spec |
| `docs/verification/route-theme-readiness.md` | Route theme audit readiness | documentation: verification | kebab-case | 50 | no matching spec |
| `docs/verification/site-layout-cutover.json` | site-layout-cutover.json | documentation: verification | kebab-case | 142 |  |

Binaries: 8 files (1803 KiB), e.g. `avatar-depth.png`, `before-iframe-conversation.png`, `compact-dark-en.png`, `disabled-desktop.png` ….

#### `.github` — 2 files, 72 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `.github/dependabot.yml` | Weekly npm/actions proposals to develop | CI/community | kebab-case | 40 |  |
| `.github/pull_request_template.md` | PR template (problem, scope, validation, release) | CI/community | snake_case | 32 |  |

#### `.agents` — 8 files, 333 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `.agents/skills/debug-issue/SKILL.md` | Debug Issue | agent skills | UPPERCASE (community/agent convention) | 34 |  |
| `.agents/skills/implement-feature/SKILL.md` | Implement Feature | agent skills | UPPERCASE (community/agent convention) | 48 |  |
| `.agents/skills/prepare-delivery/SKILL.md` | Prepare Delivery | agent skills | UPPERCASE (community/agent convention) | 42 |  |
| `.agents/skills/prepare-delivery/references/secret-review.md` | Redacted secret review for the public portfolio | agent skills | kebab-case | 60 |  |
| `.agents/skills/review-change/SKILL.md` | Review Change | agent skills | UPPERCASE (community/agent convention) | 39 |  |
| `.agents/skills/specify-feature/SKILL.md` | Specify Feature | agent skills | UPPERCASE (community/agent convention) | 25 |  |
| `.agents/skills/update-dependencies/SKILL.md` | Update Dependencies | agent skills | UPPERCASE (community/agent convention) | 28 |  |
| `.agents/skills/update-dependencies/references/compatibility.md` | Portfolio compatibility upgrades | agent skills | kebab-case | 57 |  |

#### `.claude` — 6 files, 60 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `.claude/skills/debug-issue/SKILL.md` | Claude adapter pointing to .agents skill (debug-issue) | agent skills | UPPERCASE (community/agent convention) | 10 |  |
| `.claude/skills/implement-feature/SKILL.md` | Claude adapter pointing to .agents skill (implement-feature) | agent skills | UPPERCASE (community/agent convention) | 10 |  |
| `.claude/skills/prepare-delivery/SKILL.md` | Claude adapter pointing to .agents skill (prepare-delivery) | agent skills | UPPERCASE (community/agent convention) | 10 |  |
| `.claude/skills/review-change/SKILL.md` | Claude adapter pointing to .agents skill (review-change) | agent skills | UPPERCASE (community/agent convention) | 10 |  |
| `.claude/skills/specify-feature/SKILL.md` | Claude adapter pointing to .agents skill (specify-feature) | agent skills | UPPERCASE (community/agent convention) | 10 |  |
| `.claude/skills/update-dependencies/SKILL.md` | Claude adapter pointing to .agents skill (update-dependencies) | agent skills | UPPERCASE (community/agent convention) | 10 |  |

#### `root` — 24 files, 5983 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `.editorconfig` | Editor whitespace/charset defaults | root config/doc | dotfile (tool convention) | 9 |  |
| `.env.example` | Documented optional env vars (assistant/analytics gates) | root config/doc | dotfile (tool convention) | 5 |  |
| `.gitattributes` | Git line-ending/binary attributes | root config/doc | dotfile (tool convention) | 2 |  |
| `.gitignore` | Ignored build/cache/secret paths | root config/doc | dotfile (tool convention) | 19 |  |
| `.npmrc` | npm install policy (engine-strict etc.) | root config/doc | dotfile (tool convention) | 4 |  |
| `.nvmrc` | Pinned Node.js dev version (24.22.0) | root config/doc | dotfile (tool convention) | 1 |  |
| `AGENTS.md` | Canonical agent/repo working rules | root config/doc | UPPERCASE (community/agent convention) | 102 |  |
| `CLAUDE.md` | Claude Code entrypoint importing AGENTS.md | root config/doc | UPPERCASE (community/agent convention) | 7 |  |
| `CONTRIBUTING.md` | Contribution workflow for maintainer/agents | root config/doc | UPPERCASE (community/agent convention) | 109 | links README.md#rights, anchor does not exist (section is 'Software license') |
| `LICENSE` | MIT license for original software | root config/doc | UPPERCASE (community/agent convention) | 21 |  |
| `NOTICE.md` | Content scope and third-party notices | root config/doc | UPPERCASE (community/agent convention) | 44 |  |
| `README.md` | Portfolio + engineering showcase overview | root config/doc | UPPERCASE (community/agent convention) | 416 | 416 lines; long-form engineering detail better in docs |
| `SECURITY.md` | Private vulnerability reporting policy | root config/doc | UPPERCASE (community/agent convention) | 56 | GitHub private vulnerability reporting disabled |
| `biome.json` | Biome formatter/linter config (recommended preset) | root config/doc | kebab-case | 17 | recommended preset only; no naming/default-export/import-extension rules |
| `components.json` | shadcn/ui generator aliases | root config/doc | kebab-case | 20 |  |
| `next.config.mjs` | Next.js config: security headers, cache rules, budget plugins | root config/doc | other | 69 | JS: migrate to next.config.ts |
| `package-lock.json` | Root lockfile (generated) | root config/doc | kebab-case | 4829 |  |
| `package.json` | Manifest, exact deps, npm scripts (quality chain) | root config/doc | kebab-case | 85 |  |
| `playwright.analytics-live.config.ts` | Opt-in live analytics acceptance config | root config/doc | other | 28 |  |
| `playwright.config.ts` | Playwright browser test config (8 shards) | root config/doc | other | 71 |  |
| `playwright.rollout.config.ts` | Disabled-build rollout test config | root config/doc | other | 9 |  |
| `postcss.config.mjs` | PostCSS/Tailwind v4 plugin wiring | root config/doc | other | 5 | JS: keep .mjs (Next PostCSS loader; verify .ts support before migrating) |
| `tsconfig.assistant.json` | Stricter TS overlay for assistant feature/tests | root config/doc | other | 15 | stricter flags only for assistant; promote repo-wide |
| `tsconfig.json` | Main strict TS config + path aliases | root config/doc | kebab-case | 40 |  |

#### `.github/workflows` — 4 files, 843 lines of text

| Path | Purpose | Layer/role | Naming | Lines | Notes |
|---|---|---|---|---:|---|
| `.github/workflows/branch-policy.yml` | Enforces task->develop->main branch flow | CI/community | kebab-case | 38 |  |
| `.github/workflows/ci.yml` | Core CI: workflows, secrets, quality, build, hosting, 8 browser shards, perf, aggregate | CI/community | kebab-case | 366 |  |
| `.github/workflows/dependency-policy.yml` | Read-only manual dependency assessment | CI/community | kebab-case | 53 |  |
| `.github/workflows/nightly.yml` | Nightly frozen-candidate full browser/visual/links/bundle | CI/community | kebab-case | 386 |  |

---

## 2. Target state (Phase B Clean Architecture)

### 2.1 Layout decision

Today the repo is **feature-first with layers inside each feature** (`src/features/<f>/{domain,application,adapters,presentation}`) and an AST guard that already enforces dependency direction. The master roadmap asks for explicit *domain / application / adapters / presentation* layers with the composition root in `app/`. Proposal: **layer-first, context-second** — the layers become roots, and the bounded context is the subfolder. Advantages: the dependency rule becomes one rule per root (simpler than 8 per-feature maps in `architecture-policy`), domain/application become runnable by `node --test` without React, and presentation is grouped as design system + components + views + feature UI. Cost: a context is read across 3–4 folders; mitigated by using identical context names in every layer.

> Valid alternative (if the Phase B ADR prefers minimal disruption): keep `src/features/<f>/<layer>` and apply only the renames, the `content` split and the TS migration from this document. The rules in §3 apply to both layouts.

```text
src/
  app/                         # Composition root (Next.js App Router) — routing, metadata and wiring only
    _composition/              # Private folder (does not route): assistant-root, analytics-root, *.server.ts facades
    (routes…)/page.tsx         # thin: resolves locale → view
  domain/<context>/            # Pure TS: content types and rules. No React, Next, DOM, env, ambient clock
    content/  technology/  analytics/  assistant/  architecture-diagrams/  hero-scene/  solar-system/
  application/<context>/       # Use cases + ports (interfaces). Depends only on domain
    content/  analytics/  assistant/
  adapters/<service>/          # Port implementations and external drivers
    assistant-api/             # HTTP + SSE + validation against contracts/assistant-api
    analytics/                 # http-event-sink (ingest)
    browser/                   # DOM, IntersectionObserver, storage (theme), visibility
    rendering/                 # Three.js/GSAP: hero/, solar-system/
  presentation/
    design-system/             # ui/ (shadcn), cn.ts, fonts.ts, styles/globals.css (tokens)
    components/<capability>/   # identity, technology, navigation, contact, editorial, case-study
    shell/                     # header, footer, locale/theme, page-motion
    views/<page>-view.tsx      # server page composition (one folder per page if >1 file)
    features/<context>/        # feature UI: assistant, solar-system, hero, architecture-diagrams, technology-catalog, tool-carousel, project-gallery
    seo/                       # page-metadata.ts, profile-json-ld.tsx
    motion/                    # page-motion-store.ts
content/                       # Reviewed editorial data (data only), imports types from src/domain/content
  en/  es/  technologies/  academic/  galleries/  cv-public.json  public-documents.json
config/                        # locales, routes, site, solar-textures, feature-flags (new)
contracts/assistant-api/       # unchanged (frozen)
media/identity/                # unchanged
public/                        # unchanged (URL contracts)
tools/<group>/*.ts             # architecture, ci, security, dependencies, content, assets, contracts, build, test-servers, analytics
tests/{unit/<context>,browser,helpers,integration,rollout}/
```

**Dependency rules (Phase C, enforced by the guard):**

| From \ may import | domain | application | adapters | presentation | app | content | config | contracts |
|---|---|---|---|---|---|---|---|---|
| domain | ✓ (same context or `content` types) | ✗ | ✗ | ✗ | ✗ | ✗ data | ✓ types (`Locale`) | ✗ |
| application | ✓ | ✓ | ✗ (only via ports) | ✗ | ✗ | ✓ (server-only) | ✓ | ✗ |
| adapters | ✓ | ✓ (implements ports) | ✓ | ✗ | ✗ | ✗ | ✓ | ✓ (sole consumer) |
| presentation | ✓ (pure types/rules) | ✓ | ✗ (injected from app) | ✓ | ✗ | ✗ (receives props) | ✓ | ✗ |
| app | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| content (data) | ✓ `src/domain/content` types | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |

Retained: runtime/type cycles prohibited, transitive client/server closure, ban on I/O and ambient clock in domain/application, explicit public entry points without barrels, rendering adapters importable by presentation **only** via `next/dynamic` from `app/_composition` or a named loader (preserve the current lazy boundaries of 3D/assistant).

> Note: `content/` stays outside `src/` (ADR 2026-10-18, parity with Pequeverso, NOTICE.md references it). The change is that it contains **data only**; types and rules move up to `src/domain|application/content`. Requires an ADR that *amends* 0001.

### 2.2 Target by area

| Current area | Target | Key changes |
|---|---|---|
| `src/app` | `src/app` (composition root) | Add `_composition/` ([private folders](https://nextjs.org/docs/app/getting-started/project-structure#private-folders)). Move `globals.css`/`fonts.ts` to the design system. **Optional (own ADR)**: collapse the 14 EN/ES pairs into `src/app/[locale]/…` + `generateStaticParams` + a `beforeFiles` rewrite of `/:path*` → `/en/:path*` to keep EN without a prefix ([i18n guide](https://nextjs.org/docs/app/guides/internationalization)). Risk: canonical/hreflang, prerender, `not-found`. Otherwise, generate the ES pages with a test that verifies parity. |
| `src/views` | `src/presentation/views` + `src/presentation/seo` | Paired CSS by stem (`about-view.module.css`); `hero-view` → `views/home/home-hero-section.tsx`; `case-study.module.css` → `CaseStudyLayout` component. |
| `src/shell` | `src/presentation/shell` | No renames. |
| `src/shared/ui`, `styles` | `src/presentation/design-system` | `components.json`: `ui: "#presentation/design-system/ui"`, `utils: …/cn`. |
| `src/shared/{identity,technology,navigation,contact,editorial}` | `src/presentation/components/*` | No renames. `technology-illustrations.ts` remains generated by `tools/assets`. |
| `src/shared/motion` | `src/presentation/motion/page-motion-store.ts` | `-store` suffix. |
| `src/features/analytics` | `domain/analytics`, `application/analytics`, `adapters/{analytics,browser/analytics}`, `app/_composition/analytics-*` | `availability.ts` → `config/feature-flags.ts` (`parseBooleanFlag(name, value)`). |
| `src/features/assistant` | `domain/assistant`, `application/assistant`, `adapters/assistant-api`, `presentation/features/assistant`, `app/_composition/assistant-root.tsx` | `assistant.ts` → `assistant-controller.ts`; `AssistantError` → `domain/assistant/errors.ts`; remove `styles.ts` (`cx`) and migrate `chat.module.css` to camelCase. `copy.ts` stays in presentation (assistant is self-contained by design), renamed `assistant-copy.ts`; alternative: `content/<locale>/assistant.ts`. |
| `src/features/architecture-diagrams` | `domain/architecture-diagrams`, `presentation/features/architecture-diagrams` | Drop the `architecture-` prefix. |
| `src/features/hero` | `domain/hero-scene`, `adapters/rendering/hero`, `presentation/features/hero` | — |
| `src/features/solar-system` | `domain/solar-system`, `adapters/rendering/solar-system`, `presentation/features/solar-system`, `app/_composition/solar-texture-versions.server.ts` | Drop the `solar-system-` prefix; `solar-explorer-state` → `solar-explorer-store`; **add a unit test for `scene-model.ts`**. |
| `src/features/technology-catalogue` | `domain/technology/catalog-query.ts`, `presentation/features/technology-catalog` | `catalogue` → `catalog` (US English). The `/stack` URL does not change. |
| `src/features/tool-carousel` | `domain/technology/carousel-rows.ts`, `presentation/features/tool-carousel` | — |
| `src/features/project-gallery` | `presentation/features/project-gallery` | — |
| `content` | `content/` data only; types → `src/domain/content/*.types.ts`; rules → `src/domain/technology`, `src/application/content` | One i18n pattern (folders per locale); split `technologies.ts`; remove the duplicated `chrome`; `getContent` → `get-content.server.ts`. |
| `config` | `config/` + `feature-flags.ts` | No other changes. |
| `contracts`, `media`, `public` | No changes | `public/` holds URL contracts ([Next public folder](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder)); do not rename brands/CVs without explicit redirects. |
| `tools` | `tools/<group>/*.ts` | TS + grouping; `api-contract` → `tools/contracts/api-contract` (update `dependabot.yml`). |
| `tests` | `tests/unit/<context>/`, `tests/helpers/browser/` | TS; folders per context; helpers out of `browser/`. |
| `docs` | Diátaxis + records (§4) | — |
| `.github` | + CODEOWNERS, ISSUE_TEMPLATE, release.yml | §4 |
| root | `next.config.ts`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`; remove `tsconfig.assistant.json` | §3, §4 |

### 2.3 Aliases and imports in the target

`tsconfig.paths` (`@/*`, `@content`, `@config/*`…) works for Next/webpack but **not** for Node type stripping; that is why the modules that run under `node --test` use relative imports with `.ts` today. Proposal: replace `paths` with **Node subpath imports** in `package.json` (`"imports": { "#domain/*": "./src/domain/*", "#application/*": …, "#adapters/*": …, "#presentation/*": …, "#content/*": "./content/*", "#config/*": "./config/*", "#contracts/*": "./contracts/*", "#media/*": "./media/*" }`), which Node, TypeScript (`moduleResolution: bundler`) and webpack all understand. A single scheme for app, tools and tests ([Node subpath imports](https://nodejs.org/api/packages.html#subpath-imports), [TS module resolution](https://www.typescriptlang.org/docs/handbook/modules/reference.html#packagejson-imports-and-self-name-imports)). Validate with `next build --webpack` and the guard (which today resolves `@/`).

### 2.4 Complete mapping (current → target)

Includes every source/config/tools/tests/docs file whose path or name changes (286 rows). Not listed = stays the same (`src/app/**/page.tsx` routes, existing `config/*`, `contracts/`, `media/`, `public/`, `docs/gallery/`, `.agents/`, `.claude/`, specs/verifications except as noted in §4.5). The 38 JS→TS conversions are marked; `postcss.config.mjs` is the only exception.

| Area | Current path | Target path (Phase B) | Rationale |
|---|---|---|---|
| src/app | `src/app/fonts.ts` | `src/presentation/design-system/fonts.ts` | typography is part of the design system; layout only applies it |
| src/app | `src/app/globals.css` | `src/presentation/design-system/styles/globals.css` | tokens/Tailwind belong to the design system; update `components.json` |
| src/views | `src/views/about-view.tsx` | `src/presentation/views/about-view.tsx` | presentation layer |
| src/views | `src/views/about.module.css` | `src/presentation/views/about-view.module.css` | component/CSS pair with the same stem (`about-view.tsx` ↔ `about-view.module.css`) |
| src/views | `src/views/case-study.module.css` | `src/presentation/components/case-study/case-study-layout.module.css` | style shared by 2 views → owning `CaseStudyLayout` component |
| src/views | `src/views/contact-view.tsx` | `src/presentation/views/contact-view.tsx` | presentation layer |
| src/views | `src/views/contact.module.css` | `src/presentation/views/contact-view.module.css` | component/CSS pair with the same stem (`about-view.tsx` ↔ `about-view.module.css`) |
| src/views | `src/views/cv-view.tsx` | `src/presentation/views/cv-view.tsx` | presentation layer |
| src/views | `src/views/cv.module.css` | `src/presentation/views/cv-view.module.css` | component/CSS pair with the same stem (`about-view.tsx` ↔ `about-view.module.css`) |
| src/views | `src/views/education-view.tsx` | `src/presentation/views/education-view.tsx` | presentation layer |
| src/views | `src/views/education.module.css` | `src/presentation/views/education-view.module.css` | component/CSS pair with the same stem (`about-view.tsx` ↔ `about-view.module.css`) |
| src/views | `src/views/filomena-view.tsx` | `src/presentation/views/filomena-view.tsx` | presentation layer |
| src/views | `src/views/hero-view.tsx` | `src/presentation/views/home/home-hero-section.tsx` | it is a section of Home, not a page; avoids a collision with the hero feature |
| src/views | `src/views/hero.module.css` | `src/presentation/views/home/home-hero-section.module.css` | CSS Module with the same name as its component |
| src/views | `src/views/home-view.tsx` | `src/presentation/views/home/home-view.tsx` | one folder per page when there is >1 file |
| src/views | `src/views/home.module.css` | `src/presentation/views/home/home-view.module.css` | component/CSS pair with the same stem |
| src/views | `src/views/metadata.ts` | `src/presentation/seo/page-metadata.ts` | SEO/Metadata is not a view; explicit name |
| src/views | `src/views/not-found-view.tsx` | `src/presentation/views/not-found-view.tsx` | presentation layer |
| src/views | `src/views/not-found.module.css` | `src/presentation/views/not-found-view.module.css` | component/CSS pair with the same stem (`about-view.tsx` ↔ `about-view.module.css`) |
| src/views | `src/views/pequeverso-view.tsx` | `src/presentation/views/pequeverso-view.tsx` | presentation layer |
| src/views | `src/views/profile-json-ld.tsx` | `src/presentation/seo/profile-json-ld.tsx` | groups SEO with metadata |
| src/views | `src/views/stack-view.tsx` | `src/presentation/views/stack-view.tsx` | presentation layer |
| src/views | `src/views/stack.module.css` | `src/presentation/views/stack-view.module.css` | component/CSS pair with the same stem (`about-view.tsx` ↔ `about-view.module.css`) |
| src/views | `src/views/work-view.tsx` | `src/presentation/views/work-view.tsx` | presentation layer |
| src/views | `src/views/work.module.css` | `src/presentation/views/work-view.module.css` | component/CSS pair with the same stem (`about-view.tsx` ↔ `about-view.module.css`) |
| src/shell | `src/shell/locale-switcher.module.css` | `src/presentation/shell/locale-switcher.module.css` | presentation layer |
| src/shell | `src/shell/locale-switcher.tsx` | `src/presentation/shell/locale-switcher.tsx` | presentation layer |
| src/shell | `src/shell/page-motion.tsx` | `src/presentation/shell/page-motion.tsx` | presentation layer |
| src/shell | `src/shell/site-footer.module.css` | `src/presentation/shell/site-footer.module.css` | presentation layer |
| src/shell | `src/shell/site-footer.tsx` | `src/presentation/shell/site-footer.tsx` | presentation layer |
| src/shell | `src/shell/site-header.module.css` | `src/presentation/shell/site-header.module.css` | presentation layer |
| src/shell | `src/shell/site-header.tsx` | `src/presentation/shell/site-header.tsx` | presentation layer |
| src/shell | `src/shell/theme-toggle.module.css` | `src/presentation/shell/theme-toggle.module.css` | presentation layer |
| src/shell | `src/shell/theme-toggle.tsx` | `src/presentation/shell/theme-toggle.tsx` | presentation layer |
| src/features/analytics | `src/features/analytics/adapters/exposure.ts` | `src/adapters/browser/analytics/exposure.ts` | DOM/IntersectionObserver reads = browser adapter |
| src/features/analytics | `src/features/analytics/adapters/http.ts` | `src/adapters/analytics/http-event-sink.ts` | external service adapter; named by role |
| src/features/analytics | `src/features/analytics/adapters/interactions.ts` | `src/adapters/browser/analytics/interactions.ts` | DOM/IntersectionObserver reads = browser adapter |
| src/features/analytics | `src/features/analytics/adapters/public-clicks.ts` | `src/adapters/browser/analytics/public-clicks.ts` | DOM/IntersectionObserver reads = browser adapter |
| src/features/analytics | `src/features/analytics/adapters/public-regions.ts` | `src/adapters/browser/analytics/public-regions.ts` | DOM/IntersectionObserver reads = browser adapter |
| src/features/analytics | `src/features/analytics/application/availability.ts` | `config/feature-flags.ts` | unifies the boolean parser duplicated with assistant |
| src/features/analytics | `src/features/analytics/application/exposure-dwell.ts` | `src/application/analytics/exposure-dwell.ts` | use cases |
| src/features/analytics | `src/features/analytics/application/exposure-session.ts` | `src/application/analytics/exposure-session.ts` | use cases |
| src/features/analytics | `src/features/analytics/application/measurement-budget.ts` | `src/application/analytics/measurement-budget.ts` | use cases |
| src/features/analytics | `src/features/analytics/application/page-visits.ts` | `src/application/analytics/page-visits.ts` | use cases |
| src/features/analytics | `src/features/analytics/config.ts` | `src/app/_composition/analytics-config.server.ts` | server-only composition facade |
| src/features/analytics | `src/features/analytics/domain/click-grid.ts` | `src/domain/analytics/click-grid.ts` | horizontal domain per context |
| src/features/analytics | `src/features/analytics/domain/events.ts` | `src/domain/analytics/events.ts` | horizontal domain per context |
| src/features/analytics | `src/features/analytics/domain/interactions.ts` | `src/domain/analytics/interactions.ts` | horizontal domain per context |
| src/features/analytics | `src/features/analytics/entry.tsx` | `src/app/_composition/analytics-root.tsx` | composition root in `app/` (private folder) |
| src/features/architecture-diagrams | `src/features/architecture-diagrams/domain/architecture-edge-routing.ts` | `src/domain/architecture-diagrams/edge-routing.ts` | drops the prefix that is redundant with the folder |
| src/features/architecture-diagrams | `src/features/architecture-diagrams/domain/architecture-types.ts` | `src/domain/architecture-diagrams/diagram-model.ts` | drops the prefix that is redundant with the folder |
| src/features/architecture-diagrams | `src/features/architecture-diagrams/domain/enterprise-architecture-layout.ts` | `src/domain/architecture-diagrams/enterprise-layout.ts` | drops the prefix that is redundant with the folder |
| src/features/architecture-diagrams | `src/features/architecture-diagrams/domain/filomena-architecture-layout.ts` | `src/domain/architecture-diagrams/filomena-layout.ts` | drops the prefix that is redundant with the folder |
| src/features/architecture-diagrams | `src/features/architecture-diagrams/presentation/architecture-canvas-loader.tsx` | `src/presentation/features/architecture-diagrams/architecture-canvas-loader.tsx` | presentation |
| src/features/architecture-diagrams | `src/features/architecture-diagrams/presentation/experience-architecture-canvas.tsx` | `src/presentation/features/architecture-diagrams/experience-architecture-canvas.tsx` | presentation |
| src/features/architecture-diagrams | `src/features/architecture-diagrams/presentation/experience-architecture.module.css` | `src/presentation/features/architecture-diagrams/experience-architecture.module.css` | presentation |
| src/features/architecture-diagrams | `src/features/architecture-diagrams/presentation/experience-architecture.tsx` | `src/presentation/features/architecture-diagrams/experience-architecture.tsx` | presentation |
| src/features/assistant | `src/features/assistant/adapters/api.ts` | `src/adapters/assistant-api/http-assistant-transport.ts` | assistant API adapter; named by role |
| src/features/assistant | `src/features/assistant/adapters/sse.ts` | `src/adapters/assistant-api/sse-stream-parser.ts` | assistant API adapter; named by role |
| src/features/assistant | `src/features/assistant/adapters/suggestions.ts` | `src/adapters/assistant-api/suggestions-client.ts` | assistant API adapter; named by role |
| src/features/assistant | `src/features/assistant/adapters/validate.ts` | `src/adapters/assistant-api/response-validation.ts` | assistant API adapter; named by role |
| src/features/assistant | `src/features/assistant/application/assistant.ts` | `src/application/assistant/assistant-controller.ts` | named by role (controller/use case) |
| src/features/assistant | `src/features/assistant/application/availability.ts` | `config/feature-flags.ts` | unifies the duplicated boolean parser |
| src/features/assistant | `src/features/assistant/application/ports.ts` | `src/application/assistant/ports.ts` | ports; move `AssistantError` to `src/domain/assistant/errors.ts` |
| src/features/assistant | `src/features/assistant/domain/models.ts` | `src/domain/assistant/models.ts` | domain |
| src/features/assistant | `src/features/assistant/domain/visitor-context.ts` | `src/domain/assistant/visitor-context.ts` | domain |
| src/features/assistant | `src/features/assistant/entry.tsx` | `src/app/_composition/assistant-root.tsx` | composition root |
| src/features/assistant | `src/features/assistant/presentation/assistant-host.module.css` | `src/presentation/features/assistant/assistant-host.module.css` | feature presentation |
| src/features/assistant | `src/features/assistant/presentation/assistant-host.tsx` | `src/presentation/features/assistant/assistant-host.tsx` | feature presentation |
| src/features/assistant | `src/features/assistant/presentation/assistant-loading.tsx` | `src/presentation/features/assistant/assistant-loading.tsx` | feature presentation |
| src/features/assistant | `src/features/assistant/presentation/chat-message.tsx` | `src/presentation/features/assistant/chat-message.tsx` | feature presentation |
| src/features/assistant | `src/features/assistant/presentation/chat.module.css` | `src/presentation/features/assistant/chat.module.css` | feature presentation |
| src/features/assistant | `src/features/assistant/presentation/chat.tsx` | `src/presentation/features/assistant/chat.tsx` | feature presentation |
| src/features/assistant | `src/features/assistant/presentation/copy-answer.tsx` | `src/presentation/features/assistant/copy-answer.tsx` | feature presentation |
| src/features/assistant | `src/features/assistant/presentation/copy.ts` | `src/presentation/features/assistant/assistant-copy.ts` | feature presentation |
| src/features/assistant | `src/features/assistant/presentation/identity-avatar.module.css` | `src/presentation/features/assistant/identity-avatar.module.css` | feature presentation |
| src/features/assistant | `src/features/assistant/presentation/identity-avatar.tsx` | `src/presentation/features/assistant/identity-avatar.tsx` | feature presentation |
| src/features/assistant | `src/features/assistant/presentation/presentation.ts` | `src/presentation/features/assistant/assistant-presentation.types.ts` | feature presentation |
| src/features/assistant | `src/features/assistant/presentation/styles.ts` | (remove after migrating chat.module.css to camelCase) | `cx()` loses CSS Modules type safety |
| src/features/assistant | `src/features/assistant/presentation/use-chat.ts` | `src/presentation/features/assistant/use-chat.ts` | feature presentation |
| src/features/hero | `src/features/hero/adapters/field-engine.ts` | `src/adapters/rendering/hero/field-engine.ts` | Three.js/GSAP = framework/driver ring |
| src/features/hero | `src/features/hero/adapters/scene-runtime.ts` | `src/adapters/rendering/hero/scene-runtime.ts` | Three.js/GSAP = framework/driver ring |
| src/features/hero | `src/features/hero/domain/cloud-layout.ts` | `src/domain/hero-scene/cloud-layout.ts` | domain |
| src/features/hero | `src/features/hero/domain/constellation.ts` | `src/domain/hero-scene/constellation.ts` | domain |
| src/features/hero | `src/features/hero/domain/scene-technologies.ts` | `src/domain/hero-scene/scene-technologies.ts` | domain |
| src/features/hero | `src/features/hero/presentation/hero-stage.module.css` | `src/presentation/features/hero/hero-stage.module.css` | presentation |
| src/features/hero | `src/features/hero/presentation/hero-stage.tsx` | `src/presentation/features/hero/hero-stage.tsx` | presentation |
| src/features/hero | `src/features/hero/presentation/static-constellation.module.css` | `src/presentation/features/hero/static-constellation.module.css` | presentation |
| src/features/hero | `src/features/hero/presentation/static-constellation.tsx` | `src/presentation/features/hero/static-constellation.tsx` | presentation |
| src/features/hero | `src/features/hero/presentation/tech-constellation.module.css` | `src/presentation/features/hero/tech-constellation.module.css` | presentation |
| src/features/hero | `src/features/hero/presentation/tech-constellation.tsx` | `src/presentation/features/hero/tech-constellation.tsx` | presentation |
| src/features/project-gallery | `src/features/project-gallery/presentation/gallery-carousel.module.css` | `src/presentation/features/project-gallery/gallery-carousel.module.css` | presentation |
| src/features/project-gallery | `src/features/project-gallery/presentation/gallery-carousel.tsx` | `src/presentation/features/project-gallery/gallery-carousel.tsx` | presentation |
| src/features/solar-system | `src/features/solar-system/adapters/solar-system-bodies.ts` | `src/adapters/rendering/solar-system/bodies.ts` | renderer = driver ring; drops the redundant prefix |
| src/features/solar-system | `src/features/solar-system/adapters/solar-system-engine.ts` | `src/adapters/rendering/solar-system/engine.ts` | renderer = driver ring; drops the redundant prefix |
| src/features/solar-system | `src/features/solar-system/adapters/solar-system-quality.ts` | `src/adapters/rendering/solar-system/quality.ts` | renderer = driver ring; drops the redundant prefix |
| src/features/solar-system | `src/features/solar-system/adapters/solar-system-reading.ts` | `src/adapters/rendering/solar-system/reading.ts` | renderer = driver ring; drops the redundant prefix |
| src/features/solar-system | `src/features/solar-system/adapters/solar-system-resources.ts` | `src/adapters/rendering/solar-system/resources.ts` | renderer = driver ring; drops the redundant prefix |
| src/features/solar-system | `src/features/solar-system/adapters/solar-system-shaders.ts` | `src/adapters/rendering/solar-system/shaders.ts` | renderer = driver ring; drops the redundant prefix |
| src/features/solar-system | `src/features/solar-system/adapters/solar-system-sky.ts` | `src/adapters/rendering/solar-system/sky.ts` | renderer = driver ring; drops the redundant prefix |
| src/features/solar-system | `src/features/solar-system/adapters/solar-system-textures.ts` | `src/adapters/rendering/solar-system/textures.ts` | renderer = driver ring; drops the redundant prefix |
| src/features/solar-system | `src/features/solar-system/adapters/texture-versions.ts` | `src/adapters/rendering/solar-system/texture-versions.ts` | renderer = driver ring; drops the redundant prefix |
| src/features/solar-system | `src/features/solar-system/domain/solar-system-scene.ts` | `src/domain/solar-system/scene-model.ts` | drops the redundant prefix |
| src/features/solar-system | `src/features/solar-system/domain/texture-contract.ts` | `src/domain/solar-system/texture-contract.ts` | drops the redundant prefix |
| src/features/solar-system | `src/features/solar-system/presentation/ambient-field.module.css` | `src/presentation/features/solar-system/ambient-field.module.css` | presentation |
| src/features/solar-system | `src/features/solar-system/presentation/ambient-field.tsx` | `src/presentation/features/solar-system/ambient-field.tsx` | presentation |
| src/features/solar-system | `src/features/solar-system/presentation/solar-explorer-state.ts` | `src/presentation/features/solar-system/solar-explorer-store.ts` | external store + hook: `-store` suffix |
| src/features/solar-system | `src/features/solar-system/presentation/solar-explorer.module.css` | `src/presentation/features/solar-system/solar-explorer.module.css` | presentation |
| src/features/solar-system | `src/features/solar-system/presentation/solar-explorer.tsx` | `src/presentation/features/solar-system/solar-explorer.tsx` | presentation |
| src/features/solar-system | `src/features/solar-system/presentation/solar-system.module.css` | `src/presentation/features/solar-system/solar-system.module.css` | presentation |
| src/features/solar-system | `src/features/solar-system/presentation/solar-system.tsx` | `src/presentation/features/solar-system/solar-system.tsx` | presentation |
| src/features/solar-system | `src/features/solar-system/texture-data.ts` | `src/app/_composition/solar-texture-versions.server.ts` | server-only composition facade |
| src/features/technology-catalogue | `src/features/technology-catalogue/domain/query.ts` | `src/domain/technology/catalog-query.ts` | US English `catalog`; specific name |
| src/features/technology-catalogue | `src/features/technology-catalogue/presentation/technology-catalogue.module.css` | `src/presentation/features/technology-catalog/technology-catalog.module.css` | US English `catalog` |
| src/features/technology-catalogue | `src/features/technology-catalogue/presentation/technology-catalogue.tsx` | `src/presentation/features/technology-catalog/technology-catalog.tsx` | US English `catalog` |
| src/features/tool-carousel | `src/features/tool-carousel/domain/rows.ts` | `src/domain/technology/carousel-rows.ts` | rule of the technology context |
| src/features/tool-carousel | `src/features/tool-carousel/presentation/tool-carousel-client.tsx` | `src/presentation/features/tool-carousel/tool-carousel-client.tsx` | presentation |
| src/features/tool-carousel | `src/features/tool-carousel/presentation/tool-carousel.module.css` | `src/presentation/features/tool-carousel/tool-carousel.module.css` | presentation |
| src/features/tool-carousel | `src/features/tool-carousel/presentation/tool-carousel.tsx` | `src/presentation/features/tool-carousel/tool-carousel.tsx` | presentation |
| src/shared/contact | `src/shared/contact/contact-links.module.css` | `src/presentation/components/contact/contact-links.module.css` | shared presentation components |
| src/shared/contact | `src/shared/contact/contact-links.tsx` | `src/presentation/components/contact/contact-links.tsx` | shared presentation components |
| src/shared/editorial | `src/shared/editorial/metric-list.tsx` | `src/presentation/components/editorial/metric-list.tsx` | shared presentation components |
| src/shared/editorial | `src/shared/editorial/page-header.module.css` | `src/presentation/components/editorial/page-header.module.css` | shared presentation components |
| src/shared/editorial | `src/shared/editorial/page-header.tsx` | `src/presentation/components/editorial/page-header.tsx` | shared presentation components |
| src/shared/editorial | `src/shared/editorial/production-badge.module.css` | `src/presentation/components/editorial/production-badge.module.css` | shared presentation components |
| src/shared/editorial | `src/shared/editorial/production-badge.tsx` | `src/presentation/components/editorial/production-badge.tsx` | shared presentation components |
| src/shared/identity | `src/shared/identity/brand-mark.module.css` | `src/presentation/components/identity/brand-mark.module.css` | shared presentation components |
| src/shared/identity | `src/shared/identity/brand-mark.tsx` | `src/presentation/components/identity/brand-mark.tsx` | shared presentation components |
| src/shared/identity | `src/shared/identity/company-mark.module.css` | `src/presentation/components/identity/company-mark.module.css` | shared presentation components |
| src/shared/identity | `src/shared/identity/company-mark.tsx` | `src/presentation/components/identity/company-mark.tsx` | shared presentation components |
| src/shared/identity | `src/shared/identity/mark.tsx` | `src/presentation/components/identity/mark.tsx` | shared presentation components |
| src/shared/motion | `src/shared/motion/motion-state.ts` | `src/presentation/motion/page-motion-store.ts` | external store + hook: `-store` suffix |
| src/shared/navigation | `src/shared/navigation/external-link.tsx` | `src/presentation/components/navigation/external-link.tsx` | shared presentation components |
| src/shared/styles | `src/shared/styles/cn.ts` | `src/presentation/design-system/cn.ts` | design system utility |
| src/shared/technology | `src/shared/technology/technology-illustrations.ts` | `src/presentation/components/technology/technology-illustrations.ts` | shared presentation components |
| src/shared/technology | `src/shared/technology/technology-mark.module.css` | `src/presentation/components/technology/technology-mark.module.css` | shared presentation components |
| src/shared/technology | `src/shared/technology/technology-mark.tsx` | `src/presentation/components/technology/technology-mark.tsx` | shared presentation components |
| src/shared/ui | `src/shared/ui/badge.tsx` | `src/presentation/design-system/ui/badge.tsx` | shadcn primitives = design system; `ui` alias in components.json |
| src/shared/ui | `src/shared/ui/button.tsx` | `src/presentation/design-system/ui/button.tsx` | shadcn primitives = design system; `ui` alias in components.json |
| src/shared/ui | `src/shared/ui/card.tsx` | `src/presentation/design-system/ui/card.tsx` | shadcn primitives = design system; `ui` alias in components.json |
| src/shared/ui | `src/shared/ui/dialog.tsx` | `src/presentation/design-system/ui/dialog.tsx` | shadcn primitives = design system; `ui` alias in components.json |
| src/shared/ui | `src/shared/ui/input.tsx` | `src/presentation/design-system/ui/input.tsx` | shadcn primitives = design system; `ui` alias in components.json |
| src/shared/ui | `src/shared/ui/label.tsx` | `src/presentation/design-system/ui/label.tsx` | shadcn primitives = design system; `ui` alias in components.json |
| src/shared/ui | `src/shared/ui/native-select.tsx` | `src/presentation/design-system/ui/native-select.tsx` | shadcn primitives = design system; `ui` alias in components.json |
| src/shared/ui | `src/shared/ui/skeleton.tsx` | `src/presentation/design-system/ui/skeleton.tsx` | shadcn primitives = design system; `ui` alias in components.json |
| content | `content/about-copy.ts` | `src/domain/content/about-copy.types.ts` | types-only file |
| content | `content/academic-catalogue.ts` | `content/academic/curriculum.ts; helpers → src/domain/content/academic.ts` | US English; separates data/rules; use `Locale` from config |
| content | `content/chrome.ts` | `content/en/chrome.ts + content/es/chrome.ts` | one locale pattern (folders) and a single source; type moves to `src/domain/content/chrome-copy.types.ts` |
| content | `content/en/stack.ts` | (remove; derive in src/application/content) | logic, not data |
| content | `content/es/stack.ts` | (remove; derive in src/application/content) | logic, not data |
| content | `content/experience-facts.ts` | `src/application/content/get-experience-facts.ts` | projection read = use case; add a test |
| content | `content/filomena-gallery.ts` | `content/galleries/filomena.ts` | groups galleries |
| content | `content/filomena-image-dimensions.json` | `content/galleries/filomena.dimensions.json` | paired with its gallery |
| content | `content/index.ts` | `src/application/content/get-content.server.ts` | per-locale registry = server-only use case |
| content | `content/pequeverso-gallery.ts` | `content/galleries/pequeverso.ts` | groups galleries |
| content | `content/pequeverso-image-dimensions.json` | `content/galleries/pequeverso.dimensions.json` | paired with its gallery |
| content | `content/privacy.ts` | `content/en/privacy.ts + content/es/privacy.ts` | one locale pattern |
| content | `content/site-copy.ts` | `src/domain/content/site-copy.types.ts` | copy contract; remove the duplicated `chrome` block |
| content | `content/tech-marks.ts` | `src/domain/technology/tech-marks.ts` | derivation = domain rule |
| content | `content/technologies.ts` | `content/technologies/catalog.ts (+ groups.ts, exclusions.ts); functions → src/domain/technology/catalog.ts` | separates data from rules; 2.7k lines |
| content | `content/tool-carousel-copy.ts` | `content/en/tool-carousel.ts + content/es/tool-carousel.ts` | one locale pattern |
| content | `content/types.ts` | `src/domain/content/profile.types.ts` | domain types out of the data root |
| tools | `tools/analytics-live-receipt.ts` | `tools/analytics/live-receipt.ts` | groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/api-contract/package-lock.json` | `tools/contracts/api-contract/package-lock.json` | groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/api-contract/package.json` | `tools/contracts/api-contract/package.json` | groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/architecture-policy.mjs` | `tools/architecture/architecture-policy.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/architecture.mjs` | `tools/architecture/check-architecture.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/assistant-budget-plugin.ts` | `tools/build/assistant-budget-plugin.ts` | groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/assistant-fixture-json.ts` | `tools/test-servers/assistant-fixture-json.ts` | groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/browser-ci-planner.mjs` | `tools/ci/browser-ci-planner.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/browser-ci-timings.json` | `tools/ci/browser-ci-timings.json` | groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/browser-test-server.ts` | `tools/test-servers/browser-test-server.ts` | groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/capture-gallery.mjs` | `tools/assets/capture-gallery.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/check-assistant-contract.mjs` | `tools/contracts/check-assistant-contract.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/check-browser-runtime.mjs` | `tools/ci/check-browser-runtime.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/ci-build-artifact.mjs` | `tools/ci/build-artifact.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/ci-build-provenance.mjs` | `tools/ci/build-provenance.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/dependency-policy.mjs` | `tools/dependencies/dependency-policy.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/documents.ts` | `tools/content/verify-documents.ts` | groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/export-cv.mjs` | `tools/content/export-cv.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/generate-identity.mjs` | `tools/assets/generate-identity.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/nightly-candidate.mjs` | `tools/ci/nightly-candidate.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/scene-budget-plugin.mjs` | `tools/build/scene-budget-plugin.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/secret-scan.mjs` | `tools/security/secret-scan.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/smoke-test.mjs` | `tools/ci/smoke-test.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/technology-illustrations.mjs` | `tools/assets/technology-illustrations.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/test-server.mjs` | `tools/test-servers/test-server.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/test-site.mjs` | `tools/test-servers/test-site.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tools | `tools/workflow-policy.mjs` | `tools/ci/workflow-policy.ts` | JS→TS; groups tools by responsibility (CI, security, content, assets, contracts, build) |
| tests/browser | `tests/browser/capture.ts` | `tests/helpers/browser/capture.ts` | non-spec helpers go in tests/helpers (ADR) |
| tests/browser | `tests/browser/document-visibility.ts` | `tests/helpers/browser/document-visibility.ts` | non-spec helpers go in tests/helpers (ADR) |
| tests/browser | `tests/browser/lab.spec.ts` | `tools/analytics/... o tests/browser/lab.spec.ts con tag `@lab` excluido` | observation, not an assertion |
| tests/browser | `tests/browser/shadcn-controls.spec.ts` | `tests/browser/form-controls.spec.ts` | name by behavior, not by library |
| tests/browser | `tests/browser/touch-sequence.ts` | `tests/helpers/browser/touch-sequence.ts` | non-spec helpers go in tests/helpers (ADR) |
| tests/integration | `tests/integration/budget.test.mjs` | `tests/integration/budget.test.ts` | JS→TS |
| tests/integration | `tests/integration/native-api.ts` | `tests/helpers/native-api.ts` | helper, not a test |
| tests/integration | `tests/integration/rendered.test.mjs` | `tests/integration/rendered.test.ts` | JS→TS |
| tests/unit | `tests/unit/academic.test.mjs` | `tests/unit/content/academic.test.ts` | JS→TS; mirrors the context of the module under test |
| tests/unit | `tests/unit/analytics-availability.test.ts` | `tests/unit/analytics/availability.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/analytics-click-grid.test.ts` | `tests/unit/analytics/click-grid.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/analytics-contract.test.ts` | `tests/unit/analytics/contract.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/analytics-events.test.ts` | `tests/unit/analytics/events.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/analytics-exposure-adapter.test.ts` | `tests/unit/analytics/exposure-adapter.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/analytics-exposure-dwell.test.ts` | `tests/unit/analytics/exposure-dwell.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/analytics-exposure-session.test.ts` | `tests/unit/analytics/exposure-session.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/analytics-http.test.ts` | `tests/unit/analytics/http.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/analytics-interactions.test.ts` | `tests/unit/analytics/interactions.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/analytics-live-receipt.test.ts` | `tests/unit/analytics/live-receipt.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/analytics-measurement-budget.test.ts` | `tests/unit/analytics/measurement-budget.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/analytics-page-visits.test.ts` | `tests/unit/analytics/page-visits.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/architecture-diagrams.test.ts` | `tests/unit/domain/architecture-diagrams/architecture-diagrams.test.ts` | mirrors the context of the module under test |
| tests/unit | `tests/unit/architecture.test.mjs` | `tests/unit/tools/architecture.test.ts` | JS→TS; tooling tests separated from product tests |
| tests/unit | `tests/unit/assistant-availability.test.ts` | `tests/unit/assistant/availability.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/assistant-boundaries.test.ts` | `tests/unit/assistant/boundaries.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/assistant-budget.test.ts` | `tests/unit/assistant/budget.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/assistant-context.test.ts` | `tests/unit/assistant/context.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/assistant-motion.test.ts` | `tests/unit/assistant/motion.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/assistant-network.test.ts` | `tests/unit/assistant/network.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/assistant-sse.test.ts` | `tests/unit/assistant/sse.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/assistant-state.test.ts` | `tests/unit/assistant/state.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/assistant-transport.test.ts` | `tests/unit/assistant/transport.test.ts` | subfolder per context instead of a prefix |
| tests/unit | `tests/unit/browser-ci-planner.test.mjs` | `tests/unit/tools/browser-ci-planner.test.ts` | JS→TS; tooling tests separated from product tests |
| tests/unit | `tests/unit/catalogue.test.mjs` | `tests/unit/content/catalog.test.ts` | JS→TS; mirrors the context of the module under test |
| tests/unit | `tests/unit/ci-build-artifact.test.mjs` | `tests/unit/tools/ci-build-artifact.test.ts` | JS→TS; tooling tests separated from product tests |
| tests/unit | `tests/unit/ci-build-provenance.test.mjs` | `tests/unit/tools/ci-build-provenance.test.ts` | JS→TS; tooling tests separated from product tests |
| tests/unit | `tests/unit/cloud-layout.test.mjs` | `tests/unit/domain/hero-scene/cloud-layout.test.ts` | JS→TS; mirrors the context of the module under test |
| tests/unit | `tests/unit/content-migration.test.mjs` | `tests/unit/content/content-migration.test.ts` | JS→TS; mirrors the context of the module under test |
| tests/unit | `tests/unit/content.test.mjs` | `tests/unit/content/content.test.ts` | JS→TS; mirrors the context of the module under test |
| tests/unit | `tests/unit/cv-export.test.mjs` | `tests/unit/tools/cv-export.test.ts` | JS→TS; mirrors the context of the module under test |
| tests/unit | `tests/unit/dependency-policy.test.mjs` | `tests/unit/tools/dependency-policy.test.ts` | JS→TS; tooling tests separated from product tests |
| tests/unit | `tests/unit/nightly-candidate.test.mjs` | `tests/unit/tools/nightly-candidate.test.ts` | JS→TS; tooling tests separated from product tests |
| tests/unit | `tests/unit/repository.test.mjs` | `tests/unit/tools/repository.test.ts` | JS→TS; tooling tests separated from product tests |
| tests/unit | `tests/unit/scene-budget.test.mjs` | `tests/unit/tools/scene-budget.test.ts` | JS→TS; tooling tests separated from product tests |
| tests/unit | `tests/unit/secret-scan.test.mjs` | `tests/unit/tools/secret-scan.test.ts` | JS→TS; tooling tests separated from product tests |
| tests/unit | `tests/unit/technology-models.test.ts` | `tests/unit/domain/technology/technology-models.test.ts` | mirrors the context of the module under test |
| tests/unit | `tests/unit/workflow-policy.test.mjs` | `tests/unit/tools/workflow-policy.test.ts` | JS→TS; tooling tests separated from product tests |
| docs | `docs/architecture.md` | `docs/explanation/architecture.md + docs/reference/module-contract.md` | Diátaxis: the why vs. the lookup rule |
| docs | `docs/code-quality.md` | `docs/reference/coding-standards.md` | merges with the TS standard of §3 |
| docs | `docs/dependency-updates.md` | `docs/how-to/review-dependency-updates.md` | how-to |
| docs | `docs/deployment.md` | `docs/how-to/deploy-to-hostinger.md` | how-to |
| docs | `docs/design.md` | `docs/explanation/design-system.md` | explanation |
| docs | `docs/development.md` | `docs/tutorials/getting-started.md + docs/how-to/verify-a-change.md + docs/how-to/work-with-parallel-agents.md + docs/reference/commands.md + docs/reference/ci-workflows.md` | 415 lines mix all 4 modes |
| docs | `docs/editorial-guidelines.md` | `docs/reference/editorial-guidelines.md` | reference |
| docs | `docs/engineering-standards.md` | `docs/explanation/engineering-governance.md (ownership) + docs/reference/coding-standards.md (rules)` | separates governance from rules |
| docs | `docs/linkedin-branding.md` | `docs/reference/asset-provenance/linkedin-branding.md` | it is asset provenance |
| docs | `docs/native-assistant.md` | `docs/explanation/native-assistant.md + docs/how-to/run-assistant-locally.md` | separates concept from procedure |
| docs | `docs/public-content.md` | `docs/how-to/publish-public-cv.md + docs/reference/public-documents.md` | how-to + reference |
| docs | `docs/release-history.md` | `CHANGELOG.md (root) + docs/explanation/release-history.md` | Keep a Changelog; preserve historical anchors |
| docs | `docs/skill-discovery.md` | `docs/reference/agent-skills.md` | reference |
| docs | `docs/technology.md` | `docs/explanation/technology-choices.md` | explanation |
| docs/adr | `docs/adr/site-architecture-parity.md` | `docs/decisions/0001-shared-physical-site-architecture.md` | MADR: numbering + `decisions` folder |
| docs/assets | `docs/assets/company-marks.md` | `docs/reference/asset-provenance/company-marks.md` | asset provenance reference |
| docs/assets | `docs/assets/credential-marks.md` | `docs/reference/asset-provenance/credential-marks.md` | asset provenance reference |
| docs/assets | `docs/assets/profile-images.md` | `docs/reference/asset-provenance/profile-images.md` | asset provenance reference |
| docs/assets | `docs/assets/shadcn-ui.md` | `docs/reference/asset-provenance/shadcn-ui.md` | asset provenance reference |
| docs/assets | `docs/assets/solar-system.md` | `docs/reference/asset-provenance/solar-system.md` | asset provenance reference |
| docs/assets | `docs/assets/technology-marks.md` | `docs/reference/asset-provenance/technology-marks.md` | asset provenance reference |
| docs/diagrams | `docs/diagrams/architecture-overview-dark.svg` | `docs/diagrams/c4-context-dark.svg` | explicit C4 naming per level/view |
| docs/diagrams | `docs/diagrams/architecture-overview-light.svg` | `docs/diagrams/c4-context-light.svg` | explicit C4 naming per level/view |
| docs/diagrams | `docs/diagrams/architecture-overview.mmd` | `docs/diagrams/c4-context.mmd` | explicit C4 naming per level/view |
| docs/diagrams | `docs/diagrams/delivery-flow-dark.svg` | `docs/diagrams/delivery-pipeline-dark.svg` | explicit C4 naming per level/view |
| docs/diagrams | `docs/diagrams/delivery-flow-light.svg` | `docs/diagrams/delivery-pipeline-light.svg` | explicit C4 naming per level/view |
| docs/diagrams | `docs/diagrams/delivery-flow.mmd` | `docs/diagrams/delivery-pipeline.mmd` | explicit C4 naming per level/view |
| docs/diagrams | `docs/diagrams/solar-rendering-dark.svg` | `docs/diagrams/solar-rendering-pipeline-dark.svg` | explicit C4 naming per level/view |
| docs/diagrams | `docs/diagrams/solar-rendering-light.svg` | `docs/diagrams/solar-rendering-pipeline-light.svg` | explicit C4 naming per level/view |
| docs/diagrams | `docs/diagrams/solar-rendering.mmd` | `docs/diagrams/solar-rendering-pipeline.mmd` | explicit C4 naming per level/view |
| docs/research | `docs/research/ci-efficiency.md` | `docs/explanation/research/YYYY-MM-DD-ci-efficiency.md` | add the review date to the name (consistency) |
| docs/research | `docs/research/clean-architecture.md` | `docs/explanation/research/YYYY-MM-DD-clean-architecture.md` | add the review date to the name (consistency) |
| docs/research | `docs/research/dependency-review-2026-10-18.md` | `docs/explanation/research/2026-10-18-dependency-review.md` | date as a sortable prefix |
| docs/research | `docs/research/engineering-profile-2026-10-10.md` | `docs/explanation/research/2026-10-10-engineering-profile.md` | date as a sortable prefix |
| docs/research | `docs/research/motion-performance.md` | `docs/explanation/research/YYYY-MM-DD-motion-performance.md` | add the review date to the name (consistency) |
| docs/research | `docs/research/portfolio-2026-09-12.md` | `docs/explanation/research/2026-09-12-portfolio.md` | date as a sortable prefix |
| docs/research | `docs/research/recruiter-journey-2026-09-19.md` | `docs/explanation/research/2026-09-19-recruiter-journey.md` | date as a sortable prefix |
| docs/research | `docs/research/toolchain-2026-10-17.md` | `docs/explanation/research/2026-10-17-toolchain.md` | date as a sortable prefix |
| docs/specs | `docs/specs/template.md` | `docs/specs/_template.md` | the `_` prefix separates it from real specs |
| docs/verification | `docs/verification/native-assistant/avatar-depth.png` | `docs/verification/assets/native-assistant/avatar-depth.png` | binary evidence under assets/<spec> |
| docs/verification | `docs/verification/native-assistant/before-iframe-conversation.png` | `docs/verification/assets/native-assistant/before-iframe-conversation.png` | binary evidence under assets/<spec> |
| docs/verification | `docs/verification/native-assistant/compact-dark-en.png` | `docs/verification/assets/native-assistant/compact-dark-en.png` | binary evidence under assets/<spec> |
| docs/verification | `docs/verification/native-assistant/disabled-desktop.png` | `docs/verification/assets/native-assistant/disabled-desktop.png` | binary evidence under assets/<spec> |
| docs/verification | `docs/verification/native-assistant/disabled-mobile.png` | `docs/verification/assets/native-assistant/disabled-mobile.png` | binary evidence under assets/<spec> |
| docs/verification | `docs/verification/native-assistant/expanded-dark-en.png` | `docs/verification/assets/native-assistant/expanded-dark-en.png` | binary evidence under assets/<spec> |
| docs/verification | `docs/verification/native-assistant/mobile-light-es.png` | `docs/verification/assets/native-assistant/mobile-light-es.png` | binary evidence under assets/<spec> |
| docs/verification | `docs/verification/native-assistant/page-dark-en.png` | `docs/verification/assets/native-assistant/page-dark-en.png` | binary evidence under assets/<spec> |
| docs/verification | `docs/verification/site-layout-cutover.json` | `docs/verification/assets/common-site-layout/cutover.json` | paired with its spec |
| root | `next.config.mjs` | `next.config.ts` | TS-everywhere; Next.js supports `next.config.ts` (typed `NextConfig`), removes `@ts-check` |
| root | `tsconfig.assistant.json` | (remove; flags promoted to tsconfig.json) | uniform strictness |

---

## 3. Coding standards

### 3.1 Source comparison

| Topic | Google TS Style Guide (+ `gts`) | Microsoft (TS wiki *Coding guidelines*, Handbook *Do's and Don'ts*, Engineering Playbook) | Repo today (`biome.json`, `docs/code-quality.md`, `docs/engineering-standards.md`) |
|---|---|---|---|
| Scope | Complete style guide for TS at Google; `gts` = ESLint + Prettier + tsconfig preset | The wiki **states it is for compiler contributors**, not a community guide; the Handbook gives type rules; the Playbook recommends ESLint + Prettier | Local policy; Biome `recommended`; "do not import a guide's ban on default exports" |
| Formatting | Automatic formatter (internal clang-format / Prettier in `gts`) | 4 spaces in the compiler; Playbook: Prettier | Biome formatter, 2 spaces, 100 cols — **keep** |
| File names | Lowercase with `_` or `-` (inherited from the JS guide); snake_case examples | No community rule | kebab-case (690/726) |
| Identifiers | `UpperCamelCase` types/classes/components; `lowerCamelCase` functions/variables; `CONSTANT_CASE` deeply immutable module constants; no `I` prefix; no `_` | PascalCase types, camelCase members, no `I`, no `_` for private | The same in practice (not enforced) |
| Exports | **Named exports only**; no `export default`; no mutable `export let` | — | Named except Next file conventions and 3 lazy chunks |
| Imports | `import type` for types; relative paths within the project; no `require` | — | Biome organizeImports; mixes aliases/relative/extensions |
| `interface` vs `type` | Prefer `interface` for object types | Handbook neutral | 73 `type` vs. 2 `interface` (ports) |
| `enum`/`namespace` | `namespace` prohibited; `enum` allowed (no `const enum`) | — | 0 uses |
| `any` | Avoid; prefer `unknown` | Handbook: do not use `any`, no boxed types (`String`, `Number`), `void` callbacks | 0 uses |
| null/undefined | Both acceptable if used consistently | Wiki: use `undefined` | Mixed (not enforced) |
| Classes | No `#private`, use `private`; parameter properties allowed | — | 1 class; `erasableSyntaxOnly` would prohibit parameter properties |
| Comments | `/** */` JSDoc for docs; do not repeat types in JSDoc; `//` for implementation | Playbook: document intent and contracts | Detailed and good policy (`code-quality.md`) |
| Tests | Out of the guide's scope | Playbook: behavior tests | node:test + Playwright, names by behavior |

### 3.2 Recommendation: baseline + deviations

**Baseline: Google TypeScript Style Guide** — it is the most complete public guide and gives a rationale per rule; Microsoft does not publish a community style guide (the wiki says so explicitly) and its Handbook is adopted as a complement for type rules. **Do not adopt `gts`**: it introduces ESLint + Prettier, which duplicates Biome (already rejected in `docs/research/clean-architecture.md`). Biome + `tsc` + the architecture guard are the enforcers.

Repo assumption: **all TypeScript** (`.ts`/`.tsx`; the only exception is `postcss.config.mjs`).

| # | Topic | Repo rule | Deviation vs. Google | Enforcement |
|---|---|---|---|---|
| 1 | File naming | **kebab-case for all files**, including components (`site-header.tsx` exports `SiteHeader`). Role suffixes: `.module.css`, `.test.ts`, `.spec.ts`, `.types.ts` (types only), `.server.ts` (server-only facade), `-store.ts` (external store), `use-*.ts` (hooks). No prefix redundant with the folder. US English (`catalog`). | Yes: Google uses snake_case; Next.js, shadcn/ui and the repo use kebab-case | Biome `style/useFilenamingConvention` (`filenameCases: ["kebab-case"]`, `requireAscii: true`) with an override for Next file conventions (`[locale]`, `_composition`, `page.tsx`…) and dotted configs; repository test for suffixes/redundant prefixes and `catalogue` |
| 2 | Language | `.ts`/`.tsx` only; `allowJs: false`; erasable syntax (no `enum`, `namespace`, parameter properties) so Node can run tools/tests without a build | Stricter (Google allows `enum`) | `tsconfig`: `erasableSyntaxOnly`, `allowJs: false`; Biome `style/noEnum`, `style/noNamespace`, `style/noParameterProperties`, `style/noCommonJs`; guard: rejects `.js/.mjs/.cjs/.jsx` except the `postcss.config.mjs` allowlist |
| 3 | Exports | Named exports. `export default` **only** in Next file conventions (`page`, `layout`, `not-found`, `robots`, `sitemap`, `icon`…) and config files (`next.config.ts`, `playwright.*.config.ts`). Lazy chunks use `next/dynamic(() => import(…).then((m) => m.Chat))` | Yes, minimal (framework) | Biome `style/noDefaultExport` + `overrides` for `src/app/**` and configs |
| 4 | React components | Function components `export function PascalName(props: PascalNameProps)`; props as `type XxxProps` next to the component; Server Component by default; `"use client"` only at the smallest entry; one public component per file (private subcomponents allowed) | Google does not cover React | Guard (client closure), review |
| 5 | Hooks | `useXxx` in `use-xxx.ts`; external stores (`useSyncExternalStore`) in `xxx-store.ts` exporting `useXxx` + setters | — ([React hook naming](https://react.dev/learn/reusing-logic-with-custom-hooks#hook-names-always-start-with-use)) | Biome `correctness/useHookAtTopLevel`, `correctness/useExhaustiveDependencies` (recommended); naming test |
| 6 | `type` vs `interface` | `type` for data, props and unions; `interface` only for **ports** that adapters implement (`application/**/ports.ts`) | Yes: Google prefers `interface` | Review + simple test (interfaces only in `ports.ts`); use `style/useConsistentTypeDefinitions` (`"type"`) with an override in `ports.ts` if available in Biome 2.5.15 (verify with `npx biome explain`) |
| 7 | Imports | Order by Biome organizeImports (`node:` builtins → packages → `#aliases` → relative). `import type` required. Relative imports **with extension** `.ts/.tsx`; cross-root via subpath imports `#domain/*`… (never `../../..` outside the module). No barrels | Google does not require extensions; needed for Node type stripping | Biome `style/useImportType`, `style/useExportType`, `correctness/useImportExtensions`, `style/noRestrictedImports` (pattern `../../../*`), `style/useNodejsImportProtocol`; `tsconfig`: `verbatimModuleSyntax`, `allowImportingTsExtensions`; guard |
| 8 | CSS Modules | `component-name.module.css` with the same stem as its `.tsx`; **camelCase** classes accessed as `styles.fooBar` (no `cx()`-style string mapping); tokens in `design-system/styles/globals.css`; Tailwind utilities for shadcn primitives | — | Biome CSS (`cssModules: true`); repository test: camelCase selector regex + stem pair |
| 9 | Identifiers | Google: `UpperCamelCase` types/components, `lowerCamelCase` the rest, `CONSTANT_CASE` only for primitive module constants; units in names (`timeoutMs`); booleans `is/has/should` | None | Biome `style/useNamingConvention` (with `conventions` to allow snake_case keys from API contracts and `CONSTANT_CASE`) |
| 10 | null/undefined | `undefined` for absence in own TS; `null` only where the API/DOM/React defines it | Explicit choice (Google accepts both; MS wiki: undefined) | `exactOptionalPropertyTypes` + review |
| 11 | Errors | `unknown` in catch; validate external input in adapters; domain errors as classes in `domain/<ctx>/errors.ts` | None | `strict` (`useUnknownInCatchVariables`); Biome `suspicious/noExplicitAny` |
| 12 | Comments / TSDoc | Keep `docs/code-quality.md`. `/** */` only for non-inferable contracts; **TSDoc** syntax (`@param name - desc`, `@returns`, `@throws`, `@remarks`, `@example`, `@deprecated`); no `{Type}` in TS; `biome-ignore` always with a justification | Aligned | Review; no doc generator or comment coverage (current decision) |
| 13 | Tests | Unit: `tests/unit/<context>/<module>.test.ts` (node:test, `describe` = module, `it/test` = behavior in present tense). Browser: `tests/browser/<journey-or-page>.spec.ts` (Playwright), named by behavior, not by library. Helpers only in `tests/helpers/`. Synthetic fixtures | — | Repository test (location/suffix); `package.json` scripts by folder glob |
| 14 | Functions | `function` declarations for top-level exports; arrow functions for callbacks; explicit return types on domain/application/adapters exports | Google accepts both | Review; optional `tsc --isolatedDeclarations` in domain/application |

### 3.3 Proposed enforcement

**`tsconfig.json` (single, replaces `tsconfig.assistant.json`):**

```jsonc
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext", "moduleResolution": "bundler", "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true, "exactOptionalPropertyTypes": true,   // today only in assistant
    "noImplicitOverride": true, "noImplicitReturns": true, "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true, "erasableSyntaxOnly": true, "isolatedModules": true,
    "allowJs": false, "allowImportingTsExtensions": true, "resolveJsonModule": true,
    "noEmit": true, "skipLibCheck": true, "incremental": true,
    "plugins": [{ "name": "next" }]
    // no "paths": package.json "imports" are used (#domain/*, #content/*, …)
  }
}
```

Promote the assistant flags in a dedicated PR (early Phase B) with fixes per context; measure the errors first with `tsc --noEmit -p` on a copy of the tsconfig.

**`biome.json` (additions on top of `recommended`, verify each rule with `npx biome explain <rule>` on 2.5.15):**

```jsonc
{
  "linter": { "rules": { "preset": "recommended",
    "style": {
      "useFilenamingConvention": { "level": "error", "options": { "filenameCases": ["kebab-case"], "requireAscii": true } },
      "noDefaultExport": "error", "useImportType": "error", "useExportType": "error",
      "noEnum": "error", "noNamespace": "error", "noParameterProperties": "error", "noCommonJs": "error",
      "useNodejsImportProtocol": "error", "noNonNullAssertion": "warn",
      "useNamingConvention": { "level": "error", "options": { "strictCase": false } },
      "noRestrictedImports": { "level": "error", "options": { "patterns": [{ "group": ["../../../*"], "message": "Use #subpath imports across roots." }] } }
    },
    "correctness": { "useImportExtensions": "error", "noUnusedImports": "error", "noUnusedVariables": "error" },
    "complexity": { "noExcessiveCognitiveComplexity": "warn" },
    "suspicious": { "noConsole": "error" }
  }},
  "overrides": [
    { "includes": ["src/app/**", "*.config.ts", "playwright.*.config.ts"], "linter": { "rules": { "style": { "noDefaultExport": "off" } } } },
    { "includes": ["src/app/**"], "linter": { "rules": { "style": { "useFilenamingConvention": "off" } } } },
    { "includes": ["tools/**", "tests/**"], "linter": { "rules": { "suspicious": { "noConsole": "off" } } } },
    { "includes": ["src/domain/**", "src/application/**", "src/presentation/**"], "linter": { "rules": { "correctness": { "noNodejsModules": "error" } } } }
  ]
}
```

**Architecture guard (`tools/architecture/*.ts`)** — an evolution, not a rewrite:

1. Layer roots (`src/{app,domain,application,adapters,presentation}`) + registered contexts; the §2.1 matrix as a data table.
2. Rejection of JS extensions (allowlist: `postcss.config.mjs`).
3. Resolver for `#…` subpath imports (today it resolves `@/`).
4. Low-cost naming rules (or in `tests/unit/tools/repository.test.ts`): role suffixes, prefix redundant with the folder, `catalogue`, CSS Module stem pair and camelCase classes, helpers outside `tests/helpers`.
5. Keep negative/positive fixtures for each new rule (current policy in `docs/engineering-standards.md`).

**CI**: no new jobs; everything inside `npm run check:quality` (already required). Change script globs (`tests/unit/analytics/*.test.ts`) in the same PR as the moves.

---

## 4. Documentation and GitHub community files

### 4.1 Current audit

| File / area | State | Gaps |
|---|---|---|
| `README.md` (416 lines) | Light/dark `<picture>` hero, badges, highlights, gallery, architecture with light/dark SVG + Mermaid, delivery, run locally, docs map, license | Too long for a showcase README; repeats content from `docs/architecture.md` and `docs/development.md`; 18 badges; no "Project structure"; no link to CHANGELOG |
| `CONTRIBUTING.md` | Clear: personal scope, workflow, verification, integration | Broken link `README.md#rights`; does not reference issue forms (they do not exist) |
| `SECURITY.md` | Email channel, scope, exposure handling | GitHub private vulnerability reporting **disabled** (confirmed 2026-10-17); no "Supported versions" table |
| `LICENSE` / `NOTICE.md` | MIT + scope of personal and third-party content; very good | — |
| `CODE_OF_CONDUCT.md` | Does not exist | Incomplete community profile |
| `CHANGELOG.md` | Does not exist; `docs/release-history.md` documents the normalization of the `v1.0.0` tag | No per-version release notes; `package.json` 1.0.0 |
| `.github/pull_request_template.md` | Good (problem, scope, validation, release) | — |
| `.github/ISSUE_TEMPLATE/` | Does not exist | No issue forms or `config.yml` (contact links) |
| `.github/CODEOWNERS` | Does not exist | — |
| `.github/release.yml` | Does not exist | Auto-generated release notes without categories |
| `.github/dependabot.yml` | npm root + `tools/api-contract` + actions, to `develop`, manual label | Update `directory` if `api-contract` moves |
| Workflows | `ci.yml` (366), `nightly.yml` (386), `branch-policy.yml`, `dependency-policy.yml`; SHA-pinned actions | Good; document in `docs/reference/ci-workflows.md` |
| `docs/` root (14 guides) | Rich and rigorous content | No structure by type; `development.md` mixes 4 modes; "Colour" (British) in `design.md` |
| `docs/specs/` (38 + template) | Template with AC-IDs, plan, verification | 13 variants of `Status:` + 4 with no status; names with and without a date |
| `docs/verification/` (16 md + 8 png + 1 json) | Detailed evidence | 6 without a paired spec (`academic-evidence`, `analytics-real-flow`, `content-migration`, `portrait-quality`, `responsive-polish-2026-10-24`, `route-theme-readiness`); binaries mixed with md |
| `docs/adr/` (1) | Context/Decision/Consequences | No number, no template, no index; several decisions live in `research/` and specs |
| `docs/research/` (8) | Good source log | 3 with a date suffix, 5 without a date |
| `docs/diagrams/` | Curated Mermaid + light/dark SVG, editing guide | Does not follow explicit C4 levels |

### 4.2 Proposed best-in-class set

| File | Action | Content / notes | Source |
|---|---|---|---|
| `README.md` | Rewrite (≤ 200 lines) | See §4.3 | [About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) |
| `CONTRIBUTING.md` | Adjust | Fix the anchor; "Reporting issues" section → issue forms; link to `docs/reference/coding-standards.md` | [Contributor guidelines](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors) |
| `SECURITY.md` | Adjust | "Supported versions" table (`main` yes, tags no); enable **private vulnerability reporting** (owner decision) and keep email as a fallback | [Security policy](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository), [PVR](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/configuring-private-vulnerability-reporting-for-a-repository) |
| `CODE_OF_CONDUCT.md` | Add (recommended, low cost) | Contributor Covenant 2.1 with contact = the SECURITY email; clarify that it applies to issues/discussions even though external PRs are not accepted. If the owner prefers not to commit to enforcement, omit it and say so in CONTRIBUTING | [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/), [community health files](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file) |
| `CHANGELOG.md` | Add | Keep a Changelog 1.1.0: `## [Unreleased]`, `## [1.0.0] - 2026-10-18`, sections Added/Changed/Deprecated/Removed/Fixed/Security, comparison links. SemVer for the site: MAJOR = change to URLs/public contracts, MINOR = visible feature, PATCH = fix. The `develop → main` release PR updates `[Unreleased]` → version + annotated tag | [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), [SemVer](https://semver.org/), [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) |
| `.github/release.yml` | Add | Categories by label (`feat`, `fix`, `docs`, `dependencies:manual`, `ci`) for auto-generated GitHub Releases; CHANGELOG is the curated source | [Auto-generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes) |
| `.github/ISSUE_TEMPLATE/bug-report.yml` | Add | Issue form: URL/route, locale, theme, device/browser, steps, expected/observed, no secrets | [Issue forms syntax](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms) |
| `.github/ISSUE_TEMPLATE/content-correction.yml` | Add | Copy/fact correction (EN/ES), with a reference to public evidence | same |
| `.github/ISSUE_TEMPLATE/config.yml` | Add | `blank_issues_enabled: false`; contact links: site `/contact`, security policy | [Configuring templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository) |
| `.github/CODEOWNERS` | Add | `* @gonzalomartinperez`; explicit sensitive paths (`/.github/`, `/contracts/`, `/tools/security/`, `/content/`). Do **not** enable "Require review from Code Owners" (a sole owner cannot approve their own PR) | [About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) |
| `.github/pull_request_template.md` | Keep | Add the checkbox "CHANGELOG `[Unreleased]` updated if visible" | — |
| `SUPPORT.md`, `FUNDING.yml`, `GOVERNANCE.md` | Do not add | Personal repo; CONTRIBUTING covers support | — |
| `LICENSE`, `NOTICE.md` | Keep | Update paths if they change (`docs/assets` → `docs/reference/asset-provenance`) | [Licensing a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) |

### 4.3 README structure (portfolio + engineering showcase)

1. **Hero**: light/dark `<picture>` (keep), name, role, a one-line proposition, link to the live site.
2. **Badges** (max 5): CI, Nightly, license, Next.js, TypeScript strict.
3. **Highlights** (5–6 bullets with a link to the evidence: spec/verification/run).
4. **Gallery**: 3 visible screenshots + the rest in `<details>`.
5. **Architecture at a glance**: light/dark C4 L1 (context) + L2 (container) diagram, 4 lines of text and a link to `docs/explanation/architecture.md`.
6. **Tech stack**: compact table (runtime, UI, 3D, quality, CI) instead of 15 badges.
7. **Engineering practices**: quality gates (`npm run check`), architecture guard, browser matrix, secret scan, pinned toolchain — each with a link.
8. **Quick start**: `nvm use && npm ci && npm run dev` + link to `docs/tutorials/getting-started.md`.
9. **Project structure**: a 15-line tree of the §2.1 layout.
10. **Documentation**: Diátaxis map (4 columns) + records (specs, verification, decisions) + CHANGELOG.
11. **Contributing & security**: 2 lines + links.
12. **License & content rights**: MIT for software; personal content per `NOTICE.md` (stable anchor `#license-and-content-rights`, and update CONTRIBUTING).

### 4.4 `docs/` tree by Diátaxis

[Diátaxis](https://diataxis.fr/) separates four needs: learning (tutorials), solving a task (how-to), looking things up (reference), understanding (explanation). Specs, verifications and ADRs are **project records**, not user documentation: they go in their own folders.

```text
docs/
  README.md                         # index: 4 quadrants + records
  tutorials/
    getting-started.md              # clone → nvm → npm ci → dev → first verified change
  how-to/
    verify-a-change.md              # task-specific QA (from development.md)
    run-browser-tests.md
    work-with-parallel-agents.md    # worktrees/handoffs (from development.md)
    deploy-to-hostinger.md          # (deployment.md)
    review-dependency-updates.md    # (dependency-updates.md)
    publish-public-cv.md            # (public-content.md)
    run-assistant-locally.md        # (native-assistant.md, operational part)
    verify-analytics-locally.md
    edit-diagrams.md                # (diagrams/README.md, editing part)
    add-technology.md · update-locale-copy.md · capture-gallery.md
  reference/
    commands.md                     # npm scripts
    ci-workflows.md                 # jobs, aggregates, required checks
    configuration.md                # env vars, feature flags
    module-contract.md              # dependency matrix (from architecture.md)
    coding-standards.md             # §3 + code-quality.md
    editorial-guidelines.md
    content-model.md                # types from src/domain/content
    analytics-events.md · assistant-api-contract.md
    agent-skills.md                 # (skill-discovery.md)
    asset-provenance/               # (docs/assets/* + linkedin-branding.md)
  explanation/
    architecture.md                 # C4 + rationale
    design-system.md · technology-choices.md · native-assistant.md
    engineering-governance.md       # ownership across sessions (engineering-standards.md)
    release-history.md
    research/YYYY-MM-DD-<slug>.md
  decisions/                        # MADR ADRs
    README.md · adr-template.md · 0001-shared-physical-site-architecture.md · 0002-…
  specs/
    _template.md · <slug>.md
  verification/
    <spec-slug>.md · assets/<spec-slug>/*
  diagrams/
    README.md · c4-context.{mmd,-light.svg,-dark.svg} · c4-container.* · c4-component-web-app.* · delivery-pipeline.* · solar-rendering-pipeline.*
  gallery/                          # unchanged (referenced by README)
```

### 4.5 Record conventions

**ADRs ([MADR 4](https://adr.github.io/madr/))**: `docs/decisions/NNNN-<verb-phrase-kebab>.md`, front matter `status: proposed|accepted|rejected|deprecated|superseded by NNNN`, `date`, `decision-makers`. Sections: Context and Problem Statement · Decision Drivers · Considered Options · Decision Outcome (+ Consequences, Confirmation) · Pros and Cons of the Options · More Information. Proposed backfill: 0001 shared physical site architecture (renamed), 0002 layered clean architecture (Phase B, supersedes part of 0001), 0003 Biome as the sole formatter/linter, 0004 TypeScript-only + Node type stripping, 0005 Hostinger managed Node (no container), 0006 assistant/analytics default-off build gates, 0007 subpath imports instead of `paths`, (optional) 0008 `[locale]` routes.

**Specs**: YAML front matter with `status: draft | accepted | in-progress | done | superseded`, `owner`, `updated`, `verification: ../verification/<slug>.md`. Details ("final verification in PR #86") go in the body, not in the status. Name = stable slug without a date; release ledgers keep `release-YYYY-MM-DD`.

**Verification**: same slug as its spec (create a minimal spec or rename the 6 orphans); binaries in `verification/assets/<slug>/`.

**Research**: `YYYY-MM-DD-<slug>.md` (review date at the start: sortable).

**Docs naming**: kebab-case, US English, noun for reference/explanation (`module-contract.md`), imperative verb for how-to (`deploy-to-hostinger.md`), `README.md` as the index of each folder.

### 4.6 TSDoc

Adopt [TSDoc](https://tsdoc.org/) syntax within the current `code-quality.md` policy (non-inferable contracts only): `@param name - description`, `@returns`, `@throws`, `@remarks`, `@example`, `@see`, `@deprecated`, `@internal` for exports used only by tests/composition. No generator (TypeDoc) and no TSDoc lint (it would require ESLint); human/agent review.

### 4.7 C4 diagrams

[C4](https://c4model.com/) in 3 levels, Mermaid as the source + curated light/dark SVG (current process in `docs/diagrams/README.md`):

| Level | View | Elements |
|---|---|---|
| L1 System Context | `c4-context` | Visitor/recruiter, Portfolio web, Assistant API (external, gated), Analytics ingest (external, gated), Hostinger, GitHub Actions |
| L2 Container | `c4-container` | Next.js server (prerender), browser client bundle (client islands), static assets (`public/`), imported contracts |
| L3 Component | `c4-component-web-app` | Layers `app → presentation → application → domain`, `adapters` toward API/analytics/rendering, `content`/`config` as inputs |
| Dynamic | `assistant-sequence` (existing in architecture.md) | Keep the Mermaid sequence |
| Deployment | `delivery-pipeline` | Rename the current `delivery-flow` |

Mermaid has C4 syntax ([Mermaid C4](https://mermaid.js.org/syntax/c4.html), marked experimental); a more stable alternative: `flowchart` with C4 notation (element type + technology in each box + legend), which is what the repo already does.

---

## 5. Suggested sequence (Phase B → C)

1. ADR 0002 (layout) + 0004 (TS-only) + 0007 (subpath imports) accepted.
2. Tooling PR: unified `tsconfig` strictness (no moves) and fixes.
3. TS migration PR for `tools/` + `tests/` + `next.config.ts` (the §2.4 moves in the same PR, with the package.json/workflows/policy consumers together).
4. `content` split PR (types/rules → `src/domain|application/content`, one i18n pattern, dedupe `chrome`), with an EN/ES parity test.
5. PRs per context (analytics → assistant → diagrams → technology → hero → solar-system), each with the guard updated and fixtures.
6. Presentation PR (design-system, components, views, shell, seo) + CSS camelCase.
7. Biome rules from §3.3 turned on last (once the tree already complies), Diátaxis docs + community files in parallel (docs-only PRs).

---

## 6. Sources

- Google TypeScript Style Guide — https://google.github.io/styleguide/tsguide.html · `gts` — https://github.com/google/gts · Google JS Style (file names) — https://google.github.io/styleguide/jsguide.html#file-name
- Microsoft TypeScript Coding guidelines (wiki, for compiler contributors) — https://github.com/microsoft/TypeScript/wiki/Coding-guidelines · TS Handbook Do's and Don'ts — https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html · Engineering Playbook TypeScript — https://microsoft.github.io/code-with-engineering-playbook/code-reviews/recipes/typescript/
- TSConfig reference (`erasableSyntaxOnly`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) — https://www.typescriptlang.org/tsconfig/ · TS modules reference — https://www.typescriptlang.org/docs/handbook/modules/reference.html
- Node.js TypeScript (type stripping) — https://nodejs.org/api/typescript.html · Subpath imports — https://nodejs.org/api/packages.html#subpath-imports
- Biome linter rules — https://biomejs.dev/linter/rules/ · useFilenamingConvention — https://biomejs.dev/linter/rules/use-filenaming-convention/ · noDefaultExport — https://biomejs.dev/linter/rules/no-default-export/ · useImportExtensions — https://biomejs.dev/linter/rules/use-import-extensions/ · Organize imports — https://biomejs.dev/assist/actions/organize-imports/ · Overrides — https://biomejs.dev/reference/configuration/#overrides
- Next.js: project structure / private folders — https://nextjs.org/docs/app/getting-started/project-structure · `next.config.ts` — https://nextjs.org/docs/app/api-reference/config/typescript · PostCSS — https://nextjs.org/docs/app/guides/post-css · i18n — https://nextjs.org/docs/app/guides/internationalization · public folder — https://nextjs.org/docs/app/api-reference/file-conventions/public-folder · Server/Client Components — https://nextjs.org/docs/app/getting-started/server-and-client-components
- React custom hooks naming — https://react.dev/learn/reusing-logic-with-custom-hooks
- Clean Architecture — https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- GitHub Docs: community health files — https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file · issue forms — https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms · CODEOWNERS — https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners · security policy — https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository · release notes — https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes · READMEs — https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
- Diátaxis — https://diataxis.fr/ · MADR — https://adr.github.io/madr/ · C4 model — https://c4model.com/ · Mermaid C4 — https://mermaid.js.org/syntax/c4.html
- Keep a Changelog 1.1.0 — https://keepachangelog.com/en/1.1.0/ · SemVer 2.0.0 — https://semver.org/ · Conventional Commits 1.0.0 — https://www.conventionalcommits.org/en/v1.0.0/ · Contributor Covenant 2.1 — https://www.contributor-covenant.org/version/2/1/code_of_conduct/ · TSDoc — https://tsdoc.org/

> Limits: the sources are cited according to knowledge as of the date; they were not re-downloaded in this session. Before enabling rules, verify names/options against the installed Biome 2.5.15 (`npx biome explain`). Support for `postcss.config.*` was verified in the `next` installed in the local checkout.
