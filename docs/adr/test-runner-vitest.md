# ADR 0010: Vitest as the test runner, StrykerJS with the Vitest runner

Date: 2026-11-14
Status: accepted (PF-M2-1, spike E7; decides for the four TypeScript repositories per DR-09)

## Context

DR-09 asks one spike to choose the unit and integration runner for the four TypeScript
repositories: Vitest preferred if StrykerJS works with TypeScript 7, otherwise `node:test` with
the Stryker `tap-runner`. The repository runs TypeScript 7.0.2 (the native compiler), whose npm
package exposes no JavaScript compiler API until 7.1 (`typescript` exports only `version`
and `unstable/*` entry points). Tests today are 43 `node:test` files (18 `.mjs`) executed by
Node 24 type stripping.

## Spike (2026-11-14, Node 24.22.0, 4 vCPU WSL2)

Versions: `vitest` 5.1.0 (current line; the plan named Vitest 4, which is superseded),
`@vitest/coverage-v8` 5.1.0, `@stryker-mutator/core`, `vitest-runner` and
`typescript-checker` 10.1.1.

| Check | Result |
|---|---|
| Existing tests under Vitest after the one-line import change (`node:test` to `vitest`, `node:assert` kept) | `assistant-state.test.ts` and `cloud-layout.test.ts`: 27 tests, all green once `testTimeout` is raised (two cloud-layout cases take 6-9 s; `node:test` has no default timeout) |
| Stryker 10.1 + Vitest runner on `src/features/assistant/domain/models.ts` | works: 80 mutants, score 77.50 (62 killed, 11 survived, 7 no coverage), 2.3 tests per mutant, 3 min on this machine |
| Stryker TypeScript checker on TS 7 | fails: `ts.parseConfigFileTextToJson is not a function` (no JS API in TS 7.0) |
| Stryker tsconfig preprocessor | must be skipped: point `tsconfigFile` at a non-existent file; `disableTypeChecks` keeps injecting `// @ts-nocheck` into mutated files |
| Sandbox copy | the symlinked skill directories (`.claude/skills/*`) break the sandbox copy (`EISDIR`); `ignorePatterns` must exclude `.claude`, `.agents`, `.codex`, docs, media and public assets |

The `tap-runner` fallback was not exercised: DR-09 selects it only if Stryker fails on Vitest,
and it did not.

## Decision

- Vitest 5 is the runner for unit and integration tests (`tests/unit`, `tests/integration`);
  Playwright stays for `tests/browser`. Browser Mode is not used.
- StrykerJS 10 with `@stryker-mutator/vitest-runner`; no TypeScript checker until TypeScript
  7.1 ships the compiler API (re-evaluate then; `tsc --noEmit` in CI still rejects type errors).
- Conversion keeps `node:assert/strict` and maps `t.after()` to Vitest `onTestFinished()`,
  `before`/`after` to `beforeAll`/`afterAll`; `testTimeout` is raised for the geometry suites.
- The same choice applies to `pequeverso`, `portfolio-backoffice` and `pequeverso-backoffice`
  (DR-09); their leads can reuse the Stryker settings above.

## Consequences

- Good: one runner with coverage (`v8`), watch mode and the Stryker runner with the best support;
  incremental mutation (`--incremental`) per PR.
- Bad: no type checking of mutants (more compile-error mutants survive as runtime errors or are
  killed by tests rather than skipped); mutation runs are CPU-heavy (about 2 s per mutant here),
  so PR scope stays limited to changed files (PF-D30).
- Follow-ups: PF-M2-2 (conversion), PF-M2-3 (coverage), PF-M2-4 (mutation), PF-M2-9 (fast-check).
