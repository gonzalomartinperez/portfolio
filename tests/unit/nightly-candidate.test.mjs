import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { freezeCandidate, writeCandidateOutput } from "../../tools/nightly-candidate.mjs";

const source = "a".repeat(40);
const head = "b".repeat(40);
const tree = "c".repeat(40);
const event = "d".repeat(40);
const manual = {
  eventName: "workflow_dispatch",
  eventSha: event,
  candidateSha: source,
  candidateRef: "develop",
};
function fixture(overrides = {}) {
  const calls = [];
  const git = (args) => {
    calls.push(args);
    const command = args.join(" ");
    if (Object.hasOwn(overrides, command)) {
      const result = overrides[command];
      if (result instanceof Error) throw result;
      return result;
    }
    if (command === "rev-parse --is-shallow-repository") return "false";
    if (command === `rev-parse --verify --end-of-options ${source}^{commit}`) return source;
    if (command === `rev-parse --verify --end-of-options ${event}^{commit}`) return event;
    if (
      /^rev-parse --verify --end-of-options refs\/remotes\/origin\/(main|develop)\^\{commit\}$/.test(
        command,
      )
    )
      return head;
    if (
      command === `rev-parse --verify --end-of-options ${source}^{tree}` ||
      command === `rev-parse --verify --end-of-options ${event}^{tree}`
    )
      return tree;
    if (
      command === `merge-base --is-ancestor ${source} ${head}` ||
      command === `merge-base --is-ancestor ${event} ${head}`
    )
      return "";
    throw new Error(`Unexpected synthetic Git command: ${command}`);
  };
  return { git, calls };
}

test("manual candidates freeze an eligible exact commit, tree and permitted ref head", () => {
  const { git, calls } = fixture();
  assert.deepEqual(freezeCandidate(manual, git), {
    source_sha: source,
    source_tree: tree,
    ref_sha: head,
  });
  assert.ok(calls.some((args) => args.join(" ") === `merge-base --is-ancestor ${source} ${head}`));
  assert.equal(
    calls.filter((args) => args.includes("refs/remotes/origin/develop^{commit}")).length,
    1,
  );
});

test("scheduled and default manual runs freeze the event SHA instead of an advancing branch", () => {
  for (const eventName of ["schedule", "workflow_dispatch"]) {
    const { git } = fixture();
    assert.deepEqual(freezeCandidate({ eventName, eventSha: event }, git), {
      source_sha: event,
      source_tree: tree,
      ref_sha: head,
    });
  }
});

test("untrusted candidate inputs are rejected before any Git evaluation", () => {
  const invalid = [
    { candidateSha: "main" },
    { candidateSha: `${source}\n` },
    { eventSha: `${event}\n` },
    { candidateSha: source.slice(1) },
    { candidateSha: `${source}\nrun` },
    { candidateSha: "$(id)" },
    { candidateSha: "../main" },
    { candidateSha: "--help" },
    { candidateRef: "refs/heads/main" },
    { candidateRef: "main; id" },
    { candidateRef: "feature/test" },
    { eventSha: "" },
    { eventSha: `${event} ` },
    { eventName: "workflow_run" },
    { eventName: "pull_request_target" },
    { eventName: "schedule", candidateSha: source },
    { eventName: "schedule", candidateSha: "", candidateRef: "develop" },
  ];
  for (const change of invalid) {
    const { git, calls } = fixture();
    assert.throws(() => freezeCandidate({ ...manual, ...change }, git), /Nightly candidate/);
    assert.equal(calls.length, 0, JSON.stringify(change));
  }
});

test("shallow history, missing commits or refs and unreachable candidates fail closed", () => {
  for (const overrides of [
    { "rev-parse --is-shallow-repository": "true" },
    { "rev-parse --is-shallow-repository": "" },
    {
      [`rev-parse --verify --end-of-options ${source}^{commit}`]: new Error(
        "synthetic missing commit",
      ),
    },
    {
      "rev-parse --verify --end-of-options refs/remotes/origin/develop^{commit}": new Error(
        "synthetic missing ref",
      ),
    },
    { [`merge-base --is-ancestor ${source} ${head}`]: new Error("synthetic unreachable") },
    { [`rev-parse --verify --end-of-options ${source}^{tree}`]: "invalid-tree" },
    { [`rev-parse --verify --end-of-options ${source}^{commit}`]: head },
  ])
    assert.throws(() => freezeCandidate(manual, fixture(overrides).git), /Nightly candidate/);
});

test("Git failures do not disclose arbitrary child-process output", () => {
  const { git } = fixture({
    "rev-parse --is-shallow-repository": new Error("SYNTHETIC_PRIVATE_ERROR"),
  });
  assert.throws(
    () => freezeCandidate(manual, git),
    (error) => {
      assert.match(error.message, /Nightly candidate/);
      assert.ok(!error.message.includes("SYNTHETIC_PRIVATE_ERROR"));
      return true;
    },
  );
});

test("GitHub outputs contain only validated immutable public hashes", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "nightly-candidate-"));
  try {
    const output = path.join(directory, "output");
    writeCandidateOutput({ source_sha: source, source_tree: tree, ref_sha: head }, output);
    assert.equal(
      readFileSync(output, "utf8"),
      `source_sha=${source}\nsource_tree=${tree}\nref_sha=${head}\n`,
    );
    assert.throws(() =>
      writeCandidateOutput({ source_sha: "a\nINJECT=1", source_tree: tree, ref_sha: head }, output),
    );
    assert.throws(() =>
      writeCandidateOutput({ source_sha: source, source_tree: tree, ref_sha: head }, ""),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("actual Git history accepts an ancestor and rejects an unrelated candidate", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "portfolio-candidate-git-"));
  const git = (args) =>
    execFileSync("git", ["-c", "core.hooksPath=/dev/null", ...args], {
      cwd: directory,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  const commit = () =>
    git([
      "-c",
      "user.name=CI Fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "commit",
      "-m",
      "fixture",
    ]);
  try {
    git(["init", "--initial-branch=main"]);
    writeFileSync(path.join(directory, "fixture.txt"), "first");
    git(["add", "fixture.txt"]);
    commit();
    const first = git(["rev-parse", "HEAD"]);
    writeFileSync(path.join(directory, "fixture.txt"), "second");
    git(["add", "fixture.txt"]);
    commit();
    const tip = git(["rev-parse", "HEAD"]);
    git(["update-ref", "refs/remotes/origin/main", tip]);
    assert.deepEqual(
      freezeCandidate({ eventName: "workflow_dispatch", eventSha: tip, candidateSha: first }, git),
      {
        source_sha: first,
        source_tree: git(["rev-parse", `${first}^{tree}`]),
        ref_sha: tip,
      },
    );
    git(["checkout", "--orphan", "unrelated"]);
    git(["rm", "-f", "fixture.txt"]);
    writeFileSync(path.join(directory, "other.txt"), "unrelated");
    git(["add", "other.txt"]);
    commit();
    assert.throws(
      () =>
        freezeCandidate(
          {
            eventName: "workflow_dispatch",
            eventSha: tip,
            candidateSha: git(["rev-parse", "HEAD"]),
          },
          git,
        ),
      /reachable/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
