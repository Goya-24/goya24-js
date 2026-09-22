import type {
  LoaderApi,
  Messenger,
  MessengerEvent,
  MessengerEvents,
  MessengerOptions,
  MessengerState,
  Unsubscribe,
  User,
} from "./types";

/** Where the messenger is served from unless told otherwise. */
export const DEFAULT_ORIGIN = "https://goya24.com";

/** Marks the tag this package injected, so `destroy()` removes only its own. */
const SCRIPT_ATTRIBUTE = "data-goya24-sdk";

const EVENTS: readonly MessengerEvent[] = ["ready", "open", "close", "unread", "error"];

type Handler = (detail: unknown) => void;

/** The one instance a page has. A second `load()` returns it. */
let current: MessengerImpl | null = null;

/**
 * Put the messenger on the page, or take hold of one the site's own script
 * tag already installed.
 *
 * Idempotent: calling it twice returns the same instance. Browser-only —
 * from a server-rendered framework, call it in an effect.
 */
export function load(options: MessengerOptions): Messenger {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error(
      "@goya24/messenger: load() needs a browser. Call it from an effect, after hydration.",
    );
  }
  const normalised = normalise(options);
  if (current && !current.destroyed) {
    if (current.options.key !== normalised.key) {
      console.warn(
        `@goya24/messenger: load() was called again with a different key (${normalised.key}); ` +
          `the messenger already on the page (${current.options.key}) is kept. ` +
          "Call destroy() first to switch workspaces.",
      );
    }
    return current;
  }
  current = new MessengerImpl(normalised);
  current.mount();
  return current;
}

/** The instance `load()` created, if the page has one. */
export function get(): Messenger | null {
  return current && !current.destroyed ? current : null;
}

type Normalised = MessengerOptions & { key: string; origin: string };

function normalise(options: MessengerOptions): Normalised {
  if (!options || typeof options !== "object") {
    throw new TypeError("@goya24/messenger: load() takes an options object.");
  }
  const key = typeof options.key === "string" ? options.key.trim() : "";
  if (!key) {
    throw new TypeError(
      "@goya24/messenger: `key` is required — the workspace's public key from Settings → Install.",
    );
  }
  const origin = (options.origin || DEFAULT_ORIGIN).trim().replace(/\/+$/, "");
  if (!/^https?:\/\/[^/\s]+$/.test(origin)) {
    throw new TypeError(
      `@goya24/messenger: \`origin\` must be a bare origin like https://goya24.com, got "${origin}".`,
    );
  }
  return { ...options, key, origin };
}

/** The `data-user` value: everything the loader knows how to carry. */
function tagUser(user: User): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (user.id !== undefined) out.id = String(user.id);
  if (user.hash) out.hash = user.hash;
  if (user.email) out.email = user.email;
  if (user.name) out.name = user.name;
  if (user.plan) out.plan = user.plan;
  if (user.traits && Object.keys(user.traits).length) out.traits = user.traits;
  return out;
}

/** The `identify()` payload: a claim, in the shape the messenger stores. */
function claim(user: User): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (user.email) out.email = user.email;
  if (user.name) out.name = user.name;
  if (user.plan) out.plan = user.plan;
  out.attributes = user.traits ?? {};
  return out;
}

class MessengerImpl implements Messenger {
  destroyed = false;
  readonly ready: Promise<void>;

  private api: LoaderApi | null = null;
  private script: HTMLScriptElement | null = null;
  private readonly pending: Array<(api: LoaderApi) => void> = [];
  private readonly handlers = new Map<MessengerEvent, Set<Handler>>();
  private readonly detach: Array<() => void> = [];
  private state: MessengerState = { ready: false, open: false, unread: 0 };
  private resolveReady: () => void = () => {};

  constructor(readonly options: Normalised) {
    this.ready = new Promise<void>((resolve) => {
      this.resolveReady = resolve;
    });
  }

  mount(): void {
    // The site may already have the script tag from the install page. Adopt
    // it rather than loading a second copy, which the loader would refuse.
    if (window.__dastyar24Loaded && window.dastyar24) {
      this.attach(window.dastyar24);
      return;
    }
    const script = document.createElement("script");
    script.async = true;
    script.src = `${this.options.origin}/widget.js`;
    script.setAttribute(SCRIPT_ATTRIBUTE, "");
    script.dataset.key = this.options.key;
    if (this.options.locale) script.dataset.locale = this.options.locale;
    if (this.options.theme) script.dataset.theme = this.options.theme;
    if (this.options.alignment) script.dataset.alignment = this.options.alignment;
    if (this.options.padding?.x !== undefined) {
      script.dataset.horizontalPadding = String(this.options.padding.x);
    }
    if (this.options.padding?.y !== undefined) {
      script.dataset.verticalPadding = String(this.options.padding.y);
    }
    // Only ever written to turn the launcher off: the loader's default is to
    // draw it, and an attribute saying "yes, the normal thing" is one more
    // thing to get wrong in a tag manager.
    if (this.options.launcher === false) script.dataset.launcher = "none";
    if (this.options.user) script.dataset.user = JSON.stringify(tagUser(this.options.user));
    script.addEventListener("load", () => {
      if (window.dastyar24) this.attach(window.dastyar24);
      else this.emit("error", { reason: "the loader ran but installed nothing" });
    });
    script.addEventListener("error", () => {
      this.emit("error", { reason: `could not load ${script.src}` });
    });
    this.script = script;
    document.head.appendChild(script);
  }

  private attach(api: LoaderApi): void {
    this.api = api;
    if (api.on) {
      for (const name of EVENTS) {
        const off = api.on(name, (detail) => this.fromLoader(name, detail));
        this.detach.push(off);
      }
    }
    // A loader adopted after it booted has state we never heard.
    const known = api.getState?.();
    if (known?.ready) {
      this.state = { ...known };
      this.resolveReady();
    }
    for (const call of this.pending.splice(0)) call(api);
  }

  private fromLoader(name: MessengerEvent, detail: unknown): void {
    const data = (detail ?? {}) as Record<string, unknown>;
    switch (name) {
      case "ready":
        if (this.state.ready) return;
        this.state = { ...this.state, ready: true };
        this.resolveReady();
        break;
      case "open":
        this.state = { ...this.state, open: true, unread: 0 };
        break;
      case "close":
        this.state = { ...this.state, open: false };
        break;
      case "unread":
        this.state = { ...this.state, unread: typeof data.count === "number" ? data.count : 0 };
        break;
      case "error":
        break;
    }
    this.emit(name, data as MessengerEvents[typeof name]);
  }

  private emit<E extends MessengerEvent>(event: E, detail: MessengerEvents[E]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of Array.from(set)) {
      try {
        handler(detail);
      } catch (error) {
        // A listener that throws is the page's bug; the others still run.
        console.error(error);
      }
    }
  }

  /** Run now if the loader is here, else as soon as it is. */
  private call(fn: (api: LoaderApi) => void): void {
    if (this.destroyed) return;
    if (this.api) fn(this.api);
    else this.pending.push(fn);
  }

  open(): void {
    this.call((api) => api.open?.());
  }

  close(): void {
    this.call((api) => api.close?.());
  }

  toggle(): void {
    this.call((api) => api.toggle?.());
  }

  identify(user: User): void {
    if (!user || typeof user !== "object") return;
    this.call((api) => api.identify(claim(user)));
  }

  on<E extends MessengerEvent>(
    event: E,
    handler: (detail: MessengerEvents[E]) => void,
  ): Unsubscribe {
    if (typeof handler !== "function") return () => {};
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as Handler);
    // Late to a party that already started: say so now.
    if (event === "ready" && this.state.ready) {
      (handler as Handler)({});
    }
    return () => {
      this.handlers.get(event)?.delete(handler as Handler);
    };
  }

  getState(): MessengerState {
    return { ...this.state };
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const off of this.detach.splice(0)) off();
    this.pending.length = 0;
    try {
      this.api?.destroy();
    } catch (error) {
      console.error(error);
    }
    this.script?.remove();
    this.script = null;
    this.api = null;
    this.handlers.clear();
    this.state = { ready: false, open: false, unread: 0 };
    if (current === this) current = null;
  }
}
