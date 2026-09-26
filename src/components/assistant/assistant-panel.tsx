"use client";
import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import styles from "./assistant-panel.module.css";
import {
  type Conversation,
  cancel,
  conversations,
  create,
  type Message,
  messages,
  run,
  session,
} from "./client";

const text = {
  en: {
    title: "Portfolio assistant",
    description:
      "Ask about Gonzalo's public work. Fixture mode shows source excerpts, not AI model quality.",
    ask: "Ask a question",
    send: "Send",
    stop: "Stop",
    close: "Close assistant",
    new: "New chat",
    error: "The assistant is unavailable. Please try again later.",
    interrupted: "The response was interrupted. Review the saved conversation before trying again.",
    source: "Sources",
    full: "Open full chat",
    retention: "Anonymous history is kept for up to 7 days.",
  },
  es: {
    title: "Asistente del portfolio",
    description:
      "Pregunta sobre el trabajo público de Gonzalo. El modo de prueba muestra fragmentos, no calidad de un modelo de IA.",
    ask: "Escribe tu pregunta",
    send: "Enviar",
    stop: "Detener",
    close: "Cerrar asistente",
    new: "Nueva conversación",
    error: "El asistente no está disponible. Intenta más tarde.",
    interrupted:
      "La respuesta se interrumpió. Revisa la conversación guardada antes de intentar de nuevo.",
    source: "Fuentes",
    full: "Abrir chat completo",
    retention: "El historial anónimo se conserva hasta 7 días.",
  },
};

export default function AssistantPanel({ locale }: { locale: "en" | "es" }) {
  const t = text[locale];
  const [items, setItems] = useState<Conversation[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [partial, setPartial] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const runId = useRef<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    session()
      .then(conversations)
      .then((list) => {
        setReady(true);
        setItems(list);
        setActive(list[0]?.id ?? null);
      })
      .catch(() => setError(t.error));
  }, [t.error]);
  useEffect(() => {
    if (active)
      messages(active)
        .then(setHistory)
        .catch(() => setError(t.error));
    else setHistory([]);
  }, [active, t.error]);
  async function newChat() {
    try {
      const item = await create();
      setItems([item, ...items]);
      setActive(item.id);
      setError("");
    } catch {
      setError(t.error);
    }
  }
  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (busy || !ready || !draft.trim()) return;
    const prompt = draft.trim();
    setDraft("");
    setError("");
    setBusy(true);
    setPartial("");
    const abort = new AbortController();
    controller.current = abort;
    let current = active;
    try {
      if (!current) {
        const item = await create();
        current = item.id;
        setActive(item.id);
        setItems([item, ...items]);
      }
      setHistory((old) => [
        ...old,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: prompt,
          citations: [],
          created_at: new Date().toISOString(),
        },
      ]);
      const terminal = await run(current, prompt, locale, abort.signal, (entry) => {
        runId.current = entry.run_id;
        if (entry.type === "message.delta")
          setPartial((old) => old + String(entry.payload.text ?? ""));
        if (entry.type === "run.failed") setError(t.error);
      });
      if (!terminal) setError(t.interrupted);
    } catch {
      if (!abort.signal.aborted) setError(t.error);
    } finally {
      setBusy(false);
      setPartial("");
      controller.current = null;
      runId.current = null;
      if (current)
        messages(current)
          .then(setHistory)
          .catch(() => {});
    }
  }
  async function stop() {
    if (runId.current) await cancel(runId.current).catch(() => {});
    controller.current?.abort();
    setBusy(false);
  }
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  }
  return (
    <DialogContent closeLabel={t.close} className={styles.panel}>
      <DialogTitle>{t.title}</DialogTitle>
      <DialogDescription>{t.description}</DialogDescription>
      <div className={styles.toolbar}>
        <select
          aria-label={locale === "es" ? "Conversación" : "Conversation"}
          value={active ?? ""}
          onChange={(event) => setActive(event.target.value)}
        >
          <option value="">{t.new}</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
        <button type="button" onClick={newChat} disabled={!ready}>
          {t.new}
        </button>
      </div>
      <div className={styles.messages} role="log" aria-live="polite">
        {history.map((message) => (
          <article key={message.id} className={styles.message}>
            <strong>{message.role === "user" ? (locale === "es" ? "Tú" : "You") : t.title}</strong>
            <p>{message.content}</p>
            {message.citations?.length > 0 && (
              <div>
                <strong>{t.source}</strong>
                <ul>
                  {message.citations
                    .filter((citation) =>
                      citation.url.startsWith("https://github.com/gonzalomartinperez/portfolio/"),
                    )
                    .map((citation) => (
                      <li key={citation.id}>
                        <a href={citation.url} target="_blank" rel="noopener noreferrer">
                          {citation.label}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </article>
        ))}
        {busy && (
          <article className={styles.message}>
            <strong>{t.title}</strong>
            <p>{partial || "…"}</p>
          </article>
        )}
      </div>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <form onSubmit={submit} className={styles.composer}>
        <label className={styles.visuallyHidden} htmlFor="assistant-question">
          {t.ask}
        </label>
        <textarea
          id="assistant-question"
          placeholder={t.ask}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          maxLength={4000}
        />
        <button
          type={busy ? "button" : "submit"}
          disabled={!ready}
          onClick={busy ? stop : undefined}
        >
          {busy ? t.stop : t.send}
        </button>
      </form>
      <div className={styles.foot}>
        <small>{t.retention}</small>
        <a
          href={process.env.NEXT_PUBLIC_ASSISTANT_WEB_URL ?? "http://localhost:3001"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.full}
        </a>
      </div>
    </DialogContent>
  );
}
