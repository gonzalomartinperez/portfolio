# About profile and engineering approach

Status: done

## Outcome and scope

Give recruiters a clear personal introduction, the connection between applied AI
and product engineering, and a useful explanation of engineering standards.
Preserve approved facts and the owner-approved Spanish background and Rampy copy.
The page complements Work without repeating its achievement cards or metrics.

## Acceptance criteria

- AC-1: Both languages present the degree, independent and employed experience
  since 2024, enterprise/fintech/blockchain work, and Filomena as a final-year
  project used by five Argentine institutions with three-person team attribution.
- AC-2: The Spanish Rampy paragraph stays as approved, including funcionalidades
  and crecer; English preserves the equivalent existing narrative.
- AC-3: The approach explains user value, maintainability, performance,
  security/recovery, tests/AI evaluations and production operations without employer
  case studies. It adds no credentials, seniority, metrics or private facts.
- AC-4: B2, formal current role, openness to new opportunities and availability for interviews and the September 2026
  experience cutoff remain visible. Mobile is described as product experience,
  never attributed to Teamcubation or Cooperativa Obrera.
- AC-5: English and Spanish work at 320px and desktop, in both themes and with
  text enlarged to 200%, with clear headings, readable portrait background,
  accessible navigation and no horizontal overflow.

## Design and decisions

The About view remains a Server Component. Dedicated typed locale modules own
its copy; SiteCopy references AboutCopy and each site module imports aboutCopy.
Three concise capability cards connect the narrative with five engineering
principles. Responsive grids adapt to text size. The original portrait and shared
soft light-theme frame remain. No diagram or additional dependency is needed for
this narrative; three existing Lucide icons identify capability areas.

## Delivery plan

1. Reconcile approved bilingual narrative and isolate the About copy contract.
2. Improve section hierarchy, capability presentation, principles and sidebar.
3. Run focused browser tests, accessibility/portrait checks and npm run check.

## Verification and handoff

`npm run check` passes: 21 repository tests, 32 content tests, identity/document
checks, Biome, the production build with TypeScript, and all seven budgets. The
pre-existing Biome schema-version information is unrelated to this change.

Ten focused production-browser tests pass through the About profile suite,
localized route accessibility checks and portrait checks on desktop and mobile.
The new profile suite exercises 320px mobile and 1440px desktop, both themes,
100%/200% text size, visible facts, five employer-free standards, portrait framing
and localized next-step links. Existing route checks report no axe violations.
The portrait retains its 1254px original resolution and readable theme frame.
Eight full-page captures (two locales, two themes, two widths) support the visual
review. Tests establish browser behavior, not physical-device certification.

AC-1 and AC-2: reviewed against the approved localized paragraphs. AC-3 and AC-4:
reviewed copy and profile browser assertions. AC-5: focused browser, route/axe,
portrait and screenshot verification. No new dependencies, assets or private
career inputs are introduced.

The coordinator owns SiteCopy and the two site modules; integrate the three
compilation adapters manually, preserving concurrent Home, toolkit and contact
changes:

1. Import `AboutCopy` from `./about-copy` into `src/content/site-copy.ts`; replace
   only its inline `about` shape with `about: AboutCopy`.
2. In each locale's `site.ts`, import `aboutCopy` from `./about`; replace only the
   `about` object with `about: aboutCopy`.
3. Copy the seven owned view/copy/spec/test files and re-run integrated checks.
   AboutCopy owns the new `intro`, `focus`, `experienceAsOf`, `principlesIntro`
   and `lookingParagraphs` fields. The closing section renders three paragraphs;
   it no longer uses `lookingBody`.

The temporary shared-file diff is solely an adapter reference, not a replacement
for the coordinator's current site modules. Integration and delivery remain the
coordinator's responsibility.
