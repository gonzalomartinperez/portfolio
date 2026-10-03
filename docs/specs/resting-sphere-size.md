# Resting sphere size and toolkit reading space

Status: locally verified; integrated CI and production verification pending

## Outcome

Give the initial sphere more visual presence while keeping the hero message,
availability, and controls readable. Preserve the existing scroll scene,
library choices, reduced-motion fallback, and pointer/keyboard interactions.

## Acceptance

- Desktop uses a moderately larger visible sphere. Compact vertical spacing,
  not smaller text, makes room where viewport height limits the sphere.
- Mobile reserves its static header as well as the hero. The complete sphere
  stays visible rather than enlarging a shape cropped below the viewport.
  Hero actions share a row when they fit and wrap naturally at narrower widths
  or increased text size; touch targets remain at least 44 px high.
- The hero keeps a minimum 20 px separation from the sphere, and the sphere stays
  at least 20 px inside the visible viewport after the entry header is reserved.
- The avatar, projected sphere and pointer hit region share their measured center.
- Static/reduced-motion presentation stays below the hero. Pause, focus, resize,
  scroll transitions and context recovery retain their existing behavior.
- The settled toolkit reserves 48 px above its marks after any sticky header and
  96 px below, including labels. Additional rows stay reachable by native scroll.
- A reading interval of 35% of the viewport height, capped at 320 px and rounded
  to whole pixels, holds the settled toolkit before its sticky viewport releases.
  The animation distance excludes that interval; scroll reversal remains deterministic.
- Rampy's existing React Flow diagram lists Hyperliquid alongside Morpho, Aave,
  Compound and LI.FI, and shows Privy authentication and wallets. The capability
  map does not invent Hyperliquid behavior or an unconfirmed routing dependency.
- Theme and locale switches preserve the exact current page position on Home
  (including the cloud and settled grid) and Work.
- Availability stays on one line with a separator on desktop, and two lines
  without decorative dots on mobile; enlarged text may wrap naturally.
- Sphere hover/press feedback follows the measured hit region, and the pulse
  travels across the visible sphere rather than leaving it before its peak.
  Drag, paused, reduced-motion and avatar gesture behavior remain bounded.
- Both locales and themes pass targeted browser verification. No device FPS claim
  is inferred from browser emulation.

## Verification

Local production verification passes for the scene, native scroll and locale
positions; final integrated CI belongs to the integrating task. The approved longer bilingual headline is used
for layout checks; profile source changes belong to the integrating task.

Final production measurements with the accepted headline: radius
218 px at 1760×866 (previous 197 px, approximately 11% more) and 280 px at
1440×1000 (previous 249 px, approximately 12% more). Mobile comparison uses the
complete visible sphere, since the previous static-header calculation allowed
part of its nominal radius to fall below the viewport. With inline actions at
393 px, the visible radius is 166.5 px at 844 px height and 69.5 px at 650 px
height (both leave 24 px below the sphere and at least 24 px above it).
Viewport captures and measurements are saved under `.artifacts/resting-sphere/`
as `final-*.png` and `final-geometry.json`.

Targeted production checks cover both locales, themes, reduced motion, focus,
pointer pulses, native scrolling, short viewports, 35 and 65 toolkit marks,
React Flow node fit and controls. Integrated CI remains pending.
