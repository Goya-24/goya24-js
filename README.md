<p align="center">
  <img src="https://raw.githubusercontent.com/Goya-24/.github/main/profile/goya24-icon.svg" width="72" alt="">
</p>

<h1 align="center">goya24 JavaScript SDK</h1>

<p align="center">
  Put the <a href="https://goya24.com">goya24</a> AI support messenger on any site with one call — then open it from your own button, tell it who is signed in, and badge unread replies.
</p>

<p align="center">
  <a href="https://github.com/Goya-24/goya24-js/actions/workflows/ci.yml"><img src="https://github.com/Goya-24/goya24-js/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@goya24/messenger"><img src="https://img.shields.io/npm/v/@goya24/messenger?label=%40goya24%2Fmessenger" alt="npm"></a>
  <a href="https://www.npmjs.com/package/@goya24/react"><img src="https://img.shields.io/npm/v/@goya24/react?label=%40goya24%2Freact" alt="npm"></a>
  <a href="https://www.npmjs.com/package/@goya24/vue"><img src="https://img.shields.io/npm/v/@goya24/vue?label=%40goya24%2Fvue" alt="npm"></a>
  <a href="https://www.npmjs.com/package/@goya24/nuxt"><img src="https://img.shields.io/npm/v/@goya24/nuxt?label=%40goya24%2Fnuxt" alt="npm"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-0e7c86" alt="MIT"></a>
</p>

## Packages

| Package                                   | For                     | Size (min+br) |
| ----------------------------------------- | ----------------------- | ------------- |
| [`@goya24/messenger`](packages/messenger) | Any site, any framework | ~1.4 kB       |
| [`@goya24/react`](packages/react)         | React **and Next.js**   | ~0.9 kB       |
| [`@goya24/vue`](packages/vue)             | Vue 3                   | ~0.5 kB       |
| [`@goya24/nuxt`](packages/nuxt)           | Nuxt 3                  | module        |

All four share one version line. The wrappers are thin: everything they do, `@goya24/messenger` does, and the messenger itself is served by goya24 — the SDK never carries a copy of the UI, so a fix on the server reaches every site without a redeploy.

Don't use a bundler? The **script tag** from _Settings → Install_ in your goya24 workspace works everywhere, and the SDK is a typed wrapper over exactly that script. You can start with the tag and switch later; the SDK adopts a tag that is already on the page.

## Quick start

You need your workspace's public key from **Settings → Install**. It looks like `d24_pk_…`.

### Plain JavaScript / TypeScript

```sh
npm i @goya24/messenger
```

```ts
import { load } from "@goya24/messenger";

const messenger = load({
  key: "d24_pk_…",
  locale: "fa", // or "en"; defaults to the page's <html lang>
});

document.querySelector("#support")!.addEventListener("click", () => messenger.open());

messenger.on("unread", ({ count }) => {
  badge.textContent = count ? String(count) : "";
});
```

### React and Next.js

```sh
npm i @goya24/react
```

Put it once, in your root layout. It renders nothing itself; the messenger lives in its own frame in the corner of the page.

```tsx
// app/layout.tsx (App Router) — the package is a client module already
import { Goya24 } from "@goya24/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
        <Goya24 workspaceKey={process.env.NEXT_PUBLIC_GOYA24_KEY!} />
      </body>
    </html>
  );
}
```

To open it from your own button, use the provider and the hook:

```tsx
import { Goya24Provider, useGoya24 } from "@goya24/react";

function SupportButton() {
  const { open, unreadCount } = useGoya24();
  return <button onClick={open}>پشتیبانی {unreadCount > 0 && <span>{unreadCount}</span>}</button>;
}

export default function App() {
  return (
    <Goya24Provider workspaceKey={import.meta.env.VITE_GOYA24_KEY}>
      <Routes />
      <SupportButton />
    </Goya24Provider>
  );
}
```

### Vue 3

```sh
npm i @goya24/vue
```

```ts
// main.ts
import { createGoya24 } from "@goya24/vue";

app.use(createGoya24({ key: import.meta.env.VITE_GOYA24_KEY, locale: "fa" }));
```

```vue
<script setup lang="ts">
import { useGoya24 } from "@goya24/vue";
const { open, state } = useGoya24();
</script>

<template>
  <button @click="open">
    پشتیبانی <span v-if="state.unread">{{ state.unread }}</span>
  </button>
</template>
```

### Nuxt 3

```sh
npm i @goya24/nuxt
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@goya24/nuxt"],
  goya24: { locale: "fa" },
});
```

Set the key in the environment as `NUXT_PUBLIC_GOYA24_KEY` (or as `goya24.key` in the config). `useGoya24()` from `@goya24/vue` works in every component; the plugin runs on the client only.

## Identifying the signed-in customer

Tell the messenger who is talking so the agent can look up their orders instead of asking who they are.

```ts
load({
  key: "d24_pk_…",
  user: {
    id: "u_1024",
    hash: "<HMAC-SHA256 of the id, computed on your server>",
    email: "sara@example.com",
    name: "Sara",
    plan: "growth",
    traits: { orders: 12 },
  },
});
```

With `id` and `hash` the identity is **proven**: your server signs the id with the key from _Settings → Install_, and the messenger checks the signature before trusting anything. Without them the details are still sent, as a **claim** — useful, and the inbox marks it as one.

A proven identity has to be there when the messenger loads, because it travels in the boot request. Someone who signs in later can be announced with `identify(user)`; that is a claim.

## API

### `load(options): Messenger`

Puts the messenger on the page, or adopts one the site's script tag already installed. Idempotent: the second call returns the same instance. Browser-only; from a server-rendered framework, call it in an effect (the wrappers do).

| Option      | Type                         | Default              |
| ----------- | ---------------------------- | -------------------- |
| `key`       | `string`                     | — (required)         |
| `origin`    | `string`                     | `https://goya24.com` |
| `locale`    | `"fa" \| "en"`               | the page's `lang`    |
| `theme`     | `"light" \| "dark"`          | the page's scheme    |
| `alignment` | `"left" \| "right"`          | `"right"`            |
| `padding`   | `{ x?: number; y?: number }` | `20`                 |
| `user`      | `User`                       | —                    |

### `Messenger`

| Member                            | What it does                                                             |
| --------------------------------- | ------------------------------------------------------------------------ |
| `open()` / `close()` / `toggle()` | Show or hide the panel.                                                  |
| `identify(user)`                  | Tell the messenger who is signed in. Safe before it is ready.            |
| `on(event, handler)`              | Listen; returns the unsubscribe function.                                |
| `getState()`                      | `{ ready, open, unread }` right now.                                     |
| `ready`                           | A promise that resolves once the messenger has booted. It never rejects. |
| `destroy()`                       | Remove the messenger. `load()` may be called again afterwards.           |

Events: `ready`, `open`, `close`, `unread` (`{ count }`), `error` (`{ reason }`). A listener that throws does not stop the others.

Every call made before the messenger is ready is queued and runs in order once it is.

## Browser support

Every browser the messenger itself supports: the last two versions of Chrome, Firefox, Safari and Edge, and iOS Safari 15+. The packages ship ES2020; if you support older browsers, your bundler's usual transpilation applies.

## Development

```sh
pnpm install
pnpm test        # vitest, every package
pnpm lint        # eslint + prettier
pnpm typecheck
pnpm build       # tsup → dist/ for every package
pnpm size        # bundle size against the limits in package.json
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for how changes ship, and [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

[MIT](LICENSE) © Goya24
