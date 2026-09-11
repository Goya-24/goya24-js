import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";
import { createGoya24 } from "@goya24/vue";
import type { MessengerOptions } from "@goya24/messenger";

// Client-only (the module registers it with `mode: "client"`): there is no
// page to put a frame on during server rendering.
export default defineNuxtPlugin((nuxtApp) => {
  const options = (useRuntimeConfig().public.goya24 ?? {}) as Partial<MessengerOptions>;
  if (!options.key) {
    console.warn(
      "@goya24/nuxt: no key. Set `goya24.key` in nuxt.config or NUXT_PUBLIC_GOYA24_KEY in the environment.",
    );
    return;
  }
  nuxtApp.vueApp.use(createGoya24(options as MessengerOptions));
});
