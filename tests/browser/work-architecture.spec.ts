import { expect, test } from "@playwright/test";

for (const locale of ["", "/es"]) {
  test(`${locale || "en"} work diagrams preserve distinct service paths`, async ({
    page,
  }, info) => {
    await page.goto(`${locale}/work`);
    for (const [role, nodes, edges] of [
      ["rampy", 7, 6],
      ["teamcubation", 11, 11],
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
    const providers = page.locator("#rampy .react-flow__node[data-id='defi']");
    for (const provider of ["Morpho", "Aave", "Compound", "LI.FI", "Hyperliquid"]) {
      await expect(providers).toContainText(provider);
    }
    const login = page.locator("#rampy .react-flow__node[data-id='privy']");
    await expect(login).toContainText("Privy");
    await expect(login).toContainText(locale ? "autenticación" : "authentication");
    await expect(login).toContainText("wallets");
    const backoffice = page.locator("#rampy .react-flow__node[data-id='backoffice']");
    await expect(backoffice).toContainText(locale ? "en ampliación" : "expanding");
    await expect(backoffice).not.toContainText(locale ? "en desarrollo" : "in development");
    for (const connection of ["privy-backend", "web-backoffice"]) {
      await expect(page.locator(`#rampy .react-flow__edge[data-id='${connection}']`)).toHaveCount(
        1,
      );
    }
    await expect(page.locator("#teamcubation .react-flow__node[data-id='agent']")).toContainText(
      locale ? "Sistema de asistencia de promociones" : "Promotion Assistance System",
    );
    await expect(page.locator("#teamcubation .react-flow__node[data-id='agent']")).toContainText(
      "Harness",
    );
    const clearLabels = await page.locator("#rampy figure").evaluate((figure) => {
      const path = figure.querySelector<SVGPathElement>(
        ".react-flow__edge[data-id='backend-ai'] .react-flow__edge-path",
      );
      const matrix = path?.getScreenCTM();
      if (!path || !matrix) return false;
      const obstacles = [...figure.querySelectorAll<HTMLElement>(".react-flow__node")]
        .filter(({ dataset }) => !["backend", "ai"].includes(dataset.id ?? ""))
        .map((node) => node.getBoundingClientRect());
      const length = path.getTotalLength();
      for (let distance = 0; distance <= length; distance += 2) {
        const point = path.getPointAtLength(distance).matrixTransform(matrix);
        if (
          obstacles.some(
            (bounds) =>
              point.x > bounds.left + 3 &&
              point.x < bounds.right - 3 &&
              point.y > bounds.top + 3 &&
              point.y < bounds.bottom - 3,
          )
        )
          return false;
      }
      return true;
    });
    expect(clearLabels, "Backend-to-AI routing leaves other node labels clear").toBe(true);
    await expect(backoffice).toContainText(locale ? "telemetría" : "telemetry");
    await expect(page.locator("#teamcubation .react-flow__edge[data-id='source-sqs']")).toHaveCount(
      1,
    );
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
