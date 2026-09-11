# Changesets

Every change that a user of a package could notice gets a changeset: a short
markdown file in this folder saying which packages changed and how much
(`patch`, `minor`, `major`). Run `pnpm changeset` and answer the prompts; the
file goes in with your pull request.

On merge to `main`, the release workflow opens (or updates) a "Version
Packages" pull request that bumps versions and writes the changelogs from
those files. Merging that PR publishes to npm with provenance.

The four packages are _linked_: they share a version line, so `@goya24/react
1.4.0` always pairs with `@goya24/messenger 1.4.x`.
