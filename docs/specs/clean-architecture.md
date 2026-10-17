# Enforced modular portfolio architecture

Status: done

## Outcome and scope

Keep the public portfolio easy to change without coupling its reviewed content,
interactive scenes, shared interface or optional assistant. Preserve all public
URLs, copy, documents, appearance, keyboard behavior and default-off assistant.
This is an application refactor, not a new backend or a hosting migration.

## Acceptance criteria

- AC-1: Cohesive features own their presentation, models and concrete renderers;
  shared components and the persistent shell have explicit responsibilities.
- AC-2: Content has no dependency on presentation. Diagram models do not import
  their React views. The complete source import graph has no cycles, including
  type-only dependencies.
- AC-3: Diagram captions render on the server, with the interactive canvas lazy.
  The technology carousel sends only the fields its client presentation needs.
- AC-4: Required CI rejects invalid layer dependencies, private feature imports,
  API-contract leaks, unresolved imports and transitive client/server violations.
  Negative fixtures establish that each class of guard actually fails.
- AC-5: Existing repository, assistant, content, document, build, budget, rendered,
  browser and hosting compatibility checks remain required without weakened gates.
- AC-6: Maintainers and concurrent sessions have an authoritative module map,
  research basis, version policy and explicit responsibility handoff.

## Design and decisions

Use focused feature modules rather than wrapping static content in repositories,
use-case classes or a dependency container. Domain modules depend inward; reviewed
content is a permitted neutral input except for the self-contained assistant domain.
Composition remains in Next.js routes, views, the shell and the assistant entry.
Public feature entry files are explicit, avoiding eager export barrels across lazy
3D and assistant boundaries. Framework-free diagram contracts eliminate UI type cycles.

Use Babel Parser as development tooling for TypeScript/JSX dependency extraction.
TypeScript 7 no longer exposes the old compiler API used by dependency-cruiser's
TypeScript wrapper. Babel 7.29.9 also supports the retained Node 24.6 hosting build;
Babel 8 requires a newer Node baseline. No runtime dependency is added.
See [research](../research/clean-architecture.md) and
[engineering standards](../engineering-standards.md).

## Delivery plan

1. Audit source dependencies and confirm ownership across the four active sessions.
2. Relocate cohesive features, remove inversions and extract pure graph/search models.
3. Narrow diagram/carousel client boundaries and install tested architecture guards.
4. Update documentation, verify the integrated application and deliver through PRs.

## Verification and handoff

| Criterion | Evidence |
| --- | --- |
| AC-1 | Integrated module map, independent source review and seven owned feature directories. Fifteen relocated CSS files are byte-identical. |
| AC-2 | Parsed audit of all 152 source modules passes without cycles or reversed dependencies; 16 graph integrity tests cover both locales and orientations. |
| AC-3 | Production build and 21 rendered checks pass; independent review confirms explicit server-only figures/content registry/carousel composition and type-only carousel display contracts. |
| AC-4 | Fifteen architecture fixture tests pass, including negative dependency, runtime/type cycle, transport, client/server and environment I/O cases. Repository checks require this command in the mandatory quality chain. |
| AC-5 | Final `ASSISTANT_ENABLED=true npm run check` passes all 151 tests, lint, strict builds, document verification and budgets. Contract regeneration has no drift; both dependency audits report zero vulnerabilities. Existing CI browser/compatibility/aggregate requirements and limits are unchanged. |
| AC-6 | Research, module contract, engineering standards and confirmed session ownership are documented. Exact Pequeverso repository/branch confirmation remains explicitly pending; this session does not modify those repositories. |

Browser evidence: the scoped desktop/mobile, EN/ES, light/dark run exercised 20
existing cases: 19 passed and mobile English carousel accessibility hit the existing
45-second deadline during Axe analysis. Its preceding image/content assertions
passed; the isolated rerun passed in 23.9 seconds with the original deadline and
no test edits. The initial trace is retained outside versioned source. No physical
FPS or comparative speed claim follows from this shared development host.

A final build/rendered run also verifies the subsequent server-only markers and
presentation-only explorer-state placement. Full native browser and GLIBC 2.28
verification run on the exact PR head before protected integration; follow those
Actions results for release evidence. Public API contracts, PDFs, content claims,
hosting configuration and default-off assistant activation are unchanged.
