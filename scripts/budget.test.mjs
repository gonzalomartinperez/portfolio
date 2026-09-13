import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

/**
 * Performance budgets, measured against the real build output.
 *
 * These are transfer-size budgets, not a performance measurement: a passing run says the page
 * stayed within its weight allowance, not that it was fast for any particular visitor. Field
 * performance is not established anywhere in this repository.
 */

const root = fileURLToPath(new URL("../", import.meta.url));
const staticDir = path.join(root, ".next", "static");

function walk(directory, extension, found = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, extension, found);
    else if (entry.name.endsWith(extension)) found.push(full);
  }
  return found;
}

const gzippedKb = (file) => gzipSync(readFileSync(file)).length / 1024;
const totalGzippedKb = (files) => files.reduce((sum, file) => sum + gzippedKb(file), 0);

test("the build output exists", () => {
  assert.ok(
    statSync(staticDir, { throwIfNoEntry: false })?.isDirectory(),
    "run `npm run build` before the budget tests",
  );
});

test("the deferred scene and its transitive chunks stay under 250 KiB gzip", () => {
  const report = JSON.parse(readFileSync(path.join(root, ".next/scene-budget.json"), "utf8"));
  assert.ok(report.roots > 0, "the scene entry is missing from the compilation graph");
  assert.equal(report.initial, false, "scene libraries must not enter the initial client bundle");
  assert.ok(report.files.length > 0);
  const size = totalGzippedKb(report.files.map((file) => path.join(root, ".next", file)));
  assert.ok(size <= 250, `scene dependency closure is ${size.toFixed(1)} KiB gzip (budget 250)`);
});

test("stylesheets stay under 16 KB gzipped in total", () => {
  const size = totalGzippedKb(walk(staticDir, ".css"));
  assert.ok(size < 16, `CSS is ${size.toFixed(1)} KB gzipped, budget is 16 KB`);
});

test("the portrait stays under 80 KB", () => {
  const portrait = path.join(root, "src", "assets", "portrait.avif");
  const size = statSync(portrait).size / 1024;
  assert.ok(size < 80, `portrait is ${size.toFixed(1)} KB, budget is 80 KB`);
});

test("non-scene client chunks stay under 80 KiB gzip", () => {
  const report = JSON.parse(readFileSync(path.join(root, ".next/scene-budget.json"), "utf8"));
  const sceneFiles = new Set(report.files.map((file) => path.resolve(root, ".next", file)));
  for (const file of walk(staticDir, ".js")) {
    if (sceneFiles.has(file)) continue;
    const size = gzippedKb(file);
    assert.ok(size < 80, `${path.basename(file)} is ${size.toFixed(1)} KB gzipped`);
  }
});

test("prerendered HTML stays under 60 KB gzipped per page", () => {
  const serverDir = path.join(root, ".next", "server", "app");
  const pages = walk(serverDir, ".html");
  assert.ok(pages.length > 0, "no prerendered HTML found");
  for (const page of pages) {
    const size = gzippedKb(page);
    assert.ok(size < 60, `${path.relative(serverDir, page)} is ${size.toFixed(1)} KB gzipped`);
  }
});

test("no source map is published to the client", () => {
  const maps = walk(staticDir, ".map");
  assert.equal(maps.length, 0, `client source maps published: ${maps.length}`);
});
