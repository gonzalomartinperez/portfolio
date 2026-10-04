import type { components } from "../../../contracts/types";
import type { Locale } from "../domain/models";
import { record, text } from "./validate.ts";

export function parseSuggestions(value: unknown): components["schemas"]["SuggestionsView"] {
  if (
    !record(value) ||
    !text(value.corpus_version, 100) ||
    typeof value.source_commit !== "string" ||
    !/^[0-9a-f]{40}$/.test(value.source_commit) ||
    !Array.isArray(value.items) ||
    value.items.length > 6
  )
    throw new Error("Invalid starter catalog");
  const items = value.items.map((item: unknown) => {
    if (
      !record(item) ||
      typeof item.id !== "string" ||
      !/^[a-z0-9-]{1,80}$/.test(item.id) ||
      !text(item.question, 500) ||
      !item.question.trim() ||
      (item.topic !== "profile" &&
        item.topic !== "experience" &&
        item.topic !== "projects" &&
        item.topic !== "education" &&
        item.topic !== "achievement")
    )
      throw new Error("Invalid starter question");
    return {
      id: item.id,
      topic: item.topic,
      question: item.question,
    } satisfies components["schemas"]["StarterPrompt"];
  });
  if (new Set(items.map((item) => item.id)).size !== items.length)
    throw new Error("Duplicate starter question");
  return { corpus_version: value.corpus_version, source_commit: value.source_commit, items };
}
export async function loadSuggestions(base: string, locale: Locale, signal: AbortSignal) {
  const response = await fetch(`${base}/api/v1/knowledge/suggestions?locale=${locale}`, {
    signal,
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Starter catalog unavailable");
  return parseSuggestions(await response.json())
    .items.slice(0, 3)
    .map((item) => item.question);
}
