import documents from "./public-documents.json" with { type: "json" };

/** Values that do not change with language. */
export const siteUrl = "https://gonzalomartinperez.com";

export const email = "gonzalomartinperez2002@gmail.com";

export const externalLinks = {
  linkedin: "https://www.linkedin.com/in/gonzalo-martin-perez/",
  github: "https://github.com/gonzalomartinperez",
  filomenaBackend: "https://github.com/gonzalomartinperez/filomena-backend",
  filomenaFrontend: "https://github.com/gonzalomartinperez/filomena-frontend",
};

export const resumeFiles = {
  en: "/gonzalo-martin-perez-ai-software-engineer-en.pdf",
  es: "/gonzalo-martin-perez-ai-software-engineer-es.pdf",
};

function resumeDownload(locale: keyof typeof resumeFiles) {
  const href = resumeFiles[locale];
  const document = documents.find((entry) => entry.href === href);
  if (!document) throw new Error(`Missing reviewed CV document: ${locale}`);
  // The CDN caches stable PDF paths across deployments; reviewed bytes define the cache key.
  return `${href}?v=${document.sha256}`;
}

export const resumeDownloads = {
  en: resumeDownload("en"),
  es: resumeDownload("es"),
};

export const certificateFiles = {
  docker: { href: "/certificates/docker-fundamentals-2024.pdf", format: "PDF" },
  powerSkills: { href: "/certificates/professional-power-skills-2026.png", format: "PNG" },
};
