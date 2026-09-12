/**
 * Interface copy, separate from the professional facts in the per-locale content modules.
 *
 * Both locales implement this type, so TypeScript fails the build if a translation drifts out
 * of shape or a key is forgotten.
 */
export type SiteCopy = {
  chrome: {
    skipToContent: string;
    roleSubtitle: string;
    mainNavLabel: string;
    footerNavLabel: string;
    themeToggleNeutral: string;
    /** Receives the theme being switched to, already translated. */
    themeToggleTo: (theme: string) => string;
    themeLight: string;
    themeDark: string;
    languageLabel: string;
    footerSite: string;
    footerElsewhere: string;
    colophon: string;
  };
  nav: {
    about: string;
    work: string;
    stack: string;
    education: string;
    contact: string;
    caseStudy: string;
  };
  actions: {
    seeWork: string;
    getInTouch: string;
    readCaseStudy: string;
    fullExperience: string;
    fullStack: string;
    academicRecord: string;
    emailMe: string;
    allContact: string;
    backToWork: string;
    sourceOnGithub: string;
    goHome: string;
  };
  hero: {
    openToRemote: string;
    pauseAnimation: string;
    playAnimation: string;
    proof: { value: string; label: string }[];
    proofNote: string;
    proofNoteLink: string;
  };
  home: {
    whoEyebrow: string;
    whoHeading: string;
    whoParagraph: string;
    factCurrently: string;
    factExperience: string;
    factBasedIn: string;
    factLanguages: string;
    languagesValue: string;
    experienceSince: (length: string, since: string) => string;
    workEyebrow: string;
    workHeading: string;
    experienceEyebrow: string;
    experienceHeading: string;
    stackEyebrow: string;
    stackHeading: string;
    stackIntro: string;
    educationEyebrow: string;
    educationHeading: string;
    educationBody: string;
    closingHeading: string;
    closingBody: string;
  };
  about: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    paragraphs: string[];
    asideCurrently: string;
    asideLevel: string;
    asideArrangement: string;
    asideLanguages: string;
    asideAvailability: string;
    principlesEyebrow: string;
    principlesHeading: string;
    principles: { title: string; body: string }[];
    lookingEyebrow: string;
    lookingHeading: string;
    lookingBody: string;
    pixelLabel: string;
    pixelCaption: string;
  };
  work: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    intro: (length: string, asOf: string) => string;
    experienceHeading: string;
    projectsEyebrow: string;
    projectsHeading: string;
    projectsBody: string;
  };
  filomena: {
    metaTitle: string;
    metaDescription: string;
    caseStudyLabel: string;
    architectureHeading: string;
    architectureCaption: string;
    decisionsHeading: string;
    changesHeading: string;
    changesCaption: string;
    columnAspect: string;
    columnBefore: string;
    columnAfter: string;
    evidenceHeading: string;
    evidenceNote: string;
  };
  stack: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    intro: string;
    noteHeading: string;
    noteScope: string;
    noteLogos: string;
  };
  education: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    intro: string;
    courseworkEyebrow: string;
    courseworkHeading: string;
    contextEyebrow: string;
    contextHeading: string;
    projectEyebrow: string;
    projectHeading: string;
    projectBody: string;
    certificationsEyebrow: string;
    certificationsHeading: string;
    languagesEyebrow: string;
    languagesHeading: string;
    evidenceEyebrow: string;
    evidenceHeading: string;
    evidenceBody: string;
  };
  contact: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    intro: string;
    basedIn: (location: string, arrangement: string, timezone: string) => string;
    hiringHint: string;
    hiringLinkText: string;
    openToHeading: string;
    resumeHeading: string;
    resumeNote: string;
  };
  notFound: {
    metaTitle: string;
    eyebrow: string;
    title: string;
    body: string;
  };
};
