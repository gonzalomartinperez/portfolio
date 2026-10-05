import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { AssistantBudgetPlugin } from "./assistant-budget-plugin.ts";

test("assistant budget follows owned chunks and distinguishes deferred from initial assets", (context) => {
  const directory = mkdtempSync(path.join(tmpdir(), "portfolio-assistant-budget-"));
  mkdirSync(path.join(directory, ".next"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const initial of [false, true]) {
    const chunk = {
      files: ["static/chunks/assistant.js", "static/css/assistant.css"],
      groupsIterable: [],
      canBeInitial: () => initial,
    };
    new AssistantBudgetPlugin().apply({
      context: directory,
      hooks: {
        done: {
          tap(_name, callback) {
            callback({
              compilation: {
                chunks: [chunk],
                chunkGraph: {
                  getChunkModulesIterable: () => [
                    { identifier: () => "/checkout/src/features/assistant/entry.tsx" },
                  ],
                },
              },
            });
          },
        },
      },
    });
    const report: unknown = JSON.parse(
      readFileSync(path.join(directory, ".next/assistant-budget.json"), "utf8"),
    );
    assert.deepEqual(report, {
      entry: "src/features/assistant/entry.tsx",
      roots: 1,
      initial,
      css: ["static/css/assistant.css"],
      javascript: ["static/chunks/assistant.js"],
    });
  }
});
