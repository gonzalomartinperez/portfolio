import type { Role } from "../types";

/**
 * Ordered as in the reviewed resume. Product-scale figures live in `context`; `contributions`
 * describe personal work only. `attribution` exists wherever a reader could otherwise mistake
 * a team or platform outcome for an individual one.
 */
export const roles: Role[] = [
  {
    slug: "rampy",
    company: "Rampy",
    companyHref: "https://www.getrampy.com/",
    position: "AI Engineer",
    period: "Sep 2026 – Present",
    startedOn: "2026-09-01",
    location: "Argentina",
    arrangement: "Remote",
    context: "AI engineering in a fintech context.",
    contributions: [
      "Set up an agentic engineering workspace that preserves context and enables coordinated parallel work.",
    ],
    attribution:
      "Recently started. Only work that is finished and cleared for publication appears here.",
    stack: ["Applied AI", "Agentic systems"],
  },
  {
    slug: "teamcubation",
    company: "Teamcubation",
    companyHref: "https://teamcubation.com/",
    position: "Software Engineer",
    period: "Dec 2025 – Aug 2026",
    startedOn: "2025-12-01",
    location: "Argentina",
    arrangement: "Remote",
    context:
      "The promotions platform for Payway, a leading Latin American fintech, serving an " +
      "ecosystem of 350,000+ merchants, 70+ card issuers and 13 countries.",
    contributions: [
      "Delivered the promotions experience end to end: a Single-SPA React and TypeScript microfrontend embedded as a native section of the merchant portal, connected through a Spring WebFlux BFF to multiple microservices and providers.",
      "Used Amazon API Gateway to bridge the HTTPS merchant portal with internal HTTP enterprise services, keeping the integration secure from the application side.",
      "Built Java/Spring Boot and TypeScript/Node.js/NestJS microservices to ingest, normalise and process promotions from merchants, financial entities and providers, adapting contracts per integration.",
      "Implemented an event-driven, serverless flow with Amazon S3, SQS and a Python/FastAPI Lambda using ordered processing strategies.",
      "Designed an in-product RAG and agentic assistant for merchant owners with Python, LangChain, LangGraph, PostgreSQL/pgvector and guardrails, retrieving the banking promotions tied to each merchant to ground the model's answers.",
      "Built Python and Node.js tooling to replay bulk loads safely against isolated local databases, reconcile results and surface failed promotions and edge cases before release.",
    ],
    attribution:
      "A key engineering team member with substantial ownership of these components, not their sole author. Worked on containerised services in Docker and Kubernetes environments as a developer — configuration, observability and diagnosis — not as cluster administrator or infrastructure owner.",
    stack: [
      "Java",
      "Spring Boot",
      "Spring WebFlux",
      "TypeScript",
      "Node.js",
      "NestJS",
      "Python",
      "FastAPI",
      "React",
      "Single-SPA",
      "PostgreSQL",
      "pgvector",
      "LangChain",
      "LangGraph",
      "AWS Lambda",
      "Amazon API Gateway",
      "Amazon S3",
      "Amazon SQS",
      "Docker",
      "Kubernetes",
      "OpenTelemetry",
      "GitLab CI/CD",
    ],
    metrics: [
      {
        value: "20M+",
        label: "promotions loaded",
        qualifier:
          "The complete historical load, executed in production, followed by thousands of new promotions daily.",
      },
      {
        value: "~90,000/s",
        label: "peak throughput",
        qualifier: "Measured during production execution with real data across the full 20M+ load.",
      },
      {
        value: "Zero",
        label: "data loss",
        qualifier: "Validated across that same complete production load.",
      },
    ],
  },
  {
    slug: "independent",
    company: "Self-employed",
    position: "AI Engineer & Full-Stack Developer",
    period: "Jan 2024 – Present",
    startedOn: "2024-01-01",
    location: "Argentina",
    arrangement: "Remote",
    context:
      "Independent product engineering for e-commerce, social media and digital-product clients. " +
      "Projects are occasional rather than continuous.",
    contributions: [
      "Designed and shipped digital products, back offices and stock and point-of-sale extensions, connecting commercial needs to maintainable systems.",
      "Built MCP-, Claude- and LLM-powered pipelines and agents that research, generate and publish content end to end.",
      "Developed online stores, WordPress solutions, APIs and custom full-stack integrations, with Python and Node.js tooling for automation, bulk processing and data analysis under spec-driven development.",
    ],
    attribution:
      "Client count and client names are not published, because that history was never reconstructed precisely enough to state.",
    stack: [
      "Python",
      "Node.js",
      "TypeScript",
      "Claude API",
      "Model Context Protocol",
      "REST APIs",
      "WordPress",
    ],
    metrics: [
      {
        value: "USD 10,000+",
        label: "cumulative client profit",
        qualifier: "Profit generated for clients by the products delivered — not personal revenue.",
      },
      {
        value: "≥70%",
        label: "operating-cost reduction",
        qualifier: "Estimated by the clients themselves. Not an audited financial measurement.",
      },
    ],
  },
  {
    slug: "cooperativa-obrera",
    company: "Cooperativa Obrera",
    companyHref: "https://www.cooperativaobrera.coop/",
    position: "Software Engineer",
    period: "Dec 2024 – Dec 2025",
    startedOn: "2024-12-01",
    location: "Bahía Blanca, Argentina",
    arrangement: "On-site",
    context:
      "SGA, a secure enterprise back office for administering sensitive data, permissions and " +
      "auditing at Argentina's largest consumer cooperative: 150+ branches, 2.7M+ members and " +
      "an ecosystem of 50+ internal systems.",
    contributions: [
      "Held a principal design, architecture and implementation role with product-engineering scope.",
      "Built a responsive Next.js and TypeScript frontend whose only interface was a Python/FastAPI BFF, which defined the shared contract and decoupled the web experience from every downstream service.",
      "Personally integrated the 10+ systems within SGA's scope through Java/Spring Boot or TypeScript/Node.js/NestJS microservices, each conforming to that contract and encapsulating its own internal logic; legacy PHP applications were brought in through dedicated integrations.",
      "Standardised onboarding for new systems with reusable structures and filters.",
      "Automated bulk loads and data validation with Python, and implemented LDAP authentication and a complete audit trail with exportable reports.",
    ],
    attribution:
      "No public links exist: SGA administers back offices, personal data and internal company processes.",
    stack: [
      "Python",
      "FastAPI",
      "Next.js",
      "React",
      "TypeScript",
      "Java",
      "Spring Boot",
      "Node.js",
      "NestJS",
      "SQL",
      "Docker",
      "LDAP",
      "Prometheus",
      "Grafana",
      "GitLab CI/CD",
    ],
    metrics: [
      {
        value: "10+",
        label: "systems integrated",
        qualifier:
          "Every system within SGA's scope, integrated personally, inside an ecosystem of 50+.",
      },
      {
        value: "≥80%",
        label: "fewer permission tickets",
        qualifier:
          "Compared against tickets and logs before and after standardised onboarding; ≥95% of recurring assignment bugs eliminated.",
      },
      {
        value: "10 min → <10 s",
        label: "permission search",
        qualifier:
          "Through SQL tuning, indexing and pagination. Critical endpoints stayed below 300 ms on average in qualified, repeatable tests on on-premise enterprise servers.",
      },
    ],
  },
];
