import assert from "node:assert/strict";
import test from "node:test";
import { auditArchitecture } from "./architecture.mjs";

const audit = (sources) => auditArchitecture(new Map(Object.entries(sources)));
const rejects = (sources, reason) => assert.match(audit(sources).join("\n"), reason);

test("flat feature code cannot escape the ownership and entrypoint contract", () => {
  for (const file of ["hidden.ts", "hidden.tsx", "hidden.mjs", "hidden.d.ts"]) {
    rejects(
      {
        "src/app/page.tsx": `import { value } from "@/features/${file}"; export default value;`,
        [`src/features/${file}`]: file.endsWith(".d.ts")
          ? "export declare const value: number;"
          : "export const value = 1;",
      },
      /owned feature directory/,
    );
  }
  assert.deepEqual(
    audit({
      "src/features/tool-carousel/presentation/tool-carousel.tsx":
        "export const Carousel = () => null;",
      "src/features/tool-carousel/presentation/readme.md": null,
    }),
    [],
  );
});

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
      "src/content/solar-textures.ts":
        'import "server-only"; import manifest from "../../public/manifest.json" with { type: "json" }; export default manifest;',
      "public/manifest.json": null,
      "src/features/assistant/adapters/api.ts":
        'import type { Api } from "@/contracts/types"; import type { Port } from "../application/ports"; export type Http = Api & Port;',
      "src/contracts/types.d.ts": "export type Api = { id: string };",
      "src/features/assistant/application/ports.ts":
        'import type { Message } from "../domain/models"; export type Port = { value: Message };',
      "src/features/assistant/domain/models.ts": "export type Message = { content: string };",
    }),
    [],
  );
});

test("relative, alias, re-export and import type edges enforce content boundaries", () => {
  for (const declaration of [
    'import type { Value } from "../shared/editorial/value";',
    'export type { Value } from "@/shared/editorial/value";',
    'export type Value = import("@/shared/editorial/value").Value;',
    'const value = import("@/shared/editorial/value");',
  ])
    rejects(
      {
        "src/content/example.ts": declaration,
        "src/shared/editorial/value.ts": "export type Value = string;",
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
        'import type { Response } from "@/contracts/types";',
      "src/contracts/types.d.ts": "export type Response = string;",
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
    "src/shared/styles/value.ts",
    "src/shared/ui/value.ts",
    "src/shared/editorial/value.ts",
    "src/features/tool-carousel/presentation/value.ts",
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
        "src/shared/editorial/client.ts": '"use client"; import { helper } from "./helper";',
        "src/shared/editorial/helper.ts": `import "${dependency}"; export const helper = 1;`,
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
        "src/shared/editorial/client.ts": `"use client"; ${declaration}`,
        "src/shared/editorial/server.ts":
          'import "server-only"; import "node:fs"; export type Value = string;',
      }),
      [],
    );
  }
});

test("dynamic imports participate in client reachability", () => {
  rejects(
    {
      "src/shared/editorial/client.ts": '"use client"; const load = () => import("./server");',
      "src/shared/editorial/server.ts": 'import "server-only";',
    },
    /Client runtime reaches/,
  );
});

test("computed imports, unresolved imports and malformed modules fail closed", () => {
  rejects(
    { "src/shared/editorial/client.ts": 'const file = "./server"; import(file);' },
    /computed module imports cannot be audited/,
  );
  rejects(
    { "src/shared/editorial/client.ts": 'import "./missing";' },
    /unresolved internal module/,
  );
  assert.ok(audit({ "src/shared/editorial/client.ts": "export const = ;" }).length > 0);
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
      "src/shared/editorial/client.ts": '"use client"; export {} from "./server";',
      "src/shared/editorial/server.ts": 'import "server-only";',
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
        "src/shared/editorial/client.ts": `"use client"; import "./opaque.${extension}";`,
        [`src/shared/editorial/opaque.${extension}`]: 'import "server-only";',
      },
      /Client runtime reaches/,
    );
  }
});

test("importless modules cannot bypass registered roots, features, layers or shared capabilities", () => {
  for (const extension of [
    "ts",
    "tsx",
    "mts",
    "cts",
    "js",
    "jsx",
    "mjs",
    "cjs",
    "d.ts",
    "d.mts",
    "d.cts",
  ]) {
    for (const file of [
      `src/unknown.${extension}`,
      `src/unknown/value.${extension}`,
      `src/features/unregistered/domain/value.${extension}`,
      `src/features/hero/services/value.${extension}`,
      `src/features/hero/opaque.${extension}`,
      `src/shared/misc/value.${extension}`,
      `src/assets/hidden.${extension}`,
      `src/content/hidden.${extension}`,
      `src/contracts/hidden.${extension}`,
    ])
      rejects({ [file]: "export {};" }, /unregistered module placement/);
  }
});

test("registered importless modules, framework adapters and exact resource exceptions pass", () => {
  assert.deepEqual(
    audit({
      "src/app/robots.ts": "export default function robots() { return {}; }",
      "src/views/example.tsx": "export const View = () => null;",
      "src/shell/example.tsx": "export const Shell = () => null;",
      "src/features/hero/domain/example.ts": "export const radius = 1;",
      "src/features/hero/presentation/example.tsx": "export const Scene = () => null;",
      "src/features/analytics/config.ts": 'import "server-only"; export const enabled = false;',
      "src/features/assistant/entry.tsx": "export default function Assistant() { return null; }",
      "src/shared/styles/cn.ts": "export const cn = () => '';",
      "src/shared/ui/button.tsx": "export const Button = () => null;",
      "src/content/locales.ts": 'export type Locale = "en" | "es";',
      "src/contracts/types.d.ts": "export interface Api { id: string }",
      "src/assets/portrait.avif": null,
      "public/technology-illustrations.svg": null,
    }),
    [],
  );
});

test("shared UI stays neutral and adapters cannot consume relocated shared presentation", () => {
  for (const target of ["src/content/locales.ts", "src/content/technologies.ts"])
    rejects(
      {
        "src/shared/ui/button.tsx": `import type { Value } from "@/${target.slice(4, -3)}";`,
        [target]: "export type Value = string;",
      },
      /shared utilities and UI cannot depend/,
    );
  rejects(
    {
      "src/features/hero/adapters/engine.ts":
        'import { Header } from "@/shared/editorial/page-header";',
      "src/shared/editorial/page-header.tsx": "export const Header = () => null;",
    },
    /adapters cannot depend on presentation/,
  );
  assert.deepEqual(
    audit({
      "src/shared/technology/technology-mark.tsx":
        'import type { Technology } from "@/content/technologies"; export type Mark = Technology;',
      "src/content/technologies.ts":
        "export type Technology = { id: string }; export const compare = () => 0;",
      "src/features/tool-carousel/domain/rows.ts":
        'import { compare } from "@/content/technologies";',
    }),
    [],
  );
});

test("inner clocks reject direct, computed, global and aliased ambient reads", () => {
  const sources = [
    "export const read = () => Date.now();",
    'export const read = () => Date["now"]();',
    "export const read = () => new Date();",
    "export const read = () => Date(123);",
    "export const read = () => performance.now();",
    'export const read = () => globalThis["performance"]["now"]();',
    'export const read = () => globalThis.Date["now"]();',
    "const clock = performance; export const read = () => clock.now();",
    "const { now: read } = Date; export { read };",
    "const { now } = performance; export const read = () => now();",
    "const Clock = Date; export const read = () => new Clock();",
    "const world = globalThis; export const read = () => world.performance.now();",
    "const { Date: Clock } = globalThis; export const read = () => Clock.now();",
    'const { now: read } = globalThis["Date"]; export { read };',
  ];
  for (const layer of ["domain", "application"])
    for (const source of sources)
      rejects({ [`src/features/analytics/${layer}/clock.ts`]: source }, /ambient clock/);
});

test("inner deterministic dates and injected clocks retain lexical binding semantics", () => {
  const sources = [
    "export const read = (nowMs: number) => new Date(nowMs).toISOString();",
    "export const read = (text: string) => Date.parse(text);",
    "export const read = () => Date.UTC(2026, 9, 18);",
    "export const read = (clock: { now(): number }) => clock.now();",
    "export function read(performance: { now(): number }) { return performance.now(); }",
    "export function read(Date: { now(): number }) { return Date.now(); }",
    "export const read = ({ performance }: { performance: { now(): number } }) => performance.now();",
    "export function read(globalThis: { performance: { now(): number } }) { return globalThis.performance.now(); }",
    "export function read(clock: { now(): number }) { const performance = clock; return performance.now(); }",
    "export const read = (Date: { now(): number }) => { const { now } = Date; return now(); };",
    "export const read = (clock: { now(): number }) => { { const Date = clock; Date.now(); } return 1; };",
    "export function read(clock: { now(): number }) { { const performance = clock; var get = performance.now; } return get(); }",
    "export function read() { try { return 1; } catch (Date) { return Date.now(); } }",
    "export function read(clock: { now(): number }) { for (const performance of [clock]) performance.now(); return 1; }",
    "export const labels = { Date: 'label', performance: 'label', now: 'label' };",
    "const { parse } = Date; export const read = (text: string) => parse(text);",
  ];
  for (const source of sources)
    assert.deepEqual(
      audit({
        "src/features/analytics/application/clock.ts": source,
      }),
      [],
      source,
    );
  rejects(
    {
      "src/features/analytics/application/clock.ts":
        "function local(Date: { now(): number }) { return Date.now(); } export const read = () => Date.now();",
    },
    /ambient clock/,
  );
});

test("default parameter and object binding clocks cannot disguise ambient aliases", () => {
  for (const source of [
    "export const read = (clock = performance) => clock.now();",
    "export const read = (Clock = Date) => new Clock();",
    "export const read = ({ Clock = Date } = {}) => new Clock();",
    "export const read = (options: object) => { const { Clock = Date } = options; return new Clock(); };",
  ])
    for (const layer of ["domain", "application"])
      rejects({ [`src/features/analytics/${layer}/clock.ts`]: source }, /ambient clock/);
  for (const source of [
    "export const read = (port: { now(): number }, clock = port) => clock.now();",
    "export const read = (timestamp: number, Clock = Date) => new Clock(timestamp);",
    "export const read = (port: { now(): number }, { clock = port } = {}) => clock.now();",
  ])
    assert.deepEqual(audit({ "src/features/analytics/application/clock.ts": source }), []);
});

test("non-code resources follow the same declared ownership as their consuming modules", () => {
  for (const file of [
    "src/unknown/settings.json",
    "src/shared/misc/data.json",
    "src/features/hero/services/settings.json",
  ])
    rejects({ [file]: null }, /unregistered module placement/);
  rejects(
    {
      "src/features/hero/presentation/example.ts":
        'import settings from "../services/settings.json";',
      "src/features/hero/services/settings.json": null,
    },
    /unregistered module placement/,
  );
  assert.deepEqual(
    audit({
      "src/features/hero/domain/settings.json": null,
      "src/features/hero/presentation/readme.md": null,
      "src/shared/identity/logo.svg": null,
    }),
    [],
  );
});

test("outer timing and server/client boundaries remain independent of inner purity", () => {
  assert.deepEqual(
    audit({
      "src/features/hero/adapters/timing.ts": "export const measure = () => performance.now();",
      "src/features/assistant/entry.tsx": "export const now = () => new Date().toISOString();",
      "src/features/analytics/entry.tsx": "export const measure = () => performance.now();",
    }),
    [],
  );
  rejects(
    {
      "src/features/tool-carousel/presentation/tool-carousel-client.tsx":
        '"use client"; import "./tool-carousel";',
      "src/features/tool-carousel/presentation/tool-carousel.tsx":
        'import "server-only"; export const Carousel = () => null;',
    },
    /Client runtime reaches/,
  );
});

test("frozen data and media exceptions do not grandfather unrelated resources", () => {
  for (const file of [
    "src/content/unreviewed.json",
    "src/contracts/unreviewed.schema.json",
    "src/assets/unreviewed.png",
  ])
    rejects({ [file]: null }, /unregistered module placement/);
  assert.deepEqual(
    audit({
      "src/content/cv-public.json": null,
      "src/contracts/product-event.schema.json": null,
      "src/assets/avatar.png": null,
    }),
    [],
  );
});

test("neutral shared helpers cannot invert into React presentation", () => {
  for (const from of ["src/shared/styles/cn.ts", "src/shared/motion/motion-state.ts"])
    rejects(
      {
        [from]: 'export { Button } from "@/shared/ui/button";',
        "src/shared/ui/button.tsx": "export const Button = () => null;",
      },
      /neutral shared capabilities cannot depend/,
    );
  assert.deepEqual(
    audit({
      "src/shared/ui/button.tsx":
        'import { cn } from "@/shared/styles/cn"; export const Button = cn;',
      "src/shared/styles/cn.ts": "export const cn = () => '';",
    }),
    [],
  );
});
