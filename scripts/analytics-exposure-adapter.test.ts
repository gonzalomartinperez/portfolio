import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { listenForExposures } from "../src/features/analytics/adapters/exposure.ts";
import { createExposureSession } from "../src/features/analytics/application/exposure-session.ts";
import type { ExposureIntent } from "../src/features/analytics/domain/interactions.ts";

function fixture(t: TestContext) {
  let now = 0;
  let timer = 0;
  let pathname = "/";
  const tasks = new Map<number, { at: number; callback(): void }>();
  const events: ExposureIntent[] = [];
  const observers: FakeObserver[] = [];
  class FakeObserver {
    readonly thresholds: number | number[] | undefined;
    readonly callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.callback = callback;
      this.thresholds = options?.threshold;
      observers.push(this);
    }
    observe() {}
    disconnect() {}
    emit(ratio = 1) {
      this.callback(
        [
          {
            target,
            isIntersecting: ratio > 0,
            intersectionRatio: ratio,
          } as unknown as IntersectionObserverEntry,
        ],
        this as unknown as IntersectionObserver,
      );
    }
  }
  const original = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
  t.after(() => {
    globalThis.IntersectionObserver = original;
  });
  const target = {
    isConnected: true,
    closest: () => null,
    getBoundingClientRect: () => ({
      left: 10,
      top: 10,
      right: 110,
      bottom: 30,
      width: 100,
      height: 20,
    }),
  } as unknown as HTMLElement;
  const region = {
    dataset: { analyticsExposure: "site-header" },
    isConnected: true,
    closest: () => null,
    contains: (element: unknown) => element === target,
    querySelector: () => target,
  };
  const visibility = new Set<() => void>();
  const media = new Set<() => void>();
  const view = {
    innerWidth: 1440,
    innerHeight: 1000,
    IntersectionObserver: FakeObserver,
    getComputedStyle: () => ({ visibility: "visible" }),
    matchMedia: () => ({
      addEventListener: (_type: string, listener: () => void) => media.add(listener),
      removeEventListener: (_type: string, listener: () => void) => media.delete(listener),
    }),
  };
  const document = {
    defaultView: view,
    visibilityState: "visible",
    querySelectorAll: () => [region],
    addEventListener: (_type: string, listener: () => void) => visibility.add(listener),
    removeEventListener: (_type: string, listener: () => void) => visibility.delete(listener),
  };
  const session = createExposureSession({
    schedule(callback, delay) {
      tasks.set(++timer, { at: now + delay, callback });
      return timer;
    },
    cancel: (id) => {
      tasks.delete(id);
    },
    record: (event) => events.push(event),
  });
  let stop = () => {};
  const connect = () => {
    session.commit(pathname);
    stop = listenForExposures(document as unknown as Document, () => pathname, session);
  };
  connect();
  t.after(() => stop());
  return {
    events,
    observers,
    view,
    document,
    media,
    visibility,
    tasks,
    current: () => observers[observers.length - 1],
    advance(milliseconds: number) {
      const end = now + milliseconds;
      while (true) {
        const next = [...tasks]
          .filter(([, task]) => task.at <= end)
          .sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at;
        tasks.delete(next[0]);
        next[1].callback();
      }
      now = end;
    },
    route(next: string) {
      stop();
      pathname = next;
      connect();
    },
    visible(value: boolean) {
      document.visibilityState = value ? "visible" : "hidden";
      for (const listener of visibility) listener();
    },
    dispose: () => stop(),
  };
}

test("a queued batch from the old route cannot shorten the new header's dwell", (t) => {
  const f = fixture(t);
  const old = f.current();
  assert.deepEqual(old.thresholds, [0, 0.5, 1]);
  old.emit();
  f.advance(100);
  f.route("/work");
  old.emit();
  f.advance(400);
  f.current().emit();
  f.advance(100);
  assert.equal(f.events.length, 0);
  f.advance(400);
  assert.deepEqual(
    f.events.map((event) => event.section),
    ["work"],
  );
});

test("hiding cancels pending exposure and reentry needs a fresh continuous dwell", (t) => {
  const f = fixture(t);
  f.current().emit(0.49);
  f.advance(1000);
  assert.equal(f.events.length, 0);
  const old = f.current();
  old.emit(0.5);
  f.advance(400);
  f.visible(false);
  old.emit();
  f.advance(1000);
  assert.equal(f.events.length, 0);
  f.visible(true);
  f.current().emit();
  f.advance(499);
  assert.equal(f.events.length, 0);
  f.advance(1);
  assert.equal(f.events.length, 1);
});

test("height-only resizing is checked again at the deadline without a cohort change", (t) => {
  const f = fixture(t);
  f.current().emit();
  f.advance(400);
  f.view.innerHeight = 15;
  f.advance(100);
  assert.equal(f.events.length, 0);
  f.view.innerHeight = 1000;
  f.current().emit();
  f.advance(500);
  assert.equal(f.events.length, 1);
});

test("cohort changes and cleanup cancel pending clocks and remove listeners", (t) => {
  const f = fixture(t);
  const old = f.current();
  old.emit();
  f.advance(400);
  f.view.innerWidth = 831;
  for (const listener of f.media) listener();
  old.emit();
  f.current().emit();
  f.advance(500);
  assert.deepEqual(
    f.events.map((event) => event.viewport),
    ["mobile"],
  );
  f.dispose();
  assert.equal(f.tasks.size, 0);
  assert.equal(f.media.size, 0);
  assert.equal(f.visibility.size, 0);
});
