import { writeFileSync } from "node:fs";
import path from "node:path";

function containsSceneEntry(module) {
  if (/[/\\]hero[/\\]scene-runtime\.ts(?:\?|$)/.test(module.identifier())) return true;
  return module.modules ? [...module.modules].some(containsSceneEntry) : false;
}

// Follow chunk groups, including extracted vendors, instead of guessing minified filenames.
export class SceneBudgetPlugin {
  apply(compiler) {
    compiler.hooks.done.tap("SceneBudgetPlugin", ({ compilation }) => {
      const roots = [...compilation.chunks].filter((chunk) =>
        [...compilation.chunkGraph.getChunkModulesIterable(chunk)].some(containsSceneEntry),
      );
      const groups = new Set(roots.flatMap((chunk) => [...chunk.groupsIterable]));
      const chunks = new Set(roots);
      for (const group of groups) {
        for (const chunk of group.chunks) chunks.add(chunk);
        for (const child of group.childrenIterable) groups.add(child);
      }
      const files = [...new Set([...chunks].flatMap((chunk) => [...chunk.files]))]
        .filter((file) => file.endsWith(".js"))
        .sort();
      writeFileSync(
        path.join(compiler.context, ".next", "scene-budget.json"),
        `${JSON.stringify(
          {
            entry: "src/components/hero/scene-runtime.ts",
            roots: roots.length,
            initial: [...chunks].some((chunk) => chunk.canBeInitial()),
            files,
          },
          null,
          2,
        )}\n`,
      );
    });
  }
}
