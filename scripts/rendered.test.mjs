import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import test, { after, before } from "node:test";
import { setTimeout as delay } from "node:timers/promises";

/**
 * Integration tests over the production server.
 *
 * They assert on what actually ships rather than on component internals: the same HTML a
 * recruiter, a crawler and a screen reader receive. Requires `npm run build` first.
 */

const port = process.env.RENDERED_TEST_PORT ?? "3140";
const origin = `http://127.0.0.1:${port}`;

const routes = [
  "/",
  "/about",
  "/work",
  "/work/filomena",
  "/stack",
  "/education",
  "/contact",
  "/es",
  "/es/about",
  "/es/work",
  "/es/work/filomena",
  "/es/stack",
  "/es/education",
  "/es/contact",
];

let server;
const pages = new Map();

const get = async (path) => {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(15_000) });
  return { status: response.status, headers: response.headers, body: await response.text() };
};

before(async () => {
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", port],
    { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
  );
  let output = "";
  let ready = false;
  for (const stream of [server.stdout, server.stderr]) {
    stream.on("data", (chunk) => {
      output = `${output}${chunk}`.slice(-16_384);
      ready ||= /Ready in/.test(output);
    });
  }
  const deadline = Date.now() + 45_000;
  while (!ready) {
    assert.equal(server.exitCode, null, `Server exited: ${output}`);
    assert.ok(Date.now() < deadline, `Server startup timed out: ${output}`);
    await delay(200);
  }
  for (const route of routes) pages.set(route, await get(route));
});

after(async () => {
  if (server?.exitCode === null) {
    const stopped = once(server, "exit");
    server.kill();
    const fallback = setTimeout(() => server.kill("SIGKILL"), 5_000);
    try {
      await stopped;
    } finally {
      clearTimeout(fallback);
    }
  }
});

test("every route returns HTML", () => {
  for (const [route, page] of pages) {
    assert.equal(page.status, 200, `${route} returned ${page.status}`);
    assert.match(page.headers.get("content-type"), /text\/html/, route);
  }
});

test("an unknown path returns 404 with the site shell", async () => {
  const missing = await get("/definitely-not-a-page");
  assert.equal(missing.status, 404);
  assert.match(missing.body, /<main[\s>]/);
});

test("each page declares one h1 and the correct language", () => {
  for (const [route, page] of pages) {
    const h1s = page.body.match(/<h1[\s>]/g) ?? [];
    assert.equal(h1s.length, 1, `${route} has ${h1s.length} h1 elements`);
    const expected = route.startsWith("/es") ? "es" : "en";
    assert.match(page.body, new RegExp(`<html[^>]*lang="${expected}"`), `${route} lang`);
  }
});

test("each page advertises both languages and a canonical URL", () => {
  for (const [route, page] of pages) {
    assert.match(page.body, /rel="canonical"/, `${route} canonical`);
    for (const lang of ["en", "es", "x-default"]) {
      // React serialises the prop as hrefLang; HTML attribute names are case-insensitive.
      assert.match(
        page.body,
        new RegExp(`hreflang="${lang}"`, "i"),
        `${route} is missing the ${lang} alternate`,
      );
    }
  }
});

test("each page exposes landmarks and a skip link", () => {
  for (const [route, page] of pages) {
    assert.match(page.body, /<main[^>]*id="main"/, `${route} main landmark`);
    assert.match(page.body, /class="skip-link"[^>]*href="#main"/, `${route} skip link`);
    assert.match(page.body, /<header/, `${route} header`);
    assert.match(page.body, /<footer/, `${route} footer`);
  }
});

test("the decorative hero still is hidden from assistive technology", () => {
  const home = pages.get("/").body;
  assert.match(home, /<svg[^>]*aria-hidden="true"/, "the still must be aria-hidden");
  assert.ok(!/<svg[^>]*tabindex/.test(home), "the still must not be focusable");
});

test("content renders without JavaScript", () => {
  // The server HTML alone must carry the positioning, the actions and the evidence links.
  const home = pages.get("/").body;
  assert.match(home, /Gonzalo Martin Perez/);
  assert.match(home, /AI Software Engineer/);
  assert.match(home, /href="\/work"/);
  assert.match(home, /href="\/contact"/);
  assert.match(pages.get("/work/filomena").body, /github\.com\/gonzalomartinperez\/filomena/);
});

test("structured data is valid and describes the right person", () => {
  const match = pages
    .get("/")
    .body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, "no JSON-LD found");
  const data = JSON.parse(match[1]);
  assert.equal(data["@type"], "ProfilePage");
  assert.equal(data.mainEntity["@type"], "Person");
  assert.equal(data.mainEntity.name, "Gonzalo Martin Perez");
  assert.ok(Array.isArray(data.mainEntity.sameAs) && data.mainEntity.sameAs.length >= 2);
});

test("no rendered page leaks private data", () => {
  const digits = ["2984", "686913"];
  for (const [route, page] of pages) {
    assert.ok(
      !digits.every((fragment) => page.body.includes(fragment)),
      `${route} exposes the private phone number`,
    );
    assert.ok(!page.body.includes("career-ops"), `${route} references the private repository`);
    assert.ok(!/[A-Z]:\\\\?Users/.test(page.body), `${route} leaks a local filesystem path`);
    assert.ok(!page.body.includes("compensacion"), `${route} references compensation sources`);
  }
});

test("no page advertises a placeholder or unfinished section", () => {
  for (const [route, page] of pages) {
    assert.ok(!/lorem ipsum/i.test(page.body), `${route} contains placeholder text`);
    assert.ok(!/coming soon|próximamente/i.test(page.body), `${route} advertises unfinished work`);
    assert.ok(!/\bTODO\b/.test(page.body), `${route} contains a TODO`);
  }
});

test("sitemap lists both languages and robots points at it", async () => {
  const sitemap = await get("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  for (const route of routes) {
    assert.ok(
      sitemap.body.includes(`https://gonzalomartinperez.com${route === "/" ? "/" : route}`),
      `sitemap is missing ${route}`,
    );
  }
  const robots = await get("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(robots.body, /Sitemap: https:\/\/gonzalomartinperez\.com\/sitemap\.xml/);
  assert.match(robots.body, /Allow: \//);
});

test("published documents and assets are reachable", async () => {
  for (const asset of [
    "/gonzalo-martin-perez-ai-software-engineer-en.pdf",
    "/gonzalo-martin-perez-ai-software-engineer-es.pdf",
    "/icon.svg",
  ]) {
    const response = await fetch(origin + asset, { signal: AbortSignal.timeout(15_000) });
    assert.equal(response.status, 200, `${asset} returned ${response.status}`);
  }
});

test("security headers are present on every route", () => {
  // Production was verified to send none of these before they were added here, so the check
  // exists to stop them regressing silently.
  const required = {
    "strict-transport-security": /max-age=\d{7,}/,
    "x-content-type-options": /nosniff/,
    "x-frame-options": /DENY/i,
    "referrer-policy": /strict-origin-when-cross-origin/,
    "permissions-policy": /camera=\(\)/,
    "content-security-policy": /frame-ancestors 'none'/,
  };
  for (const [route, page] of pages) {
    for (const [header, pattern] of Object.entries(required)) {
      const value = page.headers.get(header);
      assert.ok(value, `${route} is missing ${header}`);
      assert.match(value, pattern, `${route}: ${header} is ${value}`);
    }
  }
});

test("the server does not advertise its framework", () => {
  for (const [route, page] of pages) {
    assert.equal(page.headers.get("x-powered-by"), null, `${route} sends x-powered-by`);
  }
});

test("switching language keeps you on the same page", () => {
  // The Spanish work page must link back to the English one and vice versa.
  assert.match(pages.get("/work").body, /href="\/es\/work"/);
  assert.match(pages.get("/es/work").body, /href="\/work"/);
});
