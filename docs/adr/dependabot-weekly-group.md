# ADR: one weekly grouped Dependabot PR

Date: 2026-11-14
Status: accepted (PF-M1-3); final in-place refresh observation due 2026-11-16

## Context

The owner rule (OD-22, OD-75, ecosystem standard section 5) is exactly one dependency PR per
repository per week, Monday 09:00 America/Argentina/Buenos_Aires, against `develop`, merged by
the owner. Security-update PRs stay off with alerts on; vulnerabilities are recorded silently in
one tracking issue and only the Monday summary notifies. Section 5.4 blocked the rollout until a
sandbox proved four points about multi-ecosystem groups.

## Evidence

The proof ran on the private `dependabot-sandbox` repository and is recorded in
[engineering-standards ADR 0002](https://github.com/gonzalomartinperez/engineering-standards/blob/v1.0.0/docs/decisions/0002-dependabot-weekly-group-sandbox-proof.md)
(release v1.0.0):

| Point | Result |
|---|---|
| uv and github-actions (and docker) accepted in one group | proven |
| Cooldown 7/14/3 applies inside the group | proven for npm and uv |
| An open group PR is never duplicated | proven (runs defer to the open PR) |
| The open PR is refreshed in place; Monday schedule honoured | to observe on 2026-11-16 12:00 UTC |

Group-level `open-pull-requests-limit`, `commit-message` and `labels` were accepted and applied
live; semver cooldown keys are rejected outside package ecosystems.

## Decision

- `.github/dependabot.yml` follows the standard release-flow template: group `weekly`, entries for
  npm (`/` and `/tools/api-contract`) and github-actions, the two existing major-version ignores.
- `deps-weekly-guard`, `vuln-daily` and `drift` call the pinned engineering-standards reusable
  workflows. The guard keeps only the newest group PR and flags a red one; the daily job edits one
  tracking issue silently and only the Monday run comments.
- `dependency-policy.yml` is removed. The `tools/dependency-policy.mjs` classifier and its fixtures
  stay as a local, read-only assessment aid and keep running inside `npm run check`.

## Consequences

- Dependabot reads its configuration, and GitHub runs scheduled workflows, only from the default
  branch. `main` changes only at the M7 release (OD-11), so until then the live configuration
  stays the older `weekly-all` group and the guard, daily and drift schedules do not fire; run
  them manually on `develop` (`workflow_dispatch`) when needed. Drift also runs on every PR.
- When the M7 release reaches `main`, the renamed group opens a `weekly-<hex>` PR. The pinned
  guard matches only `weekly-<hex>`, so it does not close an open `weekly_all-<hex>` PR: close it
  as part of the M7 release checklist. The branch policy accepts both names until then.
- Dependabot-triggered runs get a read-only token, so the guard has no `pull_request` trigger;
  it runs on the Monday schedule and on demand. Until the in-place refresh is observed, the owner
  closes a stale weekly PR to get a fresh complete one.
