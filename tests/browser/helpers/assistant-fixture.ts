import { expect, type Page } from "@playwright/test";

const api = "https://assistant.gonzalomartinperez.com";
const conversationId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const runId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const date = "2026-10-04T00:00:00Z";
export const answer =
  "Gonzalo builds software with a focus on clear architecture and public evidence.";
const citation = {
  id: "profile",
  label: "Professional profile",
  source_type: "code",
  url: `https://github.com/gonzalomartinperez/portfolio/blob/${"a".repeat(40)}/src/content/profile.ts`,
  path: "src/content/profile.ts",
  start_line: 1,
  end_line: 10,
};
const message = {
  id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  role: "assistant",
  content: answer,
  citations: [citation],
  created_at: date,
};
function frame(type: string, sequence: number, payload: object) {
  return `event: ${type}\ndata: ${JSON.stringify({ type, schema_version: "1", run_id: runId, conversation_id: conversationId, sequence, timestamp: date, payload })}\n\n`;
}
export async function fixture(
  page: Page,
  mode:
    | "complete"
    | "interrupted"
    | "unavailable"
    | "expired"
    | "provider"
    | "unsafe"
    | "long"
    | "rejected" = "complete",
  delayMs = 0,
) {
  let session = false;
  let requests = 0;
  let saved = false;
  let releaseStream: () => void = () => {};
  const streamGate = new Promise<void>((resolve) => {
    releaseStream = resolve;
  });
  let created = false;
  let title = "New conversation";
  const content =
    mode === "unsafe"
      ? "Safe text <script>window.assistantExecuted=true</script> [unsafe](javascript:alert(1)) ![remote](https://evil.example/tracker.png)"
      : mode === "long"
        ? Array.from({ length: 100 }, (_, index) => `Paragraph ${index}: ${answer}`).join("\n\n") +
          `\n\nhttps://example.com/${"a".repeat(2000)}`
        : answer;
  const storedMessage = { ...message, content };
  await page.route(`${api}/api/v1/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const headers = {
      "Access-Control-Allow-Origin": new URL(page.url()).origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers":
        "Content-Type, X-CSRF-Token, X-Session-Bootstrap, Idempotency-Key",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Expose-Headers": "X-Run-ID",
    };
    async function json(body: unknown, status = 200) {
      await route.fulfill({
        status,
        contentType: "application/json",
        headers,
        body: JSON.stringify(body),
      });
    }
    if (method === "OPTIONS") return route.fulfill({ status: 204, headers });
    if (url.pathname.endsWith("/knowledge/suggestions"))
      return json({
        corpus_version: "fixture",
        source_commit: "a".repeat(40),
        items: [
          {
            id: "projects",
            topic: "projects",
            question:
              url.searchParams.get("locale") === "es"
                ? "¿Qué proyectos construyó Gonzalo?"
                : "What has Gonzalo built?",
          },
        ],
      });
    if (url.pathname.endsWith("/session")) {
      if (mode === "unavailable") return json({ code: "unavailable" }, 503);
      if (method === "POST") {
        expect(request.headers()["x-session-bootstrap"]).toBe("1");
        session = true;
      }
      return session
        ? json({ csrf_token: "fixture-token", retention_days: 7 })
        : json({ code: "unauthorized" }, 401);
    }
    if (method !== "GET") expect(request.headers()["x-csrf-token"]).toBe("fixture-token");
    if (url.pathname.endsWith("/messages/stream")) {
      requests += 1;
      if (mode === "rejected")
        return json({ code: "invalid_request", message: "private data" }, 422);
      if (mode === "expired") return json({ code: "unauthorized" }, 401);
      if (mode === "provider")
        return json(
          { code: "provider_unavailable", message: "private data", request_id: "fixture" },
          503,
        );
      if (delayMs < 0) await streamGate;
      else await new Promise((resolve) => setTimeout(resolve, delayMs));
      const body =
        frame("run.started", 0, {}) +
        frame("message.delta", 1, { text: "Gonzalo builds software" }) +
        (mode === "interrupted"
          ? ""
          : frame("message.completed", 2, {
              message_id: message.id,
              content,
              citations: [citation],
            }) + frame("run.completed", 3, {}));
      saved = mode === "complete" || mode === "unsafe" || mode === "long";
      return route.fulfill({
        contentType: "text/event-stream",
        headers: { ...headers, "X-Run-ID": runId },
        body,
      });
    }
    if (url.pathname.endsWith("/messages"))
      return json({ items: saved ? [storedMessage] : [], next_cursor: null });
    if (url.pathname.endsWith(`/conversations/${conversationId}`) && method === "PATCH") {
      title = request.postDataJSON().title;
      return json({});
    }
    if (url.pathname.endsWith(`/conversations/${conversationId}`) && method === "DELETE") {
      created = false;
      saved = false;
      return route.fulfill({ status: 204, headers });
    }
    const conversation = { id: conversationId, title, created_at: date, updated_at: date };
    if (url.pathname.endsWith("/conversations") && method === "POST") {
      created = true;
      return json(conversation, 201);
    }
    if (url.pathname.endsWith("/conversations"))
      return json({ items: created ? [conversation] : [], next_cursor: null });
    return json({});
  });
  return { requests: () => requests, release: () => releaseStream() };
}
export async function open(page: Page, locale = "en") {
  await page.goto(locale === "es" ? "/es/about" : "/about");
  await page
    .getByRole("button", { name: locale === "es" ? "Preguntar a la IA" : "Ask AI", exact: true })
    .click();
  await expect(page.locator("#question")).toBeVisible();
  await expect(
    page.getByText(
      locale === "es" ? "Conectando con el asistente…" : "Connecting to the assistant…",
      { exact: true },
    ),
  ).toHaveCount(0);
}
