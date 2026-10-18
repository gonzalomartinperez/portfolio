import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const source = JSON.parse(readFileSync("contracts/assistant-api/source.json", "utf8"));
for (const [name, expected] of [
  ["openapi.json", source.openapi_sha256],
  ["sse.schema.json", source.sse_sha256],
  ["sse.examples.json", source.sse_examples_sha256],
  ["types.d.ts", source.types_sha256],
]) {
  const actual = createHash("sha256")
    .update(readFileSync(`contracts/assistant-api/${name}`))
    .digest("hex");
  if (actual !== expected) throw new Error(`${name} differs from API commit ${source.api_commit}`);
}
console.log(`Assistant contract matches API ${source.api_commit}`);
