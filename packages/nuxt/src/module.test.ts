import { describe, expect, it } from "vitest";
import { resolveOptions } from "./module";

describe("resolveOptions()", () => {
  it("lets runtime config (and so the environment) override nuxt.config", () => {
    expect(
      resolveOptions(
        { key: "d24_pk_from_config", locale: "fa" },
        { goya24: { key: "d24_pk_from_env" } },
      ),
    ).toEqual({ key: "d24_pk_from_env", locale: "fa" });
  });

  it("works with nothing in runtime config", () => {
    expect(resolveOptions({ key: "d24_pk_abc" }, undefined)).toEqual({ key: "d24_pk_abc" });
  });
});
