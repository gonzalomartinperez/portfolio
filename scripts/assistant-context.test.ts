import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { portfolioPath } from "../src/features/assistant/domain/visitor-context.ts";
import { list, record, text } from "./assistant-fixture-json.ts";

test("visitor context exposes only public routes, excluding unknown or parameterized paths", () => {
  assert.equal(portfolioPath("/work/filomena"), "/work/filomena");
  assert.equal(portfolioPath("/es/cv"), "/es/cv");
  for (const path of [
    "/private-document",
    "/work?token=private",
    "/work#rampy",
    "https://example.test/work",
  ])
    assert.equal(portfolioPath(path), undefined);
  assert.equal(portfolioPath("/es/private-document"), undefined);
});

test("every committed API context route is available at the frontend boundary", () => {
  const contract = record(JSON.parse(readFileSync("src/contracts/openapi.json", "utf8")));
  const schemas = record(record(contract.components).schemas);
  const properties = record(record(schemas.MessageContext).properties);
  for (const field of ["opened_path", "current_path"]) {
    const paths = list(record(properties[field]).enum).map(text);
    assert.equal(paths.length, 18);
    for (const path of paths) assert.equal(portfolioPath(path), path);
  }
});
