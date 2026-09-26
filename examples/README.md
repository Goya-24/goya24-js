# Examples

Each folder is a small, runnable app that CI builds on every change, so the snippets in the READMEs are known to work.

| Folder         | Shows                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| `vanilla`      | `@goya24/messenger` from plain TypeScript with Vite                                                           |
| `next-app`     | `@goya24/react` in a Next.js App Router layout, with a support button, and no bubble on `/account`            |
| `vite-vue`     | `@goya24/vue` as a plugin, `useGoya24()` in a component                                                       |
| `nuxt-app`     | `@goya24/nuxt` with the key from the environment                                                              |
| `own-launcher` | `launcher: false` — the site's own open and close buttons, our bubble gone ([README](own-launcher/README.md)) |

Copy `.env.example` to `.env` in the example you want, put your workspace key in it, then `pnpm dev` inside the folder. `*_GOYA24_ORIGIN` points the messenger at a local goya24 while developing the platform itself; leave it out otherwise.
