import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as lucide from "lucide-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  technologyIllustrationNames,
  technologyIllustrationSprite,
} from "../src/components/technology-illustrations.ts";

export const spriteFile = new URL(`../public${technologyIllustrationSprite}`, import.meta.url);

// A build-time script, so loading the whole icon set to resolve names is intended.
const lucideIcons = new Map(Object.entries(lucide));
const componentName = (name) =>
  name.replace(/(?:^|-)([a-z0-9])/g, (_, character) => character.toUpperCase());

/**
 * Renders each illustration with lucide-react and keeps only its drawing. Stroke and fill
 * attributes stay on the referencing `<svg>` so the marks inherit `currentColor` from the page.
 */
export function renderTechnologyIllustrationSprite() {
  const symbols = technologyIllustrationNames.map((name) => {
    const icon = lucideIcons.get(componentName(name));
    assert.ok(icon, `lucide-react has no ${componentName(name)} icon for "${name}"`);
    const markup = renderToStaticMarkup(createElement(icon));
    const drawing = markup.match(/^<svg\b[^>]*>(.*)<\/svg>$/s)?.[1];
    assert.ok(drawing, `unexpected lucide markup for "${name}"`);
    return `<symbol id="${name}" viewBox="0 0 24 24">${drawing}</symbol>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join("\n")}\n</svg>\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  assert(
    args.length === 0 || (args.length === 1 && ["--check", "--write"].includes(args[0])),
    "Usage: node scripts/technology-illustrations.mjs [--check|--write]",
  );
  const sprite = renderTechnologyIllustrationSprite();
  if (args[0] === "--write") {
    await writeFile(spriteFile, sprite);
    process.stdout.write(`Generated public${technologyIllustrationSprite}\n`);
  } else {
    assert.equal(
      await readFile(spriteFile, "utf8"),
      sprite,
      "Technology illustration sprite differs. Run --write to regenerate.",
    );
    process.stdout.write(`Verified public${technologyIllustrationSprite}\n`);
  }
}
