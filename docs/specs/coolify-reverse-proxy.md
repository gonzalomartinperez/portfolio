# Coolify, reverse proxy experience, and compact motion controls

Status: done

## Outcome and scope

Visitors can find the owner's confirmed Coolify and reverse proxy experience in
the public technology catalog and understand its application infrastructure
context in English and Spanish. The originating request confirms these skills
without assigning an employer or naming a hosting provider or proxy vendor.

Scope covers the shared catalog, public About/Stack copy, existing mark
registries, local asset provenance, and icon-only
page animation controls in Home and the footer. CV exports, career source
inventories, employer histories, the AI assistant, and production configuration
are outside this change. No DevOps specialty or additional platform expertise is inferred.

## Acceptance criteria

- AC-1: Coolify and Reverse proxy are applied entries in Cloud & delivery, in
  both locales. Search supports the Spanish alias “Proxy inverso”.
- AC-2: About and Stack describe Coolify deployments and reverse proxy request
  routing as general application infrastructure experience. Neither new entry
  attributes the skill to an employer or unconfirmed proxy vendor.
- AC-3: Coolify renders an original colored local official mark with documented
  provenance and license. Reverse proxy uses the existing concept illustration
  system. Visible labels remain the accessible technology names.
- AC-4: Catalog ordering, responsive catalog components, and the existing
  curated 35 hero identities retain their current contracts.
- AC-5: Public CV exports and manifests remain unchanged. Career-source
  synchronization is reported to the integration owner as a separate task.
- AC-6: Home and footer animation controls show only a Pause or Play icon. They
  preserve their localized accessible names, stateful `aria-pressed`, tooltip,
  keyboard focus, and minimum 44×44px touch target. The existing shared pause
  state, reduced-motion fallback, and navigation behavior remain unchanged.

## Design and decisions

`src/content/technologies.ts` is the shared data source for Stack and the expanded
Home catalog. Both new entries link to `/about`, whose localized paragraph
provides explicit public context without assigning a company. Stack's existing
infrastructure note and Cloud group context explain the same scope.

Coolify's official repository provides the original 352×352 colored SVG, pinned
to commit `f55efc859dfcbbf79274c4907b3df89f9767c11d`. The asset remains unchanged,
with upstream Apache License 2.0 included locally. `BrandMark` uses its existing
decorative-image behavior, sizing, and theme-safe background. Reverse proxy maps
to the existing Lucide `Route` icon. No dependency or catalog layout changes are
necessary. The curated hero selection remains independent of catalog growth.

The requested simpler motion controls reuse Lucide Pause/Play icons and existing
localized strings. The footer uses the existing 44px icon Button size. Home keeps
its existing position and focus treatment with a 44px square target. State logic
and reduced-motion behavior remain unchanged. The existing navigation test now
checks the localized accessible name instead of visible button text. Solar
Explorer's dialog controls and the already icon-only carousel are unchanged.

## Delivery plan

1. Add applied entries, localized context, and existing mark registry mappings.
2. Include the official mark, upstream license, and asset provenance.
3. Simplify the requested Home/footer controls and preserve accessible names.
4. Run repository/content/lint/build/budget checks and review the scoped diff.
5. Hand the verified task commit to the integration owner for the combined task
   PR into develop; report career source synchronization without editing
   generated career projections.

## Verification and handoff

Verified on Node 24.21.0 with npm 11.19.0, based on develop `1ffeaa3`:

- AC-1/AC-4: `npm run check` passed catalog membership, applied evidence,
  alphabetical ordering in both languages, safe local resources, and the
  unchanged 35 hero identities. Direct catalog assertions confirmed both new
  cloud entries in English/Spanish, the Spanish alias, and neutral `/about`
  evidence. The public catalog contains 175 entries.
- AC-2: The bilingual source diff and production page checks confirm general
  deployment and request-routing context in About and Stack, with no new company
  attribution or proxy vendor.
- AC-3: The original official colored SVG and upstream license are included
  unchanged; existing safe-asset tests pass. Production screenshots were reviewed
  in both themes at 1440px desktop and 320px mobile: the original mark is clear
  and proportionate, and the concept uses its separate routing illustration.
- AC-5: The scoped diff leaves CV documents/manifests unchanged. The integration
  owner confirmed career-source synchronization was completed separately.
- AC-6: Eight existing animation tests passed on desktop/mobile at the first
  attempt, including localized client navigation, pause/resume, dynamic reduced
  motion, and no-JavaScript fallback. Manual production checks on desktop English
  and 320px mobile Spanish passed for icon-only controls, localized names/titles,
  `aria-pressed`, 44px square targets, and Space-key interaction with visible focus.
  Both theme screenshots and paused/running icons were visually reviewed.

`npm run check` also passed repository rules, assistant contract/unit checks,
identity/document hashes, TypeScript, Biome, production build, and budgets.
`SMOKE_TEST_PORT=3191 npm run test:smoke` passed production HTML/title/main,
missing-route 404, default-off assistant launcher absence, and 404 responses from
both localized assistant routes.

Eight About/Stack route tests passed on English/Spanish desktop/mobile at the
first attempt: full Axe checks in both themes, no horizontal overflow, and no
page errors. Both browser runs used normal graphics, one worker, existing test
timeouts, and `CI=true` with the unchanged retry/flake gate. The existing motion
test's visible-text assertion now checks the same localized accessible name.

Browser runs were sequential and coordinated with the integration owner. Local
screenshots are ignored artifacts; no physical-device testing is claimed. The
integration owner handles the combined task PR's required CI and release.
