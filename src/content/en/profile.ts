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
    "I am an AI Software Engineer. I work across the whole path from interface to data — " +
    "product interfaces, BFFs, event-driven microservices — and I build retrieval and agentic " +
    "systems with the same engineering discipline: contracts, tests, guardrails, observability.",

  summary:
    "Most of my work has been turning complicated domains into software that holds up in " +
    "production: a promotions platform at fintech scale, a permissions back office spanning an " +
    "enterprise's internal systems, and an exam platform that five institutions now run on. " +
    "Applied AI is where I am deliberately going deeper, and it is already part of that work " +
    "rather than a separate track.",

  /** Kept exactly at the canonical label. Never Senior, Tech Lead, Architect or Staff. */
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
    label: "Résumé — English (PDF)",
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
