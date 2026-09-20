import assert from "node:assert/strict";
import test from "node:test";
import { layoutCloud } from "../src/components/hero/cloud-layout.ts";

for (const [width, height] of [
  [320, 650],
  [393, 852],
  [430, 932],
  [768, 650],
  [1440, 1000],
]) {
  for (const count of [35, 65]) {
    test(`organic cloud fits ${count} marks at ${width}x${height}`, () => {
      const bounds = {
        width,
        height,
        count,
        top: 78,
        bottom: 70,
        markWidth: width < 768 ? 40 : 56,
        markHeight: width < 768 ? 40 : 56,
        copyWidth: width < 768 ? 178 : 280,
        copyHeight: width < 768 ? 220 : 160,
      };
      const result = layoutCloud(bounds);
      assert.deepEqual(result, layoutCloud(bounds));
      assert.equal(result.positions.length, count);
      assert.ok(result.scale >= 0.3, `unreadable scale ${result.scale}`);
      const halfWidth = (bounds.markWidth * result.scale) / 2;
      const halfHeight = (bounds.markHeight * result.scale) / 2;
      for (const [index, { x, y }] of result.positions.entries()) {
        assert.ok(Math.abs(x) + halfWidth <= width / 2 - 12);
        assert.ok(y - halfHeight >= -height / 2 + bounds.top + 8);
        assert.ok(y + halfHeight <= height / 2 - bounds.bottom - 8);
        assert.ok(
          Math.abs(x) >= bounds.copyWidth / 2 + halfWidth + 12 ||
            Math.abs(y) >= bounds.copyHeight / 2 + halfHeight + 12,
          `mark ${index} overlaps centered copy`,
        );
        for (const other of result.positions.slice(index + 1))
          assert.ok(
            Math.abs(x - other.x) >= 2 * halfWidth + 6 ||
              Math.abs(y - other.y) >= 2 * halfHeight + 6,
          );
      }
      assert.ok(
        new Set(result.positions.map(({ x }) => x)).size > count * 0.8,
        "uniform grid columns",
      );
      assert.ok(
        new Set(result.positions.map(({ y }) => y)).size > count * 0.8,
        "uniform grid rows",
      );
    });
  }
}

test("unobstructed marks retain their original golden-angle positions", () => {
  const bounds = {
    width: 1440,
    height: 1000,
    top: 78,
    bottom: 70,
    count: 7,
    markWidth: 20,
    markHeight: 20,
    copyWidth: 0,
    copyHeight: 0,
  };
  const { scale, positions } = layoutCloud(bounds);
  assert.equal(scale, 1);
  const radiusX = (bounds.width - bounds.markWidth) / 2 - 12;
  const minY = -bounds.height / 2 + bounds.top + bounds.markHeight / 2 + 8;
  const maxY = bounds.height / 2 - bounds.bottom - bounds.markHeight / 2 - 8;
  for (const [index, position] of positions.entries()) {
    const angle = index * 2.399963;
    const radius = 0.5 + 0.48 * Math.sqrt((index + 1) / bounds.count);
    assert.equal(position.x, Math.cos(angle) * radiusX * radius);
    assert.equal(position.y, (minY + maxY) / 2 + Math.sin(angle) * ((maxY - minY) / 2) * radius);
  }
});

test("empty and impossible cloud geometry do not interrupt the page", () => {
  const bounds = {
    width: 100,
    height: 100,
    count: 35,
    top: 60,
    bottom: 60,
    markWidth: 40,
    markHeight: 40,
    copyWidth: 100,
    copyHeight: 100,
  };
  assert.equal(layoutCloud(bounds).scale, 0);
  assert.deepEqual(layoutCloud({ ...bounds, count: 0 }), { scale: 1, positions: [] });
});
