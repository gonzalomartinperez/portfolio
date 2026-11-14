import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function nodeMatchesNvmrc(actual: string, nvmrc: string): boolean {
  return actual === nvmrc.trim();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const expected = readFileSync(new URL("../.nvmrc", import.meta.url), "utf8").trim();
  const actual = process.versions.node;
  if (!nodeMatchesNvmrc(actual, expected)) {
    console.error(`Node.js ${actual} does not match .nvmrc (${expected}). Run nvm use first.`);
    process.exitCode = 1;
  } else {
    console.log(`Node.js ${actual} matches .nvmrc (${expected}).`);
  }
}
