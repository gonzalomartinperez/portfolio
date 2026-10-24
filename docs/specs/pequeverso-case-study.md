# Pequeverso case study, case-study alignment and CV 2026-10-24.1

Status: implemented

## Outcome and scope

Recruiters can read a second case study, about the Pequeverso client project, at
`/work/pequeverso` and `/es/work/pequeverso`, reached from the independent-work entry on
Work. The Filomena case study keeps every section heading on the same left edge as its
text. The public CV, its PDFs and document manifest follow career release `2026-10-24.1`
(two pages per language), and every route shares the approved 2026-10-24 social preview.

Facts come only from the approved brief and the three public Pequeverso repositories. No
revenue, traffic or sales figure is published for Pequeverso, and the assistant is described
as implemented and evaluated, not launched. Non-goals: enabling the assistant or analytics,
changing the byte-preserved assistant/analytics API contracts, or redesigning the case-study
layout.

## Acceptance criteria

- AC-1: On `/work/filomena` and `/es/work/filomena`, every section `h2`, caption and prose
  block starts at the same left edge on desktop and mobile, in both themes.
- AC-2: Filomena title, metadata title and prose contain no em dashes in either locale.
- AC-3: `/work/pequeverso` and `/es/work/pequeverso` render the Filomena case-study structure:
  eyebrow "Case study · Client project", title, lead, technology chips, a qualified stat row,
  overview, problem, what was built, architecture, decisions, a filterable gallery, current
  status and evidence links to the live store and the three public repositories.
- AC-4: Every metric carries a qualifier; copy is natural US English and neutral Spanish
  without em dashes; the gallery uses only public captures without personal data, each with
  bilingual alt text and recorded dimensions.
- AC-5: The independent-work entry on Work shows a primary "View case study" / "Ver el caso
  de estudio" action to the localized route. The sitemap, route list, footer, metadata,
  hreflang alternates and catalogue evidence include the new page.
- AC-6: The CV JSON is exported from the three approved inputs, the two promoted PDFs are
  copied unchanged, `content/public-documents.json` records their sizes and hashes, and
  `npm run cv:sync:check` passes with the same inputs. Resume descriptions say two pages.
- AC-7: Open Graph and Twitter metadata for every EN and ES route point to
  `/social/portfolio-og-2026-10-24.png` (1200 × 627) with localized alt text.

## Design and decisions

- Case-study styles moved from `filomena.module.css` to a shared `case-study.module.css`.
  Before this change the heading had a centered `22ch` box while `.prose` stayed at the left
  edge (measured at 1440 px: heading x=471, prose x=137, caption x=345). All three now use
  the content column's left edge, capped at `--measure-text`; wide elements keep the frame.
- `GalleryCarousel` accepts optional `flows`, defaulting to the existing Filomena flows, so
  Pequeverso filters by Store, Assistant and Back office without a second component.
- Pequeverso content lives beside Filomena in `content/{en,es}/projects.ts` and
  `gallery.ts`; ids and dimensions live in the registered `content/pequeverso-gallery.ts` and
  `content/pequeverso-image-dimensions.json`. `Role.caseStudyHref` keeps the Work action
  data-driven.
- Images: the store hero (store text-zoom verification capture), the assistant's expanded
  desktop and mobile fixture captures (assistant API `docs/verification`, local fixture
  provider) and three back-office captures (sign-in, synthetic dashboard, test-account access
  page). Converted to WebP at quality 82, at most 1600 px wide. Thumbnails cap at 34rem high
  with top-aligned cover cropping; the dialog shows the full image.
- Superseded on 2026-10-24 by the [v3 proof-first follow-up](ai-engineer-positioning-v3.md#proof-first-follow-up):
  16 captures (store 2, assistant 5 from the 2026-10-18 fixture runs, back office 9 with
  synthetic MOCK data) in uniform 3:2 frames; panel and phone captures use `contain`.
- The analytics and assistant visitor-context route enums mirror external, byte-preserved
  contracts, so the new route is intentionally not an analytics dimension or assistant path
  until those contracts change in their owning repository.
- The generated per-locale Open Graph routes were replaced by the reviewed static image, and
  the retired 2026-10-13 LinkedIn thumbnail was removed.
- The 2026-10-24.1 CV hides the languages and certifications sections. The exporter now
  treats those two as optional (exported only while visible) and still requires experience,
  skills, education and projects. The CV parity test keeps the site's architecture claims
  and checks the shorter CV does not contradict them.

## Verification and handoff

See [the verification note](../verification/pequeverso-case-study.md).
