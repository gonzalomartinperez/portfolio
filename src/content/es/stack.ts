import type { StackGroup } from "../types";

/**
 * Agrupado por capacidad y no por lenguaje, y cada grupo indica dónde se usó. Los nombres son
 * texto: no se redistribuye ningún logo de proveedor, y varias políticas de marca restringen el
 * uso de logos de terceros en sitios personales.
 */
export const stackGroups: StackGroup[] = [
  {
    id: "applied-ai",
    name: "IA aplicada y sistemas agénticos",
    evidence:
      "Un asistente RAG integrado al producto para dueños de comercios a escala Payway, pipelines MCP y LLM para clientes independientes, y entornos agénticos de ingeniería en Rampy, Teamcubation y Cooperativa Obrera.",
    items: [
      "Agentes de IA",
      "RAG",
      "LangChain",
      "LangGraph",
      "Model Context Protocol",
      "Integración de LLMs",
      "Bases de datos vectoriales",
      "pgvector",
      "Guardrails",
      "Claude API",
      "Spec-driven development",
    ],
  },
  {
    id: "backend",
    name: "Backend y APIs",
    evidence:
      "Microservicios y BFFs en producción en Payway y Cooperativa Obrera, y la API REST detrás de Filomena.",
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
      "Microservicios",
      "Diseño de APIs",
    ],
  },
  {
    id: "languages",
    name: "Lenguajes y runtimes",
    evidence: "Usados en todos los roles listados en este sitio.",
    items: ["Python", "TypeScript", "Java", "JavaScript", "Node.js", "SQL", "PHP"],
  },
  {
    id: "frontend",
    name: "Frontend e interfaces de producto",
    evidence:
      "Un microfrontend embebido en el portal de comercios de Payway, el backoffice SGA y la aplicación Filomena.",
    items: ["React", "Next.js", "Single-SPA", "Microfrontends", "Diseño responsive", "WordPress"],
  },
  {
    id: "data",
    name: "Datos y arquitectura",
    evidence:
      "Ingesta event-driven a escala fintech, servicios hexagonales y en capas, y tuning de consultas en los caminos de examen y de permisos.",
    items: [
      "PostgreSQL",
      "MySQL",
      "Redis",
      "System design",
      "Sistemas distribuidos",
      "Arquitectura hexagonal",
      "Arquitectura en capas",
      "Arquitectura event-driven",
      "SQL tuning",
      "Indexación",
      "Caché",
      "Modelado de datos",
    ],
  },
  {
    id: "cloud",
    name: "Cloud y delivery",
    evidence:
      "Desarrollo de aplicaciones sobre servicios gestionados de AWS, y workloads contenerizados que construí, configuré y diagnostiqué como desarrollador — no administración de clústeres ni responsabilidad sobre la infraestructura.",
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
    name: "Calidad, observabilidad y seguridad",
    evidence:
      "Monitoreo y control de acceso en producción en SGA y Filomena, y tooling de tests en servicios JVM y JavaScript.",
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
      "Logging estructurado",
      "RBAC",
      "LDAP",
      "Seguridad de aplicaciones",
    ],
  },
  {
    id: "delivery",
    name: "Delivery y colaboración",
    evidence: "Práctica ágil en cada rol, con las herramientas que usaba cada organización.",
    items: ["Agile", "Scrum", "Kanban", "Jira", "Trello", "Code review", "Documentación técnica"],
  },
  {
    id: "fintech",
    name: "Fintech y blockchain",
    evidence:
      "Experiencia fintech productiva en Payway, más conocimiento de blockchain en consolidación. Listado como conocimiento complementario, no como especialización principal.",
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

/** El subconjunto que se muestra en la portada. La cobertura completa vive en la página de stack. */
export const featuredStackIds = ["applied-ai", "backend", "data", "cloud"];
