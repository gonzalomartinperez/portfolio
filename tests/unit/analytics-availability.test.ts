import assert from "node:assert/strict";
import test from "node:test";
import { isAnalyticsEnabled } from "../../src/features/analytics/application/availability.ts";

test("product analytics requires its own explicit activation", () => {
  assert.equal(isAnalyticsEnabled(undefined), false);
  assert.equal(isAnalyticsEnabled("false"), false);
  assert.equal(isAnalyticsEnabled("true"), true);
  for (const value of ["", "1", "TRUE", " false", "yes"]) {
    assert.throws(() => isAnalyticsEnabled(value), /ANALYTICS_ENABLED must be true or false/);
  }
});
