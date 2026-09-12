import type { Locale } from "./locales";

/**
 * The shell strings, in both languages, as plain strings.
 *
 * The header and footer resolve the locale from the pathname on the client, which is what lets
 * a language switch be an ordinary client-side navigation instead of a full page load. That
 * means both languages' chrome ships to the browser — a few hundred bytes, and the reason the
 * switch is instant. Page content is still server-rendered per route in one language only.
 */
export type ChromeCopy = {
  skipToContent: string;
  roleSubtitle: string;
  mainNavLabel: string;
  footerNavLabel: string;
  themeToggleNeutral: string;
  themeToLight: string;
  themeToDark: string;
  languageLabel: string;
  footerSite: string;
  footerElsewhere: string;
  colophon: string;
  nav: {
    about: string;
    work: string;
    stack: string;
    education: string;
    contact: string;
    caseStudy: string;
  };
};

export const chrome: Record<Locale, ChromeCopy> = {
  en: {
    skipToContent: "Skip to content",
    roleSubtitle: "AI Software Engineer",
    mainNavLabel: "Main",
    footerNavLabel: "Footer",
    themeToggleNeutral: "Switch theme",
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    languageLabel: "Language",
    footerSite: "Site",
    footerElsewhere: "Elsewhere",
    colophon: "Next.js · TypeScript · no tracking",
    nav: {
      about: "About",
      work: "Work",
      stack: "Stack",
      education: "Education",
      contact: "Contact",
      caseStudy: "Filomena case study",
    },
  },
  es: {
    skipToContent: "Ir al contenido",
    roleSubtitle: "AI Software Engineer",
    mainNavLabel: "Principal",
    footerNavLabel: "Pie de página",
    themeToggleNeutral: "Cambiar el tema",
    themeToLight: "Cambiar al tema claro",
    themeToDark: "Cambiar al tema oscuro",
    languageLabel: "Idioma",
    footerSite: "Sitio",
    footerElsewhere: "En otros lados",
    colophon: "Next.js · TypeScript · sin rastreo",
    nav: {
      about: "Sobre mí",
      work: "Trabajo",
      stack: "Stack",
      education: "Educación",
      contact: "Contacto",
      caseStudy: "Caso de estudio de Filomena",
    },
  },
};
