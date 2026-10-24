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

## Proof-first follow-up

A second copy pass, driven by the 72/100 scoring of the live site, moves evidence
into the first screen without redesigning layout, navigation or routes.

- AC-8: The hero eyebrow no longer repeats the header titles. It shows three proof
  parts (sole engineer at a US fintech, 3,000+ eval cases gating every release,
  remote from Argentina in UTC-3), each on its own line between 375 and 414 px.
  The status pill stays on one line with its dot on phones; below 27rem the
  remote-work clause is visually hidden but kept for screen readers.
- AC-9: Rampy's context line, shown on Home and Work, carries the sole-engineer
  scope and the eval suite figures. The home featured project is retitled
  "Shipped to production while still at university".
- AC-10: PyTorch, TensorFlow, Pydantic AI, Google Gemini, MoonPay, ZeroDev, NumPy
  and pandas are excluded from the public catalogue, the carousel and the hero
  through `publicTechnologyExclusions`; their source records stay. The hero keeps
  35 marks, replacing PyTorch, NumPy and pandas with LangSmith, Neo4j and GraphRAG.
  Fine-tuning stays a general skill with `/work` evidence, never Rampy.
- AC-11: No em dash remains in visible prose, labels, aria-labels or OG alt text.
  Languages read `Language: Level`; CV downloads read `English CV (PDF)` /
  `CV en inglés (PDF)`.
- AC-12: Experience length reads "2.5+ years" / "Más de 2,5 años" with no
  as-of date on Home, Work and About.
- AC-13: Work's Selected projects lists Portfolio Assistant with the brief's facts
  (open source, FastAPI and LangGraph, hybrid retrieval plus GraphRAG, cited SSE
  answers, cost limits, 1,000-question bilingual bank plus adversarial cases,
  800+ tests, 244 live-model turns, not deployed) and its repository link.
- AC-14: "End to end" appears at most once per page outside the E2EE term; the
  Teamcubation pipeline uses the CV verb ("Delivered the event-driven pipeline");
  the self-employed figures note no longer points "below"; the About closing
  paragraph and the duplicated toolkit intro are rewritten. The Pequeverso
  gallery drops the near-blank sign-in capture and orders landscape captures first.

- AC-15: The Pequeverso gallery shows 16 non-redundant captures taken from the
  images the three public repositories use in their READMEs: store (2), assistant
  (5, only the 2026-10-18 fixture captures, including the 408 × 560 panel
  closeups) and back office (9, documented synthetic MOCK data and test accounts).
  Thumbnails share a 3:2 frame so rows stay even; panel and phone captures are
  contained at natural proportions and open at their own size, never enlarged.
- AC-16: The CV re-release (revision 2026-10-24.1, new manifest) is synced: the
  public PDFs move to `/gonzalo-martin-perez-ai-engineer-{en,es}.pdf` with
  permanent redirects from the old paths, download as
  `Gonzalo-Martin-Perez-AI-Engineer-Resume.pdf` / `Gonzalo-Martin-Perez-AI-Engineer-CV.pdf`,
  and `content/cv-public.json` plus `content/public-documents.json` are regenerated
  from the approved inputs.

Out of scope: the `/es/cv` tagline ("LLM agents, RAG & evals in production")
comes from the reviewed CV export and is left for the next CV sync.

## Verification and handoff

See [the verification note](../verification/ai-engineer-positioning-v3.md).
