# Interactive sphere verification

## Scope and implementation

The [specification](../specs/interactive-sphere.md) adds two bounded interactions:
a 750 ms sphere wave and a 1.2 s avatar twist/lift. Durations use the existing
animation clock and pause with it; they are not wall-clock deadlines on a busy GPU.
Only one pulse is active at a time. Further activations during that pulse are
ignored rather than queued. Scroll progress and technology-logo trajectories are
independent of pulse state.

The sphere uses a projected geometric hit area. The avatar is a named button in
both languages, with Enter/Space support and no duplicate synthetic-click pulse.
It becomes disabled before scroll makes it invisible. Pointer events remain
passive: no pointer capture, touch-action override or sensor permission was added.
The reading boundary attenuates pulse displacement near the introductory copy.

Controls use CSS-only depth: 700 px perspective, 2 px hover lift, 3-degree tilt,
and a small press scale. Hover motion requires a fine pointer; all transforms
respect reduced motion. Native search/select geometry stays fixed, with inset
and focus relief. Segmented language navigation remains stationary.

## Checks recorded during implementation

- Full `npm run check` passed for the combined application: repository invariants,
  content, eight identity outputs, six document hashes, Biome, production build
  with TypeScript, and all seven existing budgets.
- Eighteen rendered-site assertions passed across all sixteen localized routes.
- The combined browser suite passed 117 tests in 11.8 minutes, with one intentional
  desktop skip for the touch-only case. Final desktop/mobile avatar states were
  reviewed; the reading-boundary adjustment keeps the pulse clear of the copy.
- The initial focused scene run passed 19 tests, with the existing intentional
  desktop skip for the touch-only case. This preceded the reading-boundary fix.
- The isolated controls run passed all four desktop/mobile cases; screenshots
  showed stable native select alignment and visible focus in both themes.
- Read-only standards review found no blocking defect in event/resource cleanup,
  keyboard access, bounded pulse state or the single-frame-loop design.
- No dependencies, CI gates, hosting settings or professional facts were changed.

The final lane integration retained its committed CSS order, correcting the
placement of the contact-depth block in the transferred working copy. The full
build/check and all four focused control cases passed again after integration
(27.7 seconds for the browser run). Final PR checks validate the release head.

## Limits

Browser tests use Chromium desktop and Pixel 7 emulation on Windows. They verify
interaction and rendering behavior, not physical-mobile frame rate or field Web
Vitals. No claim of 60 fps or real-device tactile performance follows from these
checks. The existing static fallback remains available without WebGL or with
reduced motion. Live publication is separate from local build verification.
