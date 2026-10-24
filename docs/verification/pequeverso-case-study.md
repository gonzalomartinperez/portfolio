# Pequeverso case study, case-study alignment and CV sync: verification

Date: 2026-10-24. Spec: [pequeverso-case-study](../specs/pequeverso-case-study.md).
Local runs used Node 24.22.0 from `.nvmrc` on a disabled production build (assistant and
analytics off), served with `next start` on a loopback port.

## Commands

| Check | Result |
| --- | --- |
| `npm run check` (architecture, quality, typecheck, content, lint, build, budgets) | Pass |
| `npm run test:architecture` | Pass, 38 tests; boundaries verified |
| `npm run cv:sync:check -- <cv-general.json> <hechos-cv.json> <manifest.json>` | Pass: public CV and PDFs match revision 2026-10-24.1 |
| Playwright `routes`, `gallery-native-navigation`, `responsive-layout`, `narrow-readability`, `mobile-refinements`, `work-architecture`, `expertise`, `shadcn-controls` (desktop and mobile projects, local disabled build) | 109 passed, 7 skipped |
| `git diff --check` | Clean |

Protected CI on the PR is the acceptance gate for the enabled build and the full browser
inventory.

## Acceptance evidence

- AC-1: Before (production, 1440 px): Filomena `h2` left x=471, prose x=137, caption x=345.
  After: headings, captions and prose all start at the content column. Inspected at 1440 and
  390 px, EN and ES, dark and light.
- AC-2: No em dash remains in the Filomena title, metadata title or prose (EN, ES).
- AC-3, AC-4: `/work/pequeverso` and `/es/work/pequeverso` inspected at 1440 and 390 px in
  both themes; no horizontal overflow; gallery filters (Store, Assistant, Back office) and
  enlargement dialog work; the route passes the shared accessibility and responsiveness test.
  Six WebP captures (15 to 134 KB) with bilingual alt text; the back-office captures show
  only synthetic data and `example.test` accounts, the assistant captures a local fixture run.
- AC-5: Work shows "View case study" / "Ver el caso de estudio" beside the client website
  link on the independent entry; footer, sitemap, alternates and catalogue evidence include
  the route.
- AC-6: Copied PDFs: EN 72,687 bytes, 2 pages, US Letter; ES 80,545 bytes, 2 pages, A4.
  Hashes equal the promoted manifest. CV sections are now experience, skills, projects and
  education, as in the promoted release.
- AC-7: Served HTML for `/`, `/es/work/pequeverso` and other routes emits `og:image` and
  `twitter:image` at `/social/portfolio-og-2026-10-24.png`, 1200 × 627.

## Screenshots

Captured locally (not committed) under the session scratchpad `shots/` directory:
`before-filomena-desktop.png`, `{,es-}work-filomena-{1440,390}-{dark,light}.png`,
`{,es-}work-pequeverso-{1440,390}-{dark,light}.png`, `work-independent-1440-light.png` and
`es-work-independent-390-dark.png`.

## Limits

The new route is not an analytics section or assistant visitor path: those enums mirror
external API contracts owned by another repository. Pequeverso facts are limited to the
brief and public repositories; the 303-turn run refers to an earlier assistant version.
A merged PR does not prove deployment; verify the served routes after release.
