# AI Engineer positioning v3

Status: done

## Outcome and scope

Reposition the public site for AI Engineer roles, consistent with the owner's
v3 profile review of 2026-10-24: the site leads with LLM agents in production
and the evals behind them, while keeping software and product engineering
visible. This is a copy-only iteration. Views, layout, navigation order and
routes stay unchanged. The reviewed CV projection (`content/cv-public.json`),
the PDFs and `content/public-documents.json` are synchronized separately.

## Acceptance criteria

- AC-1: The identity line reads `AI Engineer | Software Engineer | Product Engineer`
  in both languages, and the hero, OG image and JSON-LD description use the new
  one-line positioning in US English and neutral Spanish.
- AC-2: Hero intro, home summary, "who" section, closing question, work intro,
  open-to list and the about, work and contact metadata describe the AI
  engineering focus without the mobile startup figure, em dashes or voseo.
- AC-3: The four hero principles are AI-specific (evals, grounded answers,
  latency and cost budgets, ownership) and make no claim about eval data sources.
- AC-4: Rampy shows the eval suite (90%+ on 3,000+ cases), the LangGraph graph
  with Claude as primary model and DeepInfra/Vertex AI as fallbacks, the Agno
  migration, 2x faster responses with 40% fewer tokens, generative UI, 200+
  Hyperliquid markets, 100+ LI.FI tokens, the fee model, Clean Architecture and
  sole-engineer scope. OpenAI API, hexagonal architecture, Kotlin, Swift and the
  startup metric no longer appear for Rampy.
- AC-5: Teamcubation shows 95%+ on a 500+ case eval suite. Self-employed work
  shows only the two approved figures (hours or days to minutes; USD 10,000+
  client profit), drops the 70% client estimate and states that the Pequeverso
  assistant is not live yet. Kotlin and Swift are attributed to that work.
- AC-6: The catalogue attributes Claude API to Rampy and independent work, OpenAI
  API to Teamcubation, Kotlin and Swift to independent work, and replaces the
  hexagonal entry with Clean Architecture (Rampy). The Rampy diagram labels the
  model providers accordingly.
- AC-7: Both locales stay in parity and every metric keeps its qualifier.

## Design and decisions

Only content modules, the catalogue, diagram data and their tests change. The
architecture test that compared Rampy's site copy with the CV now requires Clean
Architecture on the site and temporarily accepts either wording in the CV until
the separate CV sync lands; it should then be tightened to Clean Architecture.

## Verification and handoff

See [the verification note](../verification/ai-engineer-positioning-v3.md).
