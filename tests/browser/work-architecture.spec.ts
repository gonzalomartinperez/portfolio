import { expect, test } from "@playwright/test";

for (const locale of ["", "/es"]) {
  for (const theme of ["dark", "light"]) {
    test(`${locale || "en"} ${theme} work diagrams preserve distinct service paths`, async ({
      page,
    }, info) => {
      await page.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${locale}/work`);
      await page.evaluate(() => document.fonts.ready);
      for (const [role, nodes, edges] of [
        ["rampy", 20, 10],
        ["teamcubation", 15, 14],
        ["cooperativa-obrera", 5, 4],
      ] as const) {
        const figure = page.locator(`#${role} figure`);
        await expect(figure).toBeVisible();
        await expect(figure.locator(".react-flow__node-architecture")).toHaveCount(nodes);
        await expect(figure.locator(".react-flow__edge")).toHaveCount(edges);
        await expect(figure.locator("figcaption")).not.toBeEmpty();
        const fits = await figure.evaluate((element) => {
          const canvas = element.querySelector(".react-flow")?.getBoundingClientRect();
          if (!canvas) return false;
          return [...element.querySelectorAll(".react-flow__node-architecture")].every((node) => {
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
          return [...element.querySelectorAll(".react-flow__node-architecture")].every((node) => {
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
        const routeObstructions = await figure.evaluate((figure, role) => {
          const pairs: Record<string, [string, string][]> = {
            rampy: [
              ["backoffice", "web"],
              ["web", "backend"],
              ["mobile", "backend"],
              ["backend", "backoffice-api"],
              ["backend", "agentic-group"],
              ["backend", "defi"],
              ["backend-group", "privy"],
              ["agentic-group", "data-group"],
              ["agentic-group", "models-group"],
              ["defi", "protocols-group"],
            ],
            teamcubation: [
              ["portal", "gateway"],
              ["gateway", "bff"],
              ["bff", "java"],
              ["bff", "node"],
              ["bff", "agent"],
              ["agent", "harness"],
              ["harness", "graph"],
              ["graph", "neo4j"],
              ["source", "sqs"],
              ["sqs", "lambda"],
              ["lambda", "java"],
              ["lambda", "node"],
              ["java", "java-db"],
              ["node", "node-db"],
            ],
            "cooperativa-obrera": [
              ["web", "bff"],
              ["bff", "java"],
              ["bff", "node"],
              ["bff", "php"],
            ],
          };
          const nodes = [
            ...figure.querySelectorAll<HTMLElement>(".react-flow__node-architecture"),
          ].map((node) => ({ id: node.dataset.id, bounds: node.getBoundingClientRect() }));
          const obstructions: string[] = [];
          for (const [source, target] of pairs[role]) {
            const path = figure.querySelector<SVGPathElement>(
              `.react-flow__edge[data-id="${source}-${target}"] .react-flow__edge-path`,
            );
            const matrix = path?.getScreenCTM();
            if (!path || !matrix) {
              obstructions.push(`${source}-${target}: missing path`);
              continue;
            }
            const obstacles = nodes.filter((node) => node.id !== source && node.id !== target);
            for (let distance = 0; distance <= path.getTotalLength(); distance += 2) {
              const point = path.getPointAtLength(distance).matrixTransform(matrix);
              const hit = obstacles.find(
                ({ bounds }) =>
                  point.x > bounds.left + 3 &&
                  point.x < bounds.right - 3 &&
                  point.y > bounds.top + 3 &&
                  point.y < bounds.bottom - 3,
              );
              if (hit) {
                obstructions.push(`${source}-${target} crosses ${hit.id}`);
                break;
              }
            }
          }
          return obstructions;
        }, role);
        expect(routeObstructions, `${role} routes leave unrelated node labels clear`).toEqual([]);
      }
      const providers = page.locator("#rampy .react-flow");
      for (const provider of ["Morpho", "Aave", "Compound", "LI.FI", "Hyperliquid"]) {
        await expect(providers).toContainText(provider);
      }
      for (const service of ["java-db", "node-db"]) {
        await expect(
          page.locator(`#teamcubation .react-flow__node[data-id='${service}']`),
        ).toContainText("PostgreSQL");
      }
      await expect(page.locator("#cooperativa-obrera figcaption")).toContainText(
        /MySQL (?:or|o) MariaDB/,
      );
      const login = page.locator("#rampy .react-flow__node[data-id='privy']");
      await expect(login).toContainText("Privy");
      await expect(page.locator("#rampy .react-flow__node[data-id='auth']")).toContainText(
        locale ? "autenticación" : "Authentication",
      );
      await expect(login).toContainText("wallets");
      const backoffice = page.locator("#rampy .react-flow__node[data-id='backoffice']");
      await expect(page.locator("#rampy figcaption")).toContainText(
        locale ? "en ampliación" : "expanding",
      );
      await expect(backoffice).not.toContainText(locale ? "en desarrollo" : "in development");
      for (const connection of [
        "backoffice-web",
        "web-backend",
        "mobile-backend",
        "backend-backoffice-api",
        "backend-agentic-group",
        "backend-defi",
        "backend-group-privy",
        "agentic-group-data-group",
        "agentic-group-models-group",
        "defi-protocols-group",
      ]) {
        await expect(page.locator(`#rampy .react-flow__edge[data-id='${connection}']`)).toHaveCount(
          1,
        );
      }
      await expect(page.locator("#teamcubation .react-flow__node[data-id='agent']")).toContainText(
        locale ? "Sistema de asistencia de promociones" : "Promotion Assistance System",
      );
      await expect(
        page.locator("#teamcubation .react-flow__node[data-id='harness']"),
      ).toContainText(/harness/i);
      for (const role of ["rampy", "teamcubation", "cooperativa-obrera"]) {
        const containment = await page.locator(`#${role} figure`).evaluate((figure, role) => {
          const deployment = figure
            .querySelector(".react-flow__node[data-id='deployment']")
            ?.getBoundingClientRect();
          if (!deployment) return false;
          const owned =
            role === "rampy"
              ? [
                  "web",
                  "backoffice",
                  "backend",
                  "auth",
                  "wallets",
                  "backoffice-api",
                  "ai",
                  "graph",
                  "defi",
                ]
              : [...figure.querySelectorAll<HTMLElement>(".react-flow__node-architecture")].map(
                  (node) => node.dataset.id,
                );
          return owned.every((id) => {
            const node = figure
              .querySelector(`.react-flow__node[data-id="${id}"]`)
              ?.getBoundingClientRect();
            return (
              !!node &&
              node.left >= deployment.left - 1 &&
              node.right <= deployment.right + 1 &&
              node.top >= deployment.top - 1 &&
              node.bottom <= deployment.bottom + 1
            );
          });
        }, role);
        expect(containment, `${role} deployment boundary contains the approved services`).toBe(
          true,
        );
      }
      for (const connection of [
        "backend-group-privy",
        "agentic-group-data-group",
        "agentic-group-models-group",
        "defi-protocols-group",
      ]) {
        const path = page.locator(
          `#rampy .react-flow__edge[data-id='${connection}'] .react-flow__edge-path`,
        );
        await expect(path).toHaveAttribute("marker-start", /url\(/);
        await expect(path).toHaveAttribute("marker-end", /url\(/);
      }
      for (const technology of [
        "PostgreSQL",
        "pgvector",
        "Mem0",
        "Neo4j",
        "Vertex AI",
        "DeepInfra",
        "OpenAI",
      ]) {
        await expect(page.locator("#rampy figure")).toContainText(technology);
      }
      await expect(
        page.locator("#rampy .react-flow__edge[data-id='backoffice-web'] .react-flow__edge-path"),
      ).not.toHaveCSS("stroke-dasharray", "none");
      await expect(page.locator("#rampy .react-flow__node[data-id='deployment']")).toContainText(
        "DigitalOcean",
      );
      await expect(
        page.locator("#teamcubation .react-flow__node[data-id='deployment']"),
      ).toContainText("AWS");
      await expect(
        page.locator("#teamcubation .react-flow__node[data-id='cloudwatch']"),
      ).toContainText("CloudWatch");
      await expect(
        page.locator("#cooperativa-obrera .react-flow__node[data-id='deployment']"),
      ).toContainText(/on.prem/i);
      for (const connection of [
        "portal-gateway",
        "gateway-bff",
        "agent-harness",
        "harness-graph",
        "graph-neo4j",
      ]) {
        await expect(
          page.locator(`#teamcubation .react-flow__edge[data-id='${connection}']`),
        ).toHaveCount(1);
      }
      await expect(
        page.locator("#teamcubation .react-flow__edge[data-id='portal-bff']"),
      ).toHaveCount(0);
      await expect(
        page.locator("#teamcubation .react-flow__edge[data-id='bff-harness']"),
      ).toHaveCount(0);
      await expect(backoffice).toContainText(locale ? "telemetría" : "telemetry");
      await expect(
        page.locator("#teamcubation .react-flow__edge[data-id='source-sqs']"),
      ).toHaveCount(1);
      for (const connection of [
        "sqs-lambda",
        "lambda-java",
        "lambda-node",
        "java-java-db",
        "node-node-db",
        "bff-agent",
      ]) {
        await expect(
          page.locator(`#teamcubation .react-flow__edge[data-id='${connection}']`),
        ).toHaveCount(1);
      }
      await expect(
        page.locator("#teamcubation .react-flow__edge[data-id='lambda-java-db']"),
      ).toHaveCount(0);
      await expect(
        page.locator("#teamcubation .react-flow__edge[data-id='lambda-node-db']"),
      ).toHaveCount(0);
      await expect(
        page.locator("#teamcubation .react-flow__edge[data-id='bff-lambda']"),
      ).toHaveCount(0);
      await expect(
        page.locator("#teamcubation .react-flow__edge[data-id='harness-graph']"),
      ).toHaveCount(1);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
    });
  }
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

for (const locale of ["", "/es"]) {
  for (const kind of ["rampy", "teamcubation", "cooperativa-obrera", "filomena"]) {
    test(`${locale || "en"} ${kind} diagram preserves page scrolling and supports zoom and node details`, async ({
      page,
      isMobile,
    }) => {
      test.setTimeout(90_000);
      const client = isMobile ? await page.context().newCDPSession(page) : null;
      const settleScroll = () =>
        page.evaluate(
          () =>
            new Promise<void>((resolve) => {
              let previous = scrollY;
              let stable = 0;
              const check = () => {
                stable = scrollY === previous ? stable + 1 : 0;
                previous = scrollY;
                if (stable >= 4) resolve();
                else requestAnimationFrame(check);
              };
              requestAnimationFrame(check);
            }),
        );
      const scrollOver = async (x: number, y: number) => {
        const before = await page.evaluate(() => scrollY);
        if (client) {
          await client.send("Input.dispatchTouchEvent", {
            type: "touchStart",
            touchPoints: [{ x, y, id: 1 }],
          });
          for (let step = 1; step <= 8; step += 1) {
            await client.send("Input.dispatchTouchEvent", {
              type: "touchMove",
              touchPoints: [{ x, y: y - step * 20, id: 1 }],
            });
            await page.evaluate(() => new Promise(requestAnimationFrame));
          }
          await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        } else {
          await page.mouse.move(x, y);
          await page.mouse.wheel(0, 160);
        }
        await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 40);
        await settleScroll();
        await expect(
          page.getByRole("region", { name: /Component details|Detalles del componente/ }),
        ).toHaveCount(0);
      };
      try {
        await page.goto(kind === "filomena" ? `${locale}/work/filomena` : `${locale}/work`);
        await page.evaluate(() => document.fonts.ready);
        // Inspect diagrams with the public motion pause; animation has its own coverage.
        await page.locator("[data-motion-toggle]").click();
        await expect(page.locator("[data-motion-toggle]")).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator("[data-ambient-field]")).toHaveAttribute("data-state", "paused");
        const figure =
          kind === "filomena"
            ? page.locator("figure").filter({ has: page.locator(".react-flow") })
            : page.locator(`#${kind} figure`);
        const canvas = figure.locator(".react-flow");
        await expect(canvas.locator(".react-flow__node").first()).toBeVisible();
        await canvas.scrollIntoViewIfNeeded();
        const label = await canvas.locator(".react-flow__node button").evaluateAll(
          (buttons) =>
            buttons
              .map((button) => button.getBoundingClientRect())
              .filter((bounds) => bounds.top >= 120 && bounds.bottom <= innerHeight - 120)
              .sort(
                (a, b) =>
                  Math.abs(a.top + a.height / 2 - innerHeight / 2) -
                  Math.abs(b.top + b.height / 2 - innerHeight / 2),
              )
              .map((bounds) => ({
                x: bounds.x + bounds.width / 2,
                y: bounds.y + bounds.height / 2,
              }))[0],
        );
        expect(label, `${kind} has a visible node label for a real gesture`).toBeDefined();
        await scrollOver(label.x, label.y);
        await canvas.scrollIntoViewIfNeeded();
        const bounds = await canvas.boundingBox();
        if (!bounds) throw new Error("Diagram is missing");
        await scrollOver(
          bounds.x + bounds.width - 4,
          Math.max(200, Math.min(600, bounds.y + bounds.height / 2)),
        );
        const controls = canvas.locator(".react-flow__controls");
        await controls.scrollIntoViewIfNeeded();
        for (const button of await controls.locator("button").all()) {
          const buttonBounds = await button.boundingBox();
          expect(buttonBounds?.width).toBeGreaterThanOrEqual(44);
          expect(buttonBounds?.height).toBeGreaterThanOrEqual(44);
        }
        const zoom = () =>
          canvas
            .locator(".react-flow__viewport")
            .evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a);
        const initialZoom = await zoom();
        const controlPosition = await page.evaluate(() => scrollY);
        await controls.locator("button").first().click();
        await expect.poll(zoom).toBeGreaterThan(initialZoom);
        await controls.locator("button").nth(2).click();
        await expect.poll(zoom).toBeCloseTo(initialZoom, 2);
        expect(await page.evaluate(() => scrollY)).toBe(controlPosition);
        const node = canvas.locator(".react-flow__node button").first();
        // Prepare visibility and hit testing before measuring: Playwright may scroll
        // a zoomed node into view as part of its click action.
        await node.click({ trial: true });
        const inspectionPosition = await page.evaluate(() => scrollY);
        await node.click();
        const inspection = canvas.getByRole("region", {
          name: /Component details|Detalles del componente/,
        });
        await expect(inspection).toBeVisible();
        await expect(inspection.getByRole("heading")).not.toBeEmpty();
        await expect
          .poll(async () => {
            const panel = await inspection.boundingBox();
            const viewport = await page.evaluate(() => ({
              width: innerWidth,
              height: innerHeight,
            }));
            return (
              !!panel &&
              panel.x >= 0 &&
              panel.y >= 0 &&
              panel.x + panel.width <= viewport.width + 1 &&
              panel.y + panel.height <= viewport.height + 1
            );
          })
          .toBe(true);
        await expect(node).toBeFocused();
        await expect(node).toHaveAttribute("aria-expanded", "true");
        await page.keyboard.press("Escape");
        await expect(inspection).toHaveCount(0);
        await expect(node).toBeFocused();
        expect(await page.evaluate(() => scrollY)).toBe(inspectionPosition);
        await node.click();
        const close = inspection.getByRole("button");
        await close.click({ trial: true });
        const closePosition = await page.evaluate(() => scrollY);
        expect((await close.boundingBox())?.height).toBeGreaterThanOrEqual(44);
        await close.click();
        await expect(inspection).toHaveCount(0);
        await expect(node).toBeFocused();
        expect(await page.evaluate(() => scrollY)).toBe(closePosition);
        await page.keyboard.press("Enter");
        await expect(inspection).toBeVisible();
        await expect(node).toBeFocused();
        expect(await page.evaluate(() => scrollY)).toBe(closePosition);
        await page.keyboard.press("Escape");
        await expect(inspection).toHaveCount(0);
        await expect(node).toBeFocused();
      } finally {
        await client?.detach();
      }
    });
  }
}
