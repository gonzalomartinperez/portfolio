---
name: prepare-delivery
description: Verify a portfolio change for handoff and prepare a Conventional Commit; commit or push only when the user explicitly authorizes those actions.
---

# Prepare Delivery

1. Read AGENTS.md and inspect Git status, intended branch, remote, and the exact diff. Keep unrelated changes out of staging.
2. Verify the relevant acceptance criteria and npm run check plus git diff --check. For dependency changes, also verify npm ci and npm audit.
3. Inspect public content, tracked artifacts, metadata, and staged changes for credentials, private documents, unsupported claims, and machine-specific data. Never echo suspected secrets.
4. When authorized to commit, stage explicit paths and review git diff --cached. Use type(scope): imperative summary, a body explaining purpose and tradeoffs, and actual validation results.
5. Include breaking-change and issue footers only when real. Do not invent a test result, sign-off, signature, or issue reference.
6. Push only when authorized and the remote and target match the task. Do not force-push. Verify remote visibility and synchronization; check CI when available.
7. Report commit, repository state, validation evidence, and limits. A successful push does not prove deployment or DNS configuration, and a clean lint does not prove security.
