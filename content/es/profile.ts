import {
  email,
  externalLinks,
  professionalHeadline,
  resumeDownloads,
  resumeFilenames,
} from "../../config/site";
import type { EvidenceLink } from "../types";

export const profile = {
  name: "Gonzalo Martin Perez",
  role: professionalHeadline,
  currentPosition: "AI Engineer en Rampy",
  location: "Bahía Blanca, Argentina",
  timezone: "UTC-3",
  arrangement: "100% remoto",
  availability: "Abierto a oportunidades remotas y disponible para entrevistas",

  /** Prueba del primer pantallazo, sobre el nombre. Cada parte ocupa una línea en móviles. */
  heroProof: [
    "Único ingeniero en una fintech de EE. UU.",
    "3.000+ evaluaciones habilitan cada versión",
    "Remoto desde Argentina (UTC-3)",
  ],

  /** El mensaje de cinco segundos. Una idea por frase. */
  headline:
    "Construyo agentes LLM para producción, y las evaluaciones que demuestran que funcionan.",

  intro:
    "Soy Gonzalo, AI Engineer, y me ocupo del producto completo: los agentes y sus evaluaciones, además del backend, la web y la app móvil que los rodean.",

  summary:
    "En Rampy, una startup fintech de Estados Unidos, soy el único ingeniero. Construí un asistente de IA multilingüe que aprueba el 90% o más de una suite de evaluación de más de 3.000 casos y responde con componentes nativos que llevan directo a los flujos de swaps, vaults y perpetuos.",

  /** Etiqueta canónica exacta. Nunca Senior, Tech Lead, Architect ni Staff. */
  seniority: "Semi-senior",
  experienceLength: "Más de 2,5 años",
  experienceSince: "enero de 2024",

  languages: [
    { language: "Español", level: "Nativo" },
    { language: "Inglés", level: "Profesional (B2)" },
  ],
} as const;

export const contactLinks: EvidenceLink[] = [
  {
    label: email,
    href: `mailto:${email}`,
    description: "Email, la vía más directa",
  },
  {
    label: "linkedin.com/in/gonzalo-martin-perez",
    href: externalLinks.linkedin,
    description: "Perfil de LinkedIn",
  },
  {
    label: "github.com/gonzalomartinperez",
    href: externalLinks.github,
    description: "GitHub, código fuente público",
  },
];

export const resumeLinks: EvidenceLink[] = [
  {
    label: "CV en inglés (PDF)",
    href: resumeDownloads.en,
    download: resumeFilenames.en,
    description: "Dos páginas, actualizado en octubre de 2026",
  },
  {
    label: "CV en español (PDF)",
    href: resumeDownloads.es,
    download: resumeFilenames.es,
    description: "Dos páginas, actualizado en octubre de 2026",
  },
];

export const openTo = [
  "Ingeniería de IA: agentes LLM, evaluaciones, RAG/GraphRAG e integración de modelos de lenguaje",
  "Ingeniería de software, backend y full-stack",
  "Ingeniería de producto con responsabilidad completa sobre cada funcionalidad",
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
