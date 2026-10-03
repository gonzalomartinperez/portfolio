import { email, externalLinks, resumeDownloads } from "../site-config";
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
  headline: "Transformo sistemas complejos de IA y fintech en productos rápidos y cuidados.",

  intro:
    "Soy Gonzalo, ingeniero de software especializado en IA aplicada. Transformo ideas en productos útiles: desde agentes de IA y servicios backend hasta aplicaciones web y móviles.",

  summary:
    "En Rampy entrego experiencias productivas de IA, fintech y mobile: consultas financieras más rápidas, una aplicación renovada y un design system completo. También desarrollé flujos GraphRAG empresariales, contribuí a una carga de 20M+ promociones y diseñé permisos para más de 10 integraciones.",

  /** Etiqueta canónica exacta. Nunca Senior, Tech Lead, Architect ni Staff. */
  seniority: "Semi-senior",
  experienceLength: "2 años y 9 meses",
  experienceSince: "enero de 2024",
  experienceAsOf: "octubre de 2026",

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
    label: "CV — Inglés (PDF)",
    href: resumeDownloads.en,
    description: "Tres páginas, actualizado en octubre de 2026",
  },
  {
    label: "CV — Español (PDF)",
    href: resumeDownloads.es,
    description: "Tres páginas, actualizado en octubre de 2026",
  },
];

export const openTo = [
  "Ingeniería de IA: agentes, RAG e integración de modelos de lenguaje",
  "Ingeniería de software, backend y full-stack",
  "Ingeniería de producto con responsabilidad de punta a punta",
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
