/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import express from "express";
import cors from "cors";
import { authenticationRouter, usersRouter } from "@heybray/identity";
import { createTaxonomyRouter } from "@heybray/taxonomy";
import { createGamificationRouter, GamificationService } from "@heybray/gamification";
import { requestLogging } from "@heybray/server-kit";
import { createNotesRouter } from "./routes/notes.ts";
import "./db.ts";

const MANAGE_PERMISSION = "notes:manage";

export const gamificationService = new GamificationService({
  contentTypes: [{ type: "note", label: "Note" }],
  masteryDimensionSlug: "category",
  managePermission: MANAGE_PERMISSION,
});

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogging);

  app.use("/api/auth", authenticationRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/taxonomy", createTaxonomyRouter({ managePermission: MANAGE_PERMISSION }));
  app.use(
    "/api/points",
    createGamificationRouter({
      contentTypes: [{ type: "note", label: "Note" }],
      masteryDimensionSlug: "category",
      managePermission: MANAGE_PERMISSION,
    }),
  );
  app.use("/api/notes", createNotesRouter(gamificationService));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  return app;
}
