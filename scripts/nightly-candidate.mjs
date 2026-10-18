import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const fullSha = /^[a-f0-9]{40}$/i;
const invalid = (message) => new Error(`Nightly candidate: ${message}`);
const isSha = (value) => typeof value === "string" && fullSha.test(value);

/** Resolve one permitted source without following an advancing branch after preparation. */
export function freezeCandidate(
  { eventName, eventSha, candidateSha = "", candidateRef = "main" },
  git,
) {
  if (!["schedule", "workflow_dispatch"].includes(eventName)) throw invalid("unsupported event");
  if (!isSha(eventSha)) throw invalid("event SHA must be a full commit hash");
  const ref = candidateRef || "main";
  if (!["main", "develop"].includes(ref)) throw invalid("ref must be main or develop");
  if (candidateSha !== "" && !isSha(candidateSha))
    throw invalid("source must be a full commit hash");
  if (eventName === "schedule" && (candidateSha !== "" || ref !== "main"))
    throw invalid("scheduled runs must use their default-branch event source");
  const source = (candidateSha || eventSha).toLowerCase();
  let shallow, commit, refSha, tree;
  try {
    shallow = git(["rev-parse", "--is-shallow-repository"]);
    if (shallow !== "false") throw invalid("complete history is required");
    commit = git(["rev-parse", "--verify", "--end-of-options", `${source}^{commit}`]);
    refSha = git([
      "rev-parse",
      "--verify",
      "--end-of-options",
      `refs/remotes/origin/${ref}^{commit}`,
    ]);
    if (commit !== source || !isSha(refSha)) throw invalid("source or permitted ref is invalid");
    git(["merge-base", "--is-ancestor", source, refSha]);
    tree = git(["rev-parse", "--verify", "--end-of-options", `${source}^{tree}`]);
    if (!isSha(tree)) throw invalid("source tree is invalid");
  } catch {
    // Child-process output may contain local paths or configuration; report no raw Git stderr.
    throw invalid("source must exist in complete history and be reachable from the permitted ref");
  }
  return { source_sha: source, source_tree: tree, ref_sha: refSha };
}

export function writeCandidateOutput(candidate, outputFile) {
  if (!outputFile || ![candidate.source_sha, candidate.source_tree, candidate.ref_sha].every(isSha))
    throw invalid("validated hashes and GitHub output path are required");
  appendFileSync(
    outputFile,
    ["source_sha", "source_tree", "ref_sha"].map((key) => `${key}=${candidate[key]}\n`).join(""),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const candidate = freezeCandidate(
      {
        eventName: process.env.GITHUB_EVENT_NAME,
        eventSha: process.env.GITHUB_SHA,
        candidateSha: process.env.INPUT_CANDIDATE_SHA || "",
        candidateRef: process.env.INPUT_CANDIDATE_REF || "main",
      },
      (args) =>
        execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim(),
    );
    writeCandidateOutput(candidate, process.env.GITHUB_OUTPUT);
    console.log(`Nightly source frozen at ${candidate.source_sha}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
