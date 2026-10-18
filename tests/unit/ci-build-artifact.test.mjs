import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { transferBuild } from "../../tools/ci-build-artifact.mjs";

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "portfolio-ci-transfer-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const directory = path.join(root, ".next");
  mkdirSync(path.join(directory, "server"), { recursive: true });
  mkdirSync(path.join(directory, "static"));
  const preview = {
    previewModeId: "a".repeat(32),
    previewModeSigningKey: "b".repeat(64),
    previewModeEncryptionKey: "c".repeat(64),
  };
  const actions = { node: {}, edge: {}, encryptionKey: Buffer.alloc(32, 7).toString("base64") };
  const write = (name, value) => writeFileSync(path.join(directory, name), JSON.stringify(value));
  const read = (name) => JSON.parse(readFileSync(path.join(directory, name), "utf8"));
  write("prerender-manifest.json", { version: 4, routes: { "/": {} }, preview });
  write("server/preview-props.json", preview);
  write("server/server-reference-manifest.json", actions);
  return { root, directory, preview, actions, read, write };
}

test("CI transfer removes generated runtime material and restores runner-local values", (t) => {
  const f = fixture(t);
  transferBuild({ root: f.root, mode: "prepare" });
  const sanitized = f.read("server/preview-props.json");
  assert.equal(sanitized.previewModeId, f.preview.previewModeId);
  assert.equal(sanitized.previewModeSigningKey.startsWith("PORTFOLIO_CI_"), true);
  assert.deepEqual(f.read("prerender-manifest.json").routes, { "/": {} });
  transferBuild({ root: f.root, mode: "restore" });
  const restored = f.read("server/preview-props.json");
  assert.equal(/^[a-f0-9]{64}$/.test(restored.previewModeSigningKey), true);
  assert.equal(restored.previewModeSigningKey !== f.preview.previewModeSigningKey, true);
  assert.equal(restored.previewModeEncryptionKey !== f.preview.previewModeEncryptionKey, true);
  assert.equal(
    f.read("server/server-reference-manifest.json").encryptionKey !== f.actions.encryptionKey,
    true,
  );
  assert.equal(
    restored.previewModeSigningKey ===
      f.read("prerender-manifest.json").preview.previewModeSigningKey,
    true,
  );
  transferBuild({ root: f.root, mode: "prepare" });
  transferBuild({ root: f.root, mode: "restore" });
  assert.equal(
    f.read("server/preview-props.json").previewModeSigningKey !== restored.previewModeSigningKey,
    true,
  );
});

test("unexpected embedded runtime material fails before manifest mutation", (t) => {
  const f = fixture(t);
  writeFileSync(path.join(f.directory, "server", "unexpected.js"), f.preview.previewModeSigningKey);
  assert.throws(
    () => transferBuild({ root: f.root, mode: "prepare" }),
    /unsupported runtime manifest/,
  );
  assert.equal(
    f.read("server/preview-props.json").previewModeSigningKey === f.preview.previewModeSigningKey,
    true,
  );
});

test("Server Actions require an explicit transfer redesign instead of silent rekeying", (t) => {
  const f = fixture(t);
  f.write("server/server-reference-manifest.json", { ...f.actions, node: { syntheticAction: {} } });
  assert.throws(
    () => transferBuild({ root: f.root, mode: "prepare" }),
    /unsupported runtime manifest/,
  );
});

test("duplicate runtime material inside a known manifest is rejected before writing", (t) => {
  const f = fixture(t);
  f.write("prerender-manifest.json", {
    preview: f.preview,
    extra: f.preview.previewModeSigningKey,
  });
  assert.throws(
    () => transferBuild({ root: f.root, mode: "prepare" }),
    /unsupported runtime manifest/,
  );
  assert.equal(
    f.read("server/preview-props.json").previewModeSigningKey === f.preview.previewModeSigningKey,
    true,
  );
});

test("mismatched preview data and unsanitized restore fail closed", (t) => {
  const f = fixture(t);
  assert.throws(
    () => transferBuild({ root: f.root, mode: "restore" }),
    /unsupported runtime manifest/,
  );
  f.write("server/preview-props.json", { ...f.preview, previewModeEncryptionKey: "d".repeat(64) });
  assert.throws(
    () => transferBuild({ root: f.root, mode: "prepare" }),
    /unsupported runtime manifest/,
  );
});

test("build symlinks are rejected without reading their targets", (t) => {
  const f = fixture(t);
  symlinkSync(
    path.join(f.root, "unread-private-material"),
    path.join(f.directory, "server", "unexpected-link"),
  );
  assert.throws(
    () => transferBuild({ root: f.root, mode: "prepare" }),
    /unsupported runtime manifest/,
  );
});
