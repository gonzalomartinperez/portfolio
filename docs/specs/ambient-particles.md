# Ambient particles across the portfolio

Status: implemented

## Outcome and scope

Continue the galaxy identity on every page with restrained, theme-aware particles
rendered by a dedicated library. The background supports the content without
competing with text, the home scene, or architecture diagrams. This slice also
reconciles the cumulative October requests with the reviewed release.

## Acceptance criteria

- AC-1: Every localized route shares one decorative particle canvas across client
  navigation, with subtle dots and soft depth in both light and dark themes.
- AC-2: The background never intercepts clicks, adds keyboard stops, changes page
  width, or covers the header, content, diagrams, and footer.
- AC-3: Reduced motion and unavailable JavaScript retain a static star field.
  A shared pause control stops both the ambient field and the home scene; the
  paused state survives client navigation. Hidden tabs stop particle rendering.
- AC-4: Load only the basic tsParticles bundle after hydration. Cap density and
  allow rendering up to 120 fps on supported displays, avoid per-particle React updates, and retain the existing transfer
  budgets and deferred Three.js boundary.
- AC-5: Confirm each October content/UX request against its implementation;
  correct concrete omissions and preserve approved career facts and PDF parity.
- AC-6: Required quality, browser/accessibility, and Hostinger compatibility CI
  passes for the final task and release PR heads before merging.

## Design and decisions

`AmbientField` remains a narrow client boundary in the shared root layout.
tsParticles React, engine, and basic packages are pinned to the same stable
version. The basic bundle supplies circular particles and slow drift without
interaction plugins or a second WebGL renderer. CSS owns the static fallback,
nebula wash and orbital lines. One small shared motion store coordinates the
home and footer controls. Particle state stays inside the library.

## Delivery plan

1. Implement the lazy particle canvas and shared pause control.
2. Review theme, density, layer order and lifecycle on desktop/mobile.
3. Reconcile the request ledger and source consistency findings.
4. Run frozen install, dependency audit, repository/build checks and meaningful
   motion/route/browser checks; integrate through develop and main PRs.

The latest review also restores Filomena as a single Home product showcase,
uses the owner-selected original employer JPEGs, disables the assistant launcher,
aligns the mobile header/actions, normalizes technology chip heights and shares
the toolkit copy/ellipse center with a gradual scene-edge fade. The main scene
uses native animation frames; the ambient ceiling is 120 fps. Actual frame rate
depends on display refresh and device capacity.

## Verification and handoff

- Frozen install, dependency audit (zero advisories), repository/content checks,
  lint, type-checked production build and all seven transfer budgets passed.
- 46 targeted desktop/mobile tests passed for drift, shared pause, navigation,
  reduced-motion cleanup, no-JavaScript fallback and bilingual diagrams.
- Desktop and mobile screenshots were inspected in light and dark themes; the
  background remains subtle, diagrams readable and foreground controls usable.
- Latest bilingual refinements: 30 desktop/mobile checks passed for cloud
  centering, header/actions/chips and original marks; the final 12 checks passed
  after reserving a clear control strip below architecture nodes.
- An independent read-only review found no blocking defects or omitted requests.
- Reviewed bilingual CV revision `2026-10-03.9` matches the Career Ops release
  manifest and both public PDF hashes. See the [cumulative ledger](release-2026-10-03.md).
- The delivery PR records the full browser suite and final-head CI results.
  Both required jobs and their aggregator must pass before integration; main
  post-merge CI and the live deployment are checked separately.
