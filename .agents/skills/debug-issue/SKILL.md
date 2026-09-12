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
3. Separate symptoms from hypotheses. Use the smallest read-only experiment that distinguishes competing causes; do not change unrelated dependencies or kill unrelated processes.
4. For an authorized fix, add a focused regression check that exposes the defect, change the underlying cause, and verify the check now passes.
5. For rendering bugs, distinguish server output, hydration, and client behavior. For dependency bugs, verify declared compatibility and the lockfile rather than forcing installation.
6. Use the verification and warning policy in docs/development.md. Report the cause, evidence, correction if authorized, and unresolved uncertainty. Stop when further action needs a new account, destructive reset, or expanded scope.
