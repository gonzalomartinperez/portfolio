# Senior designer rubric (UX)

Status: fixed rubric. Changing a dimension, weight or threshold requires an owner decision
recorded in the [decision log](../README.md#decision-log); scores from different rubric
versions are not comparable.

Lens: a senior product designer together with a senior front-end engineer, judging what a
visitor experiences. Source: the owner's `reports/portfolio-ux/RUBRIC.md` (kept outside this
repository), reproduced here without changes to its wording.

## Rubric (fixed across versions)

Score as a senior product designer + senior front-end engineer reviewing a personal portfolio of
an AI Engineer (Next.js, bilingual EN/ES, dark/light, with an original 3D particle sphere hero and
a 3D solar-system scene). Judge the experience of browsing the site end to end on desktop and
mobile. Architecture/refactors are out of scope; judge what a visitor experiences.

| # | Dimension | Max |
| --- | --- | --- |
| 1 | Visual design: hierarchy, typography scale, spacing rhythm, color/contrast, consistency of components (buttons, chips, cards, links) across pages and themes | 20 |
| 2 | Interaction and motion: purposeful animations, transitions between pages/sections, hover/focus/active states, scroll experience, micro-interactions, reduced-motion support; fluid and never janky | 20 |
| 3 | Performance: Core Web Vitals (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75), Lighthouse performance mobile/desktop, 3D cost on mid-range mobile, image/font loading | 15 |
| 4 | Accessibility: WCAG 2.2 AA (contrast, focus visible, keyboard paths, target size, semantics, alt text, motion), axe violations | 15 |
| 5 | Responsive quality: 320–1920 px, no overflow, comfortable reading measure, touch ergonomics, nav on mobile | 10 |
| 6 | Navigation and information scent: clear paths to work, case studies, CV, contact; wayfinding inside long pages | 10 |
| 7 | Uniqueness and delight: memorable, original, cohesive identity that feels "designed", not template | 10 |

95+ means it would hold up on Awwwards-level review AND pass a strict accessibility/performance
audit. Output: score per dimension with evidence (screenshots, metrics), total, and prioritized
issues.

## Application rules for this plan

- Score light and dark separately where a dimension depends on the theme; the owner requirement
  is light-mode parity with dark mode, so the lower theme score is the one reported.
- Evidence is a reproducible screenshot matrix (routes × EN/ES × light/dark × 390/768/1280/1920
  px), Lighthouse runs, axe runs and frame-time samples, as in the
  [October 2026 baseline](../audit/baseline-2026-10.md).
- Screenshots stay outside the public repository unless they are curated gallery images under
  `docs/gallery/`.
- Target: total ≥ 95 and every dimension at or above 95 % of its maximum (see
  [scorecard](../scorecard.md)).

## Baseline

| # | Dimension | Score | Max |
| --- | --- | --- | --- |
| 1 | Visual design | 15 | 20 |
| 2 | Interaction & motion | 14 | 20 |
| 3 | Performance | 7 | 15 |
| 4 | Accessibility | 12 | 15 |
| 5 | Responsive quality | 7 | 10 |
| 6 | Navigation & information scent | 7 | 10 |
| 7 | Uniqueness & delight | 8 | 10 |
| | **Total** | **70** | **100** |

Measured on 2026-10-24 against the live site (code reference `origin/main` at `b5b3c57`). Full
evidence: [UX audit baseline](../audit/baseline-2026-10.md).
