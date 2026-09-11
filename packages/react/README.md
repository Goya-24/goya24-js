# @goya24/react

The [goya24](https://goya24.com) support messenger for React and Next.js. A component that mounts it, a provider and a hook that control it. ~0.9 kB on top of `@goya24/messenger`.

```sh
npm i @goya24/react
```

```tsx
import { Goya24 } from "@goya24/react";

// Once, in your root layout. Renders nothing; the messenger lives in its own frame.
<Goya24 workspaceKey={process.env.NEXT_PUBLIC_GOYA24_KEY!} locale="fa" />;
```

Open it from your own button:

```tsx
import { Goya24Provider, useGoya24 } from "@goya24/react";

function SupportButton() {
  const { open, unreadCount } = useGoya24();
  return <button onClick={open}>پشتیبانی {unreadCount > 0 && `(${unreadCount})`}</button>;
}

<Goya24Provider workspaceKey="d24_pk_…">
  <App />
  <SupportButton />
</Goya24Provider>;
```

The package is a client module (`"use client"`), so it drops straight into a Next.js App Router layout. Props mirror the core's options (`origin`, `locale`, `theme`, `alignment`, `padding`, `user`) plus `onReady`, `onOpen`, `onClose`, `onUnread(count)` and `onError(reason)`. Changing `user` after mount announces the new person as a claim; a proven identity (`id` + `hash`) has to be present at mount.

Full documentation in the [repository README](https://github.com/Goya-24/goya24-js#readme).

MIT © Goya24
