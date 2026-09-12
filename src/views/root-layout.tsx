import type { ReactNode } from "react";
import { fontClassName } from "@/app/fonts";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/content";
import { htmlLang, type Locale } from "@/content/locales";
import { email, siteUrl } from "@/content/site-config";

/**
 * Applies a stored theme choice before first paint, so a visitor who picked the non-default
 * theme never sees the other one flash. A visitor with no stored choice is handled entirely by
 * the `prefers-color-scheme` rules in globals.css, so nothing is written here.
 */
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}`;

/** schema.org ProfilePage wrapping Person, the documented shape for a personal profile. */
function profileJsonLd(locale: Locale) {
  const { profile, contactLinks } = getContent(locale);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    inLanguage: htmlLang[locale],
    mainEntity: {
      "@type": "Person",
      name: profile.name,
      jobTitle: profile.role,
      description: profile.headline,
      url: siteUrl,
      email,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bahía Blanca",
        addressCountry: "AR",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Universidad Nacional del Sur",
        url: "https://www.uns.edu.ar/",
      },
      knowsLanguage: [
        { "@type": "Language", name: "Spanish" },
        { "@type": "Language", name: "English" },
      ],
      sameAs: contactLinks
        .filter((link) => link.href.startsWith("https://"))
        .map((link) => link.href),
    },
  };
}

/**
 * One shell for both languages. Each language group renders it with its own locale, which is
 * what lets `<html lang>` differ per branch while the markup stays in a single place.
 */
export function LocalizedLayout({ locale, children }: { locale: Locale; children: ReactNode }) {
  const { profile, contactLinks, siteCopy: copy } = getContent(locale);

  return (
    <html className={fontClassName} lang={htmlLang[locale]} suppressHydrationWarning>
      {/* biome-ignore lint/style/noHeadElement: next/head is Pages Router only; a root layout in the App Router renders <head> directly. */}
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: this must run before first paint to prevent a theme flash; the content is a fixed literal.
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          {copy.chrome.skipToContent}
        </a>
        <SiteHeader
          copy={{
            roleSubtitle: copy.chrome.roleSubtitle,
            mainNavLabel: copy.chrome.mainNavLabel,
            languageLabel: copy.chrome.languageLabel,
            routes: [
              { path: "/about", label: copy.nav.about },
              { path: "/work", label: copy.nav.work },
              { path: "/stack", label: copy.nav.stack },
              { path: "/education", label: copy.nav.education },
              { path: "/contact", label: copy.nav.contact },
            ],
            theme: {
              neutral: copy.chrome.themeToggleNeutral,
              toLight: copy.chrome.themeToggleTo(copy.chrome.themeLight),
              toDark: copy.chrome.themeToggleTo(copy.chrome.themeDark),
            },
          }}
          locale={locale}
        />
        <main id="main">{children}</main>
        <SiteFooter contactLinks={contactLinks} copy={copy} locale={locale} profile={profile} />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be a raw script body; the value is built from local content, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd(locale)) }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
