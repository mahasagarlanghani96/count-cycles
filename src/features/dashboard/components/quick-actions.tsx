"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import type { PeriodRecord } from "@/types";

interface QuickActionsProps {
  latestPeriod: PeriodRecord | null;
  isOnPeriod: boolean;
}

export function QuickActions({ latestPeriod, isOnPeriod }: QuickActionsProps) {
  const supabase = createClient();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  async function handleStartPeriod() {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("period_records").insert({
        user_id: user.id,
        start_date: today,
        is_predicted: false,
        notes: null,
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["period_records"] });
      setStartDialogOpen(false);
    } catch (err) {
      console.error("Failed to start period:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEndPeriod() {
    if (!latestPeriod) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("period_records")
        .update({ end_date: today })
        .eq("id", latestPeriod.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["period_records"] });
      setEndDialogOpen(false);
    } catch (err) {
      console.error("Failed to end period:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {/* Start Period */}
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 rounded-2xl border-pink-200 bg-pink-50/50 px-4 py-4 text-pink-700 hover:bg-pink-100/80 dark:border-pink-900 dark:bg-pink-950/30 dark:text-pink-300 dark:hover:bg-pink-950/50"
            disabled={isOnPeriod}
          >
            <span className="text-2xl">{"\u{1FA78}"}</span>
            <span className="text-xs font-medium">Start Period</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Period</DialogTitle>
            <DialogDescription>
              Record the start of your period for today, {format(new Date(), "MMMM d, yyyy")}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStartDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
              onClick={handleStartPeriod}
              disabled={loading}
            >
              {loading ? "Saving..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Period */}
      <Dialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 rounded-2xl border-purple-200 bg-purple-50/50 px-4 py-4 text-purple-700 hover:bg-purple-100/80 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-300 dark:hover:bg-purple-950/50"
            disabled={!isOnPeriod}
          >
            <span className="text-2xl">{"✓"}</span>
            <span className="text-xs font-medium">End Period</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Period</DialogTitle>
            <DialogDescription>
              Mark your period as ended today, {format(new Date(), "MMMM d, yyyy")}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEndDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleEndPeriod}
              disabled={loading}
            >
              {loading ? "Saving..." : "Confirm"}
            </Button>
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
