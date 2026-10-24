import "server-only";

import type { Locale } from "@config/locales";
import { highlightedTechnologyCatalog, technologyGroups } from "@content/technologies";
import { buildCarouselRows } from "../domain/rows";
import { ToolCarouselClient } from "./tool-carousel-client";

export function ToolCarousel({ locale }: { locale: Locale }) {
  const rows = buildCarouselRows(highlightedTechnologyCatalog, technologyGroups);
  return <ToolCarouselClient locale={locale} rows={rows} />;
}
