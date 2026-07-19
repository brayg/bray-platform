/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

const PROVIDER_ICON_FILES = new Set(["google", "okta", "microsoft"]);

export function getOidcProviderIcon(providerName: string): string | null {
  const filename = providerName.trim().toLowerCase();
  if (!PROVIDER_ICON_FILES.has(filename)) return null;
  return new URL(`../assets/sso-${filename}.svg`, import.meta.url).href;
}
