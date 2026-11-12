"use client";

import { useState } from "react";
import { format, parseISO, differenceInDays, isBefore, isAfter, startOfDay } from "date-fns";
import {
  usePeriods,
  useUpdatePeriod,
  useDeletePeriod,
} from "@/features/periods/hooks/use-periods";
import { LogPastPeriod } from "./log-past-period";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { PeriodRecord } from "@/types";

export function PeriodHistory() {
  const { data: periods, isLoading } = usePeriods();
  const [addOpen, setAddOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<PeriodRecord | null>(null);
  const [deletingPeriod, setDeletingPeriod] = useState<PeriodRecord | null>(null);

  const recorded = (periods ?? []).filter((p) => !p.is_predicted);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">
            {recorded.length} period{recorded.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Period
        </Button>
      </div>

      {recorded.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted mb-4">No periods logged yet.</p>
            <Button onClick={() => setAddOpen(true)}>Log Your First Period</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recorded.map((period) => (
            <PeriodCard
              key={period.id}
              period={period}
              onEdit={() => setEditingPeriod(period)}
              onDelete={() => setDeletingPeriod(period)}
            />
          ))}
        </div>
      )}

      <LogPastPeriod open={addOpen} onOpenChange={setAddOpen} />

      {editingPeriod && (
        <EditPeriodDialog
          period={editingPeriod}
          open={!!editingPeriod}
          onOpenChange={(open) => {
            if (!open) setEditingPeriod(null);
          }}
        />
      )}

      {deletingPeriod && (
        <DeletePeriodDialog
          period={deletingPeriod}
          open={!!deletingPeriod}
          onOpenChange={(open) => {
            if (!open) setDeletingPeriod(null);
          }}
        />
      )}
    </div>
  );
}

function PeriodCard({
  period,
  onEdit,
  onDelete,
}: {
  period: PeriodRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const startDate = parseISO(period.start_date);
  const endDate = period.end_date ? parseISO(period.end_date) : null;
  const duration = endDate
    ? differenceInDays(endDate, startDate) + 1
    : null;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              {format(startDate, "MMM d, yyyy")}
              {endDate && (
                <span className="text-muted font-normal">
                  {" "}&mdash; {format(endDate, "MMM d, yyyy")}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              {duration && (
                <Badge variant="secondary">{duration} day{duration !== 1 ? "s" : ""}</Badge>
              )}
              {!endDate && (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  No end date
                </Badge>
              )}
            </div>
            {period.notes && (
              <p className="text-xs text-muted mt-1">{period.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted hover:text-foreground"
              onClick={onEdit}
              aria-label="Edit period"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted hover:text-red-600"
              onClick={onDelete}
              aria-label="Delete period"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EditPeriodDialog({
  period,
  open,
  onOpenChange,
}: {
  period: PeriodRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [startDate, setStartDate] = useState(period.start_date);
  const [endDate, setEndDate] = useState(period.end_date ?? "");
  const [notes, setNotes] = useState(period.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const updatePeriod = useUpdatePeriod();

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
    updatePeriod.mutate(
      {
        id: period.id,
        start_date: startDate,
        end_date: endDate,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Failed to update.");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Period</DialogTitle>
          <DialogDescription>
            Update the dates for this period record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="edit-start-date" className="text-sm font-medium">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-start-date"
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
            <label htmlFor="edit-end-date" className="text-sm font-medium">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-end-date"
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
            <label htmlFor="edit-notes" className="text-sm font-medium">
              Notes <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this period"
              rows={2}
              className="flex w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              loading={updatePeriod.isPending}
              disabled={!startDate || !endDate}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeletePeriodDialog({
  period,
  open,
  onOpenChange,
}: {
  period: PeriodRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deletePeriod = useDeletePeriod();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Period</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the period starting{" "}
            {format(parseISO(period.start_date), "MMMM d, yyyy")}? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => {
              deletePeriod.mutate(period.id, {
                onSuccess: () => onOpenChange(false),
              });
            }}
            loading={deletePeriod.isPending}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
