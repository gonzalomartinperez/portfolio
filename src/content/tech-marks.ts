import { technologyCatalog } from "./technologies";

export const techMarks = technologyCatalog.flatMap((technology) =>
  technology.icon ? [{ icon: technology.icon, name: technology.name }] : [],
);
