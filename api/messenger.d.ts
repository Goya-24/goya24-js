/** The messenger's language. It follows the page's `<html lang>` when unset. */
type Locale = "fa" | "en";
/** The messenger's theme. Unset, it matches the page's own colour scheme. */
type Theme = "light" | "dark";
/** Which bottom corner the launcher sits in. Ignored on phones, where it is
 *  always bottom-right. */
type Alignment = "left" | "right";
/**
 * Who is signed in on your site.
 *
 * With `id` and `hash` the identity is **proven**: `hash` is the HMAC of `id`
 * computed by your server with the signing key from Settings → Install, and
 * the messenger checks it before trusting a word of it. Without them the
 * details are sent as a **claim** — useful, but the inbox marks it as one.
 */
interface User {
    /** Your own id for the customer. Required for a proven identity. */
    id?: string;
    /** HMAC-SHA256 of `id`, hex, computed server-side with your signing key. */
    hash?: string;
    email?: string;
    name?: string;
    /** The plan they are on, in your own words. Shown to the agent. */
    plan?: string;
    /** Anything else the agent may read as context. */
    traits?: Record<string, string | number | boolean | null>;
}
interface MessengerOptions {
    /** The workspace's public key, from Settings → Install. Looks like `d24_pk_…`. */
    key: string;
    /**
     * Where the messenger is served from. Defaults to `https://goya24.com`;
     * a self-hosted deployment passes its own address.
     */
    origin?: string;
    locale?: Locale;
    theme?: Theme;
    alignment?: Alignment;
    /** Distance from the corner, in px. Floors at 20. Also what lifts the
     *  open panel past a close button of your own living in that corner —
     *  your button's height plus its gap. */
    padding?: {
        x?: number;
        y?: number;
    };
    /**
     * Whether the messenger draws its own launcher — the bubble in the corner.
     *
     * `false` takes it away for a site that has its own support button and
     * opens the panel with `open()`: nothing is drawn in the corner, the shut
     * messenger takes no space and no clicks, and the open panel has no bubble
     * under it either — its header's close button is the way out. Everything
     * else about the messenger is unchanged.
     *
     * The open panel still occupies the corner it opens in. If your own close
     * button lives there too, raise it past the panel with `padding.y`; a
     * button under the frame cannot be clicked.
     *
     * @default true
     */
    launcher?: boolean;
    /** The signed-in customer, if any. Can also be given later with `identify()`. */
    user?: User;
}
interface MessengerState {
    /** The messenger has booted and is listening. */
    ready: boolean;
    /** The panel is open. */
    open: boolean;
    /** Replies that arrived while the panel was shut. Resets to 0 on open. */
    unread: number;
}
interface MessengerEvents {
    ready: Record<string, never>;
    open: Record<string, never>;
    close: Record<string, never>;
    unread: {
        count: number;
    };
    error: {
        reason: string;
    };
}
type MessengerEvent = keyof MessengerEvents;
type Unsubscribe = () => void;
interface Messenger {
    /** Open the panel — from your own «پشتیبانی» button, say. */
    open(): void;
    close(): void;
    toggle(): void;
    /** Tell the messenger who is signed in. Safe to call before it is ready. */
    identify(user: User): void;
    /** Remove the messenger from the page entirely. `load()` may be called again after. */
    destroy(): void;
    /** Listen for an event. Returns the function that stops listening. */
    on<E extends MessengerEvent>(event: E, handler: (detail: MessengerEvents[E]) => void): Unsubscribe;
    /** A snapshot of `ready`, `open` and `unread`. */
    getState(): MessengerState;
    /** Resolves once the messenger has booted. Never rejects: a messenger that
     *  cannot start emits `error` instead, and the page goes on without it. */
    readonly ready: Promise<void>;
}
/**
 * What the loader script installs on `window`. Its names predate the goya24
 * brand and are a contract with every site that already embeds the script;
 * this package is a typed wrapper over exactly this surface.
 * @internal
 */
interface LoaderApi {
    identify(data: Record<string, unknown>): void;
    destroy(): void;
    open?(): void;
    close?(): void;
    toggle?(): void;
    getState?(): MessengerState;
    on?(name: string, handler: (detail: unknown) => void): () => void;
    off?(name: string, handler: (detail: unknown) => void): void;
}
declare global {
    interface Window {
        dastyar24?: LoaderApi;
        __dastyar24Loaded?: boolean;
    }
}

/** Where the messenger is served from unless told otherwise. */
declare const DEFAULT_ORIGIN = "https://goya24.com";
/**
 * Put the messenger on the page, or take hold of one the site's own script
 * tag already installed.
 *
 * Idempotent: calling it twice returns the same instance. Browser-only —
 * from a server-rendered framework, call it in an effect.
 */
declare function load(options: MessengerOptions): Messenger;
/** The instance `load()` created, if the page has one. */
declare function get(): Messenger | null;

export { type Alignment, DEFAULT_ORIGIN, type Locale, type Messenger, type MessengerEvent, type MessengerEvents, type MessengerOptions, type MessengerState, type Theme, type Unsubscribe, type User, get, load };
