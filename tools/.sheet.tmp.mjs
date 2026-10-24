import sharp from "sharp";

const S =
  "/tmp/claude-1000/-home-gmperez-projects-github/14685eff-2566-4137-a79d-1b43c1f1b819/scratchpad/pq";
const [out, ...files] = process.argv.slice(2);
const W = 360,
  H = 300;
const cols = 4;
const rows = Math.ceil(files.length / cols);
const tiles = await Promise.all(
  files.map(async (f, i) => ({
    input: await sharp(S + "/thumb/" + f)
      .resize({ width: W, height: H, fit: "contain", background: "#333" })
      .toBuffer(),
    left: (i % cols) * W,
    top: Math.floor(i / cols) * H,
  })),
);
await sharp({ create: { width: cols * W, height: rows * H, channels: 3, background: "#111" } })
  .composite(tiles)
  .png()
  .toFile(S + "/" + out);
