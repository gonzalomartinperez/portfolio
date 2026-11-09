# Hero particle system v2

Part of the [master plan](README.md). Owner requirement (2026-11-09): the hero star sphere evolves into a particle system of maximum quality that morphs between **exactly 10 unique figures** (closed by the owner), very dynamic (flow, dispersion, reassembly), inside every budget and rule. This file is the specification; it builds on [research 13](research/13-sites-master-uiux.md) section 3.8 and improves it where noted ("v2 change"). Visual identity and tokens: [design-playbook.md](design-playbook.md). Decisions: PF-D15 (monogram), PF-D16 (engine), PF-D17 (poster and LCP), PF-D2 (no GSAP).

## 1. Requirements and how each is met

| Requirement (owner, brief, ecosystem) | How it is met | Verified by |
|---|---|---|
| Exactly 10 unique figures: sphere, cube, wormhole, toroidal helix (coiled spring whose ends join into a ring), triangle to tetrahedron, plus five chosen | Sections 4.1-4.10; figure registry has length 10 and a unit test fails on 9 or 11 | `tests/unit/hero/figures.test.ts` |
| Five chosen for quality and AI-engineer identity | Neural graph, galaxy, 3D dot-grid wave field, Moebius strip, monogram | Section 4 rationale; evaluator R7 |
| GPU-side morph (WebGL2) | Stateless vertex-shader morph from a data array texture, curl field, easing LUT; JS writes about 8 uniforms per frame | Section 6; frame-time specs |
| Device tiers | Tier 0 poster, 1 Lite 16,384, 2 Standard 32,768, 3 Full 65,536 particles | Section 7; fallback specs |
| About 49 s loop alternating curved/angular and dense/sparse | 49.1 s, strict alternation on both axes, asserted by tests (dense/sparse by a coverage metric) | Section 5; `sequence.test.ts` |
| Trails during morphs | Analytic ghost samples (stretched quads at `t - k dt`), no FBO | Section 6.4 |
| Orbiting satellites | Analytic rings around each figure's bounding radius, 200 / 400 / 600 | Section 6.6 |
| Subtle HUD label (01/10) in mono | DOM HUD: corner brackets, `01/10`, figure name, easing name | Section 9 |
| Blue to cyan ramp | Tokens `hero-*` from Instrument blue; speed shifts hue 262 toward 210 | Playbook section 2 |
| Additive glow in dark, ink-like in light | Per-theme blending, sprite shape and size, uniform tween on theme change | Section 10 |
| LCP poster first | h1 is the LCP; SVG poster of figure 01 at seed time 0; canvas after idle | Section 8; LCP guard spec |
| INP-safe | No per-frame allocation or layout reads; pointer stores coordinates only; handlers < 16 ms | Section 8.3; INP lane |
| DPR caps | 1.25 / 1.5 / 2 (tiers 1-3), governor drops DPR before density | Section 7 |
| Pause off-screen and when hidden | IntersectionObserver, `visibilitychange`, context loss, page-motion holds | Section 8.4 |
| Reduced-motion variant | Still variant: zero canvases, 10 static per-theme posters stepped by controls | Section 9.3 |
| WCAG 2.2.2 pause control | Visible persisted Pause/Play in the hero and the header | Section 9.2; `motion-pause.spec.ts` |
| Per-figure snapshot tests with fixed seed and time | QA clock, golden geometry hashes, exact SVG poster snapshots, 52 GPU baselines | Section 11 |
| Frame-time budgets | JS <= 0.5 ms per frame, GPU budgets per tier, p95 <= 20 ms, p99 <= 33 ms, 0 LoAF > 100 ms | Section 11.5 |
| Inspiration: Stephan Livera's Claude motion reel | Section 2 | Evaluator R7 |

## 2. Inspiration translated

The post (x.com/stephanlivera/status/2103315922098470926) could not be opened during research; the traits below come from the owner's description of its frames in `owner-decisions.md`, not from direct viewing.

| Reel trait | Translation |
|---|---|
| Circle to star morph with trails | Every transition is a flow-field morph with velocity-stretched trails (tier 2 single streak, tier 3 three ghosts) |
| Figures surrounded by orbiting satellites | 2-3 thin orbit rings of small particles per figure (analytic, no simulation) |
| 3D dot-grid wave field | Figure 08 |
| Animated Truchet patterns | Not a hero figure (it would be the 11th, PF-D27); optional Phase C light-theme poster ground |
| Expressive easing (back-out, elastic) | Per-figure enter easing; the HUD prints its name in mono |
| Technical HUD (corner brackets, timecode, mono labels) | DOM HUD with brackets, `01/10`, name and easing; timecode omitted |
| Motion blur, subtle chromatic aberration | Tier 3, dark theme, motion-ok only: stretched ghost quads; 1-2 px channel split limited to morph peaks, dropped on any frame over 20 ms |
| High-contrast palette | Dark: navy, cyan `#3adaf2`, near-white `#f1f5fc`; light: cool off-white, navy ink, cyan-700 for signals |

## 3. Architecture

```
domain (pure, no DOM)            adapters (browser)                 presentation (React)
figures/*  sample(rng,n)         gpu/engine  (three, WebGL2)        HeroStage  mount, tiers, poster
sequence   timeline(t)           gpu/shaders (GLSL ES 3.00)         HeroHud    brackets, 01/10, labels
matching   k-d pairing           gpu/targets.worker                 HeroControls pause, prev, next
easing     LUT source            gpu/satellites                     PosterFigures (Still variant)
tier       selection, governor   catalogue-journey (scroll scrub)
rng        mulberry32
```

Layers follow guard rules G1, G9 and G12. `shared/scene` supplies `SceneHost`, `FrameScheduler`, `QualityGovernor` and `ScrollProgress` (target-state section 5).

Key interfaces (TypeScript, `src/features/hero/domain`):

```ts
export type Character = "curved" | "angular";
export type Density = "dense" | "sparse";
export type TransitionStyle = "flow" | "scatter" | "swirl" | "pour";

export interface Figure {
  readonly index: number;                 // 1..10
  readonly id: FigureId;                  // "sphere" | "cube" | ... | "monogram"
  readonly name: { en: string; es: string };
  readonly character: Character;
  readonly density: Density;
  readonly layers: 1 | 2;                 // 2 only for triangle-tetrahedron
  readonly dwellSeconds: number;
  readonly enter: EasingId;               // easing of the morph into this figure
  readonly style: TransitionStyle;        // style of the morph into this figure
  /** Positions in a unit-radius frame plus a per-particle attribute w; deterministic for (seed, n). */
  sample(layer: 0 | 1, rng: Rng, n: number): { xyz: Float32Array; w: Float32Array };
}

export interface Timeline { at(tSeconds: number): { layerA: number; layerB: number; progress: number; style: TransitionStyle; easing: EasingId; figure: number; phase: "dwell" | "morph" } }
```

`sequence.ts` is the single source of the timeline (dwell, morph and style tables); the shader receives its outputs as uniforms and the HUD reads the same function, so there is no second schedule to drift.

## 4. The ten figures

All figures are sampled in a unit bounding radius, with every particle used by every figure (equal counts), shuffled with the seeded generator before matching so any prefix of particles is a uniform subset (this is what makes a tier downgrade a `drawRange` change). Seed: `0x474d50` ("GMP"), generator mulberry32.

| # | Figure | Character | Density | Dwell | Enter easing (LUT row) | Style into it | Why it is here |
|---|---|---|---|---|---|---|---|
| 01 | Sphere (R) | curved | dense | 4.0 s | out-quint (`--ease-out`) | pour (from 10) | Current identity, LCP poster, scroll-journey start |
| 02 | Cube (R) | angular | sparse | 3.0 s | back.out(1.7) | flow | Hard-edge contrast; "structure, systems" |
| 03 | Wormhole (R) | curved | dense | 3.4 s | expo.inOut | scatter | Depth showpiece; best use of parallax and flow |
| 04 | Triangle to tetrahedron (R) | angular | sparse | 3.8 s | power2.inOut; fold: elastic.out(1,0.6) | swirl | Two-beat figure: flat outline, then the apex folds out of plane |
| 05 | Toroidal helix (R) | curved | dense | 3.2 s | `--ease-standard` | flow | A spring whose ends join into a ring: recurrence, an agent loop |
| 06 | Neural network graph | angular | sparse | 3.6 s | power3.out | scatter | The AI-engineer identity: layered nodes, edges, travelling pulses |
| 07 | Galaxy spiral | curved | dense | 3.2 s | circ.out | swirl | Ties to the solar-system world; strongest "wow" in dark |
| 08 | 3D dot-grid wave field | angular | sparse | 3.4 s | `--ease-emphasis` | pour | The reel's most recognisable trait; reads as a loss surface or embedding landscape |
| 09 | Moebius strip | curved | dense | 3.0 s | sine.inOut | flow | One surface, one edge: elegant and mathematically honest; torus knot is the reserve |
| 10 | Monogram (finale) | angular | sparse | 4.5 s | spring (`--ease-spring`) | scatter | Personal signature; loops back to the sphere |

(R) = required by the owner. Reserve swaps if a figure fails review: torus knot for 09 (or for 10 if PF-D15 is declined), DNA helix for 07 (rejected as default because it repeats the helix idea and says biology more than AI).

**Alternation check (asserted by tests).** Character alternates strictly: C A C A C A C A C A and 10 to 01 is A to C. Density alternates strictly: D S D S D S D S D S and 10 to 01 is S to D. Dense and sparse are not hand-labelled only: `sequence.test.ts` renders each figure's settled pose to a 48 x 48 orthographic occupancy grid on the CPU and requires the five "dense" figures to have a higher occupied-cell share than all five "sparse" ones (the median split is the threshold). v2 change: the cube is edge-dominant (60% of particles on the 12 edges, 40% on faces) so it reads sparse after the dense sphere, and the wave field is a visibly spaced lattice; research 13 left 01 to 02 and 07 to 09 non-alternating on the density axis.

### 4.1 Sphere

Fibonacci lattice, `y_i = 1 - 2(i + 0.5)/N`, golden-angle azimuth, radius `1 + 0.04 j` with seeded shell jitter `j` in [-1, 1]; ambient: breathing at 10-20% amplitude.

### 4.2 Cube

Half-edge `1/sqrt(3)` (bounding radius 1). 40% of particles area-weighted on the six faces, 60% on the twelve edges with 0.012 jitter so the silhouette reads from any angle. Ambient: slow roll.

### 4.3 Wormhole (catenoid)

Surface `r(z) = b cosh(z/b)` with `b = 0.30`, `z` in [-0.56, 0.56] so the mouths reach radius 1. Area element `2 pi b cosh^2(z/b) dz` has a closed-form CDF (`z/2 + (b/4) sinh(2z/b)`), inverted from a 256-entry table: density concentrates at the rims. 8% of particles form a sparse filament on the axis. Ambient: particles stream along `z` (`z += fract(hash + 0.12 t)` wrap), which the parallax and flow field make the depth showpiece.

### 4.4 Triangle to tetrahedron (two layers)

Layer A: equilateral triangle in the XY plane, circumradius 1, 85% of particles on the three edges, 15% faint fill (attribute `w` lowers alpha). Layer B: regular tetrahedron on the same base, 70% area-weighted on the four faces, 30% on the six edges. The sub-morph A to B starts at +1.1 s of the dwell, lasts 0.9 s and uses elastic.out(1, 0.6): the apex lifts out of plane and the figure folds shut. The HUD label switches from TRIANGLE to TETRAHEDRON at the sub-morph midpoint. This is one figure with two layers (11 layers in the texture).

### 4.5 Toroidal helix

Coil `gamma(phi) = ((R + r cos(n phi)) cos phi, (R + r cos(n phi)) sin phi, r sin(n phi))` with `R = 0.72`, coil radius `r = 0.22`, `n = 9` turns, `phi` in [0, 2 pi): because `n` is an integer the coil's ends join into a ring (a spring bent into a torus). Tube thickness: Gaussian jitter sigma 0.025. Ambient: rotation about the ring axis, which reads as the coil screwing along itself.

### 4.6 Neural network graph

Four layers at `x` in {-1.0, -0.35, 0.35, 1.0} with 6, 9, 9, 6 nodes on seeded jittered discs (radius 0.55, 0.85, 0.85, 0.55). 30% of particles are tiny clusters on nodes (sigma 0.03), 70% on edges between adjacent layers (189 candidate edges, 25% dropped by seed), weighted by length. Attribute `w` carries the position along its edge plus an edge phase; the fragment shader pulses `0.5 + 0.5 sin(6.28 (w - 0.35 t))` so signals travel along edges (cyan-300 to white in dark, cyan-700 in light).

### 4.7 Galaxy

Two logarithmic arms `r = 0.12 e^{0.32 theta}`, `theta` in [0, 3 pi], offset by pi, in-plane sigma `0.04 + 0.03 r`, vertical sigma `0.03 (1 - r/1.1)`; 25% of particles form a Gaussian core (sigma 0.12, about 4x arm density); tilt 55 degrees about X. Ambient: differential rotation inherited from figure 05's swirl.

### 4.8 Dot-grid wave field

A regular lattice (256 x 256 at tier 3, 256 x 128 at tier 2, 128 x 128 at tier 1) with uniform spacing; the target texture stores the flat grid and the shader applies `h(x, z, t) = 0.07 sin(3.1 x + 0.9 t) + 0.05 sin(2.3 z - 0.7 t) + ripple` to `y` during the dwell and the morphs that touch layer 08 (continuity). `ripple = 0.06 exp(-d^2 / 0.05) sin(18 d - 6 t)` around the pointer when active (fine pointer only), zero in QA.

### 4.9 Moebius strip

`x = (1 + s cos(u/2)) cos u`, `y = (1 + s cos(u/2)) sin u`, `z = s sin(u/2)`, `u` in [0, 2 pi), `s` in [-0.32, 0.32]; area-uniform by sampling `s` with the `(1 + s cos(u/2))` weight (rejection). Ambient: slow roll that exposes the single edge.

### 4.10 Monogram (PF-D15)

Finding (repo read, 2026-11-09): there is **no vector monogram**. `src/shared/identity/mark.tsx` renders the raster caricature `public/avatar/face-{16,32,48,96,192}.png` through `next/image`; `media/identity/avatar.png` and `portrait-source.png` are rasters, and `public/brands/*.svg` are third-party marks. A raster cannot be sampled into stroke-quality points, so the plan does not depend on an owner asset.

Default (draft for owner approval): a procedural, angular **"GMP"** stroke monogram in `src/shared/identity/monogram.ts`, about 22 vertices, sampled by arc length with stroke width sigma 0.014 and depth jitter +-0.06; letters offset in `z` by -0.05 / 0 / +0.05 for parallax. Draft vertices (unit cell height 2; x centres -2.0, 0, +2.0, then scaled so the bounding radius is 1):

| Letter | Polyline (x, y) |
|---|---|
| G | (0.7, 0.6) (0.4, 1) (-0.4, 1) (-0.8, 0.5) (-0.8, -0.5) (-0.4, -1) (0.4, -1) (0.8, -0.5) (0.8, 0) (0.1, 0) |
| M | (-0.8, -1) (-0.8, 1) (0, 0) (0.8, 1) (0.8, -1) |
| P | (-0.7, -1) (-0.7, 1) (0.4, 1) (0.8, 0.6) (0.8, 0.2) (0.4, -0.2) (-0.7, -0.2) |

Owner options: approve the draft after seeing the settled snapshot in both themes; provide a vector mark (SVG paths are converted to the same stroke data); trace the caricature (a likeness decision); or substitute the torus knot (zero effort, `figures/torus-knot.ts`, same slot, same easing and style). Until decided, figure 10 ships the draft in a feature branch only; M5 cannot close with an unapproved figure.

## 5. Timeline and loop (about 49 s)

Morph duration 1.4 s each (a named cinematic exception to the 400 ms UI cap; overshoot applies to particle positions only, never to layout). Per-particle stagger over the first 33% of each morph so the figure "unzips" (delay derived from the style). Total: 35.1 s of dwell plus 14.0 s of morph = **49.1 s**.

| Segment | Start (s) | End (s) | Segment | Start | End |
|---|---|---|---|---|---|
| 01 dwell | 0.0 | 4.0 | 06 dwell | 24.4 | 28.0 |
| morph 01 to 02 (flow) | 4.0 | 5.4 | morph 06 to 07 (swirl) | 28.0 | 29.4 |
| 02 dwell | 5.4 | 8.4 | 07 dwell | 29.4 | 32.6 |
| morph 02 to 03 (scatter) | 8.4 | 9.8 | morph 07 to 08 (pour) | 32.6 | 34.0 |
| 03 dwell | 9.8 | 13.2 | 08 dwell | 34.0 | 37.4 |
| morph 03 to 04 (swirl) | 13.2 | 14.6 | morph 08 to 09 (flow) | 37.4 | 38.8 |
| 04 dwell (fold at +1.1 s, 0.9 s) | 14.6 | 18.4 | 09 dwell | 38.8 | 41.8 |
| morph 04 to 05 (flow) | 18.4 | 19.8 | morph 09 to 10 (scatter) | 41.8 | 43.2 |
| 05 dwell | 19.8 | 23.0 | 10 dwell | 43.2 | 47.7 |
| morph 05 to 06 (scatter) | 23.0 | 24.4 | morph 10 to 01 (pour, reassembly) | 47.7 | 49.1 |

Transition styles rotate so it never feels repetitive: **flow** (low curl amplitude), **scatter** (high amplitude, wide stagger, then reassembly), **swirl** (angular velocity about the figure axis), **pour** (gravity-biased, used into the wave field and into the sphere). The loop closes with no discontinuity: 10 to 01 uses a remap layer (an RG16UI index texture) because the matching chain 01 to 10 is not cyclic.

## 6. GPU technique (PF-D16)

Renderer: three.js on WebGL2 (`WebGLRenderer`, `ShaderMaterial` with `glslVersion: GLSL3`, instanced quads for tiers 2-3 and `Points` for tier 1). WebGPU is rejected for production (no measured upside, conflicting platform reports); the engine sits behind a `ParticleBackend` interface so Phase C can add one.

### 6.1 Data

- **Targets**: one `DataArrayTexture` (RGBA16F, 256 texels wide, `N/256` rows, 11 layers): xyz in a unit frame plus `w` (per-particle attribute: phase, edge position, alpha class). Tier 3: 11 x 65,536 x 8 B = 5.6 MB; tier 2: 2.8 MB; tier 1: 1.4 MB.
- **Easing LUT**: a 256 x 11 R16F texture holding the 11 easings sampled from `easing.ts` (overshoot included), the single source of truth for TS and GPU; linear filtering.
- **Curl noise**: a precomputed 32^3 RGB8 texture (about 96 KB) generated in the worker from the seeded generator; sampled at the particle's source position.
- **Order**: positions are matched across consecutive figures (6.3), so particle `i` has a partner in every layer.

### 6.2 Vertex stage (per particle `i`, per frame)

```glsl
// uniforms: uTargets (sampler2DArray), uEase (sampler2D), uCurl (sampler3D),
//           uLayerA, uLayerB, uProgress (0..1 raw), uEaseRow, uStyle, uSpread, uCurlAmp,
//           uTime, uPointer (vec3), uPointerGain, uTheme, uTierScale, uMorphing
vec3 evalPos(float p) {                       // p = raw morph progress, may be < uProgress for ghosts
  vec4 a = texelFetch(uTargets, ivec3(texel, uLayerA), 0);
  vec4 b = texelFetch(uTargets, ivec3(texel, uLayerB), 0);
  vec3 A = ambient(a.xyz, a.w, uLayerA, uTime);          // rotation, streaming, wave height
  vec3 B = ambient(b.xyz, b.w, uLayerB, uTime);
  float d = delayFor(uStyle, A, B, hash(id)) * uSpread;   // flow: hash; swirl: azimuth; pour: height
  float t = clamp((p - d) / (1.0 - uSpread), 0.0, 1.0);
  float e = texture(uEase, vec2(t, rowCoord(uEaseRow))).r;
  vec3 c  = texture(uCurl, A * 0.5 + 0.5 + vec3(0.0, 0.0, uTime * 0.05)).rgb * 2.0 - 1.0;
  return mix(A, B, e) + c * uCurlAmp * sin(3.14159265 * t);   // scatter at mid-morph, reassemble at the target
}
```

Pointer response is a repel/attract falloff added after `evalPos` plus a camera tilt of +-3 degrees from two uniforms, both damped on the CPU with `1 - exp(-k dt)`. Depth cue: size and alpha in dark, size and darkness in light. JS per frame writes about 8 uniforms and nothing else.

### 6.3 Pairing without crossings

Every figure uses all `N` particles. Consecutive figures are paired by **recursive median (k-d) matching**: split figure k and k+1 with the same alternating-axis median splits down to leaves of one and match leaves in order; chain 01 to 10 inside the worker; the 10 to 01 morph uses the remap layer. Metrics asserted in tests: mean displacement of each matched pair <= 1.35x the unconstrained nearest-neighbour lower bound (v2 change: research 13 proposed 1.15, which has no measurement behind it; the first run sets the ratchet), and for pairs 02 to 03 and 09 to 10 at 50% progress no particle path passes within 0.15 of the centroid.

### 6.4 Trails (v2 change: stateless)

Velocity is not simulated: the same function is evaluated again at `p - k dt` and the quad is stretched between the two screen-space positions. Tier 2: one streak (k = 1). Tier 3: ghosts k = 1..3 with alpha 0.5^k, drawn as extra instances only while `uMorphing > 0` (JS switches `instanceCount` between `N` and `4N`). No ping-pong FBO, no half-float render target, so there is no device-dependent fallback and the output is a pure function of time (replayable in snapshots). FBO inertia (pushes that persist after the pointer leaves) is a Phase C experiment.

### 6.5 Chromatic split (tier 3, dark, motion-ok)

Three tinted instances (R, G, B) of the core particles offset by +-1.5 px along the screen-space velocity, drawn only while the morph speed exceeds a threshold and limited to peaks under 400 ms; removed on any frame over 20 ms. In additive blending the instances sum to the true colour when aligned. No flashing: no luminance change above 3 per second.

### 6.6 Satellites

A separate small draw (`Points`): 2 rings on tiers 1-2 and 3 on tier 3, positions analytic from `uTime` and per-ring inclination, scaled to the current figure's interpolated bounding radius (uniform). Counts 200 / 400 / 600. Cyan-300 at 70% in dark, blue-600 in light. Draw calls: hero 2 (3 on tier 3).

### 6.7 Avatar keep-out and the existing interactions

The face avatar stays at the centre (existing identity and `interactive-sphere` spec). A soft mask multiplies alpha of particles that project within 0.16-0.30 of the sphere radius of the avatar and sit in front of it (`smoothstep`), so the galaxy core and the wave plane never cover the face. The existing click or tap radial wave and the avatar twist are kept as uniform-driven ripples (one bounded pulse at a time, no queue), applied to figure 01 first and then to whichever figure is active; drag, long press and secondary pointers do not trigger it (same acceptance as `docs/specs/interactive-sphere.md`).

### 6.8 Compile and upload without long tasks

`renderer.compileAsync()` (parallel shader compile) before the first frame; texture layers uploaded one `texSubImage3D` per task with `scheduler.yield()` or idle gaps (each slice <= 4 ms); targets arrive progressively from the worker (layers 01 and 02 first) and a morph into layer k starts only when layer k is resident.

## 7. Device tiers, DPR and the governor

| Tier | Selector | Particles | Satellites | DPR cap | Extras | GPU memory (hero) |
|---|---|---|---|---|---|---|
| 0 Poster | software GL (`WEBGL_debug_renderer_info` matches SwiftShader/llvmpipe/Basic Render), Save-Data, battery < 20% not charging (Chromium), reduced motion, viewport < 650 px tall (existing rule), context loss, no WebGL2 | 0 | 0 | n/a | per-theme posters | 0 |
| 1 Lite | low `hardwareConcurrency` or `deviceMemory`, rAF cadence near 33 ms (detects iOS Low Power Mode), or a 1 s probe under 50 fps | 16,384 | 200 | 1.25 | `Points`, 30 fps cap if throttled, no trails | about 1.4 MB |
| 2 Standard | mid phones, integrated GPUs | 32,768 | 400 | 1.5 | pointer, satellites, single streak | about 2.8 MB |
| 3 Full | discrete GPU, fine pointer, no Save-Data | 65,536 | 600 | 2 | three ghosts, chromatic split | about 5.6 MB plus ghosts |

Governor (`QualityGovernor`, pure): a 2 s moving average above 22 ms drops one tier (DPR first, then particle count through `drawRange` prefix, never re-uploading); a higher tier is never re-attempted in the same session. Hard limits: <= 100 draw calls, <= 64 MB textures, one animating context on mobile (the solar field is a frozen poster while the hero is on screen), no MSAA on mobile.

## 8. Loading, LCP, INP and pause rules

### 8.1 Loading and LCP (PF-D17)

The h1 is the LCP and never animates opacity from 0. The poster is the server-rendered static constellation, drawn as **figure 01 at seed time 0** from the same geometry (`tools/render-posters.ts` and a runtime function), so the first GPU frame matches it. The canvas is created in `requestIdleCallback` (1.5 s timeout) only after the hero intersects the viewport and tier is not 0, then crossfades over the poster for 220 ms after its first rendered frame (never before). No scene JavaScript in the initial route chunk: the hero chunk adds <= 60 KB gzip on top of the shared three chunk (to be measured; ratcheted).

### 8.2 Worker

A Web Worker builds the figures at the fixed seed, runs the k-d matching, builds the noise texture and the easing LUT source, converts to half float (`Float16Array` where available, else a 15-line converter) and transfers `ArrayBuffer`s; there is no multi-megabyte asset to download. Worker budget: <= 80 ms (tier 1), <= 160 ms (tier 2), <= 250 ms (tier 3); main-thread work for upload slices <= 4 ms per task. Progressive: layers are posted as they complete.

### 8.3 INP and main-thread rules

No per-frame allocation; no `getParameter`, `readPixels` or layout reads in the loop; `pointermove` stores coordinates only (passive) and is applied once per rAF with `dt`-based damping; figure changes are derived from the clock, so JS schedules no timers, except one `textContent` write on the HUD per figure change; control handlers do state changes only (< 16 ms).

### 8.4 Pause and scroll

Pause when: off-screen (IntersectionObserver), document hidden, user paused, `webglcontextlost` (swap to poster; restore on `webglcontextrestored`), or `holdPageMotion` is active (assistant, dialogs). The clock freezes, so paused frames are replayable. The first scroll input ends autoplay: any in-flight morph finishes within 350 ms (time-scaled), then scroll progress 0 to 15% scrubs the current figure back to the sphere (layer A is the current figure, layer B is 01, progress is scroll-driven), and the existing journey (sphere opens into the catalogue; `ScrollProgress` replaces GSAP `ScrollTrigger`) continues from 15%. Scrolling back to the top reverses the scrub and autoplay resumes after 2 s idle unless the user paused.

## 9. HUD, controls, accessibility, reduced motion

### 9.1 HUD

DOM, `aria-hidden`, decorative: four corner brackets (CSS borders, 12-16 px, 1 px `line-control`), top-left `01/10` and the figure name (mono 12 px, one line), second line the easing name (for example `back.out(1.7)`), no timecode. Hidden below 480 px except `01/10`. Figure names (EN / ES): Sphere / Esfera, Cube / Cubo, Wormhole / Agujero de gusano, Toroidal helix / Hélice toroidal, Triangle then Tetrahedron / Triángulo y luego Tetraedro, Neural graph / Grafo neuronal, Galaxy / Galaxia, Wave field / Campo de ondas, Moebius strip / Banda de Möbius, Monogram / Monograma.

### 9.2 Controls (real, 44 x 44, keyboard operable, visible focus)

Pause/Play (`aria-pressed`, persisted with try/catch storage, shared with the header toggle through `setPageMotionPaused`; satisfies WCAG 2.2.2), Previous and Next figure (a manual morph of 1.4 s; then the timeline resumes at the target's dwell). The figure name is announced through a polite live region only on a user-initiated step, never during autoplay. The canvas is `aria-hidden="true"`; the hero conveys its message in text.

### 9.3 Reduced motion (Still variant)

Zero canvases (as today); no autoplay; the static composed sphere (poster); Previous and Next step through **10 pre-rendered per-theme posters** (lazy SVG, <= 12 KB each, generated by `tools/render-posters.ts`, 20 files) with a 150 ms crossfade; no pointer response, trails or orbiting satellites (a static ring may remain). The preference is honoured at runtime through `matchMedia` `change`.

## 10. Per-theme rendering

| | Dark | Light |
|---|---|---|
| Blending | additive, `depthWrite: false`, soft round sprite | `NormalBlending`, premultiplied alpha, crisp ink disc darker than the ground (CSS `mix-blend-mode: multiply` is a spike, not the default) |
| Colour | blue-800 to cyan-300 ramp; speed shifts hue 262 toward 210; satellites cyan-300 | mist to blue-900 ramp; satellites blue-600; pulses cyan-700 |
| Size | base | +10-25% (ink-dot perception) |
| Glow and blur | halo by sprite falloff; trails and chromatic split on tier 3 | no bloom; trails as thin ink streaks at 60% opacity; no chromatic split |
| HUD | fg-secondary, brackets `line-control` | blue-800 mono, brackets `line` |
| Switch | 520 ms uniform tween in step with the theme reveal; the figure does not restart | |

Text safety: a radial opacity mask in the shader behind the h1 and CTA rectangle (`uTextRect`) plus the scrim of the playbook; contrast is measured on the worst frame (4.5:1).

## 11. Testing

### 11.1 Deterministic QA mode

A build flag (`NEXT_PUBLIC_HERO_QA=1`, absent from production builds) exposes `window.__hero.setTime(ms)`, which renders one frame at that clock; fixed seed; curl amplitude zero at settled times; autoplay off; pointer disabled; DPR 1.

### 11.2 Layers

| Layer | What | Tool | Gate |
|---|---|---|---|
| Geometry (no GPU) | Per figure: mean distance of samples to the analytic surface under epsilon; bounding box and centroid within tolerance; every sample finite; identical output for identical seed | Vitest, fast-check for sampler invariants | exact |
| Golden hashes | SHA-256 of the Float16 target buffer per figure and tier; a change requires an intentional update in the same PR | Vitest | exact |
| Sequence | 10 figures; strict alternation of character and of density (occupancy metric); loop 49.1 s; HUD strings; style table; `timeline.at` continuity at every boundary | Vitest | exact |
| Matching | Valid permutation; displacement ratio <= 1.35; no near-centre paths at 50% for 02 to 03 and 09 to 10 | Vitest | ratcheted |
| Poster SVG | Deterministic CPU render of 10 figures x 2 themes | text diff of committed SVGs | exact |
| GPU pixel snapshots | 11 settled layers (04 has two) x 2 themes x 2 viewports (1280x800 DPR 1, 390x844 DPR 2) = 44, plus 50% captures of 02 to 03 and 09 to 10 x 2 themes x 2 viewports = 8, canvas region only, HUD asserted as DOM text | Playwright `toHaveScreenshot` in the pinned container with software GL | `maxDiffPixelRatio` 0.015 (half-float differs by driver; valid only in that image) |

### 11.3 Fallbacks

Force `WEBGL_lose_context`; disable float and half-float textures; `--disable-3d-apis`; Save-Data emulation; reduced motion; no WebGL2. Assert poster visible, controls working, zero console errors, and that tier 0 downloads no scene chunk.

### 11.4 LCP and INP guard

The LCP element remains the h1 with and without the scene; the canvas appears only after idle; maximum interaction duration <= 150 ms with the scene running.

### 11.5 Frame-time and loading budgets

| Budget | Value | Lane |
|---|---|---|
| JS time per frame (hero) | p50 <= 0.3 ms, p99 <= 1 ms | QA build, any browser |
| Frame interval | p95 <= 20 ms, p99 <= 33 ms, dropped <= 2%, 0 LoAF > 100 ms | 390x844 at 4x CPU and desktop, full loop plus pointer sweep, tiers 1-3 |
| GPU time per frame (tier 3, DPR 2) | <= 6 ms on the reference GPU (owner's WSLg GTX 1050 class); tier 2 <= 8 ms | scheduled GPU lane with `EXT_disjoint_timer_query_webgl2` (Chromium desktop) |
| First hero scroll | p99 <= 33 ms desktop, p95 <= 20 ms mobile at 4x | v1 measured p99 1,067 ms; this is the hitch to remove |
| Worker build | <= 80 / 160 / 250 ms (tiers 1 / 2 / 3) | unit-timed in the QA build |
| Upload slice | <= 4 ms per task | LoAF check |
| First frame after idle mount | no task over 50 ms | LoAF check |
| Hero chunk | <= 60 KB gzip above the shared three chunk | `ratchets/bundle.json` |
| Posters | 20 files <= 12 KB each | size test |

Mid-range mobile GPU behaviour is inferred until the owner device checklist runs (PF-D9).

## 12. Acceptance (hero v2)

1. Exactly 10 figures in the order of section 4, each recognisable in a 400 px snapshot in both themes.
2. Transitions alternate curved/angular and dense/sparse, including 10 to 01 (tests green).
3. No visible particle crossing through the figure centre in the 50% captures of 02 to 03 and 09 to 10.
4. Loop 49.1 s with a seamless 10 to 01.
5. Budgets of section 11.5 met per tier; LCP element is the h1; tier 0 downloads no scene chunk.
6. Pause control, previous and next, live-region behaviour and the reduced-motion variant verified (WCAG 2.2.2).
7. Light theme renders non-additive ink with worst-frame text contrast >= 4.5:1.
8. Existing interactions preserved (pulse, avatar twist, journey into the catalogue).
9. Designer evaluator re-score of the hero >= 95, lower theme reported; recruiter R7 evidence recorded.

## 13. Work breakdown (milestone M5, after SceneHost from M3)

| ID | Task | Effort (agent hours) | Depends on |
|---|---|---|---|
| H1 | Domain: rng, easing, figure samplers 01-09, registry, sequence, tests and golden hashes | M, 10 | M2 Vitest |
| H2 | Matching and the worker (targets, noise, LUT source) | M, 8 | H1 |
| H3 | GPU engine and shaders (stateless morph, tier 1 `Points`, tier 2 quads), compile and upload slicing | L, 14 | H2, SceneHost (PF-M3-2) |
| H4 | Tiers, governor, SceneHost integration, poster handoff and LCP guard | M, 8 | H3 |
| H5 | HUD, controls, live region, posters (render tool, 20 SVGs), Still variant | M, 8 | H1 |
| H6 | Trails, chromatic split, satellites (tier 3) | M, 8 | H3 |
| H7 | Light theme ink rendering and worst-frame contrast tests | M, 6 | H3, design tokens |
| H8 | Scroll integration (`ScrollProgress`), avatar keep-out, preserved interactions | M, 8 | H3 |
| H9 | Snapshots (52), fluidity lanes, fallback tests | L, 12 | H4-H8 |
| H10 | Monogram (PF-D15), polish, evaluator pass | S, 4 | H1 (owner look review non-blocking) |

About 86 agent hours; H1 to H3 are the critical path, H5 and H10 parallel. Split: H5 and H10 are agent work; the owner only approves the monogram look (PF-D15, resolved by delegation) at the M5 device and design review, which does not block H10 merging.

## 14. Risks, rejected alternatives, open items

| Risk or alternative | Treatment |
|---|---|
| Mid-range mobile GPU cost at tier 2 | Tiering, `drawRange` downgrade, single streak only, measured on the owner's iPhone checklist |
| Half-float differences between drivers | Snapshots only in the pinned software-GL image with a tolerance; geometry hashes are exact and CPU-side |
| iOS Low Power Mode cannot be read | Detected by rAF cadence (about 33 ms) |
| FBO GPGPU inertia (research 13 tier 3) | Rejected for v2: device-dependent, non-deterministic, costs a render target; Phase C experiment |
| WebGPU compute | Deferred behind `ParticleBackend` |
| Raw WebGL2 without three | Rejected: the solar field shares the three chunk, so the hero adds only about 60 KB; context management is shared |
| 11th figure (Truchet) | Rejected by owner decision (PF-D27) |
| Figure 10 unresolved | PF-D15 gate: M5 cannot close without it |
| LCP regression from the canvas | LCP guard spec; poster equals first GPU frame |
| Reel traits taken from a description, not from viewing | Evaluator checks the intent (trails, satellites, wave field, easing, HUD), not pixel parity |
