# Mobile cloud spacing and confirmed toolkit additions

Status: implemented; release checks are recorded in the associated PR

## Acceptance

- Preserve the original organic, golden-angle cloud and staggered reveal. Move
  colliding marks only enough to give them space outside the measured ES/EN copy;
  the cloud must not become an intermediate grid. Grid settlement starts after
  the copy fades.
- The animated viewport follows the visible mobile viewport. A lightweight star
  backdrop covers the expanded field and overflow, fading toward the next block.
- Preserve five mobile and seven desktop columns, reversible scroll, native
  scrolling, reduced motion, pause, context-loss fallback and current budgets.
- Keep pause visible on initial short viewports, then attach it to the settled
  scene so it leaves with the toolkit instead of covering the next heading.
- Add only owner-confirmed applied tools to the full catalogue, with experience
  links. A dependency found in an employer repo is a candidate, not personal evidence.
- Analytics tools are catalogue entries, not authorization to install trackers.
- Preserve the complete confirmed stack in the private career inventory. Public
  presentation is intentionally selective: AI/software/product capabilities come
  first; financial integrations describe project context, not domain expertise.
- The owner's September 20 confirmation supports an estimated ~2x or greater
  response-speed improvement in optimized agent workflows: roughly half the
  previous response time or less under comparable conditions. Keep this distinct
  from the existing ~30% token reduction on unnecessary queries, not global usage.
  This adds a Work metric; the reviewed CV/PDF snapshot remains unchanged pending
  its next separately validated documentary release.

## Verification

Automated overlap checks cover both languages and desktop/mobile at 70%, 80% and
85% progression. Existing scene tests cover reversal, settlement and fallbacks.
The production build, catalog/content checks, 12 continuous-trajectory geometry
tests and unchanged bundle budgets pass. Reviewed desktop/mobile cloud and final
fade screenshots; both localized copies stay clear. The 38-case integrated browser
run passed 36 cases and intentionally skipped one desktop touch-only case. Mobile
reversal verification timed out at its final DOM query after the position checks;
the unchanged test passed in isolation in 23.8 seconds. Keep this diagnostic visible
and require the full CI suite before promotion; do not increase timeout or bypass it.
Final control verification passed six desktop/mobile cases for initial short-screen
visibility, pause/reduced motion and the settled scene's exit without heading overlap.
No physical iPhone test is available; browser emulation cannot establish device FPS.

## Technical reference

The dynamic viewport follows mobile browser chrome; the small viewport does not
grow when that chrome retracts. See [web.dev's viewport-unit explanation](https://web.dev/blog/viewport-units).
Keep the scroll journey based on stable small-viewport units while measuring the
actual sticky viewport for the animation range and canvas dimensions.

### Native-scroll regression

The immediate global refresh in the resize observer reset and restored the page's
scroll position whenever mobile browser bars resized the dynamic viewport. A
30-frame resizing/scrolling regression reproduced 87 unsolicited scroll writes in
each locale before the correction. Use `ScrollTrigger.refresh(true)` so refreshes
are coalesced and deferred until active scrolling ends; retain native gestures and
the full-height star background. See [GSAP safe refresh](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.refresh()).
The regression also checks that scene progress converges to the measured scroll
geometry afterward. This simulation does not replace a physical Chrome mobile test.
