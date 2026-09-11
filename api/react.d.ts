import * as react from 'react';
import { ReactNode } from 'react';
import { MessengerOptions, User } from '@goya24/messenger';
export { Alignment, Locale, Messenger, MessengerEvent, MessengerEvents, MessengerOptions, MessengerState, Theme, User } from '@goya24/messenger';

interface Goya24Props extends Omit<MessengerOptions, "key"> {
    /** The workspace's public key, from Settings → Install. */
    workspaceKey: string;
    onReady?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
    /** Replies that arrived while the panel was shut — for a badge on your own button. */
    onUnread?: (count: number) => void;
    onError?: (reason: string) => void;
}
interface Goya24Handle {
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
/**
 * Mounts the goya24 messenger for as long as it is rendered. Renders nothing
 * itself; the messenger lives in its own frame in the corner of the page.
 *
 * Put it once, in your root layout. To control it from your own buttons,
 * use `Goya24Provider` and `useGoya24()` instead.
 */
declare function Goya24(props: Goya24Props): null;
/**
 * The same as `<Goya24 />`, plus a context so any component underneath can
 * call `useGoya24()` to open the panel or read the unread count.
 */
declare function Goya24Provider({ children, ...props }: Goya24Props & {
    children?: ReactNode;
}): react.JSX.Element;
/**
 * Control the messenger from anywhere under a `Goya24Provider`.
 *
 * ```tsx
 * const { open, unreadCount } = useGoya24();
 * <button onClick={open}>پشتیبانی {unreadCount > 0 && `(${unreadCount})`}</button>
 * ```
 */
declare function useGoya24(): Goya24Handle;

export { Goya24, type Goya24Handle, type Goya24Props, Goya24Provider, useGoya24 };
