import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseDocument } from "yaml";

type Profile = { paths?: string[]; adds?: string[] };
type ProfileMap = { base: string[]; profiles: Record<string, Profile>; required: string };
type Job = { needs?: string | string[]; if?: string; uses?: string };

const root = new URL("../../", import.meta.url);
const read = (file: string) => readFileSync(new URL(file, root), "utf8");
const config: ProfileMap = JSON.parse(read(".github/ci-profile.json"));
const jobs: Record<string, Job> = parseDocument(read(".github/workflows/ci.yml")).toJS().jobs;
const gateOnly = new Set(["classify", "ci-gate", "checks"]);

/** Same glob semantics as the engineering-standards classify workflow (v1.0.0). */
function globToRegExp(pattern: string): RegExp {
  let source = "";
  for (let index = 0; index < pattern.length; ) {
    if (pattern.startsWith("**/", index)) {
      source += "(?:.*/)?";
      index += 3;
    } else if (pattern.startsWith("**", index)) {
      source += ".*";
      index += 2;
    } else if (pattern[index] === "*") {
      source += "[^/]*";
      index += 1;
    } else if (pattern[index] === "?") {
      source += "[^/]";
      index += 1;
    } else {
      source += (pattern[index] ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      index += 1;
    }
  }
  return new RegExp(`^${source}$`);
}

const pathProfiles = Object.entries(config.profiles).filter(([, profile]) => profile.paths);
const profilesFor = (file: string) =>
  pathProfiles
    .filter(([, profile]) => profile.paths?.some((pattern) => globToRegExp(pattern).test(file)))
    .map(([name]) => name);

test("every tracked file falls in at least one path profile", () => {
  const files = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  assert.ok(files.length > 100);
  const uncovered = files.filter((file) => profilesFor(file).length === 0);
  assert.deepEqual(uncovered, [], "add these paths to .github/ci-profile.json");
});

test("glob semantics match classify for representative paths", () => {
  assert.deepEqual(profilesFor("README.md"), ["docs"]);
  assert.deepEqual(profilesFor("docs/master-plan/ci-profile.json"), ["docs"]);
  assert.deepEqual(profilesFor("src/app/page.tsx"), ["code"]);
  assert.deepEqual(profilesFor("public/.well-known/security.txt"), ["docs", "code"]);
  assert.deepEqual(profilesFor("next.config.mjs"), ["code", "hosting"]);
  assert.deepEqual(profilesFor(".github/workflows/ci.yml"), ["workflow"]);
  assert.deepEqual(profilesFor(".claude/skills/review-change/SKILL.md"), ["docs", "harness"]);
  assert.deepEqual(profilesFor("contracts/assistant-api/openapi.json"), ["contract"]);
});

test("profile job names and ci.yml jobs map one to one", () => {
  const named = new Set([
    ...config.base,
    ...Object.values(config.profiles).flatMap((profile) => profile.adds ?? []),
  ]);
  named.delete("all-profiles");
  const workflowJobs = Object.keys(jobs).filter((id) => !gateOnly.has(id));
  assert.deepEqual([...named].sort(), [...workflowJobs].sort());
  assert.equal(config.required, "ci-gate");
});

test("every profiled job gates on classify and the gate needs every job", () => {
  for (const [id, job] of Object.entries(jobs)) {
    if (gateOnly.has(id)) continue;
    const needs = typeof job.needs === "string" ? [job.needs] : (job.needs ?? []);
    assert.ok(needs.includes("classify"), `${id} needs classify`);
    assert.equal(job.if, `contains(fromJSON(needs.classify.outputs.jobs), '${id}')`);
  }
  const gate = jobs["ci-gate"];
  assert.equal(gate?.if, "always()");
  const expected = Object.keys(jobs).filter((id) => id !== "ci-gate" && id !== "checks");
  assert.deepEqual([...(gate?.needs ?? [])].sort(), expected.sort());
});

test("docs-only changes skip the build, hosting and browser jobs", () => {
  const docs = config.profiles.docs?.adds ?? [];
  for (const heavy of ["build", "hosting", "browser", "performance"])
    assert.equal(docs.includes(heavy), false, heavy);
  assert.ok(config.base.includes("secrets"), "the secret scan runs on every PR");
});

test("full profiles stay built in", () => {
  for (const name of ["deps-weekly", "release", "hotfix"])
    assert.deepEqual(config.profiles[name]?.adds, ["all-profiles"]);
});
