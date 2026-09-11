# Contributing

Thanks for looking. This repo holds the goya24 JavaScript SDK: a core package and three thin wrappers, all versioned together.

## Setup

- Node 20.19 or newer (`.nvmrc` says 22) and [pnpm](https://pnpm.io) — `corepack enable` installs the version pinned in `package.json`.
- `pnpm install`, then `pnpm test` to make sure the tree is green before you change anything.

## Working on it

- `pnpm test:watch` runs Vitest across every package. Tests live next to the code (`*.test.ts`), and the packages resolve each other from source, so you never need a build to run them.
- `pnpm lint` is ESLint plus Prettier; `pnpm format` fixes what it can.
- `pnpm build` produces `dist/` for every package with tsup; `pnpm size` checks the gzipped size against the limits in the root `package.json`. A change that grows a package past its limit needs a reason in the PR.
- The examples under `examples/` are real apps that CI builds. If you change an API, update the example that uses it.

## The public API is written down

`api/<package>.d.ts` is a copy of each package's built type declarations, and CI fails when the build no longer matches it. That is deliberate: anything a user could have written code against is visible in the pull request as a diff, and cannot change by accident. When a change to it is meant, run `pnpm api`, commit the updated report, and pick the bump in the changeset honestly — an added export is a minor, a removed or narrowed one is a major.

`pnpm publish:check` runs [publint](https://publint.dev) and [arethetypeswrong](https://arethetypeswrong.github.io) on what `npm pack` would ship, so `exports`, the ESM/CJS pair and their types resolve for every kind of consumer.

## What a change needs

1. **A test.** A bug fix comes with the test that would have caught it. A feature comes with tests for what it does and for what it refuses.
2. **A changeset.** Run `pnpm changeset` and say which packages changed and whether it is a patch, minor or major. Merging to `main` turns changesets into a release PR; merging that publishes. Internal refactors that a user could not notice need no changeset.
3. **The README.** If a package's behaviour changed, its README describes the new behaviour.

## Things that are already decided

- **The loader's names do not change.** `widget.js` installs `window.dastyar24`, uses `__dastyar24Loaded`, and posts messages with `source: "dastyar24"`. Those predate the goya24 brand and are a contract with every site that already embeds the script. The SDK wraps them; it never renames them.
- **The wrappers stay thin.** Anything a wrapper can do, `@goya24/messenger` does first. If you find yourself adding logic to `@goya24/react` that is not about React, it belongs in the core.
- **No UI in the SDK.** The messenger is served by goya24 inside its own frame. The SDK loads it and talks to it; it never carries a copy.
- **One version line.** The four packages are linked in changesets, so a release bumps them together.

## Reporting a bug

Open an issue with the smallest page that reproduces it — a StackBlitz link is ideal. Say which package and version, which framework, which browser. Anything the console printed helps.

## Code of conduct

Be kind and be specific. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
