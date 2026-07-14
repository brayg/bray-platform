/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@heybray/react/lib/queryClient";
import { useAuth } from "@heybray/react/hooks/use-auth";
import { Button } from "@heybray/ui/components/button";
import { Input } from "@heybray/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@heybray/ui/components/card";
import { YourProgressPanel } from "@heybray/gamification-react/points/YourProgressPanel";
import { LeaderboardPanel } from "@heybray/gamification-react/points/LeaderboardPanel";

type Note = {
  id: number;
  title: string;
  body: string;
  isDone: boolean;
};

export function NotesPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");

  const { data } = useQuery<{ notes: Note[] }>({ queryKey: ["/api/notes"] });

  const createNote = useMutation({
    mutationFn: (newTitle: string) => apiRequest("POST", "/api/notes", { title: newTitle, body: "" }),
    onSuccess: () => {
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });

  const completeNote = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/notes/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/points/me/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/points/leaderboard"] });
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Basic App — notes</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Log out
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>New note</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (title.trim()) createNote.mutate(title.trim());
                  }}
                >
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What do you need to do?"
                  />
                  <Button type="submit" disabled={createNote.isPending}>
                    Add
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {(data?.notes ?? []).map((note) => (
                <Card key={note.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <span className={note.isDone ? "line-through text-muted-foreground" : ""}>
                      {note.title}
                    </span>
                    {!note.isDone && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={completeNote.isPending}
                        onClick={() => completeNote.mutate(note.id)}
                      >
                        Mark done
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
              {data?.notes.length === 0 && (
                <p className="text-sm text-muted-foreground">No notes yet — add one above.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <YourProgressPanel />
            <LeaderboardPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
