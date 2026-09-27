import { describe, expect, it, vi } from "vitest";

const addPlugin = vi.fn();
vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (definition: unknown) => definition,
  createResolver: () => ({ resolve: (path: string) => `/resolved/${path}` }),
  addPlugin,
}));

type Module = {
  setup: (options: Record<string, unknown>, nuxt: unknown) => void;
  meta: { configKey: string };
};

describe("the module's setup()", () => {
  it("writes the merged options to public runtime config and registers the plugin for server and browser", async () => {
    const mod = (await import("./module")).default as unknown as Module;
    const nuxt = { options: { runtimeConfig: { public: { goya24: { key: "d24_pk_env" } } } } };

    mod.setup({ key: "d24_pk_config", locale: "fa" }, nuxt);

    expect(mod.meta.configKey).toBe("goya24");
    expect(nuxt.options.runtimeConfig.public.goya24).toEqual({
      key: "d24_pk_env",
      origin: "",
      locale: "fa",
      theme: "",
      alignment: "",
      launcher: true,
    });
    // No `mode`: the plugin runs on the server too, so a page that calls
    // useGoya24() still finds it while being rendered there.
    expect(addPlugin).toHaveBeenCalledWith({ src: "/resolved/./runtime/plugin" });
  });

  it("declares every field the environment may set, even the ones nuxt.config leaves out", async () => {
    // Nuxt applies NUXT_PUBLIC_GOYA24_<FIELD> only to a field that already
    // exists in runtime config. A key given only in the environment — no key
    // in nuxt.config — used to have nothing to land on and was ignored.
    // scripts/nuxt-examples-smoke.mjs runs a real build to prove the rest.
    const mod = (await import("./module")).default as unknown as Module;
    const nuxt = { options: { runtimeConfig: { public: {} as Record<string, unknown> } } };

    mod.setup({ locale: "fa", launcher: false }, nuxt);

    const goya24 = nuxt.options.runtimeConfig.public.goya24 as Record<string, unknown>;
    for (const field of ["key", "origin", "locale", "theme", "alignment", "launcher"]) {
      expect(goya24).toHaveProperty(field);
    }
    // What the site did set is kept.
    expect(goya24.locale).toBe("fa");
    expect(goya24.launcher).toBe(false);
  });
});
