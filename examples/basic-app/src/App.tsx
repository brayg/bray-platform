/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { queryClient } from "@heybray/react/lib/queryClient";
import { AuthProvider } from "@heybray/react/hooks/use-auth";
import { AppConfigProvider } from "@heybray/react/config";
import { ProtectedRoute } from "@heybray/react/components/ProtectedRoute";
import { Toaster } from "@heybray/ui/components/toaster";
import LoginPage from "@heybray/react/pages/LoginPage";
import RegisterPage from "@heybray/react/pages/RegisterPage";
import logoSrc from "./logo.svg";
import heroImageSrc from "./hero.svg";
import { NotesPage } from "./pages/NotesPage.tsx";

const appConfig = {
  displayName: "Basic App",
  tagline: "bray-platform composition example",
  urls: { repo: "https://github.com/heybray-labs/bray-platform" },
  routes: {
    contentPath: (contentType: string, contentId: number) => `/notes/${contentId}`,
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppConfigProvider value={appConfig}>
        <AuthProvider>
          <Switch>
            <Route path="/login">
              <LoginPage logoSrc={logoSrc} heroImageSrc={heroImageSrc} />
            </Route>
            <Route path="/register">
              <RegisterPage logoSrc={logoSrc} heroImageSrc={heroImageSrc} />
            </Route>
            <Route path="/">
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            </Route>
          </Switch>
          <Toaster />
        </AuthProvider>
      </AppConfigProvider>
    </QueryClientProvider>
  );
}
