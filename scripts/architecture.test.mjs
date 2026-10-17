import assert from "node:assert/strict";
import test from "node:test";
import { auditArchitecture } from "./architecture.mjs";

const audit = (sources) => auditArchitecture(new Map(Object.entries(sources)));
const rejects = (sources, reason) => assert.match(audit(sources).join("\n"), reason);

test("analytics exposes composition entries while its concrete delivery stays private", () => {
  assert.deepEqual(
    audit({
      "src/app/layout.tsx":
        'import { AnalyticsHost } from "@/features/analytics/entry"; export const Host = AnalyticsHost;',
      "src/features/analytics/entry.tsx": '"use client"; export const AnalyticsHost = () => null;',
    }),
    [],
  );
  rejects(
    {
      "src/shell/header.tsx": 'export { send } from "@/features/analytics/adapters/http";',
      "src/features/analytics/adapters/http.ts": "export const send = 1;",
    },
    /explicit entry file/,
  );
  rejects(
    {
      "src/features/analytics/application/visits.ts": 'export { send } from "../adapters/http";',
      "src/features/analytics/adapters/http.ts": "export const send = 1;",
    },
    /own ports and domain/,
  );
  rejects(
    {
      "src/features/analytics/entry.tsx":
        '"use client"; import { endpoint } from "./config"; export default endpoint;',
      "src/features/analytics/config.ts":
        'import "server-only"; export const endpoint = "synthetic";',
    },
    /server-only/,
  );
});

test("legitimate composition, independent domain, adapters and resource imports pass", () => {
  assert.deepEqual(
    audit({
      "src/app/page.tsx": 'import { View } from "@/views/home"; export default View;',
      "src/views/home.tsx": 'export { Hero } from "@/features/hero/presentation/hero-stage";',
      "src/features/hero/presentation/hero-stage.tsx":
        '"use client"; import { orbit } from "../domain/orbit"; export const Hero = () => <div>{orbit}</div>;',
      "src/features/hero/domain/orbit.ts": "export const orbit = 1;",
      "src/content/textures.ts":
        'import "server-only"; import manifest from "../../public/manifest.json" with { type: "json" }; export default manifest;',
      "public/manifest.json": null,
      "src/features/assistant/adapters/api.ts":
        'import type { Api } from "@/contracts/api"; import type { Port } from "../application/ports"; export type Http = Api & Port;',
      "src/contracts/api.ts": "export type Api = { id: string };",
      "src/features/assistant/application/ports.ts":
        'import type { Message } from "../domain/models"; export type Port = { value: Message };',
      "src/features/assistant/domain/models.ts": "export type Message = { content: string };",
    }),
    [],
  );
});

test("relative, alias, re-export and import type edges enforce content boundaries", () => {
  for (const declaration of [
    'import type { Value } from "../components/value";',
    'export type { Value } from "@/components/value";',
    'export type Value = import("@/components/value").Value;',
    'const value = import("@/components/value");',
  ])
    rejects(
      {
        "src/content/example.ts": declaration,
        "src/components/value.ts": "export type Value = string;",
      },
      /content must remain independent/,
    );
});

test("private feature modules cannot be imported through aliases or relative paths", () => {
  for (const specifier of ["@/features/hero/domain/orbit", "../features/hero/domain/orbit"]) {
    rejects(
      {
        "src/views/home.ts": `export * from "${specifier}";`,
        "src/features/hero/domain/orbit.ts": "export const orbit = 1;",
      },
      /explicit entry file/,
    );
  }
});

test("domain and assistant application dependencies point inward", () => {
  rejects(
    { "src/features/hero/domain/value.ts": 'import type { CSSProperties } from "react";' },
    /domain modules cannot depend/,
  );
  rejects(
    {
      "src/features/assistant/application/controller.ts":
        'import { adapter } from "../adapters/api";',
      "src/features/assistant/adapters/api.ts": "export const adapter = 1;",
    },
    /own ports and domain/,
  );
  rejects(
    {
      "src/features/assistant/domain/value.ts": 'import type { Locale } from "@/content/locales";',
      "src/content/locales.ts": 'export type Locale = "en";',
    },
    /domain modules cannot depend/,
  );
});

test("assistant contracts and transport remain adapter implementation details", () => {
  rejects(
    {
      "src/features/assistant/presentation/chat.ts":
        'import type { Response } from "@/contracts/api";',
      "src/contracts/api.ts": "export type Response = string;",
    },
    /contracts belong to feature adapters/,
  );
  rejects(
    {
      "src/features/assistant/presentation/chat.ts": 'import { api } from "../adapters/api";',
      "src/features/assistant/adapters/api.ts": "export const api = 1;",
    },
    /presentation cannot depend/,
  );
  rejects(
    {
      "src/features/assistant/adapters/api.ts": 'import { chat } from "../presentation/chat";',
      "src/features/assistant/presentation/chat.ts": "export const chat = 1;",
    },
    /adapters cannot depend/,
  );
});

test("shared utilities, generic components and features do not import composition", () => {
  for (const from of [
    "src/lib/value.ts",
    "src/components/ui/value.ts",
    "src/components/value.ts",
    "src/features/tool-carousel/value.ts",
  ]) {
    rejects(
      {
        [from]: 'import { header } from "@/shell/header";',
        "src/shell/header.ts": "export const header = 1;",
      },
      /cannot depend/,
    );
    rejects(
      { [from]: 'import { page } from "@/app/page";', "src/app/page.ts": "export const page = 1;" },
      /composition cannot be imported/,
    );
    rejects(
      {
        [from]: 'import { view } from "@/views/home";',
        "src/views/home.ts": "export const view = 1;",
      },
      /views cannot be imported/,
    );
  }
});

test("runtime and type-only dependency cycles are reported", () => {
  for (const type of ["", "type "])
    rejects(
      {
        "src/features/hero/domain/a.ts": `import ${type}{ B } from "./b"; export type A = string;`,
        "src/features/hero/domain/b.ts": `import ${type}{ A } from "./a"; export type B = string;`,
      },
      /Circular dependency: .*a\.ts.*b\.ts.*a\.ts/,
    );
});

test("client reachability catches transitive server markers and Node imports", () => {
  for (const dependency of ["server-only", "node:fs", "fs/promises"])
    rejects(
      {
        "src/components/client.ts": '"use client"; import { helper } from "./helper";',
        "src/components/helper.ts": `import "${dependency}"; export const helper = 1;`,
      },
      /Client runtime reaches a server-only dependency:.*client\.ts.*helper.*(?:server-only|fs)/,
    );
});

test("client traversal ignores type-only imports, including named specifiers and import types", () => {
  for (const declaration of [
    'import type { Value } from "./server";',
    'import { type Value } from "./server";',
    'export type { Value } from "./server";',
    'type Value = import("./server").Value;',
  ]) {
    assert.deepEqual(
      audit({
        "src/components/client.ts": `"use client"; ${declaration}`,
        "src/components/server.ts":
          'import "server-only"; import "node:fs"; export type Value = string;',
      }),
      [],
    );
  }
});

test("dynamic imports participate in client reachability", () => {
  rejects(
    {
      "src/components/client.ts": '"use client"; const load = () => import("./server");',
      "src/components/server.ts": 'import "server-only";',
    },
    /Client runtime reaches/,
  );
});

test("computed imports, unresolved imports and malformed modules fail closed", () => {
  rejects(
    { "src/components/client.ts": 'const file = "./server"; import(file);' },
    /computed module imports cannot be audited/,
  );
  rejects({ "src/components/client.ts": 'import "./missing";' }, /unresolved internal module/);
  assert.ok(audit({ "src/components/client.ts": "export const = ;" }).length > 0);
});

test("assistant host alone may compose the lazy feature entry", () => {
  const entry = "export default function Assistant() { return null; }";
  assert.deepEqual(
    audit({
      "src/features/assistant/presentation/assistant-host.tsx":
        '"use client"; const load = () => import("../entry");',
      "src/features/assistant/entry.tsx": entry,
    }),
    [],
  );
  rejects(
    {
      "src/features/assistant/presentation/chat.tsx": 'const load = () => import("../entry");',
      "src/features/assistant/entry.tsx": entry,
    },
    /concrete transport composition/,
  );
});

test("empty named re-exports retain their runtime side effects", () => {
  rejects(
    {
      "src/components/client.ts": '"use client"; export {} from "./server";',
      "src/components/server.ts": 'import "server-only";',
    },
    /Client runtime reaches/,
  );
});

test("rendering adapters cannot depend on their own presentation", () => {
  rejects(
    {
      "src/features/solar-system/adapters/engine.ts":
        'import { Canvas } from "../presentation/canvas";',
      "src/features/solar-system/presentation/canvas.ts": "export const Canvas = 1;",
    },
    /adapters cannot depend on presentation/,
  );
});

test("inner logic keeps direct environment I/O behind its ports", () => {
  for (const source of [
    'export const run = () => fetch("https://example.com");',
    'export const value = document.querySelector("body");',
    'export const token = localStorage.getItem("key");',
    'export const run = () => globalThis["fetch"]("https://example.com");',
    "export const value = process.env.PRIVATE;",
  ])
    rejects({ "src/features/assistant/application/value.ts": source }, /environment I\/O/);
  assert.deepEqual(
    audit({
      "src/features/hero/domain/value.ts":
        'export const value = { document: "text", fetch: "label" };',
    }),
    [],
  );
});

test("alternative module extensions cannot hide layer or client/server violations", () => {
  for (const extension of ["mts", "cts", "mjs", "cjs"]) {
    rejects(
      {
        "src/features/hero/domain/value.ts": `import "./opaque.${extension}";`,
        [`src/features/hero/domain/opaque.${extension}`]: 'import "react";',
      },
      /domain modules cannot depend/,
    );
    rejects(
      {
        "src/components/client.ts": `"use client"; import "./opaque.${extension}";`,
        [`src/components/opaque.${extension}`]: 'import "server-only";',
      },
      /Client runtime reaches/,
    );
  }
});
