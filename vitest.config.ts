import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["tests/browser/**"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    pool: "forks",
    maxWorkers: 4,
    globals: false,
  },
});
