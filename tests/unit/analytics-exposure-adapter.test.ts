import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { listenForExposures } from "../../src/features/analytics/adapters/exposure.ts";
import { createExposureSession } from "../../src/features/analytics/application/exposure-session.ts";
import type { ExposureIntent } from "../../src/features/analytics/domain/interactions.ts";

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
    tagName: "SPAN",
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
    tagName: "DIV",
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

function dynamicFixture(t: TestContext) {
  type FakeElement = {
    nodeType: number;
    tagName: string;
    dataset: Record<string, string>;
    isConnected: boolean;
    children: FakeElement[];
    parent: FakeElement | null;
    readonly parentElement: FakeElement | null;
    private: boolean;
    closest(selector: string): FakeElement | null;
    contains(node: unknown): boolean;
    querySelector(): FakeElement | null;
    querySelectorAll(): FakeElement[];
    getBoundingClientRect(): Record<string, number>;
  };
  function element(dataset: Record<string, string> = {}): FakeElement {
    const node: FakeElement = {
      nodeType: 1,
      tagName: "DIV",
      dataset,
      isConnected: true,
      children: [],
      parent: null,
      get parentElement() {
        return this.parent;
      },
      private: false,
      closest(selector) {
        for (let at: FakeElement | null = this; at; at = at.parent) {
          if (selector === "[data-analytics-exposure]" && at.dataset.analyticsExposure) return at;
          if (selector !== "[data-analytics-exposure]" && at.private) return at;
        }
        return null;
      },
      contains(candidate) {
        return this === candidate || this.children.some((child) => child.contains(candidate));
      },
      querySelectorAll: () => [],
      querySelector() {
        for (const child of this.children) {
          if ("analyticsExposureTarget" in child.dataset) return child;
          const nested = child.querySelector();
          if (nested) return nested;
        }
        return null;
      },
      getBoundingClientRect: () => ({
        left: 10,
        top: 10,
        right: 11,
        bottom: 11,
        width: 1,
        height: 1,
      }),
    };
    return node;
  }
  const body = element();
  const region = element({ analyticsExposure: "about-story" });
  region.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
  });
  const sentinel = () => element({ analyticsExposureTarget: "" });
  let target = sentinel();
  function attach(parent: FakeElement, child: FakeElement) {
    parent.children.push(child);
    child.parent = parent;
    child.isConnected = true;
  }
  attach(region, target);
  const observers: FakeIntersection[] = [];
  class FakeIntersection {
    target?: Element;
    disconnected = false;
    readonly callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      observers.push(this);
    }
    observe(node: Element) {
      this.target = node;
    }
    disconnect() {
      this.disconnected = true;
    }
    emit() {
      this.callback(
        [
          {
            target: this.target,
            isIntersecting: true,
            intersectionRatio: 1,
          } as IntersectionObserverEntry,
        ],
        this as unknown as IntersectionObserver,
      );
    }
  }
  const mutations: FakeMutation[] = [];
  class FakeMutation {
    disconnected = false;
    readonly callback: MutationCallback;
    constructor(callback: MutationCallback) {
      this.callback = callback;
      mutations.push(this);
    }
    observe() {}
    disconnect() {
      this.disconnected = true;
    }
    emit(parent: FakeElement, addedNodes: FakeElement[] = [], removedNodes: FakeElement[] = []) {
      this.callback(
        [
          {
            type: "childList",
            target: parent,
            addedNodes,
            removedNodes,
          } as unknown as MutationRecord,
        ],
        this as unknown as MutationObserver,
      );
    }
  }
  const previous = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = FakeIntersection as unknown as typeof IntersectionObserver;
  t.after(() => {
    globalThis.IntersectionObserver = previous;
  });
  let now = 0,
    timer = 0,
    pathname = "/about";
  const tasks = new Map<number, { at: number; callback(): void }>();
  const events: ExposureIntent[] = [];
  const session = createExposureSession({
    schedule(callback, delay) {
      tasks.set(++timer, { at: now + delay, callback });
      return timer;
    },
    cancel(id) {
      tasks.delete(id);
    },
    record(intent) {
      events.push(intent);
    },
  });
  const document = {
    body,
    documentElement: body,
    visibilityState: "visible",
    querySelectorAll: () => body.children,
    addEventListener() {},
    removeEventListener() {},
    defaultView: {
      innerWidth: 1440,
      innerHeight: 1000,
      IntersectionObserver: FakeIntersection,
      MutationObserver: FakeMutation,
      getComputedStyle: () => ({ visibility: "visible" }),
      matchMedia: () => ({ addEventListener() {}, removeEventListener() {} }),
    },
  };
  let stop = () => {};
  function connect() {
    session.commit(pathname);
    stop = listenForExposures(document as unknown as Document, () => pathname, session);
  }
  connect();
  t.after(() => stop());
  return {
    events,
    observers,
    mutations,
    tasks,
    body,
    region,
    current: () => observers.at(-1),
    insert() {
      attach(body, region);
      mutations.at(-1)?.emit(body, [region]);
    },
    insertEmpty() {
      target.isConnected = false;
      region.children = [];
      attach(body, region);
      mutations.at(-1)?.emit(body, [region]);
    },
    addTarget() {
      target = sentinel();
      attach(region, target);
      mutations.at(-1)?.emit(region, [target]);
    },
    moveUnderCustom(part: "region" | "target", notify = true) {
      const wrapper = element();
      wrapper.tagName = "QA-PRIVATE";
      if (part === "region") {
        body.children = [];
        attach(body, wrapper);
        attach(wrapper, region);
        if (notify) mutations.at(-1)?.emit(wrapper, [region]);
      } else {
        region.children = [];
        attach(region, wrapper);
        attach(wrapper, target);
        if (notify) mutations.at(-1)?.emit(region, [wrapper]);
      }
    },
    replace() {
      const old = target;
      old.isConnected = false;
      old.parent = null;
      region.children = [];
      target = sentinel();
      attach(region, target);
      mutations.at(-1)?.emit(region, [target], [old]);
    },
    remove() {
      target.isConnected = false;
      region.children = [];
      mutations.at(-1)?.emit(region, [], [target]);
    },
    irrelevant() {
      const plain = element();
      attach(region, plain);
      mutations.at(-1)?.emit(region, [plain]);
    },
    privateMutation() {
      const privateNode = element();
      privateNode.private = true;
      Object.defineProperty(privateNode, "children", {
        get() {
          throw new Error("Private descendants must not be scanned");
        },
      });
      mutations.at(-1)?.emit(privateNode, [privateNode]);
    },
    advance(ms: number) {
      const end = now + ms;
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
    visit(next: string) {
      stop();
      pathname = next;
      connect();
    },
    dispose() {
      stop();
    },
  };
}

test("late reviewed regions start a fresh 500ms dwell without a route change", (t) => {
  const f = dynamicFixture(t);
  f.insert();
  assert.ok(f.current(), "Late region must be observed");
  f.current()?.emit();
  f.advance(499);
  assert.equal(f.events.length, 0);
  f.advance(1);
  assert.equal(f.events.length, 1);
});

test("target replacement cancels pending dwell and rejects queued old callbacks", (t) => {
  const f = dynamicFixture(t);
  f.insert();
  const old = f.current();
  assert.ok(old);
  old.emit();
  f.advance(499);
  f.replace();
  old.emit();
  f.advance(1);
  assert.equal(f.events.length, 0);
  assert.notEqual(f.current(), old);
  f.current()?.emit();
  f.advance(499);
  assert.equal(f.events.length, 0);
  f.advance(1);
  assert.equal(f.events.length, 1);
});

test("removed targets cannot qualify and cleanup ignores queued structural callbacks", (t) => {
  const f = dynamicFixture(t);
  f.insert();
  const old = f.current();
  assert.ok(old);
  old.emit();
  f.advance(499);
  f.remove();
  old.emit();
  f.advance(1);
  assert.equal(f.events.length, 0);
  assert.equal(f.tasks.size, 0);
  const mutation = f.mutations.at(-1);
  assert.ok(mutation);
  f.dispose();
  const count = f.observers.length;
  mutation.emit(f.body, [f.region]);
  old.emit();
  assert.equal(f.observers.length, count);
  assert.equal(f.tasks.size, 0);
  assert.equal(mutation.disconnected, true);
});

test("irrelevant and private mutations preserve the existing 499ms pending dwell", (t) => {
  const f = dynamicFixture(t);
  f.insert();
  const observer = f.current();
  assert.ok(observer);
  observer.emit();
  f.advance(499);
  f.irrelevant();
  f.privateMutation();
  assert.equal(f.current(), observer);
  f.advance(1);
  assert.equal(f.events.length, 1);
});

test("qualified replacement stays deduplicated until the next route visit", (t) => {
  const f = dynamicFixture(t);
  f.insert();
  assert.ok(f.current());
  f.current()?.emit();
  f.advance(500);
  assert.equal(f.events.length, 1);
  f.replace();
  f.current()?.emit();
  f.advance(500);
  assert.equal(f.events.length, 1);
  f.visit("/work");
  f.visit("/about");
  f.current()?.emit();
  f.advance(499);
  assert.equal(f.events.length, 1);
  f.advance(1);
  assert.equal(f.events.length, 2);
});

test("a late sentinel in an already mounted region is discovered without text observation", (t) => {
  const f = dynamicFixture(t);
  f.insertEmpty();
  assert.equal(f.current(), undefined);
  f.addTarget();
  assert.ok(f.current());
  f.current()?.emit();
  f.advance(499);
  assert.equal(f.events.length, 0);
  f.advance(1);
  assert.equal(f.events.length, 1);
});

for (const part of ["region", "target"] as const) {
  test(`moving a pending ${part} under a custom element cancels its dwell`, (t) => {
    const f = dynamicFixture(t);
    f.insert();
    const old = f.current();
    assert.ok(old);
    old.emit();
    f.advance(499);
    f.moveUnderCustom(part);
    old.emit();
    f.advance(1);
    assert.equal(f.events.length, 0);
    assert.equal(f.tasks.size, 0);
  });
}

test("an initial marker inside a custom element is not registered", (t) => {
  const f = dynamicFixture(t);
  f.moveUnderCustom("target");
  f.insert();
  assert.equal(f.current(), undefined);
  assert.equal(f.tasks.size, 0);
});

for (const part of ["region", "target"] as const) {
  test(`the deadline rejects a custom ${part} before its mutation batch is delivered`, (t) => {
    const f = dynamicFixture(t);
    f.insert();
    assert.ok(f.current());
    f.current()?.emit();
    f.advance(499);
    f.moveUnderCustom(part, false);
    f.advance(1);
    assert.equal(f.events.length, 0);
    assert.equal(f.tasks.size, 0);
  });
}
