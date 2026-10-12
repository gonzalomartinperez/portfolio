import assert from "node:assert/strict";
import test from "node:test";
import {
  parseDiscovery,
  planShards,
  rejectSerialSource,
  verifySelection,
} from "./browser-ci-planner.mjs";

function report(titles, project = "chromium", file = "tests/browser/example.spec.ts") {
  return {
    suites: [
      {
        title: file,
        file,
        suites: [
          {
            title: "navigation",
            file,
            suites: [],
            specs: titles.map((title, index) => ({
              title,
              file,
              line: index + 1,
              tests: [{ projectName: project }],
            })),
          },
        ],
        specs: [],
      },
    ],
  };
}

const discovered = parseDiscovery(report(["first", "second", "third", "fourth"]));
const weights = Object.fromEntries(
  discovered.map((item, index) => [item.identity, [40, 30, 20, 10][index]]),
);

test("native discovery preserves project, relative file and nested titles but ignores line numbers", () => {
  const original = report(["first"], "webkit", "/workspace/tests/browser/example.spec.ts");
  const parsed = parseDiscovery(original);
  assert.equal(parsed[0].identity, "webkit › tests/browser/example.spec.ts › navigation › first");
  assert.equal(parsed[0].selector, "[webkit] › tests/browser/example.spec.ts › navigation › first");
  original.suites[0].suites[0].specs[0].line = 999;
  assert.deepEqual(parseDiscovery(original), parsed);
});

test("longest-first scheduling balances work and is deterministic regardless of discovery order", () => {
  const plan = planShards(discovered, weights, 2);
  assert.deepEqual(
    plan.map((shard) => shard.seconds),
    [50, 50],
  );
  assert.deepEqual(planShards([...discovered].reverse(), weights, 2), plan);
  verifySelection(
    discovered,
    plan.flatMap((shard) => shard.tests),
  );
});

test("new tests are included and removed timing entries never create tests", () => {
  const current = parseDiscovery(report(["first", "new"]));
  const plan = planShards(current, weights, 2);
  verifySelection(
    current,
    plan.flatMap((shard) => shard.tests),
  );
  const added = plan
    .flatMap((shard) => shard.tests)
    .find((item) => item.identity.endsWith(" › new"));
  assert.equal(added.estimated, true);
  assert.equal(added.seconds, 25);
});

test("unknown durations use conservative file/project medians and a 15-second floor", () => {
  const tests = [
    ...parseDiscovery(report(["new"])),
    ...parseDiscovery(report(["other"], "chromium", "tests/browser/other.spec.ts")),
    ...parseDiscovery(report(["unknown"], "new-browser")),
  ];
  const result = planShards(tests, weights, 1)[0].tests;
  assert.deepEqual(
    result.map((item) => item.seconds),
    [25, 25, 15],
  );
  const fast = { [discovered[0].identity]: 0.1 };
  assert.equal(planShards(tests, fast, 1)[0].tests[0].seconds, 15);
});

test("invalid timings cannot omit tests or make estimates nonfinite", () => {
  const invalid = Object.fromEntries(
    discovered.map((item, index) => [item.identity, [0, -1, "30", Number.NaN][index]]),
  );
  const plan = planShards(discovered, invalid, 2);
  verifySelection(
    discovered,
    plan.flatMap((shard) => shard.tests),
  );
  assert.ok(plan.every((shard) => Number.isFinite(shard.seconds)));
  assert.ok(plan.flatMap((shard) => shard.tests).every((item) => item.seconds === 15));
});

test("duplicate discoveries and duplicate scheduler inputs fail instead of dropping coverage", () => {
  assert.throws(() => parseDiscovery(report(["same", "same"])), /Duplicate/);
  assert.throws(() => planShards([discovered[0], discovered[0]], weights), /unique/);
});

test("malformed discovery, unsafe selectors and discovery errors fail closed", () => {
  for (const malformed of [
    null,
    {},
    { suites: [] },
    { suites: [{}] },
    { suites: [], errors: [{ message: "compile failed" }] },
  ]) {
    assert.throws(() => parseDiscovery(malformed));
  }
  assert.throws(() => parseDiscovery(report(["ambiguous › title"])), /unambiguous/);
  assert.throws(() => parseDiscovery(report(["newline\ntitle"])), /unambiguous/);
  assert.throws(
    () => parseDiscovery(report(["first"], "", "tests/browser/example.spec.ts")),
    /project/,
  );
  assert.throws(
    () => parseDiscovery(report(["first"], "chromium", "outside.spec.ts")),
    /Unexpected/,
  );
  assert.throws(() => planShards(discovered, weights, 0), /shard count/);
});

test("round-trip verification detects additions, omissions and duplicate selections", () => {
  verifySelection(discovered, [...discovered].reverse());
  assert.throws(() => verifySelection(discovered, discovered.slice(1)), /round-trip/);
  assert.throws(() => verifySelection(discovered, [...discovered, discovered[0]]), /round-trip/);
  assert.throws(
    () => verifySelection(discovered, [...discovered.slice(1), discovered[1]]),
    /round-trip/,
  );
});

test("explicit serial suites fail rather than change execution semantics", () => {
  assert.throws(() => rejectSerialSource("test.describe.serial('flow', () => {})"), /serial/);
  assert.throws(() => rejectSerialSource("test.describe.configure({ mode: 'serial' })"), /serial/);
  assert.doesNotThrow(() => rejectSerialSource("test.describe.configure({ mode: 'parallel' })"));
  const serial = report(["first"]);
  serial.suites[0].suites[0].parallelMode = "serial";
  assert.throws(() => parseDiscovery(serial), /Serial/);
});

test("discovery accepts native omitted leaf suites and testDir-relative files", () => {
  const native = report(["first"], "chromium", "example.spec.ts");
  native.config = { rootDir: "/workspace/tests/browser" };
  delete native.suites[0].suites[0].suites;
  assert.equal(parseDiscovery(native)[0].file, "tests/browser/example.spec.ts");
  native.suites[0].suites[0].specs[0].file = "../outside.spec.ts";
  assert.throws(() => parseDiscovery(native), /Unexpected/);
});
