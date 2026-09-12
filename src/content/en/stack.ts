import type { StackGroup } from "../types";

/**
 * Grouped by capability rather than by language, and every group states where it was used.
 * Names are text: no vendor logo is redistributed, and several brand policies restrict
 * third-party logo use on personal sites.
 */
export const stackGroups: StackGroup[] = [
  {
    id: "applied-ai",
    name: "Applied AI & agentic systems",
    evidence:
      "An in-product RAG assistant for merchant owners at Payway scale, MCP and LLM pipelines for independent clients, and agentic engineering workspaces at Rampy, Teamcubation and Cooperativa Obrera.",
    items: [
      "AI agents",
      "RAG",
      "LangChain",
      "LangGraph",
      "Model Context Protocol",
      "LLM integration",
      "Vector databases",
      "pgvector",
      "Guardrails",
      "Claude API",
      "Spec-driven development",
    ],
  },
  {
    id: "backend",
    name: "Backend & APIs",
    evidence:
      "Microservices and BFFs in production at Payway and Cooperativa Obrera, and the REST API behind Filomena.",
    items: [
      "Spring Boot",
      "FastAPI",
      "NestJS",
      "Spring WebFlux",
      "Spring MVC",
      "Spring Security",
      "Spring Data JPA",
      "Laravel",
      "REST APIs",
      "Microservices",
      "API design",
    ],
  },
  {
    id: "languages",
    name: "Languages & runtimes",
    evidence: "Used across every role listed on this site.",
    items: ["Python", "TypeScript", "Java", "JavaScript", "Node.js", "SQL", "PHP"],
  },
  {
    id: "frontend",
    name: "Frontend & product interfaces",
    evidence:
      "A microfrontend embedded in the Payway merchant portal, the SGA back office, and the Filomena application.",
    items: ["React", "Next.js", "Single-SPA", "Microfrontends", "Responsive design", "WordPress"],
  },
  {
    id: "data",
    name: "Data & architecture",
    evidence:
      "Event-driven ingestion at fintech scale, hexagonal and layered services, and query tuning on exam and permission paths.",
    items: [
      "PostgreSQL",
      "MySQL",
      "Redis",
      "System design",
      "Distributed systems",
      "Hexagonal architecture",
      "Layered architecture",
      "Event-driven architecture",
      "SQL tuning",
      "Indexing",
      "Caching",
      "Data modelling",
    ],
  },
  {
    id: "cloud",
    name: "Cloud & delivery",
    evidence:
      "Application development on AWS managed services, and containerised workloads I built, configured and diagnosed as a developer — not cluster administration or infrastructure ownership.",
    items: [
      "AWS Lambda",
      "Amazon API Gateway",
      "Amazon S3",
      "Amazon SQS",
      "Amazon CloudWatch",
      "Serverless",
      "Docker",
      "Kubernetes",
      "GitLab CI/CD",
      "GitHub Actions",
      "Git",
      "Linux",
    ],
  },
  {
    id: "quality",
    name: "Quality, observability & security",
    evidence:
      "Monitoring and access control in production on SGA and Filomena, and test tooling across JVM and JavaScript services.",
    items: [
      "JUnit",
      "Mockito",
      "Jest",
      "React Testing Library",
      "Testcontainers",
      "SonarQube",
      "OpenTelemetry",
      "Prometheus",
      "Grafana",
      "Structured logging",
      "RBAC",
      "LDAP",
      "Application security",
    ],
  },
  {
    id: "delivery",
    name: "Delivery & collaboration",
    evidence: "Agile practice in every role, with the tooling each organisation used.",
    items: ["Agile", "Scrum", "Kanban", "Jira", "Trello", "Code review", "Technical documentation"],
  },
  {
    id: "fintech",
    name: "Fintech & blockchain",
    evidence:
      "Production fintech experience at Payway, plus blockchain knowledge in consolidation. Listed as complementary knowledge, not as a primary specialisation.",
    items: [
      "Fintech",
      "Blockchain",
      "Web3",
      "Account abstraction",
      "Smart accounts",
      "DeFi",
      "ERC-20",
      "ERC-4337",
    ],
  },
];

/** The subset shown on the homepage. Full coverage lives on the stack page. */
export const featuredStackIds = ["applied-ai", "backend", "data", "cloud"];
