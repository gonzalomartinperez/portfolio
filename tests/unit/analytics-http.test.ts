import assert from "node:assert/strict";
import test from "node:test";
import {
  analyticsEndpoint,
  createAnalyticsTransport,
} from "../../src/features/analytics/adapters/http.ts";

const endpoint = "https://analytics.example.invalid/api/v1/analytics/events";
const id = "12345678-1234-4234-8234-123456789abc";
const intent = { event_name: "page_view", section: "home", locale: "en" } as const;
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
const options = (fetch: typeof globalThis.fetch) => ({
  fetch,
  id: () => id,
  signal: () => AbortSignal.timeout(5_000),
});

test("enabled configuration requires an HTTPS ingest URL without credentials or free URL data", () => {
  assert.equal(analyticsEndpoint(endpoint), endpoint);
  for (const value of [
    undefined,
    "",
    "not-a-url",
    "http://example.invalid/api/v1/analytics/events",
    "https://user:pass@example.invalid/api/v1/analytics/events",
    `${endpoint}?token=synthetic`,
    `${endpoint}#fragment`,
    "https://example.invalid/other",
  ]) {
    assert.throws(() => analyticsEndpoint(value));
  }
});

test("one bounded request omits credentials, referrer and caches and never reads response content", async () => {
  const requests: { url: unknown; init?: RequestInit }[] = [];
  const transport = createAnalyticsTransport(
    endpoint,
    options(async (url, init) => {
      requests.push({ url, init });
      return new Response(null, { status: 204 });
    }),
  );
  transport.record(intent);
  assert.equal(requests.length, 0, "interaction does not wait for delivery");
  await tick();
  assert.equal(requests.length, 1);
  const { url, init } = requests[0];
  assert.equal(url, endpoint);
  assert.equal(init?.method, "POST");
  assert.deepEqual(init?.headers, { "Content-Type": "application/json" });
  assert.equal(init?.credentials, "omit");
  assert.equal(init?.referrerPolicy, "no-referrer");
  assert.equal(init?.cache, "no-store");
  assert.equal(init?.redirect, "error");
  assert.equal(init?.keepalive, true);
  assert.ok(init?.signal instanceof AbortSignal);
  assert.deepEqual(JSON.parse(String(init?.body)), {
    schema_version: 1,
    project: "portfolio",
    source: "site",
    event_id: id,
    ...intent,
  });
  assert.ok(Buffer.byteLength(String(init?.body)) <= 1_024);
});

test("offline, rejected and synchronous browser failures cannot throw into navigation or retry", async () => {
  for (const status of [429, 500]) {
    let calls = 0;
    const transport = createAnalyticsTransport(
      endpoint,
      options(async () => {
        calls += 1;
        return new Response("synthetic body must not be logged", { status });
      }),
    );
    assert.doesNotThrow(() => transport.record(intent));
    await tick();
    await tick();
    assert.equal(calls, 1);
  }
  for (const fetch of [
    async () => {
      throw new Error("synthetic offline");
    },
    () => {
      throw new Error("synthetic synchronous failure");
    },
  ]) {
    const transport = createAnalyticsTransport(endpoint, options(fetch));
    assert.doesNotThrow(() => transport.record(intent));
    await tick();
  }
  for (const facility of ["id", "signal"] as const) {
    let calls = 0;
    const config = options(async () => {
      calls += 1;
      return new Response(null, { status: 204 });
    });
    const transport = createAnalyticsTransport(endpoint, {
      ...config,
      [facility]: () => {
        throw new Error("synthetic unavailable");
      },
    });
    assert.doesNotThrow(() => transport.record(intent));
    await tick();
    assert.equal(calls, 0);
  }
});

test("delivery limits concurrent requests, drops excess without queueing and recovers capacity", async () => {
  let calls = 0;
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const transport = createAnalyticsTransport(
    endpoint,
    options(async () => {
      calls += 1;
      await pending;
      return new Response(null, { status: 204 });
    }),
  );
  for (let index = 0; index < 20; index += 1) transport.record(intent);
  await tick();
  assert.equal(calls, 4);
  release?.();
  await tick();
  await tick();
  assert.equal(calls, 4);
  transport.record(intent);
  await tick();
  assert.equal(calls, 5);
});

test("invalid dimensions and invalid per-event IDs never reach fetch", async () => {
  let calls = 0;
  const config = options(async () => {
    calls += 1;
    return new Response(null, { status: 204 });
  });
  const transport = createAnalyticsTransport(endpoint, config);
  transport.record({ ...intent, cookie: "synthetic" } as typeof intent);
  createAnalyticsTransport(endpoint, { ...config, id: () => "persistent-visitor" }).record(intent);
  await tick();
  assert.equal(calls, 0);
});

test("optional interaction delivery reserves two slots for unchanged semantic requests", async () => {
  const requests: RequestInit[] = [];
  let release: (() => void) | undefined;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  const transport = createAnalyticsTransport(
    endpoint,
    options(async (_url, init) => {
      requests.push(init ?? {});
      await waiting;
      return new Response(null, { status: 204 });
    }),
  );
  const measurement = {
    event_name: "public_click",
    section: "home",
    locale: "en",
    region_id: "home-featured",
    layout_revision: "portfolio-v1",
    viewport: "desktop",
    cell_x: 3,
    cell_y: 4,
  } as const;
  for (let index = 0; index < 20; index += 1) transport.record(measurement);
  transport.record(intent);
  transport.record({ ...intent, event_name: "navigation_click", section: "work" });
  await tick();
  assert.equal(requests.length, 4);
  assert.deepEqual(
    requests.map((request) => JSON.parse(String(request.body)).schema_version),
    [2, 2, 1, 1],
  );
  assert.deepEqual(JSON.parse(String(requests[0].body)), {
    schema_version: 2,
    project: "portfolio",
    source: "site",
    event_id: id,
    ...measurement,
  });
  assert.equal(requests[0].credentials, "omit");
  assert.equal(requests[0].referrerPolicy, "no-referrer");
  release?.();
  await tick();
  await tick();
  assert.equal(requests.length, 4, "dropped measurements are never queued or retried");
  transport.record(measurement);
  await tick();
  assert.equal(requests.length, 5);
});
