# Continuous technology carousel

Status: in-progress

## Objective

Show the complete applied public technology catalog in two compact, continuously
moving rows, complementing the home page without capturing native scrolling.

## Acceptance criteria

- Every public catalog entry appears once; developing and excluded entries stay out.
- Whole categories are balanced deterministically between rows, retaining category
  order and the shared alphabetical comparator inside each category.
- The upper row moves left and the lower row right at 24 CSS pixels/second on
  desktop and 18 on narrow screens. Loops have no blank intervals or resets.
- Original linked tiles wrap individually through GSAP; there are no cloned links
  or duplicated accessible names. Keyboard focus exposes the full static grid.
- Local/global pause, hover, touch, offscreen and hidden-document states stop work.
- Reduced motion and no JavaScript show the complete static grid. Mobile retains
  native vertical scrolling; both themes and languages remain readable.

## Design

Reuse the existing GSAP dependency, imported only when animation is permitted.
Measure row positions on resize and wrap individual transforms beyond the visible
viewport. Keep progress when remeasuring; no frame updates enter React state.
Compact server-rendered rows avoid a hydration layout jump; reduced-motion CSS
and a scoped no-script stylesheet expose the static grid before client code.
A local control pauses both rows, while pointer interactions pause their own row.
Keyboard focus changes the rows into their static layout until focus leaves.

## Verification

Production build, mandatory TypeScript validation, lint, repository/content/asset
checks pass. Complete-catalog HTML is 64.2 KiB gzip; the coordinator updates the
shared limit to 70 KiB to preserve the approved accessible server-rendered catalog.
Targeted desktop checks passed; mobile synchronization and lazy-image assertions
were corrected. Final focused browser verification remains pending integration.
