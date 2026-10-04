# Solar explorer and continuous engineering toolkit

Status: implementation verification in progress

## Experience

The decorative solar system complements portfolio reading. It never consumes input
or opens itself. The Sun remains at screen center in a stable perspective camera
35 degrees above a shared orbital plane. Nine compressed planetary orbits include
Pluto (a dwarf planet), with the Moon orbiting Earth. Distances, diameters and time
are deliberately artistic rather than an astronomical ephemeris.

A footer button opens the optional full-viewport accessible dialog. It reuses the
same solar canvas and WebGL context; close restores focus and the reading position.
Drag/pinch/wheel camera controls keep the Sun as their target. Native buttons rotate
and reset the view, select a body and pause motion. The immersive scene is dark;
the decorative scene follows the portfolio theme and has restrained transparency.

The home toolkit contains every entry from the existing public applied-technology
catalogue, grouped and alphabetized within each category. Two balanced rows move
in opposite directions at 24 CSS pixels/second (18 on mobile), with continuous
cycles, equal-height tiles and no navigation arrows. Each technology has one linked
DOM instance. GSAP wraps positions; no inaccessible duplicate links are required.

## Resilience and accessibility

- Background scrolling, navigation and hero interactions remain native.
- Motion pauses globally, locally, outside the viewport and in hidden tabs.
- Carousel hover/touch pauses motion; keyboard access exposes a static grid.
- Reduced motion and no JavaScript retain complete static content.
- Core texture or WebGL failure preserves the complete solar fallback. Optional
  Earth material maps can fail without removing the remaining working scene.
- Dialog close/Escape restores focus and scroll; every camera action has a native
  keyboard control. Logos, names and controls remain readable in both themes.

## Libraries and resource budgets

Existing Three.js official OrbitControls and postprocessing addons provide the
camera, selective HDR bloom and final color conversion. Existing GSAP provides
carousel animation. Stars are integrated as Three.js Points into the solar renderer;
the unused global tsParticles renderer and its three packages are removed.

Sixteen local licensed WebP maps total 7,187,952 bytes, within the approved 8 MiB
transfer ceiling. Earth normal/specular maps preserve data losslessly and use no
color-space transform. Texture compression does not claim mathematically lossless
color imagery. GPU upload resolution and drawing buffers adapt to device limits.

Shared deferred hero/solar JavaScript remains capped at 250 KiB gzip. CSS is capped
at 24 KiB gzip to accommodate the immersive controls. Per-page prerendered HTML is
capped at 70 KiB gzip (formerly 60): the complete linked toolkit is also rendered
for no-JavaScript and reduced-motion readers. Non-scene chunks retain their 80 KiB
limit; the portrait keeps its 80 KiB limit.

Frame cadence is adaptive rather than a promise of 120 FPS on every device.
Physical high-refresh verification remains distinct from headless GPU tests.

## Acceptance and verification

Run npm run check, targeted carousel/solar/explorer/ambient browser coverage, and
production visual review across desktop/mobile, EN/ES and light/dark. Validate
several orbit phases, loop seams, pause/resume, theme/locale position, context loss,
optional/core texture failure, keyboard focus, no overflow and one solar canvas.
Require the final PR head to pass CI before promotion through develop and main.
