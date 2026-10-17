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
   Keep the native assistant disabled unless the current request explicitly authorizes
   activation. Verify default-off launcher absence and both assistant routes returning
   404; enabled fixture acceptance is not production activation.
   Keep product analytics independently off unless activation is authorized. Verify
   zero preactivation requests/storage and harmless delivery failure; `npm run test:analytics`
   is already part of `check`. Match the enabled loopback fixture to its built URL,
   and record disabled-build browser evidence separately. Preserve owned ports,
   resource leases and other sessions' Playwright browsers.
   Include production smoke results for application, compiler or runtime changes.
3. Inspect public content, tracked artifacts, metadata, and staged changes for credentials, private documents, unsupported claims, and machine-specific data. Never echo suspected secrets.
   Use the [redacted secret-review procedure](references/secret-review.md) when
   checking source, Git history or built client output. Record scan coverage and
   sanitized findings, not matched values or surrounding source. A failed scan
   does not authorize key creation, provider access or live credential rotation.
   For editorial or document changes, check [editorial guidelines](../../../docs/editorial-guidelines.md)
   and the [public-content release boundary](../../../docs/public-content.md): matching
   facts, reviewed generated outputs and hash-versioned downloads. Select remaining
   visual checks from [task-specific QA](../../../docs/development.md#task-specific-qa).
4. When authorized to commit, stage explicit paths and review git diff --cached. Use type(scope): imperative summary, a body explaining purpose and tradeoffs, and actual validation results.
5. Include breaking-change and issue footers only when real. Do not invent a test result, sign-off, signature, or issue reference.
6. Push only when authorized and the remote and target match the task. Task branches use PRs into develop; only this repository's develop may use a release PR into main. Never push directly to protected branches, force-push, bypass checks, or push a local integration merge. Verify remote visibility and synchronization; check CI when available.
7. Report commit, repository state, validation evidence, and limits. A successful push does not prove deployment or DNS configuration, and a clean lint does not prove security.
   For release PRs, confirm checks belong to the latest head before merging;
   compare the checked SHA with the current PR head and verify every required job,
   including browser groups, hosting compatibility and the aggregate gate. A green
   earlier run or another repository's reported checks cannot establish acceptance.
   Immediately after a push, GitHub can still display the previous run. Record
   Hostinger's deployed source separately from GitHub CI and live HTTP checks.
