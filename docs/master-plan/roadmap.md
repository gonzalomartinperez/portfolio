# Roadmap

Part of the [master plan](README.md). Milestones are the ecosystem's ([ecosystem.md](ecosystem.md) section 3A): each is a safe point with a green `release` profile on `develop`, an updated [progress.md](progress.md), the annotated tag `checkpoint/M<n>` and a tracker row. All work lands on `develop` through task branches `<type>/<milestone>-<slug>` and a green `ci-gate`; `main` (and therefore Hostinger) changes only at M7 or an authorized hotfix. IDs are `PF-M<n>-<k>`; "Audit" references are findings F1-F21 in [audit.md](audit.md).

Effort: S <= 2 agent hours, M 2-8, L 8-24 (hours of agent work, not calendar; an L task also shows a day range at 6-8 productive agent hours per day). Every row carries its hours; each milestone heading is the sum of its rows. Agents work in parallel worktrees; at most two repos are in heavy design work at once ecosystem-wide, so M5 for this repo is scheduled against the Pequeverso and backoffice design work. Totals (sum of rows): M0 3 h, M1 44 h, M2 81 h, M3 104 h, M4 74 h, M5 211 h (hero 86), M6 59 h (copy refresh PF-M6-1..6 48 h), M7 10 h; all milestones 586 h; MV 26 h separately (owner-gated). **Critical path** (the longest dependency chain, 254 h, computed from Depends by script over the Depends and Effort columns of this file, using whole-row hours; ranges are expanded explicitly): PF-M0-1 (2) -> PF-M1-1 (4) -> PF-M1-2 (10) -> PF-M2-2 (6) -> PF-M2-4 (6) -> PF-M2-11 (6) -> PF-M3-1 (24) -> PF-M3-3 (10) -> PF-M3-15 (2) -> PF-M4-1 (8) -> PF-M4-2 (10) -> PF-M4-3 (20) -> PF-M5-4 (86) -> PF-M5-7 (8) -> PF-M5-9 (4) -> PF-M6-1 (4) -> PF-M6-2 (7) -> PF-M6-3 (16) -> PF-M6-5 (6) -> PF-M6-8 (3) -> PF-M6-9 (2) -> PF-M7-1 (4) -> PF-M7-2 (4) -> PF-M7-3 (2). Recompute after any Depends or Effort edit (run from the repo root, prints hours and chain): `python3 -c "import re,functools as f;R={};[R.__setitem__(c[0],(int(re.search(r'(\d+) h',c[3]).group(1)),c[4])) for c in ([x.strip() for x in l.split('|')[1:-1]] for l in open('docs/master-plan/roadmap.md')) if len(c)>5 and re.fullmatch(r'PF-M[0-8]-\w+',c[0])];D=lambda s:[k for m in re.finditer(r'PF-M(\d)-(\d+)([a-z]?)(?:\s*(?:\.\.|…)\s*(?:PF-M\d-)?(\d+)([a-z]?))?',s) for k in R if re.fullmatch(r'PF-M%s-(\d+)[a-z]?'%m[1],k) and (k=='PF-M%s-%s%s'%(m[1],m[2],m[3]) if not m[4] else int(m[2])<=int(re.findall(r'\d+',k)[1])<=int(m[4]))];B=f.lru_cache(None)(lambda k:(lambda p:(p[0]+R[k][0],p[1]+[k]))(max(map(B,D(R[k][1])),default=(0,[]))));print(max(map(B,R)))"`. Everything else runs in parallel worktrees, so wall-clock is the critical path plus review and CI waits, roughly three to four weeks of continuous operation.

## Status convention and RESUME

Every task row has a stable ID (`PF-M<n>-<k>`, letter suffixes for the per-view splits) and a Status of `todo`, `in-progress` or `done (PR #<n>, <SHA7>)`. The task PR that finishes a row also edits that row to `done (...)` and adds or updates its line in [progress.md](progress.md) section "In-flight tasks" (the PR merges with a merge commit, never a squash, so the SHA recorded is the merge commit on `develop`). Branches are named `<type>/<milestone>-<slug>`, and each PR title starts with the task ID, which makes the history searchable.

**RESUME mid-milestone** (finds the true next task even when `progress.md` lags; run from the repo root):

```bash
git fetch -q origin
git log origin/develop --oneline --grep 'PF-M'           # merged task IDs (PR titles start with the ID)
gh pr list --state all --search 'PF-M in:title' --limit 50   # open, merged and closed task PRs
git tag --list 'checkpoint/*'                            # last safe point
grep -n '| todo |\| in-progress |' docs/master-plan/roadmap.md | head -20
```

Rules: the next task is the first `in-progress` row if its PR is open (finish it), otherwise the first `todo` row of the lowest milestone whose Depends are all `done`. If a PR for an ID is merged but the row still says `todo`, fix the row first (a docs PR) and continue. Never start a milestone while an earlier one has a `todo` row that is not on its exit list.

## M0 Plans merged (3 h)

| ID | Task | Acceptance | Effort | Depends | Status |
|---|---|---|---|---|---|
| PF-M0-1 | Docs-only PR to `develop` replacing `docs/master-plan/` with this plan; create `archive-v1/` (`git mv` of the v1 research and rubrics per [file-moves.md](file-moves.md)) in the same PR | `docs` profile green; links resolve; `archive-v1/` exists and is linked from the README; `progress.md` row M0; tag `checkpoint/M0` | S, 2 h | - | done (PR #224, a8d70a5) |
| PF-M0-2 | Record the delegated resolutions (PF-D4, PF-D15, PF-D20, PF-D25, PF-D27) and the two genuine owner inputs (PF-D26 and the final-copy approval, MV) in the README decisions table | Decisions table shows every row as resolved except the two owner inputs, listed identically in README, RESUME and `progress.md` | S, 1 h | PF-M0-1 | done (PR #224, a8d70a5) |

Risks: none technical. Cross-repo: the same M0 for all repos.

## M1 Foundation (44 h)

| ID | Task | Acceptance | Effort | Depends | Status |
|---|---|---|---|---|---|
| PF-M1-1 | `standards.lock`, community files, README template skeleton, PR and issue templates, `security.txt`, `CODE_OF_CONDUCT`, `SUPPORT`, CODEOWNERS | Drift check green; files byte-match the standards templates | S, 4 h | PF-M0-1; E1 or in-repo templates | done (PR #239, eebdce6) |
| PF-M1-2 | `classify` job, `ci-profile.json` at `.github/`, profile-conditional jobs, rename the required check to `ci-gate`, caches per [ci-cd.md](ci-cd.md) section 3, `tests/unit/ci-profile.test.ts` | Docs-only PR p50 <= 2 min; code PR p50 <= 5 min and p95 <= 10 min over 10 runs; no file outside every group; ruleset requires `ci-gate` only | M, 10 h | PF-M1-1 | in-progress |
| PF-M1-3 | Dependabot single weekly PR config, `deps-weekly-guard`, removal of `dependency-policy.yml`; sandbox proof first | Sandbox result in an ADR; one grouped PR observed or simulated; guard test | S, 4 h | E2 (cross-repo) | done (PR #240, 9fabaac) |
| PF-M1-4 | Hardening: `permissions: {}`, zizmor, CodeQL default setup, dependency-review, osv-scanner daily, Scorecard weekly, `npm ci --ignore-scripts` allow-list, harden-runner audit, remove `pull_request_target` (PF-D20) | zizmor 0 high; CodeQL on; Scorecard baseline recorded in `ratchets/` | M, 8 h | PF-M1-2 | done (PR #244, 8a673ee) |
| PF-M1-5 | Harness: `.claude/settings.json`, hooks, agents (incl. `designer-evaluator`), `.codex/config.toml`, `.mcp.json`, skill symlinks, `check-skills` skeleton, `agent-review.yml` | `check-skills` green; hook denies `pkill -f`, force push, `.env` reads (tests) | M, 8 h | PF-M1-1 | done (PR #243, 0518de5) |
| PF-M1-6 | Release automation per OD-78 (`VERSION`, `release.yml` on `main`, version-bump PR), seeded `CHANGELOG.md`, immutable releases and `v*` tag ruleset settings | `release.yml` validated by policy; version and changelog test passes; ADR records OD-78 | S, 3 h | - | todo |
| PF-M1-7 | Devcontainer, `npm run setup`, `npm run check` equals CI static job, AGENTS.md command test | Fresh container reaches a green `check` in one command | S, 4 h | PF-M0-1 | done (PR #238, 5a6135e) |
| PF-M1-8 | Node 24 + non-blocking Node 26 CI job; Rocky 8 job kept | Both run; 26 result recorded (PF-D19) | S, 3 h | PF-M0-1 | done (PR #237, c8afecd) |

Exit: every job on shared CI v1 green; one weekly Dependabot PR observed or simulated; `scorecard.json` skeleton exists. Risks: reusable workflows depend on `engineering-standards` (E1); until it exists the in-repo policy tools remain.

## M2 Quality net (81 h)

Widget rows PF-M2-W and PF-M2-X (listed at the end of this file) are counted in this milestone's 81 h.

| ID | Task | Acceptance | Effort | Depends | Status |
|---|---|---|---|---|---|
| PF-M2-1 | Runner spike (E7, DR-09, decides for all four TypeScript repos): Vitest 4 preferred if Stryker works with TS 7, else node:test + tap-runner | ADR 0010; decision recorded | S, 2 h | PF-M0-1 | todo |
| PF-M2-2 | Convert 18 `.test.mjs` to TypeScript on the chosen runner; fix the 2 git-dependent tests (temp repo fixture) | 344 tests green without `.git`; 0 `.mjs` under `tests/` | M, 6 h | PF-M2-1, PF-M1-2 | todo |
| PF-M2-3 | Coverage floor, diff coverage 85% on PR, `ratchets/coverage.json` | Floors enforced; baseline recorded | S, 2 h | PF-M2-2 | todo |
| PF-M2-4 | Stryker incremental on PR, full weekly; scope domain, application, hero geometry, content validators, tools policy | PR break 60; weekly target 75-80 baseline recorded; PR job runs in parallel with `build` and e2e, wall-clock <= 8 min (changed-file scope, remainder deferred to nightly), so the code profile p95 <= 10 min holds (deviation PF-D30 from the ecosystem 30 min figure; see [testing.md](testing.md) section 4) | M, 6 h | PF-M2-2, PF-M1-2 | todo |
| PF-M2-5 | Visual baselines: routes x themes x viewports x locale samples in the pinned container, reduced-motion variant | Baselines committed, 0 diff on a clean run, regenerated only by the CI job | M, 7 h | PF-M1-2 | todo |
| PF-M2-6 | axe `wcag22aa` all routes x theme x locale; keyboard journeys; zoom reflow; target size; forced-colors smoke | 0 serious/critical; moderate findings listed in `ratchets/a11y.json` (8 today) | M, 6 h | PF-M1-2 | todo |
| PF-M2-7 | `tools/lighthouse-gate.ts` (13.5, median of 5), 3D-disabled lane, per-route budgets, `ratchets/lighthouse.json`; warn mode first | Gate runs on the 7 routes; baseline matches [audit.md](audit.md) within noise on a quiet runner | M, 7 h | PF-M1-2 | todo |
| PF-M2-8 | Fluidity specs: frames, LoAF, INP, reduced-motion lane; GPU lane schedule | Specs run; today's failures recorded as the ratchet baseline | M, 7 h | PF-M1-2 | todo |
| PF-M2-9 | fast-check property tests | 100 PR / 1,000 nightly; named properties in [testing.md](testing.md) | S, 2 h | PF-M2-2 | todo |
| PF-M2-10 | Security tests: headers snapshot, ZAP baseline, built-output forbidden strings | Snapshot test; ZAP nightly 0 high | S, 3 h | PF-M1-4 | todo |
| PF-M2-11 | `tools/scorecard.ts`, nightly `scorecard.json`, ratchet check, all `ratchets/*.json` | Nightly artifact produced; regression fails the job; no gate in warn mode older than 14 days | M, 6 h | PF-M2-3, PF-M2-4, PF-M2-5, PF-M2-6, PF-M2-7, PF-M2-8 | todo |
| PF-M2-12 | Flake detector nightly and `tests/quarantine.json` | 0 flaky required tests over 14 days (30 by M6) | S, 2 h | PF-M2-5, PF-M2-6 | todo |
| PF-M2-13 | Content and SEO tests: EN/ES key parity, structured data, sitemap, robots, hreflang, lychee, cspell es-419, `cv:sync:check`; **facts-to-site test skeleton** (PF-D29) loading the `career-ops` facts snapshot | Tests green; skeleton fails on an injected wrong number | M, 7 h | PF-M2-2 | todo |
| PF-M2-14 | `build-info.json`, post-deploy verification workflow, scheduled synthetic smoke (30 min) | Workflow validated against a local build; probe opens an issue after 3 failures | S, 3 h | PF-M1-2 | todo |
| PF-M2-15 | First independent evaluator run on three lenses, executed twice with fresh evaluators to calibrate (accept only if the per-axis delta is <= 3 points, else rerun with a clarified rubric note); replace provisional scores | `progress.md` and `ratchets/scorecard.json` updated; calibration delta <= 3 on every axis recorded; rubric v2 frozen | S, 4 h | PF-M2-11 | todo |
| PF-M2-16 | Mobile-GPU proxy run per release: Chromium with 4x CPU throttle and the hero forced to tier 1 and tier 2 on SwiftShader plus the WebKit iPhone project, recording frame p95 and LoAF; on hardware only through the owner device checklist (M5 and M7) | Lane runs in the `release` profile; result stored in the release artifact; regression versus the previous release fails the lane; owner device checklist stays a manual M5 and M7 step | S, 3 h | PF-M2-8, PF-M2-11 | todo |

Exit: `scorecard.json` nightly; golden-set items do not apply here; no warn-mode gate older than 14 days. Risks: visual baselines flaky (mitigate with the pinned container, masks and the 0.01 tolerance); Lighthouse noise (median of 5, quiet runner).

The M2 total includes PF-M2-W and PF-M2-X (listed at the end of this file).

## M3 Phase A polish (P0 and P1 findings) (104 h)

| ID | Task | Acceptance | Effort | Depends | Files | Status |
|---|---|---|---|---|---|---|
| PF-M3-1 | JS budget: `tools/bundle-attribution.ts`; cut initial JS to <= 90 KiB gz on reading routes and <= 110 KiB on home; remove GSAP (PF-D2) via `ScrollProgress` and a CSS carousel; mount scenes after LCP; analytics and assistant emit no code when off; hypotheses (to verify by attribution, not asserted): large `technologies.ts` in client chunks, scene code in initial chunks, React Flow, Radix, lucide (Audit F1) | `ratchets/bundle.json` met on all routes; `budget.test` green; 3D-disabled Lighthouse perf >= 0.90 on `/cv` and `/contact` mobile | L, 24 h (3-4 d) | PF-M2-7, PF-M2-11 | `tools/bundle-attribution.ts`, `ratchets/bundle.json`, `src/shell/page-motion.tsx`, `src/features/**/entry.tsx` | todo |
| PF-M3-2 | `SceneHost` and route policy (PF-D1): 0 contexts and 0 texture requests on `/cv`, `/education`, `/contact`, `/about`, 404; ambient 512 px textures and per-theme posters (4 AVIF); remove the probe canvas context; at most one animating context on mobile; solar 30 fps behind content and render on demand after 10 s idle (Audit F2, F3) | `no-webgl-on-reading-routes.spec.ts` green; texture bytes on reading routes 0; home getContext calls <= 2 desktop and 1 mobile animating | L, 20 h (3-4 d) | PF-M2-7, PF-M2-8, PF-M2-11 | `src/shared/scene/scene-host.ts`, `src/features/hero/adapters/scene-runtime.ts`, `tests/e2e/no-webgl-on-reading-routes.spec.ts` | todo |
| PF-M3-3 | Mobile first screen: h1 no opacity gate; curated mobile catalogue, "Skip to projects" first, inert collapsed chips (PF-D10); home height <= 12,000 px at 390 (Audit F1, F10) | LCP <= 2.0 s on the 3D-disabled lane (mobile, median of 5); page-height budget; tab stops to primary CTA <= 6 with skip links | M, 10 h | PF-M3-1, PF-M3-2 | `src/views/`, `src/app/globals.css`, `ratchets/bundle.json` | todo |
| PF-M3-4 | Motion pause control in header and footer, persisted, wired to `setPageMotionPaused` (also the future hero loop) (Audit F4) | `motion-pause.spec.ts` (WCAG 2.2.2, runtime reduced-motion change) | S, 3 h | PF-M2-8 | `src/shell/motion-toggle.tsx`, `tests/e2e/motion-pause.spec.ts` | todo |
| PF-M3-5 | Lightbox respects the active filter (`gallery-carousel.tsx:137-141`) (Audit F5) | Regression test fails before, passes after | S, 2 h | PF-M2-2 | `gallery-carousel.tsx` (lines 137-141), `tests/unit/` | todo |
| PF-M3-6 | Header sticky at every width including < 26 rem; targets 44 px; skip links (Audit F6) | Specs at 320 and 390; axe target-size 0 | S, 4 h | PF-M2-5, PF-M2-6 | `src/shell/`, `tests/e2e/` | todo |
| PF-M3-7 | Locale-aware 404 (`/es/...`) (Audit F7) | Spec EN and ES | S, 2 h | PF-M2-13 | `src/app/`, `tests/e2e/` | todo |
| PF-M3-8 | `tools/image-audit.ts`; 11 raster images unoptimised in `public/` (9 converted to AVIF/WebP with dimensions, 2 `*-original.jpg` masters moved to `media/`; see [file-moves.md](file-moves.md) section on images); originals to `media/` | 0 unoptimised images in `public/`; byte budget | S, 3 h | PF-M2-3 | `tools/image-audit.ts`, `public/images/`, `public/certificates/`, `media/companies/` | todo |
| PF-M3-9 | Filomena diagram: heading order, `tabindex=-1` nodes with roving entry, skip-diagram link (Audit F15) | axe moderate 0 (8 today); <= 10 tab stops | S, 4 h | PF-M2-6 | `src/features/` (Filomena diagram), `ratchets/a11y.json` | todo |
| PF-M3-10 | Light-mode defects only (planet night side darkens, portrait ground, scene contrast); full parity waits for M5 (Audit F9) | Worst-frame contrast >= 4.5:1 test; snapshots | M, 8 h | PF-M2-5 | `src/app/globals.css`, `src/features/hero/`, `src/shared/identity/` | todo |
| PF-M3-11 | Docs: README to template, Diataxis moves, MADR scaffolding, CHANGELOG (Audit F20) | README heading check; lychee green | M, 8 h | PF-M1-1 | `README.md`, `docs/`, `CHANGELOG.md` | todo |
| PF-M3-12 | Skills rewrite to the catalog with activation evals ([skills.md](skills.md)) | `check-skills` and evals green | M, 8 h | PF-M1-5 | `.claude/skills/`, `.agents/skills/`, `tests/skills/` | todo |
| PF-M3-13 | Fonts: `next/font/local`, two families, <= 100 KB (PF-D21) (Audit F17) | Font budget; CLS 0 | S, 3 h | PF-M2-7 | `src/app/layout.tsx`, `public/fonts/` | todo |
| PF-M3-14 | Biome 0 warnings; git-independent tests (Audit F16) | `ratchets/static.json` 0 | S, 3 h | PF-M2-2 | `biome.json`, `ratchets/static.json` | todo |
| PF-M3-15 | Re-score 1 (evaluator) | No regression vs M2 ratchets; P0 and P1 closed with evidence | S, 2 h | PF-M3-1..14 | `progress.md`, `ratchets/scorecard.json` | todo |

Exit: P0 and P1 closed. Risk: performance work weakening the scenes (acceptance: sphere and solar field remain and are visibly intact; posters appear only on reading routes).

## M4 Architecture and TypeScript (74 h)

| ID | Task | Acceptance | Effort | Depends | Files | Status |
|---|---|---|---|---|---|---|
| PF-M4-1 | Convert 37 `.mjs` files to TypeScript; keep `next.config.mjs` and `postcss.config.mjs` as documented exceptions | `.mjs` count 2 in `ratchets/static.json`; G10 enforced | M, 8 h | PF-M3-15 | `tools/*.mjs`, `scripts/*.mjs`, `ratchets/static.json` | todo |
| PF-M4-2 | Guard G1-G12 with negative fixtures; Biome `noImportCycles`; knip; enforce with empty baseline | 0 violations; fixtures fail as expected | M, 10 h | PF-M4-1 | `tools/architecture.ts`, `tests/fixtures/architecture/`, `biome.json`, `knip.json` | todo |
| PF-M4-3 | Split `scene-runtime.ts`, `solar-system-engine.ts` responsibilities and `content/technologies.ts`; extract view sections where complexity exceeds budget | Cognitive complexity <= 15 ratcheting to 10; client bundles do not import the technologies catalogue (G5) | L, 20 h (3-4 d) | PF-M4-2 | `src/features/hero/adapters/scene-runtime.ts`, `src/features/hero/adapters/field-engine.ts`, `src/content/technologies.ts` | todo |
| PF-M4-4 | tsconfig strictness set; `allowJs` off | `tsc` 0 errors | M, 6 h | PF-M4-1 | `tsconfig.json` | todo |
| PF-M4-5 | Token pipeline (DTCG, Style Dictionary v5) with aliases and no pixel change | Visual baselines unchanged; `theme.css` snapshot | M, 8 h | PF-M2-5, E13 | `tools/build-tokens.ts`, `src/design/theme.css`, `src/app/globals.css` | todo |
| PF-M4-6 | CSP and SRI spike: strict `script-src` in Report-Only | ADR 0011 with measured result | M, 8 h | PF-M1-4 | `next.config.mjs`, `docs/decisions/0011-*.md` | todo |
| PF-M4-7 | ADRs 0002-0014 | Each has a Confirmation section met | S, 5 h | PF-M4-2, PF-M4-6 | `docs/decisions/` | todo |
| PF-M4-8 | Content schema, EN/ES parity in types, facts snapshot loader | Type errors on missing keys | M, 7 h | PF-M4-4 | `src/content/`, `content/` | todo |
| PF-M4-9 | RUM contract handoff (cross-repo): `web-vital` event proposal to `portfolio-assistant-api` | Handoff issue accepted; no code emitted before | S, 2 h | PF-M4-8 | cross-repo issue (no code) | todo |

Exit: guards enforce with empty baseline; 0 type errors.

## M5 Master design (211 h)

Widget rows PF-M5-W and PF-M5-X (listed at the end of this file) are counted in this milestone's 211 h; the hero (PF-M5-4) is the 86 h part.

Owner and agent split for the hero: H5 (HUD, controls, live region, posters) and H10 (monogram, polish, evaluator pass) are both agent work. The owner only approves the monogram look (PF-D15, resolved by delegation) at the M5 design review; that approval is non-blocking and does not hold the H10 merge.

| ID | Task | Acceptance | Effort | Depends | Files | Status |
|---|---|---|---|---|---|---|
| PF-M5-1 | Instrument blue pack, light and dark parity, aliases removed | Token tests; evaluator P5 >= 95 with light within 2 points | L, 16 h (2-3 d) | PF-M4-5, PF-M3-15 | `src/design/`, `src/app/globals.css` | todo |
| PF-M5-2 | Primitives with all states ([design-playbook.md](design-playbook.md) section 4), signatures 1-10 | State matrix visual baselines; contrast from tokens | M, 8 h | PF-M5-1 | `src/shared/ui/`, `src/shared/editorial/` | todo |
| PF-M5-3 | Motion tokens, scroll-driven reveals replacing `PageMotion`, page `<ViewTransition>`, theme reveal | Fluidity and view-transition specs green | L, 20 h (3-4 d) | PF-M5-1, PF-M3-4 | `src/shell/page-motion.tsx`, `src/shell/progress-rail.tsx`, `src/design/` | todo |
| PF-M5-4 | Hero particle system v2: tasks H1-H10 of [hero-particles.md](hero-particles.md) section 13 (hours: H1 10, H2 8, H3 14, H4 8, H5 8, H6 8, H7 6, H8 8, H9 12, H10 4 = 86 h; critical path H1, H2, H3, H4, H9 = 52 h; H5 and H10 in parallel) | Acceptance list of its section 12 | L, 86 h (11-15 d) | PF-M3-2, PF-M4-3, PF-M5-1, PF-D15 (resolved) | `src/features/hero/` (domain, adapters/gpu, presentation), `tools/render-posters.ts`, `src/shared/identity/monogram.ts` | todo |
| PF-M5-5 | Solar elevation: route-focused camera, 30% speed behind content, night-side shading | Planet contrast test; snapshots | M, 6 h | PF-M3-2, PF-M5-1 | `src/features/solar/`, `src/shared/scene/` | todo |
| PF-M5-6a | Wayfinding: sticky header at every width, 2 px scroll-driven progress rail with section index and `aria-current`, skip links, persistent recruiter shortcut ([design-playbook.md](design-playbook.md) section 9 wayfinding) | Rail has zero JS; header spec at 320 and 390; no page-height change | S, 6 h | PF-M5-3 | `src/shell/progress-rail.tsx`, `src/shell/` | todo |
| PF-M5-6b | Case-study view (`/work/filomena`, `/work/pequeverso`): impact summary first, diagram with text-first fallback, "On this page" and bottom sheet, next-case card | Playbook section 9 rows for the two views; page height at 390 <= 10,000 px (proposed budget, recorded in `ratchets/bundle.json` at the first M3 measurement from 20,441 px today and only ratcheted down); <= 10 diagram tab stops | L, 10 h (2-2 d) | PF-M5-2, PF-M3-9 | `src/views/` (case studies), `src/features/` (diagram, lightbox) | todo |
| PF-M5-6c | `/stack` virtualisation (`content-visibility: auto` or windowing), `Intl.PluralRules`, chips with a visible light ring | Page height at 390 <= 15,000 px (29,994 px today); keyboard filter spec; visual baselines both themes | M, 8 h | PF-M5-2 | `src/views/` (`/stack`), `src/content/technologies.ts` | todo |
| PF-M5-6d | About: portrait without a dark rectangle in light, 65ch measure, three short narrative blocks | Contrast over the poster stable; page height at 390 <= 6,000 px (proposed, ratcheted from first measurement) | S, 4 h | PF-M5-2 | `src/views/about-sections/`, `src/shared/identity/` | todo |
| PF-M5-6e | `/cv` and `/education`: print stylesheet, body >= 15 px, PDF twin one click, 0 contexts | Print snapshot; `/cv` height at 390 <= 8,803 px (today, ratchet only down); 0 WebGL contexts | S, 4 h | PF-M5-2 | `src/views/` (`/cv`, `/education`), print stylesheet | todo |
| PF-M5-6f | Home, `/work`, `/contact`, 404: remaining views per playbook section 9 (copy-to-clipboard `aria-live`, featured work reachable without the hero journey) | Home height at 390 <= 12,000 px; `/work` <= 30 tab stops; per-view acceptance rows pass | M, 6 h | PF-M5-4, PF-M3-3 | `src/views/` (home, `/work`, `/contact`, 404) | todo |
| PF-M5-7 | Three signature moments | View-transition and hero specs | M, 8 h | PF-M5-3, PF-M5-4 | `src/shell/`, `src/features/hero/` | todo |
| PF-M5-8 | Bilingual polish | ES width tests both themes | S, 3 h | PF-M5-6a..f | `src/i18n/`, `content/` | todo |
| PF-M5-9 | Docs gallery regeneration; evaluator pass; monogram (PF-D15, resolved) reviewed in the hero evaluator pass | Visual baselines approved both themes; P and R7 >= 95 or a documented gap list | S, 4 h | PF-M5-1, PF-M5-2, PF-M5-3, PF-M5-4, PF-M5-5, PF-M5-6a, PF-M5-6b, PF-M5-6c, PF-M5-6d, PF-M5-6e, PF-M5-6f, PF-M5-7, PF-M5-8, PF-M5-W, PF-M5-X | `docs/gallery/`, `tools/capture-gallery.ts` | todo |

Risk: two repos in heavy design at once ecosystem-wide is capped; schedule against the Pequeverso and backoffice design windows.

The M5 total includes PF-M5-W and PF-M5-X (listed at the end of this file) and the six per-view tasks PF-M5-6a..f, which replace the former single PF-M5-6.

## M6 Excellence verified (and the copy refresh) (59 h)

| ID | Task | Acceptance | Effort | Depends | Status |
|---|---|---|---|---|---|
| PF-M6-1 | **Facts source freeze**: refresh the synced snapshot from `career-ops` (`perfil/datos/hechos-cv.json` and `perfil/perfil-canonico.md`), regenerate `content/cv-public.json` and the PDFs, record the source commit and hash; collect the measured post-refactor results from the sibling repos (portfolio and Pequeverso assistants: golden set 100%, scores, architecture) as an owner-approved facts addendum recorded in `career-ops` first, never invented here | Hash matches the `career-ops` source; every fact the copy will use has a source line; owner approval recorded (PF-D26) | S, 4 h | PF-M5-9 | todo |
| PF-M6-2 | **Facts-to-site content test** (`tests/unit/facts-sync.test.ts`): every number, date, title, employer, metric and percentage rendered in EN or ES copy, case studies and the stack page must derive from the facts snapshot; the stack page counts come from `content/technologies/*` and the inventory in `career-ops`; unsourced numerals fail | Test required in `ci-gate`; injected wrong number fails; 100% of numerals on the site mapped | M, 7 h | PF-M6-1, PF-M2-13 | todo |
| PF-M6-3 | **Copy refresh, pages**: every page in EN and ES (home, work, about, stack, education, CV page, contact, assistant page, 404, metadata, JSON-LD) rewritten to the final post-refactor reality; natural, non-AI-sounding prose under the positioning v3 rules (`career-ops/operacion/posicionamiento-v3-2026-10-24`): concrete verbs, no filler or stock phrases, no inflated claims, specific over generic, owner voice | Editorial checklist (`change-content`/`refresh-copy` skill) passes; cspell and Vale 0 errors; ES written natively, not translated; no claim without a source line | L, 16 h (2-3 d) | PF-M6-1, PF-M6-2 | todo |
| PF-M6-4 | **Copy refresh, case studies and projects**: Filomena, Pequeverso (store, kit, assistant, backoffice) and the two assistants with measured results (golden set 100%, scores, architecture and its guard, CI evidence links), project descriptions, stack descriptions | Each metric links to its evidence (scorecard, CI run) and exists in the facts addendum; architecture diagrams updated; EN and ES parity test green | L, 12 h (2-2 d) | PF-M6-1, PF-M6-2 | todo |
| PF-M6-5 | **Recruiter-lens evaluation of the refreshed copy** by an independent evaluator (rubric lens 3, R1-R7) plus a naturalness review (rubric: AI-sound patterns list from positioning v3) | Every R axis >= 95 (R2 >= 90 if owner proof is missing, stated); no flagged AI-sounding pattern; owner approves the final copy (owner-only) | M, 6 h | PF-M6-3, PF-M6-4 | todo |
| PF-M6-6 | Copy-dependent artifacts regenerated: OG image, social preview, gallery captures, README Highlights, repo description and topics (inputs to the M8 GitHub profile milestone) | Assets match the final copy; README hash-checked sections consistent | S, 3 h | PF-M6-3, PF-M6-4 | todo |
| PF-M6-7 | Mutation thresholds at target (weekly full 75-80), complexity at 10, residual gaps, docs and skills finalised | `ratchets/*.json` at target | M, 6 h | PF-M5-9 | todo |
| PF-M6-8 | Independent three-lens re-score; two consecutive nightly scorecards with every axis at target (floors D7 field and R2 stated) | `scorecard.json` x2 green; `progress.md` | S, 3 h | PF-M6-5, PF-M6-7 | todo |
| PF-M6-9 | Re-copy shared standards byte-identical (`ecosystem.md`, `rubrics.md`, `owner-decisions.md`, `owner-decisions-existing.md`, `readme-template.md`) and run the drift check | Hash match with `engineering-standards` | S, 2 h | PF-M6-8 | todo |

Exit: every axis >= 95 (floors stated) on two consecutive nightly scorecards; copy refresh approved by the owner.

## M7 Release to main (10 h)

| ID | Task | Acceptance | Effort | Depends | Status |
|---|---|---|---|---|---|
| PF-M7-1 | Release PR `develop` to `main` after the APIs and backoffices have released; `release` profile green | Merge commit; tag `vX.Y.Z`; immutable GitHub Release with SBOM | S, 4 h | PF-M6-9; APIs and backoffices released | todo |
| PF-M7-2 | Hostinger autodeploy verification | `/build-info.json` SHA equals the release SHA; synthetic smoke green; owner iPhone checklist done | S, 4 h | PF-M7-1 | todo |
| PF-M7-3 | Back-merge PR `main` to `develop`; CHANGELOG and tags | Branches equal; changelog published | S, 2 h | PF-M7-2 | todo |

HSTS preload (PF-D25) is not submitted before M7; it is revisited after the release soak (delegated, resolved).

## M8 (ecosystem): GitHub profile showcase

Not a repository milestone here; this repo contributes its README, social preview, topics and description (PF-M6-6) and the hero and design assets, using only verified facts from `career-ops` (OD-08).

MV-R (VPS readiness tasks): none for this repository. The site is a static Next.js build on Hostinger and its assistant and analytics are build-time flags, so nothing VPS-bound needs preparing before M6; the API repos own their MV-R tasks. Readiness here is PF-M2-14 (`build-info.json`, smoke) and the PF-M4-9 handoff.

## MV VPS activation (gated by owner authorization and spend; 26 h, outside the milestone total)

| ID | Task | Acceptance | Effort | Depends | Status |
|---|---|---|---|---|---|
| PF-MV-1 | Build with `ASSISTANT_ENABLED=true` and the analytics flag against the deployed API; refresh the contract snapshot; production browser acceptance with the API's exact HTTPS origin | Enabled suite green; `test:assistant-disabled` still green | M, 6 h | M7; owner purchase of the VPS (owner input 2) | todo |
| PF-MV-2 | `web-vitals` events through the analytics contract; RUM dashboards in the backoffice | Field p75 LCP <= 2.0 s, INP <= 150 ms, CLS <= 0.05 with >= 500 views per grouped route; the D7 field part leaves its floor of 90 and reaches 95 (D6 is unaffected: it is scored on lab gates, field p75 is a post-MV ratchet only) | L, 12 h (2-2 d) | PF-MV-1, PF-M4-9 | todo |
| PF-MV-3 | Uptime Kuma probes replace the Actions smoke; privacy notice reviewed; no consent banner (EX-PF-02: analytics stay cookie-free and off by default, any measure needing consent is not shipped) | Probes green; notice text approved by the owner | M, 6 h | PF-MV-1 | todo |
| PF-MV-4 | Coordinated release record across the three portfolio repos | Release train checklist complete | S, 2 h | PF-MV-1..3 | todo |

## Dependencies on other repos

| Need | From | Needed by |
|---|---|---|
| Shared workflows, rulesets, tokens, templates (E1, E14) | `engineering-standards` | M1, M4, M5 |
| Dependabot sandbox proof (E2), release-please location (E5) | cross-repo | M1 |
| Instrument blue pack identical to the backoffice | `portfolio-backoffice` plan | M4, M5 |
| Assistant contract snapshot and `web-vital` handoff | `portfolio-assistant-api` | M4, MV |
| Measured assistant results and golden-set status for the copy refresh | `portfolio-assistant-api`, `pequeverso-assistant-api`, `pequeverso` | M6 |
| Facts source and positioning v3 | `career-ops` | M2 (skeleton), M6 |
| Release order APIs, backoffices, sites | all | M7 |

## Risks (consolidated)

Visual baselines flaky; polishing without baselines (M2 first); performance work weakening the scenes; hero GPU cost on mid phones (tiers, device checklist); figure 10 monogram quality (PF-D15 resolved; torus-knot fallback if the evaluator rejects it); copy refresh introducing claims (facts test, owner approval); Hostinger parity (Rocky 8 job, `build-info.json`); Stryker with TS 7 (spike); out-of-band Next.js security releases (monthly subscription).

## Assistant widget tasks (see [assistant-widget.md](assistant-widget.md))

| ID | Task | Acceptance | Effort | Depends | Status |
|---|---|---|---|---|---|
| PF-M2-W | Test scaffolding for the widget: SSE fixture server with pacing helpers, state-gallery route stub, state x theme x viewport snapshot matrix, axe runner, panel-chunk and INP gates in warn mode, red tests for collision and privacy rules | Tests exist and fail for the right reasons before the build; gates report in warn mode | M, 6 h | PF-M2-5, PF-M2-6 | todo |
| PF-M5-W | Widget design build: launcher states, panel, streaming UX, sources, tokens (dark and light), three signature details, analytics port (no-op until the contract adds the events) | Section 12 acceptance list of the spec; panel chunk <= 60 KB gz; axe 0 serious or critical; designer evaluator >= 95 | L, 16 h (2-3 d) | PF-M2-W, PF-M5-1 | todo |

## Assistant experience v2 widget tasks (see [assistant-experience.md](assistant-experience.md))

| ID | Task | Acceptance | Effort | Depends | Status |
|---|---|---|---|---|---|
| PF-M2-X | Block fixtures (every type, unknown type, web versus first-party source) in the SSE fixture server; red tests for fail-closed rendering and no remote favicon | Tests fail for the right reasons | S, 2 h | PF-M2-W | todo |
| PF-M5-X | Render typed blocks per widget section 14: citations with local icon sprite, project cards with stack icons, fundamentos, follow-ups, memory consent switch with "what I remember" and "forget me" | axe 0 serious or critical; no third-party requests; reduced-motion test | M, 6 h | PF-M5-W, PF-M2-X | todo |
