import assert from "node:assert/strict";
import test from "node:test";
import { isAssistantEnabled } from "../src/features/assistant/application/availability.ts";

test("assistant rollout defaults to disabled and requires explicit activation", () => {
  assert.equal(isAssistantEnabled(undefined), false);
  assert.equal(isAssistantEnabled("false"), false);
  assert.equal(isAssistantEnabled("true"), true);
  for (const value of ["", "1", "TRUE", " false", "yes"]) {
    assert.throws(() => isAssistantEnabled(value), /ASSISTANT_ENABLED must be true or false/);
  }
});
