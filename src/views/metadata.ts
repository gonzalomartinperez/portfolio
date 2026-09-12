import type { Metadata, Viewport } from "next";
import { getContent } from "@/content";
import { htmlLang, type Locale, localePath, locales } from "@/content/locales";
import { siteUrl } from "@/content/site-config";

export const sharedViewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#fafafb" },
  ],
};

/**
 * Builds the `alternates` block for one route, so every page advertises both languages and its
 * own canonical URL. `x-default` points at English, which is the unprefixed version.
 */
function alternatesFor(locale: Locale, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const option of locales) {
    languages[htmlLang[option]] = localePath(option, path);
  }
  return {
    canonical: localePath(locale, path),
    languages: { ...languages, "x-default": localePath("en", path) },
  };
}

export function layoutMetadata(locale: Locale): Metadata {
  const { profile } = getContent(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${profile.name} · ${profile.role}`,
      template: `%s · ${profile.name}`,
    },
    description: profile.intro,
    applicationName: profile.name,
    authors: [{ name: profile.name, url: siteUrl }],
    creator: profile.name,
    alternates: alternatesFor(locale, "/"),
    openGraph: {
      type: "profile",
      siteName: profile.name,
      title: `${profile.name} · ${profile.role}`,
      description: profile.headline,
      url: localePath(locale, "/"),
      locale: htmlLang[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.name} · ${profile.role}`,
      description: profile.headline,
    },
    robots: { index: true, follow: true },
    category: "technology",
  };
}

/** Per-route metadata, keyed by the shared (language-independent) path. */
export function pageMetadata(locale: Locale, path: string): Metadata {
  const { siteCopy: copy } = getContent(locale);
  const byPath: Record<string, { title: string; description: string }> = {
    "/about": { title: copy.about.metaTitle, description: copy.about.metaDescription },
    "/work": { title: copy.work.metaTitle, description: copy.work.metaDescription },
    "/work/filomena": {
      title: copy.filomena.metaTitle,
      description: copy.filomena.metaDescription,
    },
    "/stack": { title: copy.stack.metaTitle, description: copy.stack.metaDescription },
    "/education": { title: copy.education.metaTitle, description: copy.education.metaDescription },
    "/contact": { title: copy.contact.metaTitle, description: copy.contact.metaDescription },
  };

  const entry = byPath[path];
  return {
    title: entry.title,
    description: entry.description,
    alternates: alternatesFor(locale, path),
    openGraph: {
      title: entry.title,
      description: entry.description,
      url: localePath(locale, path),
    },
  };
}
