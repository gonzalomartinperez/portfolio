# Design system

[Back to overview](../README.md)

An editorial portfolio with one immersive interaction: a personal particle identity that opens
into the technology catalogue. The [redesign specification](specs/portfolio-redesign.md) supersedes
the original release's Vertex identity and hand-written WebGL engine.

## Direction

The owner's Morpho reference informs the fine square grain, circular shell, generous black space
and camera-led expansion. Code, portrait mark, typography and professional content are original;
no Morpho branding or implementation is reused. Fidelity is reviewed at agreed scroll states,
not claimed as pixel equality between two continuously animated scenes.

The page must explain what Gonzalo builds before asking visitors to explore motion. The hero text
and calls to action sit above the compact sphere. Native scrolling reveals depth-layered marks,
then returns to ordinary document flow. The complete catalogue remains available independently
of the animation.

## Colour and typography

The editable token authority is [globals.css](../src/app/globals.css). Dark is the default;
light is an explicit, persistent choice applied before first paint when storage is available.
Blocked storage does not prevent changing the current theme.

| Role | Dark | Light |
| --- | --- | --- |
| Page | `#000000` | `#fafafb` |
| Main text | `#e8edf4` | `#0f141b` |
| Supporting text | `#9aa6b8` | `#48546a` |
| Muted text | `#8a95a8` | `#5c687b` |
| Accent | `#4cd6ff` | `#0a6e9b` |
| Control border | `#586775` | `#7f8a99` |

Inter Tight carries headings, Inter carries prose, and JetBrains Mono carries short labels.
Fonts are self-hosted through Next.js. Fluid sizing, an 80rem page frame, 44rem prose measure,
and wrapping grids support smaller screens and enlarged text. Meaning never depends on colour
alone. Brand marks keep their own colours and receive a suitable backing when necessary.

## Identity

A face-only caricature replaces Vertex in navigation, the favicon and the sphere. During review,
the owner supplied alternatives and explicitly selected this image instead of the initial
hand-drawn pixel-art proposal. It is a transparent raster illustration, not a vector graphic.
The sanitized source lives in `src/assets/avatar.png`; smooth PNG variants and multi-resolution
ICO outputs are generated reproducibly. Unselected alternatives remain outside this public
repository. The owner's approved transparent black-sweater portrait appears in the introduction;
it is an illustrated presentation image, not described as an unaltered photograph.

Evaluate the mark at 16, 32, 48 and 96 CSS pixels on both themes: hair silhouette, brows, eyes,
moustache and chin hair should read without relying on enlarged detail. Resemblance is a visual
judgement, not something an automated asset test can certify.

## Scene architecture and motion

Three.js `Points`, `BufferGeometry` and custom shaders render one particle cloud. GSAP
ScrollTrigger coordinates native-scroll progress. A single deferred runtime contains the 3D
dependencies; other pages do not need them. React handles modes, not per-particle or per-frame
updates. There is no synthetic scrolling, React Three Fiber or second animation engine.

| Progress | Composition |
| --- | --- |
| 0–20% | Compact circular sphere; introductory text leaves gradually |
| 20–55% | Camera approaches and shell expands beyond the frame; avatar fades |
| 55–80% | Original-colour technology marks appear at different depths |
| 80–100% | Marks settle and the complete grouped catalogue becomes the focus |

The reverse scroll retraces the same progression. Pointer displacement eases back with elapsed
time, not a fixed per-frame step. Mobile uses fewer particles and a shorter scroll interval.
Pause, reduced motion, unavailable WebGL and context loss preserve readable content. Rendering
stops when offscreen or hidden and resources are released on navigation.

The deferred scene closure has a **250 KiB gzip** budget, measured from Webpack's actual chunk
graph, including extracted shared chunks. This is a transfer budget, not an FPS or Web Vitals
claim. Deterministic visual inspection uses `?sceneProgress=0..1&sceneTime=0`.

## Content and catalogue

The typed technology catalogue is the single editable inventory. Stable IDs connect names,
categories, approved experience references and local logo resources. Concepts such as RAG and
hexagonal architecture have descriptive original illustrations and text labels, not invented
brand logos. The same visual fallback covers tools without a supplied official mark. Applied experience and developing
knowledge are distinguished without subjective proficiency percentages.

English and Spanish explain contributions and outcomes naturally while preserving dates,
attribution and metric conditions. An internal project does not require a public repository to
be discussed, but private documents, employer internals and unsupported ownership claims do not
belong in public copy.

## Interaction and accessibility

- Real links preserve navigation, language switching and image access without JavaScript.
- Visible keyboard focus and a skip link support navigation; mobile navigation wraps.
- The decorative canvas does not enter the accessibility tree. Pause is a labelled button.
- Search and category filters retain a complete server-rendered default and a reset state.
- Filomena's gallery groups screens by user flow. A native dialog supports Escape, arrow keys
  and focus restoration; images retain their aspect ratio.
- Metric qualifiers remain adjacent to their numbers. Disclosure sections do not remove
  contributions from the server-rendered document.

Browser/axe checks complement, rather than replace, visual and keyboard review. Record measured
results and any gaps in the redesign verification report before declaring acceptance complete.
