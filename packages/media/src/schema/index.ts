/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

export * from "./media-assets.ts";

import { mediaAssets } from "./media-assets.ts";

/** Tables contributed to the app's composed drizzle schema. */
export const mediaSchema = { mediaAssets };
