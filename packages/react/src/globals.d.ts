/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

// Build-time constant injected by the host app's bundler (Vite `define`).
// Declared here so the package typechecks standalone; the value is supplied
// when the consuming app builds.
declare const __APP_VERSION__: string;
