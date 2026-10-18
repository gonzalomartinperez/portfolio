import { existsSync, readdirSync, readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";
import {
  isNeutralShared,
  isSharedPresentation,
  placementViolation,
  publicEntries,
} from "./architecture-policy.mjs";

const codePattern = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const nodeModules = new Set(builtinModules.map((name) => name.replace(/^node:/, "")));

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
  for (const directory of ["src", "content", "config", "contracts", "media", "public"])
    if (existsSync(path.join(root, directory))) visit(directory);
  return sources;
}

const functionNodes = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
  "ObjectMethod",
  "ClassMethod",
  "ClassPrivateMethod",
]);
const lexicalNodes = new Set([
  "BlockStatement",
  "CatchClause",
  "ForStatement",
  "ForInStatement",
  "ForOfStatement",
  "SwitchStatement",
  "StaticBlock",
  "ClassDeclaration",
  "ClassExpression",
]);
function childNodes(node) {
  const children = [];
  for (const [key, value] of Object.entries(node)) {
    if (["loc", "start", "end", "comments", "tokens"].includes(key)) continue;
    if (Array.isArray(value)) children.push(...value);
    else if (value && typeof value === "object") children.push(value);
  }
  return children;
}
const memberName = (node) => {
  if (!node.computed) return node.property.name;
  if (["StringLiteral", "NumericLiteral"].includes(node.property.type))
    return String(node.property.value);
  if (node.property.type === "TemplateLiteral" && !node.property.expressions.length)
    return node.property.quasis[0].value.cooked;
  return "*";
};

/** Lexical declarations distinguish injected ports from ambient globals, including hoisted names. */
function lexicalScopes(program) {
  const scopes = new WeakMap();
  const declarations = new WeakMap();
  function bind(pattern, scope, init = null, suffix = [], initScope = scope, defaults = []) {
    if (!pattern) return [];
    if (pattern.type === "Identifier") {
      const binding = { scope: initScope, init, suffix, defaults };
      scope.bindings.set(pattern.name, binding);
      return [pattern];
    }
    if (pattern.type === "AssignmentPattern")
      return init
        ? bind(pattern.left, scope, init, suffix, initScope, [
            ...defaults,
            { init: pattern.right, scope: initScope, suffix: [] },
          ])
        : bind(pattern.left, scope, pattern.right, [], initScope, defaults);
    if (pattern.type === "TSParameterProperty")
      return bind(pattern.parameter, scope, init, suffix, initScope, defaults);
    if (pattern.type === "RestElement") return bind(pattern.argument, scope);
    if (pattern.type === "ObjectPattern")
      return pattern.properties.flatMap((property) => {
        if (property.type === "RestElement") return bind(property.argument, scope);
        const key = property.computed
          ? (property.key.value ?? "*")
          : (property.key.name ?? String(property.key.value));
        return bind(property.value, scope, init, [...suffix, key], initScope, defaults);
      });
    if (pattern.type === "ArrayPattern")
      return pattern.elements.flatMap((item) => bind(item, scope));
    return [];
  }
  function visit(node, parent) {
    if (!node || typeof node !== "object" || !node.type) return;
    if (["FunctionDeclaration", "ClassDeclaration"].includes(node.type)) bind(node.id, parent);
    const isFunction = functionNodes.has(node.type);
    const scope =
      node.type === "Program" || isFunction || lexicalNodes.has(node.type)
        ? { parent, function: isFunction || node.type === "Program", bindings: new Map() }
        : parent;
    scopes.set(node, scope);
    if (isFunction) {
      bind(node.id, scope);
      for (const parameter of node.params) bind(parameter, scope);
    }
    if (["ClassDeclaration", "ClassExpression"].includes(node.type)) bind(node.id, scope);
    if (node.type === "CatchClause") bind(node.param, scope);
    if (node.type === "VariableDeclaration") {
      let target = scope;
      if (node.kind === "var") while (!target.function) target = target.parent;
      for (const declaration of node.declarations)
        declarations.set(declaration, bind(declaration.id, target, declaration.init, [], scope));
    }
    if (node.type === "ImportDeclaration" && node.importKind !== "type")
      for (const specifier of node.specifiers)
        if (specifier.importKind !== "type") bind(specifier.local, scope);
    for (const child of childNodes(node)) visit(child, scope);
  }
  visit(program, null);
  return { scopes, declarations };
}

function bindingFor(scope, name) {
  for (let current = scope; current; current = current.parent)
    if (current.bindings.has(name)) return current.bindings.get(name);
  return null;
}

// Follow static initializer aliases; reassignment and reflection are outside this source policy.
function clockPath(node, scope, seen = new Set()) {
  if (!node) return null;
  if (
    [
      "TSAsExpression",
      "TSTypeAssertion",
      "TSNonNullExpression",
      "ParenthesizedExpression",
    ].includes(node.type)
  )
    return clockPath(node.expression, scope, seen);
  if (node.type === "Identifier") {
    const binding = bindingFor(scope, node.name);
    if (!binding)
      return ["Date", "performance", "globalThis", "global"].includes(node.name)
        ? [node.name]
        : null;
    if (!binding.init || seen.has(binding)) return null;
    const next = new Set(seen).add(binding);
    const origins = [binding, ...binding.defaults].map((origin) => {
      const base = clockPath(origin.init, origin.scope, next);
      return base && [...base, ...origin.suffix];
    });
    return (
      origins.find((parts) => ["Date", "performance"].includes(ambientPath(parts)?.[0])) ??
      origins.find(Boolean) ??
      null
    );
  }
  if (["MemberExpression", "OptionalMemberExpression"].includes(node.type)) {
    const base = clockPath(node.object, scope, seen);
    return base && [...base, memberName(node)];
  }
  return null;
}
const ambientPath = (parts) =>
  parts && (["globalThis", "global"].includes(parts[0]) ? parts.slice(1) : parts);
const readsClock = (parts) =>
  parts && (parts[0] === "performance" || (parts[0] === "Date" && ["now", "*"].includes(parts[1])));

function dependencies(source, file) {
  const ast = parse(source, {
    sourceType: "module",
    createImportExpressions: true,
    plugins: ["typescript", "jsx"],
    sourceFilename: file,
  });
  const imports = [];
  const effects = [];
  const { scopes, declarations } = lexicalScopes(ast.program);
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
    const scope = scopes.get(node);
    const parts = ambientPath(clockPath(node, scope));
    if (["MemberExpression", "OptionalMemberExpression"].includes(node.type) && readsClock(parts))
      effects.push({ name: `ambient clock: ${parts.join(".")}`, line: node.loc.start.line });
    if (["CallExpression", "OptionalCallExpression", "NewExpression"].includes(node.type)) {
      const callee = ambientPath(clockPath(node.callee, scope));
      if (
        callee?.length === 1 &&
        callee[0] === "Date" &&
        (node.type !== "NewExpression" || node.arguments.length === 0)
      )
        effects.push({ name: "ambient clock: Date", line: node.loc.start.line });
    }
    if (node.type === "VariableDeclarator")
      for (const name of declarations.get(node) ?? []) {
        const alias = ambientPath(clockPath(name, scope));
        if (readsClock(alias))
          effects.push({ name: `ambient clock: ${alias.join(".")}`, line: node.loc.start.line });
      }
    if (
      (node.type === "MemberExpression" || node.type === "OptionalMemberExpression") &&
      node.object.type === "Identifier"
    ) {
      const object = node.object.name;
      const property = node.computed ? node.property.value : node.property.name;
      if (
        (environmentObjects.has(object) && !bindingFor(scope, object)) ||
        ((object === "globalThis" || object === "global") &&
          !bindingFor(scope, object) &&
          (environmentObjects.has(property) || environmentCalls.has(property)))
      )
        effects.push({ name: `${object}.${property}`, line: node.loc.start.line });
    }
    if (
      (node.type === "CallExpression" || node.type === "NewExpression") &&
      node.callee.type === "Identifier" &&
      !bindingFor(scope, node.callee.name) &&
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

function internalBase(from, specifier) {
  if (specifier === "@content") return "content/index.ts";
  const aliases = {
    "@/": "src/",
    "@content/": "content/",
    "@config/": "config/",
    "@contracts/": "contracts/",
    "@media/": "media/",
  };
  const alias = Object.entries(aliases).find(([prefix]) => specifier.startsWith(prefix));
  return path.posix.normalize(
    alias
      ? `${alias[1]}${specifier.slice(alias[0].length)}`
      : path.posix.join(path.posix.dirname(from), specifier),
  );
}

function resolveInternal(from, specifier, sources) {
  const base = internalBase(from, specifier);
  const candidates = [
    base,
    ...[
      ".ts",
      ".tsx",
      ".mts",
      ".cts",
      ".d.ts",
      ".d.mts",
      ".d.cts",
      ".js",
      ".jsx",
      ".mjs",
      ".cjs",
      ".json",
    ].map((extension) => base + extension),
    ...[".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"].map(
      (extension) => `${base}/index${extension}`,
    ),
  ];
  return candidates.find((candidate) => sources.has(candidate));
}

const within = (file, directory) => file.startsWith(`${directory}/`);
const feature = (file) => file.match(/^src\/features\/([^/]+)\//)?.[1];

function boundaryViolation(from, to, specifier, runtime) {
  const sourceFeature = feature(from);
  const targetFeature = to && feature(to);
  if (
    to &&
    within(to, "contracts") &&
    !within(from, "contracts") &&
    !/^src\/features\/[^/]+\/adapters\//.test(from)
  )
    return "API contracts belong to feature adapters";
  if (to && within(to, "src/app") && !within(from, "src/app"))
    return "application composition cannot be imported by lower layers";
  if (to && within(to, "src/views") && !within(from, "src/app") && !within(from, "src/views"))
    return "views cannot be imported by lower layers";
  if (
    (within(from, "content") || within(from, "config")) &&
    specifier !== "server-only" &&
    (!to || (codePattern.test(to) && !within(to, "content") && !within(to, "config")))
  )
    return "content and configuration must remain independent of rendering and features";
  if (
    isNeutralShared(from) &&
    to &&
    ["content", "config", "media", "src/features", "src/shell", "src/views", "src/app"].some(
      (directory) => within(to, directory),
    )
  )
    return "shared utilities and UI cannot depend on product layers";
  if (
    to &&
    isSharedPresentation(to) &&
    (within(from, "src/shared/styles") ||
      within(from, "src/shared/motion") ||
      (within(from, "src/shared/ui") && !within(to, "src/shared/ui")))
  )
    return "neutral shared capabilities cannot depend on presentation";
  if (
    within(from, "src/shared") &&
    to &&
    (within(to, "content") || within(to, "config")) &&
    (runtime || !["config/locales.ts", "content/types.ts", "content/technologies.ts"].includes(to))
  )
    return "shared presentation accepts only neutral content types";
  if (
    within(from, "src/shared") &&
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
        !(sourceFeature !== "assistant" && (within(to, "content") || within(to, "config"))))
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
      isSharedPresentation(to) ||
      within(to, "src/views"))
  )
    return "feature adapters cannot depend on presentation";
  if (
    within(from, "src/features/assistant/presentation") &&
    to &&
    (within(to, "src/features/assistant/adapters") ||
      within(to, "contracts") ||
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
    const reason = placementViolation(file);
    if (reason) violations.push(`${file}: ${reason}`);
    if (file.startsWith("media/") && (codePattern.test(file) || typeof source === "string"))
      violations.push(`${file}: media contains resources only`);
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
        dependency.specifier.startsWith(".") ||
        /^@(?:\/|content(?:\/|$)|config\/|contracts\/|media\/)/.test(dependency.specifier);
      const target = internal ? resolveInternal(file, dependency.specifier, sources) : undefined;
      dependency.target = target;
      if (internal && !target)
        violations.push(
          `${file}:${dependency.line}: unresolved internal module ${dependency.specifier}`,
        );
      if (
        internal &&
        /^(?:tools|tooling|scripts|tests)\//.test(internalBase(file, dependency.specifier))
      )
        violations.push(
          `${file}:${dependency.line}: application modules cannot import tools or tests`,
        );
      const reason = boundaryViolation(file, target, dependency.specifier, dependency.runtime);
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
