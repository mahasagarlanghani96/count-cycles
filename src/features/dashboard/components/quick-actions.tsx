"use client";

import { format } from "date-fns";
import Link from "next/link";
import {
  useCreatePeriod,
  useUpdatePeriod,
} from "@/features/periods/hooks/use-periods";
import type { PeriodRecord } from "@/types";

interface QuickActionsProps {
  latestPeriod?: PeriodRecord | null;
  isOnPeriod?: boolean;
}

export function QuickActions({ latestPeriod, isOnPeriod }: QuickActionsProps) {
  const createPeriod = useCreatePeriod();
  const updatePeriod = useUpdatePeriod();

  const today = format(new Date(), "yyyy-MM-dd");

  function handleStartPeriod() {
    createPeriod.mutate({
      start_date: today,
      end_date: null,
      is_predicted: false,
      notes: null,
    });
  }

  function handleEndPeriod() {
    if (!latestPeriod) return;
    updatePeriod.mutate({
      id: latestPeriod.id,
      end_date: today,
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {/* Start Period */}
      <button
        type="button"
        onClick={handleStartPeriod}
        disabled={isOnPeriod || createPeriod.isPending}
        className="inline-flex h-auto flex-col items-center justify-center gap-2 rounded-2xl border-2 border-pink-200 bg-pink-50/50 px-4 py-4 text-pink-700 hover:bg-pink-100/80 dark:border-pink-900 dark:bg-pink-950/30 dark:text-pink-300 dark:hover:bg-pink-950/50 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-2xl">{"\u{1FA78}"}</span>
        <span className="text-xs font-medium">Start Period</span>
      </button>

      {/* End Period */}
      <button
        type="button"
        onClick={handleEndPeriod}
        disabled={!isOnPeriod || updatePeriod.isPending}
        className="inline-flex h-auto flex-col items-center justify-center gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50/50 px-4 py-4 text-rose-700 hover:bg-rose-100/80 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-2xl">{"✔️"}</span>
        <span className="text-xs font-medium">End Period</span>
      </button>

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
