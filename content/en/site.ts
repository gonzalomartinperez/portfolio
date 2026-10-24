import { professionalHeadline } from "../../config/site";
import type { SiteCopy } from "../site-copy";
import { aboutCopy } from "./about";

export const siteCopy: SiteCopy = {
  chrome: {
    skipToContent: "Skip to content",
    roleSubtitle: professionalHeadline,
    mainNavLabel: "Main",
    footerNavLabel: "Footer",
    themeToggleNeutral: "Switch theme",
    themeToggleTo: (theme) => `Switch to ${theme} theme`,
    themeLight: "light",
    themeDark: "dark",
    languageLabel: "Language",
    footerSite: "Site",
    footerElsewhere: "Profiles",
    colophon: "Built with Next.js, React and TypeScript.",
  },
  nav: {
    about: "About",
    work: "Work",
    stack: "Stack",
    education: "Education",
    contact: "Contact",
    caseStudy: "Filomena case study",
    pequeversoCaseStudy: "Pequeverso case study",
  },
  actions: {
    seeWork: "Explore my work",
    getInTouch: "Get in touch",
    readCaseStudy: "Read the case study",
    viewCaseStudy: "View case study",
    fullExperience: "Full experience and projects",
    fullStack: "Explore all technologies",
    academicRecord: "Academic record",
    emailMe: "Email me",
    allContact: "All contact options",
    backToWork: "Back to experience and projects",
    sourceOnGithub: "Source on GitHub",
    goHome: "Take me home",
  },
  hero: {
    openToRemote: "Open to remote work",
    pauseAnimation: "Pause animation",
    playAnimation: "Play animation",
    avatarInteraction: "Interact with Gonzalo’s avatar",
    principles: [
      {
        title: "Evals first",
        description:
          "Quality is measured on representative scenarios, and evals gate each release.",
      },
      {
        title: "Grounded answers",
        description:
          "Retrieval and tools instead of guesses, with clear limits on what an agent can do.",
      },
      {
        title: "Latency and cost budgets",
        description:
          "Response time and tokens are product metrics, checked with load tests and evals.",
      },
      {
        title: "Full ownership",
        description: "From the agent and the API to the app and its behavior in production.",
      },
    ],
    principlesLabel: "Engineering principles",
    principlesLink: "See how I apply them →",
  },
  home: {
    whoEyebrow: "Who I am",
    whoHeading: "From AI agents to the product around them",
    whoParagraph:
      "Most of my work is with LangGraph, Claude, RAG and LangSmith: agents that call real tools, retrieval grounded in the business context and evals that decide what ships. I also build the APIs, back offices, web and mobile apps around them, from user needs and architecture through testing, deployment and monitoring.",
    whoAssistant: {
      lead: "My open-source ",
      link: "Portfolio Assistant",
      tail: " shows the same approach in public code: a bilingual RAG assistant with a 1,000-question eval bank.",
    },
    factCurrently: "Currently",
    factExperience: "Experience",
    factBasedIn: "Based in",
    factLanguages: "Languages",
    languagesValue: "Spanish (native) · English (B2)",
    experienceSince: (length, since) => `${length}, since ${since}`,
    rampyEyebrow: "Current role",
    rampyHeading: "LLM agents in production at Rampy",
    rampyCta: "See the Rampy work",
    rampyMarkets: {
      value: "200+",
      label: "perpetual markets shipped",
      qualifier:
        "Hyperliquid markets across crypto, indices, stocks and commodities, alongside swaps across 100+ tokens.",
    },
    selectedEyebrow: "Selected work",
    selectedHeading: "Case studies and open-source work",
    workEyebrow: "Featured project",
    workHeading: "Shipped to production while still at university",
    experienceEyebrow: "Experience",
    experienceHeading: "Products, teams and contributions",
    stackEyebrow: "Stack",
    stackHeading: "One engineering toolkit, across the product",
    stackIntro:
      "Explore the languages, frameworks and practices behind my work, with links to the projects and roles where they apply.",
    educationEyebrow: "Education",
    educationHeading: "Information Systems Engineer, UNS",
    educationBody:
      "Graduated from Universidad Nacional del Sur in October 2025 with an 8.67/10 average " +
      "across 34 of 34 required courses, and a final-year project graded 10/10.",
    closingHeading: "Let's talk",
    closingInvitation: "Let’s talk about your product.",
    closingAvailability: "I’m open to fully remote opportunities.",
    closingBody:
      "Building an AI product and need someone who can own it from the agent to production?",
  },
  about: aboutCopy,
  work: {
    metaTitle: "Work",
    metaDescription:
      "Professional experience and selected projects: LLM agents and evals at Rampy, a GraphRAG " +
      "assistant and event pipelines at Payway, an enterprise permissions back office, " +
      "independent product engineering, and Filomena.",
    eyebrow: "Work",
    title: "Experience and selected projects",
    intro: "2.5+ years shipping AI agents, fintech products and enterprise systems to production.",
    experienceHeading: "Professional experience",
    projectsEyebrow: "Selected projects",
    projectsHeading: "Explore the products in detail",
    projectsBody:
      "Filomena brings together the product walkthrough, architecture decisions and public source snapshots. Portfolio Assistant is my open-source eval work. For enterprise work, the experience above describes the contribution and operating context.",
  },
  filomena: {
    metaTitle: "Filomena: a production exam platform",
    metaDescription:
      "How a CakePHP and jQuery monolith became an API-first platform running high-stakes exams " +
      "for five Argentine national institutions, with 1,000+ simultaneous users in production.",
    caseStudyLabel: "Case study",
    architectureHeading: "Architecture",
    architectureCaption: "Request path from the browser down, after the rebuild.",
    decisionsHeading: "Engineering decisions",
    changesHeading: "What changed",
    changesCaption: "The first version compared with the platform now in production.",
    columnAspect: "Aspect",
    columnBefore: "Before",
    columnAfter: "After",
    evidenceHeading: "Evidence",
    evidenceNote:
      "The product walkthrough and engineering context are included on this page. The linked repositories are public source snapshots; they document the implementation, not the original development history or deployment pipeline.",
    galleryHeading: "Explore the application",
    galleryCaption:
      "43 reviewed demonstration screens covering administration, student exams, evaluation and operational monitoring. Browse the workflows or enlarge a screen for a closer look.",
    galleryLabel: "Filomena interface walkthrough",
    galleryPrevious: "Previous screen",
    galleryNext: "Next screen",
    galleryPosition: (current, total) => `Screen ${current} of ${total}`,
  },
  pequeverso: {
    metaTitle: "Pequeverso: a store with an AI shopping assistant",
    metaDescription:
      "Client case study: a Next.js store with Hotmart checkout and Meta Conversions API, a private back office, and a GraphRAG shopping assistant on LangGraph evaluated before launch.",
    architectureHeading: "Architecture",
    architectureCaption: "Three applications, from the buyer's browser to the private back office.",
    decisionsHeading: "Engineering decisions",
    galleryHeading: "Explore the product",
    galleryCaption:
      "Real captures from the public repositories: the store, the assistant running locally with a test model, and the back office with synthetic data. Enlarge a screen for a closer look.",
    galleryLabel: "Pequeverso product walkthrough",
    evidenceHeading: "Evidence",
    evidenceNote:
      "The three repositories are public. The back office application itself is private, and its screenshots use synthetic data.",
  },
  stack: {
    metaTitle: "Stack",
    metaDescription:
      "Technology grouped by capability (applied AI and agentic systems, backend and APIs, " +
      "data and architecture, cloud and delivery), with the work that backs each group.",
    eyebrow: "Stack",
    title: "The technology behind the work",
    intro:
      "From interfaces and service contracts to retrieval and agent workflows. Explore the full toolkit by capability, and follow each entry to its professional context.",
    fieldHeading: "The stack behind agents that ship",
    fieldIntro:
      "What I use in production, from LangGraph and evals to the APIs and apps around them.",
    groupedHeading: "Grouped by what it does",
    groupedIntro: "Each tool links to the role or project where I used it.",
    fieldLabel: "Technologies",
    noteHeading: "Experience behind the toolkit",
    noteScope:
      "At Rampy, I work with DigitalOcean infrastructure and deployments. In other roles, I used AWS and Kubernetes to integrate services, develop applications, and troubleshoot issues.",
    noteApproach:
      "My focus is on developing applications and shipping them to production. My infrastructure toolkit includes Coolify for deployments and knowledge of NGINX, Traefik, and Caddy for serving applications and routing requests.",
  },
  education: {
    metaTitle: "Education",
    metaDescription:
      "Information Systems Engineer from Universidad Nacional del Sur: 8.67/10 average across " +
      "34 of 34 required courses, a 10/10 final-year project, and verified public evidence.",
    eyebrow: "Education",
    title: "Information Systems Engineering",
    intro:
      "A five-year accredited engineering degree combining software architecture, mathematics, systems and applied project work.",
    curriculumEyebrow: "Curriculum",
    curriculumHeading: "The five-year program",
    courseworkEyebrow: "Coursework",
    courseworkHeading: "Relevant subjects",
    contextEyebrow: "Institutional context",
    contextHeading: "Universidad Nacional del Sur",
    projectEyebrow: "Final-year project",
    projectHeading: "Filomena, graded 10/10",
    projectBody:
      "My final-year project became a platform that five Argentine national institutions now " +
      "run in production. It was built by a three-person team, with me as principal author and " +
      "contributor.",
    certificationsEyebrow: "Certifications",
    certificationsHeading: "Additional certifications",
    certificationsDescription:
      "Additional training completed in container fundamentals and professional skills.",
    languagesEyebrow: "Languages",
    languagesHeading: "Spanish and English",
    evidenceEyebrow: "Evidence",
    evidenceHeading: "Academic record and verification",
    evidenceBody:
      "The full academic record is published with official verification from the university.",
  },
  contact: {
    metaTitle: "Contact",
    metaDescription:
      "Get in touch with Gonzalo Martin Perez, AI engineer, software engineer and product " +
      "engineer, open to remote roles. Email, LinkedIn and GitHub.",
    eyebrow: "Contact",
    title: "Let's talk",
    intro:
      "Tell me about your team, the product and the engineering challenges you have in mind. Email is the most direct way to reach me.",
    basedIn: (location, arrangement, timezone) =>
      `Based in ${location} (${timezone}), working ${arrangement}. I’m open to new opportunities and available for interviews.`,
    hiringHint: "For a closer look at my product and engineering work, explore the",
    hiringLinkText: "production experience and outcomes",
    openToHeading: "Open to",
    resumeHeading: "CV",
    resumeNote: "Download my updated CV in English or Spanish.",
  },
  notFound: {
    metaTitle: "Page not found",
    eyebrow: "Error 404",
    title: "This page does not exist",
    body:
      "The link may be out of date, or the address may have a typo. No harm done: everything on " +
      "the site is reachable from the navigation above.",
  },
};
