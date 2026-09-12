import type { Locale } from "./locales";
import type { StackGroup } from "./types";

export type Technology = {
  id: string;
  name: string;
  category: string;
  kind: "brand" | "concept";
  status: "applied" | "developing";
  evidence: { label: string; href: string }[];
  icon?: string;
  aliases?: string[];
};

export const technologyCatalog: Technology[] = [
  {
    id: "ai-agents",
    name: "AI agents",
    category: "applied-ai",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "rag",
    name: "RAG",
    category: "applied-ai",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
  },
  {
    id: "langchain",
    name: "LangChain",
    category: "applied-ai",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
    icon: "langchain",
  },
  {
    id: "langgraph",
    name: "LangGraph",
    category: "applied-ai",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
    icon: "langgraph",
  },
  {
    id: "model-context-protocol",
    name: "Model Context Protocol",
    aliases: ["MCP"],
    category: "applied-ai",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Independent work",
        href: "/work#independent",
      },
    ],
    icon: "modelcontextprotocol",
  },
  {
    id: "llm-integration",
    name: "LLM integration",
    category: "applied-ai",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "vector-databases",
    name: "Vector databases",
    category: "applied-ai",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "pgvector",
    name: "pgvector",
    category: "applied-ai",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
  },
  {
    id: "guardrails",
    name: "Guardrails",
    category: "applied-ai",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "claude-api",
    name: "Claude API",
    category: "applied-ai",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Independent work",
        href: "/work#independent",
      },
    ],
    icon: "anthropic",
  },
  {
    id: "spec-driven-development",
    name: "Spec-driven development",
    category: "applied-ai",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Independent work",
        href: "/work#independent",
      },
    ],
  },
  {
    id: "agentic-engineering",
    name: "Agentic engineering",
    category: "applied-ai",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "spring-boot",
    name: "Spring Boot",
    category: "backend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "springboot",
  },
  {
    id: "fastapi",
    name: "FastAPI",
    category: "backend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "fastapi",
  },
  {
    id: "nestjs",
    name: "NestJS",
    category: "backend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "nestjs",
  },
  {
    id: "spring-webflux",
    name: "Spring WebFlux",
    category: "backend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
    icon: "spring",
  },
  {
    id: "spring-mvc",
    name: "Spring MVC",
    category: "backend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "spring",
  },
  {
    id: "spring-security",
    name: "Spring Security",
    category: "backend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "spring",
  },
  {
    id: "spring-data-jpa",
    name: "Spring Data JPA",
    category: "backend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "spring",
  },
  {
    id: "hibernate",
    name: "Hibernate",
    category: "backend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "hibernate",
  },
  {
    id: "laravel",
    name: "Laravel",
    category: "backend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Filomena",
        href: "/work/filomena",
      },
    ],
    icon: "laravel",
  },
  {
    id: "rest-apis",
    name: "REST APIs",
    category: "backend",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "microservices",
    name: "Microservices",
    category: "backend",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "api-design",
    name: "API design",
    category: "backend",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "openapi",
    name: "OpenAPI",
    category: "backend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "openapi",
  },
  {
    id: "python",
    name: "Python",
    category: "languages",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "python",
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "languages",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "typescript",
  },
  {
    id: "java",
    name: "Java",
    category: "languages",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "openjdk",
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "languages",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "javascript",
  },
  {
    id: "nodejs",
    name: "Node.js",
    category: "languages",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "nodedotjs",
  },
  {
    id: "sql",
    name: "SQL",
    category: "languages",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "php",
    name: "PHP",
    category: "languages",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "php",
  },
  {
    id: "react",
    name: "React",
    category: "frontend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "react",
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "frontend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "nextdotjs",
  },
  {
    id: "single-spa",
    name: "Single-SPA",
    category: "frontend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
  },
  {
    id: "microfrontends",
    name: "Microfrontends",
    category: "frontend",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "responsive-design",
    name: "Responsive design",
    category: "frontend",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "wordpress",
    name: "WordPress",
    category: "frontend",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Independent work",
        href: "/work#independent",
      },
    ],
    icon: "wordpress",
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "data",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
    icon: "postgresql",
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "data",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Filomena",
        href: "/work/filomena",
      },
    ],
    icon: "mysql",
  },
  {
    id: "mariadb",
    name: "MariaDB",
    category: "data",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "mariadb",
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "data",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "mongodb",
  },
  {
    id: "redis",
    name: "Redis",
    category: "data",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Filomena",
        href: "/work/filomena",
      },
    ],
    icon: "redis",
  },
  {
    id: "system-design",
    name: "System design",
    category: "data",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "distributed-systems",
    name: "Distributed systems",
    category: "data",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "hexagonal-architecture",
    name: "Hexagonal architecture",
    category: "data",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "layered-architecture",
    name: "Layered architecture",
    category: "data",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "mvc",
    name: "MVC",
    category: "data",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "event-driven-architecture",
    name: "Event-driven architecture",
    category: "data",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "reactive-systems",
    name: "Reactive systems",
    category: "data",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "sql-tuning",
    name: "SQL tuning",
    category: "data",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "indexing",
    name: "Indexing",
    category: "data",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "caching",
    name: "Caching",
    category: "data",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "data-modelling",
    name: "Data modelling",
    category: "data",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "aws",
    name: "AWS",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
    icon: "amazonwebservices",
  },
  {
    id: "aws-lambda",
    name: "AWS Lambda",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
    icon: "awslambda",
  },
  {
    id: "amazon-api-gateway",
    name: "Amazon API Gateway",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
  },
  {
    id: "amazon-s3",
    name: "Amazon S3",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
    icon: "amazons3",
  },
  {
    id: "amazon-sqs",
    name: "Amazon SQS",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
  },
  {
    id: "amazon-cloudwatch",
    name: "Amazon CloudWatch",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
  },
  {
    id: "serverless",
    name: "Serverless",
    category: "cloud",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "docker",
    name: "Docker",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "docker",
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "kubernetes",
  },
  {
    id: "helm",
    name: "Helm",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "helm",
  },
  {
    id: "gitlab-ci-cd",
    name: "GitLab CI/CD",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "gitlab",
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Filomena",
        href: "/work/filomena",
      },
    ],
    icon: "githubactions",
  },
  {
    id: "git",
    name: "Git",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "git",
  },
  {
    id: "maven",
    name: "Maven",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "apachemaven",
  },
  {
    id: "linux",
    name: "Linux",
    category: "cloud",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "linux",
  },
  {
    id: "junit",
    name: "JUnit",
    category: "quality",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "junit",
  },
  {
    id: "mockito",
    name: "Mockito",
    category: "quality",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "karate",
    name: "Karate",
    category: "quality",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "jest",
    name: "Jest",
    category: "quality",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "jest",
  },
  {
    id: "react-testing-library",
    name: "React Testing Library",
    category: "quality",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "testinglibrary",
  },
  {
    id: "testcontainers",
    name: "Testcontainers",
    category: "quality",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "sonarqube",
    name: "SonarQube",
    category: "quality",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "sonarqube",
  },
  {
    id: "opentelemetry",
    name: "OpenTelemetry",
    category: "quality",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
    icon: "opentelemetry",
  },
  {
    id: "micrometer",
    name: "Micrometer",
    category: "quality",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
  },
  {
    id: "prometheus",
    name: "Prometheus",
    category: "quality",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "prometheus",
  },
  {
    id: "grafana",
    name: "Grafana",
    category: "quality",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "grafana",
  },
  {
    id: "structured-logging",
    name: "Structured logging",
    category: "quality",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "rbac",
    name: "RBAC",
    category: "quality",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "ldap",
    name: "LDAP",
    category: "quality",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Cooperativa Obrera",
        href: "/work#cooperativa-obrera",
      },
    ],
  },
  {
    id: "application-security",
    name: "Application security",
    category: "quality",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "agile",
    name: "Agile",
    category: "delivery",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "scrum",
    name: "Scrum",
    category: "delivery",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "kanban",
    name: "Kanban",
    category: "delivery",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "jira",
    name: "Jira",
    category: "delivery",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
    icon: "jira",
  },
  {
    id: "trello",
    name: "Trello",
    category: "delivery",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Filomena",
        href: "/work/filomena",
      },
    ],
    icon: "trello",
  },
  {
    id: "code-review",
    name: "Code review",
    category: "delivery",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "technical-documentation",
    name: "Technical documentation",
    category: "delivery",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    category: "delivery",
    kind: "brand",
    icon: "slack",
    status: "applied",
    evidence: [
      {
        label: "Rampy",
        href: "/work#rampy",
      },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    category: "delivery",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
    icon: "discord",
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    category: "delivery",
    kind: "brand",
    status: "applied",
    evidence: [
      {
        label: "Teamcubation",
        href: "/work#teamcubation",
      },
    ],
  },
  {
    id: "fintech",
    name: "Fintech",
    category: "fintech",
    kind: "concept",
    status: "applied",
    evidence: [
      {
        label: "Experience & projects",
        href: "/work",
      },
    ],
  },
  {
    id: "blockchain",
    name: "Blockchain",
    category: "fintech",
    kind: "concept",
    status: "developing",
    evidence: [
      {
        label: "Professional focus",
        href: "/about",
      },
    ],
  },
  {
    id: "web3",
    name: "Web3",
    category: "fintech",
    kind: "concept",
    status: "developing",
    evidence: [
      {
        label: "Professional focus",
        href: "/about",
      },
    ],
  },
  {
    id: "account-abstraction",
    name: "Account abstraction",
    category: "fintech",
    kind: "concept",
    status: "developing",
    evidence: [
      {
        label: "Professional focus",
        href: "/about",
      },
    ],
  },
  {
    id: "smart-accounts",
    name: "Smart accounts",
    category: "fintech",
    kind: "concept",
    status: "developing",
    evidence: [
      {
        label: "Professional focus",
        href: "/about",
      },
    ],
  },
  {
    id: "defi",
    name: "DeFi",
    category: "fintech",
    kind: "concept",
    status: "developing",
    evidence: [
      {
        label: "Professional focus",
        href: "/about",
      },
    ],
  },
  {
    id: "erc-20",
    name: "ERC-20",
    category: "fintech",
    kind: "concept",
    status: "developing",
    evidence: [
      {
        label: "Professional focus",
        href: "/about",
      },
    ],
  },
  {
    id: "erc-4337",
    name: "ERC-4337",
    category: "fintech",
    kind: "concept",
    status: "developing",
    evidence: [
      {
        label: "Professional focus",
        href: "/about",
      },
    ],
  },
  {
    id: "erc-4626",
    name: "ERC-4626",
    category: "fintech",
    kind: "concept",
    status: "developing",
    evidence: [
      {
        label: "Professional focus",
        href: "/about",
      },
    ],
  },
  {
    id: "eip-712",
    name: "EIP-712",
    category: "fintech",
    kind: "concept",
    status: "developing",
    evidence: [
      {
        label: "Professional focus",
        href: "/about",
      },
    ],
  },
];

export const technologyGroups = [
  {
    id: "applied-ai",
    name: {
      en: "Applied AI & agentic systems",
      es: "IA aplicada y sistemas agénticos",
    },
    evidence: {
      en: "RAG for merchant queries, agent pipelines for clients, and context-aware engineering workflows.",
      es: "RAG para consultas de comercios, agentes para clientes y entornos de ingeniería con contexto.",
    },
  },
  {
    id: "backend",
    name: {
      en: "Backend & APIs",
      es: "Backend y APIs",
    },
    evidence: {
      en: "Service contracts, BFFs and integrations across fintech, enterprise systems and Filomena.",
      es: "Contratos, BFFs e integraciones en fintech, sistemas empresariales y Filomena.",
    },
  },
  {
    id: "languages",
    name: {
      en: "Languages & runtimes",
      es: "Lenguajes y runtimes",
    },
    evidence: {
      en: "The foundations of my backend services, product interfaces and automation.",
      es: "La base de mis servicios, interfaces de producto y automatizaciones.",
    },
  },
  {
    id: "frontend",
    name: {
      en: "Frontend & product interfaces",
      es: "Frontend e interfaces de producto",
    },
    evidence: {
      en: "Merchant experiences, enterprise back offices and an institutional exam platform.",
      es: "Experiencias para comercios, backoffices empresariales y una plataforma de exámenes.",
    },
  },
  {
    id: "data",
    name: {
      en: "Data & architecture",
      es: "Datos y arquitectura",
    },
    evidence: {
      en: "Historical ingestion, permission queries and concurrent exams shaped these choices.",
      es: "Ingesta histórica, consultas de permisos y exámenes concurrentes guiaron estas decisiones.",
    },
  },
  {
    id: "cloud",
    name: {
      en: "Cloud & delivery",
      es: "Cloud y delivery",
    },
    evidence: {
      en: "Application integration on AWS; containerised service development, configuration and diagnostics.",
      es: "Integración de aplicaciones en AWS; desarrollo, configuración y diagnóstico de servicios contenerizados.",
    },
  },
  {
    id: "quality",
    name: {
      en: "Quality, observability & security",
      es: "Calidad, observabilidad y seguridad",
    },
    evidence: {
      en: "Testing, monitoring and access control for production applications.",
      es: "Pruebas, monitoreo y control de acceso para aplicaciones productivas.",
    },
  },
  {
    id: "delivery",
    name: {
      en: "Delivery & collaboration",
      es: "Delivery y colaboración",
    },
    evidence: {
      en: "Iterative delivery, shared technical decisions and clear documentation.",
      es: "Entrega iterativa, decisiones técnicas compartidas y documentación clara.",
    },
  },
  {
    id: "fintech",
    name: {
      en: "Fintech & blockchain",
      es: "Fintech y blockchain",
    },
    evidence: {
      en: "Production fintech experience, with blockchain concepts currently in development.",
      es: "Experiencia fintech productiva y conceptos de blockchain en consolidación.",
    },
  },
];

const aliases: Record<string, string> = {
  mcp: "model-context-protocol",
  "model context protocol (mcp)": "model-context-protocol",
  lambda: "aws-lambda",
  s3: "amazon-s3",
  sqs: "amazon-sqs",
  cloudwatch: "amazon-cloudwatch",
  spring: "spring-boot",
  "applied ai": "ai-agents",
  "agentic systems": "agentic-engineering",
  "ia aplicada": "ai-agents",
  "sistemas agénticos": "agentic-engineering",
  "sql (tuning, indexes, pagination)": "sql-tuning",
};

export function getTechnology(nameOrId: string) {
  const key = nameOrId.trim().toLowerCase();
  return technologyCatalog.find(
    (technology) =>
      technology.id === (aliases[key] ?? key) || technology.name.toLowerCase() === key,
  );
}

export function technologyNames(names: string[]) {
  return names.map((name) => getTechnology(name)?.name ?? name);
}

export function getStackGroups(locale: Locale): StackGroup[] {
  return technologyGroups.map((group) => ({
    id: group.id,
    name: group.name[locale],
    evidence: group.evidence[locale],
    items: technologyCatalog
      .filter((technology) => technology.category === group.id)
      .map((technology) => technology.name),
  }));
}
