# @goya24/react

## 0.3.0

### Minor Changes

- [#19](https://github.com/Goya-24/goya24-js/pull/19) [`c2d5c08`](https://github.com/Goya-24/goya24-js/commit/c2d5c08e912f17b935d2cb114d052492577c4ec8) Thanks [@aryasadeghy](https://github.com/aryasadeghy)! - `update({ launcher, alignment, padding })` moves the messenger, or takes the launcher away and brings it back, after it has loaded — without reloading it, so a conversation in progress stays open. A key left out keeps its value; `null` hands it back to the workspace's own setting. `get()?.update(…)` works from any page of a single-page app. In React, changing the `launcher`, `alignment` or `padding` props now calls it instead of tearing the messenger down and loading it again, and `update()` is on the handle `useGoya24()` returns in React and in Vue. It needs the `widget.js` goya24.com serves from this release on; an older one leaves the messenger where it was and says so once on the console.

### Patch Changes

- Updated dependencies [[`c2d5c08`](https://github.com/Goya-24/goya24-js/commit/c2d5c08e912f17b935d2cb114d052492577c4ec8), [`c2d5c08`](https://github.com/Goya-24/goya24-js/commit/c2d5c08e912f17b935d2cb114d052492577c4ec8)]:
  - @goya24/messenger@0.3.0

## 0.2.0

### Minor Changes

- [#14](https://github.com/Goya-24/goya24-js/pull/14) [`559362e`](https://github.com/Goya-24/goya24-js/commit/559362e916f94c9fa8b044829da6bdf68f365b92) Thanks [@aryasadeghy](https://github.com/aryasadeghy)! - `launcher: false` hides the messenger's own bubble, for a site that has drawn its own support button: nothing is placed in the corner, the shut messenger takes no space and no clicks anywhere on the page, and the open panel has no bubble under it either — its header's close button is the way out. The panel is opened with `open()`, as it already could be. Every site that does not pass the option is unaffected.

### Patch Changes

- [`5582a3d`](https://github.com/Goya-24/goya24-js/commit/5582a3dbf4285808cc035318a079f65df898d204) Thanks [@aryasadeghy](https://github.com/aryasadeghy)! - Types now resolve correctly for CommonJS consumers too: the `exports` map declares separate `types` for the `import` and `require` conditions (`index.d.ts` / `index.d.cts`), as publint and arethetypeswrong require.

- Updated dependencies [[`559362e`](https://github.com/Goya-24/goya24-js/commit/559362e916f94c9fa8b044829da6bdf68f365b92), [`5582a3d`](https://github.com/Goya-24/goya24-js/commit/5582a3dbf4285808cc035318a079f65df898d204)]:
  - @goya24/messenger@0.2.0

## 0.1.0

### Minor Changes

- [`0d12200`](https://github.com/Goya-24/goya24-js/commit/0d12200b2d4dfc2c892078e767db0ec353289f39) Thanks [@aryasadeghy](https://github.com/aryasadeghy)! - First release: a framework-free core that loads the goya24 messenger and controls it (`open`, `close`, `toggle`, `identify`, events for `ready`/`open`/`close`/`unread`/`error`), and thin wrappers for React and Next.js (`<Goya24 />`, `<Goya24Provider>`, `useGoya24()`), Vue 3 (`createGoya24()`, `useGoya24()`) and Nuxt 3 (`@goya24/nuxt` module with `runtimeConfig.public.goya24`).

### Patch Changes

- Updated dependencies [[`0d12200`](https://github.com/Goya-24/goya24-js/commit/0d12200b2d4dfc2c892078e767db0ec353289f39)]:
  - @goya24/messenger@0.1.0
