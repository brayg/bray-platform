/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message?: string) {
    super(message || `HTTP ${status}`);
    this.name = "HttpError";
    this.status = status;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}
