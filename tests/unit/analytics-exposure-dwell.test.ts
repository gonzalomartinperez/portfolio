import assert from "node:assert/strict";
import test from "node:test";
import { createExposureDwell } from "../../src/features/analytics/application/exposure-dwell.ts";

function fixture() {
  let next = 0;
  let eligible = true;
  const tasks = new Map<number, { callback: () => void; delay: number }>();
  const emitted: string[] = [];
  const gate = createExposureDwell({
    schedule(callback, delay) {
      next += 1;
      tasks.set(next, { callback, delay });
      return next;
    },
    cancel(timer) {
      tasks.delete(timer);
    },
    isEligible: () => eligible,
    emit: (key) => emitted.push(key),
  });
  return {
    gate,
    tasks,
    emitted,
    hide() {
      eligible = false;
    },
    flush() {
      for (const [id, task] of [...tasks]) {
        tasks.delete(id);
        task.callback();
      }
    },
  };
}

test("exposure waits for 500 ms and remains deduplicated across effect restarts", () => {
  const f = fixture();
  f.gate.observe("reviewed-section", true);
  f.gate.observe("reviewed-section", true);
  assert.equal(f.tasks.size, 1);
  assert.equal([...f.tasks.values()][0].delay, 500);
  assert.deepEqual(f.emitted, []);
  f.flush();
  f.gate.pause();
  f.gate.observe("reviewed-section", true);
  assert.equal(f.tasks.size, 0);
  assert.deepEqual(f.emitted, ["reviewed-section"]);
  f.gate.reset();
  f.gate.observe("reviewed-section", true);
  f.flush();
  assert.deepEqual(f.emitted, ["reviewed-section", "reviewed-section"]);
});

test("leaving, hiding or disposing cancels qualification, including already queued callbacks", () => {
  for (const stop of ["leave", "pause", "reset"] as const) {
    const f = fixture();
    f.gate.observe("reviewed-section", true);
    const queued = [...f.tasks.values()][0].callback;
    if (stop === "leave") f.gate.observe("reviewed-section", false);
    else f.gate[stop]();
    queued();
    assert.equal(f.tasks.size, 0);
    assert.deepEqual(f.emitted, []);
  }
  const f = fixture();
  f.gate.observe("reviewed-section", true);
  f.hide();
  f.flush();
  assert.deepEqual(f.emitted, []);
});

test("a cancelled observation cannot qualify a later observation of the same section", () => {
  const f = fixture();
  f.gate.observe("reviewed-section", true);
  const stale = [...f.tasks.values()][0].callback;
  f.gate.observe("reviewed-section", false);
  f.gate.observe("reviewed-section", true);
  stale();
  assert.deepEqual(f.emitted, []);
  assert.equal(f.tasks.size, 1);
  f.flush();
  assert.deepEqual(f.emitted, ["reviewed-section"]);
});

test("qualification memory and pending work have an explicit per-visit bound", () => {
  const f = fixture();
  for (let id = 0; id < 1_000; id += 1) f.gate.observe(`reviewed-${id}`, true);
  assert.equal(f.tasks.size, 96);
  f.flush();
  assert.equal(f.emitted.length, 96);
  f.gate.observe("another-section", true);
  assert.equal(f.tasks.size, 0);
  f.gate.reset();
  f.gate.observe("another-section", true);
  assert.equal(f.tasks.size, 1);
  f.gate.pause();
});
