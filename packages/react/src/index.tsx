import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { load, type Messenger, type MessengerOptions, type User } from "@goya24/messenger";

export type {
  Alignment,
  Locale,
  Messenger,
  MessengerEvent,
  MessengerEvents,
  MessengerOptions,
  MessengerState,
  Theme,
  User,
} from "@goya24/messenger";

export interface Goya24Props extends Omit<MessengerOptions, "key"> {
  /** The workspace's public key, from Settings → Install. */
  workspaceKey: string;
  onReady?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  /** Replies that arrived while the panel was shut — for a badge on your own button. */
  onUnread?: (count: number) => void;
  onError?: (reason: string) => void;
}

export interface Goya24Handle {
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Tell the messenger who is signed in. Prefer the `user` prop for a proven identity. */
  identify: (user: User) => void;
  /** Whether the messenger has booted. */
  ready: boolean;
  isOpen: boolean;
  /** Replies that arrived while the panel was shut. Resets on open. */
  unreadCount: number;
}

const Goya24Context = createContext<Goya24Handle | null>(null);

/**
 * Everything that mounts the messenger and mirrors its state into React,
 * shared by the component and the provider.
 */
function useMessenger(props: Goya24Props): Goya24Handle {
  const {
    workspaceKey,
    origin,
    locale,
    theme,
    alignment,
    padding,
    launcher,
    user,
    onReady,
    onOpen,
    onClose,
    onUnread,
    onError,
  } = props;
  const messenger = useRef<Messenger | null>(null);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [unreadCount, setUnread] = useState(0);

  // Callbacks change identity on every render of the caller; reading them
  // through a ref keeps the messenger from being torn down and rebuilt each
  // time somebody passes an inline arrow function.
  const callbacks = useRef({ onReady, onOpen, onClose, onUnread, onError });
  callbacks.current = { onReady, onOpen, onClose, onUnread, onError };

  // Options that are part of the boot URL and the tag. Changing them means
  // a different messenger, so they are the effect's dependencies; the user
  // is handled separately below, because it can change without a reload.
  const paddingX = padding?.x;
  const paddingY = padding?.y;
  const initialUser = useRef(user);

  useEffect(() => {
    const options: MessengerOptions = { key: workspaceKey };
    if (origin) options.origin = origin;
    if (locale) options.locale = locale;
    if (theme) options.theme = theme;
    if (alignment) options.alignment = alignment;
    if (launcher === false) options.launcher = false;
    if (paddingX !== undefined || paddingY !== undefined) {
      options.padding = {};
      if (paddingX !== undefined) options.padding.x = paddingX;
      if (paddingY !== undefined) options.padding.y = paddingY;
    }
    if (initialUser.current) options.user = initialUser.current;

    const instance = load(options);
    messenger.current = instance;
    const known = instance.getState();
    setReady(known.ready);
    setOpen(known.open);
    setUnread(known.unread);

    const offs = [
      instance.on("ready", () => {
        setReady(true);
        callbacks.current.onReady?.();
      }),
      instance.on("open", () => {
        setOpen(true);
        setUnread(0);
        callbacks.current.onOpen?.();
      }),
      instance.on("close", () => {
        setOpen(false);
        callbacks.current.onClose?.();
      }),
      instance.on("unread", ({ count }) => {
        setUnread(count);
        callbacks.current.onUnread?.(count);
      }),
      instance.on("error", ({ reason }) => {
        callbacks.current.onError?.(reason);
      }),
    ];

    return () => {
      for (const off of offs) off();
      instance.destroy();
      messenger.current = null;
    };
  }, [workspaceKey, origin, locale, theme, alignment, paddingX, paddingY, launcher]);

  // A user who signs in after the messenger mounted is told about as a
  // claim. A proven identity (id + hash) has to be there at mount, because
  // it travels in the boot URL; changing it later cannot re-sign the boot.
  const userKey = user ? JSON.stringify(user) : "";
  const lastUserKey = useRef(userKey);
  useEffect(() => {
    if (userKey === lastUserKey.current) return;
    lastUserKey.current = userKey;
    if (user) messenger.current?.identify(user);
  }, [userKey, user]);

  const open = useCallback(() => messenger.current?.open(), []);
  const close = useCallback(() => messenger.current?.close(), []);
  const toggle = useCallback(() => messenger.current?.toggle(), []);
  const identify = useCallback((who: User) => messenger.current?.identify(who), []);

  return useMemo(
    () => ({ open, close, toggle, identify, ready, isOpen, unreadCount }),
    [open, close, toggle, identify, ready, isOpen, unreadCount],
  );
}

/**
 * Mounts the goya24 messenger for as long as it is rendered. Renders nothing
 * itself; the messenger lives in its own frame in the corner of the page.
 *
 * Put it once, in your root layout. To control it from your own buttons,
 * use `Goya24Provider` and `useGoya24()` instead.
 */
export function Goya24(props: Goya24Props): null {
  useMessenger(props);
  return null;
}

/**
 * The same as `<Goya24 />`, plus a context so any component underneath can
 * call `useGoya24()` to open the panel or read the unread count.
 */
export function Goya24Provider({ children, ...props }: Goya24Props & { children?: ReactNode }) {
  const handle = useMessenger(props);
  return <Goya24Context.Provider value={handle}>{children}</Goya24Context.Provider>;
}

/**
 * Control the messenger from anywhere under a `Goya24Provider`.
 *
 * ```tsx
 * const { open, unreadCount } = useGoya24();
 * <button onClick={open}>پشتیبانی {unreadCount > 0 && `(${unreadCount})`}</button>
 * ```
 */
export function useGoya24(): Goya24Handle {
  const handle = useContext(Goya24Context);
  if (!handle) {
    throw new Error("useGoya24() must be used under a <Goya24Provider>.");
  }
  return handle;
}
