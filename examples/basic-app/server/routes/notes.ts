/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { Router, type Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { authenticateToken, requirePasswordChanged, type AuthRequest } from "@heybray/identity";
import { GamificationService, rewardTiers } from "@heybray/gamification";
import { db } from "../db.ts";
import { notes, insertNoteSchema } from "../schema/notes.ts";

const NOTE_CONTENT_TYPE = "note";

export function createNotesRouter(gamificationService: GamificationService): Router {
  const router = Router();

  router.use(authenticateToken);
  router.use(requirePasswordChanged);

  router.get("/", async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const rows = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.createdAt));

    const progress = await Promise.all(
      rows.map((note) => gamificationService.getContentProgress(userId, NOTE_CONTENT_TYPE, note.id)),
    );

    res.json({
      notes: rows.map((note, i) => ({ ...note, progress: progress[i] })),
    });
  });

  router.post("/", async (req: AuthRequest, res: Response) => {
    const parsed = insertNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      return;
    }

    const [note] = await db
      .insert(notes)
      .values({ ...parsed.data, userId: req.user!.id })
      .returning();

    // Every note gets a single-tier reward (Bronze, 10pts) as soon as it's created —
    // this is deliberately the simplest possible tier shape a content type can use.
    await db.insert(rewardTiers).values({
      contentType: NOTE_CONTENT_TYPE,
      contentId: note.id,
      tierName: "Bronze",
      minScorePercent: 0,
      rewardPoints: 10,
      starLevel: 1,
      orderIndex: 0,
    });

    await gamificationService.syncContent([
      { contentType: NOTE_CONTENT_TYPE, contentId: note.id, title: note.title, isActive: true },
    ]);

    res.status(201).json({ note });
  });

  router.post("/:id/complete", async (req: AuthRequest, res: Response) => {
    const noteId = Number(req.params.id);
    const userId = req.user!.id;

    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .limit(1);
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    await db.update(notes).set({ isDone: true, updatedAt: new Date() }).where(eq(notes.id, noteId));

    const award = await gamificationService.recordResult({
      userId,
      contentType: NOTE_CONTENT_TYPE,
      contentId: noteId,
      scorePercent: 100,
      passed: true,
      occurredAt: new Date(),
      eligibleForAward: true,
    });

    res.json({ award });
  });

  router.delete("/:id", async (req: AuthRequest, res: Response) => {
    const noteId = Number(req.params.id);
    const userId = req.user!.id;

    await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
    await gamificationService.onContentDeleted(NOTE_CONTENT_TYPE, noteId);

    res.status(204).send();
  });

  return router;
}
