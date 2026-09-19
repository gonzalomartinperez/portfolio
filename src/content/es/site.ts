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
    goHome: "Volver al inicio",
  },
  hero: {
    openToRemote: "Abierto a trabajo remoto",
    pauseAnimation: "Pausar la animación",
    playAnimation: "Reproducir la animación",
    avatarInteraction: "Interactuar con el avatar de Gonzalo",
    principles: [
      {
        title: "Escalabilidad",
        description:
          "Límites claros entre servicios, trabajo asíncrono y acceso eficiente a datos.",
      },
      {
        title: "Mantenibilidad",
        description: "Código legible, componentes reutilizables y decisiones documentadas.",
      },
      {
        title: "Calidad de software",
        description:
          "Pruebas automatizadas, evaluación de agentes y revisión humana antes de entregar.",
      },
    ],
    principlesLabel: "Principios de ingeniería",
    principlesLink: "Cómo los aplico →",
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
      "Explora los lenguajes, frameworks y prácticas detrás de mi trabajo, con enlaces a los proyectos y experiencias donde los apliqué.",
    educationEyebrow: "Educación",
    educationHeading: "Ingeniero en Sistemas de Información, UNS",
    educationBody:
      "Graduado de la Universidad Nacional del Sur en octubre de 2025 con un promedio de " +
      "8,67/10 en 34 de 34 materias obligatorias, y un proyecto final calificado 10/10.",
    closingHeading: "Hablemos",
    closingBody:
      "¿Buscas un perfil que combine ingeniería de software e IA aplicada? Hablemos de tu producto y de una oportunidad 100% remota.",
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
      "Hoy soy AI Engineer en Rampy, una startup de ritmo alto donde trabajo directamente con tres founders. Ayudo a dar forma a las ideas, tomo decisiones técnicas y acompaño las funcionalidades hasta las pruebas y el despliegue. Las prioridades cambian, así que busco equilibrar entregas útiles con un producto cada vez más fácil de mantener y hacer crecer.",
      "Conecto IA aplicada con la ingeniería que la sostiene: contratos explícitos, evaluaciones automatizadas, ejecución controlada de herramientas y servicios mantenibles. Mi trabajo DeFi incluye integraciones con Morpho, Aave y Compound, conectando interfaces de producto con ejecución en el backend.",
      "Me gusta entender cómo encajan las piezas, conversar sobre alternativas y convertir un problema complejo en un próximo paso claro. Busco un equipo de AI engineering donde pueda seguir construyendo, aprendiendo y aportando al producto de punta a punta.",
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
        body: "En Rampy traduzco requisitos de los founders en cambios web, mobile y backend, y los acompaño hasta las pruebas y el despliegue. Las decisiones de producto y de ingeniería forman parte de la misma conversación.",
      },
      {
        title: "IA integrada a la aplicación",
        body: "Evalúo recorridos completos, selección de herramientas y comportamiento de las respuestas; combino pruebas automatizadas con revisión humana y mantengo el contexto y la memoria relevantes para cada tarea.",
      },
    ],
    lookingEyebrow: "Qué estoy buscando",
    lookingHeading: "Trabajo remoto donde se encuentran ingeniería y producto",
    lookingBody:
      "Priorizo roles de AI Engineer 100% remotos, enfocados en IA aplicada, agentes y recuperación de contexto. También estoy abierto a oportunidades de software engineering con responsabilidad sobre el producto. Tengo disponibilidad inmediata y podemos coordinar la fecha exacta durante el proceso.",
  },
  work: {
    metaTitle: "Trabajo",
    metaDescription:
      "Experiencia profesional y proyectos seleccionados: IA y producto en Rampy, pipelines event-driven a escala " +
      "fintech en Payway, un backoffice empresarial de permisos, product engineering " +
      "independiente y Filomena.",
    eyebrow: "Trabajo",
    title: "Experiencia y proyectos seleccionados",
    intro: (length, asOf) =>
      `${length} de experiencia profesional a ${asOf}, construyendo productos en fintech, sistemas empresariales e IA aplicada.`,
    experienceHeading: "Experiencia profesional",
    projectsEyebrow: "Proyectos seleccionados",
    projectsHeading: "Explora el producto en detalle",
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
      "El recorrido del producto y el contexto de ingeniería están incluidos en esta página. Los repositorios enlazados son versiones públicas del código: documentan la implementación, no el historial original de desarrollo ni el pipeline de despliegue.",
    galleryHeading: "Explora la aplicación",
    galleryCaption:
      "43 pantallas de demostración revisadas que recorren administración, exámenes, corrección y monitoreo operativo. Explora los flujos o amplía una pantalla para ver el detalle.",
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
      "Desde interfaces y contratos de servicios hasta recuperación de contexto y flujos agénticos. Explora el conjunto completo por capacidad y accede al contexto profesional de cada entrada.",
    fieldHeading: "Herramientas de ingeniería conectadas",
    fieldIntro:
      "Lenguajes, frameworks y herramientas que uso en desarrollo de productos e IA aplicada.",
    fieldLabel: "Tecnologías",
    noteHeading: "Experiencia detrás de las herramientas",
    noteScope:
      "En Rampy trabajo sobre infraestructura y despliegues en DigitalOcean. La experiencia en AWS y Kubernetes de otros roles abarca integración, desarrollo y diagnóstico de aplicaciones, no administración de clústeres.",
    noteLogos: "Estos logos identifican las herramientas que utilizo y no implican patrocinio.",
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
      "Cuéntame sobre tu equipo, el producto y los desafíos de ingeniería que vienen. El email es la forma más directa de contactarme.",
    basedIn: (location, arrangement, timezone) =>
      `Vivo en ${location} (${timezone}) y trabajo ${arrangement}. Tengo disponibilidad inmediata; podemos acordar la fecha exacta durante el proceso.`,
    hiringHint: "Para conocer mi trabajo de producto e ingeniería, explora el",
    hiringLinkText: "caso de estudio de Filomena",
    openToHeading: "Abierto a",
    resumeHeading: "CV",
    resumeNote:
      "Descarga el CV en inglés o español con experiencia, habilidades y datos de contacto.",
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
