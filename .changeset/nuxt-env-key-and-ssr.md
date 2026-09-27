---
"@goya24/nuxt": patch
---

A key given as `NUXT_PUBLIC_GOYA24_KEY` now reaches the messenger, and a page that calls `useGoya24()` renders on the server instead of failing. Nuxt applies an environment variable only to a runtime config field that already exists, and the module never declared `key`, so the variable the README recommends was ignored: the browser said "no key" and the messenger never loaded. The module now declares every field the environment may set (`key`, `origin`, `locale`, `theme`, `alignment`, `launcher`). The plugin was browser-only, so any page calling `useGoya24()` threw while being rendered on the server and answered 500. It now runs on the server as well, where it loads nothing, and without a key it gives a handle that does nothing instead of throwing.
