import "server-only";

import type { Locale } from "@/content/locales";
import { publicTechnologyCatalog, technologyGroups } from "@/content/technologies";
import { buildCarouselRows } from "../domain/rows";
import { ToolCarouselClient } from "./tool-carousel-client";

export function ToolCarousel({ locale }: { locale: Locale }) {
  const rows = buildCarouselRows(publicTechnologyCatalog, technologyGroups);
  return <ToolCarouselClient locale={locale} rows={rows} />;
}
