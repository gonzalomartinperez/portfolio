"use client";
import { useEffect, useState } from "react";
import { createHttpTransport } from "./adapters/api";
import { loadSuggestions } from "./adapters/suggestions";
import { createAssistant } from "./application/assistant";
import Chat from "./presentation/chat";
import type { NativePresentation } from "./presentation/presentation";

const apiOrigin =
  process.env.NEXT_PUBLIC_ASSISTANT_API_URL ?? "https://assistant.gonzalomartinperez.com";

export default function Assistant({ presentation }: { presentation: NativePresentation }) {
  const [assistant] = useState(() =>
    createAssistant(createHttpTransport(apiOrigin), {
      id: () => crypto.randomUUID(),
      now: () => new Date().toISOString(),
    }),
  );
  const [starters, setStarters] = useState<readonly string[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    setStarters([]);
    void loadSuggestions(apiOrigin, presentation.preferences.locale, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setStarters(items);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [presentation.preferences.locale]);
  return <Chat assistant={assistant} presentation={presentation} starters={starters} />;
}
