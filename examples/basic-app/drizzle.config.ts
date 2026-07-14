/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL not found. Please configure DATABASE_URL environment variable.");
}

// Same pattern as bray-scenarios/server/drizzle.config.ts: one composed schema
// glob covering this app's own tables plus every package's schema, generating
// one migration set. See scope reduction #1 in docs/phase-4-implementation.md —
// packages don't ship their own migrations yet, so their tables are still
// created via the app's migrations, same as today.
export default defineConfig({
  out: "./drizzle",
  schema: ["./server/schema/**/*.ts", "../../packages/*/src/schema/**/*.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
