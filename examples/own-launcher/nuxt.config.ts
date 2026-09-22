export default defineNuxtConfig({
  modules: ["@goya24/nuxt"],
  goya24: {
    // The key comes from NUXT_PUBLIC_GOYA24_KEY in the environment.
    locale: "fa",
    // No bubble of ours: this site draws its own, and opens the panel with
    // open(). Nothing is placed in the corner and, while the messenger is
    // shut, it takes no space and no clicks anywhere on the page.
    launcher: false,
    // The open panel would still sit in that corner — on top of the close
    // button below. This lifts it clear: the button's 56px plus the 24px it
    // keeps from the bottom edge. A button under our frame cannot be clicked.
    padding: { y: 104 },
  },
  compatibilityDate: "2025-01-01",
});
