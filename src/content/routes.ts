import { localePath, locales } from "./locales";

export const siteRoutes = [
  { path: "/", priority: 1 },
  { path: "/work", priority: 0.9 },
  { path: "/work/filomena", priority: 0.9 },
  { path: "/about", priority: 0.8 },
  { path: "/contact", priority: 0.8 },
  { path: "/stack", priority: 0.7 },
  { path: "/education", priority: 0.7 },
  { path: "/cv", priority: 0.8 },
] as const;

const pagePaths = new Set(
  siteRoutes.flatMap(({ path }) => locales.map((locale) => localePath(locale, path))),
);

/** Unknown URLs share the prerendered English 404 shell and bilingual home recovery. */
export function navigationPath(pathname: string): string {
  return pagePaths.has(pathname) ? pathname : "/";
}
