# Cinematic solar background

Status: done

## Objective

Build a polished, realistic decorative solar scene across the portfolio. The
October 3 request explicitly includes Mercury, Venus, Earth, Mars, Jupiter,
Saturn, Uranus, Neptune and Pluto, plus the Sun and the Moon, stars and occasional
shooting stars. Pluto is included as requested; this is an artistic composition,
not a claim about planetary classification or a simulation at astronomical scale.

## Acceptance criteria

- Nine distinct textured planetary bodies, the Sun and an Earth-orbiting Moon
  appear in the scene. Licensed source imagery and changes are documented.
- Three.js renders spheres, axial rotation, curved orbits, sunlight and depth.
  Earth has a restrained atmosphere and cloud layer; Saturn's rings pass behind
  and in front of its sphere. The Sun has an emissive surface and soft corona.
- Composition is intentional on desktop and mobile: bodies remain recognizable
  and distributed in the viewport while the main content remains easy to read.
  The default frame and representative later phases receive visual review in
  both themes. Orbital distances, body sizes and periods are deliberately scaled
  for presentation rather than claimed as scientifically proportional.
- Existing stars remain visible. Occasional shooting stars have a smooth,
  short-lived trail, without repeated flashes or a competing foreground effect.
- A single solar canvas ignores input; the existing star renderer remains separate. Links, scrolling, the hero sphere
  and architecture interactions retain their existing behavior.
- The shared motion control stops orbital motion, axial rotation and shooting
  stars. Hidden pages stop rendering; resume does not jump by the hidden time.
- Reduced motion and no JavaScript show a complete static fallback. Loading or
  WebGL failure retains that fallback; context loss does not leave a blank field.
- Rendering is deferred, capped for pixel density and disposed on removal.
  The combined hero and solar dependency closure stays within 250 KiB gzip;
  existing CSS, non-scene JavaScript, HTML and portrait limits remain unchanged.
  Fourteen local texture maps stay below 600 KiB total (currently 423.7 KiB),
  with actual bytes and hashes recorded in the reviewed manifest. This does not establish an observed 120 FPS guarantee on every device.
- Public visual credits link to source authors, licenses and documented changes.

## Work ownership

The renderer lane owns SolarSystem components and the Three.js engine. The asset
lane owns compressed maps and provenance. The coordinator owns integration,
budgets, source contracts, credits, browser tests and PR promotion. Independent
visual review runs only against a completed production build.

## Verification

Verified against the final production build on 2026-10-04:

- `npm run check`: repository, content, identity and document checks, Biome,
  strict TypeScript, production build and all transfer budgets pass.
- Focused runtime tests verify real mapped spheres, GPU-loaded textures, ring
  depth, static fallbacks, navigation, pause, texture failure and context recovery.
  Visibility is tested with injected browser state/events: headless Chromium keeps
  every tab visible. GPU frame/time counters freeze and the first resumed frame
  preserves elapsed time, without hidden-time catch-up.
- Six repeated visibility checks and sixteen final scene integration cases pass,
  including native scroll, hero-only code isolation, navigation cleanup and hero
  availability in both locales/themes/device layouts.
- The two affected capture cases pass six repetitions each with CI's retry and
  fail-on-flaky policy enabled: twelve passes without retries.
- Independent visual/input review passes 64 route/locale/theme/device states,
  eight later orbital phases and four actual Stack input interactions. All eleven
  bodies intersect the viewport in sampled phases; fourteen maps are loaded and
  the GPU reports fifteen textures. Meteor trails appear at the sampled active
  interval. No overflow, JavaScript error or input/scroll interception was found.
- Desktop and mobile compositions were revised after visual review. The Sun and
  Saturn move into clearer mobile space; orbital guides remain restrained. The
  sampled concentric Saturn fallback replaces the stretched radial texture.

Remote CI and live publication remain delivery gates, verified separately before
reporting completion. Physical-device FPS has not been measured; RAF follows the
available display refresh with capped/adaptive pixel density.

## Capture synchronization

The preceding main CI run reproduced a Chromium capture error on two unrelated
screenshots: a full-page no-JavaScript document and a viewport filter/focus view.
Their behavioral assertions and font loading passed; retry-only success still
failed the quality gate. Capture now brings the page forward and waits for font readiness and native
layout. Scripted pages additionally wait for two animation frames; no-JavaScript
contexts suppress RAF callbacks and use the native path. JavaScript stays disabled
throughout those tests. Assertions, full-page captures, retry policy and the
fail-on-flaky gate are preserved. The repeated focused cases pass without retries;
final remote CI remains mandatory.

## Integrated CI follow-up

The first feature CI attempt reached the 25-minute job limit after 207 browser
cases. Desktop solar checks passed; mobile Education evidence captures exhausted
their 45-second case deadline while the software-rendered background remained
active. Those static-content tests now exercise the real shared pause control
before retaining all badge, contrast, accessibility and image-capture assertions.
Dedicated solar/ambient motion cases continue to run with animation enabled.
The measured integrated duration justifies a 45-minute CI job budget; individual
assertion deadlines, retries and fail-on-flaky behavior remain unchanged.

Both Education locale cases pass twice in each viewport after the change: eight
passes without retries, 13.4–15.9 seconds per case. Lint and the 21 repository
checks also pass. The new complete remote run remains the delivery gate.
