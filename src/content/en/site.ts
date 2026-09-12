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
    footerElsewhere: "Elsewhere",
    colophon: "Next.js · TypeScript · no tracking",
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
    seeWork: "See the work",
    getInTouch: "Get in touch",
    readCaseStudy: "Read the case study",
    fullExperience: "Full experience and projects",
    fullStack: "Full stack",
    academicRecord: "Academic record",
    emailMe: "Email me",
    allContact: "All contact options",
    backToWork: "Back to all work",
    sourceOnGithub: "Source on GitHub",
    goHome: "Take me home",
  },
  hero: {
    openToRemote: "Open to remote work",
    pauseAnimation: "Pause animation",
    playAnimation: "Play animation",
    proof: [
      { value: "20M+", label: "promotions in production" },
      { value: "1,000+", label: "simultaneous platform users" },
      { value: "10+", label: "enterprise systems integrated" },
    ],
    proofNote: "Figures describe the products.",
    proofNoteLink: "What I did is listed separately.",
  },
  home: {
    whoEyebrow: "Who I am",
    whoHeading: "Engineering that holds up after the demo",
    whoParagraph:
      "I care about the parts that decide whether software survives contact with real use: " +
      "clear contracts between services, data models that stay correct under concurrency, and " +
      "enough observability to know what happened without guessing. It's less glamorous than a " +
      "demo, and it's what makes the difference six months in.",
    factCurrently: "Currently",
    factExperience: "Experience",
    factBasedIn: "Based in",
    factLanguages: "Languages",
    languagesValue: "Spanish (native) · English (B2)",
    experienceSince: (length, since) => `${length}, since ${since}`,
    workEyebrow: "Selected work",
    workHeading: "The project I would point at first",
    experienceEyebrow: "Experience",
    experienceHeading: "Where I have built things",
    stackEyebrow: "Stack",
    stackHeading: "What I reach for",
    stackIntro:
      "Grouped by what it is for, not by language. Each group is backed by the work listed above.",
    educationEyebrow: "Education",
    educationHeading: "Information Systems Engineer, UNS",
    educationBody:
      "Graduated from Universidad Nacional del Sur in October 2025 with an 8.67/10 average " +
      "across 34 of 34 required courses, and a final year project graded 10/10.",
    closingHeading: "Let's talk",
    closingBody:
      "I'm open to remote roles in software, backend and AI engineering, and I can start right " +
      "away. If any of this looks like the problem you're hiring for, I'd genuinely like to " +
      "hear about it — email is the quickest route, and I answer.",
  },
  about: {
    metaTitle: "About",
    metaDescription:
      "Gonzalo Martin Perez — AI Software Engineer. Background, how I approach engineering " +
      "work, and what I am looking for.",
    eyebrow: "About",
    title: "I turn complicated domains into software people can actually operate",
    paragraphs: [
      "My route in was a five-year engineering degree at Universidad Nacional del Sur, alongside independent client work that started in 2024 and has not really stopped. The through-line is product engineering: I like owning a thing from the interface down to the queue that makes it work.",
      "Since then I have worked on a promotions platform at fintech scale, a permissions back office spanning an enterprise's internal systems, and an exam platform that five institutions depend on. Applied AI runs through the recent work rather than sitting beside it — a retrieval assistant inside a merchant product, agent pipelines for clients, and the agentic engineering environments I build to do the work itself.",
      "I am currently an AI Engineer at Rampy, and that is the direction I am deliberately going deeper in: agents, retrieval, and the engineering discipline that makes them dependable rather than impressive once.",
    ],
    asideCurrently: "Currently",
    asideLevel: "Level",
    asideArrangement: "Working arrangement",
    asideLanguages: "Languages",
    asideAvailability: "Availability",
    principlesEyebrow: "How I work",
    principlesHeading: "Four things I am opinionated about",
    principles: [
      {
        title: "Contracts before code",
        body: "The interface between two systems is the thing that outlives both of them. I would rather spend a day on the shape of an API than a week on what happens when two services disagree about it.",
      },
      {
        title: "Correct under concurrency, not just under demo",
        body: "Most of what I have built has real simultaneous users — exams being sat, promotions being ingested, permissions being checked. Concurrency is a property of the data model, so that is where I put the effort.",
      },
      {
        title: "Measure before claiming",
        body: "Every figure on this site carries how it was observed, or says plainly that it is an estimate. A number without conditions is decoration, and I try not to publish decoration.",
      },
      {
        title: "AI held to the same standard",
        body: "Retrieval and agents are software. They get the same treatment as everything else: typed boundaries, guardrails, tests on the paths that matter, and observability so a bad answer can be traced rather than guessed at.",
      },
    ],
    lookingEyebrow: "What I am looking for",
    lookingHeading: "Remote work where engineering and product meet",
    lookingBody:
      "I'm most useful where the technical problem and the product problem are the same problem, " +
      "and I can start immediately. If that sounds like your team, the work is one click away — " +
      "and so is my inbox.",
  },
  work: {
    metaTitle: "Work",
    metaDescription:
      "Professional experience and selected projects: fintech-scale event pipelines at Payway, " +
      "an enterprise permissions back office, independent product engineering, and Filomena.",
    eyebrow: "Work",
    title: "Experience and selected projects",
    intro: (length, asOf) =>
      `${length} of professional engineering, as of ${asOf}. Product-scale figures describe the ` +
      "systems; what I did is listed separately underneath.",
    experienceHeading: "Professional experience",
    projectsEyebrow: "Selected projects",
    projectsHeading: "Work with public evidence",
    projectsBody:
      "One project is published in full, with its source. The systems I built at Cooperativa " +
      "Obrera and Teamcubation administer internal company data, so they have no public links — " +
      "the experience above is the record, and I'm happy to walk through either in a conversation.",
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
      "The repositories are published snapshots kept as portfolio evidence. They are not a " +
      "commit history of the original development, and I do not present them as proof of who " +
      "wrote which line.",
    galleryHeading: "The product itself",
    galleryCaption:
      "A walkthrough of the interface, from signing in to operating a running exam. These are " +
      "captures from a demonstration instance, not from any institution's live data.",
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
    title: "What I work with, and where I used it",
    intro:
      "Grouped by what it is for rather than by language, and each group names where I used it. " +
      "A list of technologies without that context is just a list.",
    noteHeading: "A note on how this list is written",
    noteScope:
      "Cloud and container entries describe application development: building services, " +
      "integrating managed services, configuring and diagnosing workloads. They do not claim " +
      "cluster administration, infrastructure provisioning or platform ownership, because that " +
      "was not my role.",
    noteLogos:
      "Names appear as text rather than as vendor logos. Redistributing third-party marks on a " +
      "personal site is restricted by several of those vendors' own brand policies, and a logo " +
      "would not tell you anything the name does not.",
  },
  education: {
    metaTitle: "Education",
    metaDescription:
      "Information Systems Engineer from Universidad Nacional del Sur: 8.67/10 average across " +
      "34 of 34 required courses, a 10/10 final year project, and verified public evidence.",
    eyebrow: "Education",
    title: "Information Systems Engineering",
    intro:
      "A five-year accredited engineering degree, completed in full, with the record published " +
      "for anyone who wants to check it.",
    courseworkEyebrow: "Coursework",
    courseworkHeading: "Relevant subjects",
    contextEyebrow: "Institutional context",
    contextHeading: "Where the degree is from",
    projectEyebrow: "Final year project",
    projectHeading: "Filomena, graded 10/10",
    projectBody:
      "My final year project became a platform that five Argentine national institutions now " +
      "run in production. It was built by a three-person team, with me as principal author and " +
      "contributor.",
    certificationsEyebrow: "Certifications",
    certificationsHeading: "Completed credentials",
    languagesEyebrow: "Languages",
    languagesHeading: "Spanish and English",
    evidenceEyebrow: "Evidence",
    evidenceHeading: "Check the record",
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
      "Email is the most direct route, and I answer it personally. No form, no newsletter, no " +
      "scheduling funnel — just a reply from me.",
    basedIn: (location, arrangement, timezone) =>
      `I am based in ${location}, work ${arrangement} on ${timezone}, and can start immediately — ` +
      "the exact date is easy to coordinate during the process.",
    hiringHint: "If you're hiring and want to judge the work rather than the words, start with the",
    hiringLinkText: "Filomena case study",
    openToHeading: "Open to",
    resumeHeading: "Résumé",
    resumeNote: "Both include a phone number; the site itself does not publish one.",
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
