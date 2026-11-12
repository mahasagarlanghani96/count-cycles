"use client";

import { useState } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { useSymptoms, useCreateSymptom, useDeleteSymptom } from "@/features/symptoms/hooks/use-symptoms";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SymptomSeverity } from "@/types";

const COMMON_SYMPTOMS = [
  "Cramps",
  "Headache",
  "Bloating",
  "Back pain",
  "Fatigue",
  "Breast tenderness",
  "Acne",
  "Digestive changes",
  "Appetite changes",
  "Mood swings",
  "Anxiety",
  "Sleep changes",
  "Energy changes",
  "Nausea",
];

const SEVERITY_OPTIONS: { value: SymptomSeverity; label: string; color: string }[] = [
  { value: "mild", label: "Mild", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "moderate", label: "Moderate", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { value: "severe", label: "Severe", color: "bg-red-100 text-red-700 border-red-300" },
];

export function SymptomLogger() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: todaySymptoms = [], isLoading } = useSymptoms(today, today);
  const createSymptom = useCreateSymptom();
  const deleteSymptom = useDeleteSymptom();

  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [severity, setSeverity] = useState<SymptomSeverity>("moderate");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!selectedSymptom) return;
    createSymptom.mutate(
      {
        log_date: today,
        symptom_name: selectedSymptom,
        severity,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          setSelectedSymptom(null);
          setSeverity("moderate");
          setNotes("");
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Symptoms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {COMMON_SYMPTOMS.map((symptom) => (
            <Button
              key={symptom}
              variant={selectedSymptom === symptom ? "default" : "outline"}
              size="sm"
              className="text-xs h-auto py-2 px-2"
              onClick={() =>
                setSelectedSymptom(selectedSymptom === symptom ? null : symptom)
              }
            >
              {symptom}
            </Button>
          ))}
        </div>

        {selectedSymptom && (
          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-sm font-medium">
              Severity for <span className="text-primary-500">{selectedSymptom}</span>
            </p>
            <div className="flex gap-2">
              {SEVERITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    severity === option.value
                      ? option.color
                      : "border-border bg-surface text-muted hover:bg-surface-alt"
                  )}
                  onClick={() => setSeverity(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <textarea
              className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ring-offset-background"
              placeholder="Notes (optional)"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Button
              onClick={handleSave}
              loading={createSymptom.isPending}
              className="w-full"
            >
              Save Symptom
            </Button>
          </div>
        )}

        {todaySymptoms.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted">Today&apos;s Symptoms</p>
            <div className="flex flex-wrap gap-2">
              {todaySymptoms.map((symptom) => (
                <Badge
                  key={symptom.id}
                  variant={
                    symptom.severity === "severe"
                      ? "destructive"
                      : symptom.severity === "moderate"
                        ? "accent"
                        : "secondary"
                  }
                  className="flex items-center gap-1 pr-1"
                >
                  {symptom.symptom_name}
                  <button
                    type="button"
                    className="ml-1 rounded-full p-0.5 hover:bg-black/10 transition-colors"
                    onClick={() => deleteSymptom.mutate(symptom.id)}
                    aria-label={`Remove ${symptom.symptom_name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <p className="text-sm text-muted">Loading today&apos;s symptoms...</p>
        )}
      </CardContent>
    </Card>
  );
}
