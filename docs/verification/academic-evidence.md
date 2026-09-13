# Academic evidence reconciliation

Reviewed on 2026-09-13. The owner explicitly authorized the complete original
academic transcript and university curriculum for publication. No other personal
documents are included by that authorization.

## Public source contract

`src/content/academic-catalogue.ts` is the shared catalogue for both languages.
Course codes provide stable IDs. Spanish names follow Plan 2012; English names are
editorial translations, with the original visible in the full record. The catalogue
contains 34 curriculum entries (including professional practice and final project)
and two separate English requirements. AP is not converted into a numerical grade.
Completion dates and grades come from the transcript, not curriculum placement.
The official 8.67 average is retained rather than recalculated from a partial list.

| Source | Treatment |
| --- | --- |
| Original UNS Plan 2012, two pages | Published unchanged; official names, codes, year and semester |
| Original transcript issued 2025-12-22, two pages | Published unchanged; final documented outcomes and dates |
| Historical academic page | Useful narrative incorporated; external-page dependency removed |
| Prior independent course lists | Replaced with views derived from the shared catalogue |
| Institutional rankings | Retained with editions; not represented as individual academic awards |
| ISO and quality award footer | Institutional academic-management scope only; not a personal credential |

Corrections include statistics in year two, databases in year three, the official
"Ingeniería de Aplicaciones de Web" name, and the IS/ISS suffixes on named courses.
The programme PDF retains legacy Software Engineering wording in several entries;
those course names are preserved rather than silently modernized.

## Privacy and validity review

Before copying, the coordinator was informed that the transcript contains the
owner's name, national identity and student record numbers, programme code,
academic outcomes, issue timestamp and official verification URL/token. Identifiers
are not separately transcribed into website HTML. Neither PDF has attachments.
Transcript metadata is empty except its creation date. The curriculum retains
ordinary Microsoft Word metadata and its original author label. No PDF is rewritten.

The transcript's six-month administrative validity has expired. The page labels it
as a historical record, not a currently valid certificate. The historical academic
page's verification token differs from this original PDF; no equivalence or live
verification status is asserted. The original includes its own verification link.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `uns-academic-transcript-2025.pdf` | 138567 | `39f0209f9ccf733bb5751c7c4e8faea090160993587c32b9f5deab83bbad779d` |
| `uns-information-systems-plan-2012.pdf` | 91190 | `acb00660434c1f140fb43ead87b1181e3abb328fd57f6893ad075c9aca3554d8` |

Original plan: <https://cs.uns.edu.ar/~devcs/downloads/PlanISI2012.pdf>.
No private roadmap, additional personal document or external snapshot is published.

## Acceptance

- All highlighted courses resolve to actual catalogue IDs.
- All 36 outcomes remain accessible using native expandable sections without JavaScript.
- Both languages expose original Spanish course names and documented results.
- Documents open directly and download without automatic PDF viewers or preloads.
- Hash tests reject changes to the reviewed originals.
- Browser and integrated build verification are recorded by the release coordinator.

Lane verification: all four original PDF pages visually inspected; three academic
catalogue/hash tests passed; repository invariants and lint passed. The baseline
content test still requires a Notion URL and must be updated by the integrator to
assert the local evidence contract instead. This intentional migration mismatch
is not treated as a passing full check. The production build, TypeScript and all
seven existing performance-budget checks also passed without budget changes.
