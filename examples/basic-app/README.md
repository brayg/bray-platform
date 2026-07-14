# basic-app

A minimal example app proving `@heybray/*` packages compose into a real, running
application. This is **not** a second real app (that's Phase 5) — it's the CI
regression net for the build pipeline (`tsup`, Step 3) and migration runner
(`runMigrations`, Step 5), and it must consume every package's **built** `dist/`
output, not source, so a green run here proves the published shape actually works.

## What it wires together

- `@heybray/server-kit` — `createDb`/`setDatabase` for the composed schema,
  `runMigrations` for a single `app` migration source, `requestLogging`.
- `@heybray/identity` — local email/password auth (`authenticationRouter`,
  `usersRouter`), admin setup flow, JWT middleware.
- `@heybray/taxonomy` — one classification dimension (`category`, two options:
  Personal/Work).
- `@heybray/gamification` — configured with `contentTypes: [{ type: "note",
  label: "Note" }]`; completing a note awards a single Bronze tier (10 points)
  and shows up on the leaderboard / progress panel / points history.
- `@heybray/ui`, `@heybray/react`, `@heybray/gamification-react` — the client:
  login/register pages, the notes list, `YourProgressPanel` and
  `LeaderboardPanel`.

The app's own contribution is just the `notes` table + its 2 trivial
migrations (initial create + an `is_pinned` column, added deliberately to
prove the incremental-migration path, not just a fresh baseline). Every other
table (`users`, `roles`, `classification_dimensions`, `reward_tiers`, …) comes
from the packages' own schema files via the same `drizzle.config.ts` schema
glob bray-scenarios itself uses — packages don't ship their own migrations yet
(see the Phase 4 brief's scope reductions), so their tables are still created
by this app's migration set, same as today.

## Running it locally

Requires a Postgres instance. Quickest way:

```bash
docker run -d --rm --name basic-app-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=basic_app -p 5433:5432 postgres:16-alpine
```

From the repo root, build every package first (the example consumes `dist/`,
not `src/`):

```bash
npm install
npm run build
```

Then, from `examples/basic-app/`:

```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5433/basic_app
npm run db:init      # applies drizzle/ migrations, seeds roles + taxonomy
npm run dev:server   # API on :3101
npm run dev:client   # Vite dev server on :5174, proxies /api to :3101
```

Open http://localhost:5174 — you'll land on the setup screen to create the
first admin account, then can add notes, mark them done, and watch points /
the leaderboard update.

## Regenerating migrations

If you change `server/schema/notes.ts` (or any package's schema), regenerate:

```bash
DATABASE_URL=... npm run db:generate -- --name your_migration_name
```
