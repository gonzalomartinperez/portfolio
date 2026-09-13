import type { SiteCopy } from "../site-copy";

export const siteCopy: SiteCopy = {
  chrome: {
    skipToContent: "Saltar al contenido",
    roleSubtitle: "AI Software Engineer",
    mainNavLabel: "Principal",
    footerNavLabel: "Pie de página",
    themeToggleNeutral: "Cambiar el tema",
    themeToggleTo: (theme) => `Cambiar al tema ${theme}`,
    themeLight: "claro",
    themeDark: "oscuro",
    languageLabel: "Idioma",
    footerSite: "Sitio",
    footerElsewhere: "En otros lugares",
    colophon: "Next.js · TypeScript · sin rastreo",
  },
  nav: {
    about: "Sobre mí",
    work: "Trabajo",
    stack: "Stack",
    education: "Educación",
    contact: "Contacto",
    caseStudy: "Caso de estudio Filomena",
  },
  actions: {
    seeWork: "Ver mi experiencia",
    getInTouch: "Contactarme",
    readCaseStudy: "Leer el caso de estudio",
    fullExperience: "Experiencia y proyectos completos",
    fullStack: "Explorar todas las tecnologías",
    academicRecord: "Registro académico",
    emailMe: "Escribirme un email",
    allContact: "Todas las formas de contacto",
    backToWork: "Volver a experiencia y proyectos",
    sourceOnGithub: "Código en GitHub",
    goHome: "Llevame a la portada",
  },
  hero: {
    openToRemote: "Abierto a trabajo remoto",
    pauseAnimation: "Pausar la animación",
    playAnimation: "Reproducir la animación",
    proof: [
      { value: "20M+", label: "promociones en producción" },
      { value: "1.000+", label: "usuarios simultáneos de la plataforma" },
      { value: "10+", label: "sistemas empresariales integrados" },
    ],
    proofNote: "Resultados observados en producción.",
    proofNoteLink: "Explorá el contexto y mi contribución.",
  },
  home: {
    whoEyebrow: "Quién soy",
    whoHeading: "De sistemas complejos a productos útiles",
    whoParagraph:
      "Trabajo sobre el producto completo: entender los requisitos, definir los límites entre servicios y comprobar cómo se comporta la aplicación con cargas reales.",
    factCurrently: "Actualmente",
    factExperience: "Experiencia",
    factBasedIn: "Radicado en",
    factLanguages: "Idiomas",
    languagesValue: "Español (nativo) · Inglés (B2)",
    experienceSince: (length, since) => `${length}, desde ${since}`,
    workEyebrow: "Trabajo seleccionado",
    workHeading: "Filomena: de proyecto universitario a producción",
    experienceEyebrow: "Experiencia",
    experienceHeading: "Productos, equipos y contribuciones",
    stackEyebrow: "Stack",
    stackHeading: "Un conjunto de herramientas para todo el producto",
    stackIntro:
      "Explorá los lenguajes, frameworks y prácticas detrás de mi trabajo, con enlaces a los proyectos y experiencias donde los apliqué.",
    educationEyebrow: "Educación",
    educationHeading: "Ingeniero en Sistemas de Información, UNS",
    educationBody:
      "Graduado de la Universidad Nacional del Sur en octubre de 2025 con un promedio de " +
      "8,67/10 en 34 de 34 materias obligatorias, y un proyecto final calificado 10/10.",
    closingHeading: "Hablemos",
    closingBody:
      "¿Buscás un perfil que combine ingeniería de software e IA aplicada? Hablemos de tu producto y de una oportunidad 100% remota.",
  },
  about: {
    metaTitle: "Sobre mí",
    metaDescription:
      "Gonzalo Martin Perez — AI Software Engineer. Trayectoria, cómo encaro el trabajo de " +
      "ingeniería y qué estoy buscando.",
    eyebrow: "Sobre mí",
    title: "Ingeniería de software con IA aplicada",
    paragraphs: [
      "Soy Gonzalo, Ingeniero en Sistemas de Información por la Universidad Nacional del Sur y AI Software Engineer. Desde 2024 combino proyectos independientes con roles de ingeniería en software empresarial y fintech.",
      "Construí experiencias para comercios, integraciones entre servicios y un backoffice de permisos. Como contribuidor principal de un equipo de tres personas, también participé en la evolución de Filomena hacia una plataforma de exámenes usada por cinco instituciones.",
      "Actualmente soy AI Engineer en Rampy. Mi enfoque une interfaces, servicios y datos con RAG, agentes y entornos de desarrollo que preservan contexto.",
    ],
    asideCurrently: "Actualmente",
    asideArrangement: "Modalidad de trabajo",
    asideLanguages: "Idiomas",
    asideAvailability: "Disponibilidad",
    principlesEyebrow: "Cómo trabajo",
    principlesHeading: "Cómo convierto requisitos en sistemas funcionales",
    principles: [
      {
        title: "Límites claros entre integraciones",
        body: "En Cooperativa Obrera, un contrato de API común conectó sistemas independientes a un backoffice. Uso contratos para separar las interfaces de la lógica propia de cada servicio.",
      },
      {
        title: "Rendimiento con cargas reales",
        body: "Las cargas de promociones, las consultas de permisos y los exámenes concurrentes guiaron mi trabajo con datos: tuning de consultas, índices, caché y herramientas de carga aisladas.",
      },
      {
        title: "Responsabilidad sobre el producto",
        body: "Filomena conectó arquitectura, implementación y despliegue con las necesidades de instituciones, evaluadores y estudiantes. Me interesa trabajar a lo largo de todo ese recorrido.",
      },
      {
        title: "IA integrada a la aplicación",
        body: "En las consultas de comercios, la recuperación incorporaba promociones relevantes a la conversación. LangChain, LangGraph y pgvector sustentaron el asistente, con guardrails para controlar su alcance.",
      },
    ],
    lookingEyebrow: "Qué estoy buscando",
    lookingHeading: "Trabajo remoto donde se encuentran ingeniería y producto",
    lookingBody:
      "Busco roles 100% remotos de ingeniería de software e IA con responsabilidad sobre el producto. Puedo empezar de inmediato y coordinar la fecha exacta durante el proceso.",
  },
  work: {
    metaTitle: "Trabajo",
    metaDescription:
      "Experiencia profesional y proyectos seleccionados: pipelines event-driven a escala " +
      "fintech en Payway, un backoffice empresarial de permisos, product engineering " +
      "independiente y Filomena.",
    eyebrow: "Trabajo",
    title: "Experiencia y proyectos seleccionados",
    intro: (length, asOf) =>
      `${length} de experiencia profesional a ${asOf}, construyendo productos en fintech, sistemas empresariales e IA aplicada.`,
    experienceHeading: "Experiencia profesional",
    projectsEyebrow: "Proyectos seleccionados",
    projectsHeading: "Explorá el producto en detalle",
    projectsBody:
      "Filomena reúne el recorrido del producto, las decisiones de arquitectura y las versiones públicas del código. Las experiencias empresariales describen mi contribución y el contexto de operación.",
  },
  filomena: {
    metaTitle: "Filomena — plataforma productiva de exámenes",
    metaDescription:
      "Cómo un monolito CakePHP y jQuery se convirtió en una plataforma API-first que ejecuta " +
      "exámenes de alta exigencia para cinco instituciones nacionales argentinas, con 1.000+ " +
      "usuarios simultáneos en producción.",
    caseStudyLabel: "Caso de estudio",
    architectureHeading: "Arquitectura",
    architectureCaption:
      "El recorrido del request desde el navegador, después de la reconstrucción.",
    decisionsHeading: "Decisiones de ingeniería",
    changesHeading: "Qué cambió",
    changesCaption: "La primera versión comparada con la plataforma hoy en producción.",
    columnAspect: "Aspecto",
    columnBefore: "Antes",
    columnAfter: "Después",
    evidenceHeading: "Evidencia",
    evidenceNote:
      "Explorá las versiones públicas del código y el recorrido completo del producto. Estas versiones documentan la implementación, no el historial original de desarrollo.",
    galleryHeading: "Explorá la aplicación",
    galleryCaption:
      "Un recorrido de demostración por acceso, administración y exámenes. Las pantallas están agrupadas por flujo de trabajo.",
    galleryLabel: "Recorrido por la interfaz de Filomena",
    galleryPrevious: "Pantalla anterior",
    galleryNext: "Pantalla siguiente",
    galleryPosition: (current, total) => `Pantalla ${current} de ${total}`,
  },
  stack: {
    metaTitle: "Stack",
    metaDescription:
      "Tecnología agrupada por capacidad — IA aplicada y sistemas agénticos, backend y APIs, " +
      "datos y arquitectura, cloud y delivery — con el trabajo que respalda cada grupo.",
    eyebrow: "Stack",
    title: "La tecnología detrás del trabajo",
    intro:
      "Desde interfaces y contratos de servicios hasta recuperación de contexto y flujos agénticos. Explorá el conjunto completo por capacidad y accedé al contexto profesional de cada entrada.",
    fieldHeading: "Herramientas de ingeniería conectadas",
    fieldIntro:
      "Lenguajes, frameworks y herramientas que uso en desarrollo de productos e IA aplicada.",
    fieldLabel: "Tecnologías",
    noteHeading: "Experiencia aplicada y conocimientos en desarrollo",
    noteScope:
      "La experiencia cloud comprende integración de aplicaciones con servicios AWS y desarrollo, configuración y diagnóstico de servicios contenerizados.",
    noteLogos:
      "Las marcas conservan sus colores e identifican cada tecnología, sin implicar patrocinio. Los conceptos de blockchain se distinguen como conocimientos en consolidación.",
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
    certificationsHeading: "Credenciales completadas",
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
      "Contacta a Gonzalo Martin Perez — AI Software Engineer, disponible de inmediato para " +
      "roles remotos. Email, LinkedIn y GitHub.",
    eyebrow: "Contacto",
    title: "Hablemos",
    intro:
      "Contame sobre tu equipo, el producto y los desafíos de ingeniería que vienen. El email es la forma más directa de contactarme.",
    basedIn: (location, arrangement, timezone) =>
      `Vivo en ${location} (${timezone}) y trabajo ${arrangement}. Tengo disponibilidad inmediata; podemos acordar la fecha exacta durante el proceso.`,
    hiringHint: "Para conocer mi trabajo de producto e ingeniería, explorá el",
    hiringLinkText: "caso de estudio de Filomena",
    openToHeading: "Abierto a",
    resumeHeading: "Currículum",
    resumeNote:
      "Descargá el CV en inglés o español con experiencia, habilidades y datos de contacto.",
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
