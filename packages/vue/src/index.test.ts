import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  Messenger,
  MessengerEvent,
  MessengerOptions,
  MessengerState,
} from "@goya24/messenger";
import { createGoya24, useGoya24 } from "./index";

function fakeMessenger() {
  const handlers = new Map<MessengerEvent, Set<(detail: unknown) => void>>();
  const state: MessengerState = { ready: false, open: false, unread: 0 };
  const messenger: Messenger & { emit: (event: MessengerEvent, detail?: unknown) => void } = {
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
    identify: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    getState: () => ({ ...state }),
    ready: Promise.resolve(),
    on: vi.fn((event: MessengerEvent, handler: (detail: never) => void) => {
      let set = handlers.get(event);
      if (!set) handlers.set(event, (set = new Set()));
      set.add(handler as (detail: unknown) => void);
      return () => set.delete(handler as (detail: unknown) => void);
    }),
    emit(event, detail = {}) {
      if (event === "ready") state.ready = true;
      if (event === "open") {
        state.open = true;
        state.unread = 0;
      }
      if (event === "close") state.open = false;
      if (event === "unread") state.unread = (detail as { count: number }).count;
      for (const handler of handlers.get(event) ?? []) handler(detail);
    },
  };
  return messenger;
}

const load = vi.fn<(options: MessengerOptions) => Messenger>();
let messenger: ReturnType<typeof fakeMessenger>;

vi.mock("@goya24/messenger", () => ({
  load: (options: MessengerOptions) => load(options),
}));

const Button = defineComponent({
  setup() {
    const { open, state } = useGoya24();
    return () =>
      h("div", [
        h("button", { onClick: open }, "open"),
        h(
          "output",
          `${state.value.ready ? "ready" : "booting"} ${state.value.open ? "open" : "shut"} ${state.value.unread}`,
        ),
      ]);
  },
});

beforeEach(() => {
  messenger = fakeMessenger();
  load.mockReset();
  load.mockImplementation(() => messenger);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createGoya24()", () => {
  it("loads the messenger once the app is mounted, with the options given", () => {
    const wrapper = mount(Button, {
      global: { plugins: [createGoya24({ key: "d24_pk_abc", locale: "fa" })] },
    });
    expect(load).toHaveBeenCalledOnce();
    expect(load).toHaveBeenCalledWith({ key: "d24_pk_abc", locale: "fa" });
    wrapper.unmount();
    expect(messenger.destroy).toHaveBeenCalledOnce();
  });

  it("carries launcher: false through to the messenger", () => {
    const wrapper = mount(Button, {
      global: { plugins: [createGoya24({ key: "d24_pk_abc", launcher: false })] },
    });
    expect(load).toHaveBeenCalledWith({ key: "d24_pk_abc", launcher: false });
    wrapper.unmount();
  });

  it("mirrors the state reactively and controls the messenger", async () => {
    const wrapper = mount(Button, {
      global: { plugins: [createGoya24({ key: "d24_pk_abc" })] },
    });
    expect(wrapper.find("output").text()).toBe("booting shut 0");

    messenger.emit("ready");
    messenger.emit("unread", { count: 4 });
    await nextTick();
    expect(wrapper.find("output").text()).toBe("ready shut 4");

    await wrapper.find("button").trigger("click");
    expect(messenger.open).toHaveBeenCalledOnce();
    messenger.emit("open");
    await nextTick();
    expect(wrapper.find("output").text()).toBe("ready open 0");
  });

  it("exposes the handle as $goya24 too", () => {
    const Legacy = defineComponent({
      render() {
        return h("button", { onClick: () => this.$goya24.toggle() }, "toggle");
      },
    });
    const wrapper = mount(Legacy, { global: { plugins: [createGoya24({ key: "d24_pk_abc" })] } });
    wrapper.find("button").trigger("click");
    expect(messenger.toggle).toHaveBeenCalledOnce();
  });
});

describe("useGoya24()", () => {
  it("throws without the plugin, with a sentence that says what to do", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => mount(Button)).toThrow(/app\.use\(createGoya24/);
  });
});

describe("the handle", () => {
  it("passes close() and identify() through, and is inert after destroy()", () => {
    const Controls = defineComponent({
      setup() {
        const goya = useGoya24();
        goya.identify({ email: "s@example.com" });
        goya.close();
        return () => h("span");
      },
    });
    const wrapper = mount(Controls, { global: { plugins: [createGoya24({ key: "d24_pk_abc" })] } });
    expect(messenger.identify).toHaveBeenCalledWith({ email: "s@example.com" });
    expect(messenger.close).toHaveBeenCalledOnce();

    wrapper.vm.$goya24.destroy();
    wrapper.vm.$goya24.open();
    wrapper.vm.$goya24.update({ launcher: true });
    expect(messenger.open).not.toHaveBeenCalled();
    expect(messenger.update).not.toHaveBeenCalled();
    expect(wrapper.vm.$goya24.state.value).toEqual({ ready: false, open: false, unread: 0 });
  });

  it("update() moves the messenger already there, including from a setup() before mount", () => {
    // A route that wants our bubble gone asks while it is being set up —
    // before the app has mounted and the messenger exists. Kept, then sent.
    const AppPage = defineComponent({
      setup() {
        const goya = useGoya24();
        goya.update({ launcher: false, alignment: "left" });
        return () => h("button", { onClick: () => goya.update({ launcher: null }) }, "home");
      },
    });
    const wrapper = mount(AppPage, {
      global: { plugins: [createGoya24({ key: "d24_pk_abc" })] },
    });
    expect(load).toHaveBeenCalledOnce();
    expect(messenger.update).toHaveBeenCalledWith({ launcher: false, alignment: "left" });

    wrapper.find("button").trigger("click");
    expect(messenger.update).toHaveBeenLastCalledWith({ launcher: null });
    expect(load).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
});
