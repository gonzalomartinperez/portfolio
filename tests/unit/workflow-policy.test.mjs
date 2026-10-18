import assert from "node:assert/strict";
import test from "node:test";
import { stringify } from "yaml";
import { validateWorkflowPolicy } from "../../tools/workflow-policy.mjs";

const SHA = "a".repeat(40);
const CORE = ["workflows", "secrets", "quality", "build", "hosting", "browser", "performance"];
const NIGHTLY = ["prepare", "quality", "browser", "visual", "links", "bundle"];
const CORE_NAMES = {
  workflows: "Workflow validation",
  secrets: "Secret scan",
  quality: "Quality (development)",
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
function fixture(profile = "core", phase = "A") {
  const prerequisites = profile === "core" ? CORE : NIGHTLY;
  const jobs = Object.fromEntries(
    prerequisites.map((id) => [
      id,
      {
        name: profile === "core" ? CORE_NAMES[id] : NIGHTLY_NAMES[id],
        "runs-on": "ubuntu-24.04",
        steps: [{ uses: `actions/checkout@${SHA}` }, { run: "echo verified" }],
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
  jobs.browser.strategy = {
    "fail-fast": false,
    "max-parallel": 8,
    matrix: { shard: [1, 2, 3, 4, 5, 6, 7, 8] },
  };
  jobs.checks = gate(profile === "core" ? "Required checks" : NIGHTLY_NAMES.checks, prerequisites);
  if (profile === "core") {
    if (phase === "A") jobs["legacy-checks"] = gate("Quality checks", ["checks"]);
    else jobs.quality.name = "Quality checks";
  }
  return {
    name: profile === "core" ? "CI" : "Nightly",
    on:
      profile === "core"
        ? {
            pull_request: { branches: ["develop", "main"] },
            push: { branches: ["main", "develop"] },
            workflow_dispatch: null,
          }
        : { schedule: [{ cron: "35 3 * * *" }], workflow_dispatch: null },
    permissions: { contents: "read" },
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
      w.jobs.checks.steps[0].env.QUALITY_RESULT = "success";
    },
    /must read needs.quality.result/,
    profile,
  );
}

test("phase B requires explicit migration and retires the phase A bridge", () => {
  const migrated = fixture("core", "B");
  assert.deepEqual(validate(migrated, "core", "B"), []);
  assert.ok(validate(migrated).length);
  assert.ok(validate(fixture(), "core", "B").length);
});
reject(
  "phase A cannot remove the protected legacy check",
  (w) => {
    delete w.jobs["legacy-checks"];
  },
  /expected job IDs/,
);
reject(
  "legacy bridge cannot stop checking the canonical aggregate",
  (w) => {
    w.jobs["legacy-checks"].steps[0].run = "exit 0";
  },
  /only literal success tests/,
);
reject(
  "temporary development quality identity is preserved until migration",
  (w) => {
    w.jobs.quality.name = "Quality checks";
  },
  /expected check name/,
);
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
  /build: must need exactly quality/,
);
reject(
  "Core requires hosting to wait for quality",
  (w) => {
    w.jobs.hosting.needs = [];
  },
  /hosting: must need exactly quality/,
);
reject(
  "Core requires browser to consume the reviewed build",
  (w) => {
    w.jobs.browser.needs = "quality";
  },
  /browser: must need exactly build/,
);
reject(
  "Core requires performance to consume the reviewed build",
  (w) => {
    w.jobs.performance.needs = "quality";
  },
  /performance: must need exactly build/,
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
);
reject(
  "OR and exit-zero suffixes cannot bypass a gate",
  (w) => {
    w.jobs.checks.steps[0].run += " || true";
  },
  /only literal success tests/,
);
reject(
  "a repeated result test cannot stand in for an omitted result",
  (w) => {
    w.jobs.checks.steps[0].run = w.jobs.checks.steps[0].run.replace(
      "$BUILD_RESULT",
      "$QUALITY_RESULT",
    );
  },
  /every prerequisite must be tested/,
);
reject(
  "result variable expressions must point to their own job",
  (w) => {
    w.jobs.checks.steps[0].env.BUILD_RESULT = `\${{ needs.quality.result }}`;
  },
  /must read needs.build.result/,
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
);

test("duplicate YAML job keys cannot overwrite a required job", () => {
  const source = stringify(fixture()).replace("jobs:\n", "jobs:\n  workflows: {name: hidden}\n");
  assert.ok(
    validateWorkflowPolicy(source, { profile: "core" }).some((error) => /Invalid YAML/.test(error)),
  );
});
test("duplicate YAML keys inside the gate cannot hide its actual condition", () => {
  const source = stringify(fixture()).replace(
    / {4}if: [^\n]+/,
    `    if: false\n    if: "\${{ always() }}"`,
  );
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
  /build: must need exactly quality/,
);
reject(
  "independent Core jobs cannot gain undeclared dependencies",
  (w) => {
    w.jobs.secrets.needs = "workflows";
  },
  /secrets: must need exactly no jobs/,
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
  /prerequisite job must not have an if/,
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
    w.jobs.checks.steps[0].env.BUILD_RESULT = "needs.build.result";
  },
  /must read needs.build.result/,
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
