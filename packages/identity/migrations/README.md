# @heybray/identity migrations

This package has not yet shipped a schema migration.

When it does: SQL files go here, registered in `meta/_journal.json` matching the
format in `bray-scenarios/server/drizzle/`, tracked in a dedicated
`__migrations_identity` table (via `@heybray/server-kit`'s `runMigrations()`,
passed as one more entry in the app's `sources` array).
