# Manual dependency review

Status: done

## Outcome and boundaries

Keep dependency proposals easy to assess while preserving owner-controlled merges.
Routine root npm, contract-tooling npm and GitHub Actions updates target `develop`.
Security proposals may still target the default branch and require explicit triage.
No version, application runtime, hosting configuration or merge protection changes.
The [operating policy](../dependency-updates.md) owns maintenance instructions.

## Acceptance criteria and local evidence

| Requirement | Verification |
| --- | --- |
| Weekly proposals, automatic rebasing and explicit manual routing for all three manifests/ecosystems | Configuration assertions and independent source review |
| No merge, approval, check-write or repository-setting capability | Read-only workflow permissions; transport rejects mutations and arbitrary GraphQL |
| Review actual snapshots instead of titles, groups or labels | Official bot identity, complete commit/file scope, fixed JSON paths, ordinary modes, byte lengths and Git blob hashes checked at base/head SHAs |
| Races, unknown packages, version classes, transitive changes or inaccessible metadata remain manual | Negative fixtures cover those boundaries; candidate output never grants permission |
| Advisory execution uses trusted source without dependency installation or PR code | Default-branch sparse checkout; six-file rehearsal passes all 11 fixtures without node_modules |
| Effective protection visibility is inspectable without activating automation | Fixed read-only probe returns inspectable or blocked, actual approval count and auto-merge setting; synthetic allowed/denied cases pass |
| Source quality remains enforced | Policy fixtures included in npm run check; full local check, lint, strict build, document checks and unchanged budgets pass |

## Verification record — 2026-10-17

The integrated local check passed 186 Node tests, including 11 policy tests. The
skill metadata validator and repository invariants also passed. Independent review
found the sparse job needed package.json for a fixture; adding that data file and
rehearsing only the six declared files resolved the defect without installation.
Two font-download retries completed normally in the same build; no mock font,
warning filter, dependency patch or weakened budget was introduced.

The manual routing label was explicitly created. Observed repository settings keep
auto-merge disabled, with no open Dependabot PR or pending auto-merge request at
review time. Existing protected checks/review requirements are preserved. Source
implementation is locally verified; the delivery PR records exact-head hosted CI,
publication and the separate read-only workflow-token inspection. A visibility
failure remains an explicit manual limitation, not permission to broaden access.
