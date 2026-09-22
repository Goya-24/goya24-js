# @goya24/messenger

Load and control the [goya24](https://goya24.com) support messenger from any page. Framework-free, ~1.4 kB, TypeScript.

```sh
npm i @goya24/messenger
```

```ts
import { load } from "@goya24/messenger";

const messenger = load({ key: "d24_pk_…", locale: "fa" });

button.addEventListener("click", () => messenger.open());
messenger.on("unread", ({ count }) => (badge.textContent = count ? String(count) : ""));
```

- `load(options)` puts the messenger on the page, or adopts a script tag that is already there. Idempotent.
- `launcher: false` hides our bubble for a site that has its own support button — nothing in the corner, nothing under the open panel; you call `open()`.
- `open()`, `close()`, `toggle()`, `identify(user)`, `destroy()`.
- `on(event, handler)` for `ready`, `open`, `close`, `unread`, `error`; returns the unsubscribe.
- `getState()` → `{ ready, open, unread }`; `ready` is a promise.
- Calls made before the messenger has booted are queued and run in order.

Full documentation, the options table and the identity signing notes are in the [repository README](https://github.com/Goya-24/goya24-js#readme).

MIT © Goya24
