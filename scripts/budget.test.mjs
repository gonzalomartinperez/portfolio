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

test("the deferred hero and solar scenes share a 250 KiB gzip dependency budget", () => {
  const report = JSON.parse(readFileSync(path.join(root, ".next/scene-budget.json"), "utf8"));
  assert.ok(report.roots > 0, "the scene entry is missing from the compilation graph");
  assert.equal(report.initial, false, "scene libraries must not enter the initial client bundle");
  assert.ok(report.files.length > 0);
  assert.ok(report.heroEntryFiles.length > 0, "the hero renderer entry is missing");
  assert.ok(report.solarEntryFiles.length > 0, "the solar renderer entry is missing");
  const size = totalGzippedKb(report.files.map((file) => path.join(root, ".next", file)));
  assert.ok(size <= 250, `scene dependency closure is ${size.toFixed(1)} KiB gzip (budget 250)`);
});

test("local solar texture maps stay under 8 MiB and match their reviewed manifest", async () => {
  const { createHash } = await import("node:crypto");
  const directory = path.join(root, "public", "images", "solar-system");
  const manifest = JSON.parse(readFileSync(path.join(directory, "manifest.json"), "utf8"));
  assert.equal(manifest.assets.length, 16);
  let bytes = 0;
  for (const asset of manifest.assets) {
    assert.match(asset.file, /^[a-z-]+\.webp$/);
    const content = readFileSync(path.join(directory, asset.file));
    bytes += content.length;
    assert.equal(content.length, asset.bytes, asset.file);
    assert.equal(createHash("sha256").update(content).digest("hex"), asset.sha256, asset.file);
  }
  assert.equal(bytes, manifest.totalBytes);
  assert.ok(bytes < 8 * 1024 * 1024, `solar texture transfer is ${(bytes / 1024).toFixed(1)} KiB`);
});

test("existing portfolio styles retain their 24 KiB gzip budget", () => {
  const assistant = JSON.parse(
    readFileSync(path.join(root, ".next/assistant-budget.json"), "utf8"),
  );
  assert.ok(assistant.roots > 0, "assistant entry must be present in the compilation graph");
  assert.equal(assistant.initial, false, "assistant rendering libraries must be deferred");
  const deferred = new Set(assistant.css.map((file) => path.join(root, ".next", file)));
  const files = walk(staticDir, ".css");
  assert.ok(deferred.size > 0, "the lazy feature must have separately measurable CSS");
  const size = totalGzippedKb(files.filter((file) => !deferred.has(file)));
  assert.ok(size <= 24, `Portfolio CSS is ${size.toFixed(1)} KiB gzip, budget is 24 KiB`);
});

test("new deferred assistant styles have an explicit 4 KiB gzip allowance", () => {
  const assistant = JSON.parse(
    readFileSync(path.join(root, ".next/assistant-budget.json"), "utf8"),
  );
  const size = totalGzippedKb(assistant.css.map((file) => path.join(root, ".next", file)));
  assert.ok(size <= 4, `Deferred assistant CSS is ${size.toFixed(1)} KiB gzip, budget is 4 KiB`);
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

test("prerendered HTML stays under 70 KB gzipped per page", () => {
  const serverDir = path.join(root, ".next", "server", "app");
  const pages = walk(serverDir, ".html");
  assert.ok(pages.length > 0, "no prerendered HTML found");
  for (const page of pages) {
    const size = gzippedKb(page);
    assert.ok(size < 70, `${path.relative(serverDir, page)} is ${size.toFixed(1)} KB gzipped`);
  }
});

test("no source map is published to the client", () => {
  const maps = walk(staticDir, ".map");
  assert.equal(maps.length, 0, `client source maps published: ${maps.length}`);
});
