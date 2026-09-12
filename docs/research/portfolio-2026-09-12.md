# Portfolio research synthesis

Checked **2026-09-12**. Supports [the initial release](../specs/portfolio-initial-release.md)
and [the design system](../design.md). Primary documentation is preferred; where the evidence is
weak this note says so rather than presenting a preference as a finding.

## Decisions this research produced

1. The hero ships a visible pause control, not only `prefers-reduced-motion`.
2. The particle field is hand-written WebGL2 with no new dependency.
3. Technology expertise is presented as text; no third-party logo is redistributed.
4. The hero heading, not the canvas, is the Largest Contentful Paint element.
5. Structured data is `ProfilePage` wrapping `Person`.
6. The information architecture is not designed around the "six-second recruiter scan".
7. The stored theme is applied by an inline script in `<head>`, the framework's documented
   technique for this class of state.
8. Locales are routed by static prefix with English unprefixed, deviating from the framework's
   `[lang]`-plus-proxy guide for the reasons recorded below.

## Motion accessibility

[WCAG 2.2](https://www.w3.org/TR/WCAG22/) became a W3C Recommendation on 2024-12-12.

**SC 2.2.2 Pause, Stop, Hide (Level A)** requires a mechanism to pause, stop or hide moving
content that starts automatically, lasts more than five seconds and is presented in parallel with
other content. The
[Understanding document](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) names
*animations* explicitly among moving content and contains no exemption for decorative or
background motion. It is also a non-interference criterion, so failing it affects the whole page.

`prefers-reduced-motion` is **not** a technique listed for SC 2.2.2 — it appears under SC 2.3.3
(Level AAA), which is scoped to interaction-triggered motion. Honouring the media query is
therefore necessary but not sufficient: the animated hero needs both.

[Technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39) treats reduced motion as
suppression, so the reduced state renders one static frame rather than a slower animation.
`prefers-reduced-motion` is documented on
[MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion); applying
the `no-preference` inverse makes the still state the default.

SC 2.3.1 (three flashes) constrains the field's brightness variation; ambient drift stays far
below the threshold.

## Canvas accessibility

A canvas that conveys nothing should expose nothing. Per
[MDN's canvas accessibility guidance](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Hit_regions_and_accessibility),
fallback content inside `<canvas>` is what assistive technology reads. A purely decorative canvas
takes `aria-hidden="true"`, no `tabindex` and no fallback text. Giving it `role="img"` with a
label would invent information that sighted visitors never receive.

## Performance

Current Core Web Vitals thresholds from [web.dev](https://web.dev/articles/vitals): LCP ≤ 2.5 s,
INP ≤ 200 ms, CLS ≤ 0.1, each at the 75th percentile.
[Lab versus field](https://web.dev/articles/lab-and-field-data-differences) matters here: a local
Lighthouse run is a diagnostic, not a claim about real users, and nothing in this repository
establishes field data.

[Canvas is excluded from LCP candidacy](https://web.dev/articles/lcp) while still counting toward
First Contentful Paint. The hero heading is therefore the LCP element, which is the correct thing
to optimise anyway. The canvas box is reserved with a fixed aspect ratio so a late mount cannot
shift layout. Shader compilation is the plausible INP risk on this page shape; no primary source
addresses that case directly, so it is treated as an inference and mitigated by compiling once,
off the interaction path.

## WebGL technique

[MDN's WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
cover pixel-ratio caps, batching and resource disposal. The
[WebGL specification](https://registry.khronos.org/webgl/specs/latest/1.0/) makes
`preventDefault()` inside `webglcontextlost` a precondition for restoration: without it the
context never restores. `getContext` returning `null` is the availability test; there is no
reliable feature query beyond it.

Pausing uses
[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
and the [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API).

### Library comparison

| Option | Assessment |
| --- | --- |
| **Raw WebGL2** | No dependency, no version risk, full control of the budget. **Selected.** |
| three.js + `@react-three/fiber` | `@react-three/fiber@9.7.0` declares `react: ">=19 <19.3"`; this repository runs `react@19.3.0` and `.npmrc` sets `strict-peer-deps=true`, so installation fails. three.js is roughly 185 KB gzipped with documented tree-shaking problems. |
| OGL | Small and capable, but roughly seventeen months without a commit. |
| regl | Effectively dormant since 2021. |
| 2D canvas only | Viable and cheap, but cannot carry depth convincingly, and a second renderer is a second thing to keep in sync. Rejected in favour of the server-rendered still. |

Adding 185 KB of library for one element on one route fails the repository's own rule about
adding dependencies only when the feature justifies them.

## Themes

Both themes ship, so the question research had to settle is how an explicit choice is resolved
without a flash and without making the page depend on JavaScript.

[`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
carries the system signal, and the
[`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) property is what
makes form controls and scrollbars follow it. Neither can express "this visitor chose the other
one", so an explicit choice needs a second mechanism and the cascade has to decide between them:
the attribute rule is written last, which is why a deliberate choice wins in either direction.

The inline script is the framework's own documented technique, from the *How to prevent flash
before hydration* guide bundled with `next@16.3.5`: a synchronous script in `<head>` reads the
stored value and sets `data-theme` on the document element before the first paint, inside a
`try`/`catch`, with `suppressHydrationWarning` on `<html>` so React accepts the DOM the script
produced instead of treating it as a mismatch. The guide also offers a cookie variant;
`localStorage` was chosen because the preference never needs to reach the server — these pages are
static, and a cookie would travel on every request to no purpose.

One adaptation: the guide's example ships a default `data-theme` on `<html>` and lets the script
correct it. Here neither the markup nor the script writes anything for a visitor who has not
chosen, so `prefers-color-scheme` governs that case. Stamping a default would pin such a visitor
to one theme regardless of their system setting.

## Languages

Next's bundled App Router internationalization guide routes every locale through `app/[lang]` and
a proxy that reads `Accept-Language` and redirects. That shape is deliberately not followed here:

- the English URLs are already public, and `[lang]` would move `/about` to `/en/about`;
- a proxy introduces a request-time redirect into a site that is otherwise entirely static;
- content negotiation guesses at a preference that two visible links state outright.

Instead the languages are separate static route trees — English unprefixed, Spanish under `/es` —
with one root layout each through route groups, so every document declares its own `lang` rather
than having the attribute patched at runtime. Path segments stay English in both trees, which
makes switching a prefix operation and gives every page an unambiguous counterpart to point
`hreflang` at.

The cost of the deviation is that two trees are maintained side by side. The shared `SiteCopy`
type is what keeps them in step: a missing or reshaped key fails the type check instead of
shipping a half-translated page.

## Technology logos

Vendor brand policies were reviewed for the technologies on the stack page. Every policy permits
using the product **name** in text; none unconditionally permits third-party use of the **logo**
on a personal site. Oracle/Java and AWS are the clearly restrictive cases. React's trademarks
transferred from Meta to the React Foundation on 2026-02-24 and no successor brand page exists
yet, leaving that mark's status unsettled.

Text labels carry no trademark exposure and cost nothing in comprehension, so the stack page uses
text. This also satisfies the requirement that a logo never be the only way to understand a skill.

## Discoverability

[schema.org/ProfilePage](https://schema.org/ProfilePage) wrapping
[schema.org/Person](https://schema.org/Person) via `mainEntity` is the documented shape for a
personal profile, with `sameAs` pointing at GitHub and LinkedIn.
[Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
documents profile-page markup; it does not promise a rich result for a personal portfolio, and no
claim of one is made here.

A sitemap is optional at this size by
[Google's own criteria](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview),
but it is free to generate and is shipped. It lists both languages and carries the `hreflang`
alternates for each route, which is the only machine-readable statement that the two trees are
translations of one another rather than duplicate content. The 1200×630 Open Graph size is a Facebook
recommendation rather than an Open Graph specification requirement.

## Information architecture evidence

The frequently cited "six-second recruiter scan" originates in a TheLadders study: a job-board
company, thirty participants, never peer-reviewed, with a direct commercial interest in the
result. It is not a sound basis for design.

No peer-reviewed research was found that examines engineering portfolio sites specifically. The
most methodologically transparent informal survey located suggests portfolio sites move hiring
outcomes very little on their own. The honest conclusion is that the portfolio's value is in its
secondary uses — something to send, something to cite in an application, evidence a hiring
manager can inspect before a conversation — and the architecture is built for those: direct,
linkable routes, real evidence links, and no gate between a visitor and the facts.

## Framework

Next.js API decisions were taken from the documentation bundled with the installed
`next@16.3.5` package rather than from general knowledge, because this major changed behaviour
that older habits get wrong. The points that shaped this implementation:

- `priority` on `next/image` is deprecated in favour of `preload`; `loading="eager"` with
  `fetchPriority="high"` is preferred in most cases.
- `images.qualities` now defaults to `[75]` and out-of-list values are coerced.
- `cacheComponents` is **off** by default, so the ordinary static build model still applies.
- `error.tsx` receives `retry`; `reset` only clears state.
- Turbopack is the default build, which is why this repository passes `--webpack`; see
  [the deployment guide](../deployment.md).
- `ImageResponse` comes from `next/og` and works on a self-hosted Node server; image-generation
  file conventions take async `params`.
- `next lint` was removed, so the bundled `jsx-a11y` rules no longer run. Accessibility here is
  verified by review and browser testing, not by the linter.

## Evidence quality warnings

- Oracle's brand pages returned 403; that assessment is triangulated and medium-confidence.
- The OpenJS trademark policy PDF could not be read, so Node.js logo conditions are unconfirmed.
  This does not affect the outcome, since no logo is used.
- X/Twitter card dimension guidance could not be verified against a primary source.
- Claims of a 2026 Core Web Vitals metric change could not be confirmed on web.dev and appear to
  be search-optimised content rather than a Chrome announcement.
- Shader compilation as an INP risk is an inference, labelled as such above.
