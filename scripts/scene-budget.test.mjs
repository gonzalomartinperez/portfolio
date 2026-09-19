import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  buildConstellation,
  buildStaticLayers,
  POINT_COUNT_STATIC,
  projectConstellation,
} from "../src/components/hero/constellation.ts";
import { SceneBudgetPlugin } from "./scene-budget-plugin.mjs";

test("static scene batches every deterministic square without changing its position", () => {
  const layers = buildStaticLayers();
  assert.equal(layers.length, 32);
  assert.deepEqual(layers, buildStaticLayers());
  const squares = layers.flatMap((layer) => layer.path.match(/M[^Z]+Z/g) ?? []);
  assert.equal(squares.length, POINT_COUNT_STATIC);
  const expected = projectConstellation(buildConstellation(POINT_COUNT_STATIC), 0.6).map(
    (point) => `M${point.x.toFixed(4)} ${(-point.y).toFixed(4)}h.006v.006h-.006Z`,
  );
  assert.deepEqual(squares.sort(), expected.sort());
  assert.ok(layers.every((layer, index) => index === 0 || layer.depth > layers[index - 1].depth));
});

test("scene budget includes extracted vendors and nested asynchronous chunks", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "portfolio-budget-"));
  mkdirSync(path.join(directory, ".next"));
  try {
    const scene = {
      files: ["static/chunks/scene.js"],
      groupsIterable: [],
      canBeInitial: () => false,
    };
    const vendor = { files: ["static/chunks/vendors.js"], canBeInitial: () => false };
    const nested = { files: ["static/chunks/nested.js"], canBeInitial: () => false };
    scene.groupsIterable.push({
      chunks: [scene, vendor],
      childrenIterable: [{ chunks: [nested], childrenIterable: [] }],
    });
    let callback;
    new SceneBudgetPlugin().apply({
      context: directory,
      hooks: {
        done: {
          tap: (_name, value) => {
            callback = value;
          },
        },
      },
    });
    callback({
      compilation: {
        chunks: [scene],
        chunkGraph: {
          getChunkModulesIterable: () => [
            { identifier: () => "C:/src/components/hero/scene-runtime.ts|app-pages-browser" },
          ],
        },
      },
    });
    const report = JSON.parse(
      readFileSync(path.join(directory, ".next/scene-budget.json"), "utf8"),
    );
    assert.deepEqual(report.files, [
      "static/chunks/nested.js",
      "static/chunks/scene.js",
      "static/chunks/vendors.js",
    ]);
    assert.equal(report.initial, false);
    assert.equal(report.roots, 1);
  } finally {
    rmSync(directory, { recursive: true });
  }
});
