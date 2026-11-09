# File moves, renames, conversions and removals

Companion to [file-index.csv](file-index.csv) (every tracked file at `origin/develop` `0a1ff56`, 752 rows, plus 110 `add` rows for planned new files). This file lists every row whose action is not `keep` or an in-place `modify`, with the motive. Nothing is deleted without its content landing elsewhere (ecosystem 15.5). Moves are separate PRs from behaviour changes (execution playbook, task slicing), and every doc move runs lychee in the `docs` CI profile so inbound links keep resolving.

Counts at planning time: 569 keep, 53 modify, 46 move, 37 convert-ts, 15 rewrite, 9 convert, 6 symlink, 6 merge, 4 keep-exception, 3 split, 1 each of rename, replace, rename+rewrite, merge+rewrite, plus 110 add.

Execution order: skills and docs moves in M1/M3 (no code risk), `.mjs` conversions in M4 (guarded by the architecture test and `tsc`), `technologies.ts` split and hero engine split in M4/M5 behind visual baselines, asset conversions in M3 with the image audit.

## 1. JavaScript to TypeScript (every .js/.mjs/.cjs has a destination or a justified exception)

The only files that stay JavaScript: `next.config.mjs` (Hostinger glibc 2.28 cannot load `next.config.ts` through SWC; documented in `docs/deployment.md`), `postcss.config.mjs` (the PostCSS loader reads JS config), and the JSON files of the isolated `tools/api-contract` package (own pinned TypeScript 5 compiler API). All other 37 `.mjs` files convert to `.ts` and run through Node type stripping (Node >= 24.12; the repo is on 24.22.0). Guard rule G10 forbids new `.js/.mjs/.cjs` outside this list.

| From | To | Action | Motive |
|---|---|---|---|
| `next.config.mjs` | `next.config.mjs` | keep-exception | Must stay .mjs: Hostinger glibc 2.28 cannot load next.config.ts through SWC (docs/deployment.md); JSDoc-typed and checked by tsc; adds CSP report-only, image config |
| `postcss.config.mjs` | `postcss.config.mjs` | keep-exception | Tailwind PostCSS loader cannot load TS config; the only other .mjs exception |
| `tests/integration/budget.test.mjs` | `tests/integration/budget.test.ts` | convert-ts | Same; budget and rendered tests stay build-output integration tests |
| `tests/integration/rendered.test.mjs` | `tests/integration/rendered.test.ts` | convert-ts | Same; budget and rendered tests stay build-output integration tests |
| `tests/unit/academic.test.mjs` | `tests/unit/academic.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/architecture.test.mjs` | `tests/unit/architecture.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/browser-ci-planner.test.mjs` | `tests/unit/browser-ci-planner.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/catalogue.test.mjs` | `tests/unit/catalogue.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/ci-build-artifact.test.mjs` | `tests/unit/ci-build-artifact.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/ci-build-provenance.test.mjs` | `tests/unit/ci-build-provenance.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/cloud-layout.test.mjs` | `tests/unit/cloud-layout.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/content-migration.test.mjs` | `tests/unit/content-migration.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/content.test.mjs` | `tests/unit/content.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/cv-export.test.mjs` | `tests/unit/cv-export.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/dependency-policy.test.mjs` | `tests/unit/dependency-policy.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/nightly-candidate.test.mjs` | `tests/unit/nightly-candidate.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/repository.test.mjs` | `tests/unit/repository.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/scene-budget.test.mjs` | `tests/unit/scene-budget.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/secret-scan.test.mjs` | `tests/unit/secret-scan.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tests/unit/workflow-policy.test.mjs` | `tests/unit/workflow-policy.test.ts` | convert-ts | Every .mjs gets a TS destination (ecosystem 10.1); runner decided by E7 spike (Vitest default) |
| `tools/api-contract/package-lock.json` | `tools/api-contract/package-lock.json` | keep-exception | Isolated package with its own pinned TypeScript 5 (compiler API); JSON only |
| `tools/api-contract/package.json` | `tools/api-contract/package.json` | keep-exception | Isolated package with its own pinned TypeScript 5 (compiler API); JSON only |
| `tools/architecture-policy.mjs` | `tools/architecture-policy.ts` | convert-ts | Guard stays custom (AST, registered roots, negative fixtures); adds Biome noImportCycles and knip alongside |
| `tools/architecture.mjs` | `tools/architecture.ts` | convert-ts | Guard stays custom (AST, registered roots, negative fixtures); adds Biome noImportCycles and knip alongside |
| `tools/browser-ci-planner.mjs` | `tools/browser-ci-planner.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/capture-gallery.mjs` | `tools/capture-gallery.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/check-assistant-contract.mjs` | `tools/check-assistant-contract.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/check-browser-runtime.mjs` | `tools/check-browser-runtime.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/ci-build-artifact.mjs` | `tools/ci-build-artifact.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/ci-build-provenance.mjs` | `tools/ci-build-provenance.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/dependency-policy.mjs` | `tools/dependency-policy.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/export-cv.mjs` | `tools/export-cv.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/generate-identity.mjs` | `tools/generate-identity.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/nightly-candidate.mjs` | `tools/nightly-candidate.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/scene-budget-plugin.mjs` | `tools/scene-budget-plugin.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/secret-scan.mjs` | `tools/secret-scan.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/smoke-test.mjs` | `tools/smoke-test.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/technology-illustrations.mjs` | `tools/technology-illustrations.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/test-server.mjs` | `tools/test-server.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/test-site.mjs` | `tools/test-site.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |
| `tools/workflow-policy.mjs` | `tools/workflow-policy.ts` | convert-ts | Node type stripping (>= 24.12) runs .ts directly; no tsx |

41 rows.

## 2. Moves, renames, merges and splits

| From | To | Action | Motive |
|---|---|---|---|
| `.agents/skills/implement-feature/SKILL.md` | `.agents/skills/implement-task/SKILL.md` | rename+rewrite | Catalog name implement-task (ecosystem 15.5); adds worktree, review chain, evidence template, evals |
| `.agents/skills/prepare-delivery/SKILL.md` | `.agents/skills/verify-release/SKILL.md` | merge+rewrite | Delivery checks fold into implement-task (per-PR) and verify-release (release profile, build-info check) |
| `.agents/skills/prepare-delivery/references/secret-review.md` | `.agents/skills/implement-task/references/secret-review.md` | move | Secret review stays with the PR pipeline skill |
| `.github/workflows/branch-policy.yml` | `(classify job in ci.yml)` | merge | Route and title check moves into the pull_request classify job; removes the pull_request_target trigger (zizmor); see PF-D20 |
| `.github/workflows/dependency-policy.yml` | `.github/workflows/ci.yml (deps-weekly profile)` | merge | Becomes the deps-weekly profile plus deps-weekly-guard |
| `content/technologies.ts` | `content/technologies/*.ts` | split | 2,766 lines in one module: split by category with stable ids and a schema test; client bundle receives only used fields |
| `docs/adr/site-architecture-parity.md` | `docs/decisions/0001-site-architecture-parity.md` | move | MADR numbering under docs/decisions (ecosystem 14.2) |
| `docs/architecture.md` | `docs/architecture/overview.md` | move | C4 levels 1-2 live under docs/architecture/ |
| `docs/assets/company-marks.md` | `docs/reference/assets/company-marks.md` | move | Diataxis: reference |
| `docs/assets/credential-marks.md` | `docs/reference/assets/credential-marks.md` | move | Diataxis: reference |
| `docs/assets/profile-images.md` | `docs/reference/assets/profile-images.md` | move | Diataxis: reference |
| `docs/assets/shadcn-ui.md` | `docs/reference/assets/shadcn-ui.md` | move | Diataxis: reference |
| `docs/assets/solar-system.md` | `docs/reference/assets/solar-system.md` | move | Diataxis: reference |
| `docs/assets/technology-marks.md` | `docs/reference/assets/technology-marks.md` | move | Diataxis: reference |
| `docs/code-quality.md` | `docs/reference/code-quality.md` | move | Diataxis: reference; superseded in part by standards.md in the plan |
| `docs/dependency-updates.md` | `docs/how-to/handle-the-weekly-dependency-pr.md` | move | Rewritten for the single weekly PR rule |
| `docs/deployment.md` | `docs/how-to/deploy-hostinger.md` | move | Diataxis: how-to |
| `docs/design.md` | `docs/explanation/design-system.md` | move | Diataxis: explanation; replaced by design-playbook link plus generated token table |
| `docs/development.md` | `docs/how-to/develop.md` | move | Diataxis: how-to |
| `docs/diagrams/README.md` | `docs/architecture/diagrams/README.md` | move | Diagrams colocated with architecture docs |
| `docs/diagrams/architecture-overview-dark.svg` | `docs/architecture/diagrams/architecture-overview-dark.svg` | move | Diagrams colocated with architecture docs |
| `docs/diagrams/architecture-overview-light.svg` | `docs/architecture/diagrams/architecture-overview-light.svg` | move | Diagrams colocated with architecture docs |
| `docs/diagrams/architecture-overview.mmd` | `docs/architecture/diagrams/architecture-overview.mmd` | move | Diagrams colocated with architecture docs |
| `docs/diagrams/delivery-flow-dark.svg` | `docs/architecture/diagrams/delivery-flow-dark.svg` | move | Diagrams colocated with architecture docs |
| `docs/diagrams/delivery-flow-light.svg` | `docs/architecture/diagrams/delivery-flow-light.svg` | move | Diagrams colocated with architecture docs |
| `docs/diagrams/delivery-flow.mmd` | `docs/architecture/diagrams/delivery-flow.mmd` | move | Diagrams colocated with architecture docs |
| `docs/diagrams/solar-rendering-dark.svg` | `docs/architecture/diagrams/solar-rendering-dark.svg` | move | Diagrams colocated with architecture docs |
| `docs/diagrams/solar-rendering-light.svg` | `docs/architecture/diagrams/solar-rendering-light.svg` | move | Diagrams colocated with architecture docs |
| `docs/diagrams/solar-rendering.mmd` | `docs/architecture/diagrams/solar-rendering.mmd` | move | Diagrams colocated with architecture docs |
| `docs/editorial-guidelines.md` | `docs/reference/editorial-guidelines.md` | move | Diataxis: reference |
| `docs/engineering-standards.md` | `docs/reference/engineering-standards.md` | move | Diataxis: reference; superseded in part by standards.md in the plan |
| `docs/linkedin-branding.md` | `docs/reference/linkedin-branding.md` | move | Diataxis: reference |
| `docs/master-plan/ecosystem.md` | `docs/master-plan/ecosystem.md` | replace | Replaced by the byte-identical ecosystem standard; v1 cross-repo notes moved into target-state.md |
| `docs/master-plan/research/design-ux-playbook.md` | `docs/master-plan/archive-v1/design-ux-playbook.md` | move | Kept readable as v1 archive (rules, sources); v2 cites the shared research set in research/ |
| `docs/master-plan/research/engineering-target-state.md` | `docs/master-plan/archive-v1/engineering-target-state.md` | move | Kept readable as v1 archive (rules, sources); v2 cites the shared research set in research/ |
| `docs/master-plan/research/file-index-current.csv` | `docs/master-plan/archive-v1/file-index-current.csv` | move | Superseded by file-index.csv v2 |
| `docs/master-plan/research/skills-plan.md` | `docs/master-plan/archive-v1/skills-plan.md` | move | Kept readable as v1 archive (rules, sources); v2 cites the shared research set in research/ |
| `docs/master-plan/research/standards-and-index.md` | `docs/master-plan/archive-v1/standards-and-index.md` | move | Kept readable as v1 archive (rules, sources); v2 cites the shared research set in research/ |
| `docs/master-plan/rubrics/designer.md` | `docs/master-plan/rubrics.md` | merge | Superseded by rubrics v2; v1 scoring detail moves to archive-v1 and is mapped in scorecard.md |
| `docs/master-plan/rubrics/developer.md` | `docs/master-plan/rubrics.md` | merge | Superseded by rubrics v2; v1 scoring detail moves to archive-v1 and is mapped in scorecard.md |
| `docs/master-plan/rubrics/recruiter.md` | `docs/master-plan/rubrics.md` | merge | Superseded by rubrics v2; v1 scoring detail moves to archive-v1 and is mapped in scorecard.md |
| `docs/native-assistant.md` | `docs/explanation/native-assistant.md` | move | Diataxis: explanation |
| `docs/public-content.md` | `docs/reference/public-content.md` | move | Diataxis: reference |
| `docs/release-history.md` | `CHANGELOG.md` | merge | Generated CHANGELOG by release-please; history appended once, then file deleted |
| `docs/research/ci-efficiency.md` | `docs/explanation/research/ci-efficiency.md` | move | Dated research kept as explanation archive |
| `docs/research/clean-architecture.md` | `docs/explanation/research/clean-architecture.md` | move | Dated research kept as explanation archive |
| `docs/research/dependency-review-2026-10-18.md` | `docs/explanation/research/dependency-review-2026-10-18.md` | move | Dated research kept as explanation archive |
| `docs/research/engineering-profile-2026-10-10.md` | `docs/explanation/research/engineering-profile-2026-10-10.md` | move | Dated research kept as explanation archive |
| `docs/research/motion-performance.md` | `docs/explanation/research/motion-performance.md` | move | Dated research kept as explanation archive |
| `docs/research/portfolio-2026-09-12.md` | `docs/explanation/research/portfolio-2026-09-12.md` | move | Dated research kept as explanation archive |
| `docs/research/recruiter-journey-2026-09-19.md` | `docs/explanation/research/recruiter-journey-2026-09-19.md` | move | Dated research kept as explanation archive |
| `docs/research/toolchain-2026-10-17.md` | `docs/explanation/research/toolchain-2026-10-17.md` | move | Dated research kept as explanation archive |
| `docs/skill-discovery.md` | `docs/reference/skill-discovery.md` | move | Diataxis: reference |
| `docs/technology.md` | `docs/reference/technology-catalogue.md` | move | Diataxis: reference |
| `public/images/companies/rampy-original.jpg` | `media/companies/rampy-original.jpg` | move | Source masters do not belong in public/; served derivatives only |
| `public/images/companies/teamcubation-original.jpg` | `media/companies/teamcubation-original.jpg` | move | Source masters do not belong in public/; served derivatives only |
| `public/social/portfolio-og-2026-10-24.png` | `public/social/portfolio-og.png` | rename | Drop date suffix; generated by tools; PNG required by OG consumers |
| `src/app/globals.css` | `src/app/globals.css + src/design/theme.css` | split | Hand-written 12-line entry imports generated theme.css from DTCG tokens; literals removed |
| `src/features/hero/adapters/scene-runtime.ts` | `src/features/hero/adapters/catalogue-journey.ts + scene-host` | split | 635 lines mixing scene mount, scroll journey and pointer; split into SceneHost client, journey scrub and pulses; complexity <= 10 |

59 rows.

## 3. Skill adapters replaced by symlinks

`.claude/skills/<name>` is a copy-style adapter file today (533 bytes each); the standard is one canonical skill under `.agents/skills/` and a relative directory symlink for Claude (`check-skills` verifies every link).

| From | To | Action | Motive |
|---|---|---|---|
| `.claude/skills/debug-issue/SKILL.md` | `.claude/skills/debug-issue` | replace-with-symlink | Copy adapter becomes a relative symlink so one canonical skill exists |
| `.claude/skills/implement-feature/SKILL.md` | `.claude/skills/implement-task` | replace-with-symlink | Relative symlink to ../../.agents/skills/implement-task (ecosystem 15.1) |
| `.claude/skills/prepare-delivery/SKILL.md` | `.claude/skills/verify-release` | replace-with-symlink | Relative symlink to the merged verify-release skill |
| `.claude/skills/review-change/SKILL.md` | `.claude/skills/review-change` | replace-with-symlink | Copy adapter becomes a relative symlink so one canonical skill exists |
| `.claude/skills/specify-feature/SKILL.md` | `.claude/skills/specify-feature` | replace-with-symlink | Copy adapter becomes a relative symlink so one canonical skill exists |
| `.claude/skills/update-dependencies/SKILL.md` | `.claude/skills/update-dependencies` | replace-with-symlink | Copy adapter becomes a relative symlink so one canonical skill exists |

6 rows.

## 4. Rewrites in place (path unchanged)

| From | To | Action | Motive |
|---|---|---|---|
| `.agents/skills/debug-issue/SKILL.md` | `.agents/skills/debug-issue/SKILL.md` | rewrite | Adds diagnose-loop (reproduce, minimise, hypothesise, fix, regression test) and evals; repo-specific skill kept |
| `.agents/skills/review-change/SKILL.md` | `.agents/skills/review-change/SKILL.md` | rewrite | Adds reproduce-every-finding, rubric lenses, designer evidence, activation evals |
| `.agents/skills/specify-feature/SKILL.md` | `.agents/skills/specify-feature/SKILL.md` | rewrite | Spec-driven flow kept; adds measurable acceptance and CI profile fields |
| `.agents/skills/update-dependencies/SKILL.md` | `.agents/skills/update-dependencies/SKILL.md` | rewrite | Rewritten around the single weekly Dependabot PR (ecosystem 5) |
| `.github/dependabot.yml` | `.github/dependabot.yml` | rewrite | multi-ecosystem-groups, one weekly PR, Monday 09:00 ART (ecosystem 5.2); today 3+2+3 PR slots |
| `.github/workflows/ci.yml` | `.github/workflows/ci.yml` | rewrite | classify job plus profiles, shared reusable workflows, ci-gate (ecosystem 6.0); existing job logic ported |
| `.github/workflows/nightly.yml` | `.github/workflows/nightly.yml` | rewrite | Adds full mutation, flake detector, Scorecard, scorecard.json ratchet; keeps visual, links, bundle |
| `CONTRIBUTING.md` | `CONTRIBUTING.md` | rewrite | Short form: run checks, branch flow, commit convention (ecosystem 14.2) |
| `README.md` | `README.md` | rewrite | Ecosystem README template (80-180 lines; now 416); content moves to docs/ Diataxis pages |
| `docs/master-plan/README.md` | `docs/master-plan/README.md` | rewrite | Replaced in place by v2 (git history keeps v1) |
| `docs/master-plan/roadmap.md` | `docs/master-plan/roadmap.md` | rewrite | Replaced in place by v2 (git history keeps v1) |
| `docs/master-plan/scorecard.md` | `docs/master-plan/scorecard.md` | rewrite | Replaced in place by v2 (git history keeps v1) |
| `src/features/hero/adapters/field-engine.ts` | `src/features/hero/adapters/gpu/particle-engine.ts` | rewrite | Replaced by the v2 stateless GPU morph engine (hero-particles.md); sphere logic becomes figure 01 |
| `src/features/hero/domain/constellation.ts` | `src/features/hero/domain/figures/sphere.ts + poster` | rewrite | Static constellation becomes the sphere at seed time 0 (poster = first GPU frame) |
| `src/shell/page-motion.tsx` | `src/shell/page-motion.tsx` | rewrite | IntersectionObserver reveals replaced by CSS scroll-driven animations; ViewTransition navigation |

15 rows.

## 5. Asset conversions

Eleven unoptimised raster images were reported by the audit (v1 issue list, re-confirmed 2026-11-09): nine are converted in the table below and the other two (`public/images/companies/rampy-original.jpg` and `teamcubation-original.jpg`, source masters) are moved to `media/companies/` (see the moves section), so 9 + 2 = 11. Conversion produces AVIF/WebP derivatives served through `next/image` with committed dimensions; originals stay in `media/` (not public).

| From | To | Action | Motive |
|---|---|---|---|
| `public/certificates/professional-power-skills-2026.png` | `public/certificates/professional-power-skills-2026.png` | convert | Unoptimised raster; AVIF/WebP |
| `public/images/companies/cooperativa-obrera-100.jpg` | `public/images/companies/cooperativa-obrera-100.jpg` | convert | Unoptimised raster (v1/audit: 11 unoptimised images); AVIF/WebP via next/image with dimensions |
| `public/images/companies/cooperativa-obrera.png` | `public/images/companies/cooperativa-obrera.png` | convert | Unoptimised raster (v1/audit: 11 unoptimised images); AVIF/WebP via next/image with dimensions |
| `public/images/companies/independent.jpg` | `public/images/companies/independent.jpg` | convert | Unoptimised raster (v1/audit: 11 unoptimised images); AVIF/WebP via next/image with dimensions |
| `public/images/companies/pequeverso.png` | `public/images/companies/pequeverso.png` | convert | Unoptimised raster (v1/audit: 11 unoptimised images); AVIF/WebP via next/image with dimensions |
| `public/images/companies/rampy.png` | `public/images/companies/rampy.png` | convert | Unoptimised raster (v1/audit: 11 unoptimised images); AVIF/WebP via next/image with dimensions |
| `public/images/companies/teamcubation.png` | `public/images/companies/teamcubation.png` | convert | Unoptimised raster (v1/audit: 11 unoptimised images); AVIF/WebP via next/image with dimensions |
| `public/images/institutions/kognite.jpg` | `public/images/institutions/kognite.jpg` | convert | Unoptimised raster; AVIF/WebP |
| `public/images/institutions/uns.jpg` | `public/images/institutions/uns.jpg` | convert | Unoptimised raster; AVIF/WebP |

9 rows.

## 6. New files (planned)

| Path | Layer | Purpose |
|---|---|---|
| `src/design/tokens/structure.tokens.json` | design | DTCG: type, space, radius, motion, breakpoints, z-index (shared structure with sibling repos) |
| `src/design/tokens/pack-instrument.tokens.json` | design | DTCG: Instrument blue ramps and light/dark semantic mapping |
| `src/design/theme.css` | design | Generated by Style Dictionary v5; snapshot-tested; contrast asserted at build |
| `tools/build-tokens.ts` | tool | Runs Style Dictionary and the contrast/CVD checks |
| `tools/scorecard.ts` | tool | Aggregates CI artifacts into scorecard.json and checks ratchets |
| `tools/lighthouse-gate.ts` | tool | Lighthouse 13.5 median-of-5 with budget assertions (PF-D5) |
| `tools/frame-budget.ts` | tool | Frame-time, LoAF and INP sampling helpers for fluidity specs |
| `tools/image-audit.ts` | tool | Finds unoptimised or unsized images; emits dimension manifests |
| `tools/render-posters.ts` | tool | Deterministic CPU renderer: 10 figures x 2 themes to SVG posters |
| `tools/bundle-attribution.ts` | tool | Per-route, per-chunk, per-module gzip attribution for the JS budget |
| `ratchets/coverage.json` | ratchet | Branch/line/function floors; may only increase |
| `ratchets/mutation.json` | ratchet | Per-scope Stryker thresholds |
| `ratchets/bundle.json` | ratchet | Per-route JS/CSS/font/texture budgets |
| `ratchets/lighthouse.json` | ratchet | Per-route Lighthouse floors |
| `ratchets/static.json` | ratchet | Lint, type, knip, complexity and guard violation counts |
| `ratchets/a11y.json` | ratchet | axe counts and target-size findings |
| `ratchets/scorecard.json` | ratchet | Per-axis score floors |
| `ci-profile.json` | ci | CI profile path map (moves to .github/ci-profile.json at M1) |
| `.github/workflows/deps-weekly-guard.yml` | ci | Shared workflow caller (ecosystem 5.3) |
| `.github/workflows/security.yml` | ci | CodeQL, zizmor, osv-scanner daily job caller |
| `.github/workflows/release.yml` | ci | release-please and immutable GitHub Release |
| `.github/workflows/scorecard.yml` | ci | OpenSSF Scorecard weekly |
| `release-please-config.json` | root | Manifest mode config |
| `.release-please-manifest.json` | root | Current version |
| `CHANGELOG.md` | docs | Keep a Changelog via release-please |
| `CODE_OF_CONDUCT.md` | docs | Contributor Covenant 2.1 |
| `SUPPORT.md` | docs | Where to ask |
| `.github/CODEOWNERS` | ci | Map of ownership |
| `.github/ISSUE_TEMPLATE/bug.yml` | ci | Issue form |
| `.github/ISSUE_TEMPLATE/feature.yml` | ci | Issue form |
| `.github/ISSUE_TEMPLATE/config.yml` | ci | blank_issues_enabled false |
| `public/.well-known/security.txt` | asset | RFC 9116 |
| `public/build-info.json` | asset | Merge SHA and time for post-deploy verification |
| `src/features/hero/domain/sequence.ts` | feature/hero/domain | Single source of the loop timeline (dwell, morph, style, easing) |
| `src/features/hero/domain/figures/index.ts` | feature/hero/domain | Registry of exactly 10 figures with character metadata |
| `src/features/hero/domain/figures/sphere.ts` | feature/hero/domain | Figure 01 |
| `src/features/hero/domain/figures/cube.ts` | feature/hero/domain | Figure 02 |
| `src/features/hero/domain/figures/wormhole.ts` | feature/hero/domain | Figure 03 (catenoid) |
| `src/features/hero/domain/figures/triangle-tetrahedron.ts` | feature/hero/domain | Figure 04 (two layers) |
| `src/features/hero/domain/figures/toroidal-helix.ts` | feature/hero/domain | Figure 05 |
| `src/features/hero/domain/figures/neural-graph.ts` | feature/hero/domain | Figure 06 |
| `src/features/hero/domain/figures/galaxy.ts` | feature/hero/domain | Figure 07 |
| `src/features/hero/domain/figures/wave-field.ts` | feature/hero/domain | Figure 08 |
| `src/features/hero/domain/figures/moebius.ts` | feature/hero/domain | Figure 09 |
| `src/features/hero/domain/figures/monogram.ts` | feature/hero/domain | Figure 10 (stroke sampler over monogram data) |
| `src/features/hero/domain/matching.ts` | feature/hero/domain | Recursive median (k-d) pairing between consecutive figures |
| `src/features/hero/domain/rng.ts` | feature/hero/domain | mulberry32 seeded generator |
| `src/features/hero/domain/easing.ts` | feature/hero/domain | back.out, elastic.out, expo.inOut, power3.out, circ.out, sine.inOut in about 1 KB (replaces GSAP) |
| `src/features/hero/domain/tier.ts` | feature/hero/domain | Tier selection and governor as pure functions |
| `src/features/hero/adapters/gpu/shaders.ts` | feature/hero/adapters | Vertex/fragment GLSL ES 3.00 strings |
| `src/features/hero/adapters/gpu/targets.worker.ts` | feature/hero/adapters | Web Worker: figure generation and matching |
| `src/features/hero/adapters/gpu/satellites.ts` | feature/hero/adapters | Analytic orbit rings |
| `src/features/hero/presentation/hero-hud.tsx` | feature/hero/presentation | HUD brackets, 01/10 label, figure and easing names |
| `src/features/hero/presentation/hero-controls.tsx` | feature/hero/presentation | Pause/play, previous, next (WCAG 2.2.2) |
| `src/features/hero/presentation/poster-figures.tsx` | feature/hero/presentation | Lazy per-theme SVG posters for the Still variant |
| `src/shared/scene/scene-host.ts` | shared/scene | SceneHost contract: route opt-in, one context, tier, pause, dispose |
| `src/shared/scene/frame-scheduler.ts` | shared/scene | Single rAF owner, dt-based damping |
| `src/shared/scene/quality-governor.ts` | shared/scene | Frame-time tiering shared by hero and solar |
| `src/shared/identity/monogram.ts` | shared/identity | Monogram stroke vertices (draft GMP, PF-D15) |
| `src/shell/motion-toggle.tsx` | shell | Header/footer pause control wired to motion-state |
| `src/shell/progress-rail.tsx` | shell | Scroll-driven section rail with aria-current |
| `src/shared/ui/tooltip.tsx` | shared/ui | Tooltip for icon buttons |
| `src/shared/ui/callout.tsx` | shared/ui | Callout / status message |
| `src/shared/ui/toast.tsx` | shared/ui | Copy confirmation, polite live region |
| `src/shared/editorial/instrument-label.tsx` | shared/editorial | Mono eyebrow, index and hairline signature |
| `src/shared/editorial/registration-ticks.tsx` | shared/editorial | Corner ticks signature |
| `src/views/about-sections/ (as needed)` | views | Only if a view exceeds complexity budget |
| `tests/unit/hero/figures.test.ts` | test/unit | Geometry tolerance, bbox, seed determinism, golden hashes |
| `tests/unit/hero/sequence.test.ts` | test/unit | Timeline, alternation rule, 49.1 s loop |
| `tests/unit/hero/matching.test.ts` | test/unit | Pairing metric and permutation validity |
| `tests/unit/design-tokens.test.ts` | test/unit | Contrast pairs, CVD distance, light/dark completeness, snapshot |
| `tests/unit/ci-profile.test.ts` | test/unit | No file outside every profile |
| `tests/browser/hero-figures.spec.ts` | test/browser | 44+ per-figure snapshots with QA clock |
| `tests/browser/hero-fluidity.spec.ts` | test/browser | Frame-time, LoAF, INP lanes |
| `tests/browser/hero-fallbacks.spec.ts` | test/browser | Context loss, no float, Save-Data, reduced motion |
| `tests/browser/visual-routes.spec.ts` | test/browser | Route x theme x viewport x locale baselines |
| `tests/browser/motion-pause.spec.ts` | test/browser | WCAG 2.2.2 control, persistence, reduced-motion runtime change |
| `tests/browser/view-transitions.spec.ts` | test/browser | Duration, pointer-events, click during transition |
| `tests/browser/security-headers.spec.ts` | test/browser | Headers and CSP snapshot |
| `tests/browser/no-webgl-on-reading-routes.spec.ts` | test/browser | 0 contexts and 0 texture requests on /cv /education /contact /about |
| `docs/architecture/overview.md` | docs | C4 context and container diagrams |
| `docs/decisions/0002-*.md` | docs | ADRs listed in target-state.md section 7 |
| `.agents/skills/audit-visual/SKILL.md` | skill | Catalog |
| `.agents/skills/audit-accessibility/SKILL.md` | skill | Catalog |
| `.agents/skills/audit-performance/SKILL.md` | skill | Catalog |
| `.agents/skills/evolve-design-system/SKILL.md` | skill | Catalog |
| `.agents/skills/change-content/SKILL.md` | skill | Catalog |
| `.agents/skills/animate-scene/SKILL.md` | skill | Catalog |
| `.agents/skills/write-adr/SKILL.md` | skill | Catalog |
| `.agents/skills/resume-refactor/SKILL.md` | skill | Catalog |
| `.agents/skills/score-repo/SKILL.md` | skill | Catalog |
| `.claude/settings.json` | harness | Allow/ask/deny and hooks (ecosystem 15.6) |
| `.claude/hooks/` | harness | format, guard-files, guard-bash, fast-check |
| `.claude/agents/` | harness | test-runner, reviewer, architecture-reviewer, designer-evaluator |
| `.codex/config.toml` | harness | Codex config (ecosystem 15.6) |
| `.mcp.json` | harness | Playwright and next-devtools only |
| `.devcontainer/devcontainer.json` | dx | One-command setup |
| `content/facts-snapshot.json` | content | Hash-checked snapshot of the career-ops facts used by copy (PF-D29) |
| `tests/unit/facts-sync.test.ts` | test/unit | Every number, date, title, employer and metric in EN/ES copy derives from the facts snapshot |
| `tests/unit/hero/easing-lut.test.ts` | test/unit | Easing LUT equals closed-form functions |
| `public/images/solar-system/posters/dark-wide.avif` | asset | Solar poster for reading routes (dark, wide) |
| `public/images/solar-system/posters/dark-narrow.avif` | asset | Solar poster (dark, narrow) |
| `public/images/solar-system/posters/light-wide.avif` | asset | Solar poster (light, wide) |
| `public/images/solar-system/posters/light-narrow.avif` | asset | Solar poster (light, narrow) |
| `public/hero/posters/ (20 SVG files)` | asset | Ten figures x two themes, generated by tools/render-posters.ts, <= 12 KB each |
| `.agents/skills/refresh-copy/SKILL.md` | skill | M6 copy refresh skill |
| `.agents/skills/refresh-contract/SKILL.md` | skill | Contract snapshot refresh |
| `docs/master-plan/owner-decisions.md` | docs/master-plan | Byte-identical owner decisions register |
| `docs/master-plan/owner-decisions-existing.md` | docs/master-plan | Byte-identical companion register |
| `tools/css-policy.ts` | tool | G8 and G11 literal and animation lint |

110 rows.

## 7. Removals

No file is deleted outright. Candidates for deletion after their content lands: `docs/release-history.md` (into `CHANGELOG.md`), the v1 `docs/master-plan/rubrics/*.md` and `ecosystem.md` (replaced by `rubrics.md`/`ecosystem.md`; v1 text stays in git history and `archive-v1/`), the `gsap` dependency (PF-D2, after the hero v2 and carousel no longer need it), and `src/features/hero/adapters/field-engine.ts` (after figure 01 reproduces its sphere within snapshot tolerance). Each removal PR cites the replacing file.
