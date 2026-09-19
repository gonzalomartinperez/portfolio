import type { SiteCopy } from "../site-copy";

export const siteCopy: SiteCopy = {
  chrome: {
    skipToContent: "Skip to content",
    roleSubtitle: "AI Software Engineer",
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
  },
  actions: {
    seeWork: "Explore my work",
    getInTouch: "Get in touch",
    readCaseStudy: "Read the case study",
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
        title: "Scalability",
        description: "Clear service boundaries, asynchronous work and deliberate data access.",
      },
      {
        title: "Maintainability",
        description: "Readable code, reusable components and documented decisions.",
      },
      {
        title: "Software quality",
        description: "Automated tests, agent evaluations and human review before delivery.",
      },
    ],
    principlesLabel: "Engineering principles",
    principlesLink: "See how I apply them →",
  },
  home: {
    whoEyebrow: "Who I am",
    whoHeading: "From complex systems to useful products",
    whoParagraph:
      "I approach development across the whole product: understanding requirements, defining service boundaries and checking how the application behaves under real workloads.",
    factCurrently: "Currently",
    factExperience: "Experience",
    factBasedIn: "Based in",
    factLanguages: "Languages",
    languagesValue: "Spanish (native) · English (B2)",
    experienceSince: (length, since) => `${length}, since ${since}`,
    workEyebrow: "Selected work",
    workHeading: "Filomena: from university project to production",
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
    closingBody:
      "Looking for someone who combines software engineering with applied AI? Let’s talk about your product and a fully remote role.",
  },
  about: {
    metaTitle: "About",
    metaDescription:
      "Gonzalo Martin Perez — AI Software Engineer. Background, how I approach engineering " +
      "work, and what I am looking for.",
    eyebrow: "About",
    title: "Software engineering, with applied AI at its core",
    paragraphs: [
      "I’m Gonzalo, an Information Systems Engineer from Universidad Nacional del Sur and an AI Software Engineer. Since 2024, I’ve combined independent client projects with engineering roles in enterprise software and fintech.",
      "I’ve built merchant-facing experiences, service integrations and a permissions back office. As the principal contributor in a three-person team, I also helped turn Filomena into an exam platform used by five institutions.",
      "Today I’m an AI Engineer at Rampy, a fast-moving startup where I work directly with three founders. I help shape ideas, make technical decisions and carry features through testing and deployment. Priorities evolve, so I balance getting useful changes into users’ hands with making the product easier to maintain and grow.",
      "I connect applied AI with the engineering around it: explicit contracts, automated evaluations, controlled tool execution and maintainable services. My DeFi work includes Morpho, Aave and Compound integrations, bringing product interfaces and backend execution together.",
      "I enjoy understanding how the pieces fit together, discussing options and turning a complex problem into a clear next step. I’m looking for an AI engineering team where I can keep building, learning and contributing across the product.",
    ],
    asideCurrently: "Currently",
    asideArrangement: "Working arrangement",
    asideLanguages: "Languages",
    asideAvailability: "Availability",
    principlesEyebrow: "How I work",
    principlesHeading: "How I turn requirements into working systems",
    principles: [
      {
        title: "Clear integration boundaries",
        body: "At Cooperativa Obrera, a shared API contract connected independent systems to one back office. I use contracts to keep interfaces and service-specific logic separate.",
      },
      {
        title: "Performance on real workloads",
        body: "Bulk promotion loads, permission queries and concurrent exams have shaped how I work with data: query tuning, indexes, caching and isolated load tooling.",
      },
      {
        title: "Product responsibility",
        body: "At Rampy, I translate founder requirements into web, mobile and backend changes, then carry them through testing and deployment. Product and engineering decisions belong in the same conversation.",
      },
      {
        title: "AI connected to the application",
        body: "I evaluate complete journeys, tool selection and response behavior, combine automated checks with human review, and keep context and memory relevant to the task.",
      },
    ],
    lookingEyebrow: "What I am looking for",
    lookingHeading: "Remote work where engineering and product meet",
    lookingBody:
      "I’m prioritizing fully remote AI Engineer roles focused on applied AI, agents and retrieval, while remaining open to software engineering opportunities with meaningful product responsibility. I’m available immediately, with the exact date agreed during the process.",
  },
  work: {
    metaTitle: "Work",
    metaDescription:
      "Professional experience and selected projects: production AI at Rampy, event pipelines at Payway, " +
      "an enterprise permissions back office, independent product engineering, and Filomena.",
    eyebrow: "Work",
    title: "Experience and selected projects",
    intro: (length, asOf) =>
      `${length} of professional experience as of ${asOf}, building products across fintech, enterprise systems and applied AI.`,
    experienceHeading: "Professional experience",
    projectsEyebrow: "Selected projects",
    projectsHeading: "Explore the product in detail",
    projectsBody:
      "Filomena brings together the product walkthrough, architecture decisions and public source snapshots. For enterprise work, the experience above describes the contribution and operating context.",
  },
  filomena: {
    metaTitle: "Filomena — production exam platform",
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
  stack: {
    metaTitle: "Stack",
    metaDescription:
      "Technology grouped by capability — applied AI and agentic systems, backend and APIs, " +
      "data and architecture, cloud and delivery — with the work that backs each group.",
    eyebrow: "Stack",
    title: "The technology behind the work",
    intro:
      "From interfaces and service contracts to retrieval and agent workflows. Explore the full toolkit by capability, and follow each entry to its professional context.",
    fieldHeading: "A connected engineering toolkit",
    fieldIntro: "Languages, frameworks and tools used across product development and applied AI.",
    fieldLabel: "Technologies",
    noteHeading: "Experience behind the toolkit",
    noteScope:
      "At Rampy, my work includes DigitalOcean infrastructure and delivery. AWS and Kubernetes experience elsewhere covers application integration, development and diagnostics, not cluster administration.",
    noteLogos: "These logos identify the tools I use and do not imply endorsement.",
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
    certificationsHeading: "Completed credentials",
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
      "Get in touch with Gonzalo Martin Perez — AI Software Engineer, available immediately for " +
      "remote roles. Email, LinkedIn and GitHub.",
    eyebrow: "Contact",
    title: "Let's talk",
    intro:
      "Tell me about your team, the product and the engineering challenges ahead. Email is the quickest way to reach me.",
    basedIn: (location, arrangement, timezone) =>
      `Based in ${location} (${timezone}), working ${arrangement}. Available to start immediately, with the exact date agreed during the hiring process.`,
    hiringHint: "For a closer look at my product and engineering work, explore the",
    hiringLinkText: "Filomena case study",
    openToHeading: "Open to",
    resumeHeading: "CV",
    resumeNote: "Download the English or Spanish CV for experience, skills and contact details.",
  },
  notFound: {
    metaTitle: "Page not found",
    eyebrow: "Error 404",
    title: "This page does not exist",
    body:
      "The link may be out of date, or the address may have a typo. No harm done — everything on " +
      "the site is reachable from the navigation above.",
  },
};
