"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MoodType } from "@/types";

const MOOD_OPTIONS: { value: MoodType; emoji: string; label: string }[] = [
  { value: "happy", emoji: "\u{1F60A}", label: "Happy" },
  { value: "calm", emoji: "\u{1F60C}", label: "Calm" },
  { value: "energetic", emoji: "\u{26A1}", label: "Energetic" },
  { value: "neutral", emoji: "\u{1F610}", label: "Neutral" },
  { value: "anxious", emoji: "\u{1F630}", label: "Anxious" },
  { value: "sad", emoji: "\u{1F622}", label: "Sad" },
  { value: "irritable", emoji: "\u{1F624}", label: "Irritable" },
  { value: "stressed", emoji: "\u{1F616}", label: "Stressed" },
];

const ENERGY_LEVELS = [1, 2, 3, 4, 5] as const;
const SLEEP_LEVELS = [1, 2, 3, 4, 5] as const;

export function MoodLogger() {
  const today = format(new Date(), "yyyy-MM-dd");
  const supabase = createClient();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: logs = [], isLoading } = useDailyLogs({
    startDate: today,
    endDate: today,
  });

  const todaysLog = logs[0] ?? null;

  const [mood, setMood] = useState<MoodType | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      if (todaysLog) {
        const { error } = await supabase
          .from("daily_logs")
          .update({
            mood,
            energy_level: energy,
            sleep_quality: sleep,
            notes: notes.trim() || null,
          })
          .eq("id", todaysLog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("daily_logs").insert({
          user_id: user.id,
          log_date: today,
          mood,
          energy_level: energy,
          sleep_quality: sleep,
          flow_intensity: null,
          notes: notes.trim() || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily_logs"] });
      setMood(null);
      setEnergy(null);
      setSleep(null);
      setNotes("");
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>How are you feeling?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-4 gap-2">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMood(mood === opt.value ? null : opt.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl p-3 text-xs transition-colors border",
                  mood === opt.value
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-border hover:bg-surface-alt"
                )}
              >
                <span className="text-2xl">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Energy Level</h4>
            <div className="flex gap-2">
              {ENERGY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEnergy(energy === level ? null : level)}
                  className={cn(
                    "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors",
                    energy === level
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-border hover:bg-surface-alt"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted px-1">
              <span>Very low</span>
              <span>Very high</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Sleep Quality</h4>
            <div className="flex gap-2">
              {SLEEP_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSleep(sleep === level ? null : level)}
                  className={cn(
                    "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors",
                    sleep === level
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-border hover:bg-surface-alt"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted px-1">
              <span>Very poor</span>
              <span>Excellent</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Notes</h4>
            <textarea
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ring-offset-background resize-none"
              placeholder="Anything else you want to note?"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
            disabled={!mood && energy === null && sleep === null}
          >
            {todaysLog ? "Update Today's Log" : "Save"}
          </Button>

          {saveMutation.isError && (
            <p className="text-sm text-red-600 text-center">
              Failed to save. Please try again.
            </p>
          )}
        </CardContent>
      </Card>

      {todaysLog && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {todaysLog.mood && (
                <Badge>
                  Mood: {MOOD_OPTIONS.find((m) => m.value === todaysLog.mood)?.emoji}{" "}
                  {todaysLog.mood}
                </Badge>
              )}
              {todaysLog.energy_level !== null && (
                <Badge variant="accent">Energy: {todaysLog.energy_level}/5</Badge>
              )}
              {todaysLog.sleep_quality !== null && (
                <Badge variant="secondary">Sleep: {todaysLog.sleep_quality}/5</Badge>
              )}
            </div>
            {todaysLog.notes && (
              <p className="mt-2 text-sm text-muted">{todaysLog.notes}</p>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <p className="text-sm text-muted text-center">Loading today&apos;s log...</p>
      )}
    </div>
  );
}
