"use client";

import { format, subDays } from "date-fns";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { MoodType } from "@/types";

const MOOD_EMOJI: Record<MoodType, string> = {
  happy: "\u{1F60A}",
  calm: "\u{1F60C}",
  energetic: "\u{26A1}",
  neutral: "\u{1F610}",
  anxious: "\u{1F630}",
  sad: "\u{1F622}",
  irritable: "\u{1F624}",
  stressed: "\u{1F616}",
};

export function MoodHistory() {
  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const { data: logs, isLoading } = useDailyLogs({
    startDate: thirtyDaysAgo,
    endDate: today,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </CardContent>
      </Card>
    );
  }

  const logsWithData = logs?.filter(
    (l) => l.mood || l.energy_level !== null || l.sleep_quality !== null
  );

  if (!logsWithData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Mood & Wellness</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">No mood data logged in the last 30 days.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Mood & Wellness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {logsWithData.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 rounded-xl border border-border p-3"
          >
            {log.mood && (
              <span className="text-2xl">
                {MOOD_EMOJI[log.mood as MoodType] ?? "\u{1F610}"}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted">
                {log.log_date === today
                  ? "Today"
                  : format(new Date(log.log_date + "T00:00:00"), "EEEE, MMM d")}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {log.mood && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {log.mood}
                  </Badge>
                )}
                {log.energy_level !== null && (
                  <Badge variant="accent" className="text-xs">
                    Energy: {log.energy_level}/5
                  </Badge>
                )}
                {log.sleep_quality !== null && (
                  <Badge variant="secondary" className="text-xs">
                    Sleep: {log.sleep_quality}/5
                  </Badge>
                )}
              </div>
              {log.notes && (
                <p className="text-xs text-muted mt-1 truncate">{log.notes}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
