import type { MetadataRoute } from "next";
import { htmlLang, type Locale, localePath, locales } from "@/content/locales";
import { siteUrl } from "@/content/site-config";

const routes = [
  { path: "/", priority: 1 },
  { path: "/work", priority: 0.9 },
  { path: "/work/filomena", priority: 0.9 },
  { path: "/about", priority: 0.8 },
  { path: "/contact", priority: 0.8 },
  { path: "/stack", priority: 0.7 },
  { path: "/education", priority: 0.7 },
];

const absolute = (locale: Locale, path: string) => `${siteUrl}${localePath(locale, path)}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.flatMap((route) =>
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
