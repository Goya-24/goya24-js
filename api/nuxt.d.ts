import * as nuxt_schema from 'nuxt/schema';
import { MessengerOptions } from '@goya24/messenger';

type ModuleOptions = Partial<MessengerOptions>;
/**
 * The messenger options, merged the way Nuxt users expect: the module's own
 * options in `nuxt.config`, then `runtimeConfig.public.goya24` on top — so
 * the key can come from `NUXT_PUBLIC_GOYA24_KEY` in the environment without
 * a line of config naming it.
 */
declare function resolveOptions(moduleOptions: ModuleOptions, publicRuntime: Record<string, unknown> | undefined): ModuleOptions;
declare const _default: nuxt_schema.NuxtModule<Partial<MessengerOptions>, Partial<MessengerOptions>, false>;

export { type ModuleOptions, _default as default, resolveOptions };
