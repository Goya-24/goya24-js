import { defineWorkspace } from "vitest/config";

// One `vitest run` at the root tests every package in its own environment,
// each inheriting the root config (the source aliases, the coverage rules).
export default defineWorkspace([
  {
    extends: "./vitest.config.ts",
    test: {
      name: "messenger",
      root: "packages/messenger",
      environment: "jsdom",
      include: ["src/**/*.test.ts"],
    },
  },
  {
    extends: "./vitest.config.ts",
    test: {
      name: "react",
      root: "packages/react",
      environment: "jsdom",
      include: ["src/**/*.test.tsx"],
      setupFiles: ["./vitest.setup.ts"],
    },
  },
  {
    extends: "./vitest.config.ts",
    test: {
      name: "vue",
      root: "packages/vue",
      environment: "jsdom",
      include: ["src/**/*.test.ts"],
    },
  },
  {
    extends: "./vitest.config.ts",
    test: {
      name: "nuxt",
      root: "packages/nuxt",
      environment: "node",
      include: ["src/**/*.test.ts"],
    },
  },
]);
