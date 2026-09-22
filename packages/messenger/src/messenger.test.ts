import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ORIGIN, get, load } from "./messenger";
import type { LoaderApi, MessengerState } from "./types";

/**
 * A stand-in for `widget.js`. jsdom does not run external scripts, so the
 * test installs what the loader would have installed and fires the tag's
 * `load` event — the same moment the real one exposes `window.dastyar24`.
 */
function fakeLoader() {
  const listeners = new Map<string, Set<(detail: unknown) => void>>();
  const state: MessengerState = { ready: false, open: false, unread: 0 };
  const api = {
    identify: vi.fn(),
    destroy: vi.fn(() => {
      window.__dastyar24Loaded = false;
    }),
    open: vi.fn(() => emit("state", { open: true })),
    close: vi.fn(() => emit("state", { open: false })),
    toggle: vi.fn(() => emit("state", { open: !state.open })),
    getState: () => ({ ...state }),
    on: vi.fn((name: string, handler: (detail: unknown) => void) => {
      let set = listeners.get(name);
      if (!set) listeners.set(name, (set = new Set()));
      set.add(handler);
      if (name === "ready" && state.ready) handler({});
      return () => set.delete(handler);
    }),
    off: vi.fn(),
  } satisfies LoaderApi;

  function emit(name: string, detail: Record<string, unknown> = {}) {
    if (name === "state") {
      const wasOpen = state.open;
      const had = state.unread;
      if (typeof detail.open === "boolean") state.open = detail.open;
      if (typeof detail.unread === "number") state.unread = detail.unread;
      if (state.open !== wasOpen) emit(state.open ? "open" : "close");
      if (state.unread !== had) emit("unread", { count: state.unread });
      return;
    }
    if (name === "ready") state.ready = true;
    for (const handler of listeners.get(name) ?? []) handler(detail);
  }

  function install() {
    window.dastyar24 = api;
    window.__dastyar24Loaded = true;
  }

  return { api, state, emit, install, listeners };
}

/** The tag `load()` injected, and the moment its script "arrives". */
function tag(): HTMLScriptElement {
  const script = document.head.querySelector<HTMLScriptElement>("script[data-goya24-sdk]");
  if (!script) throw new Error("no sdk script tag");
  return script;
}

function arrive(loader: ReturnType<typeof fakeLoader>) {
  loader.install();
  tag().dispatchEvent(new Event("load"));
}

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  get()?.destroy();
  delete window.dastyar24;
  delete window.__dastyar24Loaded;
  document.head.innerHTML = "";
  vi.restoreAllMocks();
});

describe("load()", () => {
  it("injects one loader tag with the options as data attributes", () => {
    load({
      key: "d24_pk_abc",
      locale: "fa",
      theme: "dark",
      alignment: "left",
      padding: { x: 24, y: 32 },
      user: {
        id: "u1",
        hash: "h1",
        email: "s@example.com",
        name: "Sara",
        traits: { plan: "growth" },
      },
    });
    const script = tag();
    expect(script.async).toBe(true);
    expect(script.src).toBe(`${DEFAULT_ORIGIN}/widget.js`);
    expect(script.dataset.key).toBe("d24_pk_abc");
    expect(script.dataset.locale).toBe("fa");
    expect(script.dataset.theme).toBe("dark");
    expect(script.dataset.alignment).toBe("left");
    expect(script.dataset.horizontalPadding).toBe("24");
    expect(script.dataset.verticalPadding).toBe("32");
    expect(JSON.parse(script.dataset.user!)).toEqual({
      id: "u1",
      hash: "h1",
      email: "s@example.com",
      name: "Sara",
      traits: { plan: "growth" },
    });
  });

  it("hides our launcher only when asked, and never says so otherwise", () => {
    load({ key: "d24_pk_abc", launcher: false });
    expect(tag().dataset.launcher).toBe("none");

    get()?.destroy();
    delete window.dastyar24;
    delete window.__dastyar24Loaded;
    document.head.innerHTML = "";

    // The default and an explicit `true` both leave the attribute off: the
    // loader draws the bubble unless the tag says "none".
    load({ key: "d24_pk_abc", launcher: true });
    expect(tag().dataset.launcher).toBeUndefined();
  });

  it("leaves out what was not given, and points at a custom origin", () => {
    load({ key: "d24_pk_abc", origin: "https://support.shop.example/" });
    const script = tag();
    expect(script.src).toBe("https://support.shop.example/widget.js");
    expect(script.dataset.locale).toBeUndefined();
    expect(script.dataset.user).toBeUndefined();
    expect(script.dataset.launcher).toBeUndefined();
  });

  it("refuses a missing key or a bad origin before touching the page", () => {
    expect(() => load({ key: "" })).toThrow(/`key` is required/);
    expect(() => load({ key: "d24_pk_abc", origin: "goya24.com" })).toThrow(/bare origin/);
    expect(() => load({ key: "d24_pk_abc", origin: "https://goya24.com/fa" })).toThrow(
      /bare origin/,
    );
    expect(document.head.querySelector("script")).toBeNull();
  });

  it("is idempotent: a second call returns the same instance and warns on a different key", () => {
    const first = load({ key: "d24_pk_one" });
    expect(load({ key: "d24_pk_one" })).toBe(first);
    expect(load({ key: "d24_pk_two" })).toBe(first);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("different key"));
    expect(document.head.querySelectorAll("script")).toHaveLength(1);
  });

  it("adopts a loader the site's own script tag already installed", () => {
    const loader = fakeLoader();
    loader.install();
    loader.state.ready = true;
    const messenger = load({ key: "d24_pk_abc" });
    expect(document.head.querySelector("script")).toBeNull();
    expect(messenger.getState().ready).toBe(true);
    messenger.open();
    expect(loader.api.open).toHaveBeenCalledOnce();
  });
});

describe("calls before the loader arrives", () => {
  it("are queued and run once, in order", () => {
    const loader = fakeLoader();
    const messenger = load({ key: "d24_pk_abc" });
    messenger.open();
    messenger.identify({ email: "s@example.com", name: "Sara", traits: { plan: "growth" } });
    expect(loader.api.open).not.toHaveBeenCalled();

    arrive(loader);

    expect(loader.api.open).toHaveBeenCalledOnce();
    expect(loader.api.identify).toHaveBeenCalledWith({
      email: "s@example.com",
      name: "Sara",
      attributes: { plan: "growth" },
    });
  });
});

describe("state and events", () => {
  it("resolves `ready` and reports open, close and unread as the loader does", async () => {
    const loader = fakeLoader();
    const messenger = load({ key: "d24_pk_abc" });
    const seen: string[] = [];
    messenger.on("ready", () => seen.push("ready"));
    messenger.on("open", () => seen.push("open"));
    messenger.on("close", () => seen.push("close"));
    messenger.on("unread", ({ count }) => seen.push(`unread:${count}`));

    arrive(loader);
    expect(messenger.getState().ready).toBe(false);
    loader.emit("ready");
    await messenger.ready;
    expect(messenger.getState().ready).toBe(true);

    loader.emit("state", { unread: 2 });
    expect(messenger.getState().unread).toBe(2);
    messenger.open();
    expect(messenger.getState()).toEqual({ ready: true, open: true, unread: 0 });
    messenger.close();
    expect(messenger.getState().open).toBe(false);

    expect(seen).toEqual(["ready", "unread:2", "open", "close"]);
  });

  it("tells a late `ready` listener straight away", async () => {
    const loader = fakeLoader();
    const messenger = load({ key: "d24_pk_abc" });
    arrive(loader);
    loader.emit("ready");
    const handler = vi.fn();
    messenger.on("ready", handler);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("unsubscribes, and one throwing listener does not silence the next", () => {
    const loader = fakeLoader();
    const messenger = load({ key: "d24_pk_abc" });
    const bad = vi.fn(() => {
      throw new Error("page bug");
    });
    const good = vi.fn();
    const off = messenger.on("open", bad);
    messenger.on("open", good);
    arrive(loader);

    messenger.open();
    expect(bad).toHaveBeenCalledOnce();
    expect(good).toHaveBeenCalledOnce();
    expect(console.error).toHaveBeenCalled();

    off();
    messenger.close();
    messenger.open();
    expect(bad).toHaveBeenCalledOnce();
    expect(good).toHaveBeenCalledTimes(2);
  });

  it("reports a loader that could not be fetched", () => {
    const messenger = load({ key: "d24_pk_abc" });
    const handler = vi.fn();
    messenger.on("error", handler);
    tag().dispatchEvent(new Event("error"));
    expect(handler).toHaveBeenCalledWith({ reason: expect.stringContaining("/widget.js") });
  });

  it("reports a loader that ran but installed nothing", () => {
    const messenger = load({ key: "d24_pk_abc" });
    const handler = vi.fn();
    messenger.on("error", handler);
    tag().dispatchEvent(new Event("load"));
    expect(handler).toHaveBeenCalledWith({ reason: expect.stringContaining("installed nothing") });
  });
});

describe("destroy()", () => {
  it("takes the messenger down, drops listeners, and lets load() start over", () => {
    const loader = fakeLoader();
    const messenger = load({ key: "d24_pk_abc" });
    arrive(loader);
    const handler = vi.fn();
    messenger.on("open", handler);

    messenger.destroy();

    expect(loader.api.destroy).toHaveBeenCalledOnce();
    expect(document.head.querySelector("script")).toBeNull();
    expect(get()).toBeNull();
    // Nothing after the end: calls are dropped, not queued for a ghost.
    messenger.open();
    expect(loader.api.open).not.toHaveBeenCalled();
    expect(messenger.getState()).toEqual({ ready: false, open: false, unread: 0 });

    const again = load({ key: "d24_pk_abc" });
    expect(again).not.toBe(messenger);
    expect(document.head.querySelectorAll("script")).toHaveLength(1);
  });
});

describe("the edges", () => {
  it("get() is null before load() and after destroy()", () => {
    expect(get()).toBeNull();
    const messenger = load({ key: "d24_pk_abc" });
    expect(get()).toBe(messenger);
    messenger.destroy();
    expect(get()).toBeNull();
  });

  it("toggle() reaches the loader, and identify() ignores what is not a user", () => {
    const loader = fakeLoader();
    const messenger = load({ key: "d24_pk_abc" });
    arrive(loader);
    messenger.toggle();
    expect(loader.api.toggle).toHaveBeenCalledOnce();
    messenger.identify(null as never);
    messenger.identify("sara" as never);
    expect(loader.api.identify).not.toHaveBeenCalled();
  });

  it("survives a loader whose destroy() throws, and one with no event API", () => {
    const loader = fakeLoader();
    loader.api.destroy.mockImplementation(() => {
      throw new Error("old loader");
    });
    // An older widget.js: identify and destroy only.
    const bare = { identify: loader.api.identify, destroy: loader.api.destroy };
    window.dastyar24 = bare;
    window.__dastyar24Loaded = true;
    const messenger = load({ key: "d24_pk_abc" });
    messenger.open(); // nothing to call; must not throw
    messenger.destroy();
    expect(console.error).toHaveBeenCalled();
    expect(get()).toBeNull();
  });
});

describe("outside a browser", () => {
  it("load() says to call it from an effect, and rejects a non-object", () => {
    expect(() => load("d24_pk_abc" as never)).toThrow(/options object/);
    vi.stubGlobal("document", undefined);
    try {
      expect(() => load({ key: "d24_pk_abc" })).toThrow(/needs a browser/);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
