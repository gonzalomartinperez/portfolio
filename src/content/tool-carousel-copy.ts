import type { Locale } from "./locales";

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
      "Lenguajes, frameworks y herramientas que utilizo para desarrollar productos, sistemas de IA e integraciones.",
    pause: "Pausar tecnologías",
    resume: "Reanudar tecnologías",
    catalogue: "Explorar el stack completo",
    row: "Tecnologías",
  },
  en: {
    heading: "Tools I build with",
    description:
      "Languages, frameworks, and tools I use to build products, AI systems, and integrations.",
    pause: "Pause technologies",
    resume: "Resume technologies",
    catalogue: "Explore the full stack",
    row: "Technologies",
  },
};
