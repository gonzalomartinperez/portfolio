import assert from "node:assert/strict";
import test from "node:test";
import { createMeasurementBudget } from "../src/features/analytics/application/measurement-budget.ts";

test("optional measurements are capped in a sliding minute with an exclusive expiry edge", () => {
  const budget = createMeasurementBudget();
  for (let count = 0; count < 40; count += 1) assert.equal(budget.take(0), true);
  assert.equal(budget.take(0), false);
  assert.equal(budget.take(59_999), false);
  assert.equal(budget.take(60_000), true);
});

test("crossing a minute boundary does not admit two bursts inside one sliding minute", () => {
  const budget = createMeasurementBudget();
  for (let count = 0; count < 40; count += 1) assert.equal(budget.take(59_999), true);
  assert.equal(budget.take(60_000), false);
  assert.equal(budget.take(119_998), false);
  assert.equal(budget.take(119_999), true);
});

test("the document budget survives later windows and cannot reset through malformed time", () => {
  const budget = createMeasurementBudget();
  for (const now of [0, 60_000, 120_000]) {
    for (let count = 0; count < 40; count += 1) assert.equal(budget.take(now), true);
  }
  for (const now of [180_000, Number.NaN, Number.POSITIVE_INFINITY, -1, 0])
    assert.equal(budget.take(now), false);
});

test("nonfinite and backwards clocks never mint a measurement allowance", () => {
  const budget = createMeasurementBudget();
  for (const now of [Number.NaN, Number.POSITIVE_INFINITY, -1])
    assert.equal(budget.take(now), false);
  assert.equal(budget.take(20), true);
  assert.equal(budget.take(19), false);
  assert.equal(budget.take(20), true);
});
