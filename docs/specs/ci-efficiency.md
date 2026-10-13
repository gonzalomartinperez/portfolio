# Efficient complete CI

Status: done

## Scope

Reduce the portfolio CI critical path through measured workload distribution and
reusable package downloads, preserving every quality gate and the hosting baseline.
Application and assistant behavior, dependency versions and branch protections are
outside this change.

## Acceptance

- Discover and execute the complete current browser suite exactly once across eight
  isolated runners. Automatically include new tests; validate every test-list selection
  and its complete union before sharing the run's production build.
- Preserve all four browser projects, one worker, test deadlines, retries, failure on
  flaky tests, existing conditional skips, screenshots, traces and protected check names.
- Keep both explicit dependency audits, contract drift detection, lint, types, budgets,
  rendered checks and the complete GLIBC 2.28/SWC WASM/Hostinger smoke verification.
- Share modern npm cache keys and prefer cached immutable package downloads without
  skipping frozen installs or reusing a previous workflow's build or test results.
- Bound slow DNF transfers while retaining official repositories, signature validation
  and strict errors. Retain timing evidence for future workload adjustments.

- Use a digest-pinned official Noble browser image matching the exact Playwright
  package version. Verify all four runtime variants before testing, without privileged
  capabilities, and measure image preparation plus full coverage in Actions.

## Verification

The [research record](../research/ci-efficiency.md) documents three successful baseline
runs and separates modeled placement estimates from measured workflow duration.
Unit tests exercise exact coverage, added tests, deterministic balance, invalid
selection, native discovery normalization and unsupported serial suites. Real CLI
round-trips and the complete local check are required before committing; final
current-head Actions results and release measurements are recorded in the PR.

Local verification completed: the enabled `npm run check` passed, all 16 targeted
planner/repository cases passed, and real Playwright round-trips verified all 434
current cases across eight groups (54–55 each). Estimated sums are 389.6–390.4
seconds, with existing and newly introduced tests included. Remote current-head
checks and measured workflow results are required before integration and recorded
in the delivery PR; this record does not claim an unobserved speedup.
