import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

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

test("software licensing preserves the MIT text, metadata and separate content scope", () => {
  const license = read("LICENSE").replaceAll("\r\n", "\n").trim();
  const heading = /^MIT License\n\nCopyright \(c\) \d{4}(?:-\d{4})? [^\n]+\n\n/;
  assert.match(license, heading);
  const terms = license.replace(heading, "").replace(/\s+/g, " ");
  // The official MIT terms stay intact; scope and third-party notices belong outside LICENSE.
  assert.equal(
    createHash("sha256").update(terms).digest("hex"),
    "fe2a9817987f862eaced948f0468c7f51d2fedfc48c5c505b246a49a3870e9a5",
  );
  for (const directory of ["", "tooling/api-contract/"]) {
    const manifest = JSON.parse(read(`${directory}package.json`));
    const lock = JSON.parse(read(`${directory}package-lock.json`));
    assert.equal(manifest.license, "MIT", directory);
    assert.equal(lock.packages[""].license, manifest.license, directory);
    assert.equal(manifest.private, true, "Licensing does not authorize npm publication");
  }
  const readme = read("README.md");
  assert.match(readme, /^## Software license$/m);
  assert.match(readme, /\[MIT License\]\(LICENSE\)/);
  assert.match(readme, /\[content scope and third-party notices\]\(NOTICE\.md\)/);
  const notice = read("NOTICE.md");
  for (const section of [
    "Original software",
    "Personal content and media",
    "Third-party materials",
  ])
    assert.ok(notice.includes(`## ${section}`), section);
  for (const location of [
    "src/content/",
    "public/documents/",
    "public/brands/",
    "public/images/solar-system/",
    "docs/gallery/",
  ])
    assert.ok(notice.includes(location), location);
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
      const document = parseDocument(frontmatter[1], { uniqueKeys: true, version: "1.2" });
      assert.deepEqual(document.errors, [], `${file}: invalid YAML`);
      const fields = document.toJS({ maxAliasCount: 0 });
      assert.ok(fields && typeof fields === "object" && !Array.isArray(fields));
      assert.ok(
        fields["disable-model-invocation"] === undefined ||
          fields["disable-model-invocation"] === false,
        `${file}: task-based implicit selection must remain available`,
      );
      return ["name", "description"].map((field) => {
        const value = fields[field];
        assert.ok(typeof value === "string" && value.trim(), `${file}: missing ${field}`);
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

test("paired CI preserves enabled QA, disabled hosting and immutable browser runtimes", () => {
  const workflow = read(".github/workflows/ci.yml");
  const jobs = new Map(
    [
      ...workflow.matchAll(/^ {2}([a-z][a-z-]*):\n([\s\S]*?)(?=^ {2}[a-z][a-z-]*:|$(?![\s\S]))/gm),
    ].map(([, id, body]) => [id, body]),
  );
  const browser = jobs.get("browser");
  const hosting = jobs.get("hosting");
  assert.match(workflow, /ASSISTANT_ENABLED: "true"/);
  assert.match(workflow, /ANALYTICS_ENABLED: "true"/);
  assert.match(hosting, /ASSISTANT_ENABLED: "false"/);
  assert.match(hosting, /ANALYTICS_ENABLED: "false"/);
  assert.match(hosting, /node-version: 24\.6\.0/);
  assert.match(hosting, /glibc 2\.28/);
  assert.match(hosting, /if \(!b\.isWasm\)/);
  assert.match(hosting, /npm run test:smoke/);
  assert.match(read(".github/workflows/branch-policy.yml"), /name: Branch policy/);
  assert.match(read("playwright.config.ts"), /workers: 1,/);
  assert.match(read("playwright.config.ts"), /failOnFlakyTests: Boolean\(process\.env\.CI\)/);
  const version = JSON.parse(read("package.json")).devDependencies["@playwright/test"];
  const image = browser.match(
    /image: mcr\.microsoft\.com\/playwright:v([^\s]+)-noble@sha256:([a-f0-9]{64})/,
  );
  assert.ok(image);
  assert.equal(image[1], version);
  assert.match(browser, /options: --init --ipc=host/);
  assert.match(browser, /node scripts\/check-browser-runtime\.mjs/);
  assert.doesNotMatch(browser, /playwright install|--privileged|SYS_ADMIN|npm run (check|build)/);
  assert.match(browser, /--test-list=\.artifacts\/ci\/shards\/\$\{\{ matrix\.shard \}\}\.txt/);
});

test("consumers verify same-run archives before extraction and never rebuild", () => {
  for (const file of ["ci.yml", "nightly.yml"]) {
    const workflow = read(`.github/workflows/${file}`);
    assert.match(workflow, /defaults:\n {2}run:\n {4}shell: bash/);
    assert.match(workflow, /tar --exclude=\.next\/cache -cf - \.next \.artifacts\/ci \| gzip -1/);
    assert.match(workflow, /compression-level: 0/);
    const jobs = [
      ...workflow.matchAll(/^ {2}([a-z][a-z-]*):\n([\s\S]*?)(?=^ {2}[a-z][a-z-]*:|$(?![\s\S]))/gm),
    ];
    for (const [, id, body] of jobs) {
      if (!body.includes("actions/download-artifact@")) continue;
      assert.match(
        body,
        /CI_ARTIFACT_SHA256: \$\{\{ needs\.(build|quality)\.outputs\.archive_sha256 \}\}/,
      );
      assert.ok(body.indexOf("ci-build-provenance.mjs verify") < body.indexOf("tar -xzf"), id);
      assert.ok(body.indexOf("tar -xzf") < body.indexOf("ci-build-artifact.mjs restore"), id);
      assert.doesNotMatch(body, /run-id:|repository:|github-token:|npm run (check|build)/);
    }
  }
});

test("architecture enforcement remains in the mandatory development check", () => {
  const manifest = JSON.parse(read("package.json"));
  assert.match(manifest.scripts["check:quality"], /^npm run test:architecture && /);
  assert.equal(
    manifest.scripts.check,
    "npm run check:quality && npm run build && npm run test:budget",
  );
  assert.equal(
    manifest.scripts["test:architecture"],
    "node --test scripts/architecture.test.mjs && node scripts/architecture.mjs",
  );
  assert.match(read(".github/workflows/ci.yml"), /run: npm run check/);
});

test("direct toolchain versions are reproducible and aligned with the lockfile", () => {
  const manifest = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));
  for (const group of ["dependencies", "devDependencies"]) {
    assert.deepEqual(manifest[group], lock.packages[""][group]);
    for (const [name, version] of Object.entries(manifest[group])) {
      assert.match(version, /^\d+\.\d+\.\d+$/, `Pin a stable exact version: ${name}`);
      assert.equal(lock.packages[`node_modules/${name}`].version, version, name);
    }
  }
  assert.match(read(".nvmrc").trim(), /^\d+\.\d+\.\d+$/);
  assert.match(manifest.packageManager, /^npm@\d+\.\d+\.\d+$/);
});

test("module aliases remain supported by the architecture resolver", () => {
  const config = JSON.parse(read("tsconfig.json"));
  assert.deepEqual(
    config.compilerOptions.paths,
    { "@/*": ["./src/*"] },
    "Extend architecture resolution and its negative fixtures before adding aliases",
  );
  assert.equal(
    config.extends,
    undefined,
    "Inherited compiler aliases need explicit architecture support",
  );
});

test("source and build scans retain verified tooling and normalized transfers", () => {
  const workflow = read(".github/workflows/ci.yml");
  const secrets = workflow.split("  secrets:")[1].split("  quality:")[0];
  const build = workflow.split("  build:")[1].split("  hosting:")[0];
  for (const body of [secrets, build]) {
    assert.match(body, /fetch-depth: 0/);
    assert.match(body, /gitleaks\/releases\/download\/v8\.30\.1/);
    assert.match(body, /sha256sum --check --status/);
  }
  assert.match(secrets, /run: npm run test:secrets\n/);
  assert.match(build, /run: npm run test:secrets:artifacts\n/);
  assert.ok(
    build.indexOf("ci-build-artifact.mjs prepare") <
      build.indexOf("npm run test:secrets:artifacts"),
  );
  assert.ok(
    build.indexOf("npm run test:secrets:artifacts") <
      build.indexOf("ci-build-provenance.mjs create"),
  );
  const commands = JSON.parse(read("package.json")).scripts;
  assert.equal(
    commands["test:secrets"],
    "node --test scripts/secret-scan.test.mjs && node scripts/secret-scan.mjs",
  );
  assert.equal(commands["test:secrets:artifacts"], "node scripts/secret-scan.mjs --artifacts");
});
