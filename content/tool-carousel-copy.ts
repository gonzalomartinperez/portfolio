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
      "Las tecnologías que más uso, agrupadas por capacidad. El stack completo reúne todas y muestra dónde apliqué cada una.",
    pause: "Pausar tecnologías",
    resume: "Reanudar tecnologías",
    catalogue: "Explorar el stack completo",
    row: "Tecnologías",
  },
  en: {
    heading: "Tools I build with",
    description:
      "The technologies I use most, grouped by capability. The full stack lists all of them and where I applied each one.",
    pause: "Pause technologies",
    resume: "Resume technologies",
    catalogue: "Explore the full stack",
    row: "Technologies",
  },
};
