import { getContent } from "@/content";
import { defaultLocale } from "@/content/locales";
import { email, siteUrl } from "@/content/site-config";

/** schema.org ProfilePage wrapping Person, the documented shape for a personal profile. */
export function ProfileJsonLd() {
  const { profile, contactLinks } = getContent(defaultLocale);
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: profile.name,
      jobTitle: profile.role,
      description: profile.headline,
      url: siteUrl,
      email,
      address: { "@type": "PostalAddress", addressLocality: "Bahía Blanca", addressCountry: "AR" },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Universidad Nacional del Sur",
        url: "https://www.uns.edu.ar/",
      },
      knowsLanguage: [
        { "@type": "Language", name: "Spanish" },
        { "@type": "Language", name: "English" },
      ],
      sameAs: contactLinks.filter((l) => l.href.startsWith("https://")).map((l) => l.href),
    },
  };

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be a raw script body; the value is built from local content, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      type="application/ld+json"
    />
  );
}
