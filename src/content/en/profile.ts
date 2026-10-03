import { email, externalLinks, resumeDownloads } from "../site-config";
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
  headline: "I turn complex AI and fintech systems into fast, polished products.",

  intro:
    "I’m Gonzalo, an AI Software Engineer. I turn ideas into useful products, from AI agents and backend services to web and mobile apps.",

  summary:
    "At Rampy, I ship production AI, fintech and mobile experiences: faster financial queries, a redesigned app and a complete design system. I also built enterprise GraphRAG workflows, contributed to a 20M+ promotions load and designed permission systems across 10+ integrations.",

  /**
   * Retained because structured forms elsewhere ask for it, and deliberately not published:
   * a portfolio is not a structured field, and a level label only narrows how a reader sizes
   * the work. Never Senior, Tech Lead, Architect or Staff.
   */
  seniority: "Mid-level",
  experienceLength: "2 years and 9 months",
  experienceSince: "January 2024",
  experienceAsOf: "October 2026",

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
    label: "CV — English (PDF)",
    href: resumeDownloads.en,
    description: "Three pages, updated October 2026",
  },
  {
    label: "CV — Spanish (PDF)",
    href: resumeDownloads.es,
    description: "Three pages, updated October 2026",
  },
];

export const openTo = [
  "AI engineering: agents, RAG, LLM integration",
  "Software, backend and full-stack engineering",
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
