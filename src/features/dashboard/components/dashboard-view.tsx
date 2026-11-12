"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { getCurrentCycleInfo } from "@/lib/dates";
import type { PeriodRecord, DailyLog, CyclePhase } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CycleRing } from "./cycle-ring";
import { QuickActions } from "./quick-actions";

const PHASE_GUIDANCE: Record<CyclePhase, { title: string; body: string }> = {
  menstrual: {
    title: "Rest & Restore",
    body: "Your body is shedding its uterine lining. Prioritize rest, warmth, and iron-rich foods. Gentle stretching or light walks can help ease cramps. Stay hydrated and listen to your body.",
  },
  follicular: {
    title: "Rising Energy",
    body: "Estrogen is rising and so is your energy. This is a great time for creative projects, trying new workouts, and social activities. Your body is building up for ovulation.",
  },
  ovulatory: {
    title: "Peak Vitality",
    body: "You may feel your most confident and energetic. Communication skills peak during this phase. Great time for important conversations, high-intensity workouts, and social events.",
  },
  luteal: {
    title: "Wind Down & Nourish",
    body: "Progesterone rises, and energy may dip. Focus on nourishing meals, calming activities, and quality sleep. You may crave comfort foods -- opt for complex carbs and magnesium-rich snacks.",
  },
  unknown: {
    title: "Welcome to CycleCare",
    body: "Start tracking your period to receive personalized guidance based on your cycle phase. Tap 'Start Period' below when your next period begins.",
  },
};

export function DashboardView() {
  const supabase = createClient();
  const { user } = useAuth();

  const {
    data: periods,
    isLoading: periodsLoading,
  } = useQuery<PeriodRecord[]>({
    queryKey: ["period_records", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("period_records")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const {
    data: dailyLogs,
    isLoading: logsLoading,
  } = useQuery<DailyLog[]>({
    queryKey: ["daily_logs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const isLoading = periodsLoading || logsLoading;

  const cycleInfo = periods && periods.length > 0
    ? getCurrentCycleInfo(periods)
    : null;

  const phase = cycleInfo?.phase ?? "unknown";
  const cycleDay = cycleInfo?.cycleDay ?? null;
  const cycleLength = 28;
  const guidance = PHASE_GUIDANCE[phase];
  const todaysLog = dailyLogs?.find(
    (log) => log.log_date === format(new Date(), "yyyy-MM-dd")
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="mt-2 h-4 w-64 rounded-lg" />
        </div>
        <Skeleton className="mx-auto h-[200px] w-[200px] rounded-full md:h-[240px] md:w-[240px]" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Cycle Ring */}
      <Card className="border-0 bg-gradient-to-br from-surface to-background shadow-sm">
        <CardContent className="pt-6 pb-6">
          <CycleRing
            cycleDay={cycleDay}
            cycleLength={cycleLength}
            phase={phase}
          />
        </CardContent>
      </Card>

      {/* Cycle Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cycle Overview</CardTitle>
          <CardDescription>Your current cycle at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-pink-50/50 p-3 dark:bg-pink-950/20">
              <p className="text-xs text-muted">Cycle Day</p>
              <p className="text-xl font-bold text-foreground">
                {cycleDay ?? "--"}
              </p>
            </div>
            <div className="rounded-xl bg-purple-50/50 p-3 dark:bg-purple-950/20">
              <p className="text-xs text-muted">Phase</p>
              <p className="text-xl font-bold text-foreground capitalize">
                {phase}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50/50 p-3 dark:bg-amber-950/20">
              <p className="text-xs text-muted">Days Until Next</p>
              <p className="text-xl font-bold text-foreground">
                {cycleInfo?.daysUntilNextPeriod ?? "--"}
              </p>
            </div>
            <div className="rounded-xl bg-teal-50/50 p-3 dark:bg-teal-950/20">
              <p className="text-xs text-muted">Next Period</p>
              <p className="text-sm font-semibold text-foreground">
                {cycleInfo?.nextPeriodEstimate
                  ? format(new Date(cycleInfo.nextPeriodEstimate), "MMM d")
                  : "--"}
              </p>
            </div>
          </div>
          {cycleInfo?.isOnPeriod && (
            <Badge className="mt-3 bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800">
              Currently on period
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted">
          Quick Actions
        </h2>
        <QuickActions />
      </div>

      {/* Daily Guidance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{guidance.title}</CardTitle>
          <CardDescription>Phase-based guidance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted">
            {guidance.body}
          </p>
        </CardContent>
      </Card>

      {/* Today's Log Summary */}
      {todaysLog && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today&apos;s Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {todaysLog.mood && (
                <Badge variant="secondary">
                  Mood: {todaysLog.mood}
                </Badge>
              )}
              {todaysLog.flow_intensity && (
                <Badge variant="secondary">
                  Flow: {todaysLog.flow_intensity}
                </Badge>
              )}
              {todaysLog.energy_level !== null && (
                <Badge variant="secondary">
                  Energy: {todaysLog.energy_level}/5
                </Badge>
              )}
              {todaysLog.sleep_quality !== null && (
                <Badge variant="secondary">
                  Sleep: {todaysLog.sleep_quality}/5
                </Badge>
              )}
            </div>
            {todaysLog.notes && (
              <p className="mt-2 text-sm text-muted">{todaysLog.notes}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
