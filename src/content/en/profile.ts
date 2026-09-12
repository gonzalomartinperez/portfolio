import { email, externalLinks, resumeFiles } from "../site-config";
import type { EvidenceLink } from "../types";

export const profile = {
  name: "Gonzalo Martin Perez",
  role: "AI Software Engineer",
  currentPosition: "AI Engineer at Rampy",
  location: "Bahía Blanca, Argentina",
  timezone: "UTC-3",
  arrangement: "100% remote",
  availability: "Open to remote roles, available immediately",

  /** The five-second message. Kept to one clause per idea. */
  headline: "I build production systems, and the AI that runs inside them.",

  intro:
    "I'm an AI Software Engineer. I take a problem from the interface down to the data and own " +
    "the whole path — product interfaces, BFFs, event-driven microservices — and I build " +
    "retrieval and agentic systems to the same standard: contracts, tests, guardrails, " +
    "observability. Give me the part of the system nobody wants to touch; that is the part I " +
    "do best.",

  summary:
    "I have spent my career turning complicated domains into software that holds up in " +
    "production: a promotions platform at fintech scale, a permissions back office spanning an " +
    "enterprise's internal systems, and an exam platform five institutions now depend on. In " +
    "each one I was trusted with the architecture, not just the tickets. Applied AI runs " +
    "through that work rather than sitting beside it.",

  /**
   * Retained because structured forms elsewhere ask for it, and deliberately not published:
   * a portfolio is not a structured field, and a level label only narrows how a reader sizes
   * the work. Never Senior, Tech Lead, Architect or Staff.
   */
  seniority: "Mid-level",
  experienceLength: "2 years and 8 months",
  experienceSince: "January 2024",
  experienceAsOf: "September 2026",

  languages: [
    { language: "Spanish", level: "Native" },
    { language: "English", level: "Professional working proficiency (B2)" },
  ],
} as const;

export const contactLinks: EvidenceLink[] = [
  {
    label: email,
    href: `mailto:${email}`,
    description: "Email — the most direct route",
  },
  {
    label: "linkedin.com/in/gonzalo-martin-perez",
    href: externalLinks.linkedin,
    description: "LinkedIn profile",
  },
  {
    label: "github.com/gonzalomartinperez",
    href: externalLinks.github,
    description: "GitHub — public source code",
  },
];

export const resumeLinks: EvidenceLink[] = [
  {
    label: "Resume — English (PDF)",
    href: resumeFiles.en,
    description: "Three pages, updated September 2026",
  },
  {
    label: "Currículum — Español (PDF)",
    href: resumeFiles.es,
    description: "Tres páginas, actualizado en septiembre de 2026",
  },
];

export const openTo = [
  "Software, backend and full-stack engineering",
  "AI engineering: agents, RAG, LLM integration",
  "Product engineering with end-to-end ownership",
];

/** Contact channels with their brand glyph, for the icon links. */
export const contactChannels = [
  {
    icon: "gmail",
    name: "Email",
    detail: email,
    href: `mailto:${email}`,
    external: false,
    newTabHint: "opens in a new tab",
  },
  {
    icon: "linkedin",
    name: "LinkedIn",
    detail: "in/gonzalo-martin-perez",
    href: externalLinks.linkedin,
    external: true,
    newTabHint: "opens in a new tab",
  },
  {
    icon: "github",
    name: "GitHub",
    detail: "gonzalomartinperez",
    href: externalLinks.github,
    external: true,
    newTabHint: "opens in a new tab",
  },
];
