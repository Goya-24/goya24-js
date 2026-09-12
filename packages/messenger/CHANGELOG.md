# @goya24/messenger

## 0.1.1

### Patch Changes

- [`5582a3d`](https://github.com/Goya-24/goya24-js/commit/5582a3dbf4285808cc035318a079f65df898d204) Thanks [@aryasadeghy](https://github.com/aryasadeghy)! - Types now resolve correctly for CommonJS consumers too: the `exports` map declares separate `types` for the `import` and `require` conditions (`index.d.ts` / `index.d.cts`), as publint and arethetypeswrong require.

## 0.1.0

### Minor Changes

- [`0d12200`](https://github.com/Goya-24/goya24-js/commit/0d12200b2d4dfc2c892078e767db0ec353289f39) Thanks [@aryasadeghy](https://github.com/aryasadeghy)! - First release: a framework-free core that loads the goya24 messenger and controls it (`open`, `close`, `toggle`, `identify`, events for `ready`/`open`/`close`/`unread`/`error`), and thin wrappers for React and Next.js (`<Goya24 />`, `<Goya24Provider>`, `useGoya24()`), Vue 3 (`createGoya24()`, `useGoya24()`) and Nuxt 3 (`@goya24/nuxt` module with `runtimeConfig.public.goya24`).
