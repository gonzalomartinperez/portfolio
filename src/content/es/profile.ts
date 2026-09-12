import { email, externalLinks, resumeFiles } from "../site-config";
import type { EvidenceLink } from "../types";

export const profile = {
  name: "Gonzalo Martin Perez",
  role: "AI Software Engineer",
  currentPosition: "AI Engineer en Rampy",
  location: "Bahía Blanca, Argentina",
  timezone: "UTC-3",
  arrangement: "100% remoto",
  availability: "Abierto a roles remotos, disponible de inmediato",

  /** El mensaje de cinco segundos. Una idea por frase. */
  headline: "Construyo sistemas productivos, y la IA que corre dentro de ellos.",

  intro:
    "Soy AI Software Engineer. Trabajo en todo el recorrido que va de la interfaz al dato — " +
    "interfaces de producto, BFFs, microservicios event-driven — y construyo sistemas de " +
    "recuperación y agénticos con la misma disciplina de ingeniería: contratos, tests, " +
    "guardrails, observabilidad. Si buscás a alguien que pueda hacerse cargo de un problema de " +
    "punta a punta, esa es la parte que más disfruto.",

  summary:
    "La mayor parte de mi trabajo fue convertir dominios complejos en software que aguanta en " +
    "producción: una plataforma de promociones a escala fintech, un backoffice de permisos que " +
    "abarca los sistemas internos de una empresa, y una plataforma de exámenes que hoy usan " +
    "cinco instituciones. La IA aplicada es donde estoy profundizando deliberadamente, y ya " +
    "forma parte de ese trabajo en lugar de ser una vía aparte.",

  /** Etiqueta canónica exacta. Nunca Senior, Tech Lead, Architect ni Staff. */
  seniority: "Semi-senior",
  experienceLength: "2 años y 8 meses",
  experienceSince: "enero de 2024",
  experienceAsOf: "septiembre de 2026",

  languages: [
    { language: "Español", level: "Nativo" },
    { language: "Inglés", level: "Profesional (B2)" },
  ],
} as const;

export const contactLinks: EvidenceLink[] = [
  {
    label: email,
    href: `mailto:${email}`,
    description: "Email — la vía más directa",
  },
  {
    label: "linkedin.com/in/gonzalo-martin-perez",
    href: externalLinks.linkedin,
    description: "Perfil de LinkedIn",
  },
  {
    label: "github.com/gonzalomartinperez",
    href: externalLinks.github,
    description: "GitHub — código fuente público",
  },
];

export const resumeLinks: EvidenceLink[] = [
  {
    label: "Currículum — Inglés (PDF)",
    href: resumeFiles.en,
    description: "Tres páginas, actualizado en septiembre de 2026",
  },
  {
    label: "Currículum — Español (PDF)",
    href: resumeFiles.es,
    description: "Tres páginas, actualizado en septiembre de 2026",
  },
];

export const openTo = [
  "Ingeniería de software, backend y full-stack",
  "AI engineering: agentes, RAG, integración de LLMs",
  "Product engineering con responsabilidad de punta a punta",
];
