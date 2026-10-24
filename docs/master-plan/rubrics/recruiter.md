# Senior recruiter rubric (message)

Status: fixed rubric. Changing a dimension, weight or threshold requires an owner decision
recorded in the [decision log](../README.md#decision-log); scores from different rubric
versions are not comparable.

Lens: a senior technical recruiter and a startup founder hiring an AI Engineer. Source: the
owner's `reports/portfolio-scoring/RUBRIC.md` (kept outside this repository), reproduced here
without changes to its wording.

## Rubric (fixed across versions)

Score as a senior technical recruiter (10+ years) and as a startup founder hiring an AI Engineer
(US startups, remote, open to LATAM), reading the live/production build of the candidate's
portfolio site in English (primary) and Spanish (parity check). Score the MESSAGE and copy
quality, plus responsive/visual polish as experienced by a visitor; do not score the information
architecture or the choice of views themselves.

| # | Dimension | Max |
| --- | --- | --- |
| 1 | Hero and first screen: who he is, what he does, why it matters, within 5 seconds, on desktop and mobile | 20 |
| 2 | Proof: AI evidence (evals, production agents, metrics), case studies (Filomena, Pequeverso), public code, consistent with CV and LinkedIn | 20 |
| 3 | Writing quality: natural US English and neutral LatAm Spanish, concise, no AI-sounding phrasing, no em dashes in prose, no jargon walls | 15 |
| 4 | Credibility and consistency: facts, dates, titles and numbers match the CV/LinkedIn; honest scope ("not yet deployed", "sole engineer after earlier developers") | 15 |
| 5 | Calls to action and navigation of the message: clear next steps (case studies, CV, contact), links work | 10 |
| 6 | Visual and responsive polish: alignment, spacing, overflow, readability at 375–1440 px, light/dark | 15 |
| 7 | Differentiation: would a founder say "wow, I want this person"? | 5 |

Rules: be strict; 95+ means top 1–2% of mid-level AI Engineer portfolios. Do not reward facts you
cannot see. Output: score per dimension with justification, total, the changes worth the most
points (exact replacement copy), and the "wow" answer.

## Application rules for this plan

- Facts are checked only against the owner's reviewed sources (public CV, brief and canonical
  profile, all outside this repository). The plan never adds claims or metrics without approval.
- Interface copy follows the [editorial guide](../../editorial-guidelines.md).
- Re-score after every release that changes public copy; the v1 score below predates the
  proof-first copy update merged to `develop` in PR #194 and must be re-measured once that update
  is in production.

## Baseline (v1, 2026-10-24)

Scored on the production build (EN and ES parity) with Playwright: 9 routes × 2 languages × 2
widths (1440 px and 390 px) × 2 themes = 72 renders. All 72 loads returned 200, no horizontal
scroll at 390 px and 0 console errors. Of 92 linked URLs, all returned 200 except LinkedIn (999)
and SCImago (403), both anti-bot blocks that open in a real browser. Screenshots live in
`reports/portfolio-scoring/shots-v1/` outside this repository.

| # | Dimension | Max | Score |
| --- | --- | --- | --- |
| 1 | Hero and first screen | 20 | 13 |
| 2 | Proof (AI evidence, cases, public code) | 20 | 15 |
| 3 | Writing quality | 15 | 10 |
| 4 | Credibility and consistency | 15 | 11 |
| 5 | Calls to action and message navigation | 10 | 8 |
| 6 | Visual and responsive polish | 15 | 12 |
| 7 | Differentiation ("wow") | 5 | 3 |
| | **Total** | **100** | **72** |

Main deductions recorded in the v1 score:

- No proof on the first screen, and the title line repeated twice in the same viewport.
- About 2,500 px of animation (sphere, logo constellation, 35-logo grid) before the first
  evidence; the hero constellation gives PyTorch, NumPy, pandas, Celery or Sentry the same weight
  as LangGraph and Claude.
- Technologies attributed to Rampy without backing in the CV, brief or canonical profile; a fixed
  tenure string ("2 years and 8 months ... as of September 2026") against "2.5+ years" in the CV.
- The Portfolio Assistant appears in the CV but not on `/work` or the home page.
- Em dashes remaining in visible prose on `/about`, `/education`, `/contact` and their Spanish
  pages.
- "Wow" answer: "Not yet"; with a proof line in the hero and a Rampy summary with numbers on the
  home page, the reviewer estimated 4/5 on dimension 7.

The ten highest-value changes (proof on the first screen, Rampy summary with numbers, retitling
the featured project, removing unbacked technologies, removing em dashes, tenure that does not
age, constellation without filler, the assistant visible on `/work`, minor copy fixes and visual
polish) are the input of the copy work tracked outside this plan.
