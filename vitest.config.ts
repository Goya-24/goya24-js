import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (name: string, entry = "index.ts") =>
  fileURLToPath(new URL(`./packages/${name}/src/${entry}`, import.meta.url));

export default defineConfig({
  // Packages resolve each other from source in tests, not from a build.
  resolve: {
    alias: {
      "@goya24/messenger": src("messenger"),
      "@goya24/vue": src("vue"),
      "@goya24/react": src("react", "index.tsx"),
    },
  },
  test: {
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "**/vitest.setup.ts", "packages/nuxt/src/runtime/**"],
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
});
