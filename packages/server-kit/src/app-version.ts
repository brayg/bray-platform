/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

import { readFileSync } from "fs";

let cachedVersion: string | null = null;

/**
 * Reads the version field from the consuming app's own package.json.
 *
 * Takes an explicit path rather than guessing one by walking a fixed number
 * of directory levels from this module's own location: that assumption only
 * held while this package was consumed as raw source at a known depth inside
 * a monorepo. Once installed from npm, this module's location on disk (e.g.
 * node_modules/@heybray/server-kit/dist/) bears no fixed relationship to the
 * app's own root, so the caller must say where its package.json lives —
 * typically `path.resolve(import.meta.dirname, "../package.json")` from a
 * module at the app's own root.
 */
export function getAppVersion(appPackageJsonPath: string): string {
  if (cachedVersion) return cachedVersion;

  const pkg = JSON.parse(readFileSync(appPackageJsonPath, "utf-8")) as {
    version: string;
  };
  cachedVersion = pkg.version;
  return cachedVersion;
}
