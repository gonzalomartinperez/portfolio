import type { EvidenceLink, Metric, Project } from "../types";

export const filomena: Project = {
  slug: "filomena",
  name: "Filomena",
  tagline: "Una plataforma de exámenes de ciencias de la salud que usan cinco instituciones",
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
      label: "Caso de estudio",
      href: "https://vine-jupiter-8df.notion.site/Filomena-Plataforma-Productiva-de-Ex-menes-de-Ciencias-de-la-Salud-29ab68807486806db025cfeef5de9f73",
      description: "Desarrollo completo con capturas de pantalla",
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
    heading: "El problema",
    body: [
      "Las carreras de ciencias de la salud evalúan a sus estudiantes con exámenes escritos " +
        "masivos y de alta exigencia. La primera versión de Filomena era un monolito CakePHP y " +
        "jQuery construido para una sola institución, y mostraba todos los síntomas de serlo: " +
        "se degradaba bajo carga concurrente, la toma de exámenes era secuencial, el control de " +
        "acceso se aplicaba de forma inconsistente y sumar una institución implicaba escribir " +
        "código.",
      "No había monitoreo, así que los problemas aparecían como reportes de personas que " +
        "estaban rindiendo un examen. Para una aplicación donde una respuesta lenta durante una " +
        "evaluación cronometrada es un problema académico y no solo técnico, esa era la " +
        "restricción que más pesaba.",
    ],
  } satisfies CaseStudySection,

  audience: {
    heading: "Para quién es",
    body: [
      "Tres roles con necesidades genuinamente distintas. Los administradores configuran " +
        "instituciones, cursos y cronogramas. Los evaluadores redactan preguntas y revisan " +
        "resultados. Los estudiantes rinden los exámenes — y deben permanecer anónimos ante el " +
        "evaluador que los califica.",
      "Esos roles no son mutuamente excluyentes. Un profesor puede ser evaluador en un curso y " +
        "administrador en otro, y por eso el manejo de roles tuvo que ser multirol desde el " +
        "principio, en lugar de un único campo en el usuario.",
    ],
  } satisfies CaseStudySection,

  role: {
    heading: "Mi rol",
    body: [
      "Filomena fue desarrollada por un equipo de tres personas como nuestro proyecto final en " +
        "la Universidad Nacional del Sur, y el producto es un logro del equipo. Fui el autor y " +
        "contribuidor principal: arquitectura, backend, frontend, infraestructura, seguridad, " +
        "observabilidad y coordinación del trabajo.",
      "Digo contribuidor principal y no autor único de forma deliberada. Los repositorios " +
        "públicos son una instantánea publicada como evidencia de portfolio — no son un " +
        "historial de commits que pruebe quién escribió cada línea, y no los presentaría como " +
        "tal.",
    ],
  } satisfies CaseStudySection,

  approach: {
    heading: "El enfoque",
    body: [
      "En lugar de refactorizar dentro del monolito, lo separamos en una API REST Laravel y un " +
        "frontend Next.js, React y TypeScript. La razón decisiva no fue la modernidad: fue que " +
        "un único contrato de API nos permitió convertir el modelo multi-institución en " +
        "configuración en vez de código, y le dio a la concurrencia un solo lugar donde ser " +
        "correcta.",
      "El trabajo de performance se concentró donde los exámenes realmente tocan el sistema — " +
        "recuperación de preguntas, estado de la sesión, envío de resultados. Primero vinieron " +
        "el SQL tuning y el diseño de índices, después la caché Redis, y todo lo que no " +
        "necesitaba ocurrir durante el request, como generar reportes de resultados, se movió a " +
        "una cola.",
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
      detail: "MySQL, con diseño de índices y tuning de consultas en los caminos de examen.",
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
        "Los estudiantes son seudónimos para los evaluadores. Eso se aplica en el modelo de " +
          "datos y en la API, y no se esconde en la interfaz, porque una regla de privacidad implementada " +
          "en una vista es una regla que se filtra la primera vez que alguien agrega un " +
          "endpoint.",
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
        "El control de acceso basado en roles se aplica en la API y se refleja en el frontend. " +
          "La copia del frontend existe por usabilidad; la de la API es la que realmente " +
          "sostiene la garantía.",
      ],
    },
    {
      heading: "Monitoreo antes de necesitarlo",
      body: [
        "Prometheus y Grafana entraron junto con la reconstrucción y no después del primer " +
          "incidente, cubriendo la base de datos, Redis, las colas y los workers, con logging " +
          "estructurado y health checks.",
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
    heading: "Cómo trabajamos",
    body: [
      "Prácticas ágiles con Trello, desde los requisitos hasta producción. Tres personas, una " +
        "fecha límite académica e instituciones reales que ya dependían de la versión anterior " +
        "— así que el trabajo se ordenó por lo que se rompería primero, no por lo que resultaba " +
        "más interesante.",
      "Los despliegues corrían sobre imágenes Docker construidas con GitHub Actions, observados " +
        "por debajo de quince minutos de punta a punta. Los repositorios públicos son " +
        "instantáneas publicadas y no incluyen la configuración de ese pipeline.",
    ],
  } satisfies CaseStudySection,

  outcomes: {
    heading: "Dónde está hoy",
    body: [
      "Filomena está activa en cinco instituciones nacionales argentinas: UNS, UNRN, UNC, UNVM " +
        "y FAMFyG. Soportó 1.000+ usuarios simultáneos en producción con consistencia completa " +
        "de datos, y mantuvo los endpoints críticos por debajo de 300 ms en promedio.",
      "Estas cifras provienen de la operación desplegada, no de un banco de pruebas en el " +
        "repositorio. El proyecto fue calificado 10/10 como proyecto final en la Universidad " +
        "Nacional del Sur, y recibió entrevistas, cobertura universitaria y menciones de " +
        "autoridades académicas — reconocimiento editorial, no un premio formalmente instituido.",
    ],
  } satisfies CaseStudySection,

  lessons: {
    heading: "Qué haría distinto",
    body: [
      "La suite de tests es el punto débil honesto. Validamos el comportamiento mediante la " +
        "operación desplegada y validación de carga, y las instantáneas públicas incluyen tests " +
        "de humo del framework en lugar de una suite real. En un sistema donde un defecto " +
        "interrumpe un examen en curso, los caminos de concurrencia y permisos merecían " +
        "cobertura automatizada, y construirla bajo una fecha límite académica fue el " +
        "compromiso equivocado para repetir.",
      "También habría anotado las condiciones de medición en su momento. Los números de " +
        "performance son reales, pero reconstruir meses después cómo se observó exactamente " +
        "cada uno es más difícil de lo que debería — y una cifra que no se puede calificar es " +
        "una cifra que conviene repetir con cuidado.",
    ],
  } satisfies CaseStudySection,
};

export const filomenaEvidence: EvidenceLink[] = filomena.links;

export const filomenaHighlights: Metric[] = filomena.metrics;
