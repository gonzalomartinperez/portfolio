# UX audit baseline (October 2026)

> Status: measured baseline for planning; no fixes applied. Translated from the owner's Spanish working file `reports/portfolio-ux/audit-baseline.md`. The 134 screenshots it cites live in `reports/portfolio-ux/shots/` outside this repository and are intentionally not committed (about 67 MB). Scored with the [designer rubric](../rubrics/designer.md). Part of the [master plan](../README.md).

- Date: 2026-10-24 · Live site (EN `/` and ES `/es`) · Reference code: `portfolio` `origin/main` @ `b5b3c57` (read-only).
- Rubric: `reports/portfolio-ux/RUBRIC.md`. Visual evidence in `reports/portfolio-ux/shots/`.
- Tools: Lighthouse 12 (Chromium 1248 Linux, headless), axe-core 4.11 via `@axe-core/playwright` 4.14, Playwright 1.64 (screenshots, keyboard, interaction), rAF sampling in Chromium **with a real GPU** (ANGLE → D3D12, NVIDIA GTX 1050, via WSLg) to measure the 3D scenes.
- Important limitation: there is no field data (CrUX/PSI without quota and probably without enough traffic). All performance numbers are **lab**. Headless Lighthouse renders WebGL through **SwiftShader (CPU)**, so it was run twice: as is (software WebGL, the real worst case for a user without acceleration) and with `--disable-3d-apis` (isolates the non-3D cost).

## Total score: **70 / 100**

| # | Dimension | Score | Max |
|---|---|---|---|
| 1 | Visual design | **15** | 20 |
| 2 | Interaction & motion | **14** | 20 |
| 3 | Performance | **7** | 15 |
| 4 | Accessibility | **12** | 15 |
| 5 | Responsive quality | **7** | 10 |
| 6 | Navigation & information scent | **7** | 10 |
| 7 | Uniqueness & delight | **8** | 10 |

Quick read: the identity (particle sphere + solar system + avatar) is original and well executed in dark mode, and the accessibility foundation is good (visible focus, skip link, dialogs that trap and restore focus, reduced motion without canvas). The score drops because of **mobile performance** (lab LCP of 4.4–6.1 s, ~400–465 KB of JS, 1.3–2.2 MB of planet textures on **every** route), the **hero journey on mobile** (9,628 px, ~11 screens with the full catalogue before the first project), and because **light mode lagged behind** on the identity pieces.

---

## 1. Performance

### 1.1 Lighthouse (lab) — as is (WebGL via SwiftShader)

| Route | Preset | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI | Total transfer | JS | Img | Other (textures) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | mobile | 39 | 100 | 100 | 100 | 2.14 s | **5.86 s** | 138 s* | 0.004 | 8.0 s | 2,416 KB | 451 KB | 408 KB | 1,347 KB |
| `/` | desktop | 54 | 100 | 100 | 100 | 0.77 s | 1.90 s | 25 s* | 0 | 2.9 s | 3,322 KB | 451 KB | 481 KB | 2,180 KB |
| `/es` | mobile | 36 | 100 | 100 | 92 | 2.29 s | **6.10 s** | 149 s* | 0.004 | 10.2 s | 2,418 KB | 451 KB | 408 KB | — |
| `/es` | desktop | 57 | 100 | 100 | 92 | 0.73 s | 1.58 s | 24 s* | 0 | 2.9 s | 3,324 KB | 451 KB | 481 KB | — |
| `/work` | mobile | 41 | 100 | 100 | 100 | 2.04 s | **5.99 s** | 71 s* | 0 | 6.2 s | 2,279 KB | 457 KB | 307 KB | — |
| `/work` | desktop | 60 | 100 | 100 | 100 | 0.69 s | 1.55 s | 3.4 s* | 0 | 2.1 s | 3,111 KB | 457 KB | 307 KB | — |
| `/work/filomena` | mobile | 45 | 98 | 100 | 100 | 2.04 s | **5.37 s** | 12 s* | 0 | 4.9 s | 2,286 KB | 465 KB | 304 KB | 1,336 KB |
| `/work/filomena` | desktop | 61 | 98 | 100 | 100 | 0.67 s | 1.43 s | 5.1 s* | 0 | 2.2 s | 3,174 KB | 465 KB | 360 KB | — |
| `/work/pequeverso` | mobile | 44 | 100 | 100 | 100 | 2.15 s | **5.38 s** | 17 s* | 0 | 5.1 s | 2,211 KB | 399 KB | 304 KB | — |
| `/work/pequeverso` | desktop | 61 | 100 | 100 | 100 | 0.57 s | 1.36 s | 21 s* | 0 | 2.4 s | 3,350 KB | 399 KB | 610 KB | — |
| `/about` | mobile | 48 | 100 | 100 | 100 | 2.02 s | **4.48 s** | 139 s* | 0 | 5.8 s | 2,258 KB | 395 KB | 362 KB | — |
| `/about` | desktop | 57 | 100 | 100 | 100 | 0.66 s | 1.44 s | 27 s* | 0 | 3.2 s | 3,096 KB | 395 KB | 368 KB | — |

\* TBT inflated by WebGL on CPU: the long tasks are attributed to the 3D chunk (`3018.*.js`, `9802.*.js`). It does not represent a user with a GPU, but it **does** represent one with a blocklisted GPU or no acceleration. The solar engine detects software rendering and lowers resolution, but it still animates continuously.

`/es` SEO 92: fails `hreflang`/`lang` (the document is served as `lang="en"` and corrected on the client).

### 1.2 Lighthouse — without WebGL (`--disable-3d-apis`): base cost of the app

| Route | Preset | Perf | FCP | LCP | TBT | CLS | SI | Transfer |
|---|---|---|---|---|---|---|---|---|
| `/` | mobile | 60 | 2.31 s | **4.39 s** | 991 ms | 0 | 2.3 s | 1,201 KB |
| `/` | desktop | 89 | 0.77 s | 1.72 s | 141 ms | 0 | 1.3 s | 1,297 KB |
| `/work/filomena` | mobile | 52 | 2.20 s | **5.88 s** | 1,174 ms | 0 | 2.8 s | 1,092 KB |
| `/work/filomena` | desktop | 95 | 0.60 s | 1.38 s | 88 ms | 0 | 0.9 s | 1,149 KB |
| `/about` | mobile | 65 | 1.98 s | **5.94 s** | 493 ms | 0 | 2.0 s | 1,065 KB |
| `/about` | desktop | 95 | 0.62 s | 1.48 s | 57 ms | 0 | 0.7 s | 1,070 KB |

Conclusions:
- **Desktop passes lab CWV** (LCP 1.4–1.9 s, CLS 0) apart from the 3D cost.
- **Mobile fails LCP even without 3D** (4.4–5.9 s). The LCP breakdown is **90–92% render delay** (TTFB ~0.45 s, no resource load): the LCP element is SSR text (`h1`/`p`), but it is not painted until the main thread is freed. Bootup: `3794-*.js` 0.8–1.5 s and `4bd1b696-*.js` 0.55 s of scripting at 4× CPU. Total JS (395–465 KB **compressed** per route; `unused-javascript` estimates 83–100 KB) is too much for a mostly static portfolio.
- **CLS 0 on every route**: excellent (declared image dimensions and fonts with `display: swap` + `next/font`).
- **Fonts**: 3 families (Inter, Inter Tight, JetBrains Mono), 133 KB, preloaded on every route. `font-display` OK.
- **Images**: all are `unoptimized` → 1,600 px webp files are served for 16 rem previews (home showcase) and for the gallery grid; Lighthouse estimates 34–50 KB of savings on home alone, and the Filomena gallery has 43 screenshots.
- **Solar system textures**: downloaded on **every** route (because the solar system is the ambient background of the layout): mobile ~1.3 MB (`earth-clouds-1024` 345 KB, `moon-1024` 192 KB, `mercury-1024` 164 KB, `sun-1024` 145 KB…); desktop ~2.2 MB (adds `sun-2048` 416 KB, `jupiter-2048` 254 KB, `earth-2048` 236 KB). `High` priority, competing with the LCP. `uses-long-cache-ttl` flags 59–100 resources.
- DOM: home has 3,060 nodes (the full catalogue lives inside the hero).

### 1.3 3D scenes — rAF sampling with a real GPU (GTX 1050, D3D12)

Windows of 3–4 s; "scroll" = programmatic scroll of 4,000 px over 3 s.

| Config | Route | Idle at top (fps / p95 / p99) | During scroll (fps / p95 / p99 / frames > 33 ms) | Idle at bottom |
|---|---|---|---|---|
| Desktop 1280, DPR 1 | `/` | 60 / 16.8 / 16.8 ms | **18 fps / 184 ms / 1,067 ms / 9** | 59 / 16.8 / 33 ms |
| Desktop 1280 | `/about` | 60 / 16.8 / 16.8 | 60 / 16.8 / 16.8 / 0 | 60 |
| Desktop 1280 | `/work/filomena` | 60 | 50 fps / 33 / 100 ms / 7 | 60 |
| Mobile 390, DPR 3 | `/` | 60 | 52 fps / 33 / 67 ms / 6 | 61 |
| Mobile 390, DPR 3 | `/about` | 60 | 60 / 0 slow frames | 60 |
| Mobile 390, DPR 3, **CPU 4×** | `/` | 59 | **43 fps / 50 / 67 ms / 14** | 61 |
| Mobile 390, DPR 3, CPU 4× | `/about`, `/work/filomena` | 60 | 60 | 60 |

Effective canvas resolution (backing store / CSS px):

| Config | Hero sphere | Solar background |
|---|---|---|
| Desktop 1280, DPR 1 | 1265×800 (1.0×) | **784×496 (0.62×)**, rises to 0.74× at the bottom |
| Mobile DPR 3 | 670×1451 (1.72×) | 682×1477 (1.75×) on home; 483×1046 (1.24×) on other routes |
| Mobile DPR 3, CPU 4× | 780×1688 (2.0×) | 1.75× |

Behavior (verified in code and at runtime):
- **Home has two full-screen WebGL contexts at the same time** (sphere + solar system), and a JS heap of 11–14 MB.
- Hero (`scene-runtime.ts`): rAF only runs if `!paused && onScreen && !document.hidden`; it adapts quality (DPR 1.75/1.4/1); with `prefers-reduced-motion` or a viewport shorter than 650 px it does not mount the canvas. Correct.
- Solar background (`solar-system.tsx`/`solar-system-engine.ts`): mounted in `requestIdleCallback` (2 s timeout), paused on `visibilitychange`, respects reduced motion. **There is no pause on inactivity or render on demand**: since it is `position: fixed` it is always "on screen" and animates continuously at 60 fps on every page (battery on mobile). On desktop at DPR 1 it renders at 62% and is scaled up → visibly soft planets.
- **Hitch on the first hero scroll on desktop (p99 1,067 ms)**: a ~1 s frame when the sphere opens into the logo cloud (mounting/decoding of the brands and the catalogue, or program compilation). On mobile with 4× CPU the journey drops to 43 fps. That is the "wow" moment and it is where it stutters.
- Reduced motion (emulated): 0 canvases, `data-renderer="static"`, 60 fps with no work; the static SSR scene looks complete (`reports/portfolio-ux/shots/reduced-motion_home-1280.png`, `reports/portfolio-ux/shots/reduced-motion_about-1280.png`).
- There is no UI control to pause motion: `setPageMotionPaused()` exists in `shared/motion/motion-state.ts` but **no component uses it** (only the assistant uses `holdPageMotion`).

---

## 2. Accessibility

### 2.1 axe-core (wcag2a/aa, 21a/aa, 22aa, best-practice)

70 runs: 10 EN routes × {dark, light} × {1280, 390} + 10 ES routes × {1280 dark, 1280 light, 390 light}.

| Rule | Impact | WCAG | Nodes (total) | Routes | Where |
|---|---|---|---|---|---|
| `label-content-name-mismatch` | serious | 2.5.3 (A) | 383 | 49/70 | React Flow diagram nodes (`aria-label="View details: Web frontend"` vs visible text "Web frontend + technology"), header brand link (aria-label adds the role), contact cards (`Email: …`). ~41 nodes per `/work` load. Real impact is low (the main visible text is included), but it is the only systematic violation. |
| `heading-order` | moderate | best practice | 7 | 7 | `/work/filomena`: `<h4>Exam platform architecture</h4>` inside the diagram figure, with no preceding `h3`. |
| `color-contrast` | serious | 1.4.3 | 1 | 1 | `/` light 1280: primary button measured at 3.62:1 (#dfeaf0 on #2980a7). It is a **transient** state (opacity of the `PageMotion` entrance animation/hover); at rest the tokens give ~5.6:1. Not reproducible in the other 69 runs. |

Incomplete (manual review): `color-contrast` 2,338 nodes (text over gradient/canvas backgrounds: axe cannot compute it), `aria-prohibited-attr` 28, `duplicate-id-aria` 7.

Lighthouse a11y: 100 on all routes except `/work/filomena` (98, due to `heading-order`).

### 2.2 Keyboard walkthrough (Playwright, sequential Tab)

| Finding | Status |
|---|---|
| Skip link | First Tab; visible (`reports/portfolio-ux/shots/kbd_home-1280-tab1.png`); once activated, the next Tab lands inside `main`. OK |
| Visible focus | 100% of focus targets have `outline: 2px solid var(--accent)` + offset; in light it uses `#0a6e9b`. OK (`reports/portfolio-ux/shots/state-button-focus.png`, `reports/portfolio-ux/shots/state-focus-nav-1280.png`) |
| Header order | brand → 6 links → EN/ES → theme. Logical. EN/ES measure **38×34 px** on desktop (passes 2.5.8 but is below the 44 px of the rest) |
| **Home: catalogue in the hero** | After the CTAs and the avatar come **100+ tab stops** of catalogue chips (Agent evaluation, Agent harness…) before reaching the featured project. There is no "skip catalogue". **P0** for keyboard users |
| `/work` | Each React Flow diagram adds **~20 node buttons + 3 controls + the "React Flow attribution" link (50×12 px)**; with 3 diagrams that is ~70 tab stops |
| `/work/filomena` | diagram (6 nodes + controls) → filters (5, 44 px, `aria-pressed`) → 43 "Enlarge: …" links → "What changed" section with scroll and focus (correct for a scrollable region) |
| Lightbox | Enter opens; initial focus on "Previous screen"; Tab cycles Prev/Next/Close (trap OK); Esc returns focus to the thumbnail (OK). **Bug: with an active filter (8/43) the arrows go through all 43 screenshots** (jumps to "Screen 11 of 43", outside the filter) |
| Solar explorer (dialog) | Trigger in the footer; initial focus on "Previous body"; toolbar `role="toolbar"` with 44×44 controls; trap OK; Esc returns focus to the trigger and restores scroll |
| Theme toggle | Enter switches the theme; the `aria-label` updates ("Switch to dark theme"); focus is kept |
| Language switch | Client-side navigation, keeps scroll (`scroll={false}`), `<html lang>` changes to `es`, focus stays on "ES" |
| Hero avatar | `button` "Interact with Gonzalo's avatar" (82×82) triggers the pulse with the keyboard. OK |
| Stack | input and select with label, 48 px tall; "Clear filters" 44 px. Live region: **"1 technologies and concepts"** (broken pluralization) |

### 2.3 Target size, motion, semantics

- Target size (2.5.8, 24×24): almost everything is ≥ 44 px. Out of spec: the footer "CV" link (**21×28 px**, except for the spacing exception) and the React Flow attribution (**50×12 px**). Inline links in the CV (20–22 px tall) are exempt because they are inside text.
- Motion: reduced motion is respected on every layer (global CSS, `PageMotion`, hero, solar, GSAP carousel with a pause button). **A pause control is missing for the continuous ambient animation** (2.2.2 Pause, Stop, Hide: the solar background animates indefinitely behind the content on every page).
- Semantics: `nav` with `aria-label` for the main, language and footer navigation; `aria-current="page"`; gallery with `fieldset` + `aria-pressed` + `aria-live` for the counter; diagrams with `figure` + `figcaption` and a complete text summary (good fallback for screen readers); `details`/`summary` for the contributions and the curriculum.
- The document is served with `lang="en"` and corrected on the client; each ES page marks its content with `lang="es"`. The **404 under `/es/...` shows the content in English** (`not-found.tsx` uses `defaultLocale`) with a secondary line in Spanish.
- Body text passes over moving planets (fixed background): contrast varies over time. In dark the veil handles it well; in light, Saturn or Jupiter "stain" paragraphs (`reports/portfolio-ux/shots/journey/about-390-light-y700.jpg`).

---

## 3. Visual, interaction and responsive

### 3.1 Screenshot matrix

`reports/portfolio-ux/shots/{en|es}_{route}-{390|768|1280|1920}-{dark|light}.jpg` (full page, 103 screenshots; plus 320 px for `/`, `/work/filomena` and `/stack`). Side-by-side dark|light comparisons: `reports/portfolio-ux/shots/compare/*-1280-top.jpg` and `*-390-top.jpg`. Real hero journey with GPU: `reports/portfolio-ux/shots/journey/grid-home-1280.jpg`, `reports/portfolio-ux/shots/journey/grid-home-390.jpg` (8 positions × 2 themes).

Note: in the full-page home screenshots an empty block shows below the hero because the hero journey is triggered by scroll; the real journey is in `reports/portfolio-ux/shots/journey/`.

Document height (px):

| Route | 390 | 1280 |
|---|---|---|
| `/` | 17,929 (of which the hero takes **9,628**) | 10,354 (hero 5,336) |
| `/work` | 19,652 | 12,663 |
| `/work/filomena` | 20,566 | 14,188 |
| `/work/pequeverso` | 9,800 | 6,345 |
| `/stack` | **29,411** | 9,125 |
| `/about` | 7,084 | 4,035 |
| `/education` | 8,084 | 5,809 |
| `/cv` | 8,314 | 4,845 |
| `/contact` | 2,848 | 1,753 |

- There is no horizontal page overflow between 320 and 1920 px (although `body { overflow-x: hidden }` would mask it). The elements that overflow are decorative (stars and crown of the background, masked carousel rail, React Flow viewport) or the Filomena "What changed" table at 320/390 px, which has its own scroll and focus.
- Reading measure: `.prose` 44 rem (~70–75 characters) and an 80 rem frame; correct at 1920 px.

### 3.2 States and motion (code + screenshots)

- Buttons (`shared/ui/button.tsx` + `globals.css`): hover with a 3D "lift" (`perspective translate3d(0,-2px) rotateX(3deg)` + shadow), active with a "press" (scale 0.985), focus with a 2 px outline and a 4 px offset. Consistent across the site (`reports/portfolio-ux/shots/states-buttons.jpg`). The transition covers only `transform` and `box-shadow`, so **the hover background/color change is instantaneous** (`hover:bg-accent` and `brightness-110` without a transition).
- Nav links: hover with a `surface-raised` background and 140 ms `ease-standard`; active in accent color (no underline or shape indicator; color only).
- Page transitions: `PageMotion`, opacity 0.94→1 over 180 ms (almost imperceptible). Scroll reveal: sections with `translateY(8px)` + opacity 0.85→1 over 240 ms ease-out, once only. Subtle and jank-free, but it does not read as a designed transition. View Transitions are not used.
- Motion tokens: `--ease-out cubic-bezier(.16,1,.3,1)`, `--ease-standard (.4,0,.2,1)`, 140/320 ms. Consistent.
- Tool carousel (GSAP): 30–42 px/s; pauses on hover, focus, touch, offscreen and hidden tab; has a Pause/Play button with `aria-pressed`; with reduced motion it becomes a grid. Very good.
- Typography: Inter Tight for display (−0.03 em), Inter 17 px for body, JetBrains Mono for eyebrows (12 px, uppercase, 0.08 em). Fluid scale with a consistent `clamp`. On mobile, the hero eyebrow takes 3 lines of uppercase mono (visual noise, `reports/portfolio-ux/shots/compare/home-390-top.jpg`). On `/cv` the body is dense (~13–14 px in long bullets).
- Rhythm: `section-head` with top border + eyebrow + h2 repeated on all pages; vertical padding with `clamp(3rem, 7vw, 6rem)`. Consistent. On `/about` there are large spacing jumps between blocks at 1280.

### 3.3 Light vs dark, screen by screen (focus requested by the owner)

The tokens are parallel and the structure is identical, but **light mode treats the identity as a "compatibility mode"**: dark relies on additive light (glow) and light has no equivalent language (shadow, ink, depth).

| Screen | Dark | Light: concrete gaps | Evidence |
|---|---|---|---|
| Home hero (sphere) | Particles with additive blending, the sun shines through the sphere, clear depth | `--field-additive: 0`: the sphere ends up as flat blue-gray noise with no luminous core; the sun inside the sphere is a peach disc with no halo; the avatar loses the "core" contrast | `reports/portfolio-ux/shots/journey/cmp-sphere-1280.jpg` |
| Planets (background on all pages) | Day/night with terminator, atmosphere, rings with shadow | In the shader, the night side gains **transparency** (`nightAlpha`) instead of getting darker → the planets look like milky or translucent gray blotches; Saturn is a "dirty gray ring"; Jupiter and Uranus look washed out. Behind paragraphs they look like dirt | `reports/portfolio-ux/shots/journey/about-1280-light-y700.jpg`, `contact-1280-light-y700.jpg`, `reports/portfolio-ux/shots/compare/cv-1280-top.jpg` |
| Logo/catalogue journey | Dark tiles with a faint border on black: they read as a "constellation" | White tiles on `#fafafb` with no shadow: reads as a template grid; the orbits are barely visible | `reports/portfolio-ux/shots/journey/grid-home-1280.jpg` (row 3–4) |
| Surfaces and cards | `#000` / `#0d0f14` / `#12151b` + border `#2a3542`: the cards float | `#fafafb` / `#f1f4f8` / `#ffffff`: ~2% luminance difference; the `--line-subtle #e6e9ee` border sits at ~1.2:1 against the background → "wireframe" cards, no elevation (there is no shadow token in light) | `reports/portfolio-ux/shots/compare/about-1280-top.jpg`, `stack-1280-top.jpg`, `work-1280-top.jpg` |
| Header | 78% black veil + blur: clear separation | 85% white veil over a nearly white background + `#e6e9ee` line: the header barely separates from the content | `reports/portfolio-ux/shots/compare/*-1280-top.jpg` |
| Portrait (`/about`, home) | Photo with a dark studio background, blends in | The photo's dark background forms a **dark rectangle** inside the light frame; the `portrait-frame` gradient does not compensate | `reports/portfolio-ux/shots/compare/about-1280-top.jpg` |
| Accent | Bright `#4cd6ff` + `accent-wash` on rings, badges, pulse | `#0a6e9b` is correct for contrast, but without a visible "wash": badges and rings almost disappear; the "live" dot loses its glow | `reports/portfolio-ux/shots/compare/work-1280-top.jpg` ("In production" badge) |
| Stars | Luminous points | Scattered dark points that read as dust or noise | `reports/portfolio-ux/shots/journey/home-1280-light-000.jpg` |
| React Flow diagrams | Dark nodes, visible cyan edges | Correct, but the dotted groups and the dot background are very faint | `reports/portfolio-ux/shots/work-diagram-390-light.png` |
| 404 / contact / CV / education | Equally solid | Correct; the only problem is the "washed out" solar background behind | `reports/portfolio-ux/shots/compare/contact-1280-top.jpg`, `education-1280-top.jpg` |

Also: the light body palette (text `#0f141b`, secondary `#48546a`, muted `#5c687b`) passes AA. The problem is one of **visual expression**, not contrast. The toggle has no transition (instant switch; acceptable with reduced motion, but it feels abrupt with two WebGL scenes changing mode).

---

## 4. Component inventory

| Component | Status | Issues |
|---|---|---|
| **Header / nav** (`shell/site-header`) | Sticky with blur; below 70 rem the nav moves to a full-width 2nd row with 44 px targets; `aria-current` | **Below 26 rem (416 px: most phones) it switches to `position: relative` → there is no persistent navigation** on pages of 10–29k px; EN/ES 38×34 on desktop; the active item is marked only with color |
| **Theme and language toggles** | Theme: button with dynamic label and pre-paint persistence; language: real links with `hreflang`, client-side, keep scroll | Dark is always the default (ignores `prefers-color-scheme`, a design decision); the theme swap is instantaneous |
| **Hero sphere** (`features/hero`) | Original; journey sphere → logo cloud → grid → catalogue; adaptive quality, pause offscreen and on hidden tab, static SVG fallback; interactive avatar | Long journey (5,336 px desktop / **9,628 px mobile**); ~1 s hitch on the logo transition (desktop); 43 fps with CPU 4×; the full catalogue (100+ chips) lives inside the hero → focus order and scroll; flat light mode |
| **Principles cards** (Evals first…) | 4 items with h2 + "See how I apply them" link; at the end of the journey | Uses `h2` for each principle (4 consecutive h2 with no parent section) and they arrive late on mobile |
| **Ambient solar system / explorer** (`features/solar-system`) | Fixed background on all routes; explorer in a dialog (accessible toolbar, body select, zoom/rotate/reset) | 1.3–2.2 MB of textures per route; second WebGL context on home; continuous rAF at 60 fps; 0.62× DPR on desktop (soft); explorer hidden in the footer colophon (very low discoverability); translucent night side in light |
| **Featured project card** (home) | Card with 3 screenshots, badge, stack chips, 2 CTAs and metrics | 1,600 px `unoptimized` images for 16 rem; only Filomena is featured (Pequeverso, the most recent product, does not appear on home) |
| **Tool carousel** (GSAP) | Two rows, edge mask, pause on hover/focus/offscreen, Pause button, grid with keyboard and with reduced motion | Good. With keyboard it switches to a grid and scrolls (correct) |
| **Experience list** (home and `/work`) | Ordered list with company logo, period, link to `/work#slug`; on `/work`, jump chips per company | `/work` is 12–20k px with no persistent index; the full-width "More contributions (13)" `details` are fine |
| **Architecture diagrams** (React Flow) | Fit view, no scroll pan/zoom (does not hijack scroll), nodes as buttons with `aria-expanded` + `role="status"` detail panel, complete text summary | ~20 tab stops per diagram; 50×12 attribution link; `label-content-name-mismatch`; out-of-order `h4`; at 390 px the nodes become small (`reports/portfolio-ux/shots/work-diagram-390-light.png`) |
| **Case-study pages** (Filomena, Pequeverso) | Header with metrics, sequence problem → contribution → architecture → gallery → "What changed" → sources | No TOC, progress or visible anchors on pages of 14–20k px; table with horizontal scroll on mobile |
| **Gallery + lightbox** | Filters by flow with `aria-pressed`, live counter, real links to the images (work without JS), dialog with skeleton, error, keyboard arrows and focus return | **Arrows ignore the active filter**; the grid images are 1,600 px originals; the mobile lightbox is fine (`reports/portfolio-ux/shots/pequeverso-lightbox-390-light.png`) |
| **Stack catalogue** | Search + category + clear; cards with brands and context links | **29,411 px at 390** (180 single-column cards); "1 technologies" in the live region; "Rampy ↗" links 24 px tall (tight) |
| **Education timeline** | Jump links, UNS card, metrics, `details` per year, rankings, certificates, documents | Solid. Consistent in both themes |
| **CV page** | Open/Download PDF CTA + "Let's talk", section index, full HTML content | Dense body; inline links 20–22 px tall; good for ATS/recruiters |
| **Contact cards** | 3 large cards (email/LinkedIn/GitHub) + CV in 3 formats + "Open to" | aria-labels that do not start with the visible text (2.5.3) |
| **Footer** | Identity, icons, site map with the two case studies, profiles, colophon with explorer, privacy in `details`, credits | "CV" link 21 px wide; the explorer is buried |
| **404** | Designed: "4 avatar 4", CTA, destination cards, line in ES | On `/es/*` the main content is in English and `lang="en"` |
| **Skip link / focus** | Correct across the site | — |

---

## 5. Score per dimension, with evidence

**1. Visual design — 15/20.** Solid and consistent token system (buttons, chips, cards and section-heads are the same on all pages and in both themes); typography with character (tight Inter Tight + mono for metadata); high-level dark mode. Deductions: light mode lacks depth and expression (§3.3); dense hierarchy on `/cv` and `/work`; 12 px mono eyebrows that add noise on mobile; the portrait blends poorly in light.

**2. Interaction & motion — 14/20.** A real signature moment (sphere → constellation → catalogue), the solar system explorer, a carousel with pause, button micro-interactions with lift and press, and impeccable reduced motion. Deductions: jank right at the signature moment (p99 1,067 ms desktop, 43 fps with CPU 4×), an excessive journey on mobile, almost nonexistent page transitions, color hover without a transition, the lightbox navigation bug, no global pause control.

**3. Performance — 7/15.** CLS 0 across the site and a desktop LCP of 1.4–1.9 s. Mobile: lab LCP of 4.4–6.1 s (90% render delay) even without WebGL, ~400–465 KB of JS per route, 1.3 MB of textures on mobile on every route, two WebGL contexts on home and continuous rAF in the background. No field data to compensate.

**4. Accessibility — 12/15.** 0 critical violations; 100% visible focus; skip link; dialogs with trap and focus return; 44 px targets; full reduced motion; text summaries for the diagrams. Deductions: 383 nodes for 2.5.3 (low real impact), 100+ tab stops before the main content on home, ~70 on `/work`, no pause for the continuous animation (2.2.2), ES 404 in English, text over a moving background.

**5. Responsive — 7/10.** No overflow from 320 to 1920, mobile nav with good targets, correct reading measure. Deductions: header not sticky below 416 px, a 9.6k px hero and a 29k px stack on mobile, hero eyebrow on 3 lines, small diagrams at 390.

**6. Navigation & information scent — 7/10.** Clear nav with CV and Contact one click away, hero CTAs to Work and Contact, footer with the two case studies, jump links in Work, Education and CV, and a 404 that reorients. Deductions: on mobile the first project appears after ~11 screens; long case studies without a TOC or progress; no "back to top"; Pequeverso does not appear on home; the explorer cannot be discovered.

**7. Uniqueness & delight — 8/10.** A distinct, coherent identity (avatar, particle sphere, solar system with real textures, themed 404). Deductions: in light it loses the magic; the catalogue chip grid and the stack cards look "template".

---

## 6. Prioritized issues

Effort: **S** ≤ ½ day · **M** 1–3 days · **L** > 3 days.

### P0

| # | Issue | Evidence | Suggested fix | Effort |
|---|---|---|---|---|
| 1 | **Mobile LCP 4.4–6.1 s (lab), 90% render delay; 395–465 KB of JS per route** | §1.1–1.2; bootup of `3794-*.js` and `4bd1b696-*.js` | Audit the layout's client components (header, footer and PageMotion are `"use client"` and the footer imports SolarExplorer); move the explorer, the assistant and analytics to `dynamic()` after the LCP; split the catalogue; review `unused-javascript` | L |
| 2 | **The solar background downloads 1.3 MB (mobile) / 2.2 MB (desktop) of textures on every route and animates continuously at 60 fps** (two WebGL contexts on home; with software GPU the page becomes unusable) | §1.1 (textures), §1.3 | Mount the background only after the first interaction or idle *and* once the LCP is done; 512 px textures on mobile, KTX2/Basis or AVIF; `fetchpriority=low`; render on demand or 30 fps when there is no input; do not mount it with `Save-Data`, `deviceMemory ≤ 4` or a software renderer; share a single context on home | M |
| 3 | **Mobile hero journey of 9,628 px with the full catalogue (100+ chips) before the first project**; 100+ tab stops | `reports/portfolio-ux/shots/journey/grid-home-390.jpg`, §2.2 | On mobile, reduce the hero catalogue to 12–16 curated brands + a CTA to `/stack`; shorten the journey to ≤ 2.5 viewports; add a "Skip to work" link after the CTAs and make the hero catalogue `inert` for focus (the full version already exists in `/stack`) | M |

### P1

| # | Issue | Evidence | Suggested fix | Effort |
|---|---|---|---|---|
| 4 | **Jank at the signature moment**: ~1 s hitch (p99 1,067 ms) when the sphere opens into the logos on desktop; 43 fps with CPU 4× on mobile | §1.3 | Pre-warm during idle (decode brands with `img.decode()`, `renderer.compile`), avoid per-frame layout reads, and measure with a Performance trace on that transition | M |
| 5 | **Light mode without identity parity** (translucent planets, flat sphere, cards without elevation, dark portrait, header without separation) | §3.3 | Light shader: darken the night side (multiply/ink) instead of lowering alpha; sphere with ink particles + core with a color halo; shadow tokens and `surface` with more contrast in light; card border `#d5dae2`; a portrait version with a light or cut-out background; header with a subtle shadow | L |
| 6 | **The lightbox ignores the active filter** (8/43 → "Screen 11 of 43") | §2.2; `gallery-carousel.tsx` `navigate()` uses `slides` instead of `visibleSlides` | Navigate and label over `visibleSlides` | S |
| 7 | **Header not sticky below 416 px** and no "back to top" on pages of 10–29k px | `site-header.module.css` `@media (width < 26rem) { .header { position: relative } }` | Compact sticky header (brand + menu only) that hides when scrolling down and shows when scrolling up, or a "back to top" button | S |
| 8 | **No pause control for ambient motion** (WCAG 2.2.2) | `setPageMotionPaused` exists but no component uses it | "Pause animation" toggle in the header or footer, persisted, reusing the existing store | S |
| 9 | **Long case studies without wayfinding** (Filomena 14–20k px, `/work` 12–20k px) | §3.1 | Sticky TOC on desktop and a "current section" chip on mobile, with `scroll-margin` (already exists) | M |
| 10 | **`unoptimized` images**: 1,600 px webp for 16 rem previews and for 43 thumbnails | Lighthouse `uses-responsive-images` 34–50 KB on home alone | Generate 480/960 px variants at build time (or remove `unoptimized`) and use real `sizes` | S–M |
| 11 | **404 on `/es/*` in English with `lang="en"`** | `reports/portfolio-ux/shots/es_404-1280-dark.png`; `not-found.tsx` | Detect the locale from the pathname (or a `not-found` in `app/es`) | S |
| 12 | **Solar background at 62% DPR on desktop** → soft planets behind the content | §1.3 | Raise the pixel-budget floor at DPR 1 or lower the frame rate instead of the resolution | S |

### P2

| # | Issue | Fix | Effort |
|---|---|---|---|
| 13 | `label-content-name-mismatch` (383 nodes): diagram nodes, header brand, contact cards | Make the aria-label start with the visible text ("Web frontend, view details") or use `aria-describedby` | S |
| 14 | `heading-order` in the Filomena diagram figure (`h4` without `h3`) | Use `h3` or a styled `p` | S |
| 15 | ~20 tab stops per diagram + 50×12 px React Flow attribution | Roving tabindex (arrows inside the diagram, a single tab stop) and hide or enlarge the attribution | M |
| 16 | Live region "1 technologies and concepts" | `Intl.PluralRules` | S |
| 17 | Button background and color hover without a transition | Add `background-color, color, filter` to `transition-[…]` | S |
| 18 | Almost imperceptible page transition (0.94→1) | View Transitions API (cross-fade + shared element for the avatar), with reduced motion | M |
| 19 | Pequeverso does not appear on home; the explorer is only found in the colophon | Second featured project or a carousel of 2; an entry to the explorer from the hero or "Explore the system" at the start of the journey | M |
| 20 | Hero eyebrow on 3 mono lines on mobile; 21 px footer "CV" link; 38×34 EN/ES on desktop | Short eyebrow on mobile; `min-inline-size: 44px` on the footer links and the switcher | S |

### Top 15 (in order of impact)

1. Mobile LCP 4.4–6.1 s + 400–465 KB of JS (P0, L)
2. Solar background textures (1.3–2.2 MB) on every route + continuous rAF + double WebGL (P0, M)
3. 9.6k px mobile hero journey with the full catalogue and 100+ tab stops (P0, M)
4. ~1 s hitch / 43 fps on the sphere → logos transition (P1, M)
5. Light mode parity: planet shader, sphere, elevation, portrait, header (P1, L)
6. Header not sticky below 416 px and no back-to-top (P1, S)
7. No animation pause control (2.2.2) (P1, S)
8. Lightbox that ignores the filter (P1, S)
9. Long case studies without TOC or progress (P1, M)
10. `unoptimized` 1,600 px images (P1, S–M)
11. ES 404 in English (P1, S)
12. Solar background at 0.62× on desktop (P1, S)
13. `label-content-name-mismatch` + `heading-order` (P2, S)
14. Diagram tab stops and the React Flow attribution target (P2, M)
15. Page transitions and color hover without a transition (P2, S–M)

---

## Appendix: how to reproduce

Scripts used (session scratchpad, outside the repos): Lighthouse via Linux Chromium launched by hand with `--remote-debugging-port` (chrome-launcher in WSL opens the Windows Chrome), `--disable-3d-apis` for the run without WebGL; axe via `@axe-core/playwright` with the theme forced through `localStorage.theme`; frame time via `requestAnimationFrame` + `PerformanceObserver('longtask')` in *headed* Chromium with `GALLIUM_DRIVER=d3d12` (WSLg → GTX 1050) and `Emulation.setCPUThrottlingRate` 4×.
