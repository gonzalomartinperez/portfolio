# Home tools carousel and additional certifications

## Intent

Use the owner's `Downloads/carrusel de tecnologias.png` as visual inspiration for a compact, horizontal row of rounded logo tiles. The selection spans product UI, languages, AI, mobile, integrations, and infrastructure; it does not imply specialization in every protocol. The full Home toolkit and Stack catalogue remain intact.

## Integration

Import `ToolCarousel` from `@/components/tool-carousel` in `src/views/home-view.tsx`. Render `<ToolCarousel locale={locale} />` after the personal/Who I am section and before the subsequent education or closing sections. Its own `section-tight frame` supplies spacing; do not wrap it in another frame. No SiteCopy adapter is required: bilingual editorial text lives in `tool-carousel-copy.ts`.

The twelve verified catalogue entries are React, TypeScript, Python, FastAPI, LangChain, LangGraph, Neo4j, React Native, Privy, Hyperliquid, Stripe, and DigitalOcean. Each tile links to its detailed Stack entry. Brand rendering reuses TechnologyMark and the reviewed official assets; no icon is redrawn here. The catalogue remains the source of names and marks.

EducationView consumes the requested section heading and description from the typed locale SiteCopy education fields. Both the heading and local navigation label use this copy. Two independent certificate cards use a grid with explicit spacing, preserving the existing issuers, dates, and evidence links.

## Interaction and accessibility

Native horizontal scrolling supports touch and trackpads without gesture interception. Previous/next buttons have explicit localized labels, control the rail, and disable at the corresponding edges. All tools are ordinary focusable links in a semantic list; keyboard focus scrolls offscreen tiles into view. There is no autoplay, animation loop, clone list, drag library, or global listener. A single ResizeObserver and passive rail scroll listener update control availability, with full cleanup on unmount. Reduced motion makes button movement immediate and removes tile transitions. The visible native scrollbar remains available without JavaScript.

Tiles reserve the same height for all brand marks, retain text labels, and use existing theme tokens. At 320px and 200% text scaling, only the rail scrolls horizontally; the page must not overflow.

## Validation

`tests/browser/tool-carousel.spec.ts` covers both locales and viewport projects: twelve tools, keyboard/button navigation, no autonomous movement, focus-driven scrolling, loaded image assets, both themes, 200% scaling, localized certification headings, two distinct spaced cards, and scoped Axe accessibility checks.

The test normally targets Home. `CAROUSEL_PREVIEW=1` is an explicit development-only switch for an isolated temporary preview route; that route is not delivered. Use `SITE_TEST_ORIGIN=http://127.0.0.1:3192` for a separately owned production server. No dependency or shared Home/hero stylesheet changes are required.

## Reviewed contrast correction

The owner's `Downloads/iconos con poca visibilidad en modo claro.png` shows the conceptual Agent evaluation and pgvector marks. Light-theme conceptual marks now have an opaque pale-blue surface (`#e3edf4`), dark-blue linework (`#006184`), and a defined border (`#9eb6c6`) so ambient particles cannot wash out the tile. This changes only `technology-mark.module.css`; official logo artwork and company marks remain untouched. A browser regression asserts these computed colors.

Isolated preview validation: production build and all ten focused Playwright tests passed (English/Spanish, desktop/mobile). The preview routes were removed after QA. Screenshots in ignored `.artifacts/carousel/` were inspected in both themes at 320px and 1440px. Integration must still run the same tests against the actual Home placement, without `CAROUSEL_PREVIEW`.
