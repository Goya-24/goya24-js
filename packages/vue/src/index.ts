import {
  inject,
  readonly,
  shallowRef,
  type App,
  type InjectionKey,
  type Plugin,
  type Ref,
} from "vue";
import {
  load,
  type Messenger,
  type MessengerOptions,
  type MessengerState,
  type User,
} from "@goya24/messenger";

export type {
  Alignment,
  Locale,
  Messenger,
  MessengerEvent,
  MessengerEvents,
  MessengerOptions,
  MessengerState,
  Theme,
  User,
} from "@goya24/messenger";

export interface Goya24 {
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Tell the messenger who is signed in. Prefer `user` in the plugin options for a proven identity. */
  identify: (user: User) => void;
  /** The messenger's state, reactive: `ready`, `open`, `unread`. */
  state: Readonly<Ref<MessengerState>>;
  /** Remove the messenger from the page. The plugin does this when the app unmounts. */
  destroy: () => void;
}

export const goya24Key: InjectionKey<Goya24> = Symbol("goya24");

/**
 * Vue plugin. `app.use(createGoya24({ key }))` puts the messenger on the
 * page once the app is in a browser, and `useGoya24()` controls it from any
 * component.
 *
 * ```ts
 * app.use(createGoya24({ key: import.meta.env.VITE_GOYA24_KEY, locale: "fa" }));
 * ```
 */
export function createGoya24(options: MessengerOptions): Plugin {
  return {
    install(app: App) {
      const state = shallowRef<MessengerState>({ ready: false, open: false, unread: 0 });
      let messenger: Messenger | null = null;
      let destroyed = false;
      const offs: Array<() => void> = [];
      // A component's setup() runs before the app has mounted, and so before
      // the messenger exists. Calls made then are kept, not dropped.
      const pending: Array<(messenger: Messenger) => void> = [];
      const call = (fn: (messenger: Messenger) => void) => {
        if (destroyed) return;
        if (messenger) fn(messenger);
        else pending.push(fn);
      };

      const mount = () => {
        if (messenger || destroyed || typeof window === "undefined") return;
        messenger = load(options);
        state.value = messenger.getState();
        const sync = () => {
          if (messenger) state.value = messenger.getState();
        };
        offs.push(
          messenger.on("ready", sync),
          messenger.on("open", sync),
          messenger.on("close", sync),
          messenger.on("unread", sync),
        );
        for (const fn of pending.splice(0)) fn(messenger);
      };

      const destroy = () => {
        destroyed = true;
        pending.length = 0;
        for (const off of offs.splice(0)) off();
        messenger?.destroy();
        messenger = null;
        state.value = { ready: false, open: false, unread: 0 };
      };

      const handle: Goya24 = {
        open: () => call((m) => m.open()),
        close: () => call((m) => m.close()),
        toggle: () => call((m) => m.toggle()),
        identify: (user) => call((m) => m.identify(user)),
        state: readonly(state),
        destroy,
      };

      app.provide(goya24Key, handle);
      app.config.globalProperties.$goya24 = handle;

      // Server-side rendering has no page to put a frame on; the browser
      // mounts it. `mount` runs after `app.mount()` on the client.
      const originalMount = app.mount;
      app.mount = (...args: Parameters<App["mount"]>) => {
        const result = originalMount.call(app, ...args);
        mount();
        return result;
      };
      const originalUnmount = app.unmount;
      app.unmount = () => {
        destroy();
        originalUnmount.call(app);
      };
    },
  };
}

/**
 * Control the messenger from any component under an app that installed
 * `createGoya24()`.
 *
 * ```vue
 * <script setup>
 * const { open, state } = useGoya24();
 * </script>
 * <button @click="open">پشتیبانی <span v-if="state.unread">{{ state.unread }}</span></button>
 * ```
 */
export function useGoya24(): Goya24 {
  const handle = inject(goya24Key, null);
  if (!handle) {
    throw new Error("useGoya24() needs the plugin: app.use(createGoya24({ key })).");
  }
  return handle;
}

declare module "vue" {
  interface ComponentCustomProperties {
    $goya24: Goya24;
  }
}
