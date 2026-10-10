import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

import { answer, fixture, open } from "./helpers/assistant-fixture";

test("native compact panel, sources and maximization preserve a single conversation", async ({
  page,
}, testInfo) => {
  const backend = await fixture(page);
  await open(page);
  const textarea = page.locator("#question");
  await expect(textarea).toBeFocused();
  await expect(page.getByRole("button", { name: "What has Gonzalo built?" })).toBeVisible();
  await page.getByRole("button", { name: "What has Gonzalo built?" }).click();
  await expect(textarea).toHaveValue("What has Gonzalo built?");
  expect(backend.requests()).toBe(0);
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText(answer, { exact: true })).toBeVisible();
  if (testInfo.project.name === "desktop")
    await page
      .locator("#portfolio-assistant")
      .screenshot({ path: testInfo.outputPath("compact-dark-en.png") });
  const sources = page.getByText("Public sources · 1");
  await sources.click();
  await expect(page.getByRole("link", { name: /Professional profile/ })).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  await textarea.fill("A draft worth preserving");
  const identity = await textarea.evaluate((element) => {
    element.setAttribute("data-same-node", "yes");
    return element.id;
  });
  expect(identity).toBe("question");
  await page.getByRole("button", { name: "Expand panel" }).click();
  await expect(page.locator("#portfolio-assistant")).toHaveAttribute("role", "dialog");
  if (testInfo.project.name === "desktop")
    await page
      .locator("#portfolio-assistant")
      .screenshot({ path: testInfo.outputPath("expanded-dark-en.png") });
  await page.getByRole("button", { name: "Restore panel" }).click();
  await page.getByRole("button", { name: "Minimize assistant" }).click();
  await expect(page.getByRole("button", { name: "Ask AI", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(textarea).toHaveValue("A draft worth preserving");
  await expect(textarea).toHaveAttribute("data-same-node", "yes");
  expect(backend.requests()).toBe(1);
  await page.getByRole("button", { name: "Minimize assistant" }).click();
  const motion = page.locator("[data-motion-toggle]");
  await expect(motion).toHaveAttribute("aria-pressed", "false");
});

test("minimized authorized response finishes once and route changes retain draft", async ({
  page,
}) => {
  const backend = await fixture(page, "complete", 1000);
  await open(page);
  await page.locator("#question").fill("Describe Gonzalo’s projects");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Minimize assistant" }).click();
  await page.getByRole("link", { name: "Contact", exact: true }).first().click();
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(page.getByText(answer, { exact: true })).toBeVisible();
  expect(backend.requests()).toBe(1);
  await page.locator("#question").fill("Keep this draft");
  await page.getByRole("button", { name: "Minimize assistant" }).click();
  await page.getByRole("link", { name: "Work", exact: true }).first().click();
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(page.locator("#question")).toHaveValue("Keep this draft");
});

for (const mode of ["interrupted", "provider", "expired"] as const) {
  test(`${mode} is honest, preserves safe recovery and never retries generation`, async ({
    page,
  }) => {
    const backend = await fixture(page, mode);
    await open(page);
    await page.locator("#question").fill("Tell me about Gonzalo");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.locator("#portfolio-assistant").getByRole("alert")).toContainText(
      mode === "interrupted"
        ? "ended early"
        : mode === "provider"
          ? "unavailable right now"
          : "expired",
    );
    expect(backend.requests()).toBe(1);
    await expect(page.locator("[data-assistant-waiting]")).toHaveCount(0);
    if (mode === "interrupted")
      await expect(page.getByText("Gonzalo builds software", { exact: true })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("private data");
  });
}

test("unavailable backend permits an explicit reconnect without generation", async ({ page }) => {
  const backend = await fixture(page, "unavailable");
  await page.goto("/assistant");
  await expect(page.locator("#portfolio-assistant").getByRole("alert")).toContainText(
    "unavailable",
  );
  await expect(page.getByRole("button", { name: "Reconnect" })).toBeVisible();
  expect(backend.requests()).toBe(0);
});

test("Spanish mobile panel is modal, keyboard-safe, theme-consistent and accessible", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await fixture(page);
  await open(page, "es");
  const surface = page.locator("#portfolio-assistant");
  await expect(surface).toHaveAttribute("aria-modal", "true");
  for (const theme of ["dark", "light"]) {
    await page.evaluate(async (value) => {
      document.documentElement.dataset.theme = value;
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    }, theme);
    await expect
      .poll(() => surface.evaluate((element) => getComputedStyle(element).backgroundColor))
      .toBe(theme === "light" ? "rgb(250, 250, 251)" : "rgb(0, 0, 0)");
    const scan = await new AxeBuilder({ page })
      .include("#portfolio-assistant")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      scan.violations.map((item) => ({
        id: item.id,
        targets: item.nodes.map((node) => node.target),
        details: item.nodes.map((node) => node.failureSummary),
      })),
    ).toEqual([]);
  }
  if (testInfo.project.name === "desktop")
    await surface.screenshot({ path: testInfo.outputPath("mobile-light-es.png") });
  expect(await surface.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
    true,
  );
  await page.locator("#question").fill("Pregunta sin enviar");
  await page.keyboard.press("Shift+Enter");
  await expect(page.locator("#question")).toHaveValue("Pregunta sin enviar\n");
  await page.keyboard.press("Escape");
  await expect(surface).toBeHidden();
  await expect(page.getByRole("button", { name: "Preguntar a la IA" })).toBeFocused();
});

test("expanded page reuses runtime and switching locale preserves the conversation draft", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/assistant");
  await expect(page.locator("#question")).toBeFocused();
  await page.locator("#question").fill("A bilingual draft");
  await page.getByRole("link", { name: "ES", exact: true }).click();
  await expect(page).toHaveURL(/\/es\/assistant$/);
  await expect(page.locator("#question")).toHaveValue("A bilingual draft");
  await expect(page.getByRole("button", { name: "Enviar", exact: true })).toBeVisible();
});

test("history rehydrates and conversation rename/delete restores keyboard focus", async ({
  page,
}) => {
  await fixture(page);
  await open(page);
  await page.locator("#question").fill("Describe Gonzalo");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText(answer, { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(page.getByText(answer, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Conversations", exact: true }).click();
  await page.getByRole("button", { name: "Rename New conversation" }).click();
  await page.getByRole("textbox", { name: "Rename" }).fill("Public work");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("button", { name: "Public work", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Delete Public work" }).click();
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("button", { name: "Public work", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Delete Public work" }).click();
  await page.getByRole("button", { name: "Delete conversation", exact: true }).click();
  await expect(page.getByRole("button", { name: "New chat", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "What would you like to know?" })).toBeVisible();
});

test("IME and rapid send/stop prevent accidental or duplicate generation", async ({ page }) => {
  const backend = await fixture(page, "complete", -1);
  await open(page);
  const field = page.locator("#question");
  await field.fill("A composed question");
  await field.dispatchEvent("keydown", { key: "Enter", code: "Enter", isComposing: true });
  expect(backend.requests()).toBe(0);
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeEnabled();
  await expect.poll(backend.requests).toBe(1);
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  backend.release();
  await expect(
    page.getByText("Response stopped. Partial text may not be saved.", { exact: true }),
  ).toBeVisible();
  expect(backend.requests()).toBe(1);
  await page.getByRole("button", { name: "Conversations", exact: true }).click();
  await page.getByRole("button", { name: "New chat", exact: true }).click();
  expect(backend.requests()).toBe(1);
});

test("copy awaits the clipboard and exposes an honest manual fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("blocked");
        },
      },
    });
  });
  await fixture(page);
  await open(page);
  await page.locator("#question").fill("Describe Gonzalo");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText(answer, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Copy answer" }).click();
  await expect(
    page.getByText("Could not copy. Select the answer text to copy it manually.", { exact: true }),
  ).toBeVisible();
});

test("model HTML, unsafe links and remote images never become executable UI", async ({ page }) => {
  await fixture(page, "unsafe");
  await open(page);
  await page.locator("#question").fill("Render unsafe content");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText("Safe text", { exact: false })).toBeVisible();
  expect(await page.evaluate(() => "assistantExecuted" in window)).toBe(false);
  await expect(page.locator('#portfolio-assistant a[href^="javascript:"]')).toHaveCount(0);
  await expect(page.locator('#portfolio-assistant img[src^="https://evil.example"]')).toHaveCount(
    0,
  );
});

test("long output, text resizing and a reduced viewport keep reading and controls usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 520 });
  await fixture(page, "long");
  await open(page);
  await page.locator("#question").fill("Long answer");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText("Paragraph 99:", { exact: false })).toBeAttached();
  const log = page.getByRole("log");
  await log.evaluate((element) => {
    element.scrollTop = 0;
    element.dispatchEvent(new Event("scroll"));
  });
  await expect(page.getByRole("button", { name: "Jump to latest" })).toBeVisible();
  async function sendInsideField() {
    const field = await page.locator("#question").boundingBox();
    const send = await page.getByRole("button", { name: "Send", exact: true }).boundingBox();
    return Boolean(
      field &&
        send &&
        send.x >= field.x &&
        send.y >= field.y &&
        send.x + send.width <= field.x + field.width &&
        send.y + send.height <= field.y + field.height,
    );
  }
  await expect.poll(sendInsideField).toBe(true);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await expect.poll(sendInsideField).toBe(true);
  await expect(page.locator("#question")).toBeInViewport();
  await expect(page.getByRole("button", { name: "Send", exact: true })).toBeInViewport();
  expect(
    await page
      .locator("#portfolio-assistant")
      .evaluate((element) => element.scrollWidth <= element.clientWidth),
  ).toBe(true);
  expect(await log.evaluate((element) => element.scrollTop)).toBe(0);
});

test("avatar is decorative and reduced motion leaves a calm complete experience", async ({
  page,
}) => {
  await fixture(page);
  await open(page);
  const avatar = page.locator("[data-identity-avatar]");
  await expect(avatar).toHaveAttribute("aria-hidden", "true");
  await expect(avatar).not.toHaveAttribute("tabindex");
  await avatar.dispatchEvent("pointermove", { pointerType: "mouse", clientX: 100, clientY: 100 });
  expect(await avatar.evaluate((element) => element.style.getPropertyValue("--tilt-x"))).toBe("");
  expect(
    await avatar
      .locator("div")
      .first()
      .evaluate((element) => getComputedStyle(element).transform),
  ).toBe("none");
});

test("landing visit does not initialize the assistant before explicit activation", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v1/")) requests.push(request.url());
  });
  await page.goto("/about");
  await expect(page.getByRole("button", { name: "Ask AI", exact: true })).toBeVisible();
  await expect(page.locator("#question")).toHaveCount(0);
  expect(requests).toEqual([]);
});

test("precise-pointer avatar depth returns to rest and coarse pointers stay still", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/assistant");
  const avatar = page.locator("[data-identity-avatar]");
  await expect(avatar).toBeVisible();
  await expect(page.locator("#question")).toBeFocused();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  const bounds = await avatar.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) throw new Error("Avatar geometry unavailable");
  const fine = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
  await page.mouse.move(bounds.x + bounds.width * 0.8, bounds.y + bounds.height * 0.3, {
    steps: 3,
  });
  if (fine)
    await expect
      .poll(() => avatar.evaluate((element) => element.style.getPropertyValue("--tilt-y")))
      .not.toBe("");
  else
    expect(await avatar.evaluate((element) => element.style.getPropertyValue("--tilt-y"))).toBe("");
  await page.mouse.move(1, 1);
  await expect
    .poll(() => avatar.evaluate((element) => element.style.getPropertyValue("--tilt-y")))
    .toBe("");
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("pending clipboard writes retain focus and prevent duplicate operations", async ({ page }) => {
  await page.addInitScript(() => {
    let calls = 0;
    let finish: () => void = () => {};
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () => {
          calls += 1;
          return new Promise<void>((resolve) => {
            finish = resolve;
          });
        },
      },
    });
    Object.defineProperty(window, "fixtureCopy", {
      value: { calls: () => calls, finish: () => finish() },
    });
  });
  await fixture(page);
  await open(page);
  await page.locator("#question").fill("Describe Gonzalo");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  const copy = page.getByRole("button", { name: "Copy answer" });
  await copy.click();
  await expect(copy).toHaveAttribute("aria-disabled", "true");
  await expect(copy).toBeFocused();
  await page.keyboard.press("Enter");
  const calls = await page.evaluate(() => {
    if (
      !("fixtureCopy" in window) ||
      !window.fixtureCopy ||
      typeof window.fixtureCopy !== "object" ||
      !("calls" in window.fixtureCopy) ||
      typeof window.fixtureCopy.calls !== "function"
    )
      throw new Error("Copy fixture missing");
    return window.fixtureCopy.calls();
  });
  expect(calls).toBe(1);
  await page.evaluate(() => {
    if (
      "fixtureCopy" in window &&
      window.fixtureCopy &&
      typeof window.fixtureCopy === "object" &&
      "finish" in window.fixtureCopy &&
      typeof window.fixtureCopy.finish === "function"
    )
      window.fixtureCopy.finish();
  });
  await expect(page.getByText("Copied", { exact: true })).toBeVisible();
});

for (const locale of ["en", "es"] as const) {
  test(`${locale} icon launcher and waiting indicator follow real request lifecycle`, async ({
    page,
  }) => {
    const backend = await fixture(page, "complete", -1);
    await page.goto(locale === "es" ? "/es/about" : "/about");
    const launcher = page.getByRole("button", {
      name: locale === "es" ? "Preguntar a la IA" : "Ask AI",
      exact: true,
    });
    await expect(launcher).toHaveText("");
    await expect(launcher.locator("svg")).toHaveCount(1);
    await launcher.click();
    await page.locator("#question").fill("Tell me about your experience");
    await page
      .getByRole("button", { name: locale === "es" ? "Enviar" : "Send", exact: true })
      .click();
    const waiting = page.locator("[data-assistant-waiting]");
    await expect(waiting).toHaveText(locale === "es" ? "Pensando…" : "Thinking…");
    await expect(page.locator("#portfolio-assistant").getByRole("status")).toHaveText(
      locale === "es" ? "Pensando…" : "Thinking…",
    );
    await expect(waiting.locator("i").first()).toHaveCSS("animation-name", "none");
    await expect.poll(backend.requests).toBe(1);
    backend.release();
    await expect(page.getByText(answer, { exact: true })).toBeVisible();
    await expect(waiting).toHaveCount(0);
    expect(backend.requests()).toBe(1);
  });
}

test("stopping a pending response clears waiting without retrying generation", async ({ page }) => {
  const backend = await fixture(page, "complete", -1);
  await open(page);
  await page.locator("#question").fill("A pending question");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.locator("[data-assistant-waiting]")).toBeVisible();
  await expect.poll(backend.requests).toBe(1);
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.locator("[data-assistant-waiting]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Send", exact: true })).toBeVisible();
  backend.release();
  expect(backend.requests()).toBe(1);
});

test("send context follows route, theme and locale without transmitting URL parameters", async ({
  page,
}, testInfo) => {
  const backend = await fixture(page);
  await page.goto("/work?private=must-not-travel#rampy");
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(page.locator("#question")).toBeFocused();
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Minimize assistant" }).click();
  await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(page.locator("#portfolio-assistant")).toHaveCSS(
    "background-color",
    "rgb(250, 250, 251)",
  );
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Minimize assistant" }).click();
    await page.getByRole("link", { name: "ES", exact: true }).click();
    await page.getByRole("button", { name: "Preguntar a la IA", exact: true }).click();
  } else {
    await page.getByRole("link", { name: "ES", exact: true }).click();
  }
  await expect(page.getByRole("button", { name: "Enviar", exact: true })).toBeVisible();
  await page.locator("#question").fill("¿Qué construiste en Rampy?");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(page.getByText(answer, { exact: true })).toBeVisible();
  expect(backend.submissions()).toEqual([
    {
      content: "¿Qué construiste en Rampy?",
      locale: "es",
      context: {
        theme: "light",
        opened_path: testInfo.project.name === "mobile" ? "/es/work" : "/work",
        current_path: "/es/work",
        presentation: testInfo.project.name === "mobile" ? "expanded" : "compact",
      },
    },
  ]);
  expect(JSON.stringify(backend.submissions())).not.toContain("must-not-travel");
});

test("cold mobile opening contains keyboard focus while the chat chunk loads", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fixture(page);
  await page.goto("/about");
  const report = JSON.parse(readFileSync(".next/assistant-budget.json", "utf8")) as {
    javascript: string[];
  };
  const gate = Promise.withResolvers<void>();
  await page.route("**/_next/static/chunks/**", async (route) => {
    if (
      report.javascript.some((file) => new URL(route.request().url()).pathname === `/_next/${file}`)
    )
      await gate.promise;
    await route.continue();
  });
  try {
    await page.getByRole("button", { name: "Ask AI", exact: true }).click();
    await expect(page.getByRole("status")).toHaveText("Loading the assistant…");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Expand panel" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(page.getByRole("button", { name: "Minimize assistant" })).toBeFocused();
    gate.resolve();
    await expect(page.locator("#question")).toBeFocused();
  } finally {
    gate.resolve();
  }
});

test("unknown routes omit optional metadata without blocking the question", async ({ page }) => {
  const backend = await fixture(page);
  await page.goto("/not-a-public-route?private=must-not-travel#private");
  await page.getByRole("button", { name: "Ask AI", exact: true }).click();
  await expect(page.locator("#question")).toBeEnabled();
  await page.locator("#question").fill("What has Gonzalo built?");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText(answer, { exact: true })).toBeVisible();
  expect(backend.submissions()).toEqual([{ content: "What has Gonzalo built?", locale: "en" }]);
});
