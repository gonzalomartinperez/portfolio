import { expect, test } from "@playwright/test";

for (const locale of ["", "/es"]) {
  test(`${locale || "en"} work diagrams preserve distinct service paths`, async ({
    page,
  }, info) => {
    await page.goto(`${locale}/work`);
    for (const [role, nodes, edges] of [
      ["rampy", 5, 4],
      ["teamcubation", 8, 5],
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
      const controlsClear = await figure.evaluate((element) => {
        const controls = element.querySelector(".react-flow__controls")?.getBoundingClientRect();
        if (!controls) return false;
        return [...element.querySelectorAll(".react-flow__node")].every((node) => {
          const rect = node.getBoundingClientRect();
          return (
            controls.right <= rect.left ||
            controls.left >= rect.right ||
            controls.bottom <= rect.top ||
            controls.top >= rect.bottom
          );
        });
      });
      expect(controlsClear, `${role} controls do not cover node labels`).toBe(true);
    }
    await expect(
      page.locator("#teamcubation .react-flow__edge[data-id='source-lambda']"),
    ).toHaveCount(1);
    await expect(page.locator("#teamcubation .react-flow__edge[data-id='bff-lambda']")).toHaveCount(
      0,
    );
    await expect(
      page.locator("#teamcubation .react-flow__edge[data-id='agent-graph']"),
    ).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  });
}

for (const locale of ["", "/es"]) {
  test(`${locale || "en"} Filomena explains product and operating layers with React Flow`, async ({
    page,
  }) => {
    await page.goto(`${locale}/work/filomena`);
    const diagram = page.locator("figure").filter({ has: page.locator(".react-flow") });
    await expect(diagram.locator(".react-flow__node")).toHaveCount(6);
    await expect(diagram.locator(".react-flow__edge")).toHaveCount(3);
    await expect(diagram.locator("figcaption")).toContainText("Laravel");
    await expect(diagram).toContainText("Prometheus");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  });
}
