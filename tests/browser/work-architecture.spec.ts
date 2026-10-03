import { expect, test } from "@playwright/test";

for (const locale of ["", "/es"]) {
  test(`${locale || "en"} work diagrams preserve distinct service paths`, async ({
    page,
  }, info) => {
    await page.goto(`${locale}/work`);
    for (const [role, nodes, edges] of [
      ["rampy", 5, 4],
      ["teamcubation", 6, 4],
      ["cooperativa-obrera", 5, 4],
    ] as const) {
      const figure = page.locator(`#${role} figure`);
      await expect(figure).toBeVisible();
      await expect(figure.locator(".react-flow__node")).toHaveCount(nodes);
      await expect(figure.locator(".react-flow__edge")).toHaveCount(edges);
      await expect(figure.locator("figcaption")).not.toBeEmpty();
      const fits = await figure.evaluate((element) => {
        const canvas = element.querySelector(".react-flow")?.getBoundingClientRect();
        if (!canvas) return false;
        return [...element.querySelectorAll(".react-flow__node")].every((node) => {
          const bounds = node.getBoundingClientRect();
          return (
            bounds.left >= canvas.left - 1 &&
            bounds.right <= canvas.right + 1 &&
            bounds.top >= canvas.top - 1 &&
            bounds.bottom <= canvas.bottom + 1
          );
        });
      });
      expect(fits, `${role} nodes fit at ${info.project.name}`).toBe(true);
    }
    await expect(
      page.locator("#teamcubation .react-flow__edge[data-id='source-lambda']"),
    ).toHaveCount(1);
    await expect(page.locator("#teamcubation .react-flow__edge[data-id='bff-lambda']")).toHaveCount(
      0,
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  });
}
