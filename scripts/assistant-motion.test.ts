import assert from "node:assert/strict";
import test from "node:test";
import {
  getPageMotionPaused,
  holdPageMotion,
  setPageMotionPaused,
} from "../src/components/motion-state.ts";

test("foreground motion holds release independently and preserve the visitor's pause choice", () => {
  setPageMotionPaused(false);
  const first = holdPageMotion();
  const second = holdPageMotion();
  assert.equal(getPageMotionPaused(), true);
  first();
  assert.equal(getPageMotionPaused(), true);
  second();
  assert.equal(getPageMotionPaused(), false);
  setPageMotionPaused(true);
  const foreground = holdPageMotion();
  foreground();
  foreground();
  assert.equal(getPageMotionPaused(), true);
  setPageMotionPaused(false);
  assert.equal(getPageMotionPaused(), false);
});
