"use client";

import { useState } from "react";
import Link from "next/link";
import { format, isBefore, isAfter, startOfDay } from "date-fns";
import { useCreatePeriod } from "@/features/periods/hooks/use-periods";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function QuickActions() {
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createPeriod = useCreatePeriod();

  const today = format(new Date(), "yyyy-MM-dd");

  function validate(): string | null {
    if (!startDate) return "Please select a start date.";
    if (!endDate) return "Please select an end date.";
    if (isAfter(startOfDay(new Date(startDate)), startOfDay(new Date()))) {
      return "Start date cannot be in the future.";
    }
    if (isAfter(startOfDay(new Date(endDate)), startOfDay(new Date()))) {
      return "End date cannot be in the future.";
    }
    if (isBefore(new Date(endDate), new Date(startDate))) {
      return "End date must be on or after start date.";
    }
    return null;
  }

  function handleSave() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    createPeriod.mutate(
      {
        start_date: startDate,
        end_date: endDate,
        is_predicted: false,
        notes: null,
      },
      {
        onSuccess: () => {
          handleClose();
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Failed to save.");
        },
      }
    );
  }

  function handleClose() {
    setStartDate("");
    setEndDate("");
    setError(null);
    setLogDialogOpen(false);
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {/* Log Period */}
      <button
        type="button"
        onClick={() => setLogDialogOpen(true)}
        className="inline-flex h-auto flex-col items-center justify-center gap-2 rounded-2xl border-2 border-pink-200 bg-pink-50/50 px-4 py-4 text-pink-700 hover:bg-pink-100/80 dark:border-pink-900 dark:bg-pink-950/30 dark:text-pink-300 dark:hover:bg-pink-950/50 text-sm font-semibold transition-all duration-200"
      >
        <span className="text-2xl">{"\u{1FA78}"}</span>
        <span className="text-xs font-medium">Log Period</span>
      </button>

      <Dialog open={logDialogOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Period</DialogTitle>
            <DialogDescription>
              Record your period with start and end dates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="qa-start-date" className="text-sm font-medium">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="qa-start-date"
                type="date"
                max={today}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setError(null);
                }}
                className="flex w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="qa-end-date" className="text-sm font-medium">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                id="qa-end-date"
                type="date"
                min={startDate || undefined}
                max={today}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setError(null);
                }}
                className="flex w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                loading={createPeriod.isPending}
                disabled={!startDate || !endDate}
              >
                Save Period
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Symptoms */}
      <Link
        href="/symptoms"
        className="inline-flex h-auto flex-col items-center justify-center gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50/50 px-4 py-4 text-amber-700 hover:bg-amber-100/80 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50 text-sm font-semibold transition-all duration-200"
      >
        <span className="text-2xl">{"\u{1F4CB}"}</span>
        <span className="text-xs font-medium">Log Symptoms</span>
      </Link>

      {/* Log Mood */}
      <Link
        href="/mood"
        className="inline-flex h-auto flex-col items-center justify-center gap-2 rounded-2xl border-2 border-teal-200 bg-teal-50/50 px-4 py-4 text-teal-700 hover:bg-teal-100/80 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300 dark:hover:bg-teal-950/50 text-sm font-semibold transition-all duration-200"
      >
        <span className="text-2xl">{"\u{1F60A}"}</span>
        <span className="text-xs font-medium">Log Mood</span>
      </Link>
    </div>
  );
}
