# Design system

[Back to overview](../README.md)

Dark-first, editorial, technical. Established 2026-09-12 for
[the initial release](specs/portfolio-initial-release.md).

## Direction

Three directions were explored before committing.

| Direction | Idea | Why not |
| --- | --- | --- |
| **Instrument** | Telemetry aesthetic: dense readouts, thin rules, monospace throughout | Reads as a dashboard; makes a person look like a status page |
| **Blueprint** | Grid paper, isometric system maps, diagram-led | Expensive to execute well, and slides into looking like a deck |
| **Constellation** | Black canvas, editorial type, generous space, one central particle identity, restrained cyan | **Selected** |

**Constellation** was selected because the portfolio must carry two messages at once: product
judgement and engineering depth. Editorial composition and a single confident visual anchor do
that better than either ornament or density. Blueprint's diagramming discipline is retained, but
only inside the Filomena case study where an architecture drawing genuinely earns its place.

The result should feel deliberate and quiet, with one moment of motion — not a template with
gradients and cards.

## Reference and influence

The owner named [morpho.org](https://morpho.org) as the reference for how the page should feel.
What was taken from it are qualities, reached by this repository's own implementation:

- a near-black ground rather than the earlier lighter one — lifted to `#08090c` rather than pure black, because the reference itself sits at `#121212` and long-form case-study text reads better off an absolute black;
- a centred hero composition instead of a split one;
- light-weight display type — headings at 500, the hero name at 400;
- a dense, rim-lit particle **shell** rather than a diffuse volume;
- the identity mark at the core of the sphere;
- an evidence strip closing the hero.

Deliberately not adopted: Morpho's logo, wording, colour, typeface and implementation. The mark
is the original **Vertex** glyph, the accent is cyan, and the type is Inter Tight / Inter /
JetBrains Mono. This is inspiration from a public reference, not reuse of its assets.

## Surfaces and colour

Both themes ship. Dark is the designed default and lives on bare `:root`, so the site is correct
with no JavaScript at all. Light arrives two ways: `@media (prefers-color-scheme: light)` scoped
to `:root:not([data-theme="dark"])`, and an explicit `:root[data-theme="light"]` rule placed last
so a deliberate choice wins in either direction. Each theme declares its own `color-scheme`, so
form controls and scrollbars follow.

A small inline script in the root layout — one layout shared by both language trees — applies a
stored choice before first paint, so a visitor who picked the non-default theme never sees the
other one flash. It writes nothing when there is
no stored choice, because the media query already handles that visitor correctly. The choice
persists in `localStorage` under `theme`, inside a `try`/`catch`: blocked storage costs only
persistence, never the theme itself.

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `--surface-void` | `#08090c` | `#fafafb` | Page background |
| `--surface-base` | `#0d0f14` | `#f1f4f8` | Sections that need separation from the void |
| `--surface-raised` | `#12151b` | `#ffffff` | Cards, quotes, code surfaces |
| `--line-subtle` | `#1b2430` | `#e6e9ee` | Decorative rules and dividers |
| `--line-strong` | `#2a3542` | `#d5dae2` | Card and section borders |
| `--line-control` | `#586775` | `#7f8a99` | Borders that identify an interactive control |
| `--text-primary` | `#e8edf4` | `#0f141b` | Headings and body |
| `--text-secondary` | `#9aa6b8` | `#48546a` | Supporting prose |
| `--text-muted` | `#78849a` | `#5c687b` | Labels, metadata, captions |
| `--accent` | `#4cd6ff` | `#0a6e9b` | Links, focus, the identity mark, particle highlights |
| `--accent-deep` | `#2ba8cc` | `#075271` | Hover states |
| `--accent-wash` | accent at 12% | accent at 10% | Tinted backgrounds behind accent content |
| `--field-near` | `#a5ecff` | `#0a6e9b` | Near points of the hero field |
| `--field-far` | `#4a6b86` | `#aab5c4` | Far points of the hero field |
| `--field-additive` | `1` | `0` | Selects additive or alpha blending in the field |

A short group of tokens carries the per-theme treatment of images and translucent chrome:
`--portrait-filter`, `--portrait-veil`, `--header-veil` and `--toggle-veil`.

Measured light-theme contrast on `--surface-void` `#fafafb`: primary 17.7:1, secondary 7.3:1,
muted 5.4:1, accent 5.4:1; white on the accent button 5.7:1; `--line-control` about 3.0:1.
Measured dark-theme contrast on `#000000`: primary 17.1:1 or better, secondary 8.2:1,
muted 5.4:1, accent 11.9:1.

`--line-control` is the only border that identifies a control and is held to the 3:1 non-text
minimum in both themes. `--line-subtle` and `--line-strong` are decorative and are never the sole
indicator of a control. Accent is never the only carrier of meaning — links are underlined in prose.

## Typography

Two variable families, self-hosted by `next/font`, Latin subset only.

| Role | Family | Treatment |
| --- | --- | --- |
| Display and headings | Inter Tight | Weight 500, `-0.03em` tracking, 1.05–1.15 line height |
| Body and interface | Inter | 1.6 line height, max 68 characters per line |
| Labels, metrics, metadata | JetBrains Mono | `0.08em` tracking, uppercase for eyebrows |

Headings sit at 500 and the hero name at 400. Light display weights are what keep a large type
scale from shouting, and weight is not what has to carry the technical register.

The monospace face does that instead: eyebrows, figures and metadata. That is what makes the page
read as engineering without resorting to ornament, and it keeps display type clean.

Scale, fluid between 360 px and 1440 px viewports:

| Step | Size |
| --- | --- |
| `--text-display` | `clamp(2.75rem, 1.6rem + 5vw, 5.5rem)` |
| `--text-h1` | `clamp(2.25rem, 1.5rem + 3.2vw, 3.75rem)` |
| `--text-h2` | `clamp(1.625rem, 1.2rem + 1.8vw, 2.375rem)` |
| `--text-h3` | `clamp(1.25rem, 1.1rem + 0.7vw, 1.5rem)` |
| `--text-body` | `1.0625rem` |
| `--text-small` | `0.9375rem` |
| `--text-label` | `0.75rem` |

## Space and grid

A 4 px base: `--space-1` 0.25rem through `--space-10` 8rem, with the common steps at
0.5/0.75/1/1.5/2/3/4/6/8rem.

Content width is `--measure-wide` 72rem for page frames, `--measure-text` 44rem for prose, and
`--measure-narrow` 34rem for intros. Gutters are `clamp(1.25rem, 5vw, 4rem)`.

Breakpoints: 640 px (two-column lists), 960 px (navigation expands), 1280 px (maximum gutters).
Layouts are CSS Grid with `minmax` and `auto-fit`; no layout depends on a media query alone.

## Components and states

Every interactive element defines rest, hover, focus-visible, active and disabled. Focus is a
2 px `--accent` outline at 3 px offset, never removed and never replaced by colour alone.
Minimum pointer target is 24×24 px, with 44×44 px in the mobile navigation.

- **Button, primary** — accent fill, void text, 1 px transparent border.
- **Button, secondary** — transparent fill, `--line-control` border, primary text.
- **Link, prose** — accent text with a 1 px underline at `0.2em` offset; underline thickens on hover.
- **Card** — `--surface-raised`, 1 px `--line-strong`, 12 px radius. Whole-card links keep the
  heading as the accessible name and do not nest interactive elements.
- **Eyebrow** — monospace, uppercase, `--text-muted`, `0.08em` tracking.
- **Metric** — display figure in primary, unit and qualifier in muted beneath it. A qualifier is
  mandatory whenever the figure is an estimate or has measurement conditions.
- **Theme toggle** — a real button with an accessible name that states what pressing it will do.
  The resolved theme is unknown during server rendering, so the name starts neutral and becomes
  specific after mount; the markup is identical on both sides of hydration.
- **Language switcher** — real links, one per language, with `hreflang`, `lang` and `aria-current`
  on the active one. Links rather than a control, so switching works without JavaScript and each
  language stays shareable and crawlable.

## Identity

An original mark, not a borrowed one. There is no universal AI logo, and no vendor mark is used
or implied.

**Vertex** is a node-graph glyph: five nodes on a 32×32 grid traced by two edges, arranged so the
path reads as a **G** while remaining a legible graph. It carries the two ideas the positioning
needs — connected systems and a personal initial — in one form, and it survives to 16 px because
the outer nodes merge into the stroke rather than disappearing.

- **Static mark** — inline SVG, `currentColor`, used in the header, the footer and `icon.svg`.
- **Hero treatment** — the same node language expanded into a particle shell, with the mark held
  at its core.
- **Still fallback** — one rendered frame of the same geometry, shown when WebGL2, JavaScript or
  motion is unavailable. It is composed, not degraded: a finished image on its own.

## Pixel portrait

A 24x30 sprite drawn by hand from the reference photograph, used on the About page beside the
real portrait and on the 404 page. Colours were sampled from the photograph; the features were
drawn rather than downsampled, because resampling a photograph at sprite resolution produces
noise instead of readable pixel art — the blurred background bleeds straight through the hair.

Runs of identical pixels are merged, so the sprite is 96 rectangles rather than 720 squares. The
idle bob and the blink are CSS animations on two groups, and both stop under reduced motion. It
is decorative unless given a label, in which case it becomes an image with an accessible name.

## Motion

Motion explains change; it never announces itself.

| Class | Duration | Easing |
| --- | --- | --- |
| Micro — hover, focus, colour | 140 ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Transition — reveal, expand | 320 ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Ambient — the particle field | continuous | frame-rate independent |

Entrances move at most 12 px and never delay content past first paint. Nothing animates
`width`, `height`, `top` or `left`; transform and opacity only.

Under `prefers-reduced-motion: reduce`, transitions collapse to 1 ms and the particle field is not
mounted at all: the server-rendered still stays as it is, and no WebGL context is ever created.
Reduced motion means no motion here, not slower motion.

## Particle field specification

One hero element, one route. Hand-written WebGL2, no dependency. The fallback is the
server-rendered still, not a second animation.

**Composition.** Points sit on a thin spherical shell — radius jittered between 0.965 and 1.0 —
placed by a Fibonacci distribution and projected with perspective. The rim is geometric rather
than painted: an even surface distribution projects densest at the silhouette, so the shell reads
as a rim-lit sphere with no brightness trick. Alpha therefore carries only a gentle depth term and
is deliberately kept near-uniform: driving brightness hard by depth would light the centre of the
disc, where the near face projects, instead of the rim. The radius jitter breaks up the moiré a
mathematically perfect shell would show.
The field rotates slowly on one axis, with a small per-point drift so it breathes rather than
turning rigidly. The identity mark sits at the core of the sphere.

**Counts.** 9,000 points on desktop and 3,500 below 40 rem. The server-rendered still draws 400,
which is a payload decision rather than a visual one, because that SVG is inlined into the HTML.

**Theme.** The field follows the active theme. Colours come from `--field-near` and `--field-far`,
read from computed style and re-read whenever the theme changes — by system preference or by the
toggle writing `data-theme`. Blending follows `--field-additive`: additive on dark, where points
accumulate into a glow, and ordinary alpha blending on light, where additive would wash out
against the pale ground.

**Interaction.** Pointer proximity displaces points along the vector away from the cursor. The
displacement is computed in aspect-corrected clip space so the falloff stays circular, with an
influence radius of 0.42 of that space. The CPU eases two uniforms rather than per-point data —
engagement faster than release — so the field settles instead of snapping and pointer interaction
costs nothing per point. Touch taps produce the same displacement briefly and then recover; the
field is never required to read the page.

**Budget and conduct.**

- Under 30 KB gzipped of added client JavaScript.
- The stage reserves a 1/1 box before anything mounts, so a late canvas cannot shift layout.
- One `drawArrays` call per frame; the live field creates no DOM nodes.
- Device pixel ratio capped at 2, and at 1.5 below 640 px.
- Driven by `requestAnimationFrame` with a clamped delta; never by React state. React state changes
  only when the mode changes.
- Paused by `IntersectionObserver` when off-screen and by `visibilitychange` when the tab hides.
- `webglcontextlost` calls `preventDefault()` — normative for restoration — and
  `webglcontextrestored` rebuilds GPU resources.
- A null context, a failed shader link or a `prefers-reduced-motion` preference leaves the still in
  place without an error in the console.
- Unmount deletes buffers, programs and the vertex array, cancels the frame, removes every listener
  and releases the context.

**Still fallback.** The server-rendered SVG is built from the same geometry as the live field, so
it is a still of the real thing rather than a different picture. Generation is deterministic, so
server and client agree exactly. Each point mixes the two field colours in CSS, so the still
follows the theme as well. It is the visible layer until the field has produced a frame, and it
stays visible when WebGL2 is unavailable, when the program fails to build, and under reduced
motion. The two layers cross-fade once, and pausing afterwards freezes the canvas on its last
frame rather than swapping the still back in.

**Accessibility.** The canvas is `aria-hidden` with no `tabindex`, because it conveys nothing a
sighted visitor gets. A visible, keyboard-operable pause control sits beside it: WCAG 2.2
SC 2.2.2 names animation as moving content and grants no decorative exemption, and
`prefers-reduced-motion` is not a documented technique for that criterion. The control is a real
button, labelled, with its state exposed, and it is only rendered when there is motion to pause.

Rationale and sources: [the research note](research/portfolio-2026-09-12.md).
