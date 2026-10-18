import assert from "node:assert/strict";
import test from "node:test";
import { createExposureSession } from "../../src/features/analytics/application/exposure-session.ts";
import type { ExposureIntent } from "../../src/features/analytics/domain/interactions.ts";

const intent: ExposureIntent = {
  event_name: "section_exposure",
  section: "home",
  locale: "en",
  region_id: "site-header",
  layout_revision: "portfolio-v1",
  viewport: "desktop",
};

function fixture() {
  let next = 0;
  const tasks = new Map<number, () => void>();
  const events: ExposureIntent[] = [];
  const session = createExposureSession({
    schedule(callback) {
      tasks.set(++next, callback);
      return next;
    },
    cancel: (timer) => {
      tasks.delete(timer);
    },
    record: (event) => events.push(event),
  });
  const observe = (event = intent) => {
    const key = session.register(event, () => true);
    assert.ok(key);
    session.observe(key, true);
  };
  return {
    session,
    tasks,
    events,
    observe,
    flush() {
      for (const [id, callback] of [...tasks]) {
        tasks.delete(id);
        callback();
      }
    },
  };
}

test("route-visit dedup survives effect cleanup while a new committed visit can qualify", () => {
  const f = fixture();
  f.session.commit("/");
  f.observe();
  f.flush();
  f.session.pause();
  f.session.commit("/");
  f.observe();
  f.flush();
  assert.deepEqual(f.events, [intent]);
  f.session.commit("/work");
  f.observe({ ...intent, section: "work" });
  f.flush();
  assert.equal(f.events.length, 2);
  assert.equal(f.events[1].section, "work");
  f.session.commit("/");
  f.observe();
  f.flush();
  assert.equal(f.events.length, 3);
});

test("old route callbacks cannot qualify a replacement registration using the shared header ID", () => {
  const f = fixture();
  f.session.commit("/");
  f.observe();
  const stale = [...f.tasks.values()][0];
  f.session.commit("/work");
  f.observe({ ...intent, section: "work" });
  stale();
  assert.equal(f.events.length, 0);
  assert.equal(f.tasks.size, 1);
  f.flush();
  assert.deepEqual(
    f.events.map((event) => event.section),
    ["work"],
  );
});

test("cohorts stay separate without recounting an already qualified cohort in one visit", () => {
  const f = fixture();
  f.session.commit("/");
  f.observe();
  f.flush();
  f.session.pause();
  f.observe({ ...intent, viewport: "tablet" });
  f.flush();
  f.session.pause();
  f.observe();
  f.flush();
  assert.deepEqual(
    f.events.map((event) => event.viewport),
    ["desktop", "tablet"],
  );
});

test("invalid registrations and geometry that no longer qualifies never emit", () => {
  const f = fixture();
  assert.equal(
    f.session.register({ ...intent, region_id: "work-rampy" }, () => true),
    null,
  );
  assert.equal(
    f.session.register({ ...intent, cell_x: 1 } as ExposureIntent, () => true),
    null,
  );
  const key = f.session.register(intent, () => false);
  assert.ok(key);
  f.session.observe(key, true);
  f.flush();
  f.session.observe("unregistered-private-key", true);
  f.flush();
  assert.equal(f.events.length, 0);
  assert.equal(f.tasks.size, 0);
});
