import { technologyNames } from "../technologies";
import type { Role } from "../types";

export const roles: Role[] = [
  {
    slug: "rampy",
    company: "Rampy",
    companyHref: "https://www.getrampy.com/",
    position: "AI Engineer",
    period: "Sep 2026 – Actualidad",
    startedOn: "2026-09-01",
    location: "Argentina",
    arrangement: "Remote",
    context: "AI engineering en un contexto fintech.",
    contributions: [
      "Configuré un entorno agéntico de ingeniería que preserva el contexto y habilita trabajo paralelo coordinado.",
    ],
    attribution: "Ingeniería agéntica y trabajo paralelo coordinado.",
    stack: technologyNames(["Applied AI", "Agentic systems"]),
  },
  {
    slug: "teamcubation",
    company: "Teamcubation",
    companyHref: "https://teamcubation.com/",
    position: "Software Engineer",
    period: "Dic 2025 – Ago 2026",
    startedOn: "2025-12-01",
    location: "Argentina",
    arrangement: "Remote",
    context:
      "La plataforma de promociones de Payway, una fintech líder en América Latina, al servicio " +
      "de un ecosistema de 350.000+ comercios, 70+ emisores de tarjetas y 13 países.",
    contributions: [
      "Entregué la experiencia de promociones de punta a punta: un microfrontend React y TypeScript con Single-SPA embebido como sección nativa del portal de comercios, conectado mediante un BFF Spring WebFlux a múltiples microservicios y proveedores.",
      "Diseñé un asistente RAG y agéntico integrado al producto para dueños de comercios con Python, LangChain, LangGraph, PostgreSQL/pgvector y guardrails, recuperando las promociones bancarias asociadas a cada comercio para fundamentar las respuestas del modelo.",
      "Integré el portal HTTPS de comercios con los servicios HTTP internos de la empresa mediante Amazon API Gateway.",
      "Construí microservicios en Java/Spring Boot y TypeScript/Node.js/NestJS para ingerir, normalizar y procesar promociones de comercios, entidades financieras y proveedores, adaptando los contratos según cada integración.",
      "Implementé un flujo event-driven y serverless con Amazon S3, SQS y una Lambda en Python/FastAPI con estrategias de procesamiento ordenado.",
      "Construí un entorno agéntico de ingeniería adaptado al proyecto para preservar contexto entre repositorios de integración y mantener consistencia en la entrega de funcionalidades.",
      "Apliqué arquitectura hexagonal en microservicios específicos y arquitectura en capas en otros componentes.",
      "Construí tooling en Python y Node.js para reejecutar cargas masivas de forma segura contra bases de datos locales aisladas, reconciliar resultados y exponer promociones fallidas y casos borde antes de cada release.",
    ],
    attribution:
      "Contribuidor clave de ingeniería, con responsabilidad sustancial sobre componentes dentro del equipo. Desarrollo, configuración, observabilidad y diagnóstico de aplicaciones en Docker y Kubernetes.",
    stack: technologyNames([
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
    ]),
    metrics: [
      {
        value: "20M+",
        label: "promociones cargadas",
        qualifier:
          "La carga histórica completa, ejecutada en producción, seguida de miles de promociones nuevas por día.",
      },
      {
        value: "~90.000/s",
        label: "velocidad de procesamiento",
        qualifier:
          "Medido durante la ejecución productiva con datos reales sobre la carga completa de 20M+.",
      },
      {
        value: "Cero",
        label: "pérdida de datos",
        qualifier: "Validado sobre esa misma carga productiva completa.",
      },
    ],
  },
  {
    slug: "independent",
    company: "Independiente",
    position: "AI Engineer & Full-Stack Developer",
    period: "Ene 2024 – Actualidad",
    startedOn: "2024-01-01",
    location: "Argentina",
    arrangement: "Remote",
    context:
      "Desarrollo independiente de productos mediante proyectos ocasionales para clientes de comercio electrónico, redes sociales y productos digitales.",
    contributions: [
      "Diseñé y entregué productos digitales, backoffices y extensiones de stock y punto de venta, conectando necesidades comerciales con sistemas mantenibles.",
      "Construí pipelines y agentes con MCP, Claude y otros LLMs que investigan, generan y publican contenido de punta a punta.",
      "Desarrollé tiendas online, soluciones WordPress, APIs e integraciones full-stack a medida, con tooling en Python y Node.js para automatización, carga masiva y análisis de datos bajo spec-driven development.",
    ],
    attribution: "Entrega independiente de proyectos para clientes.",
    stack: technologyNames([
      "Python",
      "Node.js",
      "TypeScript",
      "Claude API",
      "Model Context Protocol",
      "REST APIs",
      "WordPress",
    ]),
    metrics: [
      {
        value: "USD 10.000+",
        label: "ganancias acumuladas para clientes",
        qualifier:
          "Ganancias generadas para los clientes por los productos entregados — no ingresos propios.",
      },
      {
        value: "≥70%",
        label: "reducción de costos operativos",
        qualifier: "Estimado por los propios clientes. No es una medición financiera auditada.",
      },
    ],
  },
  {
    slug: "cooperativa-obrera",
    company: "Cooperativa Obrera",
    companyHref: "https://www.cooperativaobrera.coop/",
    position: "Software Engineer",
    period: "Dic 2024 – Dic 2025",
    startedOn: "2024-12-01",
    location: "Bahía Blanca, Argentina",
    arrangement: "On-site",
    context:
      "SGA, un backoffice empresarial seguro para administrar información sensible, permisos y " +
      "auditoría en la mayor cooperativa de consumo de Argentina: 150+ sucursales, 2,7M+ " +
      "asociados y un ecosistema de 50+ sistemas internos.",
    contributions: [
      "Tuve un rol principal de diseño, arquitectura e implementación, con alcance de product engineering.",
      "Construí un frontend responsive en Next.js y TypeScript cuya única interfaz era un BFF en Python/FastAPI, que definía el contrato común y desacoplaba la experiencia web de cada servicio downstream.",
      "Integré personalmente los 10+ sistemas alcanzados por SGA mediante microservicios Java/Spring Boot o TypeScript/Node.js/NestJS, cada uno adherido a ese contrato y encapsulando su propia lógica interna; las aplicaciones PHP heredadas se incorporaron mediante integraciones dedicadas.",
      "Construí un entorno agéntico personal de ingeniería cross-system para preservar contexto y trabajar en paralelo entre repositorios de integración independientes.",
      "Estandaricé el onboarding de nuevos sistemas con estructuras y filtros reutilizables.",
      "Automaticé cargas masivas y validación de datos con Python, e implementé autenticación LDAP y un registro de auditoría completo con reportes exportables.",
    ],
    attribution:
      "Responsabilidad principal de diseño e implementación en las integraciones entregadas para SGA.",
    stack: technologyNames([
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
    ]),
    metrics: [
      {
        value: "10+",
        label: "sistemas integrados",
        qualifier:
          "Todos los sistemas alcanzados por SGA, integrados personalmente, dentro de un ecosistema de 50+.",
      },
      {
        value: "≥80%",
        label: "menos tickets de permisos",
        qualifier:
          "Comparado con tickets y logs antes y después del onboarding estandarizado; ≥95% de los bugs recurrentes de asignación eliminados.",
      },
      {
        value: "10 min → <10 s",
        label: "búsqueda de permisos",
        qualifier:
          "Mediante SQL tuning, índices y paginación. Los endpoints críticos se mantuvieron por debajo de 300 ms en promedio en pruebas calificadas y repetibles sobre servidores empresariales on-premise.",
      },
    ],
  },
];
