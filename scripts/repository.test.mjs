import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => readFileSync(path.join(root, file), "utf8");
const files = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  {
    cwd: root,
    encoding: "utf8",
  },
)
  .split("\0")
  .filter((file) => file && existsSync(path.join(root, file)));

test("source text is valid UTF-8", () => {
  const decoder = new TextDecoder("utf-8", { fatal: true });
  for (const file of files.filter((name) => /\.(md|json|yml|yaml|mjs|ts|tsx|css)$/.test(name))) {
    assert.doesNotThrow(() => decoder.decode(readFileSync(path.join(root, file))), file);
  }
});

test("inline Markdown file links resolve", () => {
  for (const file of files.filter((name) => name.endsWith(".md"))) {
    for (const match of read(file).matchAll(/\]\(([^\s)]+)\)/g)) {
      const target = match[1].split("#")[0];
      if (!target || /^[a-z][a-z\d+.-]*:/i.test(target)) continue;
      assert.ok(
        existsSync(path.resolve(root, path.dirname(file), decodeURIComponent(target))),
        `${file}: missing ${target}`,
      );
    }
  }
});

test("Claude skill adapters match canonical metadata and targets", () => {
  const directories = (base) =>
    readdirSync(path.join(root, base), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  const names = directories(".agents/skills");
  assert.deepEqual(directories(".claude/skills"), names);
  for (const name of names) {
    const canonical = `.agents/skills/${name}/SKILL.md`;
    const adapter = `.claude/skills/${name}/SKILL.md`;
    const metadata = (file) => {
      const content = read(file).replaceAll("\r\n", "\n");
      const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
      assert.ok(frontmatter, `${file}: missing frontmatter`);
      return ["name", "description"].map((field) => {
        const value = frontmatter[1].match(new RegExp(`^${field}: (.+)$`, "m"))?.[1];
        assert.ok(value, `${file}: missing ${field}`);
        return value;
      });
    };
    assert.deepEqual(metadata(adapter), metadata(canonical), name);
    const target = read(adapter).match(/\]\(([^)]+\/SKILL\.md)\)/)?.[1];
    assert.ok(target, `${adapter}: missing canonical link`);
    assert.equal(
      realpathSync(path.resolve(root, path.dirname(adapter), target)),
      realpathSync(path.join(root, canonical)),
      name,
    );
  }
});

test("Next.js and SWC WASM versions agree with the lockfile", () => {
  const manifest = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));
  const next = manifest.dependencies.next;
  assert.match(next, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.devDependencies["@next/swc-wasm-nodejs"], next);
  assert.equal(lock.packages["node_modules/next"].version, next);
  assert.equal(lock.packages["node_modules/@next/swc-wasm-nodejs"].version, next);
  assert.deepEqual(lock.packages[""].dependencies, manifest.dependencies);
  assert.deepEqual(lock.packages[""].devDependencies, manifest.devDependencies);
});

test("CI isolates browser shards and fails the protected gate for incomplete verification", () => {
  const workflow = read(".github/workflows/ci.yml");
  const jobs = new Map(
    [
      ...workflow.matchAll(/^ {2}([a-z][a-z-]*):\n([\s\S]*?)(?=^ {2}[a-z][a-z-]*:|$(?![\s\S]))/gm),
    ].map(([, id, body]) => [id, body]),
  );
  for (const id of ["validate", "browser", "legacy-linux", "check"]) {
    assert.ok(jobs.has(id), `Missing verification job: ${id}`);
  }
  const development = jobs.get("validate");
  const browser = jobs.get("browser");
  const gate = jobs.get("check");
  assert.match(development, /name: Quality \(development\)/);
  assert.match(jobs.get("legacy-linux"), /name: Compatibility \(Hostinger \/ GLIBC 2\.28\)/);
  assert.match(gate, /name: Quality checks/);
  assert.match(read(".github/workflows/branch-policy.yml"), /name: Branch policy/);
  assert.match(browser, /needs: validate/);
  assert.match(browser, /fail-fast: false/);
  assert.match(browser, /shard: \[1, 2, 3, 4, 5, 6, 7, 8\]/);
  assert.match(browser, /npm run test:browser -- --shard=\$\{\{ matrix\.shard \}\}\/8/);
  assert.match(read("playwright.config.ts"), /workers: 1,/);
  assert.match(read("playwright.config.ts"), /failOnFlakyTests: Boolean\(process\.env\.CI\)/);
  assert.match(gate, /if: always\(\)/);
  assert.match(gate, /needs: \[validate, browser, legacy-linux\]/);
  for (const id of ["validate", "browser", "legacy-linux"]) {
    assert.match(gate, new RegExp(`needs\\.${id}\\.result`));
  }
  assert.match(
    gate,
    /test "\$RESULT" = success && test "\$BROWSER_RESULT" = success && test "\$LEGACY_RESULT" = success/,
  );
  assert.doesNotMatch(workflow, /continue-on-error:|pull_request_target:/);
});

test("browser shards reuse the same workflow's verified build without rebuilding", () => {
  const workflow = read(".github/workflows/ci.yml");
  const development = workflow.split("  validate:")[1].split("  browser:")[0];
  const browser = workflow.split("  browser:")[1].split("  legacy-linux:")[0];
  assert.match(development, /npm run check/);
  assert.match(development, /npm run test:rendered/);
  assert.match(
    development,
    /tar --exclude=\.next\/cache -cf - \.next \| gzip -1 > \/tmp\/portfolio-production-build\.tar\.gz/,
  );
  assert.match(development, /name: production-build/);
  assert.match(workflow, /defaults:\n {2}run:\n {4}shell: bash/);
  assert.match(development, /compression-level: 0/);
  assert.match(browser, /playwright install --with-deps chromium firefox webkit/);
  assert.match(browser, /actions\/download-artifact@[a-f0-9]{40}/);
  assert.match(browser, /name: production-build/);
  assert.doesNotMatch(browser, /run-id:|repository:|github-token:|npm run (check|build)/);
  assert.match(browser, /name: browser-verification-\$\{\{ matrix\.shard \}\}/);
});
