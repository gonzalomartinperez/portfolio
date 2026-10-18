import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { auditArchitecture, readArchitectureSources } from "../../tools/architecture.mjs";

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
      "src/features/solar-system/adapters/texture-versions.ts":
        'import "server-only"; import manifest from "../../../../public/manifest.json" with { type: "json" }; export default manifest;',
      "public/manifest.json": null,
      "src/features/assistant/adapters/api.ts":
        'import type { Api } from "@contracts/assistant-api/types"; import type { Port } from "../application/ports"; export type Http = Api & Port;',
      "contracts/assistant-api/types.d.ts": "export type Api = { id: string };",
      "src/features/assistant/application/ports.ts":
        'import type { Message } from "../domain/models"; export type Port = { value: Message };',
      "src/features/assistant/domain/models.ts": "export type Message = { content: string };",
    }),
    [],
  );
});

test("relative, alias, re-export and import type edges enforce content boundaries", () => {
  for (const declaration of [
    'import type { Value } from "../src/shared/editorial/value";',
    'export type { Value } from "@/shared/editorial/value";',
    'export type Value = import("@/shared/editorial/value").Value;',
    'const value = import("@/shared/editorial/value");',
  ])
    rejects(
      {
        "content/about-copy.ts": declaration,
        "src/shared/editorial/value.ts": "export type Value = string;",
      },
      /content and configuration must remain independent/,
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
      "src/features/assistant/domain/value.ts": 'import type { Locale } from "@config/locales";',
      "config/locales.ts": 'export type Locale = "en";',
    },
    /domain modules cannot depend/,
  );
});

test("assistant contracts and transport remain adapter implementation details", () => {
  rejects(
    {
      "src/features/assistant/presentation/chat.ts":
        'import type { Response } from "@contracts/assistant-api/types";',
      "contracts/assistant-api/types.d.ts": "export type Response = string;",
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

test("registered importless modules, framework adapters and owned root resources pass", () => {
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
      "config/locales.ts": 'export type Locale = "en" | "es";',
      "contracts/assistant-api/types.d.ts": "export interface Api { id: string }",
      "media/identity/portrait.avif": null,
      "public/technology-illustrations.svg": null,
    }),
    [],
  );
});

test("shared UI stays neutral and adapters cannot consume relocated shared presentation", () => {
  for (const [target, specifier] of [
    ["config/locales.ts", "@config/locales"],
    ["content/technologies.ts", "@content/technologies"],
  ])
    rejects(
      {
        "src/shared/ui/button.tsx": `import type { Value } from "${specifier}";`,
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
        'import type { Technology } from "@content/technologies"; export type Mark = Technology;',
      "content/technologies.ts":
        "export type Technology = { id: string }; export const compare = () => 0;",
      "src/features/tool-carousel/domain/rows.ts":
        'import { compare } from "@content/technologies";',
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

test("root data and media registries reject unrelated resources", () => {
  for (const file of [
    "content/unreviewed.json",
    "contracts/assistant-api/unreviewed.schema.json",
    "media/identity/unreviewed.png",
  ])
    rejects({ [file]: null }, /unregistered module placement/);
  assert.deepEqual(
    audit({
      "content/cv-public.json": null,
      "contracts/assistant-api/product-event.schema.json": null,
      "media/identity/avatar.png": null,
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

test("parity aliases resolve root inputs, resources and generated adapter types", () => {
  assert.deepEqual(
    audit({
      "src/views/example.tsx":
        'import { copy } from "@content/about-copy"; import { site } from "@config/site"; import portrait from "@media/identity/portrait.avif"; export const View = [copy, site, portrait];',
      "content/about-copy.ts":
        'import type { Locale } from "@config/locales"; export const copy: Locale = "en";',
      "config/locales.ts": 'export type Locale = "en";',
      "config/site.ts":
        'import documents from "@content/public-documents.json"; export const site = documents;',
      "content/public-documents.json": null,
      "media/identity/portrait.avif": null,
      "src/features/assistant/adapters/api.ts":
        'import type { Api } from "@contracts/assistant-api/types"; export type Response = Api;',
      "contracts/assistant-api/types.d.ts": "export type Api = { id: string };",
    }),
    [],
  );
});

test("parity rejects unregistered importless code and resources in root namespaces", () => {
  for (const file of [
    "content/unregistered.ts",
    "content/unregistered.json",
    "config/unregistered.ts",
    "config/unregistered.json",
    "contracts/unregistered.d.ts",
    "contracts/assistant-api/unregistered.json",
    "media/identity/unregistered.png",
    "media/identity/policy.ts",
    "media/identity/policy.mjs",
  ])
    rejects(
      { [file]: file.endsWith(".ts") ? "export {};" : null },
      /unregistered module placement/,
    );
  rejects(
    { "media/identity/avatar.png": "export const disguised = true;" },
    /media contains resources only/,
  );
});

test("parity rejects every removed source root including previously frozen inputs", () => {
  for (const file of [
    "src/content/types.ts",
    "src/content/cv-public.json",
    "src/content/locales.ts",
    "src/contracts/types.d.ts",
    "src/contracts/source.json",
    "src/assets/avatar.png",
  ])
    rejects(
      { [file]: file.endsWith(".ts") ? "export {};" : null },
      /unregistered module placement/,
    );
});

test("parity rejects root contracts outside concrete adapters including erased imports", () => {
  for (const from of [
    "src/app/page.tsx",
    "src/shared/editorial/example.tsx",
    "src/features/assistant/domain/models.ts",
    "src/features/assistant/presentation/example.tsx",
  ]) {
    rejects(
      {
        [from]:
          'import type { Api } from "@contracts/assistant-api/types"; export type Model = Api;',
        "contracts/assistant-api/types.d.ts": "export type Api = string;",
      },
      /API contracts belong to feature adapters/,
    );
  }
});

test("parity root aliases retain transitive client leaks, type erasure and cycles", () => {
  rejects(
    {
      "src/shell/example.tsx": '"use client"; export { value } from "@content/about-copy";',
      "content/about-copy.ts": 'export { value } from "@config/site";',
      "config/site.ts": 'import "server-only"; export const value = 1;',
    },
    /Client runtime reaches a server-only dependency/,
  );
  rejects(
    {
      "src/shell/example.tsx": '"use client"; export { value } from "@content/about-copy";',
      "content/about-copy.ts": 'export { value } from "@config/site";',
      "config/site.ts":
        'import { readFileSync } from "node:fs"; export const value = readFileSync;',
    },
    /Client runtime reaches a server-only dependency/,
  );
  assert.deepEqual(
    audit({
      "src/shell/example.tsx":
        '"use client"; import type { Value } from "@content/types"; export type Props = Value;',
      "content/types.ts": 'import "server-only"; export type Value = string;',
    }),
    [],
  );
  rejects(
    {
      "content/about-copy.ts":
        'import type { Value } from "@config/site"; export type Copy = Value;',
      "config/site.ts":
        'import type { Copy } from "@content/about-copy"; export type Value = Copy;',
    },
    /Circular dependency/,
  );
});

test("parity content and config retain rendering independence and shared neutrality", () => {
  for (const from of ["content/about-copy.ts", "config/site.ts"])
    rejects(
      {
        [from]: 'export { Value } from "@/shared/ui/example";',
        "src/shared/ui/example.tsx": "export const Value = 1;",
      },
      /content and configuration must remain independent/,
    );
  for (const declaration of [
    'import type { Site } from "@config/site";',
    'export { site } from "@config/site";',
  ])
    rejects(
      {
        "src/shared/identity/example.tsx": declaration,
        "config/site.ts": "export type Site = string; export const site = 1;",
      },
      /only neutral content types/,
    );
});

test("parity source aliases and relative imports cannot reach tools or tests", () => {
  for (const specifier of [
    "../../tools/example.mjs",
    "../../tests/helpers/example.ts",
    "@/../tools/example.mjs",
    "@content/../tests/helpers/example.ts",
  ])
    rejects({ "src/app/page.tsx": `import "${specifier}";` }, /cannot import tools or tests/);
  rejects(
    {
      "src/app/page.tsx": 'import "@config/missing";',
    },
    /unresolved internal module/,
  );
});

test("parity texture data has a narrow server composition boundary", () => {
  const sources = {
    "src/app/layout.tsx":
      'import { solarTextureVersions } from "@/features/solar-system/texture-data"; export default solarTextureVersions;',
    "src/features/solar-system/texture-data.ts":
      'import "server-only"; export { solarTextureVersions } from "./adapters/texture-versions";',
    "src/features/solar-system/adapters/texture-versions.ts":
      'import "server-only"; import type { Versions } from "../domain/texture-contract"; import { version } from "@config/solar-textures"; export const solarTextureVersions: Versions = { earth: version };',
    "src/features/solar-system/domain/texture-contract.ts":
      "export type Versions = Record<string, string>;",
    "config/solar-textures.ts": 'export const version = "synthetic";',
  };
  assert.deepEqual(audit(sources), []);
  rejects(
    {
      ...sources,
      "src/shell/example.tsx": '"use client"; import "@/features/solar-system/texture-data";',
    },
    /Client runtime reaches a server-only dependency/,
  );
  rejects(
    {
      ...sources,
      "src/views/example.tsx": 'import "@/features/solar-system/adapters/texture-versions";',
    },
    /explicit entry file/,
  );
});

test("parity filesystem inventory includes every owned root and resource", () => {
  const root = mkdtempSync(path.join(tmpdir(), "portfolio-architecture-roots-"));
  const files = [
    "src/app/page.tsx",
    "content/about-copy.ts",
    "config/locales.ts",
    "contracts/assistant-api/types.d.ts",
    "contracts/assistant-api/source.json",
    "media/identity/avatar.png",
    "public/manifest.json",
  ];
  try {
    for (const file of files) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      writeFileSync(
        path.join(root, file),
        file.endsWith(".ts") || file.endsWith(".tsx") ? "export {};" : "resource",
      );
    }
    const sources = readArchitectureSources(root);
    assert.deepEqual([...sources.keys()].sort(), files.toSorted());
    assert.equal(sources.get("media/identity/avatar.png"), null);
    assert.equal(sources.get("contracts/assistant-api/source.json"), null);
    assert.equal(sources.get("contracts/assistant-api/types.d.ts"), "export {};");
    assert.deepEqual(auditArchitecture(sources), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("parity bare content alias retains server boundaries and missing-target errors", () => {
  rejects(
    {
      "src/shell/example.tsx": '"use client"; export { value } from "@content";',
      "content/index.ts": 'import "server-only"; export const value = 1;',
    },
    /Client runtime reaches a server-only dependency/,
  );
  rejects(
    {
      "src/views/example.tsx": 'import { value } from "@content"; export const View = value;',
    },
    /unresolved internal module @content/,
  );
  assert.deepEqual(
    audit({
      "src/views/example.tsx": 'import { value } from "@content"; export const View = value;',
      "content/index.ts": 'import "server-only"; export const value = 1;',
    }),
    [],
  );
});
