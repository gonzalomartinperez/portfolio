import { compareTechnologyNames, type Technology } from "../../../../content/technologies.ts";

export type CarouselTechnology = Pick<Technology, "id" | "name" | "icon" | "category">;

export function buildCarouselRows(
  technologies: readonly Technology[],
  groups: readonly { id: string }[],
): CarouselTechnology[][] {
  const rows: CarouselTechnology[][] = [[], []];
  for (const group of groups) {
    const tools = technologies
      .filter((technology) => technology.category === group.id)
      .sort(compareTechnologyNames)
      .map(({ id, name, icon, category }) => ({ id, name, icon, category }));
    rows[rows[0].length <= rows[1].length ? 0 : 1].push(...tools);
  }
  return rows;
}
