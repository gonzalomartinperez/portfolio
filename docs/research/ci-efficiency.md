# CI efficiency

Reviewed 2026-10-12. Optimize the critical path without changing application tests,
engine coverage, one worker per runner, individual deadlines, retries or failure
on flaky tests. Keep the eight existing protected browser contexts and the
Hostinger GLIBC 2.28 build and smoke check.

## Measured baseline

Completed Actions jobs and step timestamps provide the baseline; these are real
workflow durations, not a promise about future runners.

| Run | Total | Development quality | Hostinger | Slowest browser job |
| --- | ---: | ---: | ---: | ---: |
| [Main](https://github.com/gonzalomartinperez/portfolio/actions/runs/38304815209) | 10m17s | 43s | 2m57s | 9m24s |
| [Release](https://github.com/gonzalomartinperez/portfolio/actions/runs/38303467513) | 11m33s | 58s | 1m14s | 10m26s |
| [Integration](https://github.com/gonzalomartinperez/portfolio/actions/runs/38302016640) | 12m39s | 55s | 11m13s | 11m36s |

Every browser job scheduled 53 cases, but the main run's test steps ranged from
157 to 493 seconds. Equal test counts do not represent equal work. The Hostinger
outlier spent 9m44s downloading BaseOS metadata at approximately 153 kB/s.

## Implementation

The [planner](../../scripts/browser-ci-planner.mjs) discovers the current suite with
the pinned Playwright CLI. It assigns the longest estimated tests first to the
least-loaded runner, using the [timing baseline](../../scripts/browser-ci-timings.json)
from the three successful runs above. New or renamed tests use the relevant
file/project median, with a minimum 15-second estimate. Old timings never select
or exclude tests.

Before publishing the same-run production artifact, Playwright rediscoveries each
of the eight generated `--test-list` files. Their identities must match the planned
selection exactly; their union must equal the entire current suite with no duplicates.
Explicit serial suites fail planning until whole-suite scheduling is implemented.
The reviewed suite contains none. Selectors use Playwright's test-directory-relative
paths; timing identities use stable repository-relative paths.

The artifact contains both the verified `.next` output and `.artifacts/ci` plan.
Browser jobs always consume that workflow's build and lists. No build outputs or
successful test results are reused from previous runs. The strict aggregate still
requires every job to succeed, including failed, skipped or cancelled prerequisites.

The timing seed contains 416 measured cases; the baseline discovered 424 cases,
including eight existing conditional skips. Planning estimates do not alter their
runtime conditions. A conservative replay of that baseline predicts about 372
seconds for the longest balanced test sum, versus approximately 535 seconds for
the previous count-based distribution. Installation, planning, queueing and runner
variance are outside that forecast. Actual new-run results belong in the delivery PR.

Modern runners use the same two-lockfile npm cache key, so the initial quality job
warms the cache before browser jobs start. `npm ci --prefer-offline` still installs
from the frozen lockfile and fetches missing packages; explicit audits cover both
locked dependency graphs. Contract generation avoids repeating the install-time
audit before those mandatory audits.

Rocky retains its pinned image, official repositories and signature verification.
DNF's 20-second connection/low-speed interval, 500,000-byte/s minimum rate and three
package retries make slow or failed transfers move on without weakening failure
handling. Build, SWC WASM fallback, GLIBC assertion and smoke coverage stay mandatory.
Browser binaries are installed normally: Playwright recommends against caching
them because restore time is comparable to download time and Linux dependencies
still need installation.

## Maintaining measurements

Each browser artifact retains `timing-report.json` and the complete `plan.json`,
alongside HTML reports, screenshots and traces. Refresh timing medians from several
successful runs after material suite changes; normalize identities using project,
repository-relative test file and full nested test title, excluding line numbers.
Do not derive a speedup from a single unusually fast run. A stale or missing timing
entry affects placement only; discovery and exact coverage remain mandatory.

Run `node scripts/browser-ci-planner.mjs` to verify a fresh plan without launching
browsers. Run a generated group with
`npm run test:browser -- --test-list=.artifacts/ci/shards/1.txt` after building with
`ASSISTANT_ENABLED=true`. Local ordinary browser commands remain unchanged.

## Primary references

- [Playwright test lists](https://playwright.dev/docs/test-cli#test-list)
- [Playwright sharding](https://playwright.dev/docs/test-sharding)
- [Playwright browser caching guidance](https://playwright.dev/docs/ci#caching-browsers)
- [GitHub dependency caching](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)
- [npm frozen installs](https://docs.npmjs.com/cli/v11/commands/npm-ci/)
- [DNF connection and low-speed settings](https://dnf.readthedocs.io/en/latest/conf_ref.html)

## First measured result

A fair comparison uses the same application and the exact same 434 discovered
identities, including the solar changes that followed the initial baseline:

| Run | Total | Quality | Slowest browser job |
| --- | ---: | ---: | ---: |
| [Same application before optimization](https://github.com/gonzalomartinperez/portfolio/actions/runs/38322601654) | 8m19s | 59s | 7m09s |
| [First optimized run](https://github.com/gonzalomartinperez/portfolio/actions/runs/38324711501) | 7m04s | 47s | 6m07s |

The observed total reduction is 75 seconds, approximately 15%, in one execution.
Runner and network variation still matter; this is not a guaranteed speedup. Every
native JSON report matched its planned group, and the complete union contained
434 unique identities with no omissions or duplicates: 423 passed, 11 existing
conditional skips, no unexpected results and no flaky tests. Those same skips
were present before optimization. Application and test behavior were unchanged.
