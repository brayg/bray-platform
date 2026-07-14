/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

export { AppErrorBoundary } from "./AppErrorBoundary";
export { BrandedErrorScreen } from "./BrandedErrorScreen";
export type { BrandedErrorScreenAction, BrandedErrorScreenProps } from "./BrandedErrorScreen";
export { getHttpErrorContent, HttpErrorScreen, HTTP_ERROR_CONTENT } from "./http-errors";
export {
  AuthUnavailableScreen,
  InternalServerErrorScreen,
  NotFoundScreen,
  PageNotFoundScreen,
  PermissionDeniedScreen,
  ServiceUnavailableScreen,
  SignInFailedScreen,
} from "./error-screens";
