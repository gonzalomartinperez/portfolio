/**
 * Captures the README gallery from a running production build.
 *
 * Usage: `npm run build && npm run start`, then in another shell
 * `node tools/capture-gallery.mjs`. GALLERY_ORIGIN selects the server (default
 * http://127.0.0.1:3000) and GALLERY_ONLY a comma-separated subset of shot names.
 *
 * Shots render at twice the CSS resolution and are encoded as WebP by Chromium itself, so no
 * image tooling is required. A hardware GPU is needed for the published quality; under a
 * software rasterizer the solar scene deliberately uses its lighter configuration.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, devices } from "@playwright/test";

const origin = process.env.GALLERY_ORIGIN ?? "http://127.0.0.1:3000";
const only = process.env.GALLERY_ONLY?.split(",");
const output = fileURLToPath(new URL("../docs/gallery/", import.meta.url));
const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };
const mobile = devices["Pixel 7"];
const encodedWidth = { desktop: 1920, mobile: 780 };
const quality = 0.86;
const hero = (progress) => `?sceneProgress=${progress}&sceneTime=0`;

/** @typedef {{ name: string, device: "desktop" | "mobile", theme: "dark" | "light", route: string, reveal?: string, waitFor?: string, click?: string, explore?: string | null }} Shot */
/** @type {Shot[]} */
const shots = [
  { name: "home-hero-dark", device: "desktop", theme: "dark", route: `/${hero(0)}` },
  { name: "home-hero-light", device: "desktop", theme: "light", route: `/${hero(0)}` },
  { name: "home-hero-es-light", device: "desktop", theme: "light", route: `/es${hero(0)}` },
  { name: "home-flythrough-dark", device: "desktop", theme: "dark", route: `/${hero(0.42)}` },
  { name: "home-toolkit-dark", device: "desktop", theme: "dark", route: `/${hero(1)}` },
  {
    name: "home-featured-project-dark",
    device: "desktop",
    theme: "dark",
    route: "/",
    reveal: "[data-featured-project]",
  },
  {
    name: "work-architecture-dark",
    device: "desktop",
    theme: "dark",
    route: "/work",
    reveal: "#rampy figure",
    waitFor: ".react-flow__node",
    click: "#rampy button[aria-label^='View details:']",
  },
  {
    name: "filomena-architecture-dark",
    device: "desktop",
    theme: "dark",
    route: "/work/filomena",
    reveal: "main h2 >> nth=5",
    waitFor: ".react-flow__node",
  },
  {
    name: "filomena-gallery-light",
    device: "desktop",
    theme: "light",
    route: "/work/filomena",
    reveal: "main h2 >> nth=6",
  },
  { name: "about-light", device: "desktop", theme: "light", route: "/about" },
  {
    name: "stack-light",
    device: "desktop",
    theme: "light",
    route: "/stack",
    reveal: "#technology-results",
  },
  {
    name: "education-dark",
    device: "desktop",
    theme: "dark",
    route: "/education",
    reveal: "#curriculum",
    click: "main summary:has-text('Year 1')",
  },
  { name: "contact-dark", device: "desktop", theme: "dark", route: "/contact" },
  { name: "explorer-system", device: "desktop", theme: "dark", route: "/contact", explore: null },
  {
    name: "explorer-saturn",
    device: "desktop",
    theme: "dark",
    route: "/contact",
    explore: "saturn",
  },
  { name: "explorer-earth", device: "desktop", theme: "dark", route: "/contact", explore: "earth" },
  { name: "mobile-home-dark", device: "mobile", theme: "dark", route: `/${hero(0)}` },
  { name: "mobile-about-light", device: "mobile", theme: "light", route: "/about" },
  {
    name: "mobile-work-dark",
    device: "mobile",
    theme: "dark",
    route: "/work",
    reveal: "#rampy figure",
    waitFor: ".react-flow__node",
  },
  {
    name: "mobile-explorer-jupiter",
    device: "mobile",
    theme: "dark",
    route: "/contact",
    explore: "jupiter",
  },
];

const browser = await chromium.launch({
  args: ["--use-angle=gl", "--ignore-gpu-blocklist", "--enable-gpu"],
});
const encoder = await browser.newPage();

/** Downscales with high-quality smoothing and returns WebP bytes. */
async function encodeWebp(png, width) {
  const base64 = await encoder.evaluate(
    async ({ source, width, quality }) => {
      const response = await fetch(`data:image/png;base64,${source}`);
      const bitmap = await createImageBitmap(await response.blob());
      const height = Math.round((bitmap.height * width) / bitmap.width);
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext("2d");
      context.imageSmoothingQuality = "high";
      context.drawImage(bitmap, 0, 0, width, height);
      const blob = await canvas.convertToBlob({ type: "image/webp", quality });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      for (let index = 0; index < bytes.length; index += 0x8000)
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
      return btoa(binary);
    },
    { source: png.toString("base64"), width, quality },
  );
  return Buffer.from(base64, "base64");
}

for (const shot of shots) {
  if (only && !only.includes(shot.name)) continue;
  const context = await browser.newContext(shot.device === "mobile" ? mobile : desktop);
  await context.addInitScript((theme) => localStorage.setItem("theme", theme), shot.theme);
  const page = await context.newPage();
  await page.goto(origin + shot.route);
  await page.locator("[data-solar-system][data-renderer=webgl]").waitFor({ timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3500);
  if (shot.reveal) {
    await page
      .locator(shot.reveal)
      .first()
      .evaluate((element) =>
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY - 96,
          behavior: "instant",
        }),
      );
    // Let the camera parallax and reading veil settle.
    await page.waitForTimeout(2600);
  }
  if (shot.waitFor) await page.locator(shot.waitFor).first().waitFor({ timeout: 30_000 });
  if (shot.click) {
    await page.locator(shot.click).first().click();
    await page.waitForTimeout(1500);
  }
  if (shot.explore !== undefined) {
    await page.locator("[data-solar-explore]").scrollIntoViewIfNeeded();
    await page.locator("[data-solar-explore]").click();
    await page.waitForTimeout(5000);
    if (shot.explore) {
      await page.getByRole("dialog").getByRole("combobox").selectOption(shot.explore);
      // The camera flies to the selected body before the capture.
      await page.waitForTimeout(7000);
    }
  }
  const webp = await encodeWebp(await page.screenshot(), encodedWidth[shot.device]);
  writeFileSync(path.join(output, `${shot.name}.webp`), webp);
  console.log(`${shot.name}.webp ${(webp.length / 1024).toFixed(0)} KiB`);
  await context.close();
}
await browser.close();
