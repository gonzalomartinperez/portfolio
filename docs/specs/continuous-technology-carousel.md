# Continuous technology carousel

Status: done

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
Center the next focused element after collapsing the grid so the fixed header
does not hide it. Uniform 104-pixel cards fit the longest four-line public labels
with padding at a 320-pixel viewport.

The opt-in `?carouselDebug=1` query exposes `setCarouselDebugProgress(cycles)`
on each row only while its engine is mounted. It seeks a paused existing tween
to a finite value between zero and three cycles for deterministic seam checks.
The method is removed during cleanup and is absent from ordinary visits.

## Verification

Production builds, mandatory TypeScript validation, lint, repository/content/asset
checks pass. Complete-catalog HTML is about 64.2 KiB gzip; the coordinator raises
the shared limit to 70 KiB to preserve the approved linked server-rendered catalog.

Focused production browser checks cover both locales, both themes, 320-pixel
mobile, 200% text scaling, original logo decoding, catalog completeness and axe.
Mobile's nine catalog/motion/education/concept/no-JavaScript/suspension cases pass.
Follow-up desktop/mobile checks verify the centered keyboard exit and local,
global, hover, touch, visibility and offscreen pause behavior.

Deterministic tests seek both real GSAP rows through fractional phases and three
complete cycles. Desktop and mobile pass with every visible gap between 11 and
13 pixels, no blank viewport edges and every label inside its padded card.
Final combined CI and deployment verification remain coordinator responsibilities;
these browser checks are not measurements of physical-device frame rates.
