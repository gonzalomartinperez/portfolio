import type { Locale } from "./locales";

export const toolCarouselIds = [
  "react",
  "typescript",
  "python",
  "fastapi",
  "langchain",
  "langgraph",
  "neo4j",
  "react-native",
  "privy",
  "hyperliquid",
  "stripe",
  "digitalocean",
] as const;

export const toolCarouselCopy: Record<
  Locale,
  {
    heading: string;
    description: string;
    previous: string;
    next: string;
    catalogue: string;
  }
> = {
  es: {
    heading: "Herramientas con las que construyo",
    description:
      "Una selección de mi stack para construir productos web y móviles, sistemas de IA e integraciones.",
    previous: "Ver herramientas anteriores",
    next: "Ver más herramientas",
    catalogue: "Explorar el stack completo",
  },
  en: {
    heading: "Tools I build with",
    description:
      "A selection from my stack for building web and mobile products, AI systems, and integrations.",
    previous: "View previous tools",
    next: "View more tools",
    catalogue: "Explore the full stack",
  },
};
