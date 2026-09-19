import type { MetadataRoute } from "next";
import { htmlLang, type Locale, localePath, locales } from "@/content/locales";
import { siteRoutes } from "@/content/routes";
import { siteUrl } from "@/content/site-config";

const absolute = (locale: Locale, path: string) => `${siteUrl}${localePath(locale, path)}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return siteRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: absolute(locale, route.path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((option) => [htmlLang[option], absolute(option, route.path)]),
        ),
      },
    })),
  );
}
