/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import fs from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type pg from "pg";
import { createLogger } from "../logger.ts";

const log = createLogger("migrations");

/**
 * One set of migrations to apply, tracked independently of every other source's
 * migration history. Each `@heybray/*` package that ships schema migrations
 * registers its own source; the app registers its own `shared/`-schema
 * migrations too. Sources are applied in array order.
 */
export interface MigrationSource {
  /** Human-readable name, used only in log output. */
  name: string;
  /**
   * Absolute path to the migrations folder (drizzle-kit's output directory,
   * containing the SQL files + meta/_journal.json). Resolve this relative to
   * the caller's own `import.meta.url` — this function does not assume the
   * folder is co-located with server-kit itself.
   */
  folder: string;
  /**
   * Table name (in the `drizzle` schema) this source's applied-migration
   * history is tracked in. Must be unique per source so unrelated sources
   * never share migration history.
   */
  migrationsTable: string;
  /**
   * Table (in the `public` schema) whose presence indicates a database that
   * predates migration tracking for this source — e.g. one created via
   * `drizzle-kit push` before this source had a migrations/ folder at all.
   * When set, the source's baseline (first) migration is stamped as
   * already-applied on first run against such a database, so only true
   * incremental migrations run. Omit for sources that never had a
   * pre-migration-tracking era (i.e. every new package migration source
   * going forward).
   */
  legacyDetectionTable?: string;
}

type JournalEntry = { tag: string; when: number };

function readJournalEntries(folder: string): JournalEntry[] {
  const journalPath = path.join(folder, "meta", "_journal.json");
  const journal = JSON.parse(fs.readFileSync(journalPath, "utf8")) as {
    entries: Array<{ tag: string; when: number }>;
  };
  return journal.entries.map((entry) => ({ tag: entry.tag, when: entry.when }));
}

async function getLastAppliedCreatedAt(
  db: NodePgDatabase<any>,
  migrationsTable: string,
): Promise<number | null> {
  const tableExists = await db.execute<{ exists: boolean }>(sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'drizzle' AND table_name = ${migrationsTable}
    ) AS exists
  `);
  if (!tableExists.rows[0]?.exists) {
    return null;
  }

  const result = await db.execute<{ created_at: string }>(
    sql.raw(
      `SELECT created_at::text AS created_at FROM drizzle.${migrationsTable} ORDER BY created_at DESC LIMIT 1`,
    ),
  );
  const createdAt = result.rows[0]?.created_at;
  return createdAt == null ? null : Number(createdAt);
}

async function getPendingMigrations(
  db: NodePgDatabase<any>,
  source: MigrationSource,
): Promise<JournalEntry[]> {
  const entries = readJournalEntries(source.folder);
  const lastApplied = await getLastAppliedCreatedAt(db, source.migrationsTable);
  if (lastApplied == null) {
    return entries;
  }
  return entries.filter((entry) => entry.when > lastApplied);
}

/**
 * Databases created before this source had migration tracking (e.g. via
 * `drizzle-kit push`) have the schema but no migration history. Stamp the
 * baseline migration so only true incremental migrations run on upgrade.
 */
async function stampBaselineIfLegacyDatabase(
  db: NodePgDatabase<any>,
  source: MigrationSource,
) {
  if (!source.legacyDetectionTable) {
    return;
  }

  const detectionTable = await db.execute<{ exists: boolean }>(sql`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${source.legacyDetectionTable}
    ) AS exists
  `);
  const isLegacyDatabase = detectionTable.rows[0]?.exists === true;
  if (!isLegacyDatabase) {
    return;
  }

  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS drizzle`);
  await db.execute(
    sql.raw(
      `CREATE TABLE IF NOT EXISTS drizzle.${source.migrationsTable} (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )`,
    ),
  );

  const migrationCount = await db.execute<{ count: string }>(
    sql.raw(`SELECT COUNT(*)::text AS count FROM drizzle.${source.migrationsTable}`),
  );
  if (Number(migrationCount.rows[0]?.count ?? 0) > 0) {
    return;
  }

  const migrations = readMigrationFiles({ migrationsFolder: source.folder });
  const baseline = migrations[0];
  if (!baseline) {
    throw new Error(`No baseline migration found in ${source.folder}`);
  }

  await db.execute(
    sql.raw(
      `INSERT INTO drizzle.${source.migrationsTable} (hash, created_at) VALUES ('${baseline.hash}', ${baseline.folderMillis})`,
    ),
  );

  log.info(`Stamped baseline migration for legacy database (${source.name})`, {
    tag: "0000_initial",
  });
}

async function runMigrationSource(
  db: NodePgDatabase<any>,
  pool: pg.Pool,
  source: MigrationSource,
): Promise<void> {
  await stampBaselineIfLegacyDatabase(db, source);

  log.info(`Checking for migrations (${source.name})`);

  const pending = await getPendingMigrations(db, source);
  if (pending.length === 0) {
    log.info(`No migrations pending (${source.name})`);
    return;
  }

  const migrationDb = drizzle(pool);
  await migrate(migrationDb, {
    migrationsFolder: source.folder,
    migrationsTable: source.migrationsTable,
    migrationsSchema: "drizzle",
  });

  for (const migration of pending) {
    log.info(`Applied migration ${migration.tag} (${source.name})`);
  }
}

/**
 * Apply every pending migration for every source, in array order. Each source
 * tracks its own applied-migration history independently (via its own
 * `migrationsTable`), so one source's migrations never block or interfere
 * with another's.
 */
export async function runMigrations(
  db: NodePgDatabase<any>,
  pool: pg.Pool,
  sources: MigrationSource[],
): Promise<void> {
  for (const source of sources) {
    await runMigrationSource(db, pool, source);
  }
}
