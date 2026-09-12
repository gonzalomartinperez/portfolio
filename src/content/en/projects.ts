import type { EvidenceLink, Metric, Project } from "../types";

export const filomena: Project = {
  slug: "filomena",
  name: "Filomena",
  tagline: "A health-sciences exam platform five institutions run on",
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
      label: "final year project",
      qualifier: "Graded at Universidad Nacional del Sur.",
    },
  ],
  stack: [
    "PHP",
    "Laravel",
    "React",
    "Next.js",
    "TypeScript",
    "MySQL",
    "Redis",
    "Docker",
    "GitHub Actions",
    "Prometheus",
    "Grafana",
  ],
  links: [
    {
      label: "Case study",
      href: "https://vine-jupiter-8df.notion.site/Filomena-Production-Health-Sciences-Exam-Platform-367b68807486814ca99ad189ca70ff00",
      description: "Full write-up with screenshots",
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

export const projects: Project[] = [filomena];

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
  problem: {
    heading: "The problem",
    body: [
      "Health-sciences degrees assess students through large, high-stakes written exams. " +
        "Filomena's first version was a CakePHP and jQuery monolith built for a single " +
        "institution, and it was showing every symptom of that: it degraded under concurrent " +
        "load, exam delivery was sequential, access control was enforced inconsistently, and " +
        "adding an institution meant writing code.",
      "There was no monitoring, so problems surfaced as reports from people sitting an exam. " +
        "For an application where a slow response during a timed assessment is an academic " +
        "problem and not just a technical one, that was the constraint that mattered most.",
    ],
  } satisfies CaseStudySection,

  audience: {
    heading: "Who it is for",
    body: [
      "Three roles with genuinely different needs. Administrators configure institutions, " +
        "courses and schedules. Evaluators author questions and review results. Students sit " +
        "the exams — and must remain anonymous to the evaluator grading them.",
      "Those roles are not mutually exclusive. A professor can be an evaluator in one course " +
        "and an administrator in another, which is why role handling had to be multi-role from " +
        "the start rather than a single field on a user.",
    ],
  } satisfies CaseStudySection,

  role: {
    heading: "My role",
    body: [
      "Filomena was built by a three-person team as our final year project at Universidad " +
        "Nacional del Sur, and the product is a team achievement. I was the principal author " +
        "and contributor: architecture, backend, frontend, infrastructure, security, " +
        "observability, and coordinating the work.",
      "I say principal contributor rather than sole author deliberately. The public " +
        "repositories are a snapshot published as portfolio evidence — they are not a commit " +
        "history that proves who wrote which line, and I would not present them as one.",
    ],
  } satisfies CaseStudySection,

  approach: {
    heading: "The approach",
    body: [
      "Rather than refactor inside the monolith, we separated it into a Laravel REST API and a " +
        "Next.js, React and TypeScript frontend. The decisive reason was not modernity: it was " +
        "that a single API contract let us make the multi-institution model configuration " +
        "rather than code, and gave concurrency a single place to be correct.",
      "Performance work was concentrated where exams actually touch the system — question " +
        "retrieval, session state, result submission. SQL tuning and index design came first, " +
        "Redis caching second, and anything that did not need to happen during the request, " +
        "such as generating result reports, was pushed onto a queue.",
    ],
  } satisfies CaseStudySection,

  architecture: [
    {
      layer: "Client",
      detail: "Next.js, React and TypeScript, serving administrators, evaluators and students.",
    },
    { layer: "API", detail: "A Laravel REST API as the single contract for every client." },
    { layer: "Data", detail: "MySQL, with index design and query tuning on the exam paths." },
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
        "Students are pseudonymous to evaluators — the mapping exists, it is simply not theirs " +
          "to see. That is enforced in the data model and the API rather than hidden in the " +
          "interface, because a privacy rule implemented in a view is a privacy rule that leaks " +
          "the first time someone adds an endpoint.",
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
        "Role-based access control is enforced in the API and reflected in the frontend. The " +
          "frontend copy exists for usability; the API copy is the one that is actually load " +
          "bearing.",
      ],
    },
    {
      heading: "Monitoring before it was needed",
      body: [
        "Prometheus and Grafana went in alongside the rebuild rather than after the first " +
          "incident, covering the database, Redis, queues and workers, with structured logging " +
          "and health checks.",
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
    heading: "How we worked",
    body: [
      "Agile practices with Trello, from requirements through to production. Three people, an " +
        "academic deadline, and real institutions already depending on the previous version — " +
        "so the work was ordered by what would break first, not by what was most interesting.",
      "Deployments ran on Docker images built through GitHub Actions, observed at under fifteen " +
        "minutes end to end. The public repositories are published snapshots and do not include " +
        "that pipeline configuration.",
    ],
  } satisfies CaseStudySection,

  outcomes: {
    heading: "Where it stands",
    body: [
      "Filomena is active at five Argentine national institutions: UNS, UNRN, UNC, UNVM and " +
        "FAMFyG. It handled 1,000+ simultaneous users in production with complete data " +
        "consistency, and kept critical endpoints below 300 ms on average.",
      "These figures come from deployed operation, not from a benchmark harness in the " +
        "repository. The project was graded 10/10 as a final year project at Universidad " +
        "Nacional del Sur, and received interviews, university coverage and mentions from " +
        "academic authorities — editorial recognition rather than a formally named award.",
    ],
  } satisfies CaseStudySection,

  lessons: {
    heading: "What I would do differently",
    body: [
      "The test suite is the honest weak point. We validated behaviour through deployed " +
        "operation and load validation, and the public snapshots ship framework smoke tests " +
        "rather than a real suite. On a system where a defect interrupts an exam in progress, " +
        "the concurrency and permission paths deserved automated coverage, and building it " +
        "under an academic deadline was the wrong tradeoff to make twice.",
      "I would also have written down the measurement conditions at the time. The performance " +
        "numbers are real, but reconstructing exactly how each was observed, months later, is " +
        "harder than it should have been — and a figure you cannot qualify is a figure you " +
        "should be careful about repeating.",
    ],
  } satisfies CaseStudySection,
};

export const filomenaEvidence: EvidenceLink[] = filomena.links;

export const filomenaHighlights: Metric[] = filomena.metrics;
