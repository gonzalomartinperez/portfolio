import { readdirSync, readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";

const codePattern = /\.(?:[cm]?js|jsx|tsx?)$/;
const nodeModules = new Set(builtinModules.map((name) => name.replace(/^node:/, "")));
const publicEntries = new Set([
  "solar-system/presentation/ambient-field.tsx",
  "solar-system/presentation/solar-explorer.tsx",
  "hero/presentation/hero-stage.tsx",
  "hero/domain/constellation.ts",
  "hero/presentation/static-constellation.tsx",
  "hero/presentation/tech-constellation.tsx",
  "architecture-diagrams/presentation/experience-architecture.tsx",
  "technology-catalogue/technology-catalogue.tsx",
  "tool-carousel/tool-carousel.tsx",
  "project-gallery/gallery-carousel.tsx",
  "assistant/presentation/assistant-host.tsx",
  "assistant/application/availability.ts",
]);

export function readArchitectureSources(root) {
  const sources = new Map();
  function visit(directory) {
    for (const entry of readdirSync(path.join(root, directory), { withFileTypes: true })) {
      const name = path.posix.join(directory, entry.name);
      if (entry.isDirectory()) visit(name);
      else
        sources.set(
          name,
          codePattern.test(name) ? readFileSync(path.join(root, name), "utf8") : null,
        );
    }
  }
  visit("src");
  for (const entry of readdirSync(path.join(root, "public"), {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isDirectory()) {
      const name = path
        .relative(root, path.join(entry.parentPath, entry.name))
        .split(path.sep)
        .join("/");
      sources.set(name, null);
    }
  }
  return sources;
}

function dependencies(source, file) {
  const ast = parse(source, {
    sourceType: "module",
    createImportExpressions: true,
    plugins: ["typescript", "jsx"],
    sourceFilename: file,
  });
  const imports = [];
  const effects = [];
  const environmentObjects = new Set([
    "window",
    "document",
    "localStorage",
    "sessionStorage",
    "navigator",
    "process",
  ]);
  const environmentCalls = new Set([
    "fetch",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "setTimeout",
    "setInterval",
  ]);
  function add(node, specifier, runtime) {
    if (specifier?.type !== "StringLiteral") {
      throw new Error(`${file}:${node.loc.start.line}: computed module imports cannot be audited`);
    }
    imports.push({ specifier: specifier.value, runtime, line: node.loc.start.line });
  }
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (
      (node.type === "MemberExpression" || node.type === "OptionalMemberExpression") &&
      node.object.type === "Identifier"
    ) {
      const object = node.object.name;
      const property = node.computed ? node.property.value : node.property.name;
      if (
        environmentObjects.has(object) ||
        ((object === "globalThis" || object === "global") &&
          (environmentObjects.has(property) || environmentCalls.has(property)))
      )
        effects.push({ name: `${object}.${property}`, line: node.loc.start.line });
    }
    if (
      (node.type === "CallExpression" || node.type === "NewExpression") &&
      node.callee.type === "Identifier" &&
      (environmentCalls.has(node.callee.name) ||
        ["WebSocket", "XMLHttpRequest", "EventSource", "Worker"].includes(node.callee.name))
    )
      effects.push({ name: node.callee.name, line: node.loc.start.line });
    if (node.type === "ImportDeclaration") {
      add(
        node,
        node.source,
        node.importKind !== "type" &&
          (node.specifiers.length === 0 ||
            node.specifiers.some((item) => item.importKind !== "type")),
      );
    } else if (
      (node.type === "ExportNamedDeclaration" || node.type === "ExportAllDeclaration") &&
      node.source
    ) {
      add(
        node,
        node.source,
        node.exportKind !== "type" &&
          (node.type === "ExportAllDeclaration" ||
            node.specifiers.length === 0 ||
            node.specifiers.some((item) => item.exportKind !== "type")),
      );
    } else if (node.type === "ImportExpression") {
      add(node, node.source, true);
    } else if (node.type === "TSImportType") {
      add(node, node.argument ?? node.source, false);
    } else if (
      node.type === "TSImportEqualsDeclaration" &&
      node.moduleReference.type === "TSExternalModuleReference"
    ) {
      add(node, node.moduleReference.expression, node.importKind !== "type");
    } else if (
      node.type === "CallExpression" &&
      node.callee.type === "Identifier" &&
      node.callee.name === "require"
    ) {
      add(node, node.arguments[0], true);
    }
    for (const [key, value] of Object.entries(node)) {
      if (["loc", "start", "end", "comments", "tokens"].includes(key)) continue;
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  }
  visit(ast.program);
  return {
    imports,
    effects,
    client: ast.program.directives.some((item) => item.value.value === "use client"),
  };
}

function resolveInternal(from, specifier, sources) {
  const base = specifier.startsWith("@/")
    ? `src/${specifier.slice(2)}`
    : path.posix.normalize(path.posix.join(path.posix.dirname(from), specifier));
  const candidates = [
    base,
    ...[".ts", ".tsx", ".d.ts", ".js", ".jsx", ".mjs", ".json"].map(
      (extension) => base + extension,
    ),
    ...[".ts", ".tsx", ".js", ".jsx"].map((extension) => `${base}/index${extension}`),
  ];
  return candidates.find((candidate) => sources.has(candidate));
}

const within = (file, directory) => file.startsWith(`${directory}/`);
const feature = (file) => file.match(/^src\/features\/([^/]+)\//)?.[1];

function boundaryViolation(from, to, specifier) {
  const sourceFeature = feature(from);
  const targetFeature = to && feature(to);
  if (
    to &&
    within(to, "src/contracts") &&
    !within(from, "src/contracts") &&
    !/^src\/features\/[^/]+\/adapters\//.test(from)
  )
    return "API contracts belong to feature adapters";
  if (to && within(to, "src/app") && !within(from, "src/app"))
    return "application composition cannot be imported by lower layers";
  if (to && within(to, "src/views") && !within(from, "src/app") && !within(from, "src/views"))
    return "views cannot be imported by lower layers";
  if (
    within(from, "src/content") &&
    specifier !== "server-only" &&
    (!to || (codePattern.test(to) && !within(to, "src/content")))
  )
    return "content must remain independent of rendering and features";
  if (
    (within(from, "src/lib") || within(from, "src/components/ui")) &&
    to &&
    ["src/content", "src/features", "src/shell", "src/views", "src/app"].some((directory) =>
      within(to, directory),
    )
  )
    return "shared utilities and UI cannot depend on product layers";
  if (
    within(from, "src/components") &&
    to &&
    ["src/features", "src/shell", "src/views", "src/app"].some((directory) => within(to, directory))
  )
    return "shared components cannot depend on composition or features";
  if (
    sourceFeature &&
    to &&
    ["src/shell", "src/views", "src/app"].some((directory) => within(to, directory))
  )
    return "features cannot depend on application composition";
  if (
    targetFeature &&
    sourceFeature !== targetFeature &&
    !publicEntries.has(to.slice("src/features/".length))
  )
    return "feature internals must be accessed through an explicit entry file";
  if (/^src\/features\/[^/]+\/domain\//.test(from)) {
    if (
      !to ||
      (!within(to, `src/features/${sourceFeature}/domain`) &&
        !(sourceFeature !== "assistant" && within(to, "src/content")))
    )
      return "domain modules cannot depend on outer layers or packages";
  }
  if (
    /^src\/features\/[^/]+\/application\//.test(from) &&
    (!to ||
      (!within(to, `src/features/${sourceFeature}/application`) &&
        !within(to, `src/features/${sourceFeature}/domain`)))
  )
    return "application depends only on its own ports and domain";
  if (
    /^src\/features\/[^/]+\/adapters\//.test(from) &&
    to &&
    (/^src\/features\/[^/]+\/presentation\//.test(to) ||
      within(to, "src/components") ||
      within(to, "src/views"))
  )
    return "feature adapters cannot depend on presentation";
  if (
    within(from, "src/features/assistant/presentation") &&
    to &&
    (within(to, "src/features/assistant/adapters") ||
      within(to, "src/contracts") ||
      (to === "src/features/assistant/entry.tsx" &&
        from !== "src/features/assistant/presentation/assistant-host.tsx"))
  )
    return "assistant presentation cannot depend on concrete transport composition";
  return null;
}

/** Audits repository-relative source text; null entries represent non-code assets. */
export function auditArchitecture(sources) {
  const violations = [];
  const modules = new Map();
  for (const [file, source] of sources) {
    if (!codePattern.test(file) || typeof source !== "string") continue;
    try {
      modules.set(file, dependencies(source, file));
    } catch (error) {
      violations.push(error.message);
    }
  }
  for (const [file, module] of modules) {
    if (
      /^src\/features\/[^/]+\/domain\//.test(file) ||
      /^src\/features\/[^/]+\/application\//.test(file)
    )
      for (const effect of module.effects)
        violations.push(
          `${file}:${effect.line}: inner logic cannot use environment I/O: ${effect.name}`,
        );
    for (const dependency of module.imports) {
      const internal =
        dependency.specifier.startsWith(".") || dependency.specifier.startsWith("@/");
      const target = internal ? resolveInternal(file, dependency.specifier, sources) : undefined;
      dependency.target = target;
      if (internal && !target)
        violations.push(
          `${file}:${dependency.line}: unresolved internal module ${dependency.specifier}`,
        );
      const reason = boundaryViolation(file, target, dependency.specifier);
      if (reason) violations.push(`${file}:${dependency.line}: ${reason}: ${dependency.specifier}`);
    }
  }
  const complete = new Set();
  const active = new Set();
  const stack = [];
  function visit(file) {
    if (active.has(file)) {
      violations.push(
        `Circular dependency: ${[...stack.slice(stack.indexOf(file)), file].join(" -> ")}`,
      );
      return;
    }
    if (complete.has(file)) return;
    active.add(file);
    stack.push(file);
    for (const dependency of modules.get(file).imports)
      if (modules.has(dependency.target)) visit(dependency.target);
    stack.pop();
    active.delete(file);
    complete.add(file);
  }
  for (const file of modules.keys()) visit(file);
  for (const [client, module] of modules) {
    if (!module.client) continue;
    const seen = new Set();
    function check(file, chain) {
      if (seen.has(file)) return;
      seen.add(file);
      for (const dependency of modules.get(file).imports) {
        if (!dependency.runtime) continue;
        const next = [...chain, dependency.specifier];
        if (
          dependency.specifier === "server-only" ||
          nodeModules.has(dependency.specifier.replace(/^node:/, ""))
        )
          violations.push(`Client runtime reaches a server-only dependency: ${next.join(" -> ")}`);
        if (modules.has(dependency.target)) check(dependency.target, next);
      }
    }
    check(client, [client]);
  }
  return [...new Set(violations)];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const violations = auditArchitecture(readArchitectureSources(process.cwd()));
  if (violations.length) {
    console.error(violations.join("\n"));
    process.exitCode = 1;
  } else console.log("Architecture boundaries and client/server dependencies verified.");
}
