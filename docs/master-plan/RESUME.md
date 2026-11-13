# Resume brief: portfolio master refactor

Self-contained: a new Claude (or Codex) session on any account, with no chat history, can continue from this file. Plan date 2026-11-09; baseline `develop` `0a1ff56`.

## What this is

A planned refactor of `gonzalomartinperez/portfolio` (public Next.js 16 site, EN/ES, dark and light, Hostinger from `main`) to at least 95 on every axis of three lenses (developer, designer, recruiter). Highlights: CI and security to the ecosystem standard, a quality net (visual, axe, Lighthouse, fluidity, mutation, property tests), performance fixes (JS, textures, WebGL contexts), TypeScript everywhere, "Instrument blue" master design, a 10-figure GPU hero particle system, a full copy refresh at M6. The plan is documentation only until the owner starts each milestone.

## Read order

1. This file; then [progress.md](progress.md) (current milestone and next item).
2. [README.md](README.md) (requirements, decisions PF-D1..PF-D29, delegated resolutions and owner inputs).
3. [owner-decisions.md](owner-decisions.md) and [owner-decisions-existing.md](owner-decisions-existing.md) (never contradict them).
4. [roadmap.md](roadmap.md) (the checklist), [scorecard.md](scorecard.md), [audit.md](audit.md).
5. Task-specific: [target-state.md](target-state.md), [design-playbook.md](design-playbook.md), [hero-particles.md](hero-particles.md), [testing.md](testing.md), [ci-cd.md](ci-cd.md), [standards.md](standards.md), [skills.md](skills.md), [dependencies.md](dependencies.md), [file-index.csv](file-index.csv), [file-moves.md](file-moves.md).
6. [ecosystem.md](ecosystem.md) (shared standard), [rubrics.md](rubrics.md).
7. Repo files: `AGENTS.md`, `CLAUDE.md`, `docs/development.md`.

## First commands

```bash
cd ~/projects/github/gonzalomartinperez/portfolio
git fetch -q && git checkout develop && git pull --ff-only
git tag --list 'checkpoint/*'                 # last safe point
nvm use && npm ci                              # Node from .nvmrc (24.x)
npm run check                                  # mirrors CI (build + budgets)
gh pr list --state open                        # nothing half-done
```

Find the true next task with the RESUME command in [roadmap.md](roadmap.md) section "Status convention and RESUME" (it reads merged task IDs with `git log origin/develop --oneline --grep 'PF-M'` and `gh pr list --state all --search 'PF-M in:title'`, then takes the first `in-progress` row with an open PR, otherwise the first `todo` row whose Depends are all `done`); after M0 that is PF-M1-1. Create a worktree and branch `<type>/<milestone>-<slug>` from fresh `origin/develop` for each task.

## Ready-to-paste prompt

```text
You are continuing the portfolio master refactor. Read docs/master-plan/RESUME.md, then progress.md, then owner-decisions.md. Check out develop at or after the latest checkpoint/M<n> tag, confirm no refactor PR is half-done, and run the RESUME command from roadmap.md to find the true next task (first `in-progress` row with an open PR, else the first `todo` row whose Depends are done) and execute it in a dedicated worktree and a task branch from origin/develop. Follow the per-PR pipeline in ecosystem.md section 15A: local verification, PR with evidence, green ci-gate, independent review (and the Codex second opinion), merge only with `gh pr checks --watch && gh pr merge --merge` (merge commit, never squash). Never touch main, never use --admin, never commit secrets, never invent facts or metrics (facts come from career-ops). On each task merge, set the task row in roadmap.md to `done (PR #, SHA)` and update the "In-flight tasks" section of progress.md; the milestone table of progress.md changes only at milestones. Report concisely when the milestone's exit criteria are met.
```

## Owner inputs (ask, never assume)

1. PF-D26 and PF-D29: approved list of measured results and case-study details to publish (before M5), and approval of the final copy at PF-M6-5.
2. MV: VPS purchase and activation authorization (after M6; owner steps are purchase, DNS and secret entry only).

Everything else was delegated and resolved on 2026-11-09 (README). Standing rules that need no new input: promotion `develop` to `main` follows the M7 release procedure, no hotfix before M7, the weekly Dependabot PR is merged by the owner only, and scopes, tokens and vulnerability exceptions are never created by an agent.

## Non-negotiable rules

- Flow: task branch, PR into `develop`, green `ci-gate`; `main` only at M7 (no hotfix before M7, OD-11 and DR-01); Hostinger redeploys on every merge to `main`.
- Never `--admin`; never force-push protected branches; merge only with `gh pr checks --watch && gh pr merge --merge` (merge commit, never squash; never chained with `;`).
- No secrets in git, logs, images or artifacts; `.env.local` stays local; no provider key in the site.
- Dependabot: exactly one weekly PR (Monday 09:00 America/Argentina/Buenos_Aires); never merge it as an agent; never open a second dependency PR.
- No claim, metric or employer material without owner approval; CV facts come only from `career-ops`.
- Never `pkill -f` (it kills the shell and other agents' watchers); kill by verified PID.
- GitHub identity is `gonzalomartinperez` only in commits and `gh`.
- Every animation honours `prefers-reduced-motion`, animates transform and opacity only, and ships a pause control for anything that runs over 5 s.
- Guard hooks block destructive commands; do not work around a block, ask the owner.
- Keep at least 100 GB free on Windows drive C: before disk-heavy work.
- No hotfixes before M7 (OD-11, DR-01): nothing reaches `main` before the M7 release, including the consent change, which ships with the refactor.
- Decisions registers: [owner-decisions.md](owner-decisions.md) and [owner-decisions-existing.md](owner-decisions-existing.md); read before acting and never contradict them.
