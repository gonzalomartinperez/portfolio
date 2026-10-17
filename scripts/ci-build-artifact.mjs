import { randomBytes } from "node:crypto";
import { lstatSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const marker = "PORTFOLIO_CI_RUNTIME_MATERIAL_REMOVED";
const previewFields = ["previewModeSigningKey", "previewModeEncryptionKey"];

function requireCondition(condition) {
  if (!condition) throw new Error("CI build artifact has an unsupported runtime manifest.");
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function buildFiles(directory) {
  requireCondition(lstatSync(directory).isDirectory());
  const files = [];
  function visit(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (current === directory && entry.name === "cache") continue;
      const name = path.join(current, entry.name);
      if (entry.isDirectory()) visit(name);
      else {
        requireCondition(entry.isFile());
        files.push(name);
      }
    }
  }
  visit(directory);
  return files;
}

/** CI transfer only: hosting builds never call this command. No Server Actions may be present. */
export function transferBuild({ root = process.cwd(), mode } = {}) {
  requireCondition(mode === "prepare" || mode === "restore");
  const directory = path.join(root, ".next");
  const files = buildFiles(directory);
  const names = [
    "prerender-manifest.json",
    "server/preview-props.json",
    "server/server-reference-manifest.json",
  ];
  const manifests = names.map((name) =>
    JSON.parse(readFileSync(path.join(directory, name), "utf8")),
  );
  const [prerender, preview, actions] = manifests;
  requireCondition(
    isRecord(prerender.preview) &&
      isRecord(preview) &&
      isRecord(actions.node) &&
      isRecord(actions.edge),
  );
  requireCondition(
    Object.keys(actions.node).length === 0 && Object.keys(actions.edge).length === 0,
  );
  requireCondition(prerender.preview.previewModeId === preview.previewModeId);
  requireCondition(
    typeof preview.previewModeId === "string" && /^[a-f0-9]{32}$/.test(preview.previewModeId),
  );
  const original = [...previewFields.map((field) => preview[field]), actions.encryptionKey];
  for (const field of previewFields) requireCondition(prerender.preview[field] === preview[field]);
  if (mode === "prepare") {
    requireCondition(
      original
        .slice(0, 2)
        .every((value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value)),
    );
    requireCondition(typeof original[2] === "string" && /^[A-Za-z0-9+/]{43}=$/.test(original[2]));
  } else requireCondition(original.every((value, index) => value === `${marker}_${index}`));

  const replacements =
    mode === "prepare"
      ? original.map((_, index) => `${marker}_${index}`)
      : [
          randomBytes(32).toString("hex"),
          randomBytes(32).toString("hex"),
          randomBytes(32).toString("base64"),
        ];
  previewFields.forEach((field, index) => {
    preview[field] = replacements[index];
    prerender.preview[field] = replacements[index];
  });
  actions.encryptionKey = replacements[2];

  const serialized = manifests.map((manifest) => JSON.stringify(manifest));
  requireCondition(serialized.every((text) => original.every((value) => !text.includes(value))));

  // Fail before writing if upstream starts embedding private runtime material elsewhere.
  const manifestPaths = new Set(names.map((name) => path.join(directory, name)));
  for (const file of files) {
    if (manifestPaths.has(file)) continue;
    const bytes = readFileSync(file);
    requireCondition(original.every((value) => !bytes.includes(value)));
  }
  serialized.forEach((text, index) => {
    writeFileSync(path.join(directory, names[index]), text, {
      mode: 0o600,
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    requireCondition(process.argv.length === 3);
    transferBuild({ mode: process.argv[2] });
    console.log("CI runtime transfer manifest verified.");
  } catch {
    console.error("CI runtime transfer failed; details suppressed.");
    process.exitCode = 1;
  }
}
