# Rampy experience: detailed version (archived 2026-11-13)

Owner decision (2026-11-13): the public site describes Rampy by technology, without naming blockchain providers (wallets, swap aggregators, perps venues, vault protocols, bridges, RPC). Swaps now run through two aggregation providers: LI.FI and 1inch (second provider, added by the owner). This file keeps the detailed wording verbatim so it can be restored on demand. The architecture diagram copy with the same detail stays in `src/features/architecture-diagrams/`.

## English

```ts
slug: "rampy",
    company: "Rampy",
    companyHref: "https://getrampy.com/",
    ...experienceFacts("en", "rampy"),
    startedOn: "2026-09-01",
    location: "Argentina",
    arrangement: "Remote",
    homeSummary:
      "Multilingual AI assistant, eval suite and the trading product around it, at an early-stage fintech and blockchain startup.",
    context:
      "I lead engineering at Rampy and work closely with the three founders and with specialists in blockchain and integrations. Rampy is an early-stage fintech and blockchain startup whose non-custodial app opens the world of digital assets (swaps, yield vaults, perps and market news) to everyday people through a generative interface that turns complex concepts into simple ones. I own the multilingual AI assistant and the eval suite that gates every release (3,000+ cases, 90%+ pass rate), plus the backend, web and mobile app.",
    contributions: [
      "Built a multilingual AI assistant (English, Spanish and Portuguese) and the eval suite behind it: 1,000+ scenarios replicated and translated into each language (3,000+ cases), graded in LangSmith by an LLM-as-a-judge validated against human and product review, and used as a release gate. Production agents pass 90%+ on average. A case passes when the answer is correct and grounded, the right tool is used, the structured contract for the UI is valid, guardrails hold and the reply solves the user’s need in plain language.",
      "Designed the multi-agent LangGraph graph, with cycles, financial tools, background workers, retries and failure recovery, and migrated the agentic stack from Agno as the flows grew. Claude is the primary model, with DeepInfra and Vertex AI as fallback providers, GraphRAG retrieval over Neo4j and PostgreSQL/pgvector, and Mem0 memory. Removing redundant tool calls and tightening memory and context made responses 2× faster with 40% fewer tokens, verified with load tests and evals.",
      "Designed the structured-output contract shared by the agents and the app, so answers render as generative UI: native buttons, cards and deep links into swap, vault and perps flows, with live market data. The agent prepares each transaction and the user confirms it in a non-custodial Privy wallet.",
      "Shipped trading across 200+ Hyperliquid perpetual markets (crypto, indices, stocks and commodities), swaps across 100+ tokens via LI.FI, and Morpho, Aave and Compound vaults for positions, yields, deposits and withdrawals, with completeness checks and webhook-based status tracking. Designed and implemented the company’s fee model for swaps, vaults and perps, and worked with Privy authentication, Stripe integrations, Relay for cross-chain connections and Alchemy RPC for on-chain queries in production.",
      "Evolved the inherited codebase step by step: the backend from no defined architecture to hexagonal (ports and adapters) and then Clean Architecture; the React/Next.js frontend from no defined architecture to a feature-based structure and then Clean Architecture, with a complete design system with reusable component abstractions.",
      "Built a consolidated portfolio experience for assets, vaults and 24-hour returns; reduced comparable vault, market and perpetual data retrieval from seconds into the millisecond range through prefetching, parallel provider calls and selective caching.",
      "Cut the validation, build and deployment pipeline from about one hour to ten minutes while retaining its checks; optimized application bundles, Docker images and development, staging and production environments on DigitalOcean.",
      "Implemented end-to-end encryption (E2EE) for user conversations in the production app, with messages persisted encrypted in the database.",
      "Shipped the React Native app, using Android Studio for Android development and testing in emulators and on physical devices. The Android app is live and the iOS version is ready, with its launch pending.",
      "Implemented complete mobile event tracking with Google Analytics through Firebase, Clarity Mobile on every screen, and Singular SDK for Meta App Events, coordinating integrations to prevent duplicate events. Designed, built, tested and deployed a campaign landing page for app downloads.",
      "Built the enterprise back office to manage application operations and centralize monitoring, telemetry and operational status; I continue to expand its capabilities.",
      "Added domain and malicious-instruction controls to agent workflows, checked with automated behavioral tests and human review.",
      "Centralized secrets with Infisical, per-user access, automated synchronization and on-demand rotation; worked across deployment, monitoring, backups, databases and server permissions.",
      "Standardized spec-driven engineering through an agent skills marketplace and repeatable local setup, connecting requirements, architecture, implementation, automated tests and human UI review.",
      "Prepared scalable infrastructure with the design goal of supporting thousands of users, organizing environments, containers and operational controls for product growth.",
    ],
    attribution:
      "Leading engineering since September 2026 with the founders, specialists in blockchain and integrations, and an experienced advisor on specific architecture decisions.",
    stack: technologyNames([
      "Python",
      "Solidity",
      "FastAPI",
      "LangGraph",
      "LangChain",
      "LangSmith",
      "Claude API",
      "Agno",
      "Google Vertex AI",
      "DeepInfra",
      "GraphRAG",
      "Neo4j",
      "RAG",
      "Mem0",
      "pgvector",
      "Hexagonal Architecture",
      "Clean Architecture",
      "TypeScript",
      "React",
      "Next.js",
      "React Native",
      "Android Studio",
      "Hyperliquid",
      "LI.FI",
      "Relay",
      "Alchemy",
      "Privy",
      "Stripe",
      "End-to-end encryption",
      "Microsoft Clarity",
      "Firebase Analytics",
      "Meta App Events",
      "Singular SDK",
      "PostgreSQL",
      "Redis",
      "Celery",
      "Docker",
      "DigitalOcean",
      "Infisical",
    ]),
    metrics: [
      {
        value: "90%+",
        label: "pass rate on a 3,000+ case eval suite",
        qualifier:
          "Global average for production agents on 1,000+ scenarios run in English, Spanish and Portuguese, graded in LangSmith by an LLM-as-a-judge validated against human and product review.",
      },
      {
        value: "2×",
        label: "faster responses in optimized agent workflows",
        qualifier:
          "At least 2×, measured with load tests and evals on comparable optimized agent workflows.",
      },
      {
        value: "40%",
        label: "fewer tokens in optimized agent workflows",
        qualifier:
          "Measured with load tests and evals after removing redundant tool calls and tightening memory and context; not a benchmark of every query.",
      },
      {
        value: "2×",
        label: "faster optimized financial queries",
        qualifier:
          "At least 2×, measured with load tests on comparable optimized vault, market and swap queries in production.",
      },
      {
        value: "~1 h → 10 min",
        label: "delivery pipeline",
        qualifier:
          "Approximate observed before/after for validation, build and deployment, with checks retained.",
      },
    ],
  },
```

## Spanish

```ts
slug: "rampy",
    company: "Rampy",
    companyHref: "https://getrampy.com/",
    ...experienceFacts("es", "rampy"),
    startedOn: "2026-09-01",
    location: "Argentina",
    arrangement: "Remote",
    homeSummary:
      "Asistente de IA multilingüe, suite de evaluación y el producto de trading que lo rodea, en una startup fintech y blockchain en etapa temprana.",
    context:
      "Lidero la ingeniería en Rampy y colaboro con los tres fundadores y con especialistas en blockchain e integraciones. Rampy es una startup fintech y blockchain en etapa temprana cuya app no custodial acerca el mundo de los activos digitales (swaps, vaults de rendimiento, perpetuos y noticias de mercado) a cualquier persona mediante una interfaz generativa que vuelve simples los conceptos complejos. Me ocupo del asistente de IA multilingüe y de la suite de evaluación que habilita cada versión (3.000+ casos, 90% o más de aprobación), además del backend, la web y la app móvil.",
    contributions: [
      "Construí un asistente de IA multilingüe (inglés, español y portugués) y la suite de evaluación que lo respalda: más de 1.000 escenarios replicados y traducidos a cada idioma (más de 3.000 casos), calificados en LangSmith con un LLM-as-a-judge validado contra revisión humana y de producto, y usados como requisito para cada release. Los agentes en producción aprueban el 90% o más en promedio. Un caso se aprueba cuando la respuesta es correcta y fundamentada, se usa la herramienta adecuada, el contrato estructurado para la interfaz es válido, se respetan los guardrails y la respuesta resuelve la necesidad del usuario en lenguaje simple.",
      "Diseñé el grafo multiagente en LangGraph, con ciclos, herramientas financieras, procesos en segundo plano, reintentos y recuperación ante fallos, y migré el stack agéntico desde Agno cuando los flujos se volvieron más complejos. Claude es el modelo principal, con DeepInfra y Vertex AI como proveedores de respaldo, recuperación con GraphRAG sobre Neo4j y PostgreSQL/pgvector, y memoria con Mem0. Al eliminar llamadas redundantes a herramientas y ajustar la memoria y el contexto, las respuestas pasaron a ser el doble de rápidas con un 40% menos de tokens, verificado con pruebas de carga y evaluaciones.",
      "Diseñé el contrato de salida estructurada que comparten los agentes y la app, para que las respuestas se muestren como UI generativa: botones, tarjetas y accesos nativos a los flujos de swaps, vaults y perpetuos, con datos de mercado en tiempo real. El agente prepara cada transacción y el usuario la confirma en su wallet no custodial de Privy.",
      "Lancé el trading en más de 200 mercados de perpetuos de Hyperliquid (cripto, índices, acciones y commodities), swaps con más de 100 tokens mediante LI.FI y vaults de Morpho, Aave y Compound para consultar posiciones y rendimientos, depositar y retirar, con controles de completitud y seguimiento de estado mediante webhooks. Diseñé e implementé el modelo de comisiones de la empresa para swaps, vaults y perpetuos, y trabajé con autenticación de Privy, integraciones de Stripe, Relay para conexiones cross-chain y Alchemy RPC para consultas on-chain en producción.",
      "Hice evolucionar el código heredado por etapas: el backend pasó de no tener arquitectura definida a una arquitectura hexagonal (puertos y adaptadores) y luego a Clean Architecture; el frontend React/Next.js, de no tener arquitectura a una estructura por funcionalidades y luego a Clean Architecture, con un design system completo con abstracciones de componentes reutilizables.",
      "Construí una vista consolidada del portfolio con activos, vaults y rendimientos de las últimas 24 horas; reduje la recuperación de datos en consultas comparables de vaults, mercados y perpetuos del rango de segundos al de milisegundos mediante precarga, consultas paralelas y caché selectiva.",
      "Reduje el pipeline de validación, build y despliegue de aproximadamente una hora a diez minutos conservando sus controles; optimicé bundles, imágenes Docker y entornos de desarrollo, staging y producción en DigitalOcean.",
      "Implementé cifrado de extremo a extremo (E2EE) para las conversaciones de usuarios en la app en producción, con mensajes almacenados cifrados en la base de datos.",
      "Desarrollé la app en React Native, usando Android Studio para Android y verificando en emuladores y teléfonos reales. La app está publicada en Android y la versión para iOS está lista, con su lanzamiento pendiente.",
      "Implementé el tracking completo de eventos móviles con Google Analytics mediante Firebase, Clarity Mobile en todas las pantallas y Singular SDK para Meta App Events, coordinando integraciones para evitar duplicados. Diseñé, desarrollé, probé y desplegué una landing page para campañas de descargas.",
      "Desarrollé el backoffice empresarial para administrar la aplicación y centralizar el monitoreo, la telemetría y el estado operativo; continúo ampliando sus capacidades.",
      "Incorporé controles de dominio y frente a instrucciones maliciosas en los flujos agénticos, verificados con pruebas automatizadas de comportamiento y revisión humana.",
      "Centralicé secretos con Infisical, acceso por usuario, sincronización automatizada y rotación a demanda; trabajé sobre despliegues, monitoreo, backups, bases de datos y permisos de servidores.",
      "Estandaricé el desarrollo guiado por especificaciones mediante un marketplace de skills para agentes y un setup local reproducible, conectando requisitos, arquitectura, implementación, pruebas automatizadas y revisión humana de UI.",
      "Preparé infraestructura escalable con el objetivo de soportar miles de usuarios, organizando entornos, contenedores y controles operativos para acompañar el crecimiento del producto.",
    ],
    attribution:
      "Lidero la ingeniería desde septiembre de 2026 con los fundadores, especialistas en blockchain e integraciones y un asesor con experiencia en decisiones puntuales de arquitectura.",
    stack: technologyNames([
      "Python",
      "Solidity",
      "FastAPI",
      "LangGraph",
      "LangChain",
      "LangSmith",
      "Claude API",
      "Agno",
      "Google Vertex AI",
      "DeepInfra",
      "GraphRAG",
      "Neo4j",
      "RAG",
      "Mem0",
      "pgvector",
      "Hexagonal Architecture",
      "Clean Architecture",
      "TypeScript",
      "React",
      "Next.js",
      "React Native",
      "Android Studio",
      "Hyperliquid",
      "LI.FI",
      "Relay",
      "Alchemy",
      "Privy",
      "Stripe",
      "End-to-end encryption",
      "Microsoft Clarity",
      "Firebase Analytics",
      "Meta App Events",
      "Singular SDK",
      "PostgreSQL",
      "Redis",
      "Celery",
      "Docker",
      "DigitalOcean",
      "Infisical",
    ]),
    metrics: [
      {
        value: "90%+",
        label: "de aprobación en una suite de más de 3.000 casos",
        qualifier:
          "Promedio global de los agentes en producción sobre más de 1.000 escenarios en inglés, español y portugués, calificados en LangSmith con un LLM-as-a-judge validado contra revisión humana y de producto.",
      },
      {
        value: "2×",
        label: "respuestas más rápidas en flujos agénticos optimizados",
        qualifier:
          "Al menos 2×, medido con pruebas de carga y evaluaciones en flujos agénticos optimizados comparables.",
      },
      {
        value: "40%",
        label: "menos tokens en flujos agénticos optimizados",
        qualifier:
          "Medido con pruebas de carga y evaluaciones tras eliminar llamadas redundantes a herramientas y ajustar la memoria y el contexto; no es un benchmark de cada consulta.",
      },
      {
        value: "2×",
        label: "consultas financieras optimizadas más rápidas",
        qualifier:
          "Al menos 2×, medido con pruebas de carga en consultas optimizadas comparables de vaults, mercados y swaps en producción.",
      },
      {
        value: "~1 h → 10 min",
        label: "pipeline de entrega",
        qualifier:
          "Comparación aproximada observada para validación, build y despliegue, conservando los controles.",
      },
    ],
  },
```
