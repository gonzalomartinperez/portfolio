import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TechnologyCatalogue } from "@/components/technology-catalogue";
import { getContent } from "@/content";
import { type Locale, localePath } from "@/content/locales";
import { technologyCatalog } from "@/content/technologies";
import styles from "./stack.module.css";

export function StackView({ locale }: { locale: Locale }) {
  const { stackGroups, siteCopy: copy } = getContent(locale);
  const labels =
    locale === "es"
      ? {
          search: "Buscar tecnologías",
          category: "Categoría",
          all: "Todas las categorías",
          clear: "Limpiar filtros",
          empty: "No se encontraron tecnologías",
          developing: "En consolidación",
          results: "tecnologías y conceptos",
        }
      : {
          search: "Search technologies",
          category: "Category",
          all: "All categories",
          clear: "Clear filters",
          empty: "No technologies found",
          developing: "Developing expertise",
          results: "technologies and concepts",
        };
  const evidenceLabels: Record<string, string> =
    locale === "es"
      ? {
          "Experience & projects": "Experiencia y proyectos",
          "Independent work": "Trabajo independiente",
          "Professional focus": "Enfoque profesional",
        }
      : {};
  const groups = stackGroups.map((group) => ({
    ...group,
    technologies: technologyCatalog
      .filter((technology) => technology.category === group.id)
      .map((technology) => ({
        ...technology,
        evidence: technology.evidence.map((evidence) => ({
          label: evidenceLabels[evidence.label] ?? evidence.label,
          href: localePath(locale, evidence.href),
        })),
      })),
  }));
  return (
    <>
      <PageHeader eyebrow={copy.stack.eyebrow} intro={copy.stack.intro} title={copy.stack.title} />
      <section className="section-tight frame">
        <TechnologyCatalogue groups={groups} copy={labels} />
      </section>
      <section className="section-tight frame">
        <div className={styles.note}>
          <h2>{copy.stack.noteHeading}</h2>
          <p>{copy.stack.noteScope}</p>
          <p>{copy.stack.noteLogos}</p>
          <Link className="button button-secondary" href={localePath(locale, "/work")}>
            {copy.actions.fullExperience}
          </Link>
        </div>
      </section>
    </>
  );
}
