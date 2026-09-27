import { addPlugin, createResolver, defineNuxtModule } from "@nuxt/kit";
import type { MessengerOptions } from "@goya24/messenger";

export type ModuleOptions = Partial<MessengerOptions>;

/**
 * The fields the environment may set, declared with empty values.
 *
 * Nuxt lets a `NUXT_PUBLIC_*` variable override a runtime config field only
 * if the field already exists: it walks the fields it has and never adds
 * one. The module used to write only what a site had put in `nuxt.config`,
 * so a key given as `NUXT_PUBLIC_GOYA24_KEY` — the way the README says to
 * give it — was never read, and the messenger never loaded (2026-09-27, a
 * shop on Nuxt). The plugin drops the empty values again before the
 * messenger sees them.
 */
const FROM_ENVIRONMENT = {
  key: "",
  origin: "",
  locale: "",
  theme: "",
  alignment: "",
  launcher: true,
};

/**
 * The messenger options, merged the way Nuxt users expect: the module's own
 * options in `nuxt.config`, then `runtimeConfig.public.goya24` on top.
 */
export function resolveOptions(
  moduleOptions: ModuleOptions,
  publicRuntime: Record<string, unknown> | undefined,
): ModuleOptions {
  const fromRuntime = (publicRuntime?.goya24 ?? {}) as ModuleOptions;
  return { ...moduleOptions, ...fromRuntime };
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@goya24/nuxt",
    configKey: "goya24",
    compatibility: { nuxt: ">=3.8.0" },
  },
  defaults: {},
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    // Everything ends up in public runtime config, where the plugin reads it
    // and where each field above can still be set from the environment.
    nuxt.options.runtimeConfig.public.goya24 = {
      ...FROM_ENVIRONMENT,
      ...resolveOptions(options, nuxt.options.runtimeConfig.public),
    };
    // On the server as well as in the browser: a page that calls useGoya24()
    // is rendered on the server first, and it used to find no plugin there.
    addPlugin({ src: resolver.resolve("./runtime/plugin") });
  },
});
