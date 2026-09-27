import { defineNuxtPlugin, useRuntimeConfig } from "nuxt/app";
import { readonly, shallowRef } from "vue";
import { createGoya24, goya24Key, type Goya24 } from "@goya24/vue";
import type { MessengerOptions, MessengerState } from "@goya24/messenger";

/** The options the site actually gave. The module declares every field the
 *  environment may set with an empty value; those are left out here, so an
 *  empty `locale` does not stand in for the page's own. */
function given(options: Record<string, unknown> | undefined): Partial<MessengerOptions> {
  const out: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(options ?? {})) {
    if (value !== "" && value !== null && value !== undefined) out[name] = value;
  }
  return out as Partial<MessengerOptions>;
}

/** A handle that does nothing, for an app with no key: its pages still
 *  render and its buttons are inert, rather than a page failing because the
 *  support widget is not configured. */
function inert(): Goya24 {
  const nothing = () => {};
  return {
    open: nothing,
    close: nothing,
    toggle: nothing,
    identify: nothing,
    update: nothing,
    destroy: nothing,
    state: readonly(shallowRef<MessengerState>({ ready: false, open: false, unread: 0 })),
  };
}

// On the server as well as in the browser — the module registers it for
// both. A page that calls useGoya24() is rendered on the server first, and a
// composable that finds no plugin throws: every such page was a 500. On the
// server the handle never loads anything, because createGoya24() mounts the
// messenger from app.mount(), which server rendering never calls.
export default defineNuxtPlugin((nuxtApp) => {
  const options = given(useRuntimeConfig().public.goya24 as Record<string, unknown> | undefined);
  if (options.key) {
    nuxtApp.vueApp.use(createGoya24(options as MessengerOptions));
    return;
  }
  // Said once, in the browser where the site's developer looks — not on
  // every request the server renders.
  if (typeof window !== "undefined") {
    console.warn(
      "@goya24/nuxt: no key. Set `goya24.key` in nuxt.config or NUXT_PUBLIC_GOYA24_KEY in the environment.",
    );
  }
  const handle = inert();
  nuxtApp.vueApp.provide(goya24Key, handle);
  nuxtApp.vueApp.config.globalProperties.$goya24 = handle;
});
