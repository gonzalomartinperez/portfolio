import { technologyNames } from "../technologies";
import type { EvidenceLink, Metric, Project } from "../types";

export const filomena: Project = {
  slug: "filomena",
  name: "Filomena",
  tagline: "Exámenes de ciencias de la salud en cinco instituciones",
  period: "Ene – Dic 2025",
  summary:
    "Un monolito heredado en CakePHP y jQuery, reconstruido como una plataforma API-first que " +
    "hoy ejecuta exámenes de alta exigencia en cinco instituciones nacionales argentinas.",
  attribution:
    "Desarrollada por un equipo de tres personas. Fui el autor y contribuidor principal en " +
    "arquitectura, backend, frontend, infraestructura, seguridad, observabilidad y " +
    "coordinación. La plataforma es un logro del equipo.",
  metrics: [
    {
      value: "5",
      label: "instituciones en producción",
      qualifier: "UNS, UNRN, UNC, UNVM y FAMFyG.",
    },
    {
      value: "1.000+",
      label: "usuarios simultáneos",
      qualifier:
        "Observados en producción con consistencia completa de datos, no en un benchmark sintético.",
    },
    {
      value: "<300 ms",
      label: "endpoints críticos",
      qualifier: "Latencia promedio, mediante SQL tuning, caché Redis y colas.",
    },
    {
      value: "10 / 10",
      label: "proyecto final",
      qualifier: "Calificado en la Universidad Nacional del Sur.",
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
      label: "Contexto académico",
      href: "/es/education",
      description: "Carrera, proyecto final y registro académico",
    },
    {
      label: "Código del backend",
      href: "https://github.com/gonzalomartinperez/filomena-backend",
      description: "API REST en Laravel, en GitHub",
    },
    {
      label: "Código del frontend",
      href: "https://github.com/gonzalomartinperez/filomena-frontend",
      description: "Aplicación Next.js en GitHub",
    },
  ],
};

/**
 * Proyecto open source. Los datos provienen del brief aprobado y del repositorio público; está
 * implementado y evaluado, pero no desplegado, así que no se publican cifras de uso.
 */
export const portfolioAssistant: Project = {
  slug: "portfolio-assistant",
  name: "Portfolio Assistant",
  tagline: "Asistente RAG bilingüe con un banco de 1.000 preguntas de evaluación",
  period: "Sep 2026 – Actualidad",
  summary:
    "Asistente open source en FastAPI y LangGraph que responde preguntas de recruiters sobre mi " +
    "trabajo, con recuperación híbrida léxica y vectorial más GraphRAG (pgvector, Neo4j), " +
    "respuestas con fuentes transmitidas por SSE y límites de costo por solicitud.",
  attribution: "Proyecto personal open source. Implementado y evaluado; todavía sin desplegar.",
  metrics: [
    {
      value: "1.000",
      label: "preguntas de evaluación bilingües",
      qualifier:
        "100 familias de intención en inglés y español, ejecutadas con un modelo de prueba, más casos adversariales.",
    },
    {
      value: "800+",
      label: "tests automatizados",
      qualifier: "Se ejecutan en la CI de GitHub Actions.",
    },
    {
      value: "244",
      label: "turnos con el modelo real",
      qualifier: "Una ejecución de evaluación con un modelo real de OpenAI.",
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
      label: "Código en GitHub",
      href: "https://github.com/gonzalomartinperez/portfolio-assistant-api",
      description: "Backend en FastAPI y LangGraph en GitHub",
    },
  ],
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
  title: "Filomena: exámenes de ciencias de la salud en cinco instituciones",

  overview: {
    heading: "Una plataforma para todo el ciclo de evaluación",
    body: [
      "Filomena permite preparar, programar, tomar y corregir exámenes en instituciones de ciencias de la salud. Los administradores configuran los exámenes y el acceso, los estudiantes resuelven casos clínicos y los evaluadores corrigen las respuestas con rúbricas estructuradas.",
      "El producto reúne esos flujos, separa los datos de cada institución y protege la identidad del estudiante durante la corrección. La demostración de 43 pantallas recorre las tareas de cada rol dentro de la aplicación.",
    ],
  } satisfies CaseStudySection,

  problem: {
    heading: "El problema",
    body: [
      "Las carreras de ciencias de la salud evalúan a sus estudiantes con exámenes escritos " +
        "masivos y de alta exigencia. La primera versión de Filomena era un monolito CakePHP y " +
        "jQuery construido para una sola institución. Su rendimiento " +
        "se degradaba bajo carga concurrente, la toma de exámenes era secuencial, el control de " +
        "acceso se aplicaba de forma inconsistente y sumar una institución implicaba escribir " +
        "código.",
      "La plataforma original carecía de monitoreo proactivo. La reconstrucción incorporó visibilidad sobre el rendimiento de la aplicación y los servicios que sostienen los exámenes.",
    ],
  } satisfies CaseStudySection,

  audience: {
    heading: "Para quién es",
    body: [
      "Tres roles con necesidades genuinamente distintas. Los administradores configuran " +
        "instituciones, cursos y cronogramas. Los evaluadores redactan preguntas y revisan " +
        "resultados. Los estudiantes rinden los exámenes y deben permanecer anónimos ante el " +
        "evaluador que los califica.",
      "Esos roles no son mutuamente excluyentes. Un profesor puede ser evaluador en un curso y " +
        "administrador en otro, y por eso el manejo de roles tuvo que ser multirol desde el " +
        "principio, en lugar de un único campo en el usuario.",
    ],
  } satisfies CaseStudySection,

  role: {
    heading: "Mi contribución",
    body: [
      "Fui el autor y contribuidor principal de un equipo de tres personas para el proyecto final de la Universidad Nacional del Sur. Mi trabajo abarcó arquitectura, backend, frontend, infraestructura, seguridad, observabilidad y coordinación.",
      "Trabajamos de forma iterativa con prácticas Agile y Trello, conectando los requisitos institucionales con la implementación de un producto funcional.",
    ],
  } satisfies CaseStudySection,

  approach: {
    heading: "De monolito a producto API-first",
    body: [
      "Separamos el monolito CakePHP y jQuery en una API REST Laravel y un frontend Next.js, React y TypeScript. La API estableció un contrato común para la interfaz y los flujos entre instituciones, con validación de entradas y control de acceso por roles. El renderizado del lado del servidor resolvía la carga inicial, seguido por los flujos interactivos de la aplicación.",
      "El tuning SQL, los índices, la caché Redis y las colas sostuvieron los flujos de exámenes concurrentes. Prometheus y Grafana permitieron observar el comportamiento de la aplicación y sus servicios en producción.",
    ],
  } satisfies CaseStudySection,

  architecture: [
    {
      layer: "Cliente",
      detail: "Next.js, React y TypeScript, para administradores, evaluadores y estudiantes.",
    },
    { layer: "API", detail: "Una API REST Laravel como contrato único para cada cliente." },
    {
      layer: "Datos",
      detail:
        "MariaDB fue la elección final de base de datos; también utilizamos MySQL durante el proyecto. El diseño de índices y la optimización de consultas acompañaron los flujos de examen.",
    },
    { layer: "Caché y colas", detail: "Redis para caché y para trabajo asincrónico." },
    {
      layer: "Observabilidad",
      detail: "Prometheus y Grafana sobre la base de datos, las colas y los workers.",
    },
    { layer: "Delivery", detail: "Imágenes Docker construidas y desplegadas con GitHub Actions." },
  ] satisfies ArchitectureStep[],

  decisions: [
    {
      heading: "La seudonimia como propiedad del modelo de datos",
      body: [
        "Los estudiantes son seudónimos para los evaluadores. El modelo de datos y la API aplican esa separación, manteniendo la identidad del estudiante fuera del flujo de corrección del evaluador.",
      ],
    },
    {
      heading: "Aislamiento por institución",
      body: [
        "Cada institución administra sus propios cursos, evaluadores, estudiantes, exámenes y " +
          "cronogramas, con los datos aislados entre sí. Eso fue lo que convirtió el onboarding " +
          "de una institución nueva de trabajo de desarrollo en configuración.",
      ],
    },
    {
      heading: "Verificación de roles en ambos lados",
      body: [
        "La API aplica el control de acceso basado en roles. El frontend refleja esos permisos para mostrar a cada usuario las acciones disponibles.",
      ],
    },
    {
      heading: "Visibilidad sobre producción",
      body: [
        "Prometheus y Grafana brindan visibilidad sobre el comportamiento productivo de la base de datos, Redis, las colas y los workers, con logging estructurado y health checks.",
      ],
    },
  ] satisfies CaseStudySection[],

  changes: [
    {
      aspect: "Arquitectura",
      before: "Monolito CakePHP y jQuery",
      after: "API REST Laravel con un frontend Next.js",
    },
    {
      aspect: "Concurrencia",
      before: "Toma secuencial, una sola institución",
      after: "1.000+ usuarios simultáneos, observados en producción",
    },
    {
      aspect: "Latencia",
      before: "Se degradaba bajo carga concurrente",
      after: "Endpoints críticos por debajo de 300 ms en promedio",
    },
    {
      aspect: "Onboarding",
      before: "Requería trabajo de desarrollo",
      after: "Configuración, en minutos",
    },
    {
      aspect: "Control de acceso",
      before: "Aplicado de forma inconsistente",
      after: "RBAC multirol en API y frontend",
    },
    { aspect: "Observabilidad", before: "Ninguna", after: "Prometheus y Grafana" },
  ] satisfies Change[],

  delivery: {
    heading: "Entrega y operación",
    body: [
      "El equipo de tres personas utilizó prácticas Agile y Trello para coordinar requisitos, implementación y releases.",
      "Docker y Docker Compose proporcionaron entornos contenerizados, mientras que GitHub Actions sostuvo despliegues productivos observados por debajo de quince minutos de punta a punta. Los repositorios públicos son versiones del código y no incluyen el pipeline original de despliegue.",
    ],
  } satisfies CaseStudySection,

  outcomes: {
    heading: "Resultados en producción",
    body: [
      "Filomena está activa en UNS, UNRN, UNC, UNVM y FAMFyG. La operación productiva mostró 1.000+ usuarios simultáneos con consistencia completa de datos y endpoints críticos por debajo de 300 ms en promedio, monitoreados con Prometheus y Grafana.",
      "El proyecto final recibió 10/10 en la Universidad Nacional del Sur, además de entrevistas, cobertura universitaria y menciones de autoridades académicas.",
    ],
  } satisfies CaseStudySection,

  lessons: {
    heading: "Próximas prioridades de ingeniería",
    body: [
      "En una próxima iteración priorizaría la cobertura automatizada de regresión para exámenes concurrentes y límites de permisos. Las versiones públicas contienen actualmente tests de humo del framework.",
      "También conservaría escenarios repetibles de rendimiento junto a cada release para comparar cambios futuros con el comportamiento ya observado en producción.",
    ],
  } satisfies CaseStudySection,
};

export const filomenaEvidence: EvidenceLink[] = filomena.links;

export const filomenaHighlights: Metric[] = filomena.metrics;

/**
 * Proyecto para un cliente. Los hechos provienen del brief aprobado y de los tres repositorios
 * públicos de Pequeverso; no se publican cifras de ingresos, tráfico ni ventas.
 */
export const pequeverso: Project = {
  slug: "pequeverso",
  name: "Pequeverso",
  tagline: "Una tienda de productos digitales con asistente de compras con IA",
  period: "Sep 2026 – Actualidad",
  summary:
    "Una tienda en Next.js de recursos educativos imprimibles, un back office privado y un " +
    "asistente de compras con IA que responde a partir del propio catálogo de la tienda.",
  attribution:
    "Trabajo independiente para un cliente. Desarrollé la tienda, el back office y la API del " +
    "asistente; la marca, los productos y la decisión de lanzar el asistente son del cliente.",
  metrics: [
    {
      value: "3",
      label: "repositorios públicos",
      qualifier: "Tienda, back office y API del asistente, cada uno con su propia CI.",
    },
    {
      value: "288",
      label: "casos de evaluación escritos a mano",
      qualifier:
        "18 familias de intención que recorren todo el camino HTTP/SSE en CI con un modelo de prueba; validan el pipeline y los controles, no la calidad del modelo.",
    },
    {
      value: "303",
      label: "turnos con el modelo real",
      qualifier:
        "Una ejecución de evaluación sobre una versión anterior del asistente, antes del lanzamiento.",
    },
    {
      value: "USD 10",
      label: "tope mensual de gasto en LLM",
      qualifier: "Valor configurable, reservado de forma atómica antes de cada llamada al modelo.",
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
      label: "Tienda en línea",
      href: "https://pequeverso.com/",
      description: "pequeverso.com, con checkout de Hotmart",
    },
    {
      label: "Código de la tienda",
      href: "https://github.com/gonzalomartinperez/pequeverso",
      description: "Tienda en Next.js en GitHub (en inglés)",
    },
    {
      label: "Código del back office",
      href: "https://github.com/gonzalomartinperez/pequeverso-backoffice",
      description: "App privada de operaciones, código público en GitHub (en inglés)",
    },
    {
      label: "Código de la API del asistente",
      href: "https://github.com/gonzalomartinperez/pequeverso-assistant-api",
      description: "Backend con FastAPI y LangGraph en GitHub (en inglés)",
    },
  ],
};

export const pequeversoCaseStudy = {
  title: "Pequeverso: una tienda con asistente de compras con IA",
  eyebrow: "Caso de estudio · Proyecto para cliente",

  overview: {
    heading: "Tres aplicaciones para una tienda pequeña",
    body: [
      "Pequeverso vende recursos educativos imprimibles para familias con niños de 3 a 7 años. Desarrollé su tienda pública, un back office privado y un asistente de compras con IA que responde las preguntas de los compradores sobre el catálogo.",
      "Hotmart se encarga del pago, la entrega y los reembolsos, así que la tienda puede concentrarse en explicar bien los productos y llevar a los compradores al checkout.",
    ],
  } satisfies CaseStudySection,

  problem: {
    heading: "El problema",
    body: [
      "Los compradores tienen preguntas antes de pagar: qué incluye el kit, para qué edades sirve, cómo funciona la garantía. Un chatbot genérico puede inventar un precio, un descuento o un enlace, y en una tienda una respuesta equivocada es peor que ninguna.",
      "Además, la tienda tenía que informar compras e intención de compra a Meta para la publicidad, y el asistente tenía que mantenerse dentro de un presupuesto mensual pequeño y fijo.",
    ],
  } satisfies CaseStudySection,

  built: {
    heading: "Qué desarrollé",
    body: [
      "La tienda: Next.js con checkout de Hotmart, Meta Pixel en el navegador y un relay de la Conversions API en el servidor, más una verificación automática después de cada publicación que confirma que producción sirve el commit integrado.",
      "El back office: una app privada con inicio de sesión OAuth, roles solo por invitación y un panel de operaciones con la salud del asistente, la vigencia del catálogo, las ejecuciones, la latencia, los tokens y el gasto.",
      "El asistente: GraphRAG sobre LangGraph que combina recuperación léxica, con pgvector y con Neo4j sobre el catálogo de la tienda. El servidor valida cada producto, precio y enlace antes de que llegue al comprador, y aplica un tope de gasto mensual antes de cada llamada al modelo.",
    ],
  } satisfies CaseStudySection,

  architecture: [
    {
      layer: "Tienda",
      detail:
        "Next.js, React y TypeScript. Páginas de producto, checkout de Hotmart y un panel nativo del asistente que permanece apagado hasta el lanzamiento.",
    },
    {
      layer: "Medición",
      detail:
        "Meta Pixel en el navegador, replicado por un relay de la Conversions API en el mismo origen con los mismos IDs de evento.",
    },
    {
      layer: "API del asistente",
      detail:
        "Python y FastAPI. Sesiones con protección CSRF, respuestas transmitidas por SSE y un contrato HTTP versionado.",
    },
    {
      layer: "Recuperación",
      detail:
        "Un flujo acotado en LangGraph con recuperación léxica, pgvector y Neo4j, sobre un catálogo exportado desde la tienda.",
    },
    {
      layer: "Controles",
      detail:
        "Validación en el servidor de productos, precios y enlaces, más reservas de presupuesto contra el tope mensual.",
    },
    {
      layer: "Back office",
      detail:
        "Next.js con inicio de sesión OAuth y roles en PostgreSQL; lee los datos de operaciones de la API desde el servidor.",
    },
  ] satisfies ArchitectureStep[],

  decisions: [
    {
      heading: "Precios y enlaces salen del catálogo",
      body: [
        "El catálogo se exporta desde la tienda en un commit fijo. La API verifica cada producto, precio y enlace antes de mostrarlo, y oculta un precio vencido en lugar de adivinarlo.",
      ],
    },
    {
      heading: "Un tope de gasto en cada solicitud",
      body: [
        "Antes de cada llamada al modelo, la API reserva el costo máximo posible contra el presupuesto mensual, así las solicitudes concurrentes no pueden superarlo. El tope predeterminado es de USD 10 al mes.",
      ],
    },
    {
      heading: "Evaluado antes del lanzamiento",
      body: [
        "288 casos escritos a mano en 18 familias de intención recorren todo el camino HTTP/SSE en CI. Una versión anterior también se evaluó en una ejecución de 303 turnos con el modelo real.",
      ],
    },
    {
      heading: "Las operaciones son privadas",
      body: [
        "El back office es una app separada. Solo pueden entrar el propietario y las personas invitadas, y lee desde el servidor datos de operaciones sin contenido de conversaciones, nunca desde el navegador.",
      ],
    },
  ] satisfies CaseStudySection[],

  status: {
    heading: "Estado actual",
    body: [
      "La tienda está en línea en pequeverso.com, y cada publicación a producción se verifica automáticamente después del despliegue.",
      "El asistente está implementado y evaluado, pero todavía no se lanzó. Sigue desactivado en la tienda publicada hasta que su servidor esté desplegado y se apruebe el lanzamiento.",
    ],
  } satisfies CaseStudySection,
};
