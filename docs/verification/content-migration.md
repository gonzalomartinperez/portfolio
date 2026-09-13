# Self-contained content migration

Reviewed: 2026-09-13. Scope: bilingual professional pages and the technology catalogue.

This is an editorial migration record, not a copy of private source documents. Published
facts retain their approved dates, attribution and measurement conditions. The build reads
only repository-owned content; it does not query a career repository, Notion or a CV service.

## Migration matrix

| Material | Decision | Public destination |
| --- | --- | --- |
| Professional positioning and experience | Preserve contractual titles, chronology and qualified results; distinguish product AI from engineering assistants | About and Work, both languages |
| Rampy | Keep the approved abstract first contribution; do not infer product stack, repository topology or results | About and the Rampy role |
| Filomena product overview | Explain preparation, delivery and assessment as one product, rather than relying on an external case study | Filomena overview |
| Filomena team and technical scope | Preserve three-person team and principal contribution; remove duplicate attribution paragraph on the same page | Filomena contribution section |
| Historical case-study link | Replace external Notion navigation with the local academic context page | `/education` and `/es/education` |
| Architecture and operations | Preserve API-first architecture, validation, rendering, containers and monitoring; retain public snapshot limitations | Filomena approach, architecture and delivery |
| Historical gallery counts | Use the actual 43 reviewed public-safe images, not the historical 48-screen heading | Shared gallery and localized captions |
| Academic facts and documents | Keep linked to the local Education page; academic content migration is a separate lane | Education |
| Existing 104 technology entries | Preserve every ID, applied/developing status and supporting context; reorder for AI-first discovery | Shared technology catalogue |
| Five missing technical entries | Add Docker Compose, server-side rendering, single-page applications, input validation and health checks from the documented Filomena implementation | Catalogue, with Filomena context |
| Known aliases | Resolve SSR, SPA, Swagger and alternate Data modeling spelling without duplicate entries | Catalogue search and lookup |
| Unconfirmed onboarding stack | Do not turn tools listed for preparation into professional achievements | Not added |
| Concepts without brand logos | Continue using descriptive illustrations with text, not fabricated corporate marks | Catalogue |

## Inventory and ordering

The catalogue contains **109 unique entries**: 100 applied and nine developing. Category
order is applied AI, languages/runtimes, backend/APIs, data/architecture, frontend,
cloud/delivery, quality/security, collaboration and fintech/blockchain. Within AI,
LangChain, LangGraph, RAG, agents and MCP lead; Python and TypeScript lead languages;
FastAPI and NestJS lead backend. Existing software engineering breadth remains intact.

All nine developing entries remain blockchain concepts. Their About context explicitly
distinguishes growing knowledge from applied fintech experience. There are no skill
percentages, invented badges or claims of operating employer infrastructure.

## Reconciliation boundaries

- Historical first-person case-study language is not evidence of sole authorship.
- Source snapshots are not the original Git history or proof of comprehensive automated
  test coverage; original deployment pipelines are not presented as included in them.
- Production results stay qualified. No latency targets, customer counts or revenue
  figures were added or upgraded during this migration.
- University mentions remain mentions, not a named award or individual certification.
- Institutional data and withheld gallery images remain excluded.

## Checks

Run `node --test scripts/content-migration.test.mjs` for the migration invariants, plus
the repository's standard `npm run check`. Visual and integrated browser validation
belongs to the coordinator's release check. This document does not assert deployment.

Lane verification: dependency restore (zero audit findings), five repository tests,
two migration tests, eight identity outputs, lint, the production build with TypeScript
and seven budget checks passed. The existing content suite passed 14 of 15 tests; its
remaining assertion requires the old Spanish Notion URL and must be migrated by the
coordinator to check the new localized internal destination before release. No check
was disabled or bypassed in this lane.
