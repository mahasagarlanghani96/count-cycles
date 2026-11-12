"use client";

import { useState } from "react";
import { format, isBefore, isAfter, startOfDay } from "date-fns";
import { useCreatePeriod } from "@/features/periods/hooks/use-periods";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LogPastPeriodProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogPastPeriod({ open, onOpenChange }: LogPastPeriodProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createPeriod = useCreatePeriod();

  const today = format(new Date(), "yyyy-MM-dd");

  function validate(): string | null {
    if (!startDate) return "Please select a start date.";
    if (!endDate) return "Please select an end date.";
    if (isAfter(startOfDay(new Date(startDate)), startOfDay(new Date()))) {
      return "Start date cannot be in the future.";
    }
    if (isBefore(new Date(endDate), new Date(startDate))) {
      return "End date must be on or after start date.";
    }
    if (isAfter(startOfDay(new Date(endDate)), startOfDay(new Date()))) {
      return "End date cannot be in the future.";
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
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          setStartDate("");
          setEndDate("");
          setNotes("");
          setError(null);
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Failed to save period.");
        },
      }
    );
  }

  function handleClose() {
    setStartDate("");
    setEndDate("");
    setNotes("");
    setError(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Past Period</DialogTitle>
          <DialogDescription>
            Record a previous menstrual cycle. Select the start and end dates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="past-start-date" className="text-sm font-medium">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              id="past-start-date"
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
            <label htmlFor="past-end-date" className="text-sm font-medium">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              id="past-end-date"
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

          <div className="space-y-2">
            <label htmlFor="past-notes" className="text-sm font-medium">
              Notes <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="past-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details you remember about this period"
              rows={2}
              className="flex w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 resize-none"
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
  );
}
