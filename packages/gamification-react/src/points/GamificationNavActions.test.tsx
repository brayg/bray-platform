/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppConfigProvider, type AppConfig } from "@heybray/react/config";
import { GamificationNavActions } from "./GamificationNavActions.tsx";

const navigate = vi.fn();

vi.mock("wouter", () => ({
  useLocation: () => ["/", navigate],
}));

vi.mock("@heybray/react/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: 1, email: "learner@test.local" },
    hasRole: (role: string) => role === "admin",
  }),
}));

vi.mock("@heybray/react/lib/queryClient", () => ({
  apiRequest: vi.fn(async (method: string, path: string) => {
    if (method === "GET" && path === "/api/teams") {
      return { teams: [{ id: 1 }] };
    }
    if (method === "GET" && path === "/api/points/me") {
      return { total: 120, monthTotal: 15 };
    }
    throw new Error(`Unexpected ${method} ${path}`);
  }),
}));

const appConfig: AppConfig = {
  displayName: "Test",
  urls: { repo: "https://example.com/repo" },
  routes: {
    contentPath: () => "/",
    teamStarMapPath: "/team-star-map",
  },
};

function renderNav(leading?: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AppConfigProvider value={appConfig}>
        <GamificationNavActions leading={leading} />
      </AppConfigProvider>
    </QueryClientProvider>,
  );
}

describe("GamificationNavActions", () => {
  beforeEach(() => {
    navigate.mockClear();
  });

  it("renders points summary and star map link", async () => {
    renderNav();
    expect(screen.getByTitle("View points history")).toBeTruthy();
    expect(screen.getByText("This month")).toBeTruthy();
    expect(screen.getByText("All time")).toBeTruthy();
    expect(await screen.findByText("15")).toBeTruthy();
    expect(await screen.findByText("120")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Star Map" })).toBeTruthy();
  });

  it("renders leading slot content", () => {
    renderNav(<button type="button">Leading action</button>);
    expect(screen.getByRole("button", { name: "Leading action" })).toBeTruthy();
  });
});
