"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, parseISO } from "date-fns";
import {
  TrendingUp,
  Activity,
  Droplets,
  Brain,
  Download,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { calculateCycleStats, calculateCycleLengths } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PeriodRecord, SymptomLog, DailyLog } from "@/types";

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-2xl font-bold mt-1">
              {value ?? "—"}
              {unit && value !== null && (
                <span className="text-sm font-normal text-muted ml-1">
                  {unit}
                </span>
              )}
            </p>
          </div>
          <div className={`rounded-xl p-2.5 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CycleLengthChart({ lengths }: { lengths: number[] }) {
  if (lengths.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted">
        Not enough data to show cycle length trends yet.
      </div>
    );
  }

  const max = Math.max(...lengths, 35);
  const min = Math.min(...lengths, 21);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-2 h-32" role="img" aria-label={`Cycle lengths: ${lengths.join(", ")} days`}>
      {lengths.slice(-12).map((len, i) => {
        const height = ((len - min + 2) / (range + 4)) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-muted">{len}</span>
            <div
              className="w-full rounded-t-lg bg-primary-400/80 min-h-[4px] transition-all"
              style={{ height: `${Math.max(height, 8)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function SymptomFrequencyChart({ symptoms }: { symptoms: SymptomLog[] }) {
  const frequency = useMemo(() => {
    const counts: Record<string, number> = {};
    symptoms.forEach((s) => {
      counts[s.symptom_name] = (counts[s.symptom_name] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  }, [symptoms]);

  if (frequency.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-muted">
        No symptoms logged yet.
      </div>
    );
  }

  const maxCount = frequency[0][1];

  return (
    <div className="space-y-3">
      {frequency.map(([name, count]) => (
        <div key={name} className="flex items-center gap-3">
          <span className="text-sm w-28 truncate">{name}</span>
          <div className="flex-1 bg-border/50 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-secondary-400 transition-all"
              style={{ width: `${(count / maxCount) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted w-8 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

function MoodDistribution({ logs }: { logs: DailyLog[] }) {
  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((l) => {
      if (l.mood) counts[l.mood] = (counts[l.mood] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [logs]);

  const moodEmojis: Record<string, string> = {
    happy: "😊",
    calm: "😌",
    energetic: "⚡",
    anxious: "😰",
    sad: "😢",
    irritable: "😤",
    stressed: "😫",
    neutral: "😐",
  };

  if (moodCounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-muted">
        No mood data logged yet.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {moodCounts.map(([mood, count]) => (
        <Badge key={mood} variant="secondary" className="text-sm px-3 py-1.5">
          {moodEmojis[mood] || "•"} {mood} ({count})
        </Badge>
      ))}
    </div>
  );
}

export function InsightsView() {
  const { user } = useAuth();
  const supabase = createClient();
  const [timeRange] = useState(6);

  const since = format(subMonths(new Date(), timeRange), "yyyy-MM-dd");

  const { data: periods, isLoading: periodsLoading } = useQuery({
    queryKey: ["periods", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("period_records")
        .select("*")
        .eq("is_predicted", false)
        .order("start_date", { ascending: true });
      return (data ?? []) as PeriodRecord[];
    },
    enabled: !!user,
  });

  const { data: symptoms, isLoading: symptomsLoading } = useQuery({
    queryKey: ["symptoms", user?.id, since],
    queryFn: async () => {
      const { data } = await supabase
        .from("symptom_logs")
        .select("*")
        .gte("log_date", since)
        .order("log_date", { ascending: false });
      return (data ?? []) as SymptomLog[];
    },
    enabled: !!user,
  });

  const { data: dailyLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["daily-logs", user?.id, since],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_logs")
        .select("*")
        .gte("log_date", since)
        .order("log_date", { ascending: false });
      return (data ?? []) as DailyLog[];
    },
    enabled: !!user,
  });

  const stats = useMemo(
    () => (periods ? calculateCycleStats(periods) : null),
    [periods]
  );

  const cycleLengths = useMemo(
    () => (periods ? calculateCycleLengths(periods) : []),
    [periods]
  );

  const isLoading = periodsLoading || symptomsLoading || logsLoading;

  function exportCSV() {
    if (!periods) return;
    const headers = "Start Date,End Date,Notes\n";
    const rows = periods
      .map(
        (p) =>
          `${p.start_date},${p.end_date ?? ""},${(p.notes ?? "").replace(/,/g, ";")}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cyclecare-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function generateDoctorSummary() {
    if (!stats || !periods) return;
    const summary = [
      "MENSTRUAL HEALTH SUMMARY",
      `Generated: ${format(new Date(), "MMMM d, yyyy")}`,
      "",
      "CYCLE STATISTICS",
      `Total recorded cycles: ${stats.totalRecordedCycles}`,
      `Average cycle length: ${stats.averageCycleLength ?? "Insufficient data"} days`,
      `Median cycle length: ${stats.medianCycleLength ?? "Insufficient data"} days`,
      `Average period length: ${stats.averagePeriodLength ?? "Insufficient data"} days`,
      `Shortest cycle: ${stats.shortestCycle ?? "—"} days`,
      `Longest cycle: ${stats.longestCycle ?? "—"} days`,
      `Regularity: ${stats.isRegular === null ? "Insufficient data" : stats.isRegular ? "Regular" : "Irregular"}`,
      "",
      "RECENT PERIODS",
      ...periods.slice(-6).map(
        (p) =>
          `${p.start_date} to ${p.end_date ?? "(ongoing)"}`
      ),
      "",
      "NOTE: This is a self-reported tracking summary, not a medical record.",
      "Predictions shown in the app are estimates and should not replace professional medical advice.",
    ].join("\n");

    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cyclecare-doctor-summary-${format(new Date(), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-sm text-muted mt-1">
            Your menstrual health at a glance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={generateDoctorSummary}>
            <FileText className="h-4 w-4 mr-1" />
            Summary
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Avg Cycle"
          value={stats?.averageCycleLength ?? null}
          unit="days"
          icon={TrendingUp}
          color="bg-primary-100 text-primary-600"
        />
        <StatCard
          label="Avg Period"
          value={stats?.averagePeriodLength ?? null}
          unit="days"
          icon={Droplets}
          color="bg-secondary-100 text-secondary-600"
        />
        <StatCard
          label="Cycles Logged"
          value={stats?.totalRecordedCycles ?? 0}
          icon={Activity}
          color="bg-accent-100 text-accent-600"
        />
        <StatCard
          label="Regularity"
          value={
            stats?.isRegular === null
              ? "—"
              : stats?.isRegular
                ? "Regular"
                : "Irregular"
          }
          icon={Brain}
          color="bg-sage-100 text-sage-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cycle Length Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <CycleLengthChart lengths={cycleLengths} />
          {cycleLengths.length > 0 && (
            <p className="text-xs text-muted mt-3 text-center">
              Last {Math.min(cycleLengths.length, 12)} cycles (recorded data
              only)
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Symptom Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <SymptomFrequencyChart symptoms={symptoms ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodDistribution logs={dailyLogs ?? []} />
          </CardContent>
        </Card>
      </div>

      {periods && periods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Period History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {periods
                .slice(-10)
                .reverse()
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {format(parseISO(p.start_date), "MMM d, yyyy")}
                        {p.end_date && (
                          <span className="text-muted">
                            {" "}
                            — {format(parseISO(p.end_date), "MMM d, yyyy")}
                          </span>
                        )}
                      </p>
                      {p.end_date && (
                        <p className="text-xs text-muted">
                          {differenceInDaysDisplay(p.start_date, p.end_date)}{" "}
                          days
                        </p>
                      )}
                    </div>
                    {p.is_predicted && (
                      <Badge variant="outline">Predicted</Badge>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted text-center py-4">
        All insights are based on your recorded data. Predictions are estimates,
        not medical conclusions.
      </p>
    </div>
  );
}

function differenceInDaysDisplay(start: string, end: string): number {
  const s = parseISO(start);
  const e = parseISO(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
