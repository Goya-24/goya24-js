import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  Messenger,
  MessengerEvent,
  MessengerOptions,
  MessengerState,
} from "@goya24/messenger";
import { Goya24, Goya24Provider, useGoya24 } from "./index";

/** A messenger the tests drive by hand, standing in for the core package. */
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
      if (event === "open") state.open = true;
      if (event === "close") state.open = false;
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

beforeEach(() => {
  messenger = fakeMessenger();
  load.mockReset();
  load.mockImplementation(() => messenger);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("<Goya24 />", () => {
  it("renders nothing and loads the messenger with the props as options", () => {
    const { container } = render(
      <Goya24
        workspaceKey="d24_pk_abc"
        origin="https://support.shop.example"
        locale="fa"
        theme="dark"
        alignment="left"
        padding={{ x: 24 }}
        user={{ id: "u1", hash: "h1", name: "Sara" }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(load).toHaveBeenCalledOnce();
    expect(load).toHaveBeenCalledWith({
      key: "d24_pk_abc",
      origin: "https://support.shop.example",
      locale: "fa",
      theme: "dark",
      alignment: "left",
      padding: { x: 24 },
      user: { id: "u1", hash: "h1", name: "Sara" },
    });
  });

  it("passes launcher={false} on, and says nothing when it is left alone", () => {
    render(<Goya24 workspaceKey="d24_pk_abc" launcher={false} />);
    expect(load).toHaveBeenLastCalledWith({ key: "d24_pk_abc", launcher: false });
    expect(messenger.update).not.toHaveBeenCalled();
  });

  it("hides and shows our launcher on the messenger already there, without a reload", () => {
    // The shop's case: shown on the home page, gone on the app page, back
    // again — one messenger the whole way, so an open conversation stays.
    const { rerender } = render(<Goya24 workspaceKey="d24_pk_abc" />);
    rerender(<Goya24 workspaceKey="d24_pk_abc" launcher={false} />);
    expect(messenger.update).toHaveBeenLastCalledWith({ launcher: false });

    // Left alone again: handed back, the same as never having passed it.
    rerender(<Goya24 workspaceKey="d24_pk_abc" />);
    expect(messenger.update).toHaveBeenLastCalledWith({ launcher: null });

    expect(load).toHaveBeenCalledOnce();
    expect(messenger.destroy).not.toHaveBeenCalled();
  });

  it("moves the messenger when alignment or padding change, sending only what changed", () => {
    const { rerender } = render(
      <Goya24 workspaceKey="d24_pk_abc" alignment="left" padding={{ x: 24 }} />,
    );
    // A new object with the same numbers is not a change.
    rerender(<Goya24 workspaceKey="d24_pk_abc" alignment="left" padding={{ x: 24 }} />);
    expect(messenger.update).not.toHaveBeenCalled();

    rerender(<Goya24 workspaceKey="d24_pk_abc" alignment="right" padding={{ x: 24 }} />);
    expect(messenger.update).toHaveBeenLastCalledWith({ alignment: "right" });

    rerender(<Goya24 workspaceKey="d24_pk_abc" alignment="right" padding={{ x: 24, y: 96 }} />);
    expect(messenger.update).toHaveBeenLastCalledWith({ padding: { x: 24, y: 96 } });

    rerender(<Goya24 workspaceKey="d24_pk_abc" />);
    expect(messenger.update).toHaveBeenLastCalledWith({
      alignment: null,
      padding: { x: null, y: null },
    });
    expect(load).toHaveBeenCalledOnce();
  });

  it("a new workspace reloads with the layout of the moment, and sends no update", () => {
    const { rerender } = render(<Goya24 workspaceKey="d24_pk_one" alignment="left" />);
    rerender(<Goya24 workspaceKey="d24_pk_two" alignment="right" launcher={false} />);
    expect(load).toHaveBeenCalledTimes(2);
    expect(load).toHaveBeenLastCalledWith({
      key: "d24_pk_two",
      alignment: "right",
      launcher: false,
    });
    expect(messenger.update).not.toHaveBeenCalled();
  });

  it("does not reload when only callbacks change, and destroys on unmount", () => {
    const { rerender, unmount } = render(<Goya24 workspaceKey="d24_pk_abc" onOpen={() => {}} />);
    rerender(<Goya24 workspaceKey="d24_pk_abc" onOpen={() => {}} />);
    expect(load).toHaveBeenCalledOnce();
    expect(messenger.destroy).not.toHaveBeenCalled();

    unmount();
    expect(messenger.destroy).toHaveBeenCalledOnce();
  });

  it("reloads when the workspace key changes", () => {
    const { rerender } = render(<Goya24 workspaceKey="d24_pk_one" />);
    rerender(<Goya24 workspaceKey="d24_pk_two" />);
    expect(messenger.destroy).toHaveBeenCalledOnce();
    expect(load).toHaveBeenCalledTimes(2);
    expect(load).toHaveBeenLastCalledWith({ key: "d24_pk_two" });
  });

  it("tells the messenger when the user signs in later", () => {
    const { rerender } = render(<Goya24 workspaceKey="d24_pk_abc" />);
    expect(messenger.identify).not.toHaveBeenCalled();

    rerender(<Goya24 workspaceKey="d24_pk_abc" user={{ email: "s@example.com" }} />);
    expect(messenger.identify).toHaveBeenCalledWith({ email: "s@example.com" });

    // The same person on the next render is not announced again.
    rerender(<Goya24 workspaceKey="d24_pk_abc" user={{ email: "s@example.com" }} />);
    expect(messenger.identify).toHaveBeenCalledOnce();
  });

  it("forwards the messenger's events to the callbacks", () => {
    const onReady = vi.fn();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onUnread = vi.fn();
    const onError = vi.fn();
    render(
      <Goya24
        workspaceKey="d24_pk_abc"
        onReady={onReady}
        onOpen={onOpen}
        onClose={onClose}
        onUnread={onUnread}
        onError={onError}
      />,
    );
    act(() => {
      messenger.emit("ready");
      messenger.emit("unread", { count: 3 });
      messenger.emit("open");
      messenger.emit("close");
      messenger.emit("error", { reason: "boot failed" });
    });
    expect(onReady).toHaveBeenCalledOnce();
    expect(onUnread).toHaveBeenCalledWith(3);
    expect(onOpen).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith("boot failed");
  });
});

describe("useGoya24()", () => {
  function Button() {
    const { open, toggle, unreadCount, isOpen, ready } = useGoya24();
    return (
      <>
        <button onClick={open}>open</button>
        <button onClick={toggle}>toggle</button>
        <output>{`${ready ? "ready" : "booting"} ${isOpen ? "open" : "shut"} ${unreadCount}`}</output>
      </>
    );
  }

  it("mirrors the messenger's state and controls it", () => {
    render(
      <Goya24Provider workspaceKey="d24_pk_abc">
        <Button />
      </Goya24Provider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("booting shut 0");

    act(() => {
      messenger.emit("ready");
      messenger.emit("unread", { count: 2 });
    });
    expect(screen.getByRole("status")).toHaveTextContent("ready shut 2");

    screen.getByText("open").click();
    expect(messenger.open).toHaveBeenCalledOnce();
    act(() => messenger.emit("open"));
    // Opening is reading: the count goes back to zero.
    expect(screen.getByRole("status")).toHaveTextContent("ready open 0");

    screen.getByText("toggle").click();
    expect(messenger.toggle).toHaveBeenCalledOnce();
  });

  it("lets a page under the provider move the messenger or hide our launcher", () => {
    function AppPage() {
      const { update } = useGoya24();
      return <button onClick={() => update({ launcher: false })}>app page</button>;
    }
    render(
      <Goya24Provider workspaceKey="d24_pk_abc">
        <AppPage />
      </Goya24Provider>,
    );
    screen.getByText("app page").click();
    expect(messenger.update).toHaveBeenCalledWith({ launcher: false });
    expect(load).toHaveBeenCalledOnce();
  });

  it("throws outside a provider, with a sentence that says what to do", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useGoya24())).toThrow(/under a <Goya24Provider>/);
  });
});
