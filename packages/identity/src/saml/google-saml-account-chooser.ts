/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

import { getSamlProviderName } from "../auth-config.ts";

function isGoogleSamlProvider(): boolean {
  return getSamlProviderName().trim().toLowerCase() === "google";
}

export function shouldUseGoogleAccountChooser(): boolean {
  if (!isGoogleSamlProvider()) {
    return false;
  }

  const explicit = process.env.SAML_GOOGLE_ACCOUNT_CHOOSER?.trim().toLowerCase();
  if (explicit === "false" || explicit === "0") {
    return false;
  }

  return true;
}

export function wrapGoogleSamlAuthorizeUrl(authorizeUrl: string): string {
  const params = new URLSearchParams();
  params.set("continue", authorizeUrl);

  const hostedDomain = process.env.SAML_GOOGLE_HD?.trim();
  if (hostedDomain) {
    params.set("hd", hostedDomain);
  }

  return `https://accounts.google.com/AccountChooser?${params.toString()}`;
}
