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
  headline: "Construyo software que conecta productos, sistemas e IA.",

  intro:
    "Desde interfaces y servicios backend hasta recuperación de contexto y agentes, convierto requisitos complejos en aplicaciones funcionales.",

  summary:
    "Mi trabajo conecta plataformas fintech, sistemas empresariales e IA aplicada. Construyo interfaces, BFFs, microservicios y flujos de datos, con experiencia en un asistente RAG para comercios y una plataforma de exámenes usada por cinco instituciones.",

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

/** Contact channels with their brand glyph, for the icon links. */
export const contactChannels = [
  {
    icon: "gmail",
    name: "Email",
    detail: email,
    href: `mailto:${email}`,
    external: false,
    newTabHint: "se abre en una pestaña nueva",
  },
  {
    icon: "linkedin",
    name: "LinkedIn",
    detail: "in/gonzalo-martin-perez",
    href: externalLinks.linkedin,
    external: true,
    newTabHint: "se abre en una pestaña nueva",
  },
  {
    icon: "github",
    name: "GitHub",
    detail: "gonzalomartinperez",
    href: externalLinks.github,
    external: true,
    newTabHint: "se abre en una pestaña nueva",
  },
];
