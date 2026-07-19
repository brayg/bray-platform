/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

import { useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, Star } from "lucide-react";
import { useAuth } from "@heybray/react/hooks/use-auth";
import { apiRequest } from "@heybray/react/lib/queryClient";
import { HttpError } from "@heybray/react/lib/http-error";
import { useAppConfig } from "@heybray/react/config";
import { Button } from "@heybray/ui/components/button";
import { NoticeBannerButton, noticeLabelClassName } from "@heybray/ui/components/NoticeBanner";
import { PointsHistoryDialog } from "./PointsHistoryDialog.tsx";

const DEFAULT_TEAM_STAR_MAP_PATH = "/team-star-map";

export type GamificationNavActionsProps = {
  /** App-specific controls rendered before gamification actions (e.g. search). */
  leading?: ReactNode;
  /** App-specific controls rendered after gamification actions. */
  trailing?: ReactNode;
};

export function GamificationNavActions({ leading, trailing }: GamificationNavActionsProps) {
  const { user, hasRole } = useAuth();
  const [, navigate] = useLocation();
  const { routes } = useAppConfig();
  const [pointsHistoryOpen, setPointsHistoryOpen] = useState(false);
  const isAdmin = hasRole("admin");
  const teamStarMapPath = routes.teamStarMapPath ?? DEFAULT_TEAM_STAR_MAP_PATH;

  const { data: teamsAccess } = useQuery<{ teams: unknown[] }>({
    queryKey: ["/api/teams"],
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/teams");
      } catch (error) {
        if (error instanceof HttpError && error.status === 403) {
          return { teams: [] };
        }
        throw error;
      }
    },
    enabled: !!user,
    retry: false,
    throwOnError: false,
  });

  const showStarMapNav = (teamsAccess?.teams?.length ?? 0) > 0 || isAdmin;

  const { data: pointsData } = useQuery<{ total: number; monthTotal: number }>({
    queryKey: ["/api/points/me"],
    queryFn: () => apiRequest("GET", "/api/points/me"),
    enabled: !!user,
  });

  return (
    <>
      {leading}

      {showStarMapNav && (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full gap-1.5 hidden sm:inline-flex"
          onClick={() => navigate(teamStarMapPath)}
        >
          <LayoutGrid className="h-4 w-4" />
          Star Map
        </Button>
      )}

      <NoticeBannerButton
        variant="rewards"
        layout="rewards"
        onClick={() => setPointsHistoryOpen(true)}
        title="View points history"
      >
        <Star className="h-4 w-4 fill-[var(--featured-star-fill)] text-[var(--featured-star)] shrink-0" />
        <span className="flex items-center gap-3">
          <span className="flex flex-col items-start leading-tight">
            <span className={noticeLabelClassName()}>This month</span>
            <span className="font-bold tabular-nums">{pointsData?.monthTotal ?? 0}</span>
          </span>
          <span className="h-8 w-px bg-[var(--rewards-banner-border)]" aria-hidden />
          <span className="flex flex-col items-start leading-tight">
            <span className={noticeLabelClassName()}>All time</span>
            <span className="font-bold tabular-nums">{pointsData?.total ?? 0}</span>
          </span>
        </span>
      </NoticeBannerButton>

      {trailing}

      <PointsHistoryDialog open={pointsHistoryOpen} onOpenChange={setPointsHistoryOpen} />
    </>
  );
}
