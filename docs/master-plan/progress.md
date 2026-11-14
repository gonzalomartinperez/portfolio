# Progress log

Milestone log for the master refactor of `portfolio`. The milestone table and current state change only at milestones (safe points) by a PR to `develop`; the "In-flight tasks" section changes on every task merge; a drift check compares the nine-row table below with the other repos. A milestone is reached only when `develop` is green on the full `release` CI profile, no refactor PR is left half-done, this file is updated, and the annotated tag `checkpoint/M<n>` is pushed on `develop`.

## Current state

| Field | Value |
|---|---|
| Milestone | **M0** Plans merged (`checkpoint/M0` on `a8d70a5`); **M1** Foundation: every task merged or parked, awaiting orchestrator verification and `checkpoint/M1` |
| Date | 2026-11-14 |
| `develop` SHA at M0 | `a8d70a5b2c18e71867710809572cb7835b7cd8fc` (plan merge, PR #224; baseline was `0a1ff56`) |
| `main` SHA | `19954ee3ead969b69421dd912a20210d2f363094` (untouched until M7; same content as `develop` at baseline) |
| Next item | Finish PF-M1-2's duration budgets (tagged Chromium + iPhone WebKit PR browser set, then 10-run p50/p95 evidence); owner input for PF-M1-6; then M2 from PF-M2-1 (see [roadmap.md](roadmap.md)) |
| Known issues | M1: code PR still runs 8 full browser shards (full-profile PR runs 8.7-12.2 min; code p50 <= 5 min not met); devcontainer image build not run locally (Windows C: below the 102 GB floor); Dependabot config and scheduled workflows (guard, vuln-daily, drift, Scorecard) only go live from `main` at M7; Node 26.13.1 binary does not start on glibc 2.28 (PF-D19). Baseline: Mobile Lighthouse 35 (home), LCP 6.2 s lab; JS 395-465 KiB per route; solar textures on every route; WebGL contexts on reading routes; no pause UI; lightbox ignores filter; header not sticky below 26 rem; `/es` 404 English; 11 unoptimised images (9 convert + 2 masters moved); light-mode parity; 39 `.mjs`; 2 unit tests need git; Biome 3 warnings |
| Pending owner decisions | Owner inputs only (identical in README and RESUME): 1. PF-D26 and PF-D29, the approved list of publishable measured results and case-study details (before M5) and approval of the final copy at PF-M6-5; 2. MV, VPS purchase and activation authorization (after M6). All other decisions resolved by delegation (README) |

## In-flight tasks

Updated by each task PR on merge (task ID, branch, PR, merge SHA, state). Roadmap rows hold the authoritative `todo` / `in-progress` / `done (PR #, SHA)` status; this table is the human view and is reconciled with the RESUME command in [roadmap.md](roadmap.md) (`git log origin/develop --oneline --grep 'PF-M'` and `gh pr list --state all --search 'PF-M in:title'`).

| Task ID | Branch | PR | Merge SHA | State |
|---|---|---|---|---|
| PF-M0-1 | `docs/master-plan-2026-11` | #224 | `a8d70a5` | done |
| PF-M0-2 | `docs/master-plan-2026-11` | #224 | `a8d70a5` | done (resolutions recorded in the README with the plan) |
| M1 carry-over | `fix/m1-dependabot-grouped-branches` | #235 | `acf5e83` | done (grouped Dependabot branch accepted by the route checks) |
| M1 carry-over | `docs/m1-plan-sync` | #236 | `81b74a0` | done (M0 rows, README template resync; OD-75 wording verified) |
| PF-M1-8 | `ci/m1-node-26` | #237 | `c8afecd` | done; PF-D19 result: Node 26.13.1 exits 127 at startup on the glibc 2.28 hosting image (run 43549138744), code compatibility job green on ubuntu-24.04 |
| PF-M1-7 | `build/m1-devcontainer` | #238 | `5a6135e` | done; fresh-container build not run locally (disk floor), `npm run setup` and the AGENTS/README command test verified |
| PF-M1-1 | `chore/m1-standards-lock` | #239 | `eebdce6` | done (engineering-standards v1.0.0, `standards.lock`, private vulnerability reporting enabled) |
| PF-M1-3 | `ci/m1-dependabot-weekly` | #240 | `9fabaac` | done (standard weekly group, guard, vuln-daily, drift; ADR `docs/adr/dependabot-weekly-group.md`; Monday observation 2026-11-16) |
| PF-M1-2 | `ci/m1-classify-ci-gate`, `ci/m1-drop-required-alias` | #241, #242 | `fcb7ba7`, `d3e287f` | in-progress: classify, profiles, `ci-gate` and rulesets (`ci-gate` the only required check) done; duration budgets pending |
| PF-M1-5 | `chore/m1-agent-harness` | #243 | `0518de5` | done (`check-skills` green, hook denial tests); `agent-review.yml` parked (needs paid model API keys, owner) |
| PF-M1-4 | `ci/m1-hardening` | #244 | `8a673ee` | done (security set, harden-runner audit, CodeQL default setup, Scorecard baseline 6.4 in `ratchets/ossf-scorecard.json`) |
| PF-M1-6 | - | - | - | parked: release-please needs an owner-provided GitHub App token (or the Actions PR-creation setting) and the E5 sandbox validation (standards ADR 0003) |

Baselines are provisional until PF-M2-11 (`tools/scorecard.ts`) replaces them; PF-M2-16 (mobile-GPU proxy run per release) feeds the hero frame baselines afterwards.

Next task by the RESUME rule: PF-M1-2 (in-progress, no open PR): reduce the code-profile browser set to the tagged Chromium + iPhone WebKit journeys and record 10 docs and 10 code PR runs; PF-M1-6 waits for the owner. The M1 lead report is `reports/master-plans-2026-11/runs/M1-portfolio.md` in the workspace.

## Scorecard snapshot (baseline, rubrics v2; prov. = planner estimate until the M2 evaluator run)

| Axis | Score | | Axis | Score | | Axis | Score |
|---|---|---|---|---|---|---|---|
| D1 Architecture | 82 prov. | | P1 Visual design | 70 prov. | | R1 First screen | 78 prov. |
| D2 Code quality | 78 prov. | | P2 Interaction | 66 prov. | | R2 Proof | 80 prov. |
| D3 Tests | 74 prov. | | P3 Accessibility | 88 prov. | | R3 Writing | 80 prov. |
| D4 CI/CD | 76 prov. | | P4 Responsive | 80 prov. | | R4 Credibility | 84 prov. |
| D5 Security | 80 prov. | | P5 Theme parity | 55 prov. | | R5 Calls to action | 76 prov. |
| D6 Performance | 42 prov. | | P6 Consistency | 78 prov. | | R6 Polish | 70 prov. |
| D7 Observability | 50 prov. | | | | | R7 Differentiation | 82 prov. |
| D8 Docs and DX | 70 prov. | | | | | | |

Measured: unit 342/344 (2 need git); coverage lines 94.56, branches 91.36, functions 90.67; axe `wcag22aa` 0 serious (8 moderate heading-order); Lighthouse mobile home 35 / LCP 6.2 s, Filomena 39 / 5.8 s, `/cv` 55 / 3.5 s; JS transferred 395-465 KiB; textures 1.37 MB mobile and 2.22 MB desktop on every route; WebGL contexts on `/cv` and `/contact`; tab stops to the primary CTA 12; `npm ci` cold 3 m 43 s; build 91 s. Evidence: [audit.md](audit.md).

## Ecosystem status (nine repos, copied from the tracker; update only at milestones)

| Repo | Milestone reached | Date | `develop` SHA (`main` SHA for main-only repos) | Resume pointer |
|---|---|---|---|---|
| portfolio | M0 in progress | 2026-11-09 | `0a1ff56` (`origin/develop`) | `docs/master-plan/RESUME.md` |
| portfolio-assistant-api | planning (M0 pending) | 2026-11-09 | `e749ca7` (`origin/develop`) | `docs/master-plan/RESUME.md` |
| portfolio-backoffice | planning (M0 pending) | 2026-11-09 | `e356b13` (`origin/develop`) | `docs/master-plan/RESUME.md` |
| pequeverso | planning (M0 pending) | 2026-11-09 | `cbf519c` (`origin/develop`) | `docs/master-plan/RESUME.md` |
| pequeverso-assistant-api | planning (M0 pending) | 2026-11-09 | `6912579` (`origin/develop`) | `docs/master-plan/RESUME.md` |
| pequeverso-backoffice | planning (M0 pending) | 2026-11-09 | `4d4fb96` (`origin/develop`) | `docs/master-plan/RESUME.md` |
| vps-ops | planning (M0 pending) | 2026-11-09 | `f52c3e6` (`origin/main`) | `docs/master-plan/RESUME.md` |
| pequeverso-marketing | planning (M0 pending) | 2026-11-09 | `7d26bf4` (`origin/main`) | `docs/master-plan/RESUME.md` |
| dropshipping-ops | planning (M0 pending) | 2026-11-09 | `8ff0283` (`origin/main`) | `docs/master-plan/RESUME.md` |

The ecosystem tracker (`engineering-standards/progress/ecosystem.md`, or `vps-ops` until that repo exists) is the source; SHAs are `git -C <repo> rev-parse origin/<branch>` after `git fetch -q` on 2026-11-09 (`main` for the main-only repos `vps-ops`, `pequeverso-marketing`, `dropshipping-ops`, OD-12).

## Milestone log

| Milestone | Date | `develop` SHA | Scorecard snapshot | What changed | Next item | Known issues | Pending decisions |
|---|---|---|---|---|---|---|---|
| M0 | 2026-11-09 (baseline recorded; closes on merge of the plan PR) | `0a1ff56` | baseline above | Audit measured; plan v2 written; v1 replaced in place | PF-M1-1 | see Current state | see Current state |
