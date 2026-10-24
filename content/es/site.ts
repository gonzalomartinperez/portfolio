import { professionalHeadline } from "../../config/site";
import type { SiteCopy } from "../site-copy";
import { aboutCopy } from "./about";

export const siteCopy: SiteCopy = {
  chrome: {
    skipToContent: "Saltar al contenido",
    roleSubtitle: professionalHeadline,
    mainNavLabel: "Principal",
    footerNavLabel: "Pie de página",
    themeToggleNeutral: "Cambiar el tema",
    themeToggleTo: (theme) => `Cambiar al tema ${theme}`,
    themeLight: "claro",
    themeDark: "oscuro",
    languageLabel: "Idioma",
    footerSite: "Sitio",
    footerElsewhere: "Perfiles",
    colophon: "Desarrollado con Next.js, React y TypeScript.",
  },
  nav: {
    about: "Sobre mí",
    work: "Trabajo",
    stack: "Stack",
    education: "Educación",
    contact: "Contacto",
    caseStudy: "Caso de estudio Filomena",
    pequeversoCaseStudy: "Caso de estudio Pequeverso",
  },
  actions: {
    seeWork: "Ver mi experiencia",
    getInTouch: "Contactarme",
    readCaseStudy: "Leer el caso de estudio",
    viewCaseStudy: "Ver el caso de estudio",
    fullExperience: "Experiencia y proyectos completos",
    fullStack: "Explorar todas las tecnologías",
    academicRecord: "Registro académico",
    emailMe: "Escribirme un email",
    allContact: "Todas las formas de contacto",
    backToWork: "Volver a experiencia y proyectos",
    sourceOnGithub: "Código en GitHub",
    goHome: "Volver al inicio",
  },
  hero: {
    openToRemote: "Abierto a trabajo remoto",
    pauseAnimation: "Pausar la animación",
    playAnimation: "Reproducir la animación",
    avatarInteraction: "Interactuar con el avatar de Gonzalo",
    principles: [
      {
        title: "Evaluaciones primero",
        description:
          "La calidad se mide con escenarios representativos y las evaluaciones deciden qué versión sale.",
      },
      {
        title: "Respuestas fundamentadas",
        description:
          "Recuperación y herramientas en lugar de suposiciones, con límites claros para cada agente.",
      },
      {
        title: "Presupuestos de latencia y costo",
        description:
          "El tiempo de respuesta y los tokens son métricas de producto, medidas con pruebas de carga y evaluaciones.",
      },
      {
        title: "Responsabilidad completa",
        description: "Desde el agente y la API hasta la app y su comportamiento en producción.",
      },
    ],
    principlesLabel: "Principios de ingeniería",
    principlesLink: "Cómo los aplico →",
  },
  home: {
    whoEyebrow: "Quién soy",
    whoHeading: "De los agentes de IA al producto que los rodea",
    whoParagraph:
      "Trabajo sobre todo con LangGraph, Claude, RAG y LangSmith: agentes que usan herramientas reales, recuperación basada en el contexto del negocio y evaluaciones que deciden qué se publica. También construyo las APIs, los backoffices, la web y las apps móviles que los rodean, desde las necesidades del usuario y la arquitectura hasta las pruebas, el despliegue y el monitoreo.",
    whoAssistant: {
      lead: "Mi ",
      link: "Portfolio Assistant",
      tail: " open source muestra el mismo enfoque en código público: un asistente RAG bilingüe con un banco de 1.000 preguntas de evaluación.",
    },
    factCurrently: "Actualmente",
    factExperience: "Experiencia",
    factBasedIn: "Radicado en",
    factLanguages: "Idiomas",
    languagesValue: "Español (nativo) · Inglés (B2)",
    experienceSince: (length, since) => `${length}, desde ${since}`,
    rampyEyebrow: "Rol actual",
    rampyHeading: "Agentes LLM en producción en Rampy",
    rampyCta: "Ver el trabajo en Rampy",
    rampyMarkets: {
      value: "200+",
      label: "mercados de perpetuos lanzados",
      qualifier:
        "Mercados de Hyperliquid en cripto, índices, acciones y commodities, junto a swaps con más de 100 tokens.",
    },
    pequeversoStatus: "El asistente está implementado y evaluado; su lanzamiento está pendiente.",
    selectedEyebrow: "Trabajo seleccionado",
    selectedHeading: "Casos de estudio y trabajo open source",
    workEyebrow: "Proyecto destacado",
    workHeading: "En producción desde la universidad",
    experienceEyebrow: "Experiencia",
    experienceHeading: "Productos, equipos y contribuciones",
    stackEyebrow: "Stack",
    stackHeading: "Un conjunto de herramientas para todo el producto",
    stackIntro:
      "Explora los lenguajes, frameworks y prácticas detrás de mi trabajo, con enlaces a los proyectos y experiencias donde los apliqué.",
    educationEyebrow: "Educación",
    educationHeading: "Ingeniero en Sistemas de Información, UNS",
    educationBody:
      "Graduado de la Universidad Nacional del Sur en octubre de 2025 con un promedio de " +
      "8,67/10 en 34 de 34 materias obligatorias, y un proyecto final calificado 10/10.",
    closingHeading: "Hablemos",
    closingInvitation: "Hablemos de tu producto.",
    closingAvailability: "Estoy abierto a oportunidades 100% remotas.",
    closingBody:
      "¿Construyes un producto con IA y necesitas a alguien que se haga cargo desde el agente hasta producción?",
  },
  about: aboutCopy,
  work: {
    metaTitle: "Trabajo",
    metaDescription:
      "Experiencia profesional y proyectos seleccionados: agentes LLM y evaluaciones en Rampy, " +
      "un asistente GraphRAG y procesamiento basado en eventos en Payway, un backoffice " +
      "empresarial de permisos, desarrollo de producto independiente y Filomena.",
    eyebrow: "Trabajo",
    title: "Experiencia y proyectos seleccionados",
    intro:
      "Más de 2,5 años llevando a producción agentes de IA, productos fintech y sistemas empresariales.",
    experienceHeading: "Experiencia profesional",
    projectsEyebrow: "Proyectos seleccionados",
    projectsHeading: "Explora los productos en detalle",
    projectsBody:
      "Filomena reúne el recorrido del producto, las decisiones de arquitectura y las versiones públicas del código. Portfolio Assistant reúne mi trabajo open source de evaluación. Las experiencias empresariales describen mi contribución y el contexto de operación.",
  },
  filomena: {
    metaTitle: "Filomena: plataforma de exámenes en producción",
    metaDescription:
      "Cómo un monolito CakePHP y jQuery se convirtió en una plataforma API-first que ejecuta " +
      "exámenes de alta exigencia para cinco instituciones nacionales argentinas, con 1.000+ " +
      "usuarios simultáneos en producción.",
    caseStudyLabel: "Caso de estudio",
    architectureHeading: "Arquitectura",
    architectureCaption:
      "El recorrido de una solicitud desde el navegador, después de la reconstrucción.",
    decisionsHeading: "Decisiones de ingeniería",
    changesHeading: "Qué cambió",
    changesCaption: "La primera versión comparada con la plataforma hoy en producción.",
    columnAspect: "Aspecto",
    columnBefore: "Antes",
    columnAfter: "Después",
    evidenceHeading: "Evidencia",
    evidenceNote:
      "El recorrido del producto y el contexto de ingeniería están incluidos en esta página. Los repositorios enlazados son versiones públicas del código: documentan la implementación, no el historial original de desarrollo ni el pipeline de despliegue.",
    galleryHeading: "Explora la aplicación",
    galleryCaption:
      "43 pantallas de demostración revisadas que recorren administración, exámenes, corrección y monitoreo operativo. Explora los flujos o amplía una pantalla para ver el detalle.",
    galleryLabel: "Recorrido por la interfaz de Filomena",
    galleryPrevious: "Pantalla anterior",
    galleryNext: "Pantalla siguiente",
    galleryPosition: (current, total) => `Pantalla ${current} de ${total}`,
  },
  pequeverso: {
    metaTitle: "Pequeverso: una tienda con asistente de compras con IA",
    metaDescription:
      "Caso de estudio para un cliente: una tienda en Next.js con checkout de Hotmart y Conversions API de Meta, un back office privado y un asistente de compras GraphRAG sobre LangGraph evaluado antes del lanzamiento.",
    architectureHeading: "Arquitectura",
    architectureCaption:
      "Tres aplicaciones, desde el navegador del comprador hasta el back office privado.",
    decisionsHeading: "Decisiones de ingeniería",
    galleryHeading: "Explora el producto",
    galleryCaption:
      "Capturas reales de los repositorios públicos: la tienda, el asistente ejecutándose en local con un modelo de prueba y el back office con datos sintéticos. Amplía una pantalla para ver el detalle.",
    galleryLabel: "Recorrido por el producto Pequeverso",
    evidenceHeading: "Evidencia",
    evidenceNote:
      "Los tres repositorios son públicos. La aplicación del back office es privada y sus capturas usan datos sintéticos.",
  },
  stack: {
    metaTitle: "Stack",
    metaDescription:
      "Tecnología agrupada por capacidad (IA aplicada y sistemas agénticos, backend y APIs, " +
      "datos y arquitectura, infraestructura en la nube y entrega de software), con el trabajo que respalda cada grupo.",
    eyebrow: "Stack",
    title: "La tecnología detrás del trabajo",
    intro:
      "Desde interfaces y contratos de servicios hasta recuperación de contexto y flujos agénticos. Explora el conjunto completo por capacidad y accede al contexto profesional de cada entrada.",
    fieldHeading: "El stack detrás de agentes que llegan a producción",
    fieldIntro:
      "Lo que uso en producción, desde LangGraph y las evaluaciones hasta las APIs y apps que los rodean.",
    groupedHeading: "Agrupado por lo que hace",
    groupedIntro: "Cada herramienta enlaza al rol o proyecto donde la usé.",
    fieldLabel: "Tecnologías",
    noteHeading: "Experiencia detrás de las herramientas",
    noteScope:
      "En Rampy trabajo con infraestructura y despliegues en DigitalOcean. En otros roles utilicé AWS y Kubernetes para integrar servicios, desarrollar aplicaciones y diagnosticar problemas.",
    noteApproach:
      "Mi enfoque está en el desarrollo de aplicaciones y su entrega a producción. Complemento ese trabajo con Coolify para despliegues y conocimientos de NGINX, Traefik y Caddy para servir aplicaciones y enrutar solicitudes.",
  },
  education: {
    metaTitle: "Educación",
    metaDescription:
      "Ingeniero en Sistemas de Información por la Universidad Nacional del Sur: promedio " +
      "8,67/10 en 34 de 34 materias obligatorias, proyecto final 10/10 y evidencia pública " +
      "verificada.",
    eyebrow: "Educación",
    title: "Ingeniería en Sistemas de Información",
    intro:
      "Una carrera de ingeniería acreditada de cinco años que combina arquitectura de software, matemática, sistemas y proyectos aplicados.",
    curriculumEyebrow: "Plan de estudios",
    curriculumHeading: "El programa de cinco años",
    courseworkEyebrow: "Materias",
    courseworkHeading: "Materias relevantes",
    contextEyebrow: "Contexto institucional",
    contextHeading: "Universidad Nacional del Sur",
    projectEyebrow: "Proyecto final",
    projectHeading: "Filomena, calificado 10/10",
    projectBody:
      "Mi proyecto final se convirtió en una plataforma que hoy cinco instituciones nacionales " +
      "argentinas ejecutan en producción. Fue desarrollado por un equipo de tres personas, con " +
      "mi participación como autor y contribuidor principal.",
    certificationsEyebrow: "Certificaciones",
    certificationsHeading: "Certificaciones adicionales",
    certificationsDescription:
      "Formación adicional completada en fundamentos de contenedores y habilidades profesionales.",
    languagesEyebrow: "Idiomas",
    languagesHeading: "Español e inglés",
    evidenceEyebrow: "Evidencia",
    evidenceHeading: "Registro académico y verificación",
    evidenceBody:
      "El registro académico completo está publicado con verificación oficial de la universidad.",
  },
  contact: {
    metaTitle: "Contacto",
    metaDescription:
      "Contacta a Gonzalo Martin Perez, AI Engineer, ingeniero de software y de producto, " +
      "abierto a roles remotos. Email, LinkedIn y GitHub.",
    eyebrow: "Contacto",
    title: "Hablemos",
    intro:
      "Cuéntame sobre tu equipo, el producto y los desafíos de ingeniería que tienes en mente. El email es la forma más directa de contactarme.",
    basedIn: (location, arrangement, timezone) =>
      `Vivo en ${location} (${timezone}) y trabajo ${arrangement}. Estoy abierto a nuevas oportunidades y disponible para entrevistas.`,
    hiringHint: "Para conocer mi trabajo de producto e ingeniería, explora mi",
    hiringLinkText: "experiencia y resultados en producción",
    openToHeading: "Abierto a",
    resumeHeading: "CV",
    resumeNote: "Descarga mi CV actualizado en inglés o español.",
  },
  notFound: {
    metaTitle: "Página no encontrada",
    eyebrow: "Error 404",
    title: "Esta página no existe",
    body:
      "Puede que el enlace esté desactualizado o que la dirección tenga un error de tipeo. " +
      "Todo lo que hay en el sitio se alcanza desde la navegación de arriba.",
  },
};
