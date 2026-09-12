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
    seeWork: "Ver el trabajo",
    getInTouch: "Contactarme",
    readCaseStudy: "Leer el caso de estudio",
    fullExperience: "Experiencia y proyectos completos",
    fullStack: "Stack completo",
    academicRecord: "Registro académico",
    emailMe: "Escribirme un email",
    allContact: "Todas las formas de contacto",
    backToWork: "Volver a todo el trabajo",
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
    proofNote: "Las cifras describen los productos.",
    proofNoteLink: "Lo que hice se detalla por separado.",
  },
  home: {
    whoEyebrow: "Quién soy",
    whoHeading: "Ingeniería que aguanta después de la demo",
    whoParagraph:
      "Me importan las partes que deciden si el software sobrevive al contacto con el uso " +
      "real: contratos claros entre servicios, modelos de datos que siguen siendo correctos " +
      "bajo concurrencia, y suficiente observabilidad para saber qué pasó sin adivinar. Es menos " +
      "vistoso que una demo, y es lo que marca la diferencia seis meses después.",
    factCurrently: "Actualmente",
    factExperience: "Experiencia",
    factBasedIn: "Radicado en",
    factLanguages: "Idiomas",
    languagesValue: "Español (nativo) · Inglés (B2)",
    experienceSince: (length, since) => `${length}, desde ${since}`,
    workEyebrow: "Trabajo seleccionado",
    workHeading: "El proyecto que mostraría primero",
    experienceEyebrow: "Experiencia",
    experienceHeading: "Dónde construí cosas",
    stackEyebrow: "Stack",
    stackHeading: "Con qué trabajo",
    stackIntro:
      "Agrupado por para qué sirve, no por lenguaje. Cada grupo se respalda en el trabajo " +
      "listado más arriba.",
    educationEyebrow: "Educación",
    educationHeading: "Ingeniero en Sistemas de Información, UNS",
    educationBody:
      "Graduado de la Universidad Nacional del Sur en octubre de 2025 con un promedio de " +
      "8,67/10 en 34 de 34 materias obligatorias, y un proyecto final calificado 10/10.",
    closingHeading: "Hablemos",
    closingBody:
      "Estoy abierto a roles remotos en ingeniería de software, backend e IA, y puedo empezar de " +
      "inmediato. Si algo de esto se parece al problema que estás buscando resolver, me encantaría " +
      "que me lo cuentes — el email es la vía más rápida, y lo respondo.",
  },
  about: {
    metaTitle: "Sobre mí",
    metaDescription:
      "Gonzalo Martin Perez — AI Software Engineer. Trayectoria, cómo encaro el trabajo de " +
      "ingeniería y qué estoy buscando.",
    eyebrow: "Sobre mí",
    title: "Convierto dominios complejos en software que la gente puede operar de verdad",
    paragraphs: [
      "Mi camino de entrada fue una carrera de ingeniería de cinco años en la Universidad Nacional del Sur, en paralelo con trabajo independiente para clientes que empezó en 2024 y no se detuvo. El hilo conductor es el product engineering: me gusta hacerme cargo de algo desde la interfaz hasta la cola que lo hace funcionar.",
      "Desde entonces trabajé en una plataforma de promociones a escala fintech, un backoffice de permisos que abarca los sistemas internos de una empresa, y una plataforma de exámenes de la que dependen cinco instituciones. La IA aplicada atraviesa el trabajo reciente en lugar de quedar al costado: un asistente de recuperación dentro de un producto para comercios, pipelines de agentes para clientes, y los entornos agénticos de ingeniería que construyo para hacer el trabajo en sí.",
      "Actualmente soy AI Engineer en Rampy, y esa es la dirección en la que estoy profundizando deliberadamente: agentes, recuperación, y la disciplina de ingeniería que los vuelve confiables en lugar de impresionantes una sola vez.",
    ],
    asideCurrently: "Actualmente",
    asideLevel: "Nivel",
    asideArrangement: "Modalidad de trabajo",
    asideLanguages: "Idiomas",
    asideAvailability: "Disponibilidad",
    principlesEyebrow: "Cómo trabajo",
    principlesHeading: "Cuatro cosas sobre las que tengo posición tomada",
    principles: [
      {
        title: "Contratos antes que código",
        body: "La interfaz entre dos sistemas es lo que sobrevive a ambos. Prefiero dedicar un día a la forma de una API que una semana a lo que pasa cuando dos servicios no se ponen de acuerdo sobre ella.",
      },
      {
        title: "Correcto bajo concurrencia, no solo en la demo",
        body: "Casi todo lo que construí tiene usuarios simultáneos reales: exámenes que se rinden, promociones que se ingieren, permisos que se verifican. La concurrencia es una propiedad del modelo de datos, así que ahí es donde pongo el esfuerzo.",
      },
      {
        title: "Medir antes de afirmar",
        body: "Cada cifra de este sitio lleva cómo fue observada, o dice con claridad que es una estimación. Un número sin condiciones es decoración, y trato de no publicar decoración.",
      },
      {
        title: "IA con el mismo estándar",
        body: "La recuperación y los agentes son software. Reciben el mismo tratamiento que todo lo demás: límites tipados, guardrails, tests en los caminos que importan, y observabilidad para que una respuesta mala se pueda rastrear en vez de adivinar.",
      },
    ],
    lookingEyebrow: "Qué estoy buscando",
    lookingHeading: "Trabajo remoto donde se encuentran ingeniería y producto",
    lookingBody:
      "Soy más útil donde el problema técnico y el problema de producto son el mismo problema, y " +
      "puedo empezar de inmediato. Si eso se parece a tu equipo, el trabajo está a un clic — y mi " +
      "bandeja de entrada también.",
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
      `${length} de ingeniería profesional, a ${asOf}. Las cifras de escala describen los ` +
      "productos; lo que hice se detalla por separado debajo.",
    experienceHeading: "Experiencia profesional",
    projectsEyebrow: "Proyectos seleccionados",
    projectsHeading: "Trabajo con evidencia pública",
    projectsBody:
      "Un proyecto está publicado por completo. Los sistemas que construí en Cooperativa " +
      "Obrera y Teamcubation administran datos internos de esas empresas, así que no tienen " +
      "enlaces públicos — la experiencia de arriba es el registro.",
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
      "Los repositorios son instantáneas publicadas que se conservan como evidencia de " +
      "portfolio. No son el historial de commits del desarrollo original, y no los presento " +
      "como prueba de quién escribió cada línea.",
    galleryHeading: "El producto en sí",
    galleryCaption:
      "Un recorrido por la interfaz, desde el inicio de sesión hasta la operación de un examen " +
      "en curso. Son capturas de una instancia de demostración, no de datos reales de ninguna " +
      "institución.",
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
    title: "Con qué trabajo, y dónde lo usé",
    intro:
      "Agrupado por para qué sirve y no por lenguaje, y cada grupo indica dónde lo usé. Una " +
      "lista de tecnologías sin ese contexto es apenas una lista.",
    fieldHeading: "Todo lo que uso",
    fieldIntro:
      "Las herramientas detrás del trabajo de arriba. Las marcas identifican la tecnología y no " +
      "implican ningún respaldo; el listado agrupado de abajo es el que vale.",
    fieldLabel: "Tecnologías",
    noteHeading: "Una nota sobre cómo está escrita esta lista",
    noteScope:
      "Las entradas de cloud y contenedores describen desarrollo de aplicaciones: construir " +
      "servicios, integrar servicios gestionados, configurar y diagnosticar workloads. No " +
      "reclaman administración de clústeres, aprovisionamiento de infraestructura ni " +
      "responsabilidad sobre la plataforma, porque ese no fue mi rol.",
    noteLogos:
      "Los nombres aparecen como texto y no como logos de proveedores. Redistribuir marcas de " +
      "terceros en un sitio personal está restringido por las políticas de marca de varios de " +
      "esos proveedores, y un logo no diría nada que el nombre no diga.",
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
      "Una carrera de ingeniería acreditada de cinco años, completada por entero, con el " +
      "registro publicado para quien quiera verificarlo.",
    curriculumEyebrow: "Plan de estudios",
    curriculumHeading: "El plan completo, las 34 materias",
    courseworkEyebrow: "Materias",
    courseworkHeading: "Materias relevantes",
    contextEyebrow: "Contexto institucional",
    contextHeading: "De dónde viene el título",
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
    evidenceHeading: "Verifica el registro",
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
      "El email es la vía más directa y lo respondo. Sin formularios, sin newsletter, sin embudo de agenda.",
    basedIn: (location, arrangement, timezone) =>
      `Vivo en ${location}, trabajo ${arrangement} en ${timezone}, y puedo empezar de ` +
      "inmediato — la fecha exacta es fácil de coordinar durante el proceso.",
    hiringHint:
      "Si estás contratando y preferís juzgar el trabajo antes que las palabras, empezá por el",
    hiringLinkText: "caso de estudio de Filomena",
    openToHeading: "Abierto a",
    resumeHeading: "Currículum",
    resumeNote: "Ambos incluyen un teléfono; el sitio no publica ninguno.",
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
