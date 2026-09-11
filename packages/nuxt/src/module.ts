import { addPlugin, createResolver, defineNuxtModule } from "@nuxt/kit";
import type { MessengerOptions } from "@goya24/messenger";

export type ModuleOptions = Partial<MessengerOptions>;

/**
 * The messenger options, merged the way Nuxt users expect: the module's own
 * options in `nuxt.config`, then `runtimeConfig.public.goya24` on top — so
 * the key can come from `NUXT_PUBLIC_GOYA24_KEY` in the environment without
 * a line of config naming it.
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
    // Everything ends up in public runtime config: the plugin reads it on the
    // client, and an environment variable can still override each field.
    nuxt.options.runtimeConfig.public.goya24 = resolveOptions(
      options,
      nuxt.options.runtimeConfig.public,
    );
    addPlugin({ src: resolver.resolve("./runtime/plugin"), mode: "client" });
  },
});
