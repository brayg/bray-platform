/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsModal, type SettingsPanel } from "./SettingsModal.tsx";

vi.mock("../hooks/use-auth.ts", () => ({
  useAuth: () => ({
    hasPermission: (permission: string) => permission === "beta:manage",
    hasRole: (roleName: string) => roleName === "beta-manager",
  }),
}));

vi.mock("../extensions/use-feature.ts", () => ({
  useFeatureFlags: () => ({}),
}));

const panels: SettingsPanel[] = [
  {
    value: "ai",
    label: "AI",
    requiresManage: true,
    managePermission: "alpha:manage",
    render: () => null,
  },
  {
    value: "users",
    label: "Users",
    requiresRole: "admin",
    render: () => null,
  },
  {
    value: "media",
    label: "Media",
    requiresManage: true,
    managePermission: "beta:manage",
    render: () => null,
  },
  { value: "about", label: "About", render: () => null },
];

describe("SettingsModal panel visibility", () => {
  it("shows only panels the user can access, not other domains' manage tabs", () => {
    render(
      <SettingsModal
        open
        onOpenChange={() => {}}
        panels={panels}
        managePermissions={["alpha:manage", "beta:manage"]}
      />,
    );

    expect(screen.queryByRole("tab", { name: /AI/i })).toBeNull();
    expect(screen.queryByRole("tab", { name: /Users/i })).toBeNull();
    expect(screen.getByRole("tab", { name: /Media/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /About/i })).toBeTruthy();
  });
});
