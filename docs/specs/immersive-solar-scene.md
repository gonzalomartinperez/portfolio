# Immersive solar scene

Status: in-progress

## Outcome and scope

Raise the decorative solar system, stars and background from a dim, compressed
backdrop to a realistic and composed scene that accompanies every page without
competing with professional content. The identity stays galactic and blue. The
optional explorer becomes a cinematic close-up view.

Non-goals: astronomical scale or an ephemeris, new pause controls (removed on request
in the parallel motion-controls change), changes to the hero toolkit sphere, page copy,
documents, the assistant rollout, hosting or dependencies.

## Acceptance criteria

- AC-1 The Sun is the visual center; Mercury through Neptune, the dwarf planet Pluto and
  the Moon orbiting Earth are present with coherent sunlight, terminators, relief,
  atmospheres, Earth's oceans, clouds and night lights, and Saturn's shadowed rings.
- AC-2 Stars vary in size, color temperature and density along a galactic band, with
  restrained scintillation, a faint Milky Way, asteroid and Kuiper belts, and an
  occasional shooting star on the existing 47-second cycle.
- AC-3 The background is continuous across every route and section. Reading text keeps
  WCAG contrast over the rendered scene (4.5:1, or 3:1 for large text) in both themes,
  without solid blocks and without recoloring text or icons.
- AC-4 The scene never captures input or scrolling; links, diagrams and controls keep
  their behavior on desktop and mobile.
- AC-5 Every body is placed before the first visible frame; cold loads and reloads keep
  the server fallback within one CSS pixel of the WebGL composition at time zero in
  both landscape and portrait. No camera jumps, flashes, resets on locale or theme
  change, or catch-up after a hidden tab.
- AC-6 Reduced motion, no JavaScript, texture failure and GPU context loss keep the
  complete static scene; hidden tabs, modals and internal holds suspend rendering.
- AC-7 Frame cadence follows the display refresh, including 120 Hz, with adaptive
  resolution that recovers after transient load. GPU memory stays within the existing
  128/256 MiB estimates; deferred scene JavaScript stays within 250 KiB gzip; no new
  dependencies or image assets.
- AC-8 The explorer frames the full system, flies to a selected body and follows it,
  loads detailed maps only while open and releases them on close.

## Design and decisions

Ownership: `solar-system*.ts`, `solar-system.tsx`, their CSS and
`ambient-field.module.css`. Shared hero, footer and explorer UI files are unchanged.

- **Single pass, no post-processing.** The previous bloom composer and an alpha-repair
  pass are removed. Every material writes premultiplied color with one blend mode:
  alpha 1 covers the page (bodies) and alpha 0 adds light (corona, stars, glows). This
  keeps glows correct over the dark theme and lets the light theme draw an atlas-like
  ink rendition without separate render targets.
- **Custom physically motivated shaders** (`solar-system-shaders.ts`): Lommel–Seeliger
  photometry for airless bodies, limb darkening for gas giants, soft terminators for
  thick atmospheres, albedo-derived relief, an Earth material with tangent-space
  normals, ocean glint, cloud shadows and night lights, ring shadows in both directions,
  a granulated limb-darkened Sun and a streamer corona.
- **Baked Milky Way.** A procedural galaxy renders once into a 1024 × 512 target and
  is sampled by the sky sphere, avoiding per-pixel noise each frame.
- **Reading mask** (`solar-system-reading.ts`). Text blocks in `main` are measured on
  DOM mutations, resizes and font loading, cached in document coordinates and drawn into
  a quarter-resolution mask with MAX blending. Each material recedes behind text by its
  own strength: the Sun almost fully, faint stars barely. Scrolling changes only a
  uniform. Pinned and hero elements are excluded rather than measured per frame.
- **Composition.** Separate landscape and portrait cameras; portrait raises the camera
  so orbits use the tall screen. Initial phases were searched so every body is visible
  and clear of the home hero text at time zero. Scrolling gently orbits the camera
  around the Sun and lowers scene opacity while reading.
- **Adaptive quality.** Refresh is calibrated from RAF; the drawing-buffer scale steps
  through 1, 0.86, 0.74 and 0.62 on sustained missed frames, recovers after a stable
  period and blocks a level that fails immediately after an upgrade. Upload stalls and
  resizes are excluded from samples. MSAA is enabled only below 1.5 device pixel ratio.
- **Textures.** Decoding uses `createImageBitmap` off the main thread with an image
  fallback. Reading mode uploads 2048-texel Sun/Earth/Jupiter maps on wide screens and
  1024 elsewhere; the explorer re-decodes from the retained compressed bytes.

## Delivery plan

1. Scene configuration, shaders and engine modules (resources, textures, sky, bodies,
   reading mask, orchestration) with the existing public engine API.
2. Fallback projection for both orientations with Sun-facing terminators.
3. Browser regressions for composition, contrast, scroll parallax and explorer maps.
4. Measurements against the previous develop build and documentation.

## Verification and handoff

Recorded after the final integrated run; see [the verification record](../verification/immersive-solar-scene.md).
