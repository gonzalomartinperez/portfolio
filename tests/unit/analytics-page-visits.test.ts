import assert from "node:assert/strict";
import test from "node:test";
import { createPageVisits } from "../../src/features/analytics/application/page-visits.ts";
import type { PageContext } from "../../src/features/analytics/domain/events.ts";

test("effect restarts, theme rerenders and repeated route commits do not add views", () => {
  const recorded: PageContext[] = [];
  const visits = createPageVisits({ recordPageView: (page) => recorded.push(page) });
  visits.commit("/");
  visits.commit("/");
  visits.commit("/");
  assert.deepEqual(recorded, [{ section: "home", locale: "en" }]);
});

test("language and real route changes count accepted views, including a later return", () => {
  const recorded: PageContext[] = [];
  const visits = createPageVisits({ recordPageView: (page) => recorded.push(page) });
  for (const path of ["/", "/about", "/es/about", "/about", "/"]) visits.commit(path);
  assert.deepEqual(recorded, [
    { section: "home", locale: "en" },
    { section: "about", locale: "en" },
    { section: "about", locale: "es" },
    { section: "about", locale: "en" },
    { section: "home", locale: "en" },
  ]);
});

test("unknown destinations produce no view and do not hide a subsequent public route", () => {
  const recorded: PageContext[] = [];
  const visits = createPageVisits({ recordPageView: (page) => recorded.push(page) });
  for (const path of [null, "/work", "/missing", "/missing", "/work"]) visits.commit(path);
  assert.deepEqual(recorded, [
    { section: "work", locale: "en" },
    { section: "work", locale: "en" },
  ]);
});
