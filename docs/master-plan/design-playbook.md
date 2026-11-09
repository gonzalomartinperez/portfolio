# Design playbook: Instrument blue

Part of the [master plan](README.md). Foundations: [research 13](research/13-sites-master-uiux.md) sections 2-3 (shared motion and fluidity system, portfolio design), [research 06](research/06-ui-ux-design.md) (tokens, motion, accessibility, budgets, dark mode) and [ecosystem.md](ecosystem.md) section 13. This file records the decisions and the computed values for this repository; the structure (token names, motion tokens, gates) is shared with the sibling `portfolio-backoffice` plan and the Pequeverso site, and the identity lives in the pack, type, signatures and copy voice. Hero system: [hero-particles.md](hero-particles.md).

Owner decisions: blue family as a starting preference with full creative freedom; keep and elevate the signature scenes; light theme with its own identity; button states and components taken to the maximum. Values below were computed by script (OKLCH to sRGB with gamut clamping, WCAG 2 relative luminance); `tests/unit/design-tokens.test.ts` recomputes every ratio from `src/design/tokens/*.tokens.json` with CSS Color 4 gamut mapping and fails CI on regression. Published hex values are the family's shared ones; the test asserts thresholds, not exact hex.

## 1. Concept: an instrument for reading AI systems, in two lights

| Theme | Name | Idea |
|---|---|---|
| Dark (default for every visitor, unchanged rule) | **Observatory navy** | Deep navy night (never black, never slate), luminous particles as the only light source, cyan as the single live signal; layered lighter surfaces instead of shadows; the quiet, precise sibling of the control room in the backoffice |
| Light (explicit, persisted choice) | **Ink on paper / celestial atlas** | Cool off-white paper, navy and blue inks, particles become ink dots, orbits become 1 px chart lines, planets are lit by rim light and shaded by a terminator; blue-tinted layered shadows and hairlines; cyan reserved for live signals. Not an inversion: its own elevation model and its own contrast relationships |
| Visitor | A recruiter or engineering lead with 30 seconds | Role, proof and one action before any motion is asked for; every number is a measurement with a unit and a source |

### Why it will not read as generic SaaS blue

1. **Hue travel.** The accent family is a 52 degree arc from ultramarine (262) to cyan (210); gradients, the primary button and the hero ramp travel that arc while lightness rises, never through grey and never toward purple. A flat 255-260 "blue-500" button is the SaaS default; hue travel is the identity.
2. **Everything is tinted.** Every neutral carries hue 262 at chroma 0.004-0.07. The only pure white is the light card surface. The dark ground is navy.
3. **Cyan is a signal, not a colour.** It means live, selected or primary action in dark and is held under about 5% of visible pixels (tested, section 11). Ultramarine does the structural work.
4. **One gradient and one glow per viewport**; mono labels, hairlines and registration ticks carry the rest of the character.
5. **Instrument signatures** (section 8) that no portfolio template has.

## 2. Tokens

### Architecture (PF-D11)

Three tiers: primitive `--ref-*`, semantic `--sys-*` exposed to Tailwind as colours, component `--cmp-*` only where two or more variants diverge. Sources are DTCG 2025.10 JSON with OKLCH and hex fallback, built by Style Dictionary v5 into one committed `src/design/theme.css`:

- `structure.tokens.json`: semantic names, type, space, radius, motion, breakpoints, z-index. Shared with the backoffice (copied from `engineering-standards` with a hash check).
- `pack-instrument.tokens.json`: `--ref-*` ramps and the light/dark mapping. The same pack the portfolio backoffice uses; the site adds `scene-*` and `hero-*` roles.
- Contract tests: every semantic token exists for both themes; required pairs meet contrast; snapshot of `theme.css`; no token unused (knip-style check).

Tailwind 4 wiring: semantic values are plain variables on `:root`; `@theme inline` maps them to utilities so a theme switch does not break the variable chain. `src/app/globals.css` shrinks from 517 lines to an import list.

```css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
@import "../design/theme.css";   /* generated: :root dark, :root[data-theme="light"], @theme inline */
@custom-variant dark (&:where(:root:not([data-theme="light"]), :root:not([data-theme="light"]) *));
```

Rules: no `bg-[#...]` or arbitrary length values outside an allowlist (G8); `cn()` is `clsx` plus `tailwind-merge` with the custom text sizes registered; Biome sorts classes; logical properties (`ms-`, `ps-`); container queries for cards; `motion-safe:` convention. The existing `data-theme` attribute stays the only theme authority; default is dark regardless of the system preference (the identity is luminous points on night), light applies from a stored choice replayed before first paint, mirrored in a cookie so the server renders the right theme (no flash).

Old names map to the shared names and stay as aliases until the end of M5 (a lint then bans them): `--surface-void` to `canvas`, `--surface-base` to `surface`, `--surface-raised` to `surface-raised`, `--line-strong` to `line`, `--text-primary/secondary/muted` to `fg/fg-secondary/fg-muted`, `--accent-deep` to `accent-hover`, `--field-near/far/additive` to `hero-*`.

### Primitives (hue 262 unless stated)

| Step | OKLCH (L C) | Hex | Step | OKLCH | Hex |
|---|---|---|---|---|---|
| blue-50 | 0.975 0.012 | `#f2f7ff` | cyan-100 (h210) | 0.96 0.03 | `#dcf8fd` |
| blue-100 | 0.945 0.026 | `#e3edff` | cyan-300 | 0.88 0.09 | `#8de8f8` |
| blue-200 | 0.895 0.06 | `#caddff` | cyan-400 | 0.82 0.13 | `#3adaf2` |
| blue-300 | 0.83 0.10 | `#aac8ff` | cyan-500 (h215) | 0.75 0.132 | `#05c2e2` |
| blue-400 | 0.74 0.15 | `#7caaff` | cyan-600 (h225) | 0.65 0.122 | `#089ec7` |
| blue-500 | 0.64 0.19 | `#4886fe` | cyan-700 (h230) | 0.52 0.103 | `#027398` |
| blue-600 | 0.55 0.20 | `#2867e4` | red-300 (h25) | 0.80 0.13 | `#ff9b93` |
| blue-700 | 0.46 0.18 | `#174eba` | red-400 | 0.72 0.17 | `#fd736d` |
| blue-800 | 0.37 0.15 | `#0b378d` | red-600 | 0.52 0.19 | `#be222a` |
| blue-900 | 0.28 0.11 | `#06235e` | red-800 | 0.44 0.17 | `#9b0f1b` |
| blue-950 | 0.20 0.08 | `#021239` | | | |

Chroma is tapered at both ends to stay inside sRGB; displays with P3 gamut may use up to +15% chroma under `@media (color-gamut: p3)`. Status colours beyond red (success, warning) are used only if a view needs them (none on the public site today).

### Semantic values, computed (WCAG 2 contrast on the named surface)

**Dark: Observatory navy** (site ground is one step deeper than the backoffice: L 0.13 against 0.16)

| Token | OKLCH | Hex | Contrast |
|---|---|---|---|
| canvas (page) | 0.13 0.04 262 | `#020617` | - |
| surface (bands) | 0.17 0.05 262 | `#040e25` | - |
| surface-raised (cards, dialogs) | 0.21 0.055 262 | `#0a1731` | - |
| line-subtle (decorative) | 0.26 0.06 262 | `#132341` | 1.3 |
| line (card border, decorative) | 0.33 0.07 262 | `#213459` | 1.6 |
| line-control (inputs, buttons) | 0.58 0.10 262 | `#597ab6` | 4.69 canvas, 4.14 raised (need 3.0) |
| fg | 0.97 0.01 262 | `#f1f5fc` | 18.45 canvas, 16.28 raised |
| fg-secondary | 0.82 0.03 262 | `#bac5d8` | 11.59 canvas, 10.23 raised |
| fg-muted | 0.72 0.04 262 | `#97a5be` | 8.11 canvas, 7.71 surface, 7.15 raised |
| accent (text, links, icons) | cyan-400 | `#3adaf2` | 12.0 canvas |
| accent-hover / link body | cyan-300 | `#8de8f8` | 14.44 canvas, 12.74 raised |
| accent-wash | cyan-400 at 12% over raised | `#102e48` | label cyan-300 9.98 |
| brand (structural) | blue-500 | `#4886fe` | 5.88 canvas |
| ring (focus) | cyan-300 | `#8de8f8` | 14.44 canvas |
| link visited | blue-300 | `#aac8ff` | 11.8 canvas, 10.41 raised |
| danger | red-400 | `#fd736d` | 7.54 canvas |
| header veil | canvas at 80% plus blur | - | measured over the worst hero frame |
| hero radial pool (static) | blue-800 at 35% | - | fg 15.97, fg-secondary 10.03, fg-muted 7.02 on the pool |

Cyan text is used at 14 px and 500 weight or heavier; body-size links use cyan-300.

**Light: Ink on paper**

| Token | OKLCH | Hex | Contrast |
|---|---|---|---|
| canvas | 0.985 0.006 262 | `#f8fafe` | - |
| surface (bands) | 0.965 0.012 262 | `#eff4fc` | - |
| surface-raised (cards) | 1 0 0 | `#ffffff` | the one pure white; plus shadow |
| line-subtle (decorative) | 0.92 0.016 262 | `#dfe5f0` | 1.2 |
| line (card border) | 0.85 0.025 262 | `#c5cedf` | 1.5 |
| line-control | 0.58 0.06 262 | `#677b9e` | 4.10 canvas, 4.28 raised |
| fg | 0.20 0.06 262 | `#061431` | 17.44 canvas |
| fg-secondary | 0.40 0.05 262 | `#394863` | 8.81 canvas, 9.21 raised |
| fg-muted | 0.48 0.045 262 | `#505e77` | 6.26 canvas, 5.93 surface, 6.54 raised |
| accent (links, icons) | blue-700 | `#174eba` | 7.09 canvas, 6.71 surface, 7.41 raised |
| accent-wash | blue-700 at 8% over canvas | `#e6ecf9` | label blue-700 6.25 |
| brand | blue-800 | `#0b378d` | 10.33 canvas |
| signal (live, pulses) | cyan-700 | `#027398` | 5.14 canvas, 5.37 raised, 4.87 surface |
| ring (focus) | blue-500 | `#4886fe` | 3.29 canvas, 3.43 raised (3:1 needed) |
| link visited | blue-900 | `#06235e` | 14.26 canvas |
| danger | red-600 | `#be222a` | 5.82 canvas |
| header veil | canvas at 82% plus 1 px line plus shadow-1 | - | worst frame measured |
| Shadows (blue-tinted, layered) | `shadow-1`: `0 1px 0 oklch(0.28 0.11 262 / 8%), 0 14px 32px -14px oklch(0.28 0.11 262 / 28%)`; `shadow-2` adds 24 px spread for dialogs | - | - |

Decorative hairlines are below 3:1 on purpose and are never the only identifier of a control; controls use `line-control`.

### Particle and scene roles (used by hero and solar)

| Role | Dark (additive) | Light (ink) | Contrast / note |
|---|---|---|---|
| far / deep | blue-800 to blue-500 | `oklch(0.72 0.02 262)` mist | depth is encoded by lightness (deeper = darker blue in dark, lighter mist in light) |
| mid | blue-400 `#7caaff` | blue-700 `#174eba` | 8.53 canvas (dark), 7.09 (light) |
| near / fast | cyan-400 to cyan-300, tip toward `fg` | blue-800 to blue-900, +10-25% size | 12.0 to 14.44; 10.33 to 14.26 |
| speed ramp | hue 262 toward 210, L rises with velocity | hue stays 262, L falls with velocity | the ramp is the speedometer |
| satellites and orbit rings | cyan-300 at 70% | blue-600 | `#2867e4` 4.84 on canvas (marks, not text) |
| pulses and crests (neural graph, wave field) | cyan-300 to near white | cyan-700 | 5.14 on canvas |
| HUD text and brackets | fg-secondary, 1 px `line-control` | blue-800, 1 px `line` | 11.59 / 10.33 |
| scrim behind text | canvas at 70-85% | canvas at 85-92% | worst-frame contrast test, 4.5:1 minimum |

### Type, space, radius, elevation, z-index (PF-D21)

| Role | Choice | Notes |
|---|---|---|
| Display and text | Inter Tight variable (wght), Latin subset (covers Spanish accents and inverted marks), `font-feature-settings: "ss01","cv11"` only if measured | Replaces Inter plus Inter Tight; metric-matched fallback via `next/font/local` `adjustFontFallback`; CLS 0 retained |
| Labels, HUD, data | JetBrains Mono variable subset, 12 px, `tabular-nums slashed-zero`, never uppercase-wrapping (truncate to one line at 390) | Used only for instrument labels, HUD, metrics, code |
| Budget | Both families <= 100 KB total woff2 (today 135 KB, three families) | `ratchets/bundle.json` |

Fluid scale (`clamp`, max/min <= 2.5, tested): display 2.75 to 5.5 rem (ratio 2.0), h1 2.25 to 3.75, h2 1.625 to 2.375, h3 1.25 to 1.5, body 1.0625 rem (17 px) at weight 400 and line-height 1.6, small 0.9375, label 0.75 mono. Measure 60-75ch (`--measure-text: 44rem`), `text-wrap: balance` on headings and `pretty` on prose, `hyphens: auto` with `lang` set. Space 4 px unit (`--space-1..10` kept). Radius 6 / 12 / 20. Breakpoints closed at 480 / 768 / 1024 / 1280 / 1536. Z-index layers 0, 10 sticky, 20 header, 30 drawer, 40 dialog, 50 toast, 60 tooltip; the assistant launcher stays below dialogs. Elevation: dark = lighter surface plus border; light = `shadow-1/2`; no `box-shadow` animation.

## 3. Motion and fluidity system (shared with Pequeverso; research 13 section 2)

### Tokens

```css
:root {
  --dur-instant: 100ms;  --dur-fast: 150ms;  --dur-base: 220ms;  --dur-slow: 320ms;
  --dur-page: 400ms;     --dur-reveal: 480ms; --dur-hero: 700ms;  --dur-theme: 520ms;
  --dur-morph: 1400ms;   /* named cinematic exception: hero particle morph only */
  --ease-out:      cubic-bezier(0.23, 1, 0.32, 1);
  --ease-emphasis: cubic-bezier(0.05, 0.7, 0.1, 1);
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-exit:     cubic-bezier(0.3, 0, 0.8, 0.15);
  --ease-spring:   linear(0, 0.5 7%, 0.95 21%, 1.04 31%, 1.01 43%, 1);
  --stagger: 50ms; --travel-sm: 8px; --travel-md: 16px; --travel-slide: 60px;
}
```

Reconciliation: today's `--ease-out (.16,1,.3,1)`, `--ease-standard (.4,0,.2,1)`, `--duration-micro 140ms`, `--duration-transition 320ms` map to `--ease-out`, `--ease-standard`, `--dur-fast`, `--dur-slow` (aliases for one milestone). Lint (G8/G11): durations 100-400 ms except `--dur-hero`, `--dur-theme` and `--dur-morph`; no `transition: all`; only `transform`, `opacity` (plus `clip-path` for the theme reveal, `filter` sparingly, and 150-220 ms colour or background changes on controls, which are tiny layers).

### Choreography rules (testable)

1. One hero per screen: at most one cinematic (> 400 ms) motion at a time.
2. Exit before enter, exit shorter (150 vs 220 ms); the LCP element never animates opacity from 0.
3. Stagger 40-60 ms, at most 8 items, total under 500 ms.
4. Spatial continuity: a moving element shows where it came from (work-card thumbnail to case-study hero via shared `view-transition-name`; popovers grow from their trigger).
5. Frequency is inversely proportional to ornament: keyboard actions, filters and repeated toggles get no animation beyond a 100 ms state change.
6. Press feedback within 100 ms of `pointerdown`; `scale(0.985)` on `:active`; never animate from `scale(0)`.
7. Transform and opacity only (exceptions above); never `transition: all`.
8. Interruptible: hover, press and menus use CSS transitions or WAAPI so a new state retargets.
9. Hover only where hover exists: `@media (hover: hover) and (pointer: fine)`; touch gets pressed state only.
10. Ambient motion is pausable and idle-aware: pause on `visibilitychange`, off-screen, reduced motion, Save-Data, and render on demand after about 10 s without input; a visible pause control satisfies WCAG 2.2.2.
11. A route change is a transition, not a reload: header, theme and background persist; only `main` morphs.

### Page transitions and scroll storytelling (PF-D22, PF-D23)

- React `<ViewTransition>` wrapped in each `page.tsx` (not the layout): crossfade 150 ms out and 220 ms in with a 10 px rise; `addTransitionType` for `nav-forward` and `nav-back`; shared names for work-card thumbnail to case-study hero; the header is anchored with `view-transition-name` and `animation: none`; `::view-transition { pointer-events: none }`; canvases are named and excluded or hidden, and their loops pause while a transition runs; reduced motion keeps a 100 ms crossfade and removes slide and shared travel.
- Native scroll always; never change scroll speed; never pin for more than about 1.5 viewports; pinned sequences have a skip anchor and an equivalent static layout; every scroll effect has a CSS scroll-driven version under `@supports (animation-timeline: view())`, a static fallback with content fully visible, and (only for essential effects) a JS fallback. Parallax at most 10-20 px, none on text. A story beat is one idea with a dwell at least the copy's reading time (about 0.25 s per word).
- The `PageMotion` IntersectionObserver reveals (8 px lift) migrate to scroll-driven CSS.

### Device classes and reduced motion

| Class | Trigger | Behaviour |
|---|---|---|
| Full | `no-preference`, fine pointer, no Save-Data, `hardwareConcurrency > 4`, `deviceMemory >= 4` when exposed | Everything |
| Lite | coarse pointer or mid device | No tilt or cursor effects, DPR cap 1.5, 50-75% particle density |
| Still | `prefers-reduced-motion: reduce` | Static poster, opacity reveals at 100-150 ms, no parallax, no autorotation, no shared travel; keep focus feedback, loaders and state colour changes |
| Saved | Save-Data, slow connection, or tier 2 after 2 s under 45 fps | Poster, no 3D download, CSS-only motion |

No blanket `animation: none`; reduced motion shortens to about 1 ms and swaps to fades; runtime changes are honoured through `matchMedia(...).addEventListener("change")`.

### Performance and fluidity budgets (gates; mobile lab unless noted)

| Metric | Gate on content routes | Today |
|---|---|---|
| LCP (3D-disabled lane, 4G simulation, 4x CPU) | <= 2.0 s | 3.5-6.2 s (lab, SwiftShader) |
| INP (lab interaction scripts) / field p75 | <= 150 ms / <= 200 ms (post-MV) | not measured |
| CLS | <= 0.05 | 0 to 0.004 |
| TBT | <= 200 ms | 20-154 s (SwiftShader artifact) |
| Long frames while scrolling (390x844, 4x CPU) | p95 <= 20 ms, p99 <= 33 ms, dropped <= 2%, 0 LoAF > 100 ms | v1: p99 1,067 ms on first hero scroll (desktop) |
| Initial JS per route (gzip) | <= 90 KiB reading routes, <= 110 KiB home (stricter than the ecosystem 170 KB) | 226-240 KiB in script tags; 395-465 KiB transferred |
| CSS (gzip) | <= 25 KiB, frozen | at the budget |
| Fonts | <= 100 KB, 2 families | 135 KB, 3 |
| 3D chunk (gzip) | <= 500 KB shared three chunk; hero v2 adds <= 60 KB; never in the initial route; mount after LCP via `requestIdleCallback` | 250 KiB deferred budget today |
| 3D runtime | <= 100 draw calls, <= 150K triangles, textures <= 2048 and <= 64 MB, DPR <= 1.5 mobile and 2 desktop, no MSAA on mobile, one animating context on mobile | home: 3 getContext calls on 2 canvases |
| Textures per route | 0 on reading routes; ambient 512 px set (about 350 KB) on home and `/stack`; explorer streams 1024/2048 on open | 1.37 MB mobile, 2.22 MB desktop on every route |

### Testing fluidity automatically

1. `tests/browser/hero-fluidity.spec.ts` and a route-family frames spec: viewport 390x844 DPR 3, CDP CPU throttle 4, `page.mouse.wheel` in 100 px steps every 16 ms across the hero journey, rAF deltas asserted against the gates.
2. Long Animation Frames: `PerformanceObserver` for `long-animation-frame` injected by `addInitScript`; fail on any LoAF over 100 ms and print `scripts[].sourceURL`.
3. INP in lab: `event` entries with `durationThreshold: 16` during five interactions (open menu, theme toggle, filter chip, lightbox open, hero next); max <= 150 ms.
4. Two lanes: CI with 3D disabled or the static renderer forced (regressions of the base app) and a scheduled GPU-backed run for frame time; one trace on a real low-end Android per release.
5. View-transition checks: no transition active over 600 ms, `pointer-events: none` on the pseudo-element, a click during a transition lands.
6. Reduced-motion lane: every perf and visual spec also runs with `reducedMotion: "reduce"`; zero canvases and zero running animations beyond opacity.
7. Budgets as code: `ratchets/bundle.json` and `ratchets/lighthouse.json`.

## 4. Buttons: all variants and states

Geometry: minimum height 44 px on coarse pointers, 40 px on fine pointers (WCAG 2.2 AA minimum is 24 px; hit area never below 24 px even for compact icon buttons); radius 12 px; horizontal padding 20 px (icon buttons 44 x 44); label Inter Tight 600 at 15/16 px with 0.005em tracking; icon gap 8 px; focus ring 2 px `ring`, 2 px offset on the page surface, appears instantly, never clipped by `overflow`; `scroll-padding-top` equals the sticky header height so focus is never obscured (WCAG 2.4.11). Hover rise is a flat 1 px `translateY(-1px)` only under `(hover: hover) and (pointer: fine)` (the `perspective rotateX(3deg)` lift is removed); press is `translateY(1px) scale(0.985)` in 100 ms; colour transitions are 150 ms; `transform` and `opacity` otherwise. Destructive is not shipped on the public site (no destructive action); the slot exists in the pack for parity.

**Primary** (the identity carrier: hue-travel gradient, 135 degrees; at most one gradient surface per viewport)

| State | Dark | Light | Label contrast (dark / light) |
|---|---|---|---|
| Rest | gradient cyan-300 to cyan-500, label blue-950 | gradient blue-600 to blue-800, label white | 8.55 to 13.09 along the path / 5.06 to 10.8 |
| Hover (fine pointer) | fill shifts toward cyan-300 (stop positions +15%), glow `0 0 24px oklch(0.82 0.13 210 / 22%)`, rise 1 px | fill shifts toward blue-800, shadow-1 deepens, rise 1 px; no glow | 13.09 / 10.8 |
| Focus-visible | rest plus 2 px cyan-300 ring (14.44 on canvas) | rest plus 2 px blue-500 ring (3.29 canvas, 3.43 raised) | ring >= 3:1 |
| Active (pressed) | cyan-500 flat, `translateY(1px) scale(0.985)` | blue-900 flat, same press | 8.55 / 14.9 |
| Selected | not applicable (use toggle pattern) | not applicable | - |
| Disabled | fill line-subtle, label fg-muted at 60%, no glow, `cursor: not-allowed`, `aria-disabled` and still focusable only when it explains why | same with light roles | exempt from 1.4.3, still legible |
| Loading | spinner replaces icon, width locked, `aria-busy="true"`, pointer events kept off | same | - |

**Secondary**

| State | Dark | Light |
|---|---|---|
| Rest | fill blue-800, label fg, 1 px blue-600 border (label 9.87) | fill blue-100, label blue-800, 1 px blue-500 border (label 9.16; border 3.29 on canvas) |
| Hover | fill blue-700 (label 6.77) | fill blue-200 (label 7.82) |
| Focus-visible | ring as primary | ring as primary |
| Active | fill blue-900 (label 13.62), press | fill blue-300 (label 6.31), press |
| Disabled / Loading | as primary | as primary |

**Ghost** (tertiary, in-card actions)

| State | Dark | Light |
|---|---|---|
| Rest | no fill, label cyan-300 (12.74 on raised) | no fill, label blue-700 (7.41 on raised) |
| Hover | cyan wash 12% (label 9.98) | blue-100 fill (label 6.29) |
| Active | cyan wash 20% (label 8.08) | blue-200 fill (label 5.37) |
| Focus, disabled, loading | as above | as above |

**Link (text)**: underline offset 3 px and 1 px thickness at rest, thickness 2 px on hover; dark cyan-300 (14.44), light blue-700 (7.09); visited dark blue-300 (11.8), light blue-900 (14.26); external links carry the existing external-link icon and an `sr-only` "opens in a new tab".

**Icon button and toggle** (pause motion, theme, locale, copy): 44 x 44 hit area, 24 px icon, tooltip required (hover and focus, Escape dismisses, WCAG 1.4.13), `aria-pressed` for toggles; the pressed (selected) state is a filled accent-wash with a 1 px accent ring, and the pause toggle also changes its icon, not only colour; copy buttons report the real clipboard result in a polite live region.

States are one component each (`Button`, `LinkButton`, `IconButton`) built with CVA on semantic tokens; a unit test snapshots the variant matrix, and a Playwright matrix visits rest, hover, focus, active, disabled and loading for both themes (visual baseline). Assertions: label contrast at every state from the token values, ring contrast, target size.

## 5. Component inventory

| Group | Components | Notes |
|---|---|---|
| Existing primitives (`src/shared/ui`) | Button, Badge, Card, Dialog (Radix), Input, Label, NativeSelect, Skeleton | Rebuilt on semantic tokens with all states; native elements first |
| New primitives | LinkButton, IconButton (tooltip required), Tooltip, Toast (copy confirmation), Callout, Tag, Disclosure (`details`), SegmentedControl (locale, filters; roving tabindex) | Only what a view needs |
| Editorial (`src/shared/editorial`) | PageHeader, ProductionBadge, MetricList, EvalCase, **InstrumentLabel**, **RegistrationTicks**, **FigureCaption** | Signatures live here (section 8) |
| Shell | Header (sticky at every width), Footer, LocaleSwitcher, ThemeToggle (circular reveal), **MotionToggle**, **ProgressRail**, **RecruiterChip** (persistent contact after first scroll on mobile; never overlaps the assistant launcher) | |
| Scenes | HeroStage (+ HUD, controls), AmbientField (+ poster), SolarExplorer | Via `SceneHost` |

States (five per async view): default, loading (after 100 ms; skeleton above 1 s), empty, error (`role="alert"`, retry), success or partial. Public-site async views are few (assistant when enabled, lazy gallery, architecture canvas); each ships all five in `/_system` fixtures and a Playwright matrix visit.

## 6. Theme parity plan (rubric P5: light within 2 points of dark)

| Element | Dark | Light | Check |
|---|---|---|---|
| Elevation | lighter surface plus border | white card plus blue-tinted shadow plus hairline | visual baseline per theme |
| Hero particles | additive, glow by sprite falloff | normal blending, crisp ink dot, thin ink streaks, no bloom, no chromatic split | hero snapshots per theme; worst-frame text contrast >= 4.5:1 |
| Solar field | night side dark, additive stars | terminator shading (night side darkens, never transparent), paper-tinted veil, orbit lines at 20-35% | planet contrast test; no milky blotches (snapshot) |
| Background | static radial pool blue-800 at 35% | static blue-50 to canvas vertical wash plus faint graticule lines | no animated gradients |
| Portrait | veil, current treatment | re-keyed onto a navy-tinted ground with a soft vignette ring; no dark rectangle | `/about` snapshot |
| Header | veil 80% plus blur | veil 82% plus 1 px line plus shadow-1 | separation visible at scroll 0 |
| Theme switch | circular reveal 520 ms with a 520 ms uniform tween in the scenes; figures do not restart | same | `view-transitions.spec.ts` |

Process: tokens authored as light/dark pairs with equal contrast relationships (not mirrored lightness); both themes in every visual baseline and evaluator pass; the scorecard uses the minimum; the evaluator scores each theme separately.

## 7. Scene design (summary; engineering in target-state.md section 5)

- **Hero**: h1 (role, stack, what is built, one sentence), two CTAs (primary: the production RAG assistant proof; secondary: contact), then the particle stage; text paints first with no opacity gate; the stage mounts after LCP. Details: [hero-particles.md](hero-particles.md).
- **Journey**: mobile hero journey from 21.5k px page height to <= 12,000 px (target about 3,500 px of hero scroll): the catalogue is presented as an expandable mark cloud with "Skip to projects" first in tab order and `inert` collapsed chips until opened (also fixes the tab-stop issue); curated 12-16 brands on mobile (PF-D10).
- **Motion language, four verbs**: settle (resting breathing, 10-20% amplitude), open (figure to cloud), attract (cursor gravity, damped by `dt`, fine pointer only), return. Frame-rate-independent damping `1 - exp(-k dt)` so 120 Hz does not feel twice as fast.
- **Solar field**: ambient uses a 512 px texture set (about 350 KB against 1.37 MB on mobile) and only the explorer streams 1024/2048 maps on open; on reading routes a rendered per-theme poster replaces the live scene (PF-D1); behind content on home and `/stack` it runs at about 30% speed, 30 fps and renders on demand after 10 s idle; each route focuses a different body or camera offset (Work: Saturn rings tilt, Stack: Jupiter bands, About: Earth and Moon, Contact: Sun) using the view-transition moment, 400 ms, `--ease-standard`. Posters are generated by a pinned-container capture at a fixed time: `public/images/solar-system/posters/{dark,light}-{wide,narrow}.avif` (each <= 60 KB).
- **One context at a time on mobile**: when the hero is on screen the solar field is a frozen poster; when the hero leaves, the hero context disposes. Desktop may keep both with solar at 30 fps.
- **Pause control** in the header (and footer): "Pause background motion", wired to `setPageMotionPaused`, persisted (try/catch storage), also pauses the hero loop; satisfies WCAG 2.2.2.

## 8. Identity: the Instrument signatures (what makes it unique, and how it is tested)

| # | Signature | Where | Rule |
|---|---|---|---|
| 1 | **Instrument label**: mono 12 px eyebrow `03 / WORK` with a hairline running to the right edge and tabular numerals | Every section head | Replaces uppercase wrapping eyebrows; one line at 390 |
| 2 | **Registration ticks**: four 10 px L-shaped corner ticks | Hero stage, featured cards, figure plates; ticks extend 2 px on `:focus-visible` | Decorative, `aria-hidden`; light theme reads as cartographic neatline |
| 3 | **Hue travel** | Primary button, one accent word per page, hero ramp | At most one gradient surface per viewport |
| 4 | **Hero HUD** | Hero stage | Corner brackets, `01/10`, figure name, easing name, mono, subtle |
| 5 | **Live dot** | Production badge on case studies; later the assistant when activated | A 6 px cyan dot with an opacity-only pulse (off under reduced motion); used only for truthful state, never decoration |
| 6 | **Readout cards** | `EvalCase`, `MetricList` | Mono key-value rows, tabular numerals, unit chips, hairlines; every number has unit and source |
| 7 | **Figure plates** | Case-study images | 1 px `line` neatline plus ticks plus mono caption `FIG. 03: ...`, like a scientific plate |
| 8 | **Theme reveal** | Theme toggle | Circular `clip-path` reveal from the toggle, night to day: stars switch off, atlas lines emerge |
| 9 | **Orbit loader and 404** | Loading and not-found | Tiny orbit animation, transform only, off under reduced motion |
| 10 | **Grain** | Dark theme only | Static SVG noise at 2-3% opacity to kill gradient banding on OLED |

Automated identity checks (`tests/unit/design-tokens.test.ts`, `tests/browser/visual-routes.spec.ts`): every neutral token has chroma >= 0.004 at hue 262 (no grey); no accent button hue between 250 and 260 without the travel to 210; on each home screenshot, pixels with hue 195-225 and chroma > 0.1 are <= 5% of the viewport; computed styles show at most one gradient background and at most one glow `box-shadow` (spread/blur >= 16 px with cyan) in the viewport; mono labels use the label token.

## 9. Pages (EN and ES for each; acceptance on top of the common gate)

Common gate for every view: axe 0 serious or critical in each theme and locale; WCAG 2.2 AA (focus not obscured, targets >= 24 px and 44 px for primary touch, dragging alternatives); no horizontal scroll 320-1920; 200% and 400% zoom reflow; reduced-motion render verified; frame-time gate wherever a scroll effect exists; visual baseline in both themes; Lighthouse a11y 100; no text over a canvas below 4.5:1 on the worst frame.

| View | Designer 95+ criteria | Recruiter 95+ criteria |
|---|---|---|
| `/` | LCP <= 2.0 s mobile (3D-disabled lane) and <= 3.0 s with the static fallback; page height at 390 <= 12,000 px; scroll p95 <= 20 ms at 4x; light and dark within 2 points; theme reveal works; skip catalogue; one animating context on mobile | Role, stack and proof in the first viewport; one live proof link and one contact action; featured work reachable without the hero journey |
| `/work` | Cards 16:10, outcome-first copy, filter as URL state, shared-element thumbnail, <= 30 tab stops | Each card shows outcome and stack; scannable in 30 s |
| `/work/filomena`, `/work/pequeverso` | Impact summary first (problem, role, result, stack); diagram with text-first fallback, "skip diagram" link, nodes `tabindex=-1` with one roving entry (<= 10 tab stops; fixes the 8 heading-order findings); lightbox respects the filter; "On this page" (desktop) and bottom sheet (mobile); next-case card | Problem, role, result, stack, and eval, latency or cost only where the owner approves (PF-D26); repo and demo links |
| `/stack` | <= 15,000 px at 390 (virtualised or `content-visibility: auto`); `Intl.PluralRules` pluralisation; chips with a visible light ring | Scannable technology evidence; keyboard filter |
| `/about` | Portrait without dark rectangle in light; 65ch measure; stable contrast over the poster | Narrative in three short blocks, human photo, positioning consistent with the CV |
| `/education`, `/cv` | Print stylesheet; body >= 15 px; PDF twin one click; 0 contexts | Dates and roles consistent with `career-ops` sync |
| `/contact` | One clear path; copy-to-clipboard confirmation announced (`aria-live`); response-time line (owner text) | Email and LinkedIn within one click from every page |
| `/assistant` | Disabled until MV; when enabled: disclosure, starters, streaming with a reduced-motion-safe caret, handoff to email | Limitations stated |
| 404 (EN and ES) | Locale-aware (fixes the English `/es` 404), on-theme, offers Work and Contact, no layout shift | Routes back into the funnel |
| Global | Pause control, `lang` correct on `/es`, hreflang, three signature moments inside budget, header sticky at every width including < 26 rem | Consistent navigation, no dead links |

Wayfinding: header with brand, six links, EN/ES, theme and pause (44 x 44 targets), sticky with `scroll-padding-top`; a 2 px scroll-driven progress rail with a section index and `aria-current` on `/work/*`, `/stack` and `/cv` (CSS `scroll()` timeline, zero JS); skip links "to content", "to projects", "skip catalogue"; persistent recruiter shortcut and CV download repeated in the footer.

Bilingual: `<html lang>` on the server for `/es/**` (done), hreflang pairs with `x-default`, +20-30% string length tested in both themes (nav labels may wrap to two lines, never ellipsis), `hyphens: auto` with `lang`, typographic punctuation per locale, `Intl` for numbers, dates and plurals; locale switch is a same-route crossfade preserving scroll and focus.

### Signature moments (budgeted, three only)

1. **Hero morph loop** (the particle system, the existing "open into the catalogue" moment made smooth).
2. **Theme toggle as a brand moment** (signature 8; reduced motion: 150 ms crossfade; blocked storage still switches for the session).
3. **Work card to case-study morph** (shared element, header anchored, solar camera shifts focus body).

Delight details at zero cost: copy-to-clipboard micro-confirmation, tabular numerals on metrics, `text-wrap: balance/pretty`, avatar pulse kept (keyboard operable already).

## 10. Accessibility specification

| Topic | Rule |
|---|---|
| Standard | WCAG 2.2 AA; axe tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa` plus best-practice; do not claim compliance from axe alone (manual NVDA and VoiceOver pass per release) |
| Contrast | Body 4.5:1 minimum (the tokens give >= 5.9:1), UI boundaries 3:1 (`line-control`), focus ring 3:1, text over canvas measured on the worst frame |
| Pause, stop, hide (2.2.2) | Hero and solar auto-play > 5 s: visible pause control, persisted; `prefers-reduced-motion` yields the Still variant; hold during dialogs and the assistant |
| Keyboard | Primary CTA within 6 tab stops with skip links; no keyboard trap; roving tabindex in diagram and filters; shortcuts, if any, have UI equivalents |
| Target size (2.5.8) | >= 24 px everywhere, 44 px for primary controls on coarse pointers |
| Focus appearance and not obscured (2.4.11-13) | 2 px ring, 3:1, `scroll-padding` |
| Reflow and zoom | 320 px and 400% zoom without two-axis scroll; 200% text resize |
| Forced colours | `forced-colors: active` smoke: ticks and hairlines map to `CanvasText`/`GrayText`; canvas hidden behind posters |
| Live regions | Figure name announced only on a user-initiated step; copy confirmation polite |
| Language | `lang` on mixed fragments; hreflang; `Intl` |

## 11. Design QA and gates (every PR touching UI)

1. Visual regression: Playwright `toHaveScreenshot` per view in section 9, both themes, EN and ES samples, 320 / 390 / 768 / 1280 / 1920, pinned Playwright container, `maxDiffPixelRatio` 0.01, static renderer forced and canvas masked except in the hero figure specs, animations frozen, fonts ready.
2. Accessibility: axe per route x theme x locale x viewport, keyboard journeys, zoom reflow, target-size spec.
3. Lighthouse (`tools/lighthouse-gate.ts`): 5 runs, median, thresholds from `ratchets/lighthouse.json`; GPU lane scheduled.
4. Frame time and INP: section 3 specs, full and reduced-motion lanes.
5. Design-system lint: G8 (no literals), no `transition: all`, allowed animated properties only, token contrast and identity tests.
6. Review: reviewer and, for structure, architecture-reviewer; `designer-evaluator` scores P1-P6 per theme from the screenshots and the scorecard; the lower theme is reported.

## 12. Implementation order and risks

Order: M3 fixes defects and budgets without a visual redesign (so the baselines of M2 stay valid); M4 introduces the token pipeline with aliases and no pixel change; M5 swaps the palette, rebuilds primitives and ships motion, hero v2 and the page work in this order: palette and primitives, motion tokens and transitions, hero v2, solar elevation, pages, signature moments.

| Risk | Mitigation |
|---|---|
| A palette swap breaks identity | Aliases plus M2 baselines; evaluator pass on real frames; owner screenshots before the merge of the palette PR |
| Light concept cannot be judged on tokens | Review real frames per route, worst-frame contrast tests, score each theme |
| View Transitions snapshot a frozen canvas | Name and exclude canvases, pause loops during the transition, trace-based test |
| In-app webviews lack newer CSS | Progressive enhancement; one real in-app session per release |
| Scroll-driven animation Baseline claim unverified at a primary source | Keep `@supports` guards and static fallbacks permanently |
| Hover and gradient costs on low devices | Gradient is static; hover shift is a background-position change on a tiny layer; measured in the frames spec |
| Inter Tight at body size reads tight | Tracking +0.005em, 1.6 line height, visual and designer review at 390; fallback is Inter body (budget impact documented) |
| Copy changes introduce claims | No claim added without owner approval (PF-D26) |

Sources: [research 13](research/13-sites-master-uiux.md) sections 2-3, [research 06](research/06-ui-ux-design.md), [sources.md](sources.md). Numeric budgets and the light-mode OKLCH values are proposals validated by the computed tests above, not measurements of the shipped site.
