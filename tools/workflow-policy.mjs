import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseDocument } from "yaml";

const CORE = ["workflows", "secrets", "quality", "build", "hosting", "browser", "performance"];
const NIGHTLY = ["prepare", "quality", "browser", "visual", "links", "bundle"];
const CORE_NAMES = {
  policy: "Branch policy",
  quality: "Quality checks",
  "ci-gate": "ci-gate",
  workflows: "Workflow validation",
  secrets: "Secret scan",
  build: "Build",
  hosting: "Hosting contract",
  browser: `Browser tests (\${{ matrix.shard }}/8)`,
  performance: "Performance checks",
  checks: "Required checks",
};
const NIGHTLY_NAMES = {
  prepare: "Nightly prepare candidate",
  quality: "Nightly quality checks",
  browser: `Nightly browser tests (\${{ matrix.shard }}/8)`,
  visual: "Nightly visual checks",
  links: "Nightly link checks",
  bundle: "Nightly bundle checks",
  checks: "Nightly required checks",
};
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const sameSet = (actual, expected) =>
  actual.length === expected.length && expected.every((value) => actual.includes(value));
const expression = (value) =>
  typeof value === "string"
    ? value
        .trim()
        .replace(/^\$\{\{\s*([\s\S]*?)\s*\}\}$/, "$1")
        .trim()
    : "";

function inspectPermissions(
  value,
  label,
  errors,
  requireContents = false,
  allowPullRequests = false,
) {
  if (
    !isRecord(value) ||
    (requireContents && value.contents !== "read") ||
    Object.entries(value).some(
      ([scope, permission]) =>
        permission !== "none" &&
        !(scope === "contents" && permission === "read") &&
        !(allowPullRequests && scope === "pull-requests" && permission === "read"),
    )
  ) {
    errors.push(
      `${label}: permissions must grant only contents: read or explicitly disable scopes`,
    );
  }
}

function inspectAction(value, label, errors) {
  if (
    typeof value !== "string" ||
    !/^(?:[^@\s]+@[a-f\d]{40}|docker:\/\/[^\s]+@sha256:[a-f\d]{64})$/i.test(value)
  ) {
    errors.push(`${label}: actions and reusable workflows must use an immutable SHA`);
  }
}

function inspectGate(workflow, job, prerequisites, label, errors) {
  if (expression(job.if) !== "always()")
    errors.push(`${label}: aggregate must run with literal always()`);
  const needs = typeof job.needs === "string" ? [job.needs] : job.needs;
  if (!Array.isArray(needs) || !sameSet(needs, prerequisites)) {
    errors.push(`${label}: aggregate must need exactly ${prerequisites.join(", ")}`);
  }
  const expected = new Map(
    prerequisites.map((id) => [`${id.toUpperCase().replaceAll("-", "_")}_RESULT`, id]),
  );
  const candidates = (Array.isArray(job.steps) ? job.steps : []).filter(
    (step) =>
      isRecord(step) && isRecord(step.env) && [...expected.keys()].every((key) => key in step.env),
  );
  if (candidates.length !== 1) {
    errors.push(`${label}: aggregate requires one gate with every explicit result variable`);
    return;
  }
  const gate = candidates[0];
  if ("if" in gate || "uses" in gate)
    errors.push(`${label}: result gate must be an unconditional run step`);
  const shell = gate.shell ?? job.defaults?.run?.shell ?? workflow.defaults?.run?.shell ?? "bash";
  if (shell !== "bash" && shell !== "sh")
    errors.push(`${label}: result gate requires a plain bash or sh shell`);
  for (const [variable, id] of expected) {
    if (
      typeof gate.env[variable] !== "string" ||
      !/^\$\{\{[\s\S]*\}\}$/.test(gate.env[variable].trim()) ||
      expression(gate.env[variable]) !== `needs.${id}.result`
    ) {
      errors.push(`${label}: ${variable} must read needs.${id}.result`);
    }
  }
  // This accepts one deliberately narrow gate form, not arbitrary shell programs.
  const clauses = typeof gate.run === "string" ? gate.run.trim().split(/\s*&&\s*/) : [];
  const variables = [];
  for (const clause of clauses) {
    const match = clause.match(/^test\s+"\$([A-Z_]+)"\s+=\s+success$/);
    if (match) variables.push(match[1]);
    else errors.push(`${label}: gate must contain only literal success tests joined with &&`);
  }
  if (!sameSet(variables, [...expected.keys()])) {
    errors.push(`${label}: every prerequisite must be tested exactly once against literal success`);
  }
}

function inspectCoreGate(jobs, errors) {
  const classifySha = (typeof jobs.classify?.uses === "string" ? jobs.classify.uses : "").match(
    /^gonzalomartinperez\/engineering-standards\/\.github\/workflows\/classify\.yml@([a-f\d]{40})$/i,
  )?.[1];
  if (!classifySha)
    errors.push("classify: must use the SHA-pinned engineering-standards classify workflow");
  const gate = jobs["ci-gate"];
  if (!isRecord(gate)) return;
  if (gate.if !== "always()") errors.push("ci-gate: aggregate must run with literal always()");
  const needs = typeof gate.needs === "string" ? [gate.needs] : gate.needs;
  if (!Array.isArray(needs) || !sameSet(needs, ["classify", "policy", ...CORE]))
    errors.push("ci-gate: aggregate must need exactly classify, policy and every prerequisite");
  if (!isRecord(gate.permissions) || Object.keys(gate.permissions).length !== 0)
    errors.push("ci-gate: permissions must be an empty mapping");
  if (!Array.isArray(gate.steps) || gate.steps.length !== 1 || !isRecord(gate.steps[0])) {
    errors.push("ci-gate: must contain exactly one pinned action step");
    return;
  }
  const step = gate.steps[0];
  const gateSha = (typeof step.uses === "string" ? step.uses : "").match(
    /^gonzalomartinperez\/engineering-standards\/actions\/ci-gate@([a-f\d]{40})$/i,
  )?.[1];
  if (!gateSha || gateSha !== classifySha)
    errors.push(
      "ci-gate: must use the pinned engineering-standards action with the same SHA as classify",
    );
  if ("if" in step || "run" in step) errors.push("ci-gate: action step must run unconditionally");
  if (
    !isRecord(step.with) ||
    !sameSet(Object.keys(step.with), ["needs", "expected"]) ||
    step.with.needs !== `\${{ toJSON(needs) }}` ||
    step.with.expected !== `\${{ needs.classify.outputs.jobs }}`
  )
    errors.push("ci-gate: action inputs must pass exactly toJSON(needs) and classify outputs.jobs");
}

/** Checks declarative workflow structure and a fixed aggregate grammar; it does not sandbox shell. */
export function validateWorkflowPolicy(source, { profile } = {}) {
  const errors = [];
  if (!["core", "nightly"].includes(profile)) return ["Unknown workflow profile"];
  let workflow;
  try {
    const document = parseDocument(source, { uniqueKeys: true, version: "1.2" });
    if (document.errors.length || document.warnings.length) {
      return ["Invalid YAML: expected an unambiguous YAML 1.2 document"];
    }
    workflow = document.toJS({ maxAliasCount: 0 });
  } catch {
    return ["Invalid YAML: expected an unambiguous YAML 1.2 document"];
  }
  if (!isRecord(workflow) || !isRecord(workflow.jobs))
    return ["Workflow must define a jobs mapping"];
  const prerequisites = profile === "core" ? CORE : NIGHTLY;
  const expectedIds =
    profile === "core"
      ? ["classify", "policy", ...CORE, "ci-gate", "checks"]
      : [...NIGHTLY, "checks"];
  if (!sameSet(Object.keys(workflow.jobs), expectedIds))
    errors.push(`${profile}: expected job IDs ${expectedIds.join(", ")}`);
  if (profile === "core" ? workflow.name !== "CI" : workflow.name !== "Nightly") {
    errors.push(`${profile}: workflow name must identify its CI profile`);
  }
  if (profile === "core") {
    if (!isRecord(workflow.permissions) || Object.keys(workflow.permissions).length !== 0)
      errors.push("core: permissions must be an empty mapping");
  } else inspectPermissions(workflow.permissions, profile, errors, true);
  if (
    isRecord(workflow.on) &&
    ["pull_request_target", "workflow_run"].some((event) => Object.hasOwn(workflow.on, event))
  ) {
    errors.push(
      `${profile}: privileged triggers pull_request_target and workflow_run are forbidden`,
    );
  }
  if (profile === "core") {
    if (
      !isRecord(workflow.on) ||
      !sameSet(Object.keys(workflow.on), [
        "pull_request",
        "push",
        "workflow_dispatch",
        "merge_group",
      ])
    ) {
      errors.push(
        "core: require pull_request, push, workflow_dispatch and merge_group triggers only",
      );
    }
    for (const event of ["pull_request", "push"]) {
      const trigger = workflow.on?.[event];
      if (
        !isRecord(trigger) ||
        !Array.isArray(trigger.branches) ||
        !sameSet(trigger.branches, ["main", "develop"]) ||
        "branches-ignore" in trigger
      ) {
        errors.push(`core: ${event} must cover exactly main and develop`);
      }
    }
    for (const [event, trigger] of Object.entries(workflow.on ?? {})) {
      if (isRecord(trigger) && ("paths" in trigger || "paths-ignore" in trigger))
        errors.push(`core: ${event} must not filter paths`);
    }
  }
  if (profile === "nightly") {
    if (
      !isRecord(workflow.on) ||
      !sameSet(Object.keys(workflow.on), ["schedule", "workflow_dispatch"])
    )
      errors.push("nightly: require schedule and workflow_dispatch triggers only");
    if (
      !Array.isArray(workflow.on?.schedule) ||
      workflow.on.schedule.length !== 1 ||
      typeof workflow.on.schedule[0]?.cron !== "string"
    )
      errors.push("nightly: require one explicit scheduled entry");
  }
  const names = new Set();
  for (const [id, job] of Object.entries(workflow.jobs)) {
    if (!isRecord(job)) {
      errors.push(`${id}: job must be a mapping`);
      continue;
    }
    if (profile === "core" && id === "classify") {
      if ("name" in job || "steps" in job || "if" in job || "needs" in job)
        errors.push("classify: reusable call must not declare name, steps, if or needs");
    } else if (typeof job.name !== "string" || !job.name.trim())
      errors.push(`${id}: job requires a literal check name`);
    else {
      if (names.has(job.name.trim())) errors.push(`${id}: duplicate check identity ${job.name}`);
      names.add(job.name.trim());
      const expectedName = profile === "nightly" ? NIGHTLY_NAMES[id] : CORE_NAMES[id];
      if (job.name !== expectedName) errors.push(`${id}: expected check name ${expectedName}`);
    }
    if (profile === "nightly" && "if" in job && id !== "checks")
      errors.push(`${id}: prerequisite job must not have an if condition`);
    if (profile === "core" || "permissions" in job)
      inspectPermissions(
        job.permissions,
        id,
        errors,
        false,
        profile === "core" && id === "classify",
      );
    if ("continue-on-error" in job) errors.push(`${id}: continue-on-error is forbidden`);
    if ("uses" in job) inspectAction(job.uses, id, errors);
    if ("needs" in job) {
      const dependencies = typeof job.needs === "string" ? [job.needs] : job.needs;
      if (
        !Array.isArray(dependencies) ||
        dependencies.some(
          (dependency) =>
            typeof dependency !== "string" || !Object.hasOwn(workflow.jobs, dependency),
        )
      ) {
        errors.push(`${id}: needs must reference existing literal job IDs`);
      }
    }
    for (const step of Array.isArray(job.steps) ? job.steps : []) {
      if (!isRecord(step)) {
        errors.push(`${id}: step must be a mapping`);
        continue;
      }
      if ("continue-on-error" in step) errors.push(`${id}: step continue-on-error is forbidden`);
      if ("uses" in step) inspectAction(step.uses, id, errors);
    }
  }
  const visited = new Set();
  const active = new Set();
  const visit = (id) => {
    if (active.has(id)) {
      errors.push(`${id}: dependency cycle is forbidden`);
      return;
    }
    if (visited.has(id)) return;
    visited.add(id);
    active.add(id);
    const needs = workflow.jobs[id]?.needs;
    for (const dependency of Array.isArray(needs)
      ? needs
      : typeof needs === "string"
        ? [needs]
        : []) {
      if (typeof dependency === "string" && Object.hasOwn(workflow.jobs, dependency))
        visit(dependency);
    }
    active.delete(id);
  };
  for (const id of Object.keys(workflow.jobs)) visit(id);
  const dependencies =
    profile === "core"
      ? { build: ["quality"], hosting: ["quality"], browser: ["build"], performance: ["build"] }
      : {
          quality: ["prepare"],
          browser: ["quality"],
          visual: ["quality"],
          links: ["quality"],
          bundle: ["quality"],
        };
  for (const id of profile === "core" ? ["policy", ...CORE] : prerequisites) {
    const required = [...(profile === "core" ? ["classify"] : []), ...(dependencies[id] ?? [])];
    if (
      profile === "core" &&
      workflow.jobs[id]?.if !== `contains(fromJSON(needs.classify.outputs.jobs), '${id}')`
    )
      errors.push(`${id}: must use the exact classify output condition for its own ID`);
    const needs = workflow.jobs[id]?.needs;
    const actual = needs === undefined ? [] : Array.isArray(needs) ? needs : [needs];
    if (!sameSet(actual, required))
      errors.push(`${id}: must need exactly ${required.join(", ") || "no jobs"}`);
  }
  const strategy = workflow.jobs.browser?.strategy;
  if (
    !isRecord(strategy) ||
    strategy["fail-fast"] !== false ||
    strategy["max-parallel"] !== 8 ||
    !Array.isArray(strategy.matrix?.shard) ||
    !sameSet(strategy.matrix.shard, [1, 2, 3, 4, 5, 6, 7, 8]) ||
    strategy.matrix.include ||
    strategy.matrix.exclude ||
    Object.keys(strategy.matrix).length !== 1
  ) {
    errors.push(
      `${profile}: browser must run exactly eight shards, max-parallel 8, fail-fast false`,
    );
  }
  if (isRecord(workflow.jobs.checks)) {
    inspectGate(
      workflow,
      workflow.jobs.checks,
      profile === "core" ? ["ci-gate"] : prerequisites,
      `${profile}.checks`,
      errors,
    );
    if (profile === "core" && workflow.jobs.checks.steps?.length !== 1)
      errors.push("core.checks: alias must contain exactly one result gate step");
  }
  if (profile === "core") inspectCoreGate(workflow.jobs, errors);
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--phase=B")) {
    console.error("Usage: node tools/workflow-policy.mjs [--phase=B]");
    process.exitCode = 1;
  } else {
    for (const [profile, file] of [
      ["core", ".github/workflows/ci.yml"],
      ["nightly", ".github/workflows/nightly.yml"],
    ]) {
      try {
        const errors = validateWorkflowPolicy(readFileSync(file, "utf8"), {
          profile,
        });
        for (const error of errors) console.error(`${file}: ${error}`);
        if (errors.length) process.exitCode = 1;
      } catch {
        console.error(`${file}: unable to validate workflow`);
        process.exitCode = 1;
      }
    }
    if (!process.exitCode)
      console.log("Workflow profiles and required-result gates satisfy policy.");
  }
}
