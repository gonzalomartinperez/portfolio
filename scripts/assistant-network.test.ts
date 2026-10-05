import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";
import { createHttpTransport } from "../src/features/assistant/adapters/api.ts";
import type { Progress } from "../src/features/assistant/domain/models.ts";

function event(type: string, sequence: number, payload: object) {
  return `event: ${type}\ndata: ${JSON.stringify({ type, sequence, payload, schema_version: "1", run_id: "run", conversation_id: "chat", timestamp: "2026-10-04T00:00:00Z" })}\n\n`;
}
test("real loopback HTTP transports split UTF-8 SSE without dropping durable completion", async (context) => {
  let csrfChecked = false;
  const server = createServer(async (request, response) => {
    if (request.url === "/api/v1/session") {
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ csrf_token: "fixture", retention_days: 7 }));
      return;
    }
    csrfChecked =
      request.headers["x-csrf-token"] === "fixture" &&
      request.headers["idempotency-key"] === "once";
    response.writeHead(200, { "Content-Type": "text/event-stream", "X-Run-ID": "run" });
    const bytes = new TextEncoder().encode(
      event("run.started", 0, {}) + event("message.delta", 1, { text: "Español" }),
    );
    for (let index = 0; index < bytes.length; index += 3)
      response.write(bytes.slice(index, index + 3));
    await new Promise((resolve) => setTimeout(resolve, 10));
    response.end(
      event("message.completed", 2, { message_id: "answer", content: "Español", citations: [] }) +
        event("run.completed", 3, {}),
    );
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(
    () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  );
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const api = createHttpTransport(`http://127.0.0.1:${address.port}`);
  const signal = new AbortController().signal;
  await api.session(signal);
  const events: Progress[] = [];
  await api.send("chat", "Question", "es", signal, (progress) => events.push(progress), "once");
  assert.equal(csrfChecked, true);
  assert.deepEqual(
    events.map((progress) => progress.kind),
    ["started", "started", "delta", "answer", "completed"],
  );
  assert.deepEqual(
    events.find((progress) => progress.kind === "delta"),
    { kind: "delta", text: "Español" },
  );
});

test("real loopback disconnect aborts the reader and does not retry generation", async (context) => {
  let requests = 0;
  let disconnected = false;
  const server = createServer((request, response) => {
    if (!request.url?.endsWith("/stream")) {
      response.end(JSON.stringify({ csrf_token: "fixture", retention_days: 7 }));
      return;
    }
    requests += 1;
    response.writeHead(200, { "Content-Type": "text/event-stream", "X-Run-ID": "run" });
    response.on("close", () => {
      disconnected = true;
    });
    response.write(event("run.started", 0, {}));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(
    () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  );
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const api = createHttpTransport(`http://127.0.0.1:${address.port}`);
  const controller = new AbortController();
  const result = api.send(
    "chat",
    "Question",
    "en",
    controller.signal,
    (progress) => {
      if (progress.kind === "started") controller.abort();
    },
    "once",
  );
  await assert.rejects(result);
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(requests, 1);
  assert.equal(disconnected, true);
});
