import type { Technology } from "@/content/technologies";

export type CatalogueGroup = {
  id: string;
  name: string;
  evidence: string;
  technologies: Technology[];
};
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function filterCatalogue(groups: CatalogueGroup[], query: string, category: string) {
  const normalizedQuery = normalize(query.trim());
  return groups
    .filter((group) => !category || category === group.id)
    .map((group) => ({
      ...group,
      technologies: group.technologies.filter((technology) =>
        normalize(
          [
            technology.name,
            technology.id,
            ...(technology.aliases ?? []),
            group.name,
            ...technology.evidence.map((item) => item.label),
          ].join(" "),
        ).includes(normalizedQuery),
      ),
    }))
    .filter((group) => group.technologies.length > 0);
}
