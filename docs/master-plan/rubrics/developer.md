# Senior developer rubric (engineering)

Status: fixed rubric. Changing an axis, formula or threshold requires an owner decision
recorded in the [decision log](../README.md#decision-log); scores from different rubric
versions are not comparable.

Lens: a senior software engineer reviewing the repository as production code and as a public
showcase: correctness, design, testability, operability and supply chain. The axes and formulas
come from the quality scorecard in the
[engineering target state](../research/engineering-target-state.md) (§7.1); the human review
checklist comes from the repository's own [code-quality standard](../../code-quality.md) and
[engineering standards](../../engineering-standards.md).

## Rule of the rubric

Each axis is scored 0–100. The repository meets the bar only if **every** axis is ≥ 95; no
average may hide a weak axis. Light and dark themes are measured separately where an axis
depends on rendering, and the minimum counts.

## Axes (automatic formulas)

| Axis | Formula | Source | Target |
| --- | --- | --- | --- |
| Code quality | 100 − penalties: guard/baseline violations (−5 each), CSS literals outside tokens (−1 each), non-exempt files > 400 lines (−2 each), knip dead exports (−1 each); TS/Biome errors must be 0 or the axis is 0 | `test:architecture`, `css-policy`, `knip`, metrics script | ≥ 95 |
| Test quality | 0.5 × mutation score (domain + application + tools) + 0.3 × branch coverage of those layers + 0.2 × (100 − 20 × quarantined tests) | Stryker JSON, native Node coverage, quarantine report | ≥ 95 (mutation ≥ 95 in domain/application by the end of Phase C) |
| Accessibility | 100 if 0 serious/critical across all combinations, −10 per unique serious/critical violation, −1 per moderate; minimum with Lighthouse Accessibility | axe JSON, Lighthouse | ≥ 95 (and Lighthouse Accessibility = 100) |
| Performance | Minimum of: median Lighthouse mobile performance over the 7 key routes; % of routes within JS/CSS/HTML budgets × 100; and, once field data exists, % of p75 CWV metrics on target × 100 | Lighthouse, budgets, RUM | ≥ 95 |
| UX (automatable proxy) | 100 − unapproved visual diffs (−10) − overflow/target-size/zoom failures (−5) − failed E2E journeys in any engine (−10) − motion regressions (scene not `running` where required, frame p95 outside contract) (−5) | Playwright visual/E2E per engine | ≥ 95; the [designer rubric](designer.md) remains the UX authority |
| Docs | % of required ADRs accepted, `--check` of token table and generated docs up to date, 0 broken internal links, every `docs/specs/*.md` with status and acceptance criteria | docs scripts | ≥ 95 |
| CI reliability | 100 × (successful non-flaky runs / runs with valid code) over 30 days, −5 if p90 > 10 min | `gh run list` + Playwright reports | ≥ 95 |
| Security | Expected headers present in production (monitor), 0 high advisories in `npm audit` for both lockfiles, clean secret scan, no new CSP report-only violations | post-deploy monitor, CI | ≥ 95 |

## Human review checklist

Automatic axes do not replace review. A senior developer review records, with evidence:

1. Correctness against the acceptance criteria, including failure and disabled-feature paths.
2. Dependency direction: the [module contract](../../architecture.md#source-module-contract) and
   the Clean Architecture decision rule (a feature gains a layer only when it has I/O, time,
   state persisted across navigations, or a policy worth testing without a DOM).
3. Server/client boundaries: no server-only data in client bundles and no unneeded client
   JavaScript.
4. Testability: behavior covered at the cheapest layer that proves it; no tests that only restate
   an edit.
5. Operability and supply chain: pinned versions, justified dependencies, reproducible build and
   observable release evidence.
6. Blockers are reproducible defects; suggestions are labeled as such.

## Baseline

No numeric developer-lens score exists yet for this repository: `tools/scorecard.ts` is a
planned Phase B deliverable. Measured facts available on 2026-10-24 (from the engineering
target state): 85 success, 11 failure and 4 cancelled among the last 100 CI runs since
2026-10-17, CI duration p50 7.6 min and p90 8.4 min, Nightly 8/8 success; axe runs without
`wcag22aa`; no visual regression, Lighthouse or RUM gates. Producing the first scorecard is the
first acceptance criterion of Phase B (see the [roadmap](../roadmap.md)).
