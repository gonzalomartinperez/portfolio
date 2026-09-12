# Personal identity and immersive portfolio

Status: in-progress

## Outcome

Improve the existing seven-route bilingual portfolio for hiring teams. Preserve approved facts,
URLs, light/dark themes and managed hosting. Recreate the visual qualities of the owner's Morpho
reference with original implementation: a compact fine-grained sphere, camera expansion,
depth-layered technology marks and an accessible settled catalogue. Do not reuse Morpho branding.

## Acceptance criteria

- AC-1: An original face-only pixel-art SVG identity has 48, 32 and 16-unit sources and is used in
  navigation, favicon and hero. Retain the real portrait elsewhere; raster compatibility icons
  are derived from the vectors.
- AC-2: A circular perspective particle shell appears below, not behind, the main heading.
  Pointer displacement settles smoothly; native scroll drives the reversible four-phase reveal.
- AC-3: Three.js Points/shaders and GSAP ScrollTrigger load only with the hero. No React state
  updates per frame. Stop offscreen/hidden; clean up on unmount and handle context loss.
- AC-4: All verified technologies share stable catalogue IDs, evidence links and original-colour
  local logos where available. Concepts have text labels. Search/category filtering retains a
  complete server-rendered default and clear empty/reset states.
- AC-5: English and Spanish copy is direct, specific and evidence-led across all routes. Retain
  metric qualifiers, team attribution and the approved scope of each role.
- AC-6: Filomena offers grouped screen exploration and keyboard-accessible enlargement. Education
  separates curriculum, results and completed credentials. Contact/CV remain immediately reachable.
- AC-7: Both themes, all 14 locale/routes, 200% zoom, mobile, reduced motion and no-JS fallback
  remain usable. A visible pause control stops ambient and scroll-driven motion without hiding content.
- AC-8: The deferred scene dependency closure stays within 250 KiB gzip. Measure load/CLS and
  frame timing without claiming field INP or untested real-device performance.
- AC-9: Modern build, production smoke, browser/axe tests and legacy hosting CI pass. Keep the
  protected task-PR to develop, develop-PR to main workflow; never change DNS or hosting settings.

## Shared implementation contracts

- Keep Mark({size?, title?}) as the identity entrypoint; its implementation becomes the avatar.
- Keep HeroStage props (hero, core, still, constellation, pauseLabel, playLabel). The scene lane
  owns HeroStage, all hero engine/components/styles and views/hero-view.tsx plus hero.module.css.
- Catalogue lane exports technologyCatalog, technologyGroups and getTechnology(nameOrId) from
  src/content/technologies.ts. Technology: id, name, category, kind ('brand'|'concept'), status
  ('applied'|'developing'), evidence: {label, href}[], optional icon string. icon resolves through
  BrandMark. Keep StackGroup shape and localized group IDs stable for existing consumers.
- TechConstellation receives locale?: 'en'|'es' as well as existing heading/note. It reads the
  server-only catalogue and presents labelled links; no private source provenance ships to clients.
- The catalogue lane owns /stack view and its client filter; page lane does not edit these.
- Pages lane owns non-hero views, gallery, shell styles and globals, not content or shared types.
- Coordinator owns manifests/lockfiles, tests, CI, contracts, documentation and integration.

## Delivery and verification

Baseline: develop at 09b6e25, clean checkout. Three isolated lanes implement scene/identity,
content/catalogue and pages/accessibility. Each commits only owned files with tests and a handoff.
Integrate onto the task branch, review a full home slice, then all routes before task PR/release PR.
Use deterministic scene state for 0/25/50/75/100% screenshots; test failure fallbacks separately.
Record actual results and limitations in docs/verification/portfolio-redesign.md; never infer
deployment success from GitHub CI. No changes to private professional source documents.

## Research

- [Three.js Points](https://threejs.org/docs/pages/Points.html)
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [Devicon](https://devicon.dev/)
- [Simple Icons licensing and brand disclaimer](https://github.com/simple-icons/simple-icons#disclaimer)
- [Web Vitals: laboratory versus field](https://web.dev/articles/vitals)
- [Reduced interaction animation](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
