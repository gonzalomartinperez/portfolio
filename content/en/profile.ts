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
  currentPosition: "AI Engineer at Rampy",
  location: "Bahía Blanca, Argentina",
  timezone: "UTC-3",
  arrangement: "100% remote",
  availability: "Open to remote opportunities and available for interviews",

  /** The five-second message. Kept to one clause per idea. */
  headline: "I build LLM agents for production, and the evals that show they work.",

  intro:
    "I’m Gonzalo, an AI engineer who owns the whole product: the agents and their evals, plus the backend, web and mobile app around them.",

  summary:
    "At Rampy, a US fintech startup, I’m the sole engineer. I built a multilingual AI assistant that passes 90%+ of a 3,000+ case eval suite and answers with native UI that links straight into swap, vault and perps flows.",

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
    label: "CV — English (PDF)",
    href: resumeDownloads.en,
    download: resumeFilenames.en,
    description: "Three pages, updated October 2026",
  },
  {
    label: "CV — Spanish (PDF)",
    href: resumeDownloads.es,
    download: resumeFilenames.es,
    description: "Three pages, updated October 2026",
  },
];

export const openTo = [
  "AI engineering: LLM agents, evals, RAG/GraphRAG and LLM integration",
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
