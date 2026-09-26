---
"@goya24/messenger": minor
"@goya24/react": minor
"@goya24/vue": minor
"@goya24/nuxt": minor
---

`update({ launcher, alignment, padding })` moves the messenger, or takes the launcher away and brings it back, after it has loaded — without reloading it, so a conversation in progress stays open. A key left out keeps its value; `null` hands it back to the workspace's own setting. `get()?.update(…)` works from any page of a single-page app. In React, changing the `launcher`, `alignment` or `padding` props now calls it instead of tearing the messenger down and loading it again, and `update()` is on the handle `useGoya24()` returns in React and in Vue. It needs the `widget.js` goya24.com serves from this release on; an older one leaves the messenger where it was and says so once on the console.
