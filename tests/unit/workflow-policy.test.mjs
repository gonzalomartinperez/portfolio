import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { stringify } from "yaml";
import { validateWorkflowPolicy } from "../../tools/workflow-policy.mjs";

const SHA = "a".repeat(40);
const CORE = ["workflows", "secrets", "quality", "build", "hosting", "browser", "performance"];
const NIGHTLY = ["prepare", "quality", "browser", "visual", "links", "bundle"];
const CORE_NAMES = {
  workflows: "Workflow validation",
  secrets: "Secret scan",
  quality: "Quality checks",
  build: "Build",
  hosting: "Hosting contract",
  browser: `Browser tests (\${{ matrix.shard }}/8)`,
  performance: "Performance checks",
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
function gate(name, prerequisites) {
  const variables = prerequisites.map((id) => `${id.toUpperCase().replaceAll("-", "_")}_RESULT`);
  return {
    name,
    if: `\${{ always() }}`,
    needs: [...prerequisites],
    "runs-on": "ubuntu-24.04",
    steps: [
      {
        env: Object.fromEntries(
          prerequisites.map((id, index) => [variables[index], `\${{ needs.${id}.result }}`]),
        ),
        run: variables.map((variable) => `test "$${variable}" = success`).join(" &&\n"),
      },
    ],
  };
}
function hardenRunner() {
  return {
    uses: `step-security/harden-runner@${SHA}`,
    with: { "egress-policy": "audit" },
  };
}
function fixture(profile = "core") {
  const prerequisites = profile === "core" ? CORE : NIGHTLY;
  const jobs = Object.fromEntries(
    prerequisites.map((id) => [
      id,
      {
        name: profile === "core" ? CORE_NAMES[id] : NIGHTLY_NAMES[id],
        permissions: { contents: "read" },
        "runs-on": "ubuntu-24.04",
        steps: [hardenRunner(), { uses: `actions/checkout@${SHA}` }, { run: "echo verified" }],
      },
    ]),
  );
  const dependencies =
    profile === "core"
      ? { build: "quality", hosting: "quality", browser: "build", performance: "build" }
      : {
          quality: "prepare",
          browser: "quality",
          visual: "quality",
          links: "quality",
          bundle: "quality",
        };
  for (const [id, prerequisite] of Object.entries(dependencies)) jobs[id].needs = prerequisite;
  for (const id of profile === "core" ? ["hosting", "browser"] : ["browser", "visual"]) {
    jobs[id].container = { image: "reviewed-container" };
    jobs[id].steps.shift();
  }
  jobs.browser.strategy = {
    "fail-fast": false,
    "max-parallel": 8,
    matrix: { shard: [1, 2, 3, 4, 5, 6, 7, 8] },
  };
  if (profile === "nightly") {
    jobs.checks = gate(NIGHTLY_NAMES.checks, prerequisites);
    jobs.checks.permissions = { contents: "read" };
  }
  if (profile === "core") {
    jobs.classify = {
      uses: `gonzalomartinperez/engineering-standards/.github/workflows/classify.yml@${SHA}`,
      permissions: { contents: "read", "pull-requests": "read" },
    };
    jobs.policy = {
      name: "Branch policy",
      "runs-on": "ubuntu-24.04",
      steps: [hardenRunner(), { run: "echo policy" }],
    };
    for (const id of ["policy", ...CORE]) {
      jobs[id].needs = ["classify", ...(jobs[id].needs ? [jobs[id].needs] : [])];
      jobs[id].if = `contains(fromJSON(needs.classify.outputs.jobs), '${id}')`;
      jobs[id].permissions = id === "policy" ? {} : { contents: "read" };
    }
    jobs.security = {
      needs: "classify",
      if: "contains(fromJSON(needs.classify.outputs.jobs), 'security')",
      uses: `gonzalomartinperez/engineering-standards/.github/workflows/security.yml@${SHA}`,
      permissions: { contents: "read", "pull-requests": "read" },
      with: { "dependency-review": true, "allow-licenses": "", gitleaks: false },
    };
    jobs["ci-gate"] = {
      name: "ci-gate",
      if: "always()",
      needs: ["classify", "policy", "security", ...CORE],
      "runs-on": "ubuntu-24.04",
      permissions: {},
      steps: [
        {
          uses: `gonzalomartinperez/engineering-standards/actions/ci-gate@${SHA}`,
          with: { needs: `\${{ toJSON(needs) }}`, expected: `\${{ needs.classify.outputs.jobs }}` },
        },
      ],
    };
  }
  return {
    name: profile === "core" ? "CI" : "Nightly",
    on:
      profile === "core"
        ? {
            pull_request: {
              branches: ["develop", "main"],
              types: ["opened", "synchronize", "reopened", "labeled", "unlabeled", "edited"],
            },
            merge_group: null,
            push: { branches: ["main", "develop"] },
            workflow_dispatch: null,
          }
        : { schedule: [{ cron: "35 3 * * *" }], workflow_dispatch: null },
    permissions: {},
    defaults: { run: { shell: "bash" } },
    jobs,
  };
}
const validate = (workflow, profile = "core", phase = "A") =>
  validateWorkflowPolicy(stringify(workflow), { profile, phase });
function reject(name, mutate, pattern, profile = "core") {
  test(name, () => {
    const workflow = fixture(profile);
    mutate(workflow);
    const errors = validate(workflow, profile);
    assert.ok(
      errors.some((error) => pattern.test(error)),
      JSON.stringify(errors),
    );
  });
}

for (const profile of ["core", "nightly"]) {
  test(`${profile} accepts the complete declared dependency and result contract`, () => {
    assert.deepEqual(validate(fixture(profile), profile), []);
  });
}
// The run-step result gate grammar now applies to the nightly aggregate only.
for (const profile of ["nightly"]) {
  reject(
    `${profile} rejects an omitted aggregate prerequisite`,
    (w) => w.jobs.checks.needs.pop(),
    /aggregate must need exactly/,
    profile,
  );
  reject(
    `${profile} rejects a skipped-success bypass`,
    (w) => {
      w.jobs.checks.steps[0].run = w.jobs.checks.steps[0].run.replace("= success", "!= failure");
    },
    /only literal success tests/,
    profile,
  );
  reject(
    `${profile} rejects an incomplete success gate`,
    (w) => {
      w.jobs.checks.steps[0].run = 'test "$QUALITY_RESULT" = success';
    },
    /every prerequisite must be tested/,
    profile,
  );
  reject(
    `${profile} rejects conditional aggregate execution`,
    (w) => {
      w.jobs.checks.if = "success()";
    },
    /literal always/,
    profile,
  );
  reject(
    `${profile} rejects conditional result-gate execution`,
    (w) => {
      w.jobs.checks.steps[0].if = "false";
    },
    /unconditional run step/,
    profile,
  );
  reject(
    `${profile} rejects a literal result replacing the real job outcome`,
    (w) => {
      const variable = "QUALITY_RESULT";
      w.jobs.checks.steps[0].env[variable] = "success";
    },
    /must read needs\.(quality|ci-gate)\.result/,
    profile,
  );
}

test("the classify call cannot take inputs that redirect its profile map", () => {
  const workflow = fixture();
  workflow.jobs.classify.with = { "config-path": "docs/other.json" };
  assert.ok(
    validate(workflow).some((error) =>
      /classify: reusable call must declare only uses/.test(error),
    ),
  );
});

test("core ignores the retired migration phase option", () => {
  for (const phase of ["A", "B"]) assert.deepEqual(validate(fixture(), "core", phase), []);
});
reject(
  "workflow rejects duplicate check identities",
  (w) => {
    w.jobs.build.name = w.jobs.hosting.name;
  },
  /duplicate check identity/,
);
reject(
  "workflow rejects unpinned external actions",
  (w) => {
    w.jobs.build.steps[0].uses = "actions/checkout@v7";
  },
  /immutable SHA/,
);
reject(
  "workflow rejects mutable reusable workflow references",
  (w) => {
    w.jobs.build.uses = "owner/repo/.github/workflows/build.yml@main";
  },
  /immutable SHA/,
);
reject(
  "workflow rejects write permissions at its root",
  (w) => {
    w.permissions = "write-all";
  },
  /permissions must/,
);
reject(
  "workflow rejects inherited unspecified root permissions",
  (w) => {
    delete w.permissions;
  },
  /permissions must/,
);
reject(
  "workflow rejects write permissions on a job",
  (w) => {
    w.jobs.build.permissions = { contents: "write" };
  },
  /permissions must/,
);
reject(
  "workflow rejects ignored job failures",
  (w) => {
    w.jobs.build["continue-on-error"] = true;
  },
  /continue-on-error is forbidden/,
);
reject(
  "workflow rejects ignored step failures",
  (w) => {
    w.jobs.build.steps[0]["continue-on-error"] = `\${{ true }}`;
  },
  /continue-on-error is forbidden/,
);
reject(
  "Core rejects path filters that can omit required checks",
  (w) => {
    w.on.pull_request.paths = ["src/**"];
  },
  /must not filter paths/,
);
reject(
  "Core rejects path-ignore filters as well",
  (w) => {
    w.on.push = { "paths-ignore": ["docs/**"] };
  },
  /must not filter paths/,
);
reject(
  "Core requires build to wait for quality",
  (w) => {
    w.jobs.build.needs = "secrets";
  },
  /build: must need exactly classify, quality/,
);
reject(
  "Core requires hosting to wait for quality",
  (w) => {
    w.jobs.hosting.needs = [];
  },
  /hosting: must need exactly classify, quality/,
);
reject(
  "Core requires browser to consume the reviewed build",
  (w) => {
    w.jobs.browser.needs = "quality";
  },
  /browser: must need exactly classify, build/,
);
reject(
  "Core requires performance to consume the reviewed build",
  (w) => {
    w.jobs.performance.needs = "quality";
  },
  /performance: must need exactly classify, build/,
);
reject(
  "Nightly quality requires prepare",
  (w) => {
    w.jobs.quality.needs = [];
  },
  /quality: must need exactly prepare/,
  "nightly",
);
for (const id of ["browser", "visual", "links", "bundle"]) {
  reject(
    `Nightly ${id} requires quality`,
    (w) => {
      w.jobs[id].needs = "prepare";
    },
    new RegExp(`${id}: must need exactly quality`),
    "nightly",
  );
}
reject(
  "Nightly check labels cannot impersonate Core",
  (w) => {
    w.jobs.browser.name = "Browser tests";
  },
  /expected check name/,
  "nightly",
);
reject(
  "browser coverage cannot drop a shard",
  (w) => {
    w.jobs.browser.strategy.matrix.shard.pop();
  },
  /exactly eight shards/,
);
reject(
  "browser coverage cannot add hidden matrix axes",
  (w) => {
    w.jobs.browser.strategy.matrix.platform = ["linux", "mac"];
  },
  /exactly eight shards/,
);
reject(
  "browser coverage cannot exclude a shard",
  (w) => {
    w.jobs.browser.strategy.matrix.exclude = [{ shard: 3 }];
  },
  /exactly eight shards/,
);
reject(
  "browser concurrency stays capped at eight",
  (w) => {
    w.jobs.browser.strategy["max-parallel"] = 9;
  },
  /max-parallel 8/,
);
reject(
  "browser failures cannot cancel the remaining shards",
  (w) => {
    w.jobs.browser.strategy["fail-fast"] = true;
  },
  /fail-fast false/,
);
reject(
  "shell overrides cannot turn a failed gate into success",
  (w) => {
    w.jobs.checks.steps[0].shell = "bash {0} || true";
  },
  /plain bash or sh/,
  "nightly",
);
reject(
  "OR and exit-zero suffixes cannot bypass a gate",
  (w) => {
    w.jobs.checks.steps[0].run += " || true";
  },
  /only literal success tests/,
  "nightly",
);
reject(
  "a repeated result test cannot stand in for an omitted result",
  (w) => {
    w.jobs.checks.steps[0].run += ' && test "$QUALITY_RESULT" = success';
  },
  /every prerequisite must be tested/,
  "nightly",
);
reject(
  "result variable expressions must point to their own job",
  (w) => {
    w.jobs.checks.steps[0].env.QUALITY_RESULT = `\${{ needs.browser.result }}`;
  },
  /must read needs.quality.result/,
  "nightly",
);
reject(
  "dependency cycles are rejected before GitHub evaluates the workflow",
  (w) => {
    w.jobs.quality.needs = "build";
  },
  /dependency cycle/,
);
reject(
  "unknown dependency identities are rejected",
  (w) => {
    w.jobs.build.needs = ["quality", "missing"];
  },
  /existing literal job IDs/,
);
reject(
  "malformed result steps are errors rather than validator crashes",
  (w) => {
    w.jobs.checks.steps = [null];
  },
  /step must be a mapping/,
  "nightly",
);

test("duplicate YAML job keys cannot overwrite a required job", () => {
  const source = stringify(fixture()).replace("jobs:\n", "jobs:\n  workflows: {name: hidden}\n");
  assert.ok(
    validateWorkflowPolicy(source, { profile: "core" }).some((error) => /Invalid YAML/.test(error)),
  );
});
test("duplicate YAML keys inside the gate cannot hide its actual condition", () => {
  const source = stringify(fixture()).replace(
    /( {4}name: ci-gate\n) {4}if: [^\n]+/,
    `$1    if: false\n    if: "\${{ always() }}"`,
  );
  assert.notEqual(source, stringify(fixture()), "the fixture must contain the gate condition");
  assert.ok(
    validateWorkflowPolicy(source, { profile: "core" }).some((error) => /Invalid YAML/.test(error)),
  );
});
test("malformed YAML and unknown profiles fail closed", () => {
  assert.ok(validateWorkflowPolicy("jobs: [", { profile: "core" }).length);
  assert.ok(validateWorkflowPolicy(stringify(fixture()), { profile: "unknown" }).length);
});

reject(
  "extra dependencies cannot change the declared Core DAG",
  (w) => {
    w.jobs.build.needs = ["quality", "secrets"];
  },
  /build: must need exactly classify, quality/,
);
reject(
  "independent Core jobs cannot gain undeclared dependencies",
  (w) => {
    w.jobs.secrets.needs = "workflows";
  },
  /secrets: must need exactly classify/,
);
reject(
  "Nightly prepare remains independent",
  (w) => {
    w.jobs.prepare.needs = "quality";
  },
  /prepare: must need exactly no jobs/,
  "nightly",
);
reject(
  "prerequisite job conditions cannot silently skip the entire profile",
  (w) => {
    w.jobs.quality.if = "false";
  },
  /exact classify output condition/,
);
reject(
  "read-all is broader than the least-privilege contract",
  (w) => {
    w.permissions = "read-all";
  },
  /permissions must/,
);
reject(
  "extra read scopes are broader than contents read",
  (w) => {
    w.permissions.issues = "read";
  },
  /permissions must/,
);
reject(
  "Core requires pull request validation",
  (w) => {
    delete w.on.pull_request;
  },
  /require pull_request/,
);
reject(
  "Core requires push validation",
  (w) => {
    delete w.on.push;
  },
  /require pull_request/,
);
reject(
  "Core requires manual dispatch",
  (w) => {
    delete w.on.workflow_dispatch;
  },
  /workflow_dispatch/,
);
reject(
  "Core push coverage cannot omit develop",
  (w) => {
    w.on.push.branches = ["main"];
  },
  /push must cover exactly/,
);
reject(
  "Core PR coverage cannot omit main",
  (w) => {
    w.on.pull_request.branches = ["develop"];
  },
  /pull_request must cover exactly/,
);
for (const event of ["pull_request_target", "workflow_run"]) {
  reject(
    `privileged ${event} triggers are rejected`,
    (w) => {
      w.on[event] = {};
    },
    /privileged triggers/,
  );
}
reject(
  "Nightly workflow identity must be exact",
  (w) => {
    w.name = "Nightly renamed";
  },
  /workflow name/,
  "nightly",
);
reject(
  "a Nightly prefix alone cannot conceal renamed checks",
  (w) => {
    w.jobs.visual.name = "Nightly renamed";
  },
  /expected check name/,
  "nightly",
);
reject(
  "plain result reference text cannot replace an evaluated expression",
  (w) => {
    w.jobs.checks.steps[0].env.QUALITY_RESULT = "needs.quality.result";
  },
  /must read needs.quality.result/,
  "nightly",
);
test("YAML aliases cannot hide shared job definitions", () => {
  const source = `${stringify(fixture()).replace("contents: read", "contents: &mode read")}\nignored: *mode\n`;
  assert.ok(
    validateWorkflowPolicy(source, { profile: "core" }).some((error) => /Invalid YAML/.test(error)),
  );
});

test("YAML diagnostics omit malformed source values", () => {
  const errors = validateWorkflowPolicy("jobs: [SYNTHETIC_PRIVATE_YAML_SENTINEL", {
    profile: "core",
  });
  assert.ok(errors.length);
  assert.ok(!errors.join("\n").includes("SYNTHETIC_PRIVATE_YAML_SENTINEL"));
});

reject(
  "Nightly cannot silently lose its scheduled validation",
  (w) => {
    delete w.on.schedule;
  },
  /require schedule/,
  "nightly",
);
reject(
  "Nightly cannot become an implicit push workflow",
  (w) => {
    w.on.push = { branches: ["main"] };
  },
  /triggers only/,
  "nightly",
);

test("the committed core and nightly workflows satisfy their profiles", () => {
  for (const [profile, file] of [
    ["core", "ci"],
    ["nightly", "nightly"],
  ]) {
    const source = readFileSync(
      new URL(`../../.github/workflows/${file}.yml`, import.meta.url),
      "utf8",
    );
    assert.deepEqual(validateWorkflowPolicy(source, { profile }), [], file);
  }
});

test("core dependency ordering does not affect the contract", () => {
  const workflow = fixture();
  for (const job of Object.values(workflow.jobs)) {
    if (Array.isArray(job.needs)) job.needs.reverse();
  }
  assert.deepEqual(validate(workflow), []);
});

for (const id of ["policy", "security", ...CORE]) {
  reject(
    `${id} requires its classifier condition`,
    (w) => {
      delete w.jobs[id].if;
    },
    /exact classify output condition/,
  );
  reject(
    `${id} cannot use another job's classifier condition`,
    (w) => {
      w.jobs[id].if = "contains(fromJSON(needs.classify.outputs.jobs), 'other')";
    },
    /exact classify output condition/,
  );
  reject(
    `${id} must depend on classify`,
    (w) => {
      const needs = w.jobs[id].needs;
      w.jobs[id].needs = Array.isArray(needs) ? needs.filter((need) => need !== "classify") : [];
    },
    /must need exactly classify/,
  );
}

reject(
  "core gate must always run",
  (w) => {
    w.jobs["ci-gate"].if = "success()";
  },
  /literal always/,
);
for (const id of ["classify", "policy", "security", ...CORE]) {
  reject(
    `core gate cannot omit ${id}`,
    (w) => {
      w.jobs["ci-gate"].needs = w.jobs["ci-gate"].needs.filter((need) => need !== id);
    },
    /aggregate must need exactly/,
  );
}
for (const target of ["classify", "security", "ci-gate"]) {
  for (const ref of ["main", "a".repeat(39), "g".repeat(40)]) {
    reject(
      `${target} rejects a non-SHA standards ref ${ref}`,
      (w) => {
        const call = target === "ci-gate" ? w.jobs["ci-gate"].steps[0] : w.jobs[target];
        call.uses = call.uses.replace(SHA, ref);
      },
      /SHA/,
    );
  }
  reject(
    `${target} rejects a different pinned standards repository`,
    (w) => {
      const call = target === "ci-gate" ? w.jobs["ci-gate"].steps[0] : w.jobs[target];
      call.uses = call.uses.replace("gonzalomartinperez/engineering-standards", "other/standards");
    },
    /engineering-standards/,
  );
}
reject(
  "standards workflow and gate must use the same SHA",
  (w) => {
    w.jobs["ci-gate"].steps[0].uses = w.jobs["ci-gate"].steps[0].uses.replace(SHA, "b".repeat(40));
  },
  /same SHA/,
);
for (const input of ["needs", "expected"]) {
  reject(
    `core gate rejects a missing ${input} input`,
    (w) => {
      delete w.jobs["ci-gate"].steps[0].with[input];
    },
    /action inputs/,
  );
  reject(
    `core gate rejects a replaced ${input} input`,
    (w) => {
      w.jobs["ci-gate"].steps[0].with[input] = "success";
    },
    /action inputs/,
  );
}
reject(
  "core gate rejects extra inputs",
  (w) => {
    w.jobs["ci-gate"].steps[0].with.extra = "true";
  },
  /action inputs/,
);
reject(
  "core gate cannot skip its action step",
  (w) => {
    w.jobs["ci-gate"].steps[0].if = "false";
  },
  /unconditionally/,
);
reject(
  "core gate cannot add a run command",
  (w) => {
    w.jobs["ci-gate"].steps[0].run = "exit 0";
  },
  /unconditionally/,
);
for (const id of ["ci-gate"]) {
  reject(
    `${id} cannot contain extra steps`,
    (w) => {
      w.jobs[id].steps.push({ run: "echo extra" });
    },
    /exactly one/,
  );
}
for (const key of ["name", "steps", "if", "needs", "with", "secrets"]) {
  reject(
    `classify cannot declare ${key}`,
    (w) => {
      w.jobs.classify[key] = key === "steps" ? [] : "unexpected";
    },
    /reusable call must declare only uses and permissions/,
  );
}
reject(
  "core cannot add undeclared jobs",
  (w) => {
    w.jobs.extra = { name: "Extra", permissions: {}, steps: [{ run: "true" }] };
  },
  /expected job IDs/,
);
reject(
  "core preserves the required check identity",
  (w) => {
    w.jobs["ci-gate"].name = "Renamed gate";
  },
  /expected check name/,
);
reject(
  "core preserves its workflow identity",
  (w) => {
    w.name = "Renamed CI";
  },
  /workflow name/,
);
reject(
  "core cannot add an extra trigger",
  (w) => {
    w.on.schedule = [{ cron: "0 0 * * *" }];
  },
  /triggers only/,
);
reject(
  "core requires merge queue validation",
  (w) => {
    delete w.on.merge_group;
  },
  /merge_group/,
);
reject(
  "core root permissions must be empty even for read access",
  (w) => {
    w.permissions.contents = "read";
  },
  /permissions must be an empty mapping/,
);
reject(
  "each core job must declare permissions",
  (w) => {
    delete w.jobs.quality.permissions;
  },
  /permissions must/,
);
reject(
  "pull request read access is reserved for classify and security",
  (w) => {
    w.jobs.build.permissions["pull-requests"] = "read";
  },
  /permissions must/,
);
reject(
  "classify cannot escalate contents permissions",
  (w) => {
    w.jobs.classify.permissions.contents = "write";
  },
  /permissions must/,
);
reject(
  "ci-gate must have empty permissions",
  (w) => {
    w.jobs["ci-gate"].permissions.contents = "read";
  },
  /permissions must be an empty mapping/,
);
test("core permits explicit disabled permission scopes", () => {
  const workflow = fixture();
  workflow.jobs.build.permissions.issues = "none";
  assert.deepEqual(validate(workflow), []);
});
reject(
  "Nightly prerequisites still cannot have conditions",
  (w) => {
    w.jobs.quality.if = "false";
  },
  /prerequisite job must not have an if/,
  "nightly",
);
reject(
  "Nightly root permissions must be empty even for contents read access",
  (w) => {
    w.permissions = { contents: "read" };
  },
  /permissions must/,
  "nightly",
);
reject(
  "Nightly cannot gain classify's pull request permissions",
  (w) => {
    w.jobs.quality.permissions = { "pull-requests": "read" };
  },
  /permissions must/,
  "nightly",
);

reject(
  "security must use the same SHA as classify and ci-gate",
  (w) => {
    w.jobs.security.uses = w.jobs.security.uses.replace(SHA, "b".repeat(40));
  },
  /security:.*same SHA/,
);
reject(
  "security cannot be omitted from the core inventory",
  (w) => {
    delete w.jobs.security;
  },
  /expected job IDs/,
);
for (const key of ["needs", "if", "uses", "permissions", "with"]) {
  reject(
    `security must declare ${key}`,
    (w) => {
      delete w.jobs.security[key];
    },
    /security: reusable call must declare exactly/,
  );
}
for (const key of ["name", "secrets", "steps", "runs-on"]) {
  reject(
    `security cannot declare ${key}`,
    (w) => {
      w.jobs.security[key] = "unexpected";
    },
    /security: reusable call must declare exactly/,
  );
}
reject(
  "security keeps the licence allow-list explicitly empty",
  (w) => {
    w.jobs.security.with["allow-licenses"] = "MIT";
  },
  /security: inputs must be exactly/,
);
reject(
  "security cannot accept extra inputs",
  (w) => {
    w.jobs.security.with.extra = true;
  },
  /security: inputs must be exactly/,
);
for (const value of [false, "true", null]) {
  reject(
    `security dependency review must be literal true rather than ${JSON.stringify(value)}`,
    (w) => {
      w.jobs.security.with["dependency-review"] = value;
    },
    /security: inputs must be exactly/,
  );
}
for (const scope of ["contents", "pull-requests"]) {
  reject(
    `security must grant ${scope} read access`,
    (w) => {
      w.jobs.security.permissions[scope] = "none";
    },
    /security: permissions must be exactly/,
  );
}
reject(
  "security cannot declare extra disabled permission scopes",
  (w) => {
    w.jobs.security.permissions.issues = "none";
  },
  /security: permissions must be exactly/,
);
reject(
  "security cannot need an additional job",
  (w) => {
    w.jobs.security.needs = ["classify", "policy"];
  },
  /security: must need exactly classify/,
);
test("security accepts classify as a single-item needs array", () => {
  const workflow = fixture();
  workflow.jobs.security.needs = ["classify"];
  assert.deepEqual(validate(workflow), []);
});

for (const profile of ["core", "nightly"]) {
  const runnerJobs =
    profile === "core"
      ? ["policy", "workflows", "secrets", "quality", "build", "performance"]
      : ["prepare", "quality", "links", "bundle"];
  for (const id of runnerJobs) {
    reject(
      `${profile} ${id} requires harden-runner`,
      (w) => {
        w.jobs[id].steps.shift();
      },
      /first step must use SHA-pinned step-security\/harden-runner/,
      profile,
    );
  }
  for (const ref of ["v2", "a".repeat(39), "g".repeat(40)]) {
    reject(
      `${profile} rejects an unpinned harden-runner ref ${ref}`,
      (w) => {
        w.jobs.quality.steps[0].uses = `step-security/harden-runner@${ref}`;
      },
      /first step must use SHA-pinned step-security\/harden-runner/,
      profile,
    );
  }
  for (const [key, value] of [
    ["if", `\${{ false }}`],
    ["continue-on-error", true],
  ]) {
    reject(
      `${profile} harden-runner cannot be skipped through ${key}`,
      (w) => {
        w.jobs.quality.steps[0][key] = value;
      },
      /first step must use SHA-pinned step-security\/harden-runner/,
      profile,
    );
  }
  reject(
    `${profile} harden-runner must precede checkout`,
    (w) => {
      const steps = w.jobs.quality.steps;
      [steps[0], steps[1]] = [steps[1], steps[0]];
    },
    /first step must use SHA-pinned step-security\/harden-runner/,
    profile,
  );
  for (const value of [undefined, "disabled"]) {
    reject(
      `${profile} harden-runner rejects egress-policy ${value}`,
      (w) => {
        w.jobs.quality.steps[0].with = value ? { "egress-policy": value } : {};
      },
      /egress-policy audit or block/,
      profile,
    );
  }
  test(`${profile} accepts harden-runner with blocked egress`, () => {
    const workflow = fixture(profile);
    workflow.jobs.quality.steps[0].with["egress-policy"] = "block";
    assert.deepEqual(validate(workflow, profile), []);
  });
}
for (const id of [...NIGHTLY, "checks"]) {
  reject(
    `Nightly ${id} must declare permissions`,
    (w) => {
      delete w.jobs[id].permissions;
    },
    /permissions must/,
    "nightly",
  );
}
test("Nightly permits explicitly disabled permission scopes", () => {
  const workflow = fixture("nightly");
  workflow.jobs.quality.permissions = { contents: "none", issues: "none" };
  assert.deepEqual(validate(workflow, "nightly"), []);
});
reject(
  "Nightly aggregate must keep exactly one result-gate run step",
  (w) => {
    w.jobs.checks.steps.unshift(hardenRunner());
  },
  /exactly one result-gate run step/,
  "nightly",
);
