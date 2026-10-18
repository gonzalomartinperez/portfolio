import assert from "node:assert/strict";
import test from "node:test";
import { parseSuggestions } from "../../src/features/assistant/adapters/suggestions.ts";

test("source-backed catalog validates all entries and provenance", () => {
  const valid = {
    corpus_version: "v1",
    source_commit: "a".repeat(40),
    items: [{ id: "projects", topic: "projects", question: "What did Gonzalo build?" }],
  };
  assert.equal(parseSuggestions(valid).items.length, 1);
  for (const value of [
    { ...valid, source_commit: "mutable" },
    { ...valid, items: Array(7).fill(valid.items[0]) },
    { ...valid, items: [{ id: "projects", topic: "unknown", question: "hello" }] },
    { ...valid, items: [valid.items[0], valid.items[0]] },
  ]) {
    assert.throws(() => parseSuggestions(value));
  }
});
