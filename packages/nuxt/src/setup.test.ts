import { describe, expect, it, vi } from "vitest";

const addPlugin = vi.fn();
vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (definition: unknown) => definition,
  createResolver: () => ({ resolve: (path: string) => `/resolved/${path}` }),
  addPlugin,
}));

describe("the module's setup()", () => {
  it("writes the merged options to public runtime config and registers the client plugin", async () => {
    const mod = (await import("./module")).default as unknown as {
      setup: (options: Record<string, unknown>, nuxt: unknown) => void;
      meta: { configKey: string };
    };
    const nuxt = { options: { runtimeConfig: { public: { goya24: { key: "d24_pk_env" } } } } };

    mod.setup({ key: "d24_pk_config", locale: "fa" }, nuxt);

    expect(mod.meta.configKey).toBe("goya24");
    expect(nuxt.options.runtimeConfig.public.goya24).toEqual({ key: "d24_pk_env", locale: "fa" });
    expect(addPlugin).toHaveBeenCalledWith({ src: "/resolved/./runtime/plugin", mode: "client" });
  });
});
