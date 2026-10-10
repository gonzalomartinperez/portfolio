const portfolioPaths = [
  "/",
  "/about",
  "/work",
  "/work/filomena",
  "/stack",
  "/education",
  "/contact",
  "/cv",
  "/assistant",
  "/es",
  "/es/about",
  "/es/work",
  "/es/work/filomena",
  "/es/stack",
  "/es/education",
  "/es/contact",
  "/es/cv",
  "/es/assistant",
] as const;
export type PortfolioPath = (typeof portfolioPaths)[number];
export type VisitorContext = {
  theme: "dark" | "light";
  opened_path: PortfolioPath;
  current_path: PortfolioPath;
  presentation: "compact" | "expanded" | "page";
};
export function portfolioPath(pathname: string): PortfolioPath | undefined {
  return portfolioPaths.find((path) => path === pathname);
}
