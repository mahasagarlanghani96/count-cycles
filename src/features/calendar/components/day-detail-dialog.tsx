"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { usePeriods } from "@/features/periods/hooks/use-periods";
import { getCurrentCycleInfo } from "@/lib/dates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { FlowIntensity, MoodType, SymptomSeverity } from "@/types";

interface DayDetailDialogProps {
  date: Date | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FLOW_OPTIONS: { value: FlowIntensity; label: string }[] = [
  { value: "spotting", label: "Spotting" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "heavy", label: "Heavy" },
];

const MOOD_OPTIONS: { value: MoodType; emoji: string; label: string }[] = [
  { value: "happy", emoji: "\u{1F60A}", label: "Happy" },
  { value: "calm", emoji: "\u{1F60C}", label: "Calm" },
  { value: "energetic", emoji: "\u{26A1}", label: "Energetic" },
  { value: "anxious", emoji: "\u{1F630}", label: "Anxious" },
  { value: "sad", emoji: "\u{1F622}", label: "Sad" },
  { value: "irritable", emoji: "\u{1F624}", label: "Irritable" },
  { value: "stressed", emoji: "\u{1F616}", label: "Stressed" },
  { value: "neutral", emoji: "\u{1F610}", label: "Neutral" },
];

const QUICK_SYMPTOMS = [
  "Cramps",
  "Headache",
  "Bloating",
  "Back pain",
  "Fatigue",
  "Breast tenderness",
  "Nausea",
  "Mood swings",
];

export function DayDetailDialog({
  date,
  open,
  onOpenChange,
}: DayDetailDialogProps) {
  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        {open && (
          <DayDetailForm
            date={date}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DayDetailForm({
  date,
  onClose,
}: {
  date: Date;
  onClose: () => void;
}) {
  const supabase = createClient();
  const { user } = useAuth();
  const { data: periods = [] } = usePeriods();
  const queryClient = useQueryClient();

  const [flow, setFlow] = useState<FlowIntensity | null>(null);
  const [mood, setMood] = useState<MoodType | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const cycleInfo = useMemo(
    () => getCurrentCycleInfo(periods, date),
    [periods, date]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const logDate = format(date, "yyyy-MM-dd");

      const { data: existing } = await supabase
        .from("daily_logs")
        .select("id")
        .eq("user_id", user.id)
        .eq("log_date", logDate)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("daily_logs")
          .update({
            flow_intensity: flow,
            mood,
            notes: notes || null,
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("daily_logs").insert({
          user_id: user.id,
          log_date: logDate,
          flow_intensity: flow,
          mood,
          notes: notes || null,
          energy_level: null,
          sleep_quality: null,
        });
        if (error) throw error;
      }

      if (selectedSymptoms.length > 0) {
        const symptomRows = selectedSymptoms.map((name) => ({
          user_id: user.id,
          log_date: logDate,
          symptom_name: name,
          severity: "moderate" as SymptomSeverity,
          notes: null,
        }));
        const { error } = await supabase
          .from("symptom_logs")
          .insert(symptomRows);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily_logs"] });
      queryClient.invalidateQueries({ queryKey: ["symptom_logs"] });
      onClose();
    },
  });

  function toggleSymptom(name: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{format(date, "EEEE, MMMM d, yyyy")}</DialogTitle>
        {cycleInfo.cycleDay && (
          <p className="text-sm text-muted">
            Cycle day {cycleInfo.cycleDay} &middot;{" "}
            <span className="capitalize">{cycleInfo.phase}</span> phase
          </p>
        )}
      </DialogHeader>

      <div className="space-y-5">
        {cycleInfo.isOnPeriod && (
          <div>
            <h4 className="text-sm font-medium mb-2">Flow Intensity</h4>
            <div className="grid grid-cols-4 gap-2">
              {FLOW_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={flow === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFlow(flow === opt.value ? null : opt.value)
                  }
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-2">Mood</h4>
          <div className="grid grid-cols-4 gap-2">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setMood(mood === opt.value ? null : opt.value)
                }
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl p-2 text-xs transition-colors border",
                  mood === opt.value
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-border hover:bg-surface-alt"
                )}
              >
                <span className="text-lg">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Quick Symptoms</h4>
          <div className="flex flex-wrap gap-2">
            {QUICK_SYMPTOMS.map((symptom) => (
              <Button
                key={symptom}
                variant={
                  selectedSymptoms.includes(symptom) ? "default" : "outline"
                }
                size="sm"
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Notes</h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling today?"
            rows={3}
            className="flex w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 resize-none"
          />
        </div>

        <Button
          className="w-full"
          onClick={() => saveMutation.mutate()}
          loading={saveMutation.isPending}
        >
          Save
        </Button>
      </div>
    </>
  );
}
