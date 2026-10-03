# Experience architecture diagrams

Status: done

## Goal

Make the distinct production integration patterns in Rampy, Teamcubation and Cooperativa Obrera easy to understand on the Work page without implying unverified service topology or leaking internal implementation details.

## Accepted facts

- Rampy: React/Next.js web, React Native/Kotlin/Swift mobile, Python/FastAPI backend with hexagonal architecture, Agno/LangChain/LangGraph and OpenAI API agent workflows, Neo4j GraphRAG and DeFi protocol integrations. This is a capability map, not an exact request trace.
- Teamcubation: React/Single-SPA merchant portal → Spring WebFlux BFF → Java/Spring Boot and Node.js/NestJS services. An S3/SQS → Python/FastAPI Lambda pipeline handled promotion ingestion. Do not imply the Lambda sat in the synchronous portal path.
- Cooperativa Obrera: React/Next.js views → Python/FastAPI BFF → Java/Spring Boot, Node.js/NestJS and PHP services. Frontend views followed the BFF contract; BFF integrations used OpenAPI/Swagger. Services kept heterogeneous data and permission models behind a consistent admin experience.

## Acceptance criteria

1. Each of the three roles shows a localized diagram, with readable node labels and an adjacent text description that communicates the same relationships without JavaScript.
2. Diagrams use a maintained, dedicated React diagram library, are keyboard accessible, and do not enable editing or accidental node dragging.
3. Nodes fit at 320px and desktop widths without clipping; native page scroll works on touch. Light and dark themes have readable contrast.
4. The package is loaded on the Work route only. The site passes its production build, content tests, budget checks and browser checks; any budget change records the measured cost.
5. No diagram claims a specific runtime dependency between components unless confirmed in the accepted facts above.

## Verification

React Flow was added as a route-scoped client boundary with its requested project attribution visible. The combined CSS build grew to 19.0 KB gzip, including React Flow’s required stylesheet, so the global stylesheet budget was adjusted from 17 KB to 20 KB. Manual browser review covered dark/light desktop and 390px mobile diagrams; the responsive layout was corrected so parallel branches do not read as a sequential chain. `npm run check` passed, and `npm run test:site` passed with 190 browser tests and 14 intentional skips plus 18 rendered checks. The CV provenance check matched career-ops revision `2026-10-03.7`.
