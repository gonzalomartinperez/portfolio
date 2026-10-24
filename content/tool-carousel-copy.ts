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
      "Todas las tecnologías que uso, agrupadas por capacidad. En el stack completo verás dónde apliqué cada una.",
    pause: "Pausar tecnologías",
    resume: "Reanudar tecnologías",
    catalogue: "Explorar el stack completo",
    row: "Tecnologías",
  },
  en: {
    heading: "Tools I build with",
    description:
      "Every technology I use, grouped by capability. The full stack shows where I applied each one.",
    pause: "Pause technologies",
    resume: "Resume technologies",
    catalogue: "Explore the full stack",
    row: "Technologies",
  },
};
