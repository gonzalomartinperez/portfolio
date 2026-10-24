# Master plan scorecard

Status: planning target, not yet measured automatically. Part of the [master plan](README.md).

The owner's bar is **95+ on every axis**, judged through three fixed lenses: senior developer,
senior designer and senior recruiter. An axis never borrows points from another; light and dark
are scored separately and the minimum counts.

## Lenses and baselines

| Lens | Rubric | Baseline (2026-10-24) | Target | Evidence |
| --- | --- | --- | --- | --- |
| Senior designer (UX) | [designer](rubrics/designer.md) | **70/100** | ≥ 95 total, each dimension ≥ 95 % of its maximum | [UX audit baseline](audit/baseline-2026-10.md) |
| Senior recruiter (message) | [recruiter](rubrics/recruiter.md) | **72/100** (v1, before PR #194) | ≥ 95 total, each dimension ≥ 95 % of its maximum | v1 score in the recruiter rubric |
| Senior developer (engineering) | [developer](rubrics/developer.md) | not computed yet | each of 8 axes ≥ 95 | engineering target state §7.1 |

## Designer axes

| # | Dimension | Max | Baseline | 95 % of max |
| --- | --- | --- | --- | --- |
| 1 | Visual design | 20 | 15 | 19 |
| 2 | Interaction & motion | 20 | 14 | 19 |
| 3 | Performance | 15 | 7 | 14.25 |
| 4 | Accessibility | 15 | 12 | 14.25 |
| 5 | Responsive quality | 10 | 7 | 9.5 |
| 6 | Navigation & information scent | 10 | 7 | 9.5 |
| 7 | Uniqueness & delight | 10 | 8 | 9.5 |

## Recruiter axes

| # | Dimension | Max | Baseline (v1) | 95 % of max |
| --- | --- | --- | --- | --- |
| 1 | Hero and first screen | 20 | 13 | 19 |
| 2 | Proof | 20 | 15 | 19 |
| 3 | Writing quality | 15 | 10 | 14.25 |
| 4 | Credibility and consistency | 15 | 11 | 14.25 |
| 5 | Calls to action and message navigation | 10 | 8 | 9.5 |
| 6 | Visual and responsive polish | 15 | 12 | 14.25 |
| 7 | Differentiation | 5 | 3 | 4.75 |

## Developer axes

| Axis | Baseline | Target |
| --- | --- | --- |
| Code quality | not computed | ≥ 95 |
| Test quality | not computed | ≥ 95 (mutation ≥ 95 in domain/application by the end of Phase C) |
| Accessibility | not computed (axe runs without `wcag22aa`) | ≥ 95, Lighthouse Accessibility = 100 |
| Performance | not computed (no Lighthouse gate) | ≥ 95 |
| UX (automatable proxy) | not computed (no visual regression) | ≥ 95 |
| Docs | not computed | ≥ 95 |
| CI reliability | 85 % success in the last 100 runs (not yet split into flake vs. real failure) | ≥ 95 |
| Security | not computed | ≥ 95 |

## Measurable experience gates

These gates feed the developer and designer axes. Values come from §7, §6A.4 (CI duration) and
§6A.5 (browser matrix) of the [engineering target state](research/engineering-target-state.md).

| Area | Criterion | Measured by | Phase |
| --- | --- | --- | --- |
| Lighthouse | Performance ≥ 95 mobile and ≥ 98 desktop; Accessibility = 100; Best Practices ≥ 95; SEO = 100 on `/`, `/work`, `/work/pequeverso`, `/work/filomena`, `/about`, `/cv`, `/es` | median of 5 runs in the `performance` job | gate in B6, target in C |
| Lab CWV | LCP ≤ 2.0 s, TBT ≤ 150 ms, CLS ≤ 0.05 mobile on the same routes | Lighthouse | B6 |
| Field CWV | p75 LCP ≤ 2.0 s, INP ≤ 150 ms, CLS ≤ 0.05 (Google "good": 2.5 s / 200 ms / 0.1) with ≥ 500 views/month per grouped route | RUM (B7) | C |
| JS per route | initial JS ≤ 90 KiB gzip on reading routes, ≤ 110 KiB on `/`; deferred scenes hero ≤ 150, solar ≤ 170, total ≤ 250 KiB | `test:budget` per route | B3/B6 |
| CSS | ≤ 25 KiB gzip total and decreasing; 0 color/size/duration/z-index/breakpoint literals outside tokens or listed exceptions | `css-policy` + budget | B1 |
| 3D | 0 WebGL contexts on `/cv`, `/education`, `/contact`; ≤ 1 animating context on any route; dispose to 0 resources; tier0 never downloads Three.js | SceneHost browser specs | B3 |
| Accessibility | 0 axe serious/critical with WCAG 2.2 AA on all routes × themes × locales × viewports and on `/_system`; target size ≥ 24 px (≥ 44 px on coarse pointers for primary controls) | axe + target-size spec | B6 |
| Visual | 0 unapproved diffs; baselines regenerated only by the CI job | Playwright `toHaveScreenshot` | A-E3 → B6 |
| Flakes | 0 flaky in `Required checks` for 30 days; ≤ 3 quarantined tests, none older than 14 days; 0 `waitForTimeout` | Playwright JSON report + spec lint | B6 |
| CI duration | PR p50 ≤ 7 min, p90 ≤ 10 min; nightly ≤ 45 min | Actions timings | B6 |
| Mobile Safari | iPhone 15 and iPhone SE WebKit projects pass E2E, visual and a11y; real-device checklist per release | Playwright WebKit + device checklist | B6 |

Note on the 3D row: the owner requires keeping the solar-system background. "0 WebGL contexts"
on reading routes therefore means a rendered poster of the same scene (not a generic CSS
fallback) unless the owner decides otherwise; see decision D2 in the
[decision log](README.md#decision-log).

## Automated measurement

- `tools/scorecard.ts` (planned, Phase B) runs in nightly and on every release, reads CI
  artifacts (architecture guard, css-policy, knip, Stryker, coverage, axe, Lighthouse, budgets,
  Playwright reports, `gh run list`) and publishes `.artifacts/scorecard.json` plus a job summary.
- Lighthouse: the engineering research recommends `lighthouse` 13.5.0 directly through a
  `tools/lighthouse-gate.ts` (5 runs, median, own assertions) instead of `@lhci/cli` 0.15.1,
  which is stalled on Lighthouse 12.6 (decision D6).
- Lighthouse and visual gates start in warn mode for 2 weeks before becoming required.
- Designer and recruiter scores remain human reviews against the fixed rubrics, using the
  automated evidence; they are recorded per release with the rubric version.
- Where to store the scorecard history (public repository or the owner's private `reports/`) is
  decision D9.
