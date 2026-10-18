import assert from "node:assert/strict";
import test from "node:test";
import { clickCell } from "../../src/features/analytics/domain/click-grid.ts";

test("coarse public cells are invariant under translation and proportional layout changes", () => {
  for (const scale of [0.5, 1, 7]) {
    for (let x = 0; x < 8; x += 1) {
      for (let y = 0; y < 8; y += 1) {
        const bounds = { left: -40, top: 120, width: 320 * scale, height: 640 * scale };
        const point = {
          x: bounds.left + ((x + 0.5) / 8) * bounds.width,
          y: bounds.top + ((y + 0.5) / 8) * bounds.height,
        };
        assert.deepEqual(clickCell(point, bounds), { x, y });
      }
    }
  }
});

test("outside points and invalid public geometry cannot create edge-cell events", () => {
  const bounds = { left: 10, top: 20, width: 80, height: 160 };
  for (const point of [
    { x: 9, y: 20 },
    { x: 10, y: 19 },
    { x: 90, y: 20 },
    { x: 10, y: 180 },
    { x: Number.NaN, y: 20 },
    { x: 10, y: Number.POSITIVE_INFINITY },
  ])
    assert.equal(clickCell(point, bounds), null);
  for (const field of ["left", "top", "width", "height"] as const) {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])
      assert.equal(clickCell({ x: 10, y: 20 }, { ...bounds, [field]: value }), null);
  }
  for (const size of [0, -1]) {
    assert.equal(clickCell({ x: 10, y: 20 }, { ...bounds, width: size }), null);
    assert.equal(clickCell({ x: 10, y: 20 }, { ...bounds, height: size }), null);
  }
  assert.deepEqual(clickCell({ x: 10, y: 20 }, bounds), { x: 0, y: 0 });
  assert.deepEqual(clickCell({ x: 89.999, y: 179.999 }, bounds), { x: 7, y: 7 });
});

test("finite inputs whose subtraction overflows never leave the coarse domain", () => {
  assert.equal(
    clickCell(
      { x: Number.MAX_VALUE, y: 1 },
      { left: -Number.MAX_VALUE, top: 0, width: 1, height: 2 },
    ),
    null,
  );
});
