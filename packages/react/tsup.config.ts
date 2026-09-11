import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2020",
  external: ["react", "@goya24/messenger"],
  // Every export here touches the DOM, so the whole module is a client
  // module in the App Router; the directive has to be the first statement.
  banner: { js: '"use client";' },
});
