export default defineNuxtConfig({
  modules: ["@goya24/nuxt"],
  // The key comes from NUXT_PUBLIC_GOYA24_KEY in the environment.
  goya24: { locale: "fa" },
  compatibilityDate: "2025-01-01",
});
