import type { AboutCopy } from "../about-copy";

export const aboutCopy: AboutCopy = {
  metaTitle: "Sobre mí",
  metaDescription:
    "Gonzalo Martin Perez: ingeniería de software, IA aplicada e ingeniería de producto. Trayectoria, forma de trabajar y oportunidades 100% remotas.",
  eyebrow: "Sobre mí",
  title: "Ingeniería de producto, con IA aplicada",
  intro:
    "Me gradué en Ingeniería en Sistemas de Información en la Universidad Nacional del Sur. Desde 2024 combino proyectos independientes con roles de ingeniería en software empresarial, fintech e integraciones blockchain.",
  paragraphs: [
    "Construí sistemas para comercios y backoffices empresariales, conectando servicios e incorporando integraciones fintech y blockchain. Mi proyecto final, Filomena, fue el cierre de esa etapa y llegó a convertirse en una plataforma de exámenes utilizada por cinco instituciones argentinas. Lo desarrollamos en un equipo de tres personas.",
    "Hoy trabajo en ingeniería de IA en Rampy, una startup donde colaboro directamente con tres fundadores. Ayudo a dar forma a las ideas, tomo decisiones técnicas y acompaño las funcionalidades hasta las pruebas y el despliegue. Las prioridades cambian, así que busco equilibrar entregas útiles con un producto cada vez más fácil de mantener y preparado para crecer.",
    "Conecto IA aplicada con estándares de ingeniería de software: rendimiento, robustez, escalabilidad, mantenibilidad y seguridad. Los llevo a la práctica con contratos claros, pruebas automatizadas, evaluaciones de agentes, observabilidad y ejecución controlada de herramientas.",
    "Mi experiencia en infraestructura para aplicaciones incluye Coolify para despliegues y proxies inversos para dirigir solicitudes a los servicios.",
    "Me gusta entender cómo encajan las piezas de un sistema, conversar sobre alternativas y dividir los problemas complejos en pasos pequeños para construir soluciones de punta a punta. Disfruto trabajar en equipo, aprender y aportar valor.",
  ],
  asideCurrently: "Actualmente",
  asideArrangement: "Modalidad",
  asideLanguages: "Idiomas",
  asideAvailability: "Disponibilidad",
  experienceAsOf: (asOf) => `A ${asOf}`,
  focusEyebrow: "Lo que aporto",
  focusHeading: "Conecto IA, producto y sistemas",
  focus: [
    {
      id: "ai",
      title: "IA integrada al producto",
      body: "Agentes, GraphRAG y herramientas conectadas con el contexto del negocio. Evaluaciones, guardrails y observabilidad para entender cómo se comportan y dónde necesitan mejorar.",
    },
    {
      id: "product",
      title: "Experiencias web y móviles",
      body: "Flujos claros, sistemas de diseño y componentes reutilizables. Conecto la interfaz con los servicios y cuido la velocidad percibida, la accesibilidad y los estados de error.",
    },
    {
      id: "systems",
      title: "Software empresarial y fintech",
      body: "Integraciones entre servicios, permisos y datos, con contratos explícitos. También conecto productos con protocolos DeFi, mercados y wallets, atendiendo a las particularidades de cada operación.",
    },
  ],
  principlesEyebrow: "Cómo trabajo",
  principlesHeading: "Estándares de ingeniería centrados en el usuario",
  principlesIntro:
    "Estos criterios guían cómo convierto una necesidad en una funcionalidad, desde las primeras preguntas hasta lo que ocurre después del lanzamiento.",
  principles: [
    {
      title: "Empiezo por lo que necesita el usuario",
      body: "Primero entiendo qué necesita resolver el usuario, qué limita la solución y cómo vamos a comprobar que funciona. A partir de ahí diseño una experiencia clara, accesible y útil.",
    },
    {
      title: "Construyo para evolucionar",
      body: "Organizo el código por dominio, separo responsabilidades y defino contratos claros. Uso componentes reutilizables y decisiones documentadas para que sumar funcionalidades sea más fácil de entender, probar y mantener.",
    },
    {
      title: "Mejoro el rendimiento con evidencia",
      body: "Mido el recorrido completo, identifico dónde se pierde tiempo y comparo el resultado después de cada cambio. Priorizo lo que el usuario percibe: un arranque ágil, respuestas rápidas y transiciones fluidas.",
    },
    {
      title: "Diseño para que los fallos tengan una salida",
      body: "Preveo entradas inválidas, problemas de permisos y fallos en servicios externos. Defino respuestas claras, opciones seguras y mecanismos de recuperación; la observabilidad me permite detectar problemas y actuar antes de que se agraven.",
    },
    {
      title: "Verifico la calidad hasta producción",
      body: "Combino pruebas automatizadas, validaciones de integración y revisión humana de la experiencia de uso. Después de publicar, observo el comportamiento real. En IA, también evalúo respuestas, uso de herramientas y guardrails con escenarios representativos.",
    },
  ],
  lookingEyebrow: "Mi próximo paso",
  lookingHeading: "Ingeniería de IA y software, con foco en producto",
  lookingParagraphs: [
    "Busco roles de ingeniería de IA 100% remotos para construir sistemas agénticos y soluciones de IA aplicada. Mi foco está en Python/FastAPI, LangChain/LangGraph, RAG/GraphRAG y recuperación sobre bases de datos vectoriales.",
    "También estoy abierto a roles de ingeniería de software, backend y full stack, donde pueda aportar mi experiencia en sistemas empresariales, aplicaciones web y móviles e integraciones. Me interesa participar en las decisiones de producto y acompañar las funcionalidades de punta a punta.",
    "Estoy abierto a nuevas oportunidades y disponible para entrevistas.",
  ],
};
