import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseDocument } from "yaml";
import { nodeMatchesNvmrc } from "../../tools/setup.ts";

const read = (file: string) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
const manifest = JSON.parse(read("package.json"));

test("devcontainer uses the CI browser image", () => {
  const document = parseDocument(read(".github/workflows/ci.yml"));
  assert.deepEqual(document.errors, []);
  const workflow = document.toJS();
  const from = read(".devcontainer/Dockerfile").match(/^FROM (\S+)$/m);
  assert.ok(from, "Dockerfile must declare its base image");
  assert.equal(from[1], workflow.jobs.browser.container.image);
});

test("devcontainer Node tarball versions match .nvmrc for both architectures", () => {
  const urls = [
    ...read(".devcontainer/Dockerfile").matchAll(
      /https:\/\/nodejs\.org\/dist\/v([\d.]+)\/node-v([\d.]+)-linux-(x64|arm64)\.tar\.gz/g,
    ),
  ];
  assert.deepEqual(urls.map((match) => match[3]).sort(), ["arm64", "x64"]);
  for (const [, directoryVersion, archiveVersion] of urls) {
    assert.equal(directoryVersion, read(".nvmrc").trim());
    assert.equal(archiveVersion, directoryVersion);
  }
});

test("devcontainer runs the registered setup command on creation", () => {
  const devcontainer = JSON.parse(read(".devcontainer/devcontainer.json"));
  assert.match(devcontainer.postCreateCommand, /&& npm run setup$/);
  assert.equal(devcontainer.remoteUser, "pwuser");
  // node_modules lives in a named volume so npm ci never replaces a host install.
  assert.ok(
    devcontainer.mounts.some((mount: string) =>
      /target=\/workspaces\/portfolio\/node_modules,type=volume/.test(mount),
    ),
  );
  assert.equal(
    manifest.scripts.setup,
    "node tools/setup.ts && npm ci --no-audit --no-fund && npm run check",
  );
});

test("Node must exactly match the trimmed .nvmrc version", () => {
  assert.equal(nodeMatchesNvmrc("24.22.0", "24.22.0"), true);
  assert.equal(nodeMatchesNvmrc("24.22.0", " \t24.22.0\r\n"), true);
  assert.equal(nodeMatchesNvmrc("24.21.0", "24.22.0"), false);
  assert.equal(nodeMatchesNvmrc("v24.22.0", "24.22.0"), false);
  assert.equal(nodeMatchesNvmrc("24.22.0", ""), false);
});

for (const file of ["AGENTS.md", "README.md"]) {
  test(`${file} npm run commands name registered scripts`, () => {
    const commands = [...read(file).matchAll(/`npm run ([\w:.-]+)/g)];
    assert.ok(commands.length > 0, `${file} must document npm scripts`);
    for (const [, script] of commands) {
      assert.ok(Object.hasOwn(manifest.scripts, script), `${file}: unknown script ${script}`);
    }
  });
}
