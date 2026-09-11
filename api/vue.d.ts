import { Ref, Plugin, InjectionKey } from 'vue';
import { User, MessengerState, MessengerOptions } from '@goya24/messenger';
export { Alignment, Locale, Messenger, MessengerEvent, MessengerEvents, MessengerOptions, MessengerState, Theme, User } from '@goya24/messenger';

interface Goya24 {
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
declare const goya24Key: InjectionKey<Goya24>;
/**
 * Vue plugin. `app.use(createGoya24({ key }))` puts the messenger on the
 * page once the app is in a browser, and `useGoya24()` controls it from any
 * component.
 *
 * ```ts
 * app.use(createGoya24({ key: import.meta.env.VITE_GOYA24_KEY, locale: "fa" }));
 * ```
 */
declare function createGoya24(options: MessengerOptions): Plugin;
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
declare function useGoya24(): Goya24;
declare module "vue" {
    interface ComponentCustomProperties {
        $goya24: Goya24;
    }
}

export { type Goya24, createGoya24, goya24Key, useGoya24 };
