import type { Locale } from "../config/locales";

export const toolCarouselCopy: Record<
  Locale,
  {
    heading: string;
    description: string;
    pause: string;
    resume: string;
    catalogue: string;
    row: string;
  }
> = {
  es: {
    heading: "Herramientas con las que construyo",
    description:
      "Todo el toolkit de un vistazo. La página de stack vincula cada herramienta con dónde la usé.",
    pause: "Pausar tecnologías",
    resume: "Reanudar tecnologías",
    catalogue: "Explorar el stack completo",
    row: "Tecnologías",
  },
  en: {
    heading: "Tools I build with",
    description: "The full toolkit at a glance. The stack page links each one to where I used it.",
    pause: "Pause technologies",
    resume: "Resume technologies",
    catalogue: "Explore the full stack",
    row: "Technologies",
  },
};
