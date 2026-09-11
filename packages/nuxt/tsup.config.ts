import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { module: "src/module.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    target: "es2020",
    external: ["@nuxt/kit", "@nuxt/schema", "nuxt"],
  },
  {
    // The plugin runs inside the Nuxt app, which bundles it itself; it only
    // needs to be plain JavaScript next to the module.
    entry: { "runtime/plugin": "src/runtime/plugin.ts" },
    format: ["esm"],
    sourcemap: true,
    target: "es2020",
    external: ["#app", "nuxt/app", "@goya24/vue", "@goya24/messenger", "vue"],
  },
]);
