import type { SiteCopy } from "../site-copy";
import { aboutCopy } from "./about";

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
        title: "Rendimiento",
        description: "Latencia medida, carga inicial rápida y uso eficiente de recursos.",
      },
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
    whoHeading: "De sistemas complejos a productos reales",
    whoParagraph:
      "Mi trabajo abarca sistemas agénticos potenciados con IA, APIs y backoffices empresariales, sitios web y aplicaciones móviles. Acompaño el recorrido completo: entender las necesidades del usuario, diseñar la arquitectura, desarrollar y probar, desplegar y observar el producto en producción.",
    factCurrently: "Actualmente",
    factExperience: "Experiencia",
    factBasedIn: "Radicado en",
    factLanguages: "Idiomas",
    languagesValue: "Español (nativo) · Inglés (B2)",
    experienceSince: (length, since) => `${length}, desde ${since}`,
    workEyebrow: "Proyecto destacado",
    workHeading: "Un producto real, de punta a punta",
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
    closingBody: "¿Buscas un perfil que combine ingeniería de software e IA aplicada?",
  },
  about: aboutCopy,
  work: {
    metaTitle: "Trabajo",
    metaDescription:
      "Experiencia profesional y proyectos seleccionados: IA y producto en Rampy, procesamiento basado en eventos a escala " +
      "financiera en Payway, un sistema empresarial de permisos, desarrollo de producto " +
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
  stack: {
    metaTitle: "Stack",
    metaDescription:
      "Tecnología agrupada por capacidad — IA aplicada y sistemas agénticos, backend y APIs, " +
      "datos y arquitectura, infraestructura en la nube y entrega de software — con el trabajo que respalda cada grupo.",
    eyebrow: "Stack",
    title: "La tecnología detrás del trabajo",
    intro:
      "Desde interfaces y contratos de servicios hasta recuperación de contexto y flujos agénticos. Explora el conjunto completo por capacidad y accede al contexto profesional de cada entrada.",
    fieldHeading: "Herramientas de ingeniería conectadas",
    fieldIntro: "Lenguajes, frameworks y herramientas con los que construyo productos de calidad.",
    fieldLabel: "Tecnologías",
    noteHeading: "Experiencia detrás de las herramientas",
    noteScope:
      "En Rampy trabajo con infraestructura y despliegues en DigitalOcean. En otros roles utilicé AWS y Kubernetes para integrar servicios, desarrollar aplicaciones y diagnosticar problemas.",
    noteApproach:
      "Mi enfoque está en el desarrollo de aplicaciones y su entrega a producción; utilizo estas herramientas como parte de ese trabajo.",
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
      "Contacta a Gonzalo Martin Perez — AI Software Engineer, abierto a nuevas oportunidades en " +
      "roles remotos. Email, LinkedIn y GitHub.",
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
