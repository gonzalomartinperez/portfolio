# Responsive and visual QA pass: verification

Date: 2026-10-24. Scope: every public route (home, about, work, work/filomena,
work/pequeverso, stack, education, cv, contact and the 404 page) in EN and ES, dark and
light, at 375, 414, 768, 1024, 1280 and 1440 px. The fixes stay inside the existing design
system and do not redesign any view. Local runs used Node 24.22.0 on disabled production
builds served with `next start`. "Before" is develop `825b5cf`, "after" is this branch.

## Method

- Full-page Playwright screenshots of all 240 combinations, before and after, inspected
  as column strips.
- An automated layout audit at each width checked four things: document overflow,
  elements extending past the viewport outside scroll containers, interactive targets
  under 44 px, and clipped text. Touch emulation was used below 1024 px.

## Findings and fixes

| Finding (before) | Fix |
| --- | --- |
| Catalogue evidence links ran together ("Rampy ↗Teamcubation ↗"), and on wrap an arrow started the next line | Evidence links are a wrapping flex row with a gap; each label keeps its arrow (`technology-catalogue.module.css`) |
| Contact channel cards stacked at three different widths on phones | Channel cards fill the column below 40rem (`contact-links.module.css`) |
| Page jump links on Work and Education wrapped into ragged rows of different widths | Jump links in a header `nav.actions` share each wrapped row below 52rem (`globals.css`) |
| Footer links were 28 px tall on touch layouts | 44 px rows that span the column below 52rem or on coarse pointers (`site-footer.module.css`) |
| Locale switcher options were 38 px wide on touch layouts | 44 × 44 px below 52rem (`locale-switcher.module.css`) |
| Standalone links (home toolkit and principles links, carousel catalogue link, education ranking and certificate links) were 24–27 px tall | 44 px minimum below 52rem or on coarse pointers |
| Education record summaries were 43 px tall | 44 px minimum |
| Filomena section headings were offset from their text | Already fixed in #188 (shared case-study column) and confirmed in both locales here |

Nothing else turned up. No route had document overflow or text past the viewport at
any width, and the only clipped text the audit reported was the screen-reader-only "opens
in a new tab" note. The spacing between sections, galleries, carousels, header and footer
looked consistent.

## Accepted as-is

- On fine pointers at 1024 px and wider, footer links (28 px) and locale options
  (38 × 34 px) stay compact. They meet the WCAG 2.2 AA 24 px target size.
- Architecture-diagram node buttons scale with the React Flow viewport and can be
  zoomed; their size follows the diagram, not a fixed target.
- With reduced motion, the home toolkit renders its static catalogue list by design.
- Blank diagram nodes in full-page captures are a capture artifact: labels render when
  the diagram is in the viewport.

## Commands

| Check | Result |
| --- | --- |
| `npm run check` | Pass |
| `npm run test:architecture` | Pass (part of `check`) |
| Playwright subset against the local build | See the PR description |
| `git diff --check` | Clean |

## Screenshots

Captured locally, not committed, in the session scratchpad: `qa-before/` and `qa-after/`,
named `<route>-<width>-<theme>.png` (for example `contact-414-light.png`,
`es-work-375-light.png`, `stack-1024-light.png`), plus `strips/` composites. The audit
logs are `audit-before.log` and `audit-after.log`.
