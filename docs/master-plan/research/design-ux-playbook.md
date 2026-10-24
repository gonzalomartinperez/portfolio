# Design, UX, motion and 3D playbook

> Status: planning research, not executed. Translated from the owner's Spanish working file `reports/portfolio-ux/research.md` (kept outside this repository), dated as in the source. Part of the [master plan](../README.md).

> Goal: inform a **polish plan** (not a redesign, not an architecture refactor) for an original Next.js site with a 3D particle-sphere hero (Three.js/GSAP), a 3D solar-system scene, case studies with galleries, bilingual EN/ES, and dark/light themes.
> Cutoff date: Oct 24, 2026. Sources are inline as `[n]`; the full list is at the end.
> Aligned with the dimensions of `RUBRIC.md` (visual 20, motion 20, performance 15, a11y 15, responsive 10, navigation 10, uniqueness 10).

**Reliability note.** I prioritize primary sources (W3C, web.dev, Next.js/R3F/GSAP/Playwright docs, MDN browser-compat-data, Awwwards, essays by the authors themselves). Where a figure comes from secondary sources or sources conflict, I mark it **(secondary)** or **(conflict)**. Browser support data comes from `@mdn/browser-compat-data` 8.1.7 (Oct 22, 2026), queried directly [27].

---

## 0. Executive summary (TL;DR)

1. **The final 10% is system, not decoration**: tokens (type, spacing, color, radii, durations) applied consistently across all components and both themes. Awwwards weights Design 40% / Usability 30% / Creativity 20% / Content 10% [1]: usability weighs almost as much as visuals.
2. **Fast, purposeful motion**: UI < 300 ms, custom `ease-out` for entrances, only `transform`/`opacity`, interruptible, and **no-motion-first** with `prefers-reduced-motion` [2][3][4][5].
3. **3D must not cost LCP or INP**: DPR ≤ 2 (≤ 1.5 on mobile), < 100 draw calls, `frameloop="demand"` or pause when off-viewport/tab hidden, a static poster as the LCP element, and a fallback for weak devices [6][7][8].
4. **CWV p75**: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, measured in the field (CrUX/web-vitals), not only Lighthouse (which does not measure INP) [9].
5. **The WCAG 2.2 AA items most often forgotten**: 2.4.11 (sticky header covering focus), 2.5.8 (targets ≥ 24×24 px), 2.5.7 (drag with a click alternative), 2 px visible focus at 3:1 [10][11].
6. **Maximum craft on the 3D signature** (§9): the sphere and the solar system stay; they get polished with a 4-verb motion language, a cursor damped by `dt`, a single particle system that morphs from the hero into the background, automatic quality tiers, and per-theme posters [47]–[55].
7. **Light mode with its own identity** (§10): a "daytime space" concept (atlas in ink / sky / blueprint), no `AdditiveBlending`, an oklch background with temperature, tinted shadows, scrims tested on the worst frame [60]–[65].
8. **Recruiters scan**: the initial review of a portfolio takes minutes or less (secondary figures: 30 s to < 3 min); 3–5 case studies, impact up top, short prose, résumé and contact one click away [12][13][14].

---

## 1. Visual design craft

### 1.1 Type scale and fluid typography (`clamp()`)

- **Modular scale**: pick one ratio per extreme breakpoint; the usual practice (Utopia) is e.g. 1.2 (minor third) at 320 px → 1.25–1.333 at 1280–1440 px, interpolating with `clamp()` [15]. Use 6–8 steps (`--step--1` … `--step-5`), not ad-hoc sizes.
- **WCAG 1.4.4 rule (resize text 200%)**: with `clamp()`, **the maximum must be ≤ 2.5× the minimum** so that 200% zoom keeps working in modern browsers [16]. An example that **fails**: `clamp(16px, 5.33px + 3.33vw, 48px)` (3× ratio). Use `rem` for min/max and always mix `rem + vw` in the preferred term (a pure `vw` does not respond to zoom) [16][17].
- `utopia-core` automatically flags the steps that violate 1.4.4 (`wcagViolation`) [15].
- **Body**: 16–18 px base (1 rem–1.125 rem), `line-height` 1.5–1.65 for body, 1.05–1.2 for display; slight negative `letter-spacing` (−0.01 to −0.03 em) only at display sizes.
- **Typographic polish details** (Vercel Web Interface Guidelines) [3]: `text-wrap: balance` on headings (support: Chrome 114, Firefox 121, Safari 17.5 [27]) and `text-wrap: pretty` on paragraphs (Chrome 117, Safari 26; Firefox not yet [27]); `…` instead of `...`; typographic quotes; `&nbsp;` between a number and its unit; `font-variant-numeric: tabular-nums` on metrics/dates; "Loading…" with an ellipsis.

### 1.2 Measure (line length) and grid

- **50–75 characters** per line in body is Baymard's figure (the "45–75" with 66 ideal circulates in secondary sources) [18]. In CSS: `max-width: 65ch` for case-study prose; 45–55ch in side columns or captions.
- Grid: 12 columns desktop / 4–6 tablet / 4 mobile, gutters derived from the spacing scale; **minimum side gutter of 16 px at 320 px** and no horizontal scroll (rubric: 320–1920 px).

### 1.3 Spacing system

- 4 px base with a 4/8/12/16/24/32/48/64/96/128 scale, or Utopia fluid spacing (`--space-s-m` pairs that interpolate) [15]. Rule: within a component, small spaces; between sections, jumps of ≥ 2 steps (proximity = grouping).
- Vertical rhythm: sections with fluid padding, e.g. `clamp(4rem, 3rem + 5vw, 8rem)`.

### 1.4 Color tokens and dark/light contrast

- **Semantic tokens**, not palette tokens: `--bg`, `--bg-elevated`, `--fg`, `--fg-muted`, `--border`, `--accent`, `--accent-fg`, `--focus-ring`. Define them in `oklch()` (universal support: Chrome 111, Firefox 113, Safari 15.4 [27]) for perceptually uniform scales; `light-dark()` is available in all three (Chrome 123, Firefox 120, Safari 17.5) [27].
- **AA contrast**: text 4.5:1 (3:1 if ≥ 24 px or ≥ 18.66 px bold); UI components and borders that identify controls 3:1 (WCAG 1.4.3 / 1.4.11). Verify `--fg-muted` in **both** themes: it is the token that fails most often.
- **Dark mode** [19] (secondary, consistent across sources): avoid pure black (#121212-ish as the base); elevation with lighter surfaces and borders, not shadows; desaturated accents (~20 points less saturation) and lighter tones; off-white text to avoid halation. Do not invert colors.
- **Platform**: `color-scheme: light dark` (or that of the active theme) on `<html>` so scrollbars, form controls and `<select>` respect the theme; `<meta name="theme-color">` matching the background, and an explicit `background-color` on the native `<select>` [3]. Avoid a *flash* of the wrong theme (a minimal blocking script in `<head>` or a cookie read on the server).

### 1.5 Component consistency

- **One** definition per variant: primary / secondary / ghost button; chip (tech tag) static vs. interactive (if it is not clickable, it should have no hover); card (with a single clickable target, no nested links); inline link (underline with `text-underline-offset: 0.2em`, `text-decoration-thickness` 1–2 px).
- All interactive elements with **rest / hover / active / focus-visible / disabled** states, and hover/active/focus more prominent than rest [3].
- Coherent radii: outer radius = inner radius + padding (cards with images inside).
- Iconography: a single set (same stroke, e.g. 1.5 px, same 20/24 px grid), decorative icons `aria-hidden="true"`, icon-only buttons with `aria-label` [3].
- Images: same proportions per context (e.g. 16:10 in cards, 4:3 in the gallery), same radius and a subtle border (1 px `--border`) to separate light screenshots from the light background; `width`/`height` always explicit [3].

---

## 2. Motion design

### 2.1 Principles, duration and easing

- **Purpose**: animate to explain state changes (enter/exit, spatial continuity), not for decoration; and **the more frequent the action, the less animation** (do not animate repeated keyboard actions, command menus, etc.) [2][20].
- **Durations** (Emil Kowalski) [2][4]: UI < 300 ms; press feedback 100–160 ms; tooltips 125–200 ms; dropdowns 150–250 ms; modals/drawers 200–500 ms **(secondary for the per-element ranges)**. A 180 ms select feels more responsive than a 400 ms one [4].
- **Easing** [4]: `ease-out` for enters/exits (starts fast → feels responsive); avoid `ease-in` in UI; the built-in curves are weak → use custom ones, e.g. `cubic-bezier(0.23, 1, 0.32, 1)` ("quint" ease-out) for entrances, `cubic-bezier(0.77, 0, 0.175, 1)` for on-screen movement.
- **Springs**: better for gestures/drags and interruptions (they preserve velocity); bezier for state transitions with a known duration [2][21].
- **Concrete details** [4]: button `scale(0.97)` on `:active`; never animate from `scale(0)` (start at 0.9–0.95); `transform-origin` at the trigger (a popover emerges from the button); adjacent tooltips with no delay after the first; `filter: blur(2px)` on crossfades that "don't close".
- **Technique** [2][3]: only `transform` and `opacity`; never `transition: all`; interruptible animations; WAAPI/CSS when the main thread is busy (hydration, 3D loading).
- **Enter/exit asymmetry** (official Next.js guide) [22]: fast exit (150 ms), softer entrance (210 ms fade with delay = exit; 400 ms movement); short displacements (60 px horizontal, 10 px vertical).

### 2.2 Page transitions: View Transitions in the Next.js App Router (state as of Oct 2026)

- **Next.js** (guide updated Oct 15, 2026): view transitions work in the App Router **with no configuration** using React 19.3 `<ViewTransition>` and `addTransitionType`; navigations are transitions, so they activate on their own. `<Link transitionTypes={['nav-forward']}>` for directionality [22].
- Patterns [22]: *shared element morph* (case-study thumbnail → case-study hero, same `name`), *Suspense reveal* (skeleton → content), *directional slide*, *same-route crossfade* (e.g. EN/ES switch or tabs). Wrappers in each `page.tsx`, not in the layout. Anchored header (`viewTransitionName` + `animation: none`). `::view-transition { pointer-events: none; }` so clicks are not lost.
- **Support** [27]: same-document `startViewTransition` Chrome 111, Safari 18, Firefox 144 (~93% global according to caniuse [28]); cross-document `@view-transition` Chrome 126, Safari 18.2, Firefox no. React uses newer features (types, `view-transition-class`): Chromium 125+ and recent Safari/Firefox; without support, navigation works just the same without animating [22]. It is a safe progressive enhancement.
- **Reduced motion**: override the `::view-transition-*` durations or, better, keep the crossfade and remove the displacement [22].
- **3D canvas and VT**: VT snapshots capture the canvas as an image; name the canvas or exclude it to avoid a frozen frame, and pause the render loop during the transition.

### 2.3 Scroll-linked animation

- **CSS scroll-driven animations** (`animation-timeline: scroll()/view()`) [27]: Chrome 115, Safari 26, **Firefox 159 (beta, release Oct 27, 2026)**; MDN still marks it *Limited availability* [29]. Use inside `@supports (animation-timeline: view())` and with a "final state visible" fallback. Advantage: it runs off the main thread → does not affect INP.
- **GSAP ScrollTrigger** (official mistakes) [23]: do not nest ScrollTriggers inside tweens of a timeline (one per timeline or per element); beware of `immediateRender` in chained `from()`/`to()` (`fromTo`); viewport-dependent values as functions + `invalidateOnRefresh: true`; `ScrollTrigger.refresh()` after loading images without dimensions or after changing language (EN/ES changes heights); **no** `scroll-behavior: smooth` on `html` with ScrollTrigger; create pins in scroll order; in React, clean up on unmount (`useGSAP()` / `gsap.context().revert()`); `gsap.matchMedia()` to separate `(prefers-reduced-motion: no-preference)` and breakpoints.
- **Parallax and scroll-jacking**: parallax is a typical vestibular trigger (WCAG 2.3.3) [24][5]; never hijack the native scroll speed; keep amplitudes small (≤ 10–20% of the viewport).

### 2.4 Micro-interactions

- Hover: color/elevation change in 120–200 ms; only in `@media (hover: hover) and (pointer: fine)` so as not to leave stuck states on touch.
- Press: `scale(0.97)` 100–160 ms [4]. Focus: instant ring (do not animate the focus appearing).
- Copy-to-clipboard with confirmation ("Copied") as on rauno.me [25]; `aria-live="polite"` to announce it [3].
- `touch-action: manipulation` on controls; intentional `-webkit-tap-highlight-color` [3].

### 2.5 Staggered reveals without breaking LCP/CLS

- **The LCP element never starts at `opacity: 0`** or waits on JS: the H1/hero copy or the poster must paint in the first frame. Reveals only below the fold or for secondary elements.
- Animate `transform`/`opacity` (not `height`/`top`) → no CLS. Reserve space (aspect-ratio, `width/height`).
- Stagger 30–60 ms between items, max. ~6–8 animated items (after that, the rest appear together), total < 500 ms.
- If the reveal depends on JS, apply the hidden initial state only once the JS has already run (a `js-ready` class / `@supports`), so as not to leave invisible content if it fails.

### 2.6 `prefers-reduced-motion` and motion sickness

- **No-motion-first** [5][21]: base styles without animation; animations inside `@media (prefers-reduced-motion: no-preference)`. Avoid the global "kill all transitions" snippet (it breaks `animationend`, does not stop WAAPI and can speed up springs) [5][21].
- **Reduce ≠ eliminate**: replace displacements/zoom/parallax with short fades; keep state feedback [5][22].
- JS/3D: `matchMedia('(prefers-reduced-motion: reduce)')` with a `change` listener (not only on mount) [5]; in Next.js, watch out for the first SSR render [21]. For the sphere/solar system: automatic rotation stopped or at ~10–20% speed, no camera that moves with scroll, static particles.
- WCAG 2.2.2 (AA): automatic movement > 5 s alongside other content needs pause/stop/hide → a "Pause animation" button on the 3D hero satisfies it and is a craft detail [3][24]. 2.3.3 (AAA) covers animation triggered by interaction (parallax) [24].

---

## 3. 3D/WebGL on the web

### 3.1 Budgets

| Resource | Target | Source |
|---|---|---|
| Draw calls | < 100 per frame (mobile); desktop tolerates hundreds | [6] (cites Don McCurdy), [7] |
| Vertices | < 100,000 per frame | [6] |
| DPR | `Math.min(devicePixelRatio, 2)`; mobile 1–1.5 | [6][8] |
| Textures | ≤ 2048 px (4096² RGBA = 64 MiB VRAM); KTX2 4–8× less memory | [6] |
| Dynamic lights | ≤ 3 | [6] |
| Frame budget | 16.7 ms at 60 fps; leave a ~6–8 ms margin for the main thread (input) | [2][9] |

- **Particles**: a single `Points`/`InstancedMesh` (1 draw call), animation in the vertex shader (do not update `BufferAttribute` in JS every frame), `mediump` on mobile [6][7].
- **Adaptive**: `<PerformanceMonitor>` (drei) with `onDecline` → lower DPR/particles, `flipflops={3}` + `onFallback` so it does not oscillate [6][7].

### 3.2 Pause when not visible

- `frameloop="demand"` + `invalidate()` when the scene is static; or `frameloop="never"` when it is off-viewport [7].
- **IntersectionObserver** on the canvas container: pause the loop (and the associated GSAP tickers) on exit; **Page Visibility** (`visibilitychange`) for a hidden tab (rAF slows down on its own, but timers/GSAP can accumulate delta → `Timer.connect(document)` or reset the clock) [6].
- Pause during View Transitions and while a lightbox/dialog is open over the scene.
- `dispose()` geometries, materials, textures and render targets on unmount (navigating between pages with 3D); watch `renderer.info.memory` [6].

### 3.3 Progressive enhancement, poster and fallback

- **Poster first**: render a static image (AVIF/WebP of the sphere's first frame) as the LCP; mount the canvas with `next/dynamic({ ssr: false })` after `requestIdleCallback`/first input or when it enters the viewport; crossfade poster → canvas in 300–500 ms once the first frame is ready.
- **Gating**: do not mount 3D if `prefers-reduced-motion: reduce` (or mount it static), `navigator.connection.saveData`, `deviceMemory ≤ 2`, `hardwareConcurrency ≤ 4`, WebGL unavailable or `failIfMajorPerformanceCaveat`. The poster + text is the complete experience, not an error.
- The 3D must be `aria-hidden` (decorative) or have an equivalent text alternative if it conveys information (e.g. the solar system as navigation → an accessible list of links in parallel).
- **WebGPU**: three.js r171+ ships a WebGPURenderer with fallback to WebGL2 (TSL) [30]; migrating is not necessary for a polish.

### 3.4 Measuring the impact on INP/LCP

- Lab: Chrome DevTools Performance (CPU 4× / 6× throttling, "mid-tier mobile" profile), Lighthouse (LCP, CLS, TBT as a proxy for INP) [9]; `stats-gl`, `renderer.info`, Spector.js for draw calls [8].
- Field: `web-vitals` with the *attribution build* (`onINP` reports the long task and the culprit script; `onLCP` the element) → send to analytics [9]. Tasks > 50 ms are *long tasks*; break up the 3D initialization (generating particles, compiling shaders) with `scheduler.yield()` (Chrome 129, Firefox 142; Safari no → `setTimeout` fallback) [26][27].
- Pre-compile shaders (`renderer.compile`) before the reveal to avoid the first-frame "hitch".

### 3.5 Examples of well-done 3D

- **Bruno Simon** (bruno-simon.com): driving-game portfolio; rebuilt for the WebGPU era with TSL; case study on Awwwards [31]. Lesson: the 3D *is* the navigation and has an escape hatch (a simple version with links).
- **Recent three.js portfolios** documented on Codrops/the three.js forum (e.g. "Sketching the impossible", Jun 2026, 3D without a single 3D model) [32]. Common lesson: procedural shaders instead of heavy assets → little network weight.

---

## 4. Performance

### 4.1 Core Web Vitals

- "Good" thresholds at **p75, mobile and desktop separately**: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 [9]. (Needs improvement: LCP ≤ 4 s, INP ≤ 500 ms, CLS ≤ 0.25.)
- Tools [9]: field → CrUX (PageSpeed Insights, CrUX Vis, Search Console; a low-traffic portfolio probably has no CrUX data → own RUM with `web-vitals`); lab → Lighthouse (does not measure INP; use TBT) and DevTools (Live metrics with real interactions).
- Reasonable internal goals for a portfolio: Lighthouse mobile ≥ 90 on Home and ≥ 95 on case studies; TBT < 200 ms on mobile.

### 4.2 Images

- `next/image` (Next 16) [33]: the default `formats` is WebP only → configure `formats: ['image/avif', 'image/webp']` (AVIF ~20% smaller, ~50% slower to encode the first time). `qualities` is **mandatory** since Next 16 (default `[75]`); `priority` is **deprecated** → use `preload`, `loading="eager"` or `fetchPriority="high"` only on the LCP image. `sizes` always on images that do not fill the viewport (otherwise the largest variant is downloaded). `placeholder="blur"` is automatic on static imports. `minimumCacheTTL` default 4 h; prefer static imports (hash + `immutable`).
- Galleries: thumbnails with real `sizes` (e.g. `(max-width: 768px) 100vw, 50vw`), lazy by default, full-size only when the lightbox opens (and preload the next/previous one).
- Video instead of GIF (`<video autoplay muted loop playsinline>` + poster + reduced under reduced-motion) [3].

### 4.3 Fonts

- `next/font` self-hosts, subsets and generates a metric fallback (`size-adjust`, `ascent-override`) that avoids CLS from swapping [34][35]. For bilingual EN/ES, `subsets: ['latin']` is enough (á é í ó ú ñ ¿ ¡ are in Latin-1); do not add `latin-ext` unless needed.
- At most 2 families (or 1 variable + 1 mono), variable fonts instead of 4–6 weights; `display: 'swap'` for body, `optional` acceptable for display if zero CLS is prioritized.

### 4.4 JavaScript, RSC and prefetch

- Indicative budget: ≤ ~170 KB gz JS on the initial route *without* the 3D; Three.js (~150 KB gz core) + GSAP in deferred chunks that do not block the LCP. Measure with `@next/bundle-analyzer`.
- **Server Components** by default: case-study content, MDX, i18n strings and metadata on the server → zero hydration JS for text; `'use client'` only in islands (canvas, lightbox, theme/language toggle).
- `<Link>` prefetches automatically in the viewport in production; for the View Transitions morph the destination page must be prefetched/cached [22]. Avoid prefetching routes with heavy 3D if navigation is not likely.
- Avoid layout reads during render and batch reads/writes; `content-visibility: auto` for long off-screen sections [3].

---

## 5. Accessibility (WCAG 2.2 AA)

### 5.1 What is most often missed in 2.2 [10][11]

- **2.4.11 Focus Not Obscured (Minimum, AA)**: the focused element cannot be *totally* covered by a sticky header, banners or toasts. Fix: `scroll-padding-top: <header height + 8px>` on `html` and `scroll-margin-top` on anchors/headings [3][10].
- **2.5.8 Target Size (Minimum, AA)**: targets ≥ **24×24 CSS px** or with equivalent spacing (a 24 px circle that does not intersect others). Social icons, carousel dots, EN/ES and theme toggles, and the lightbox close button are the suspects. Craft goal: 44×44 on touch (AAA 2.5.5) [10].
- **2.5.7 Dragging Movements (AA)**: if the 3D scene/gallery is "dragged" to rotate/navigate, there must be a single-pointer alternative without dragging (prev/next buttons, click on a planet). Scrolling is excluded [10].
- **2.4.13 Focus Appearance (AAA, but a good target)**: indicator ≥ 2 px perimeter and 3:1 contrast between states [11]. Pattern: `outline: 2px solid var(--focus-ring); outline-offset: 2px;` with `:focus-visible`; never `outline: none` without a replacement [3].
- Other new AA criteria: 3.2.6 Consistent Help (contact in the same place on all pages), 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication (relevant if there is a contact form) [10].

### 5.2 Patterns

- **Skip link** "Saltar al contenido / Skip to content" visible on focus, first tabbable element (Brittany Chiang has one) [3][36].
- **Dialog/lightbox**: native `<dialog>` with `showModal()` (focus trap, `Esc`, `inert` for the rest, universal support [27]); return focus to the thumbnail on close; ←/→ arrows to navigate; `overscroll-behavior: contain` [3]; a "3 / 12" counter with `aria-live="polite"`.
- **Carousel** (APG) [37]: container `aria-roledescription="carousel"` + `aria-label` (without repeating the word "carousel"), slides `role="group"` + `aria-roledescription="slide"` + `aria-label="3 de 12"`; `aria-live="polite"` if it does not rotate on its own / `off` if it rotates; rotation button first in Tab order, with an action label ("Detener rotación") without `aria-pressed`; **localize** `aria-roledescription` (EN/ES). Preferably: do not auto-rotate.
- **Keyboard without traps**: tab through the whole site including the canvas (if the canvas is not interactive, `tabindex` must not trap it; if it is, `Esc`/Tab must exit).
- **Language**: correct `<html lang="es">`/`"en"` per route; alternate `hreflang`; `lang` on fragments in another language; `translate="no"` on product names/code [3].
- **Reduced motion** (§2.6), `color-scheme` (§1.4), contrast in both themes.

### 5.3 Testing

- `@axe-core/playwright` with `.withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'])` on every route × theme × language, and after opening the lightbox/menu (axe only sees what is rendered) [38][39]. Snapshot violation "fingerprints" instead of the full array [38].
- Automated testing does not catch everything [38]: a manual pass with keyboard, VoiceOver/NVDA on a case study, 200% and 400% zoom (reflow 1.4.10 at 320 px), reduced-motion and forced-colors emulation in DevTools.

---

## 6. UX and navigation for portfolios

### 6.1 How hiring people scan

- Evidence (weak but consistent): NN/g — hiring managers short on time **scan**, long prose does not help, pick **3–5 projects** as detailed case studies, aligned to the job description, showing process and impact [12][13]. Time figures: < 2–3 min of initial review (Halian/Noble Desktop, **secondary**) and "30 seconds to reject" (UX Collective, **secondary**) [14].
- For engineers: documented repos with a demo weigh more than bullets; for AI/ML, evidence such as model cards/notebooks/evals [40] (**secondary**).
- Implications: in the first 5–10 s → role ("AI Engineer"), a one-line value proposition, 2–3 featured projects with a measurable result, résumé and contact. The 3D accompanies that message; it does not delay it.

### 6.2 Long case studies: wayfinding

- Recommended structure: **TL;DR card on top** (role, duration, stack, result/metric, links to demo/repo) → problem → constraints → decisions/architecture (diagram) → results/evals → learnings → next case study.
- **Sticky TOC** on desktop (≥ 1200 px) with scroll-spy (`IntersectionObserver`, `aria-current="true"` on the active section); on mobile, a collapsible TOC at the top or "Jump to…"; a thin reading progress bar (2–3 px, `transform: scaleX`, scroll-driven animation where supported) — optional and decorative (`aria-hidden`).
- Headings with a copyable anchor and `scroll-margin-top` [3]; URLs that reflect state (section, open slide) [3].
- Prev/next navigation between case studies at the end + a contact CTA.

### 6.3 CTAs

- One primary CTA per view ("Contactar / Get in touch", or "Descargar CV"); the résumé as a PDF linked from the header/footer and in the experience section (Brittany Chiang's "View Full Résumé" pattern) [36]. Email with click-to-copy in addition to `mailto:` [25].
- Specific labels ("Descargar CV (PDF, 120 KB)"), not "Click aquí" [3].

### 6.4 Gallery / lightbox

- Thumbnail grid with fixed aspect-ratio + a short caption; click opens the lightbox with a morph (VT shared element) from the thumbnail [22]; keyboard ←/→/Esc, swipe on touch **plus** visible buttons (2.5.7); counter; optional zoom; preload ±1; focus returned on close; `inert` background; scroll lock without layout shift (`scrollbar-gutter: stable`).

### 6.5 404, empty states and loading

- A 404 with identity (e.g. a "lost" planet from the static solar system), a correct bilingual message according to the route, and links to Home / Projects / Contact. `not-found.tsx` per segment.
- Handled empty states (filters with no results) [3].
- Loading: `loading.tsx`/Suspense with skeletons that respect final dimensions (CLS 0) and a soft reveal [22]; for 3D, a poster instead of a spinner; "Cargando…" texts with an ellipsis [3].

---

## 7. Exemplars (2024–2026) and design-engineering resources

| Site | What makes it feel "crafted" | Applicable lesson |
|---|---|---|
| **Brittany Chiang** (brittanychiang.com) [36] | 2-column layout with a fixed identity and scrolling content, skip link, experience with stack tags, "View Full Résumé", project archive, easter egg ("Click to time travel") | Very clear hierarchy + 1 playful detail |
| **Rauno Freiberg** (rauno.me) [25][20] | Minimal home, manifesto, "Craft" as an interaction lab, click-to-copy with feedback; essay *Invisible Details of Interaction Design* (interruptibility, kinetic physics, frequency, Fitts) | The invisible details are the product |
| **Emil Kowalski** (emilkowal.ski, animations.dev) [2][4][41] | Short, origin-aware animations, `scale(0.97)`, blur on crossfades; course with > 10k students | Canonical source of motion values |
| **Josh W. Comeau** (joshwcomeau.com) [21][42] | Hand-made springs, optional sound, "whimsy" with reduced-motion well solved | Delight + accessibility together |
| **Lee Robinson** (leerob.com) [43] | Minimalism, typography and content first, fast, open source | Speed is also aesthetics |
| **Bruno Simon** (bruno-simon.com) [31] | 3D as total navigation, physics, WebGPU/TSL | If 3D is the protagonist, give it a simple way out |
| **Devouring Details** (devouringdetails.com) [20] | Rauno's interactive interaction-design manual, 20 chapters with React components | Reference for micro-interactions |
| **Jesper Landberg** — Awwwards Portfolio Honors Aug 2026, SOTD Sep 29, 2026 [44] | Recent award-winning WebGL portfolio | Benchmark of the current "Awwwards" level |
| **Léo Parpeix "Portfolio 2026"** — SOTD Sep 14, 2026; **Brandon Yasin** — SOTD Oct 24, 2026 [44] | Recent portfolio SOTDs | Review transitions and display typography |
| **Paco Coursey** (paco.me) | Author of `cmdk` and `next-themes`; minimal design-engineer site (I could not verify the current content in this search) | Command menu and theming without flash |

Resources: Vercel **Web Interface Guidelines** (repo `vercel-labs/web-interface-guidelines`, actionable checklist) [3]; the official Next.js guide **Designing view transitions** [22]; Emil Kowalski *Great animations* and *7 practical animation tips* [2][4]; Rauno *Invisible details* [20]; Linear *Why is quality so rare* ("Quality creates gravity", quality is a daily choice; craft is not outsourced) [45]; R3F *Scaling performance* [7]; Utsubo *100 Three.js tips* [6].

---

## 8. Design quality evaluation

### 8.1 How Awwwards scores [1]

- Criteria and weights: **Design 40%, Usability 30%, Creativity 20%, Content 10%**. The Developer Award is separate (dev jury, score > 7 over SOTD).
- ≥ 18 jurors per site; the 3 scores furthest from the average are discarded. **Honorable Mention ≥ 6.5**; SOTD = the highest of the day; SOTM = monthly top 8 re-evaluated; SOTY among the SOTMs.
- Reading for this site: the 3D adds to Creativity (20%), but Usability (30%) penalizes long loaders, scroll-jacking, unreadable text and confusing navigation. Content (10%): case studies with substance.

### 8.2 "Last 10%" checklist (what a senior designer looks at)

- Optical alignments (icons next to text optically centered, not mathematically; hanging quotation marks in quotes).
- Widows/orphans resolved (`text-wrap: balance/pretty`); no ugly breaks in EN **and** ES (Spanish is ~15–25% longer: test titles and buttons in both languages).
- Type scale and spacing with no off-system values; same radii, borders and shadows.
- Complete states on all interactive elements (hover/active/focus/disabled/loading) in both themes.
- Real text contrast over the 3D canvas (a scrim/gradient behind hero text if particles cross it).
- No animation > 300 ms in frequent UI; no jumps (CLS) when loading fonts, images or changing language/theme.
- Favicon (SVG with a dark variant), `apple-touch-icon`, OG image per page and language, `theme-color` per theme.
- Text selection with the brand color (`::selection`), scrollbar consistent with the theme (`color-scheme`), `caret-color`.
- Copy: active voice, numbers as numerals, consistent titles (Title Case in EN, sentence case in ES) [3].
- 404, offline/errors, empty states and loading designed.
- Test on a real mid-range Android + iPhone, 320 px and 1920 px, trackpad and mouse.
- The "signature detail": 1–2 memorable micro-interactions consistent with the identity (sphere/solar system), not 15.

Matt Strom (*The paradox of polish*) [46]: polish pays off more when it is in the system from the start than as a final layer — in a polish plan, that means **fix base tokens and components first** and then the instances.

---

## 9. Signature elements: taking the particle sphere and the solar system to maximum craft

> Owner requirement: the star/particle sphere of the hero and the solar-system background **stay**. The goal is to polish their motion language, not replace them.

### 9.1 A motion language of its own

Define 4 "verbs" and use only those, with the same time/easing tokens in DOM and WebGL (GSAP can animate uniforms and DOM elements with the same timeline, a pattern from a portfolio documented on Codrops, May 2026 [47]):

| Verb | What it does | Indicative values |
|---|---|---|
| **Breathe** (idle) | displacement with low-frequency curl/simplex noise in the vertex shader + a slight scale pulse | 6–10 s cycle, amplitude 1–3% of the radius; rotation ≤ 0.02–0.05 rad/s |
| **React** (cursor/tap) | local repulsion around the cursor point projected onto the sphere, which returns with damping | influence radius 15–25% of the sphere radius; return 400–800 ms; intensity ∝ cursor speed |
| **Transform** (scroll/section) | morph between target shapes (sphere → dispersion → background star field) | scrub with 0.5–1 s smoothing; never > 1 transformation per scroll viewport |
| **Acknowledge** (UI state) | brief echo when changing theme/language or when hovering the main CTA | 300–600 ms, once only, never in a loop |

- **Continuity**: the same particle system goes from sphere (hero) to stardust/solar-system background, blending two position attributes (`aPositionA`, `aPositionB`) with a scroll-controlled `uMix` uniform. This is the "scroll particle morph" pattern (e.g. ValiCred: ~3,400 particles across 12 shapes with ScrollTrigger switching targets and palettes) [48]. This connects the hero and the content instead of "cutting" between scenes.
- **Fixed canvas behind the content** and the DOM scrolling over it; ScrollTrigger drives the camera/uniforms in stretches (pattern from Codrops' GSAP cinematic scenes tutorial, Nov 2025) [49]. No long pin and no scroll-jacking.

### 9.2 Cursor (and touch) interaction

- **Project the cursor into 3D**: raycast against an invisible sphere/plane to get the hit point, and pass it as a `uPointer` uniform (pattern from Codrops' GPGPU tutorial, Dec 2024 [50]; see also Interactive Particles 2019 [51]). Throttle the raycast (GitHub lowers the raycast frequency in its low quality tier) [52].
- **Frame-rate-independent smoothing**: never `lerp(a, b, 0.1)` per frame (it depends on fps); use `THREE.MathUtils.damp(current, target, λ, dt)` or `maath/easing.damp3` (λ ≈ 6–12 for the pointer, 2–4 for the camera) [53].
- **"Spring" physics**: repulsion with a soft falloff (`smoothstep`) and elastic return; intensity modulated by cursor speed gives a tactile feel ("fidgetability", Rauno) [20]. A slight **camera tilt** (±2–4°) following the pointer adds depth without causing nausea.
- **Stateless = cheap**: with < ~50k particles, computing the repulsion in the vertex shader from the damped pointer (stateless) is enough; GPGPU (`GPUComputationRenderer`, ping-pong textures with position/velocity) only if you want per-particle inertia, trails or > 50k particles [50].
- **Touch** (`pointer: coarse`): there is no hover → react to the tap (a 600–900 ms wave/ripple from the touched point) and tie the breathing to scroll; do not depend on the gyroscope (iOS asks for permission).
- **Accessibility**: the interaction is decorative (canvas `aria-hidden`); under reduced-motion, cursor reaction is disabled or reduced to a slight brightness change with no displacement.

### 9.3 Scroll and transitions into the content

- **Hero → content**: on scroll, the sphere expands/disperses and its opacity/brightness drops until it becomes the background star field (0 → 100% of the first viewport). The hero text exits with a fade + 10–20 px translate; the sphere must **never** compete with the next H2.
- **Solar system as background**: slow, believable orbits (periods proportional to `a^1.5` — Kepler's 3rd law — give natural ratios without being realistic), period of the fastest planet ≥ 20 s; depth with 2–3 layers of subtle parallax; **visual activity concentrated at the edges**, not behind the text [54].
- **Pause on exit**: Stripe stops all animations when the page scrolls past the globe and moves it off-screen (`translateX(100vw)`), and turns off other animations during scroll [55]. Equivalent here: `frameloop` to demand/never when the scene adds nothing (e.g. in the footer) and reduce work during fast scrolling.
- **Toward case studies**: the project thumbnail can "emerge" from a planet (VT shared element in the DOM, not in WebGL) [22]; on return, the planet "receives" the thumbnail.

### 9.4 Performance-safe techniques to make it look premium

- **Soft particles without MSAA**: `antialias: false` (Stripe and GitHub turned it off for performance on high-density screens) [52][55] + a circular sprite with a `smoothstep` edge in the fragment shader → soft edges for free. Depth size attenuation and *depth fade* (distant ones smaller and dimmer) give volume.
- **Per-particle twinkle** with a random phase in an attribute (`aRandom`) — Stripe uses a per-point twinkle shader [55]. Uniform distribution on a sphere with a Fibonacci/"sunflower" spiral (Stripe uses it) instead of pure random → it looks designed [55].
- **Automatic quality tiers** (GitHub pattern): if **55.5 fps is not sustained over the last 50 frames**, drop a tier: DPR 2 → 1.5, fewer particles, less raycasting [52]. Target budget for the background: ≤ 4 ms of GPU per frame on a mid-range laptop.
- **A fallback that looks good**: GitHub embeds an SVG of the globe as a placeholder and crossfades to the canvas when the first frame is ready, using WAAPI so as not to touch the DOM during the transition [52]. Apply the same: an SVG/AVIF poster of the sphere and the solar system per **theme**.
- Bloom: if used, at half resolution and only in dark; a fake "glow" in the sprite (radial gradient in the fragment shader) is preferable — no extra pass.

### 9.5 3D craft references

- **Lusion** (Lusion v3, SOTY 2023 + Developer Award; Lusion Labs includes mouse interaction with a dark/light switch) [56]; **Igloo Inc** (Site of the Year 2024 + Developer Award; a landing page of only 3 sections where the 3D sustains engagement) [56][57]; **Stripe globe** and **GitHub globe** as engineering references [52][55]; **Bruno Simon** [31].

---

## 10. Light mode as impactful as dark (not an inverted dark)

### 10.1 Choose a "daytime space" concept

A night sky on a white background does not work: the scene has to be **re-imagined**. Three directions coherent with sphere + solar system (pick one):

1. **Celestial atlas / ink on paper**: warm paper background (oklch L ≈ 0.97, C ≈ 0.01, hue ~80), particles as ink/graphite dots, orbits as fine astronomical-chart lines (1 px, 20–35% opacity), accent in a deep blue or vermilion. It is the most "editorial" option and the one that contrasts best with dark.
2. **Atmosphere / daytime sky**: a very pale sky gradient (cool blue at the top → warm white at the bottom), particles as lit dust with a soft shadow, planets with *rim light* instead of glow.
3. **Inverted blueprint / laboratory**: cool white with a subtle grid, particles in the accent color with high chroma; scientific-instrument aesthetic (fits "AI Engineer").

References for well-done bright 3D: **Stripe** (animated dot globe on a light page, twinkle and arcs) [55]; **Messenger** by Abeto (tiny pastel planet in three.js, Awwwards SOTD with 7.92, runs smoothly on mobile) [58]; **Lusion Labs** (mouse + dark/light switch) [56]; **evensix** (R3F with a light/dark component) and **3D Web Lab 2.0** (dark/light switch in 3D) as references on Awwwards Inspiration [59]; "Transition to Night Mode" (Phantom) as a day→night transition reference [59].

### 10.2 Blending and rendering on a light background

- **`AdditiveBlending` disappears on light backgrounds**: it adds color onto a background that is already near 1.0 → no *headroom* and everything turns white [60]. In light use `NormalBlending` (with `premultipliedAlpha`), particles **darker than the background**, `depthWrite: false` and, if there are ordering artifacts, `alphaTest` [60]. `MultiplyBlending` works for the "ink" look (it only darkens: light particles will not be visible) [60].
- **Material per theme, not a new shader**: the same shader with `uColorA/uColorB`, `uOpacity`, `uBlendMode` uniforms swapped per theme; animate the uniforms for 400–600 ms when changing theme instead of a jump.
- **Glow in light = shadow or color**: bloom lightens → washes out the image. Replace it with a darker/tinted halo (like an "ink bleed") or with high-chroma color; reserve bloom for dark.
- **Tone mapping and color**: tone mapping can compress white to gray; so that the background matches the CSS exactly, render the canvas with `alpha: true` and a transparent clear (so the CSS `background` shows) instead of painting the background in WebGL; `NeutralToneMapping` preserves hue better than AgX (which tends to desaturate) [61]. Verify there is no "seam" between canvas and page.
- **Perceptual weight**: a dark 1 px dot on a light background is perceived as thinner than a light one on dark (irradiation); in light raise the dot size by ~10–25% or the opacity to maintain presence. (Polarity asymmetry is recognized by APCA, which gives different values for light/dark text [62].)

### 10.3 Color science for light backgrounds

- **Background never pure `#fff`** for the scene: L 0.97–0.99 with chroma 0.005–0.015 toward the brand hue → the white "has temperature". Elevated surfaces can be purer white + shadow.
- **Elevation in light = shadows** (the opposite of dark, where lighter surfaces and borders are used) [19]. **Tinted** shadows with the background hue and lower lightness, layered, not semi-transparent black (which desaturates and muddies) [63].
- **Accents**: in light lower L (≈ 0.45–0.6 in oklch) and raise chroma relative to dark; the same hue in both themes maintains identity. Very saturated colors are perceived as brighter (Helmholtz–Kohlrausch effect), so validate contrast numerically, not by eye.
- **Text**: not pure black; oklch L ≈ 0.18–0.25 with the theme hue; `--fg-muted` ≥ 4.5:1 against the background **and** against the darkest/lightest zone of the canvas that sits behind it.
- **APCA** as a complementary check (a WCAG 3 candidate, non-normative): Lc ≥ 75 for body, ≥ 90 preferred for fluent text [62]; formal compliance remains WCAG 2.x (4.5:1 / 3:1).

### 10.4 Safe overlays for text over 3D

- **Scrim** between canvas and text: a gradient from the background color (light: 85–92% opacity; dark: 70–85%) to transparent behind the headline, or a semi-opaque layer [54][64].
- **Test the worst frame**, not a screenshot: contrast changes every frame; in light, measure against the darkest particle zone behind the text (for dark text, against the darkest zone) — criterion of WCAG technique F83 [54][65].
- **Exclusion zone**: reduced particle density/opacity inside the text's bounding box (a radial mask in the shader with `uTextRect`), activity at the edges [54].
- Cards over the 3D background: `backdrop-filter: blur(12–20px)` + semi-opaque background (light: white 70–80%; dark: surface 60–75%) + 1 px border; opaque fallback with `@supports not (backdrop-filter: blur(1px))`.

### 10.5 The theme transition as a brand moment

- Theme toggle with a **View Transition** (circular reveal from the button via `clip-path` on `::view-transition-new(root)`, 400–600 ms) and, in parallel, a 3D uniform animation (night → day: the stars "switch off" and the atlas lines emerge). With reduced-motion: a 150 ms crossfade or an instant change [22].
- Persist the preference, respect `prefers-color-scheme` on the first visit, no flash.
- Posters/fallbacks and OG images **per theme**.

---

## 11. PLAYBOOK — 75 polish rules with target values

> Ordered by rubric dimension. Each rule is verifiable.

### Visual (rubric §1)

1. **A single fluid type scale** of 7–8 steps with `clamp(rem, rem + vw, rem)`; ratio ~1.2 at 320 px → ~1.25–1.333 at 1440 px [15].
2. **Max ≤ 2.5× min** in every typographic `clamp()` (WCAG 1.4.4) [16].
3. Body 16–18 px, `line-height` 1.5–1.65; display 1.05–1.2 with tracking −0.01 to −0.03 em.
4. **Prose at `max-width: 65ch`** (range 50–75 characters) [18].
5. `text-wrap: balance` on h1–h3 and `text-wrap: pretty` on paragraphs [3][27].
6. Spacing only from the 4/8/12/16/24/32/48/64/96/128 scale (or Utopia fluid); sections `clamp(4rem, 3rem + 5vw, 8rem)`.
7. Semantic color tokens in `oklch()` for both themes; zero loose hex values in components [27].
8. Contrast **≥ 4.5:1** normal text, **≥ 3:1** large text and borders/controls, in dark *and* light (verify `--fg-muted`).
9. Dark: background not pure black (L ~0.14–0.18 in oklch), elevation by surface+border, accents ~20 pts less saturated [19].
10. `color-scheme` and `<meta name="theme-color">` synchronized with the active theme; no theme flash [3].
11. Buttons/chips/cards/links: one definition per variant, 5 states (rest/hover/active/focus-visible/disabled) [3].
12. Non-interactive chips with no hover or pointer cursor; cards with a single clickable target.
13. Inline links underlined, `text-underline-offset: 0.2em`, thickness 1–2 px.
14. A single icon set (same stroke and 20/24 px grid); decorative ones `aria-hidden` [3].
15. Images with a fixed aspect-ratio per context, same radius and 1 px `--border` border; `width`/`height` always [3].
16. Microtypography: `…`, curly quotes, `&nbsp;` number-unit, `tabular-nums` on dates/metrics [3].

### Motion (rubric §2)

17. UI transitions **120–250 ms**; nothing in frequent UI > 300 ms; modals/lightbox 200–350 ms [2][4].
18. Default easing `cubic-bezier(0.23, 1, 0.32, 1)` for entrances; never `ease-in` in UI [4].
19. Only `transform`/`opacity` (+ occasional `filter`); `transition: all` prohibited [3].
20. Press `scale(0.97)` 100–160 ms; entrances from `scale(0.95)`, never `scale(0)` [4].
21. `transform-origin` at the trigger for popovers/menus [4].
22. Hover only in `@media (hover: hover) and (pointer: fine)`.
23. Interruptible animations (CSS transitions or springs), without blocking input [2][20].
24. Page transitions with React `<ViewTransition>`: exit 150 ms, enter 210 ms (+150 ms delay), movement 400 ms, offset 60 px; anchored header; `::view-transition { pointer-events: none }` [22].
25. Thumbnail → hero morph in case studies with a shared `name` + `share="morph"` `default="none"` [22].
26. Stagger 30–60 ms, ≤ 8 items, total < 500 ms; **never** on the LCP element.
27. Scroll-driven CSS inside `@supports (animation-timeline: view())` with a visible fallback (Chrome 115, Safari 26, Firefox 159) [27].
28. ScrollTrigger: one per element/timeline, `invalidateOnRefresh`, `refresh()` after a language/theme/image change, cleanup on unmount, no `scroll-behavior: smooth` on `html` [23].
29. **No-motion-first**: animations inside `(prefers-reduced-motion: no-preference)`; under reduce, fades ≤ 150 ms instead of displacements [5][21].
30. `matchMedia` `change` listener for reduced motion in JS/3D (pause live) [5].
31. Visible "Pause animation" button on the 3D hero (WCAG 2.2.2) [24].
32. Parallax ≤ 10–20% amplitude and disabled under reduced motion; zero scroll-jacking [24].

### Performance + 3D (rubric §3)

33. **LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75** mobile; Lighthouse mobile ≥ 90 Home / ≥ 95 case studies; TBT < 200 ms [9].
34. RUM with `web-vitals` (attribution build) because CrUX probably has no data for the site [9].
35. Hero: **AVIF/WebP poster as the LCP** with `preload`/`fetchPriority="high"`; canvas mounted on idle or when entering the viewport, crossfade 300–500 ms [33].
36. DPR `min(devicePixelRatio, 2)` desktop, ≤ 1.5 mobile; `PerformanceMonitor` lowers DPR/particles if FPS drops [6][7].
37. **< 100 draw calls, < 100k vertices**; particles in a `Points`/`InstancedMesh` with shader animation [6].
38. Pause rendering off-viewport (IntersectionObserver), in a hidden tab (`visibilitychange`), during VT and with the lightbox open; `frameloop="demand"` if static [6][7].
39. Gating: no animated 3D with reduced-motion, `saveData`, `deviceMemory ≤ 2` or without WebGL → full static poster.
40. 3D init chunked (< 50 ms per task) with `scheduler.yield()` + fallback; shaders precompiled before the reveal [26].
41. `dispose()` of every GPU resource on unmount; `renderer.info.memory` stable across navigations [6].
42. `next/image`: `formats: ['image/avif','image/webp']`, explicit `qualities`, correct `sizes` on every non-full-width image, `placeholder="blur"` on static imports; `priority` → `preload` [33].
43. Fonts via `next/font`, ≤ 2 families (variable), `subsets: ['latin']`, adjusted fallback (CLS 0) [34][35].
44. Initial JS (without 3D) ≤ ~170 KB gz; Three/GSAP in deferred chunks; content in Server Components.

### Accessibility (rubric §4)

45. `:focus-visible` focus with `outline: 2px solid var(--focus-ring)` + `outline-offset: 2px`, contrast ≥ 3:1 in both themes [11].
46. `scroll-padding-top` = sticky header height + 8 px; `scroll-margin-top` on anchors (2.4.11) [10][3].
47. **All targets ≥ 24×24 px** (44×44 goal on touch): social icons, language/theme toggles, dots, lightbox close (2.5.8) [10].
48. Every drag interaction (3D, gallery) with a click/tap and keyboard alternative (2.5.7) [10].
49. Skip link as the first tabbable; `header/nav/main/footer` landmarks; hierarchical headings [3].
50. Lightbox in `<dialog>` with `showModal()`, `Esc`, ←/→, focus returned to the thumbnail, `overscroll-behavior: contain` [3][27].
51. Carousel per APG with `aria-roledescription` localized EN/ES, no auto-rotation [37].
52. axe (`wcag22aa`) in CI per route × theme × language + open states; 0 serious/critical violations [38][39].

### Responsive (rubric §5)

53. No horizontal overflow from 320 to 1920 px; minimum gutter 16 px; `env(safe-area-inset-*)` on full-bleed; test ES strings (longer) in nav and buttons [3].

### Navigation (rubric §6)

54. In the first viewport: role + one-line proposition + access to projects, résumé (PDF) and contact (≤ 1 click); 3–5 featured case studies [12][13].
55. Case studies with a TL;DR card (role, stack, measurable result, links), sticky TOC with scroll-spy (`aria-current`) at ≥ 1200 px, copyable anchors, prev/next at the end and a contact CTA; bilingual 404 with identity and exit routes.

### Uniqueness (rubric §7)

56. 1–2 "signature details" coherent with the sphere/solar system (e.g. particle morph when changing theme or language, a cursor that slightly perturbs the particles), each with a reduced-motion variant and a measured cost (< 2 ms/frame).

### 3D signature: sphere + solar system (owner requirement)

57. Motion language of 4 verbs (breathe / react / transform / acknowledge) with shared DOM↔WebGL tokens; breathing 6–10 s, amplitude 1–3% [47].
58. Cursor projected into 3D by a throttled raycast; repulsion with radius 15–25% of the sphere radius, return 400–800 ms, intensity ∝ pointer speed [50][52].
59. All following with `dt`-dependent `MathUtils.damp`/`maath` (λ 6–12 pointer, 2–4 camera); fixed per-frame lerp prohibited [53].
60. Camera tilt ±2–4° with the pointer; on touch, a tap ripple (600–900 ms) instead of hover; no gyroscope.
61. A single particle system that morphs hero → star background (`aPositionA/B` + `uMix` by scroll, 0.5–1 s smoothing) [48][49].
62. Orbits with periods ∝ `a^1.5`, the fastest planet ≥ 20 s per revolution; visual activity at the edges, not behind the text [54].
63. Sprites with a `smoothstep` edge, `antialias: false`, per-particle twinkle, Fibonacci/sunflower distribution [52][55].
64. Automatic tiers: < 55.5 fps sustained over 50 frames → DPR 2→1.5, −30–50% particles, less raycasting [52]; background GPU ≤ 4 ms/frame.
65. SVG/AVIF poster per theme and a WAAPI crossfade when the first frame is ready [52].
66. Full pause when the scene adds nothing (past the hero/footer, hidden tab, lightbox) and less work during fast scrolling [55].

### Impactful light mode

67. A "daytime space" concept of its own (celestial atlas in ink, daytime sky or blueprint), not an inversion of dark.
68. In light: `NormalBlending` + particles darker than the background (or `MultiplyBlending` for ink), never `AdditiveBlending`; `depthWrite: false` [60].
69. Bloom only in dark; in light a tinted/dark halo or high-chroma color.
70. Canvas `alpha: true` with a transparent clear so the CSS background and the 3D match; `NeutralToneMapping` if tone mapping is used [61].
71. Light background oklch L 0.97–0.99, C 0.005–0.015 (never pure `#fff` in the scene); text L 0.18–0.25 with the brand hue.
72. Light elevation with layered tinted shadows (not semi-transparent black) [63]; accents with L 0.45–0.6 and more chroma than in dark.
73. Dots/lines ~10–25% thicker or more opaque in light to compensate for polarity; validate with WCAG and APCA (Lc ≥ 75 body) [62].
74. Scrim behind the hero text (light 85–92%, dark 70–85%) + a density mask in the text bbox; contrast measured on the worst frame [54][65].
75. Theme change as a brand moment: circular-reveal VT 400–600 ms + animated uniforms; reduced-motion → 150 ms crossfade [22].

---

## Sources

1. Awwwards — Evaluation system: https://www.awwwards.com/about-evaluation/
2. Emil Kowalski — Great animations: https://emilkowal.ski/ui/great-animations
3. Vercel — Web Interface Guidelines (command.md): https://github.com/vercel-labs/web-interface-guidelines
4. Emil Kowalski — 7 practical animation tips: https://emilkowal.ski/ui/7-practical-animation-tips
5. web.dev — prefers-reduced-motion: https://web.dev/articles/prefers-reduced-motion
6. Utsubo — 100 Three.js tips that actually improve performance (2026): https://www.utsubo.com/blog/threejs-best-practices-100-tips
7. React Three Fiber — Scaling performance: https://r3f.docs.pmnd.rs/advanced/scaling-performance
8. Codrops — Building efficient Three.js scenes: https://tympanus.net/codrops/?p=86572 · Three.js Journey — Performance tips: https://www.threejs-journey.com/lessons/performance-tips
9. web.dev — Web Vitals: https://web.dev/articles/vitals
10. W3C WAI — What's new in WCAG 2.2: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ · Deque — WCAG 2.2 updates: https://dequeuniversity.com/resources/wcag-2.2
11. W3C — Understanding 2.4.13 Focus Appearance: https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
12. NN/g — 5 Steps to Creating a UX-Design Portfolio: https://www.nngroup.com/articles/ux-design-portfolios/
13. NN/g — Portfolios for UX Researchers: https://www.nngroup.com/articles/ux-researcher-portfolio/
14. Halian — What makes a great UX portfolio: https://www.halian.com/article/what-makes-a-great-ux-portfolio · UX Collective — Only 30 seconds to reject your portfolio: https://uxdesign.cc/only-30-seconds-to-reject-your-portfolio-8cb14ac70674 · Noble Desktop: https://blog.nobledesktop.com/creating-eye-catching-case-studies (secondary)
15. Utopia — clamp / utopia-core: https://utopia.fyi/blog/clamp/ · https://npmjs.com/utopia-core
16. Smashing Magazine — Addressing accessibility concerns with fluid type (2023): https://smashingmagazine.com/2023/11/addressing-accessibility-concerns-fluid-type
17. LogRocket — Fluid vs responsive typography with clamp: https://blog.logrocket.com/fluid-vs-responsive-typography-css-clamp
18. Baymard — Line length readability: https://baymard.com/blog/line-length-readability
19. Atmos — Dark mode UI best practices: https://atmos.style/blog/dark-mode-ui-best-practices · Uxcel — 12 principles of dark mode: https://uxcel.com/blog/12-principles-of-dark-mode-design-627 (secondary)
20. Rauno Freiberg — Invisible details of interaction design: https://rauno.me/craft/interaction-design · Devouring Details: https://devouringdetails.com
21. Josh W. Comeau — Accessible animations in React (prefers-reduced-motion): https://www.joshwcomeau.com/react/prefers-reduced-motion/
22. Next.js — Designing view transitions (updated Oct 15, 2026): https://nextjs.org/docs/app/guides/view-transitions
23. GSAP — ScrollTrigger common mistakes: https://gsap.com/resources/st-mistakes/
24. W3C — Understanding 2.3.3 Animation from Interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
25. rauno.me (homepage): https://rauno.me
26. web.dev — Most effective ways to improve CWV (long tasks, scheduler.yield): https://web.dev/articles/top-cwv
27. MDN browser-compat-data 8.1.7 (Oct 22, 2026), direct query: https://github.com/mdn/browser-compat-data
28. caniuse — View Transitions: https://caniuse.com/view-transitions
29. MDN — animation-timeline: https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline
30. Utsubo — What's new in Three.js (2026): https://www.utsubo.com/blog/threejs-2026-what-changed
31. Awwwards — Bruno Simon portfolio case study: https://www.awwwards.com/brunos-portfolio-case-study.html
32. Codrops — Sketching the impossible: a 3D portfolio without a single 3D model (Jun 2026): https://tympanus.net/codrops/2026/06/11/sketching-the-impossible-a-3d-portfolio-built-without-a-single-3d-model/
33. Next.js — Image component API reference (updated Sep 28, 2026): https://nextjs.org/docs/app/api-reference/components/image
34. Chrome for Developers — Framework tools for font fallbacks: https://developer.chrome.com/blog/framework-tools-font-fallback
35. Vercel Academy — Fonts with next/font: https://vercel.com/academy/nextjs-foundations/fonts-with-next-font
36. Brittany Chiang — brittanychiang.com: https://brittanychiang.com
37. W3C WAI-ARIA APG — Carousel pattern: https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
38. Playwright — Accessibility testing: https://playwright.dev/docs/accessibility-testing
39. axe-core — API (tags wcag22aa): https://github.com/dequelabs/axe-core/blob/develop/doc/API.md
40. Recrew — Portfolio in tech hiring: https://www.recrew.ai/glossary/portfolio-tech-hiring (secondary)
41. Emil Kowalski — Building an animation course: https://emilkowal.ski/ui/building-an-animation-course
42. Josh W. Comeau — Whimsical animations: https://www.joshwcomeau.com/blog/whimsical-animations
43. Lee Robinson — leerob.com: https://leerob.com
44. Awwwards — Portfolio nominees / Sites of the Day: https://www.awwwards.com/inspiration_search/portfolio/ · https://www.awwwards.com/websites/sites_of_the_day/
45. Linear — Why is quality so rare: https://linear.app/now/why-is-quality-so-rare
46. Matt Strom — The paradox of polish: https://buttondown.com/mattstrom/archive/the-paradox-of-polish
47. Codrops — From shader uniforms to clip-path wipes: how GSAP drives my portfolio (May 2026): https://tympanus.net/codrops/2026/05/06/from-shader-uniforms-to-clip-path-wipes-how-gsap-drives-my-portfolio/
48. three.js forum — ValiCred: kinetic 3D particle morphing & WebGL lore scroller: https://discourse.threejs.org/t/valicred-kinetic-3d-particle-morphing-webgl-lore-scroller/93787 · Particles transition + bloom (GPGPU, curl noise, Jan 2026): https://discourse.threejs.org/t/particles-transition-bloom/89382
49. Codrops — How to build cinematic 3D scroll experiences with GSAP (Nov 2025): https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/
50. Codrops — Crafting a dreamy particle effect with Three.js and GPGPU (Dec 2024): https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/
51. Codrops — Interactive particles with Three.js (2019): https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/
52. GitHub Engineering — How we built the GitHub globe: https://github.blog/engineering/how-we-built-the-github-globe
53. three.js forum — smoothDamp / maath damp: https://discourse.threejs.org/t/unity-smoothdamp-for-three-vector2d-3d-4d-euler-matrix4-quaternion-color/42865 · Game Developer — Improved lerp smoothing: https://www.gamedeveloper.com/programming/improved-lerp-smoothing-
54. 21st.dev — React shader background components (scrims, worst frame, movement at the edges): https://21st.dev/blog/react-shader-background-components
55. Stripe — To design and develop an interactive globe: https://stripe.com/blog/globe
56. Awwwards — WebGL animations collection (Lusion v3 SOTY 2023, Igloo Inc SOTY 2024): https://www.awwwards.com/du-haihang/collections/webgl-animations/ · Lusion v3 home: https://www.awwwards.com/inspiration/home-page-lusion-v3
57. Awwwards — Igloo Inc case study: https://awwwards.com/igloo-inc-case-study.html
58. Awwwards — Messenger (Abeto), SOTD: https://www.awwwards.com/sites/messenger · 80.lv: https://80.lv/articles/deliver-mail-on-tiny-colorful-planet-in-this-relaxing-web-game
59. Awwwards Inspiration — evensix WebGL 3D: https://www.awwwards.com/inspiration/webgl-3d-evensix · 3D Web Lab 2.0: https://www.awwwards.com/inspiration/3d-effects-3d-web-lab-2-0 · Transition to night mode: https://www.awwwards.com/inspiration/transition-to-night-mode-festive-fiends-1
60. three.js forum — Particles hidden on white background (additive blending): https://discourse.threejs.org/t/why-the-particle-in-gallaxy-hide-when-i-use-white-background/39180 · Babylon.js forum — particle blend modes on white: https://forum.babylonjs.com/t/particle-system-effect-in-the-white-background-environment/3809
61. three.js forum — Is AgX tonemapping implemented correctly?: https://discourse.threejs.org/t/is-agx-tonemapping-implemented-correctly/60609
62. APCA introduction (Myndex): https://github.com/Myndex/apca-introduction
63. Josh W. Comeau — Designing beautiful shadows in CSS: https://www.joshwcomeau.com/css/designing-shadows
64. Amazon Alexa APL — Background (overlays/blur for legibility): https://developer.amazon.com/en-US/alexa/alexa-haus/visual-design/apl-components/apl-background
65. W3C — Technique F83 (text contrast over a background image): https://www.w3.org/WAI/GL/2016/WD-WCAG20-TECHS-20160719/F83.html
