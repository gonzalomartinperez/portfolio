import { writeFileSync } from "node:fs";
import path from "node:path";

type Module = { identifier(): string; modules?: Iterable<Module> };
type Group = { chunks: Iterable<Chunk>; childrenIterable: Iterable<Group> };
type Chunk = { files: Iterable<string>; groupsIterable: Iterable<Group>; canBeInitial(): boolean };
type Compilation = {
  chunks: Iterable<Chunk>;
  chunkGraph: { getChunkModulesIterable(chunk: Chunk): Iterable<Module> };
};
type Compiler = {
  context: string;
  hooks: {
    done: { tap(name: string, callback: (value: { compilation: Compilation }) => void): void };
  };
};

function containsAssistant(module: Module): boolean {
  return (
    /[/\\]features[/\\]assistant[/\\]entry\.tsx(?:[?|]|$)/.test(module.identifier()) ||
    [...(module.modules ?? [])].some(containsAssistant)
  );
}

export class AssistantBudgetPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.done.tap("AssistantBudgetPlugin", ({ compilation }) => {
      const roots = [...compilation.chunks].filter((chunk) =>
        [...compilation.chunkGraph.getChunkModulesIterable(chunk)].some(containsAssistant),
      );
      const chunks = new Set(roots);
      const groups = new Set(roots.flatMap((chunk) => [...chunk.groupsIterable]));
      for (const group of groups) {
        for (const chunk of group.chunks) chunks.add(chunk);
        for (const child of group.childrenIterable) groups.add(child);
      }
      const files = [...new Set([...chunks].flatMap((chunk) => [...chunk.files]))].sort();
      writeFileSync(
        path.join(compiler.context, ".next", "assistant-budget.json"),
        `${JSON.stringify(
          {
            entry: "src/features/assistant/entry.tsx",
            roots: roots.length,
            initial: [...chunks].some((chunk) => chunk.canBeInitial()),
            css: files.filter((file) => file.endsWith(".css")),
            javascript: files.filter((file) => file.endsWith(".js")),
          },
          null,
          2,
        )}\n`,
      );
    });
  }
}
