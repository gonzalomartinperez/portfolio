# Engineering profile polish — October 2026

## Outcome

Present the verified engineering scope clearly in US English and neutral Spanish,
with an equally usable light and dark theme. Career Ops owns facts and PDF generation;
the portfolio consumes reviewed revision `2026-10-04.1` without separate CV edits.

## Acceptance criteria

- Hero copy includes AI, fintech and blockchain, with products built for users.
- The resting star sphere is larger where viewport space permits and fully visible
  on mobile. The expanded toolkit has reading space above and below it and a
  deliberate pause before adjacent content. Motion respects reduced-motion and
  display refresh rates; no fixed 120 FPS guarantee is made.
- The global field includes more visible stars and eight decorative planets on
  slow GSAP orbits, with a static no-JavaScript/reduced-motion presentation.
  Shared pause and page visibility suspend motion; planets never capture input.
- Tool logos retain official identities, consistent visual dimensions and readable
  presentation in both themes. A manually controlled logo carousel complements
  the full categorized toolkit without autoplay or removing its entries.
- About has five grounded paragraphs, general product and engineering standards,
  AI role preferences and openness to backend and full-stack roles.
- Availability communicates openness to opportunities and availability for
  interviews, without claiming an immediate start date.
- Work cards highlight relevant outcomes before supporting details. Independent
  work is marked as production work. Rampy architecture includes Hyperliquid,
  LI.FI, Morpho, Aave and Compound, with Privy authentication and wallets shown
  separately from financial protocols.
- Education calls the completed courses additional certifications, with visible
  spacing between their cards. CV achievements have visible list markers.
- Home uses a complete Filomena exam screenshot and separates the contact question,
  product invitation and remote availability into readable lines.
- Language and theme changes preserve the user's reading position.
- The original chosen portrait is stored with provenance in both repositories.
  Downloaded PDFs and web CV match the reviewed Career Ops release.

## Verification

The integration must pass repository, content, document, formatting, build and
budget checks. Browser validation covers both locales, desktop and mobile,
light and dark themes, keyboard access, reduced motion, narrow screens and
200% text enlargement. Local validation passed: the complete repository check, 51 scene/browser cases
(with one desktop-only touch skip), 26 profile/architecture/layout cases and the
four final contextual-panel regression checks. The original modal inspection was
replaced with an inline panel after focus restoration failed under repeated
zoom/close interactions. Stable graph nodes preserve native focus; contextual
details are clamped to the visible canvas area. Independent review covered 64
normal states and 32
320px/200% text states in both themes/locales, plus 12 final mobile panel cases
with viewport bounds, zoom, focus and native-scroll assertions. Integrated CI and live production
verification remain release gates.

The aggregate CSS transfer allowance is 22 KiB gzip (previously 20 KiB). The
requested solar background, accessible tool carousel and expanded About layouts
raise the measured output from the previous allowance to approximately 20.7 KiB
before final integration. Unused Home stack-preview styles were removed. This
explicit feature allowance leaves a small margin while retaining the deferred
scene, non-scene JavaScript, portrait, HTML and source-map limits unchanged.
Transfer limits are not a claim about observed device frame rates.

## Request checklist and source map

This ledger includes the prior published baseline and the current polish. A source
path identifies implementation; final validation and deployment are recorded
separately rather than inferred from an edited file.

| Requirement | Source / verification |
|---|---|
| Career Ops owns the CV generator and confirmed facts; portfolio consumes them | Career `curriculum/fuentes`, `perfil/datos`; `cv:sync:check` and PDF hashes |
| Three pages per language, engineering typography, text extraction and ATS-friendly single column | Bundled IBM Plex fonts; six-page visual QA and generator checks |
| Natural neutral Spanish and US English; STAR-shaped achievements ordered by relevance | Locale experience modules, reviewed bilingual CV and manual LinkedIn packet |
| Formal AI Engineer role plus end-to-end product scope | Rampy context, About and Career facts; no invented seniority |
| Full frontend feature-domain refactor and complete design system; hexagonal backend | Work contributions and Rampy architecture diagram |
| Production mobile React Native/Kotlin/Swift, Android Studio and startup improvement | Rampy evidence; no mobile claim for Cooperativa or Teamcubation |
| Agno retained with LangChain/LangGraph, OpenAI API and Neo4j GraphRAG | Both Rampy and Teamcubation experience sources |
| Agent harness orchestration, evaluation, performance and domain/security guardrails | Teamcubation achievements and BFF-connected Promotion Assistance System; harness remains an internal orchestration/evaluation component |
| Fintech providers include Hyperliquid, LI.FI, Morpho, Aave and Compound | Catalog, Work diagram, CV skills and confirmed facts |
| Privy authentication/wallets, Stripe integrations and E2EE | Rampy achievements and separated integration capabilities |
| Full event tracking: Firebase/Google Analytics, Clarity Mobile and Singular/Meta | Confirmed Rampy achievement; no duplicate-event claim widened beyond scope |
| Rampy enterprise back office is implemented and being expanded | Operations contribution and web-connected diagram; CV/LinkedIn follow the approved source correction; no new metric |
| Cooperativa: React/Next.js → Python/FastAPI BFF → Java, Node and PHP services | Contracts/permissions achievements and architecture diagram |
| Teamcubation portal: React/Single-SPA → Spring WebFlux BFF → services and GraphRAG | User-confirmed BFF connections; no disconnected assistant box |
| Teamcubation ingestion: S3/SQS → Lambda Python/FastAPI → Java/Node services → their databases | User-confirmed ingestion branch, CV and LinkedIn descriptions |
| Home features Filomena without repeating detailed employer stories | Complete exam screenshot `057`, case link and concise role overview |
| Who I am explains the current product and the full engineering journey naturally | Locale profile summary and Home paragraphs |
| New original portrait stored in both repos; soft frame in light mode | Asset provenance, retained PNG and deployed AVIF |
| Original company marks retain proportions and rounded framing | Published baseline assets and company-mark checks |
| All tool marks reviewed; Privy supplied original; clear conceptual icons in light mode | Technology mark provenance and both-theme visual audit |
| Same-height technology chips and alphabetic ordering per category | Catalog comparator, constellation layout and browser checks |
| Manual modern logo carousel complements the toolkit | Accessible ToolCarousel, swipe/keyboard controls and no autoplay |
| Bigger desktop resting sphere, preserved mobile size and polished click feedback | Field engine/runtime, pulse and scene geometry tests |
| Centered toolkit heading, top/bottom space and a readable settled interval | Scene layout, scroll hold and native-scroll regression checks |
| Smooth background continuity and user-controlled motion | Global star field, pause/reduced-motion and no-JavaScript tests |
| More visible stars and all eight planets with slow orbits | GSAP SolarSystem; geometry, pause and both-theme visual checks |
| Mobile header aligns avatar, language and theme on its first row | Published header baseline and narrow-screen QA |
| Hero employment/availability is one line on desktop and two on mobile | Semantic spans, responsive separator and geometry tests |
| Theme and language switches preserve reading position | Locale link behavior and exact-position browser tests |
| External client links open in another tab | ExternalLink contract and browser checks |
| AI assistant remains disabled | Assistant contract and production route/UI checks |
| General user-centered engineering standards include performance and quality | Five About principles plus four Home quality attributes |
| AI-first preferences leave backend/full-stack/product roles open | About and Contact copy; immediate-start wording explicitly withdrawn |
| Contact message, strategic closing lines and updated CV download label | Both locale SiteCopy modules and narrow layout checks |
| Additional certifications title/body and separated cards | Typed Education copy and layout/browser checks |
| Visible web-CV bullets and readable long technology names | CV marker styles and 320px/200% text regression |
| Mobile diagrams remain interactive without capturing vertical page scroll | React Flow controls, touch behavior and architecture browser tests |
| Light and dark modes receive equal review on every page | Route/theme/locale/device visual and accessibility audit |
| Current LinkedIn packet uses portfolio links rather than scattered Notion/PDF attachments | Manual packet: headline, About, experiences, project, Featured, photo and skills |
| GitHub profile reflects current experience, portfolio/LinkedIn links and technology badges | Public `gonzalomartinperez/gonzalomartinperez`; bio/account fields and LinkedIn social link verified through GitHub API; 58 SVG badges checked and visible on the public profile |
| Selected portrait exported to the user desktop below GitHub’s upload limit | JPEG quality 99, no color subsampling, original 1254×1254 resolution, 789,459 bytes; original PNG retained |
| CI passes, commits/PRs merge through develop → main, Dependabot merge retained | GitHub checks and release records; no protection bypass |

## Final review policy

Read the completed page as a recruiter and as the author: the product, contribution
and result should be understandable without parsing a technology inventory. Keep
owner estimates qualified, team attribution visible, completed work distinct from
work in progress, and interview availability distinct from a start-date promise.
Review actual desktop/mobile screenshots, light/dark presentation, generated PDFs,
keyboard/touch interactions and production files before marking this release done.

## Subsequent solar enhancement

The eight-planet GSAP treatment above describes the initial profile release.
The owner's subsequent request replaces it with nine textured orbiting bodies
(including Pluto), the Sun, an Earth-orbiting Moon and occasional shooting stars.
The [cinematic solar specification](cinematic-solar-system.md) owns the new
Three.js rendering, asset credits, shared performance budget and verification.

## October 4 final corrections

Career Ops release `2026-10-04.1` supplies the reviewed three-page bilingual PDFs
and public CV projection. Rampy’s backoffice is implemented and being expanded;
Privy connects to the backend and the backoffice belongs to the web frontend.
Teamcubation’s Promotion Assistance System connects to the BFF, with the harness
inside that system. Architectural node names describe the actual layer or role.

All routes opt out of automatic phone, date, address, email and URL detection.
An attribute-specific CSS rule suppresses pointer activation and decoration on
anchors inserted by iOS data detectors; authored contact and navigation links
retain their behavior. This does not disable text selection or browser search
features. Device-level detection remains dependent on browser support.

## v1.0.0 closing scope

The [enterprise architecture specification](enterprise-architecture-maps.md)
supersedes the compact October 4 diagrams with the approved service relationships
and deployment envelopes. Career Ops revision `2026-10-04.2` corrects the backend
patterns: Rampy uses hexagonal architecture; Teamcubation and Cooperativa Obrera
use layered architecture. All three frontends are organized by feature and use
design systems. These code organization facts belong in captions and CV copy,
while visual nodes name system components.

The closing slice also removes the transient static Hero frame during warm Home
language changes, with desktop and mobile regression coverage. Publication of the
requested v1.0.0 tag requires the final main commit's checks and public verification.
