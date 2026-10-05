import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { parseSuggestions } from "../src/features/assistant/adapters/suggestions.ts";

test("domain and application remain independent of frameworks and concrete adapters", () => {
  for (const layer of ["domain", "application"]) {
    const directory = `src/features/assistant/${layer}`;
    for (const file of readdirSync(directory)) {
      const source = readFileSync(`${directory}/${file}`, "utf8");
      for (const match of source.matchAll(/(?:import|export)[\s\S]*?from\s+["']([^"']+)["']/g)) {
        assert.doesNotMatch(match[1] ?? "", /react|next|adapters|contracts|presentation/);
      }
      assert.doesNotMatch(source, /\b(?:window|document|localStorage|fetch)\b/);
    }
  }
});
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
