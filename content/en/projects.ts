import { technologyNames } from "../technologies";
import type { EvidenceLink, Metric, Project } from "../types";

export const filomena: Project = {
  slug: "filomena",
  name: "Filomena",
  tagline: "Health-sciences exams across five institutions",
  period: "Jan – Dec 2025",
  summary:
    "A legacy CakePHP and jQuery monolith, rebuilt as an API-first platform that now runs " +
    "high-stakes exams for five Argentine national institutions.",
  attribution:
    "Built by a three-person team. I was the principal author and contributor across " +
    "architecture, backend, frontend, infrastructure, security, observability and coordination. " +
    "The platform is a team achievement.",
  metrics: [
    {
      value: "5",
      label: "institutions in production",
      qualifier: "UNS, UNRN, UNC, UNVM and FAMFyG.",
    },
    {
      value: "1,000+",
      label: "simultaneous users",
      qualifier:
        "Observed in production with complete data consistency, not a synthetic benchmark.",
    },
    {
      value: "<300 ms",
      label: "critical endpoints",
      qualifier: "Average latency, through SQL tuning, Redis caching and queues.",
    },
    {
      value: "10 / 10",
      label: "final-year project",
      qualifier: "Graded at Universidad Nacional del Sur.",
    },
  ],
  stack: technologyNames([
    "PHP",
    "Laravel",
    "React",
    "Next.js",
    "TypeScript",
    "MariaDB",
    "MySQL",
    "Redis",
    "Docker",
    "GitHub Actions",
    "Prometheus",
    "Grafana",
  ]),
  links: [
    {
      label: "Academic context",
      href: "/education",
      description: "Degree, final project and academic record",
    },
    {
      label: "Backend source",
      href: "https://github.com/gonzalomartinperez/filomena-backend",
      description: "Laravel REST API on GitHub",
    },
    {
      label: "Frontend source",
      href: "https://github.com/gonzalomartinperez/filomena-frontend",
      description: "Next.js application on GitHub",
    },
  ],
};

/**
 * Open-source project. Facts come from the approved brief and the public repository; it is
 * implemented and evaluated but not deployed, so no usage or production figure is published.
 */
export const portfolioAssistant: Project = {
  slug: "portfolio-assistant",
  name: "Portfolio Assistant",
  tagline: "Bilingual RAG assistant with a 1,000-question eval bank",
  period: "Sep 2026 – Present",
  summary:
    "Open-source FastAPI and LangGraph assistant that answers recruiters’ questions about my " +
    "work, with hybrid lexical and vector retrieval plus GraphRAG (pgvector, Neo4j), cited " +
    "answers streamed over SSE and per-request cost limits.",
  attribution: "Personal open-source project. Implemented and evaluated; not deployed yet.",
  metrics: [
    {
      value: "1,000",
      label: "bilingual eval questions",
      qualifier:
        "100 intent families in English and Spanish, run with a fixture model, plus adversarial cases.",
    },
    {
      value: "800+",
      label: "automated tests",
      qualifier: "Run in GitHub Actions CI.",
    },
    {
      value: "244",
      label: "live-model turns",
      qualifier: "One evaluation run against a live OpenAI model.",
    },
  ],
  stack: technologyNames([
    "Python",
    "FastAPI",
    "LangGraph",
    "GraphRAG",
    "PostgreSQL",
    "pgvector",
    "Neo4j",
    "Server-Sent Events",
  ]),
  links: [
    {
      label: "Source on GitHub",
      href: "https://github.com/gonzalomartinperez/portfolio-assistant-api",
      description: "FastAPI and LangGraph backend on GitHub",
    },
  ],
  // Case "unsupported-employer" in evals/retrieval.json; scored by scripts/evaluate_retrieval.py.
  evalCase: {
    heading: "Example eval case",
    questionLabel: "Question:",
    question: "Did Gonzalo work at Google?",
    expectedLabel: "Expected:",
    expected: "No answer: the public corpus has no source for this employer.",
    criterionLabel: "Passes when:",
    criterion: "retrieval returns no source at all, so nothing can support a claim.",
    linkLabel: "See the eval bank on GitHub",
    href: "https://github.com/gonzalomartinperez/portfolio-assistant-api/blob/main/evals/retrieval.json",
  },
};

export const projects: Project[] = [filomena, portfolioAssistant];

type CaseStudySection = {
  heading: string;
  body: readonly string[];
};

type ArchitectureStep = {
  layer: string;
  detail: string;
};

type Change = {
  aspect: string;
  before: string;
  after: string;
};

export const filomenaCaseStudy = {
  title: "Filomena: health-sciences exams across five institutions",

  overview: {
    heading: "One platform for the assessment lifecycle",
    body: [
      "Filomena supports exam preparation, scheduling, delivery and assessment for health-sciences institutions. Administrators configure exams and access, students work through clinical cases, and evaluators assess answers against structured rubrics.",
      "The product brings those workflows together while separating institutional data and protecting student identity in the assessment process. Its 43-screen demonstration below follows those roles through the application.",
    ],
  } satisfies CaseStudySection,

  problem: {
    heading: "The problem",
    body: [
      "Health-sciences degrees assess students through large, high-stakes written exams. " +
        "Filomena's first version was a CakePHP and jQuery monolith built for a single " +
        "institution. Performance degraded under concurrent " +
        "load, exam delivery was sequential, access control was enforced inconsistently, and " +
        "adding an institution meant writing code.",
      "The original platform lacked proactive monitoring. The rebuild added visibility into application performance and the services supporting exam delivery.",
    ],
  } satisfies CaseStudySection,

  audience: {
    heading: "Who it is for",
    body: [
      "Three roles with genuinely different needs. Administrators configure institutions, " +
        "courses and schedules. Evaluators author questions and review results. Students sit " +
        "the exams, and they must remain anonymous to the evaluator grading them.",
      "Those roles are not mutually exclusive. A professor can be an evaluator in one course " +
        "and an administrator in another, which is why role handling had to be multi-role from " +
        "the start rather than a single field on a user.",
    ],
  } satisfies CaseStudySection,

  role: {
    heading: "My contribution",
    body: [
      "I was the principal author and contributor in a three-person final-project team at Universidad Nacional del Sur. My work covered architecture, backend, frontend, infrastructure, security, observability and coordination.",
      "We delivered iteratively with Agile practices and Trello, bringing together institutional requirements and the implementation of a working product.",
    ],
  } satisfies CaseStudySection,

  approach: {
    heading: "From monolith to API-first product",
    body: [
      "We separated the CakePHP and jQuery monolith into a Laravel REST API and a Next.js, React and TypeScript frontend. The API provided a common contract for the interface and multi-institution workflows, with input validation and role-based access control. Server-side rendering supported the initial page load, followed by interactive application flows.",
      "SQL tuning, indexes, Redis caching and queues supported concurrent exam workflows. Prometheus and Grafana made production behavior visible across the application and its supporting services.",
    ],
  } satisfies CaseStudySection,

  architecture: [
    {
      layer: "Client",
      detail: "Next.js, React and TypeScript, serving administrators, evaluators and students.",
    },
    { layer: "API", detail: "A Laravel REST API as the single contract for every client." },
    {
      layer: "Data",
      detail:
        "MariaDB was the final database choice; MySQL was also used during the project. Index design and query tuning supported exam workflows.",
    },
    { layer: "Cache and queues", detail: "Redis for caching and for asynchronous work." },
    {
      layer: "Observability",
      detail: "Prometheus and Grafana over the database, queues and workers.",
    },
    { layer: "Delivery", detail: "Docker images built and deployed through GitHub Actions." },
  ] satisfies ArchitectureStep[],

  decisions: [
    {
      heading: "Pseudonymity as a data-model property",
      body: [
        "Students are pseudonymous to evaluators. The data model and API enforce that boundary, keeping student identity separate from the evaluator's assessment workflow.",
      ],
    },
    {
      heading: "Isolation per institution",
      body: [
        "Each institution manages its own courses, evaluators, students, exams and schedules, " +
          "with data isolated between them. This is what turned onboarding a new institution " +
          "from development work into configuration.",
      ],
    },
    {
      heading: "Role checks on both sides",
      body: [
        "The API enforces role-based access control. The frontend reflects those permissions so users see the actions available to them.",
      ],
    },
    {
      heading: "Visibility into production",
      body: [
        "Prometheus and Grafana provide visibility into production behavior across the database, Redis, queues and workers, supported by structured logging and health checks.",
      ],
    },
  ] satisfies CaseStudySection[],

  changes: [
    {
      aspect: "Architecture",
      before: "CakePHP and jQuery monolith",
      after: "Laravel REST API with a Next.js frontend",
    },
    {
      aspect: "Concurrency",
      before: "Sequential, single-institution delivery",
      after: "1,000+ simultaneous users, observed in production",
    },
    {
      aspect: "Latency",
      before: "Degraded under concurrent load",
      after: "Critical endpoints below 300 ms on average",
    },
    {
      aspect: "Onboarding",
      before: "Required development work",
      after: "Configuration, in minutes",
    },
    {
      aspect: "Access control",
      before: "Inconsistently enforced",
      after: "Multi-role RBAC across API and frontend",
    },
    { aspect: "Observability", before: "None", after: "Prometheus and Grafana" },
  ] satisfies Change[],

  delivery: {
    heading: "Delivery and operation",
    body: [
      "Our three-person team used Agile practices and Trello to coordinate requirements, implementation and release.",
      "Docker and Docker Compose provided containerized environments, while GitHub Actions ran production deployments in under fifteen minutes, from push to live. The public code repositories are snapshots and do not include the original deployment pipeline.",
    ],
  } satisfies CaseStudySection,

  outcomes: {
    heading: "Production results",
    body: [
      "Filomena is active at UNS, UNRN, UNC, UNVM and FAMFyG. Production operation showed 1,000+ simultaneous users with complete data consistency and critical endpoints below 300 ms on average, monitored through Prometheus and Grafana.",
      "The final project received 10/10 at Universidad Nacional del Sur, alongside university interviews, coverage and mentions from academic authorities.",
    ],
  } satisfies CaseStudySection,

  lessons: {
    heading: "Next engineering priorities",
    body: [
      "The next iteration would prioritize automated regression coverage for concurrent exams and permission boundaries. The public snapshots currently contain framework smoke tests.",
      "I would also preserve repeatable performance scenarios alongside each release, so future changes can be compared with the production behavior already observed.",
    ],
  } satisfies CaseStudySection,
};

export const filomenaEvidence: EvidenceLink[] = filomena.links;

export const filomenaHighlights: Metric[] = filomena.metrics;

/**
 * Client project. Facts come from the approved brief and the three public Pequeverso
 * repositories; no revenue, traffic or sales figures are published for it.
 */
export const pequeverso: Project = {
  slug: "pequeverso",
  name: "Pequeverso",
  tagline: "A digital-products store with an AI shopping assistant",
  period: "Sep 2026 – Present",
  summary:
    "A Next.js store for printable learning resources, a private back office and an AI " +
    "shopping assistant that answers buyers from the store's own catalog.",
  attribution:
    "Independent client work. I built the store, the back office and the assistant API; the " +
    "client owns the brand, the products and the decision to launch the assistant.",
  metrics: [
    {
      value: "3",
      label: "public repositories",
      qualifier: "Store, back office and assistant API, each with its own CI.",
    },
    {
      value: "288",
      label: "hand-written eval cases",
      qualifier:
        "18 intent families run through the full HTTP/SSE path in CI with a fixture model; they test the pipeline and guards, not model quality.",
    },
    {
      value: "303",
      label: "real-model turns",
      qualifier: "One evaluation run against an earlier version of the assistant, before launch.",
    },
    {
      value: "USD 10",
      label: "monthly LLM spend cap",
      qualifier: "Configurable default, reserved atomically before every model call.",
    },
  ],
  stack: technologyNames([
    "Next.js",
    "React",
    "TypeScript",
    "Python",
    "FastAPI",
    "LangGraph",
    "GraphRAG",
    "PostgreSQL",
    "pgvector",
    "Neo4j",
    "OpenAI API",
    "Meta Pixel",
    "Docker",
    "Hostinger",
  ]),
  links: [
    {
      label: "Live store",
      href: "https://pequeverso.com/",
      description: "pequeverso.com, with Hotmart checkout",
    },
    {
      label: "Store source",
      href: "https://github.com/gonzalomartinperez/pequeverso",
      description: "Next.js store on GitHub",
    },
    {
      label: "Back office source",
      href: "https://github.com/gonzalomartinperez/pequeverso-backoffice",
      description: "Private operations app, public code on GitHub",
    },
    {
      label: "Assistant API source",
      href: "https://github.com/gonzalomartinperez/pequeverso-assistant-api",
      description: "FastAPI and LangGraph backend on GitHub",
    },
  ],
};

export const pequeversoCaseStudy = {
  title: "Pequeverso: a store with an AI shopping assistant",
  eyebrow: "Case study · Client project",

  overview: {
    heading: "Three applications for one small store",
    body: [
      "Pequeverso sells printable learning resources for families with children aged 3 to 7. I built its public store, a private back office and an AI shopping assistant that answers buyers' questions about the catalog.",
      "Hotmart handles payment, delivery and refunds, so the store can focus on explaining the products clearly and sending buyers to checkout.",
    ],
  } satisfies CaseStudySection,

  problem: {
    heading: "The problem",
    body: [
      "Buyers have questions before they pay: what the kit includes, which ages it suits, how the guarantee works. A generic chatbot can invent a price, a discount or a link, and in a store a wrong answer is worse than none.",
      "The store also had to report purchases and checkout intent to Meta for advertising, and the assistant had to stay inside a small, fixed monthly budget.",
    ],
  } satisfies CaseStudySection,

  built: {
    heading: "What I built",
    body: [
      "The store: Next.js with Hotmart checkout, Meta Pixel in the browser and a server-side Conversions API relay, plus an automated check after every release that confirms production serves the merged commit.",
      "The back office: a private app with OAuth sign-in, invite-only roles and an operations dashboard for the assistant's health, catalog freshness, runs, latency, tokens and spend.",
      "The assistant: GraphRAG on LangGraph that combines lexical, pgvector and Neo4j retrieval over the store catalog. The server validates every product, price and link before it reaches the buyer, and a monthly spend cap is enforced before each model call.",
    ],
  } satisfies CaseStudySection,

  architecture: [
    {
      layer: "Store",
      detail:
        "Next.js, React and TypeScript. Product pages, Hotmart checkout and a native assistant panel that stays off until launch.",
    },
    {
      layer: "Tracking",
      detail:
        "Meta Pixel in the browser, mirrored by a same-origin Conversions API relay with matching event ids.",
    },
    {
      layer: "Assistant API",
      detail:
        "Python and FastAPI. Sessions with CSRF protection, answers streamed over SSE and a versioned HTTP contract.",
    },
    {
      layer: "Retrieval",
      detail:
        "A bounded LangGraph flow over lexical, pgvector and Neo4j retrieval, using a catalog exported from the store.",
    },
    {
      layer: "Guards",
      detail:
        "Server-side checks for products, prices and links, plus budget reservations against the monthly cap.",
    },
    {
      layer: "Back office",
      detail:
        "Next.js with OAuth sign-in and roles in PostgreSQL, reading operations data from the API on the server.",
    },
  ] satisfies ArchitectureStep[],

  decisions: [
    {
      heading: "Prices and links come from the catalog",
      body: [
        "The catalog is exported from the store at a pinned commit. The API checks every product, price and link before showing it, and withholds a price that has expired instead of guessing.",
      ],
    },
    {
      heading: "A spend cap in the request path",
      body: [
        "Before each model call the API reserves the worst-case cost against the monthly budget, so concurrent requests cannot overspend it. The default cap is USD 10 a month.",
      ],
    },
    {
      heading: "Evaluated before launch",
      body: [
        "288 hand-written cases in 18 intent families run through the full HTTP/SSE path in CI. An earlier version was also evaluated in a 303-turn run against the real model.",
      ],
    },
    {
      heading: "Operations stay private",
      body: [
        "The back office is a separate app. Only the owner and invited people can sign in, and it reads content-free operations data from the API on the server, never from the browser.",
      ],
    },
  ] satisfies CaseStudySection[],

  status: {
    heading: "Where it stands",
    body: [
      "The store is live at pequeverso.com, and each release to production is verified automatically after deployment.",
      "The assistant is implemented and evaluated, but it has not launched yet. It stays disabled in the published store until its server is deployed and the launch is approved.",
    ],
  } satisfies CaseStudySection,
};
