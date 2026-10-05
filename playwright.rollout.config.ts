import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

export default defineConfig(config, {
  testDir: "./tests/rollout",
  projects: config.projects?.filter((project) =>
    ["desktop", "mobile"].includes(project.name ?? ""),
  ),
});
