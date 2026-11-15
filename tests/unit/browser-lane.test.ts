import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

type Project = { name: string; grep?: RegExp };

async function projectsFor(lane?: string): Promise<Project[]> {
  const previous = process.env.BROWSER_LANE;
  if (lane === undefined) delete process.env.BROWSER_LANE;
  else process.env.BROWSER_LANE = lane;
  try {
    const config = await import(`../../playwright.config.ts?lane=${lane ?? "none"}`);
    return config.default.projects;
  } finally {
    if (previous === undefined) delete process.env.BROWSER_LANE;
    else process.env.BROWSER_LANE = previous;
  }
}

test("the pull-request lane runs only journeys on Chromium and iPhone WebKit", async () => {
  const projects = await projectsFor("pr");
  assert.deepEqual(
    projects.map((project) => project.name),
    ["desktop", "iphone-webkit"],
  );
  for (const project of projects) assert.equal(project.grep?.source, "@journey");
});

test("the full lane keeps every project and restricts iPhone WebKit to journeys", async () => {
  for (const lane of [undefined, "full"]) {
    const projects = await projectsFor(lane);
    assert.deepEqual(
      projects.map((project) => project.name).sort(),
      [
        "analytics-firefox",
        "analytics-webkit",
        "assistant-firefox",
        "assistant-webkit",
        "desktop",
        "iphone-webkit",
        "mobile",
      ].sort(),
    );
    assert.equal(projects.find((project) => project.name === "desktop")?.grep, undefined);
    assert.equal(
      projects.find((project) => project.name === "iphone-webkit")?.grep?.source,
      "@journey",
    );
  }
});

test("between 10 and 20 journeys carry the @journey tag", () => {
  const directory = new URL("../browser/", import.meta.url);
  let tagged = 0;
  for (const file of readdirSync(directory).filter((name) => name.endsWith(".spec.ts"))) {
    const source = readFileSync(new URL(file, directory), "utf8");
    tagged += (source.match(/tag:[^}]*@journey/g) ?? []).length;
  }
  // Counts declarations; parametrized declarations expand to at most a few cases each.
  assert.ok(tagged >= 10 && tagged <= 20, `expected 10-20 tagged declarations, found ${tagged}`);
});
