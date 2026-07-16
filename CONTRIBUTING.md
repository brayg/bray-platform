# Contributing to bray-platform

Thanks for your interest in contributing. A few things to know before you open a PR.

## Licensing and the CLA

Every package in this repo is licensed AGPL-3.0-only. The maintainer also ships commercial
licenses and proprietary extensions built on top of this same code — that dual model is what
funds ongoing development of the open-source platform.

For the maintainer to be able to include your contribution in both the open-source packages
*and* those commercial/proprietary offerings, we need a Contributor License Agreement (CLA)
on file. The CLA does not take away your rights to your own contribution — it grants the
maintainer the additional rights needed to relicense it alongside the rest of the codebase.

You'll be prompted to sign the CLA automatically the first time you open a pull request, via
a bot comment. Signing is a one-time action per contributor (tracked in this repo, no external
service).

## Development

- Node >= 20, npm >= 10. This repo uses npm workspaces + Turborepo; do not introduce another
  package manager.
- `npm install` at the repo root installs and links all packages.
- `npm run build` builds every package (via `turbo run build`, in dependency order).
- `npm run typecheck` typechecks every package.
- `npm run lint` / `npm run lint:fix` runs the SPDX license-header check (and future lint
  rules) across every package's `src/`.
- Every source file under `packages/*/src/**/*.{ts,tsx}` must carry the SPDX header enforced
  by `@heybray/dev-config`'s eslint config. Run `npm run lint:fix` to add it automatically to
  new files.

## Pull requests

- One logical change per PR where reasonable.
- Add a [changeset](https://github.com/changesets/changesets) (`npx changeset add`) for any
  change that should trigger a version bump on publish.
- Make sure `npm run build`, `npm run typecheck`, and `npm run lint` all pass before requesting
  review.

## Publishing to npm

CI publishes via `.github/workflows/release.yml` when a "Version Packages" PR merges to `main`.
The workflow needs a repo secret **`NPM_TOKEN`**: an npm **Automation** token (not Publish) for the
`brayg` account with write access to the `@heybray` scope. If the token is missing or invalid,
`npm publish` fails with a misleading **`E404 Not Found`** on scoped packages — that is an auth
failure, not a missing package.

To publish manually (same as CI):

```bash
npm ci
npx turbo run build
npx changeset publish
```

Requires `npm whoami` to return `brayg` (or another maintainer on the `@heybray` packages).
