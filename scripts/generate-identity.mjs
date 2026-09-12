import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const args = process.argv.slice(2);
assert(
  args.length === 0 || (args.length === 1 && ["--check", "--write"].includes(args[0])),
  "Usage: node scripts/generate-identity.mjs [--check|--write]",
);
const write = args[0] === "--write";
const sizes = [16, 32, 48];
const source = (size) => new URL(`public/avatar/face-${size}.svg`, root);

/** Uses sharp from Next.js's locked dependency tree; check mode never modifies assets. */
async function generate() {
  const vectors = await Promise.all(sizes.map((size) => readFile(source(size))));
  const pngs = await Promise.all(vectors.map((svg) => sharp(svg).png().toBuffer()));
  let offset = 6 + sizes.length * 16;
  const header = Buffer.alloc(offset);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  pngs.forEach((png, index) => {
    const entry = 6 + index * 16;
    header[entry] = sizes[index];
    header[entry + 1] = sizes[index];
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  const icon = vectors[1]
    .toString("utf8")
    .replace(">\n", ">\n<title>Gonzalo Martin Perez</title>\n");
  return new Map([
    ["src/app/icon.svg", Buffer.from(icon)],
    ["src/app/favicon.ico", Buffer.concat([header, ...pngs])],
    [
      "src/app/apple-icon.png",
      await sharp(vectors[2]).resize(180, 180, { kernel: "nearest" }).png().toBuffer(),
    ],
    [
      "public/avatar/face-192.png",
      await sharp(vectors[2]).resize(192, 192, { kernel: "nearest" }).png().toBuffer(),
    ],
  ]);
}

for (const [relative, bytes] of await generate()) {
  const target = new URL(relative, root);
  if (write) {
    await writeFile(target, bytes);
    process.stdout.write(`Generated ${relative}\n`);
  } else {
    const existing = await readFile(target);
    assert(
      existing.equals(bytes),
      `Identity asset differs: ${fileURLToPath(target)}. Run --write to regenerate.`,
    );
    process.stdout.write(`Verified ${relative}\n`);
  }
}
