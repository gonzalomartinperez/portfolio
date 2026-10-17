import assert from "node:assert/strict";
import test from "node:test";
import { pageContext, sections } from "../src/features/analytics/domain/events.ts";

test("only the sixteen reviewed localized routes produce coarse page dimensions", () => {
  const paths = [
    "/",
    "/about",
    "/work",
    "/work/filomena",
    "/stack",
    "/education",
    "/cv",
    "/contact",
  ];
  for (const [index, path] of paths.entries()) {
    assert.deepEqual(pageContext(path), { section: sections[index], locale: "en" });
    assert.deepEqual(pageContext(`/es${path === "/" ? "" : path}`), {
      section: sections[index],
      locale: "es",
    });
  }
});

test("unknown routes and URL-like input never become analytics dimensions", () => {
  for (const path of [
    null,
    "",
    "/missing",
    "/assistant",
    "/es/assistant",
    "/about?email=synthetic@example.invalid",
    "/work#private-fragment",
    "https://example.invalid/about",
    "/es/__proto__",
    "/constructor",
    "/about/",
  ]) {
    assert.equal(pageContext(path), null);
  }
});
