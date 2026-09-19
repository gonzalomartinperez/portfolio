---
name: prepare-delivery
description: Verify a portfolio change for handoff and prepare a Conventional Commit; commit or push only when the user explicitly authorizes those actions.
---

# Prepare Delivery

1. Read AGENTS.md and inspect Git status, intended branch, remote, and the exact diff. Keep unrelated changes out of staging.
   For a cumulative release, reconcile the accepted requests against the release
   ledger before closing the PR. Mark unverified or excluded items explicitly;
   a passing feature lane does not establish integrated release acceptance.
2. Verify the relevant acceptance criteria and npm run check plus git diff --check. For dependency changes, also verify npm ci and npm audit.
   Reuse recorded passing checks only for the same source state, dependencies and
   runtime; follow docs/development.md instead of repeating unchanged builds.
   Include production smoke results for application, compiler or runtime changes.
3. Inspect public content, tracked artifacts, metadata, and staged changes for credentials, private documents, unsupported claims, and machine-specific data. Never echo suspected secrets.
   For editorial or document changes, check [editorial guidelines](../../../docs/editorial-guidelines.md)
   and the [public-content release boundary](../../../docs/public-content.md): matching
   facts, reviewed generated outputs and hash-versioned downloads. Select remaining
   visual checks from [task-specific QA](../../../docs/development.md#task-specific-qa).
4. When authorized to commit, stage explicit paths and review git diff --cached. Use type(scope): imperative summary, a body explaining purpose and tradeoffs, and actual validation results.
5. Include breaking-change and issue footers only when real. Do not invent a test result, sign-off, signature, or issue reference.
6. Push only when authorized and the remote and target match the task. Task branches use PRs into develop; only this repository's develop may use a release PR into main. Never push directly to protected branches, force-push, bypass checks, or push a local integration merge. Verify remote visibility and synchronization; check CI when available.
7. Report commit, repository state, validation evidence, and limits. A successful push does not prove deployment or DNS configuration, and a clean lint does not prove security.
   For release PRs, confirm checks belong to the latest head before merging;
   immediately after a push, GitHub can still display the previous run. Record
   Hostinger's deployed source separately from GitHub CI and live HTTP checks.
