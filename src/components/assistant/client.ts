import type { components } from "@/contracts/types";
export type Citation = components["schemas"]["Citation"];
export type Message = components["schemas"]["MessageView"];
export type Conversation = components["schemas"]["ConversationView"];
export type Run = components["schemas"]["RunView"];
export type Event = {
  type: string;
  schema_version: "1";
  run_id: string;
  payload: Record<string, unknown>;
};
const base = process.env.NEXT_PUBLIC_ASSISTANT_API_URL ?? "http://localhost:8000";
let csrf = "";
let sessionPromise: Promise<void> | null = null;

async function call(path: string, init: RequestInit = {}) {
  const response = await fetch(base + path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.method && csrf ? { "X-CSRF-Token": csrf } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) throw new Error(`assistant_http_${response.status}`);
  return response;
}
export function session(): Promise<void> {
  if (sessionPromise) return sessionPromise;
  sessionPromise = (async () => {
    let response = await fetch(`${base}/api/v1/session`, { credentials: "include" });
    if (response.status === 401)
      response = await call("/api/v1/session", {
        method: "POST",
        headers: { "X-Session-Bootstrap": "1" },
        body: "{}",
      });
    if (!response.ok) throw new Error("session_unavailable");
    csrf = (await response.json()).csrf_token;
  })().catch((error) => {
    sessionPromise = null;
    throw error;
  });
  return sessionPromise;
}
export async function conversations(): Promise<Conversation[]> {
  return (await (await call("/api/v1/conversations")).json()).items;
}
export async function create(): Promise<Conversation> {
  return (await call("/api/v1/conversations", { method: "POST", body: "{}" })).json();
}
export async function messages(id: string): Promise<Message[]> {
  return (await (await call(`/api/v1/conversations/${id}/messages`)).json()).items.reverse();
}
export async function cancel(id: string) {
  await call(`/api/v1/runs/${id}/cancel`, { method: "POST", body: "{}" });
}
export async function run(
  id: string,
  content: string,
  locale: "en" | "es",
  signal: AbortSignal,
  onEvent: (event: Event) => void,
) {
  const response = await call(`/api/v1/conversations/${id}/messages/stream`, {
    method: "POST",
    body: JSON.stringify({ content, locale }),
    signal,
    headers: { "Idempotency-Key": crypto.randomUUID() },
  });
  if (!response.body) throw new Error("stream_unavailable");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let terminal = false;
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const data = frame
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data: "))
        .map((line) => line.slice(6))
        .join("\n");
      if (!data) continue;
      const event = JSON.parse(data) as Event;
      if (event.schema_version !== "1") throw new Error("stream_version_mismatch");
      onEvent(event);
      terminal ||= ["run.completed", "run.failed", "run.cancelled"].includes(event.type);
    }
    if (done) break;
  }
  return terminal;
}
