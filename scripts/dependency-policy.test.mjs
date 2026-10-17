import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  classifyUpdate,
  createMetadataReader,
  identityReason,
  inspectReadiness,
  reviewDependency,
} from "./dependency-policy.mjs";

const revision = (letter) => letter.repeat(40);
const bot = { login: "dependabot[bot]", id: 49699333 };
function snapshots(names = ["@types/react"]) {
  const before = {
    name: "portfolio",
    dependencies: { react: "19.3.1" },
    devDependencies: Object.fromEntries(names.map((name) => [name, "19.3.0"])),
  };
  const after = structuredClone(before);
  const beforeLock = {
    name: "portfolio",
    lockfileVersion: 3,
    packages: {
      "": structuredClone(before),
      "node_modules/react": { version: "19.3.1", integrity: "unchanged" },
      ...Object.fromEntries(
        names.map((name) => [
          `node_modules/${name}`,
          {
            dev: true,
            version: "19.3.0",
            resolved: `https://registry.npmjs.org/${name}/-/${name.split("/").at(-1)}-19.3.0.tgz`,
            integrity: `sha512-${"A".repeat(86)}==`,
          },
        ]),
      ),
    },
  };
  const afterLock = structuredClone(beforeLock);
  for (const name of names) {
    after.devDependencies[name] = "19.3.1";
    afterLock.packages[""].devDependencies[name] = "19.3.1";
    afterLock.packages[`node_modules/${name}`].version = "19.3.1";
    afterLock.packages[`node_modules/${name}`].resolved =
      `https://registry.npmjs.org/${name}/-/${name.split("/").at(-1)}-19.3.1.tgz`;
  }
  return { before, after, beforeLock, afterLock };
}
function metadata() {
  const repo = { full_name: "gonzalomartinperez/portfolio", id: 1 };
  return {
    pr: {
      node_id: "synthetic-pr-node",
      state: "open",
      draft: false,
      user: bot,
      commits: 1,
      changed_files: 2,
      head: { ref: "dependabot/npm_and_yarn/reviewed-updates", sha: revision("a"), repo },
      base: { ref: "develop", sha: revision("b"), repo },
    },
    commits: [
      {
        author: bot,
        sha: revision("a"),
        commit: { verification: { verified: true, reason: "valid" } },
      },
    ],
    files: ["package.json", "package-lock.json"].map((filename) => ({
      filename,
      status: "modified",
      sha: revision("c"),
    })),
  };
}

test("single and grouped stable dev-tool patch snapshots are candidates, never merge permission", () => {
  for (const names of [["@types/react"], ["@types/react", "@types/react-dom"]])
    assert.equal(classifyUpdate(snapshots(names)), "patch-candidate-manual-merge");
});

test("minor, major, prerelease, zero-major, ranges, downgrade and unchanged versions remain manual", () => {
  for (const value of [
    "19.4.0",
    "20.0.0",
    "19.3.1-rc.1",
    "0.3.2",
    "^19.3.1",
    "19.2.9",
    "19.3.0",
    "19.03.1",
    null,
  ]) {
    const input = snapshots();
    input.after.devDependencies["@types/react"] = value;
    assert.notEqual(classifyUpdate(input), "patch-candidate-manual-merge");
  }
});

test("frameworks, unknown tools, installed code and new or removed direct packages remain manual", () => {
  for (const name of [
    "next",
    "@playwright/test",
    "@types/node",
    "@biomejs/biome",
    "unknown-tool",
  ]) {
    assert.equal(classifyUpdate(snapshots([name])), "manual-package-scope");
  }
  for (const mutate of [
    (input) => {
      delete input.before.devDependencies["@types/react"];
    },
    (input) => {
      delete input.after.devDependencies["@types/react"];
    },
    (input) => {
      input.after.scripts = { postinstall: "synthetic-untrusted-command" };
    },
    (input) => {
      input.after.dependencies.react = "19.3.2";
    },
    (input) => {
      input.afterLock.packages["node_modules/react"].version = "19.3.2";
    },
    (input) => {
      input.afterLock.packages["node_modules/new-transitive"] = { version: "1.0.0" };
    },
    (input) => {
      input.afterLock.packages["node_modules/@types/react"].hasInstallScript = true;
    },
    (input) => {
      input.afterLock.packages["node_modules/@types/react"].resolved =
        "https://untrusted.invalid/tool.tgz";
    },
    (input) => {
      input.afterLock.packages["node_modules/@types/react"].integrity = "not-integrity";
    },
    (input) => {
      input.afterLock.packages[""].devDependencies["@types/react"] = "19.3.9";
    },
    (input) => {
      input.afterLock.packages["node_modules/@types/react"].dependencies = { unexpected: "*" };
    },
    (input) => {
      input.afterLock.lockfileVersion = 2;
    },
  ]) {
    const input = snapshots();
    mutate(input);
    assert.notEqual(classifyUpdate(input), "patch-candidate-manual-merge");
  }
});

test("identity requires exact same-repository bot, base and complete verified commit/file scope", () => {
  const valid = metadata();
  assert.equal(identityReason(valid.pr, valid.commits, valid.files, revision("b")), null);
  for (const mutate of [
    (input) => {
      input.pr.user = { ...bot, id: 2 };
    },
    (input) => {
      input.pr.head.repo = { full_name: "outsider/portfolio", id: 2 };
    },
    (input) => {
      input.pr.base.ref = "main";
    },
    (input) => {
      input.pr.head.ref = "dependabot/github_actions/group";
    },
    (input) => {
      input.pr.draft = true;
    },
    (input) => {
      input.pr.commits = 2;
    },
    (input) => {
      input.commits.push(structuredClone(input.commits[0]));
      input.pr.commits = 2;
    },
    (input) => {
      input.commits[0].author = { login: "human", id: 3 };
    },
    (input) => {
      input.commits[0].commit.verification.verified = false;
    },
    (input) => {
      input.commits[0].sha = revision("d");
    },
    (input) => {
      input.pr.changed_files = 3;
    },
    (input) => {
      input.files[0].filename = ".github/workflows/ci.yml";
    },
    (input) => {
      input.files[0].status = "added";
    },
    (input) => {
      input.files[0].previous_filename = "other.json";
    },
  ]) {
    const input = structuredClone(valid);
    mutate(input);
    assert.notEqual(identityReason(input.pr, input.commits, input.files, revision("b")), null);
  }
  assert.notEqual(identityReason(valid.pr, valid.commits, valid.files, revision("d")), null);
});

function fakeApi(changeFinal = false) {
  const data = metadata();
  const input = snapshots();
  let reads = 0;
  const blob = (payload) => {
    const bytes = Buffer.from(JSON.stringify(payload));
    return {
      type: "file",
      encoding: "base64",
      size: bytes.length,
      sha: createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex"),
      content: bytes.toString("base64"),
    };
  };
  const values = {
    [revision("a")]: {
      "package.json": blob(input.after),
      "package-lock.json": blob(input.afterLock),
    },
    [revision("b")]: {
      "package.json": blob(input.before),
      "package-lock.json": blob(input.beforeLock),
    },
  };
  for (const file of data.files) file.sha = values[revision("a")][file.filename].sha;
  const paths = [];
  const api = async (path) => {
    paths.push(path);
    if (path.endsWith("/pulls/1")) {
      reads++;
      return changeFinal && reads > 1
        ? { ...data.pr, head: { ...data.pr.head, sha: revision("d") } }
        : data.pr;
    }
    if (path.includes("/commits?")) return data.commits;
    if (path.includes("/files?")) return data.files;
    if (path.endsWith("/git/ref/heads/develop")) return { object: { sha: revision("b") } };
    const ref = path.slice(-40);
    if (path.includes("/git/trees/"))
      return {
        truncated: false,
        tree: Object.entries(values[ref]).map(([path, value]) => ({
          path,
          sha: value.sha,
          mode: "100644",
          type: "blob",
        })),
      };
    return values[ref][path.includes("package-lock.json") ? "package-lock.json" : "package.json"];
  };
  return { api, paths };
}

test("read-only review uses identified base/head JSON snapshots, never workflow code or mutation", async () => {
  const { api, paths } = fakeApi();
  assert.equal(await reviewDependency(api, 1), "patch-candidate-manual-merge");
  assert.equal(paths.filter((path) => path.includes("/contents/")).length, 4);
  for (const path of paths.filter((path) => path.includes("/contents/")))
    assert.match(path, /\/contents\/package(?:-lock)?\.json\?ref=[ab]{40}$/);
  assert.ok(paths.every((path) => !/merge|check-runs|approvals|reviews/.test(path)));
});

test("head race and unavailable GitHub metadata never become candidates", async () => {
  assert.equal(await reviewDependency(fakeApi(true).api, 1), "manual-snapshot-changed");
  await assert.rejects(
    reviewDependency(async () => {
      throw Error("synthetic unavailable");
    }, 1),
  );
});

test("symlink/truncated trees, forged blob contents and stale base snapshots are rejected", async () => {
  for (const mutate of [
    (path, value) => {
      if (path.includes("/git/trees/")) value.tree[0].mode = "120000";
    },
    (path, value) => {
      if (path.includes("/git/trees/")) value.truncated = true;
    },
    (path, value) => {
      if (path.includes("/contents/")) value.content = Buffer.from("{}").toString("base64");
    },
    (path, value) => {
      if (path.includes("/contents/")) value.sha = revision("d");
    },
  ]) {
    const fixture = fakeApi();
    await assert.rejects(
      reviewDependency(async (path) => {
        const value = structuredClone(await fixture.api(path));
        mutate(path, value);
        return value;
      }, 1),
    );
  }
  const fixture = fakeApi();
  assert.equal(
    await reviewDependency(
      async (path) =>
        path.endsWith("/git/ref/heads/develop")
          ? { object: { sha: revision("d") } }
          : fixture.api(path),
      1,
    ),
    "manual-identity-or-base",
  );
});

function visibleProtection() {
  return {
    data: {
      repository: {
        ref: {
          branchProtectionRule: {
            requiresStatusChecks: true,
            requiresStrictStatusChecks: true,
            isAdminEnforced: true,
            allowsForcePushes: false,
            allowsDeletions: false,
            requiresConversationResolution: true,
            requiresApprovingReviews: true,
            requiredApprovingReviewCount: 0,
            requiredStatusChecks: ["Quality checks", "Branch policy"].map((context) => ({
              context,
              app: { databaseId: 15368 },
            })),
          },
        },
      },
    },
  };
}

test("workflow-token visibility probe reports manual state without any mutation or existing PR", async () => {
  const calls = [];
  const reader = createMetadataReader("synthetic-workflow-token", async (url, init) => {
    calls.push({ url, init });
    return Response.json(
      String(url).endsWith("/graphql")
        ? visibleProtection()
        : {
            full_name: "gonzalomartinperez/portfolio",
            allow_auto_merge: false,
          },
    );
  });
  assert.deepEqual(await inspectReadiness(reader), {
    status: "inspectable",
    automation: "manual",
    nativeAutoMergeEnabled: false,
    requiredApprovals: 0,
  });
  assert.equal(calls.length, 2);
  const graphql = calls.find((call) => call.url.endsWith("/graphql"));
  assert.equal(graphql.init.method, "POST");
  assert.equal(new Headers(graphql.init.headers).get("Content-Type"), "application/json");
  assert.match(JSON.parse(graphql.init.body).query, /^query\s/);
  assert.equal(calls.find((call) => !call.url.endsWith("/graphql")).init.method, "GET");
});

test("denied or incomplete protection metadata is blocked, never a permission escalation", async () => {
  for (const api of [
    async () => {
      throw Error("synthetic denied body must not escape");
    },
    async () => ({}),
    async (path) =>
      path === "/graphql"
        ? visibleProtection()
        : { full_name: "wrong/repo", allow_auto_merge: false },
  ]) {
    const result = await inspectReadiness(api);
    assert.equal(result.status, "blocked");
    assert.equal(result.automation, "manual");
    assert.ok(!JSON.stringify(result).includes("synthetic denied"));
  }
});

test("metadata transport rejects every arbitrary GraphQL body and off-repository path before fetch", async () => {
  const reader = createMetadataReader("synthetic", async () => {
    assert.fail("must not reach fetch");
  });
  for (const [path, body] of [
    [
      "/graphql",
      {
        query:
          'mutation { enablePullRequestAutoMerge(input:{pullRequestId:"synthetic"}){clientMutationId}}',
      },
    ],
    ["/graphql", { query: "query { viewer { login } }" }],
    ["/repos/gonzalomartinperez/portfolio/check-runs", { name: "synthetic-write" }],
    ["/repos/other/repo"],
  ])
    await assert.rejects(reader(path, body), /Unsupported metadata read/);
});

test("published workflow remains read-only and executes only trusted policy source", () => {
  const workflow = readFileSync(
    new URL("../.github/workflows/dependency-policy.yml", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(workflow, /:\s*write\b|pull_request\.head|npm (?:ci|install)|gh pr merge/);
  assert.match(workflow, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/);
  assert.match(workflow, /persist-credentials: false/);
  const config = readFileSync(new URL("../.github/dependabot.yml", import.meta.url), "utf8");
  assert.equal((config.match(/labels: \["dependencies:manual"\]/g) ?? []).length, 3);
  assert.equal((config.match(/rebase-strategy: auto/g) ?? []).length, 3);
  assert.match(config, /directory: \/tooling\/api-contract/);
});
