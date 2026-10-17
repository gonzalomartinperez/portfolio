import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const repository = "gonzalomartinperez/portfolio";
const botId = 49699333;
const patchTools = new Set(["@types/react", "@types/react-dom"]);
const shaPattern = /^[a-f0-9]{40}$/;
const plain = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const bot = (user) => user?.login === "dependabot[bot]" && user?.id === botId;
const version = (value) =>
  typeof value === "string" && /^[1-9]\d*\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)
    ? value.split(".").map(Number)
    : null;

function omitTools(value, names) {
  if (!plain(value)) return null;
  return Object.fromEntries(Object.entries(value).filter(([name]) => !names.includes(name)));
}

/** A candidate still needs the separate protection, review and exact-head CI gates. */
export function classifyUpdate({ before, after, beforeLock, afterLock }) {
  if (![before, after, beforeLock, afterLock].every(plain)) return "manual-invalid-json";
  if (!plain(before.devDependencies) || !plain(after.devDependencies))
    return "manual-invalid-manifest";
  const names = [
    ...new Set([...Object.keys(before.devDependencies), ...Object.keys(after.devDependencies)]),
  ].filter((name) => before.devDependencies[name] !== after.devDependencies[name]);
  if (!names.length || names.some((name) => !patchTools.has(name))) return "manual-package-scope";
  for (const name of names) {
    const oldVersion = version(before.devDependencies[name]);
    const newVersion = version(after.devDependencies[name]);
    if (
      !oldVersion ||
      !newVersion ||
      ![...oldVersion, ...newVersion].every(Number.isSafeInteger) ||
      Object.hasOwn(before.dependencies ?? {}, name) ||
      Object.hasOwn(after.dependencies ?? {}, name) ||
      oldVersion[0] !== newVersion[0] ||
      oldVersion[1] !== newVersion[1] ||
      oldVersion[2] >= newVersion[2]
    )
      return "manual-not-stable-patch";
  }
  if (
    !isDeepStrictEqual(
      { ...before, devDependencies: omitTools(before.devDependencies, names) },
      { ...after, devDependencies: omitTools(after.devDependencies, names) },
    )
  )
    return "manual-manifest-scope";
  if (
    beforeLock.lockfileVersion !== 3 ||
    afterLock.lockfileVersion !== 3 ||
    !plain(beforeLock.packages) ||
    !plain(afterLock.packages)
  )
    return "manual-lock-format";
  const oldPackages = beforeLock.packages;
  const newPackages = afterLock.packages;
  if (
    !plain(oldPackages[""]) ||
    !plain(newPackages[""]) ||
    !isDeepStrictEqual(oldPackages[""].devDependencies, before.devDependencies) ||
    !isDeepStrictEqual(newPackages[""].devDependencies, after.devDependencies) ||
    !isDeepStrictEqual(oldPackages[""].dependencies, before.dependencies) ||
    !isDeepStrictEqual(newPackages[""].dependencies, after.dependencies)
  )
    return "manual-lock-root";
  const reviewedOld = structuredClone(beforeLock);
  const reviewedNew = structuredClone(afterLock);
  reviewedOld.packages[""].devDependencies = omitTools(before.devDependencies, names);
  reviewedNew.packages[""].devDependencies = omitTools(after.devDependencies, names);
  for (const name of names) {
    const path = `node_modules/${name}`;
    const oldEntry = oldPackages[path];
    const newEntry = newPackages[path];
    if (
      !plain(oldEntry) ||
      !plain(newEntry) ||
      oldEntry.dev !== true ||
      newEntry.dev !== true ||
      oldEntry.version !== before.devDependencies[name] ||
      newEntry.version !== after.devDependencies[name] ||
      newEntry.hasInstallScript ||
      newEntry.link ||
      newEntry.resolved !==
        `https://registry.npmjs.org/${name}/-/${name.split("/").at(-1)}-${newEntry.version}.tgz` ||
      !/^sha512-[A-Za-z0-9+/]{86}==$/.test(newEntry.integrity ?? "")
    )
      return "manual-package-lock";
    reviewedOld.packages[path] = omitTools(oldEntry, ["version", "resolved", "integrity"]);
    reviewedNew.packages[path] = omitTools(newEntry, ["version", "resolved", "integrity"]);
  }
  return isDeepStrictEqual(reviewedOld, reviewedNew)
    ? "patch-candidate-manual-merge"
    : "manual-transitive-or-lock-change";
}

export function identityReason(pr, commits, files, currentBase) {
  if (
    pr?.state !== "open" ||
    pr.draft ||
    !bot(pr.user) ||
    pr.base?.ref !== "develop" ||
    pr.base?.repo?.full_name !== repository ||
    pr.head?.repo?.full_name !== repository ||
    pr.head?.repo?.id !== pr.base?.repo?.id ||
    !/^dependabot\/npm_and_yarn\/[A-Za-z0-9._/-]+$/.test(pr.head?.ref ?? "") ||
    !shaPattern.test(pr.head?.sha ?? "") ||
    !shaPattern.test(pr.base?.sha ?? "") ||
    currentBase !== pr.base.sha
  )
    return "manual-identity-or-base";
  if (
    !Array.isArray(commits) ||
    commits.length !== 1 ||
    pr.commits !== commits.length ||
    !bot(commits[0]?.author) ||
    commits[0]?.sha !== pr.head.sha ||
    commits[0]?.commit?.verification?.verified !== true ||
    commits[0]?.commit?.verification?.reason !== "valid"
  )
    return "manual-commit-history";
  if (
    !Array.isArray(files) ||
    files.length !== 2 ||
    pr.changed_files !== files.length ||
    !["package.json", "package-lock.json"].every((path) =>
      files.some(
        (file) =>
          file.filename === path &&
          file.status === "modified" &&
          !file.previous_filename &&
          shaPattern.test(file.sha ?? ""),
      ),
    )
  )
    return "manual-file-scope";
  return null;
}

/** Read only GitHub metadata and JSON blobs; never install or execute PR code. */
export async function reviewDependency(api, number) {
  const root = `/repos/${repository}`;
  const pr = await api(`${root}/pulls/${number}`);
  const [commits, files, branch] = await Promise.all([
    api(`${root}/pulls/${number}/commits?per_page=100`),
    api(`${root}/pulls/${number}/files?per_page=100`),
    api(`${root}/git/ref/heads/develop`),
  ]);
  const reason = identityReason(pr, commits, files, branch?.object?.sha);
  if (reason) return reason;
  const trees = new Map();
  const read = async (ref, path) => {
    if (!trees.has(ref)) trees.set(ref, api(`${root}/git/trees/${ref}`));
    const tree = await trees.get(ref);
    const entries = tree?.tree?.filter((entry) => entry.path === path);
    if (
      tree?.truncated !== false ||
      entries?.length !== 1 ||
      entries[0].mode !== "100644" ||
      entries[0].type !== "blob"
    )
      throw new Error("Unsupported snapshot mode");
    const value = await api(`${root}/contents/${path}?ref=${ref}`);
    if (
      value?.type !== "file" ||
      value.encoding !== "base64" ||
      !Number.isSafeInteger(value.size) ||
      value.size < 1 ||
      value.size > 1_000_000 ||
      !shaPattern.test(value.sha ?? "") ||
      typeof value.content !== "string"
    )
      throw new Error("Unsupported JSON snapshot");
    const bytes = Buffer.from(value.content, "base64");
    const blobHash = createHash("sha1")
      .update(`blob ${bytes.length}\0`)
      .update(bytes)
      .digest("hex");
    const headFile = files.find((file) => file.filename === path);
    if (
      bytes.length !== value.size ||
      value.sha !== entries[0].sha ||
      value.sha !== blobHash ||
      (ref === pr.head.sha && headFile?.sha !== blobHash)
    )
      throw new Error("Incomplete JSON snapshot");
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  };
  const [before, after, beforeLock, afterLock] = await Promise.all([
    read(pr.base.sha, "package.json"),
    read(pr.head.sha, "package.json"),
    read(pr.base.sha, "package-lock.json"),
    read(pr.head.sha, "package-lock.json"),
  ]);
  const decision = classifyUpdate({ before, after, beforeLock, afterLock });
  const [fresh, freshBranch] = await Promise.all([
    api(`${root}/pulls/${number}`),
    api(`${root}/git/ref/heads/develop`),
  ]);
  if (
    fresh?.head?.sha !== pr.head.sha ||
    fresh?.base?.sha !== pr.base.sha ||
    identityReason(fresh, commits, files, freshBranch?.object?.sha)
  )
    return "manual-snapshot-changed";
  return decision;
}

const protectionQuery = `query { repository(owner:"gonzalomartinperez",name:"portfolio") {
  ref(qualifiedName:"refs/heads/develop") { branchProtectionRule {
    requiresStatusChecks requiresStrictStatusChecks isAdminEnforced allowsForcePushes allowsDeletions
    requiresApprovingReviews requiredApprovingReviewCount requiresConversationResolution
    requiredStatusChecks { context app { databaseId } }
  }}
}}`;

/** Visibility probe only; it neither changes protection nor enables automation. */
export async function inspectReadiness(api) {
  try {
    const [settings, metadata] = await Promise.all([
      api(`/repos/${repository}`),
      api("/graphql", { query: protectionQuery }),
    ]);
    const rule = metadata?.data?.repository?.ref?.branchProtectionRule;
    if (
      settings?.full_name !== repository ||
      typeof settings.allow_auto_merge !== "boolean" ||
      rule?.requiresStatusChecks !== true ||
      rule.requiresStrictStatusChecks !== true ||
      rule.isAdminEnforced !== true ||
      rule.allowsForcePushes !== false ||
      rule.allowsDeletions !== false ||
      rule.requiresConversationResolution !== true ||
      rule.requiresApprovingReviews !== true ||
      !Number.isSafeInteger(rule.requiredApprovingReviewCount) ||
      rule.requiredApprovingReviewCount < 0 ||
      !Array.isArray(rule.requiredStatusChecks) ||
      !["Quality checks", "Branch policy"].every((name) =>
        rule.requiredStatusChecks.some(
          (check) => check.context === name && check.app?.databaseId === 15368,
        ),
      )
    )
      return { status: "blocked", automation: "manual", reason: "protection-not-confirmed" };
    return {
      status: "inspectable",
      automation: "manual",
      nativeAutoMergeEnabled: settings.allow_auto_merge,
      requiredApprovals: rule.requiredApprovingReviewCount,
    };
  } catch {
    return {
      status: "blocked",
      automation: "manual",
      reason: "workflow-token-cannot-inspect-protection",
    };
  }
}

/** Only GET metadata or a fixed GraphQL query is allowed; mutation is not a capability. */
export function createMetadataReader(token, request = fetch) {
  return async (path, body) => {
    if (
      body
        ? path !== "/graphql" || body.query !== protectionQuery
        : !(path === `/repos/${repository}` || path.startsWith(`/repos/${repository}/`))
    )
      throw new Error("Unsupported metadata read");
    const response = await request(`https://api.github.com${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      method: body ? "POST" : "GET",
      ...(body ? { body: JSON.stringify(body) } : {}),
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error("GitHub metadata unavailable");
    const value = await response.json();
    if (value.errors) throw new Error("GitHub rejected metadata query");
    return value;
  };
}

async function main() {
  if (process.env.GITHUB_REPOSITORY !== repository) throw new Error("Unexpected repository");
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  if (!process.env.GITHUB_TOKEN) throw new Error("Missing workflow token");
  const api = createMetadataReader(process.env.GITHUB_TOKEN);
  if (event.inputs?.mode === "inspect" || process.env.DEPENDENCY_INSPECT === "true") {
    console.log(JSON.stringify(await inspectReadiness(api)));
    return;
  }
  const number = Number(event.pull_request?.number ?? event.inputs?.number);
  if (!Number.isSafeInteger(number) || number < 1) throw new Error("Invalid pull request number");
  console.log(await reviewDependency(api, number));
  console.log("Manual policy: no merge, approval, label or repository setting is changed.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    console.error("Dependency assessment unavailable; manual review required.");
    process.exitCode = 1;
  });
}
