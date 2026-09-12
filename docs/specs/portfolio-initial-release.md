# Portfolio initial release

Status: in-progress

## Outcome and scope

Replace the placeholder landing page with a complete, credible portfolio that positions
Gonzalo Martin Perez as an **AI Software Engineer** who builds both conventional production
software and applied AI/agentic systems.

A visitor should understand, in order: who he is, what he builds, why it is credible, where to
inspect evidence, and how to make contact. Technical recruiters, hiring managers, engineering
leaders and prospective clients are the audience.

**In scope:** the shared shell and navigation, six routes plus one nested case study, in English
and Spanish, a light and a dark theme, an interactive hero identity with accessible fallbacks,
the portrait, verified professional content, search metadata and structured data.

**Non-goals:** a CMS, database, authentication, analytics, chatbot, comment system, blog, a
translation service or message-catalogue runtime, a form backend, and any change to hosting, DNS
or the build contract. The production build keeps Webpack and the SWC WASM fallback described in
[the deployment guide](../deployment.md).

## Information architecture

| Route | Purpose |
| --- | --- |
| `/` | Positioning, hero identity, portrait, selected evidence, routes onward |
| `/about` | Professional narrative, how he works, languages, availability |
| `/work` | Professional experience and selected projects in one chronology |
| `/work/filomena` | Flagship product-engineering case study |
| `/stack` | Technology expertise organised by capability |
| `/education` | Degree, academic results and approved public evidence |
| `/contact` | Contact routes and what he is open to |

The suggested `/experience` and `/projects` split was rejected. Only one project is publishable
as a case study, so a separate `/projects` index would be a single-entry page duplicating the
experience chronology. `/work` answers "what have you built" once, and the case study nests
beneath it at `/work/filomena`, which reads naturally and keeps the URL hierarchy honest.

## Languages

The site ships in English and Spanish. English is served unprefixed (`/`, `/about`, …) so the
site's existing URLs keep working, and Spanish lives under `/es`. Path segments stay English in
both languages, so switching language is adding or removing the prefix and nothing else — which
also means every Spanish page has an unambiguous English counterpart.

Each language has its own root layout through a route group, so each sets its own `<html lang>`
rather than patching the attribute at runtime. Interface copy lives in a shared `SiteCopy` type
implemented once per locale, so TypeScript fails the build if a translation drifts out of shape or
a key is forgotten. Professional facts stay in per-locale content modules alongside it.

This is in tension with [the repository contract](../../AGENTS.md), which requires English, and the
tension is worth stating plainly. The rule is not relaxed: code, comments, identifiers,
documentation and commit messages remain English. Spanish appears only as published interface
content, which the owner requested.

## Acceptance criteria

**Content integrity**

- **AC-1** Every factual claim traces to the private evidence map; no page in either language
  states a metric, credential, ranking or proficiency beyond it, and the two languages make the
  same claims.
- **AC-2** Product-scale numbers are attributed to the product, and personal contribution is
  stated separately. Filomena names the three-person team.
- **AC-3** Client-estimated figures are labelled as estimates, and measured figures carry their
  measurement conditions.
- **AC-4** No page implies seniority above the canonical label, English above B2, a completed
  certification that is in progress, a named award, or DevOps/infrastructure ownership.
- **AC-5** No private filesystem path, internal source extract, employer-internal detail or
  unresolved personal datum appears in tracked files.

**Shell, routing and links**

- **AC-6** All seven routes render in both languages, are reachable from the header or in-page
  links, and load correctly when requested directly.
- **AC-7** An unknown path returns HTTP 404 with the site shell and a route back.
- **AC-8** No internal link 404s and no external evidence link is broken.
- **AC-9** `sitemap.xml` lists every public route in both languages, each entry carrying the
  language alternates; `robots.txt` allows crawling and points at it.

**Accessibility**

- **AC-10** One `h1` per page and a heading order with no skipped levels.
- **AC-11** Every interactive element is keyboard reachable in a sensible order with a visible
  focus indicator; a skip link precedes the navigation.
- **AC-12** Body text meets 4.5:1 contrast and interface borders meet 3:1 against their surface.
- **AC-13** The hero animation offers a visible, keyboard-operable pause control (WCAG 2.2
  SC 2.2.2) and honours `prefers-reduced-motion: reduce` by never mounting the animation, leaving
  the server-rendered still in place.
- **AC-14** The decorative canvas is hidden from assistive technology and is not focusable.
- **AC-15** Nothing essential depends on pointer hover, WebGL or JavaScript: content, navigation
  and contact work without them.

**Performance and robustness**

- **AC-16** The hero heading, portrait and primary actions render before any animation code runs.
- **AC-17** The canvas reserves its space; mounting it causes no layout shift.
- **AC-18** Animation pauses when off-screen or the tab is hidden, and disposes GPU resources,
  listeners and frame callbacks on unmount.
- **AC-19** A missing or lost WebGL context degrades to the static fallback without an error.
- **AC-20** Device pixel ratio is capped and particle count adapts to viewport size.
- **AC-21** Added client JavaScript for the hero stays under 30 KB gzipped.

**Layout**

- **AC-22** Usable from 320 px to 2560 px with no horizontal overflow of the page body.
- **AC-23** Pointer targets in navigation and actions are at least 24×24 px.

**Languages and themes**

- **AC-24** Every English route is reachable unprefixed and its Spanish counterpart at the same
  path under `/es`; each document declares the matching `<html lang>`.
- **AC-25** The language switcher is a set of links that lands on the same page in the other
  language, works with JavaScript disabled, and marks the current language.
- **AC-26** Dark renders correctly with no JavaScript. The system preference selects light, an
  explicit choice overrides it in either direction, that choice survives reload, and no other
  theme is painted first.
- **AC-27** Both themes meet AC-12 contrast, and the hero field adopts the active theme's colours
  and blending.
- **AC-28** The theme toggle is keyboard operable and its accessible name states what pressing it
  will do.

## Design and decisions

Visual direction, tokens, layout and motion live in [the design system](../design.md).
Research, sources and the technology comparison live in
[the research note](../research/portfolio-2026-09-12.md).

**Rendering.** Every route is a Server Component and statically prerendered. Client boundaries are
narrow and exist only where browser state is unavoidable: the hero particle field, the theme
toggle, and the header, which reads the current path to mark the active link and to build the
language links.

**Content model.** `src/content/` holds small typed modules with reviewed, public-safe fields, one
set per locale plus the shared `SiteCopy` interface contract. The private career sources are never
copied wholesale and never imported.

**Hero technique.** Hand-written WebGL2, no new dependency. `@react-three/fiber@9.7.0` declares
`react: ">=19 <19.3"` against this repository's `react@19.3.0`, and `.npmrc` sets
`strict-peer-deps=true`, so it would not install. three.js alone is roughly 185 KB gzipped for
one element on one route. Absent WebGL2 is covered by the server-rendered still rather than by a
second renderer: it is drawn from the same geometry, so there is nothing to keep in sync.

**Theming.** Dark lives on bare `:root` so it needs no JavaScript. Light comes from the system
preference and from an explicit stored choice, with the explicit rule last so it wins in either
direction. A small inline script, rendered by the layout both language trees share, applies a
stored choice before first paint; it writes nothing for a visitor who has not chosen. See [the design system](../design.md) for the
tokens and contrast figures.

**Dependencies.** None added. Fonts come from `next/font`, images from `next/image`, metadata
and structured data from the framework.

**Logos.** Technology names appear as text. No third-party logo is redistributed; several vendor
brand policies restrict third-party logo use and none unconditionally permits it.

## Delivery plan

1. Design tokens for both themes, global styles, shell, header, footer, skip link, identity mark,
   metadata, theme toggle.
2. Typed content model from reviewed facts, with the shared `SiteCopy` contract.
3. Static routes: `/`, `/about`, `/work`, `/work/filomena`, `/stack`, `/education`, `/contact`.
4. The Spanish translation of the same routes under `/es`, with its own root layout and the
   language switcher.
5. Portrait derivative, `sitemap.ts`, `robots.ts`, generated OG image, structured data, 404.
6. Hero particle field behind a narrow client boundary, with pause control and the still fallback.
7. Behavioural tests, then browser verification across viewports, themes, languages and preferences.

## Verification and handoff

Recorded in [the verification log](../verification/portfolio-initial-release.md) as criteria are
checked. Criteria are not marked passed until their check has actually run.
