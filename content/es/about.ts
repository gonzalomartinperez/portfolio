import type { AboutCopy } from "../about-copy";

export const aboutCopy: AboutCopy = {
  metaTitle: "Sobre mí",
  metaDescription:
    "Gonzalo Martin Perez: ingeniería de IA, ingeniería de software e ingeniería de producto. Trayectoria, forma de trabajar y oportunidades 100% remotas.",
  eyebrow: "Sobre mí",
  title: "Agentes LLM integrados en productos reales",
  intro:
    "Me gradué en Ingeniería en Sistemas de Información en la Universidad Nacional del Sur. Desde 2024 combino proyectos independientes con roles de ingeniería en software empresarial, fintech e integraciones blockchain.",
  paragraphs: [
    "Construí sistemas para comercios y backoffices empresariales, conectando servicios e incorporando integraciones fintech y blockchain. Mi proyecto final, Filomena, fue el cierre de esa etapa y llegó a convertirse en una plataforma de exámenes utilizada por cinco instituciones argentinas. Lo desarrollamos en un equipo de tres personas.",
    "Lidero la ingeniería en Rampy, trabajo directamente con los tres cofundadores y con colaboradores en blockchain e integraciones. Rampy es una startup fintech y blockchain en etapa temprana cuya app no custodial acerca el mundo de los activos digitales (swaps, vaults de rendimiento, perpetuos y noticias de mercado) a cualquier persona mediante una interfaz generativa que vuelve simples los conceptos complejos. Me ocupo del asistente de IA (los agentes, sus evaluaciones y el backend que los sostiene) y de la web y la app móvil donde la gente lo usa, sobre un código que tomé de desarrolladores anteriores. Las prioridades cambian rápido, así que busco equilibrar entregas útiles con un producto fácil de mantener y preparado para crecer.",
    "Trato la confiabilidad como algo que se mide: contratos tipados entre el agente y la interfaz, pruebas automatizadas, evaluaciones antes de cada versión, trazas en producción y herramientas que solo se ejecutan dentro de límites explícitos.",
    "Cuando un equipo pequeño lo necesita, también me ocupo del despliegue: Coolify, NGINX, Traefik y Caddy.",
    "Me gusta el momento en que una pregunta de producto difusa se vuelve medible: qué debe hacer el agente, cómo lo probamos y cuánto cuesta. Ahí es donde suelo aportar más a un equipo pequeño.",
  ],
  asideCurrently: "Actualmente",
  asideArrangement: "Modalidad",
  asideLanguages: "Idiomas",
  asideAvailability: "Disponibilidad",
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
    "Busco roles de AI Engineer 100% remotos para construir agentes LLM, sistemas RAG y GraphRAG, y las evaluaciones que los mantienen confiables. Mi stack principal es Python/FastAPI, LangGraph, Claude, LangSmith y recuperación vectorial.",
    "También estoy abierto a roles de ingeniería de software, backend y full stack, donde pueda aportar mi experiencia en sistemas empresariales, aplicaciones web y móviles e integraciones. Me interesa participar en las decisiones de producto y acompañar las funcionalidades desde los requisitos iniciales hasta producción.",
    "Estoy abierto a nuevas oportunidades y disponible para entrevistas.",
  ],
};
