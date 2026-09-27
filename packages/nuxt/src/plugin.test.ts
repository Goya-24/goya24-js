import { createApp, createSSRApp, defineComponent, h, type App } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createGoya24, useGoya24, type Goya24 } from "@goya24/vue";
import type * as Goya24Vue from "@goya24/vue";

// What useRuntimeConfig().public returns, set per test.
const config = { public: { goya24: {} as Record<string, unknown> } };
vi.mock("nuxt/app", () => ({
  defineNuxtPlugin: (plugin: unknown) => plugin,
  useRuntimeConfig: () => config,
}));
// The real createGoya24, watched: the tests check what it is given.
vi.mock("@goya24/vue", async (importOriginal) => {
  const actual = await importOriginal<typeof Goya24Vue>();
  return { ...actual, createGoya24: vi.fn(actual.createGoya24) };
});

/** Runtime config as the module leaves it: every field the environment may
 *  set is there, empty unless something set it. */
function runtime(fields: Record<string, unknown>): Record<string, unknown> {
  return { key: "", origin: "", locale: "", theme: "", alignment: "", launcher: true, ...fields };
}

/** A page that uses the composable while it renders, as the examples do. */
const Page = defineComponent({
  setup() {
    const { state } = useGoya24();
    return () => h("p", state.value.ready ? "ready" : "booting");
  },
});

async function install(app: App, goya24: Record<string, unknown>): Promise<void> {
  config.public.goya24 = goya24;
  const plugin = (await import("./runtime/plugin")).default as unknown as (nuxtApp: {
    vueApp: App;
  }) => void;
  plugin({ vueApp: app });
}

afterEach(() => {
  vi.mocked(createGoya24).mockClear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("the plugin, rendering on the server", () => {
  it("renders a page that calls useGoya24(), and never loads the messenger there", async () => {
    const app = createSSRApp(Page);
    await install(app, runtime({ key: "d24_pk_from_env" }));

    // This threw "useGoya24() needs the plugin" and every such page was a 500.
    await expect(renderToString(app)).resolves.toBe("<p>booting</p>");
    // Only what the site gave: the empty fields stay out, so an empty locale
    // does not replace the page's own.
    expect(createGoya24).toHaveBeenCalledWith({ key: "d24_pk_from_env", launcher: true });
  });

  it("renders it without a key too, and says nothing on every request", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const app = createSSRApp(Page);
    await install(app, runtime({}));

    await expect(renderToString(app)).resolves.toBe("<p>booting</p>");
    expect(createGoya24).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("the plugin, in the browser", () => {
  it("without a key: one warning, and controls that do nothing rather than a broken page", async () => {
    vi.stubGlobal("window", {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const app = createApp(Page);
    await install(app, runtime({}));

    expect(warn).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("NUXT_PUBLIC_GOYA24_KEY"));
    const handle = app.config.globalProperties.$goya24 as Goya24;
    expect(() => {
      handle.open();
      handle.update({ launcher: false });
      handle.identify({ email: "s@example.com" });
    }).not.toThrow();
    expect(handle.state.value).toEqual({ ready: false, open: false, unread: 0 });
    expect(createGoya24).not.toHaveBeenCalled();
  });

  it("with a key, installs the messenger as a Vue app would", async () => {
    vi.stubGlobal("window", {});
    const app = createApp(Page);
    await install(app, runtime({ key: "d24_pk_abc", locale: "fa", launcher: false }));

    expect(createGoya24).toHaveBeenCalledWith({ key: "d24_pk_abc", locale: "fa", launcher: false });
  });
});
