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
const sizes = [16, 32, 48, 96, 192];

/** Smoothly resizes the approved PNG using sharp from Next.js's locked dependency tree. */
async function generate() {
  const source = await readFile(new URL("src/assets/avatar.png", root));
  const pngs = await Promise.all(
    sizes.map((size) =>
      sharp(source)
        .resize(size, size, { kernel: "lanczos3" })
        .png({ compressionLevel: 9 })
        .toBuffer(),
    ),
  );
  const faviconSizes = sizes.slice(0, 3);
  const faviconImages = pngs.slice(0, 3);
  let offset = 6 + faviconSizes.length * 16;
  const header = Buffer.alloc(offset);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(faviconSizes.length, 4);
  faviconImages.forEach((png, index) => {
    const entry = 6 + index * 16;
    header[entry] = faviconSizes[index];
    header[entry + 1] = faviconSizes[index];
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  const outputs = new Map(
    sizes.map((size, index) => [`public/avatar/face-${size}.png`, pngs[index]]),
  );
  outputs.set("src/app/icon.png", pngs[1]);
  outputs.set("src/app/favicon.ico", Buffer.concat([header, ...faviconImages]));
  outputs.set(
    "src/app/apple-icon.png",
    await sharp(source)
      .resize(180, 180, { kernel: "lanczos3" })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );
  return outputs;
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
