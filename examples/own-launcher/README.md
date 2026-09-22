# A launcher of your own

The messenger with **no bubble of ours**: this site draws its own «سوال دارم» button, opens the panel with `open()`, and closes it with a round button of its own in the same corner.

Nuxt 3 here, but the two settings are the same everywhere — see [the script tag](#without-a-framework) below.

## The two settings

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@goya24/nuxt"],
  goya24: {
    launcher: false, // no bubble of ours, anywhere
    padding: { y: 104 }, // lift the open panel past your own close button
  },
});
```

- **`launcher: false`** — nothing is drawn in the corner, and while the messenger is shut its frame takes no space and no clicks anywhere on the page, so your own button is yours. The open panel has no bubble under it either; its header's × still closes it.
- **`padding: { y: … }`** — the open panel sits in the corner it opens in. If your close button lives there too, raise the panel past it, or it covers the button: a button under our frame cannot be clicked at all. The number is your button's height plus the gap it keeps from the bottom edge — 56 + 24 = 104 in this example.

## Your two buttons

`state` is reactive, so the site swaps its own buttons on it:

```vue
<script setup lang="ts">
const { open, close, state } = useGoya24();
</script>

<template>
  <button v-if="!state.open" @click="open">سوال دارم</button>
  <button v-else @click="close">✕</button>
</template>
```

`state.unread` is the count of replies that arrived while the panel was shut — the badge on the pill here. With the plain package it is the same thing through events: `messenger.on("open" | "close" | "unread", …)`.

## On a phone

The panel takes the whole screen, as in every messenger, so your own button is not reachable while it is open. The panel's own × is the way out there; `padding` is ignored on phones for the same reason.

## Without a framework

The same two settings are attributes on the script tag:

```html
<script
  src="https://goya24.com/widget.js"
  data-key="d24_pk_…"
  data-locale="fa"
  data-launcher="none"
  data-vertical-padding="104"
  defer
></script>
<script>
  myOpenButton.onclick = () => window.goya24.open();
  myCloseButton.onclick = () => window.goya24.close();
  window.goya24.on("open", () => swap(true));
  window.goya24.on("close", () => swap(false));
</script>
```

## Running it

```sh
cp .env.example .env   # put your workspace key in it
pnpm dev
```

`NUXT_PUBLIC_GOYA24_ORIGIN` points the messenger at a local goya24 while developing the platform itself; leave it out otherwise.
