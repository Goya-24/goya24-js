---
"@goya24/messenger": patch
"@goya24/react": patch
"@goya24/vue": patch
"@goya24/nuxt": patch
---

Types now resolve correctly for CommonJS consumers too: the `exports` map declares separate `types` for the `import` and `require` conditions (`index.d.ts` / `index.d.cts`), as publint and arethetypeswrong require.
