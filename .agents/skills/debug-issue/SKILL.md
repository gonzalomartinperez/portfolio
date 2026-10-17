---
name: debug-issue
description: Reproduce and diagnose a portfolio defect, then fix it only when requested; use for failures, regressions, hydration errors, or build issues.
---

# Debug Issue

1. Read AGENTS.md and identify whether the request authorizes diagnosis only or a fix.
2. Establish expected behavior, exact reproduction, runtime version, and recent relevant changes. Inspect logs without exposing tokens or private data.
   For build failures, identify the phase (install, config, compile, types, runtime)
   and OS/architecture/system-library constraints. Read docs/deployment.md before
   changing the working Hostinger build. A warning followed by successful WASM
   compilation is not the same as a failed native compiler with no fallback.
3. If the source guard fails after a move, follow its reported dependency path.
   Decide which module owns the behavior before changing an import or adding an
   entrypoint. For a guard defect, preserve a minimal failing fixture; do not exempt
   a whole feature to get the source tree green.
   Separate symptoms from hypotheses. Use the smallest read-only experiment that distinguishes competing causes; do not change unrelated dependencies or kill unrelated processes.
4. For an authorized fix, add a focused regression check that exposes the defect, change the underlying cause, and verify the check now passes.
   Follow [the shared code-quality standard](../../../docs/code-quality.md) for
   fixes and workaround comments; keep only verified rationale and a useful removal
   condition, not a transcript of the debugging session.
5. For rendering bugs, distinguish server output, hydration, and client behavior. For dependency bugs, verify declared compatibility and the lockfile rather than forcing installation.
   Capture the failing locale, theme, viewport and motion preference. For hero
   issues, include the scroll direction and whether the full toolkit has settled;
   use [task-specific QA](../../../docs/development.md#task-specific-qa) for regression coverage.
   For stale CV downloads, compare the rendered hash-versioned link and response
   bytes with the manifest before changing caching or hosting configuration.
6. If a failure suggests exposed credentials, follow the
   [secret-review procedure](../prepare-delivery/references/secret-review.md).
   Use sanitized finding metadata rather than reading `.env` or dumping request,
   response, cookie, process-environment or provider logs. Separate diagnosis,
   proposed remediation and any separately authorized rotation execution.
   Use the verification and warning policy in docs/development.md. Report the cause, evidence, correction if authorized, and unresolved uncertainty. Stop when further action needs a new account, destructive reset, or expanded scope.
