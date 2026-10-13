import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const separator = " › ";
const compare = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

function browserFile(file, rootDir) {
  if (typeof file !== "string") throw new Error("Discovery has no test file");
  const normalized = file.replaceAll("\\", "/");
  const marker = normalized.indexOf("tests/browser/");
  const relative =
    marker >= 0
      ? normalized.slice(marker)
      : typeof rootDir === "string" &&
          /(?:^|\/)tests\/browser\/?$/u.test(rootDir.replaceAll("\\", "/")) &&
          !path.isAbsolute(normalized)
        ? `tests/browser/${normalized}`
        : normalized;
  if (
    !relative.startsWith("tests/browser/") ||
    !relative.endsWith(".spec.ts") ||
    relative.split("/").includes("..")
  ) {
    throw new Error(`Unexpected browser test file: ${file}`);
  }
  return relative;
}

export function parseDiscovery(report) {
  if (!report || !Array.isArray(report.suites) || report.errors?.length) {
    throw new Error("Invalid or unsuccessful Playwright discovery");
  }
  const discovered = [];
  const identities = new Set();
  function visit(suite, titles) {
    if (suite?.parallelMode === "serial" || suite?.mode === "serial") {
      throw new Error("Serial suites need whole-suite scheduling");
    }
    if (
      !suite ||
      (suite.specs !== undefined && !Array.isArray(suite.specs)) ||
      (suite.suites !== undefined && !Array.isArray(suite.suites))
    ) {
      throw new Error("Malformed Playwright suite");
    }
    // Playwright's outer file suite names are not part of test title paths.
    const nestedTitles = titles === null ? [] : [...titles, suite.title];
    for (const spec of suite.specs ?? []) {
      const file = browserFile(spec.file ?? suite.file, report.config?.rootDir);
      const titlePath = [...nestedTitles, spec.title];
      if (
        titlePath.some((title) => typeof title !== "string" || !title || /[\r\n›]/u.test(title))
      ) {
        throw new Error("Test titles must be unambiguous single-line selectors");
      }
      if (!Array.isArray(spec.tests) || !spec.tests.length) {
        throw new Error("Discovered specification has no project tests");
      }
      for (const test of spec.tests) {
        const project = test.projectName;
        if (typeof project !== "string" || !project || /[\r\n›[\]]/u.test(project)) {
          throw new Error("Discovered test has an invalid project name");
        }
        const identity = [project, file, ...titlePath].join(separator);
        if (identities.has(identity)) throw new Error(`Duplicate test identity: ${identity}`);
        identities.add(identity);
        discovered.push({
          identity,
          project,
          file,
          selector: `[${project}]${separator}${[file.slice("tests/browser/".length), ...titlePath].join(separator)}`,
        });
      }
    }
    for (const child of suite.suites ?? []) visit(child, nestedTitles);
  }
  for (const suite of report.suites) visit(suite, null);
  if (!discovered.length) throw new Error("Playwright discovery selected no browser tests");
  return discovered.sort((left, right) => compare(left.identity, right.identity));
}

function median(values) {
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
}

/**
 * Approximate seconds to download a browser and install its system packages on a hosted
 * Ubuntu runner, measured from CI logs on 2026-10-12. WebKit and Firefox account for most
 * of the apt payload, so the scheduler prefers keeping their tests together.
 */
export const engineInstallSeconds = { chromium: 15, firefox: 15, webkit: 25 };

/**
 * Assigns tests longest-first to the least-loaded shard. With `engines` (project name to
 * browser engine), a shard's load includes installing each engine its tests need, so tests
 * gather on shards that already install their engine unless spreading them is cheaper.
 */
export function planShards(discovered, timings, shardCount = 8, engines = undefined) {
  if (!Number.isInteger(shardCount) || shardCount < 1) throw new Error("Invalid shard count");
  if (
    !discovered.length ||
    new Set(discovered.map((test) => test.identity)).size !== discovered.length
  ) {
    throw new Error("Scheduling needs nonempty, unique discovered tests");
  }
  if (!timings || typeof timings !== "object" || Array.isArray(timings)) {
    throw new Error("Timing baseline must be an identity-to-seconds object");
  }
  const valid = Object.entries(timings).filter(
    ([, seconds]) => Number.isFinite(seconds) && seconds > 0,
  );
  const fileSamples = new Map();
  const projectSamples = new Map();
  for (const [identity, seconds] of valid) {
    const [project, file, ...title] = identity.split(separator);
    if (!project || !file?.startsWith("tests/browser/") || !title.length) continue;
    for (const [samples, key] of [
      [fileSamples, `${project}${separator}${file}`],
      [projectSamples, project],
    ]) {
      const values = samples.get(key) ?? [];
      values.push(seconds);
      samples.set(key, values);
    }
  }
  const weighted = discovered
    .map((test) => {
      const direct = timings[test.identity];
      const samples =
        fileSamples.get(`${test.project}${separator}${test.file}`) ??
        projectSamples.get(test.project);
      const measured = Number.isFinite(direct) && direct > 0;
      return {
        ...test,
        seconds: measured ? direct : Math.max(15, samples ? median(samples) : 15),
        estimated: !measured,
      };
    })
    .sort((left, right) => right.seconds - left.seconds || compare(left.identity, right.identity));
  const engineOf = (project) => {
    if (!engines) return undefined;
    const engine = engines[project];
    if (!engine) throw new Error(`No browser engine is configured for project: ${project}`);
    return engine;
  };
  const installCost = (shard, engine) =>
    engine && !shard.engines.includes(engine) ? (engineInstallSeconds[engine] ?? 30) : 0;
  const shards = Array.from({ length: shardCount }, (_, index) => ({
    shard: index + 1,
    seconds: 0,
    engines: [],
    tests: [],
  }));
  for (const test of weighted) {
    const engine = engineOf(test.project);
    const cost = (shard) => shard.seconds + installCost(shard, engine);
    const target = [...shards].sort(
      (left, right) =>
        cost(left) - cost(right) ||
        left.tests.length - right.tests.length ||
        left.shard - right.shard,
    )[0];
    target.seconds += test.seconds + installCost(target, engine);
    if (engine && !target.engines.includes(engine)) target.engines.push(engine);
    target.tests.push(test);
  }
  for (const shard of shards) {
    shard.tests.sort((left, right) => compare(left.identity, right.identity));
    shard.engines.sort(compare);
  }
  return shards;
}

export function verifySelection(expected, actual) {
  const expectedIds = expected.map((test) => test.identity).sort(compare);
  const actualIds = actual.map((test) => test.identity).sort(compare);
  if (JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) {
    throw new Error("Playwright test-list round-trip changed the selected tests");
  }
}

export function rejectSerialSource(source) {
  if (/\bdescribe\s*\.\s*serial\b/u.test(source) || /\bmode\s*:\s*["']serial["']/u.test(source)) {
    throw new Error("Explicit serial suites need whole-suite scheduling");
  }
}

/** Reads each Playwright project's browser engine from its device descriptor. */
async function projectEngines(repository) {
  const { default: config } = await import(
    pathToFileURL(path.join(repository, "playwright.config.ts")).href
  );
  return Object.fromEntries(
    config.projects.map((project) => [
      project.name,
      project.use?.browserName ?? project.use?.defaultBrowserType ?? "chromium",
    ]),
  );
}

async function main() {
  const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const cli = path.join(repository, "node_modules/@playwright/test/cli.js");
  const discover = (extra = []) =>
    JSON.parse(
      execFileSync(process.execPath, [cli, "test", "--list", "--reporter=json", ...extra], {
        cwd: repository,
        encoding: "utf8",
        maxBuffer: 16 * 1024 * 1024,
      }),
    );
  const discovered = parseDiscovery(discover());
  for (const file of new Set(discovered.map((test) => test.file))) {
    rejectSerialSource(readFileSync(path.join(repository, file), "utf8"));
  }
  const timings = JSON.parse(
    readFileSync(path.join(repository, "scripts/browser-ci-timings.json"), "utf8"),
  );
  const shards = planShards(discovered, timings, 8, await projectEngines(repository));
  const destination = path.join(repository, ".artifacts/ci/shards");
  mkdirSync(destination, { recursive: true });
  const verified = [];
  for (const shard of shards) {
    if (!shard.tests.length) throw new Error("Every CI shard must select at least one test");
    const list = path.join(destination, `${shard.shard}.txt`);
    writeFileSync(list, `${shard.tests.map((test) => test.selector).join("\n")}\n`);
    // The runner installs only these engines (and their system packages).
    writeFileSync(path.join(destination, `${shard.shard}.engines`), `${shard.engines.join(" ")}\n`);
    const selected = parseDiscovery(discover(["--test-list", list]));
    verifySelection(shard.tests, selected);
    verified.push(...selected);
  }
  verifySelection(discovered, verified);
  const commit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repository,
    encoding: "utf8",
  }).trim();
  writeFileSync(
    path.join(destination, "plan.json"),
    `${JSON.stringify({ commit, totalTests: discovered.length, shards }, null, 2)}\n`,
  );
  console.log(`Verified ${discovered.length} tests in ${shards.length} duration-balanced shards.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await main();
