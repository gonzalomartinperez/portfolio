import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../", import.meta.url);
const read = (file: string) => readFileSync(new URL(file, root), "utf8");
const version = read("VERSION").trim();

test("VERSION is a plain X.Y.Z that matches the package manifest", () => {
  assert.match(version, /^\d+\.\d+\.\d+$/);
  assert.equal(JSON.parse(read("package.json")).version, version);
  const lock = JSON.parse(read("package-lock.json"));
  assert.equal(lock.version, version);
  assert.equal(lock.packages[""].version, version);
});

test("CHANGELOG has an Unreleased section and a non-empty section for VERSION", () => {
  const changelog = read("CHANGELOG.md");
  assert.match(changelog, /^## \[Unreleased\]/m);
  const escaped = version.replaceAll(".", "\\.");
  const section = new RegExp(
    `^## \\[${escaped}\\] - \\d{4}-\\d{2}-\\d{2}\\n(.*?)(?=^## \\[|^\\[[^\\]]+\\]: |$(?![\\s\\S]))`,
    "ms",
  ).exec(changelog);
  assert.ok(section, `CHANGELOG.md has no dated section for ${version}`);
  assert.ok(section[1]?.trim(), `CHANGELOG.md section for ${version} is empty`);
});
