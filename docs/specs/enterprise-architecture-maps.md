# Enterprise architecture maps

Status: implemented; final release verification is recorded in the associated PR

## Scope

Implement the owner's approved inline diagrams on Work, in both languages. Keep
React Flow, inspection, keyboard focus, zoom controls and native page scrolling.
Nodes describe system components and concise implementation technologies. Features,
design-system organization and hexagonal code structure belong in experience/CV
copy or the explanatory caption, not node or deployment-group titles.
The final scope also includes the owner-requested bilingual CV regeneration:
correct backend pattern attribution and feature/design-system frontend descriptions,
keep newly confirmed AI tools grounded in the approved source, review three pages
per language and synchronize the public web projection/PDFs. The prepared LinkedIn
packet follows the same facts; publication remains manual. Achievement metrics,
the technology catalog and the Filomena diagram retain their existing scope.
Before closing v1.0.0, address the Home star scene's brief static-frame flash on
language changes. Reproduce repeated switches on desktop and mobile and preserve
the initial lazy runtime import, reduced-motion fallback, scrolling and cleanup.
Increase the initial mobile star sphere slightly without changing desktop sizing,
crowding the avatar or copy, or changing the settled technology-grid spacing.

## Accepted structure

### Rampy

- DigitalOcean contains the web frontend, its implemented and expanding web
  backoffice, and the hexagonal Python/FastAPI backend's own services.
- React Native/Kotlin/Swift mobile runs outside the hosting envelope and connects
  to the APIs, alongside the React/Next.js web frontend.
- The web backoffice points to the frontend as a module relationship, distinct
  from a request edge. Backend backoffice services form their own capability.
- Backend APIs exchange with authentication and wallet services; both exchange
  with the external Privy service. Use double arrowheads without duplicate paths.
- The agentic system includes its harness and Agno/LangChain/LangGraph
  orchestration. Context dependencies include PostgreSQL/pgvector, Mem0 and
  GraphRAG backed by Neo4j; model providers include Vertex AI, DeepInfra and OpenAI.
- PostgreSQL/pgvector, Neo4j and Mem0 form a functional data/memory group. Their
  hosting is unspecified; the presentation must not imply confirmed DigitalOcean
  hosting or an external managed service.
- DeFi services connect to Aave/Morpho/Compound lending and vaults, LI.FI swaps,
  and Hyperliquid perpetuals. Keep protocol providers outside the hosting envelope.

### Teamcubation

- The owner confirms an AWS deployment envelope around the complete portal,
  gateway, BFF, services, databases, ingestion and promotion assistance system.
- React/Single-SPA frontend -> generic API Gateway -> Spring WebFlux BFF.
- Backend code uses layered architecture; keep that fact in explanatory copy,
  not the node titles.
- The BFF accesses Java/Spring Boot and Node.js/NestJS microservices, each with
  its respective database, and the complete Promotion Assistance System.
- That system contains a harness for orchestration, evaluations and guardrails,
  and Neo4j GraphRAG for enterprise policy and promotion context.
- Preserve S3 -> SQS -> Python/FastAPI Lambda -> Java and Node services -> their
  respective databases; neither Lambda nor the BFF bypasses those service boundaries.
- CloudWatch is an observability capability inside AWS, not an inline request hop.
  Do not infer specific log forwarding, alarms or another unconfirmed AWS service.

### Cooperativa Obrera

- Enclose the React/Next.js frontend, Python/FastAPI BFF and Java/Spring Boot,
  Node.js/NestJS and PHP integrations in an on-premises deployment boundary.
- Preserve the frontend/BFF contract and OpenAPI/Swagger integrations. Backend
  code uses layered architecture; keep that fact in explanatory copy.

## Acceptance and verification

- Initial fit leaves every label and control readable, with distinct deployment
  and capability group treatments in light and dark themes.
- Desktop and mobile layouts preserve hierarchy, avoid node overlap, and keep
  routed edges out of unrelated node labels. Containment and observability
  relationships are visually distinct from request/exchange edges.
- Groups do not masquerade as services or obstruct clicks. Inspection panels,
  Escape/focus restoration, zoom and fit controls remain keyboard accessible.
- Touch gestures over nodes, blank canvas and boundaries scroll the document;
  200% text and narrow mobile layouts do not overflow the document.
- Run npm run check, relevant bilingual browser regression checks and inspect
  production-build captures in both themes/devices before committing.
- Warm Home language switches redraw the star scene before exposing a static
  replacement frame, on desktop and mobile. Initial visits and other routes keep
  their current lazy-loading behavior and safe fallback.
- The resting mobile sphere is modestly larger, fits its safe bounds and retains
  a smooth scroll expansion into the toolkit; desktop sizing is unchanged.
- Task PR -> develop -> release PR -> main with all exact-head required checks;
  verify public deployment separately from CI.
- Publish the requested annotated v1.0.0 tag at the validated main commit after
  the release merge; package metadata uses the same version.

## Verification record

- Career Ops PR #8 merged the approved source revision `2026-10-04.2` after its
  complete local checks. This private repository has no GitHub Actions workflow.
- Both generated CVs contain three pages. All six rendered pages were reviewed
  for readable text, spacing and clipping; the portfolio export independently
  confirms the canonical editorial/facts/release manifest and PDF hashes.
- The public export preserves existing roles, dates and metrics and excludes
  private career fields. The prepared LinkedIn packet uses the same corrected facts.
- The final consistency audit removed a stale hexagonal claim from Teamcubation's
  bilingual Work descriptions. Both layered-backend roles now describe their
  feature-organized frontends and use of design systems; Rampy's confirmed context
  and model providers appear in its description and stack. A content invariant
  checks these architecture claims against the reviewed public CV in both locales.
- The diagram lane reviewed twelve production-build captures across both
  languages, themes and device layouts. Edge routing avoids unrelated cards;
  group-heading backdrops keep connecting lines out of label text.

- The integrated source passes `npm run check`, including content/document
  contracts, lint, the production TypeScript build and asset/page budgets.
- Eight integrated graph topology cases pass without retries: EN/ES, light/dark
  and desktop/mobile. They verify routing, deployment containment, reciprocal
  exchange markers, approved technologies and the complete ingestion path.
- Clean installation and dependency audit pass with zero reported vulnerabilities.

The associated task/release PRs record remaining interaction/hero acceptance,
exact-head GitHub checks and public-deployment results before the release closes.
