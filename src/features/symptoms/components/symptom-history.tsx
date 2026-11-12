"use client";

import { format, subDays } from "date-fns";
import { useSymptoms } from "@/features/symptoms/hooks/use-symptoms";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { SymptomLog } from "@/types";

function groupByDate(symptoms: SymptomLog[]): Record<string, SymptomLog[]> {
  const groups: Record<string, SymptomLog[]> = {};
  for (const s of symptoms) {
    if (!groups[s.log_date]) groups[s.log_date] = [];
    groups[s.log_date].push(s);
  }
  return groups;
}

export function SymptomHistory() {
  const today = format(new Date(), "yyyy-MM-dd");
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const { data: symptoms, isLoading } = useSymptoms(thirtyDaysAgo, today);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </CardContent>
      </Card>
    );
  }

  if (!symptoms?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Symptoms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">No symptoms logged in the last 30 days.</p>
        </CardContent>
      </Card>
    );
  }

  const grouped = groupByDate(symptoms);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Symptoms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dates.map((date) => (
          <div key={date}>
            <p className="text-xs font-medium text-muted mb-1.5">
              {date === today
                ? "Today"
                : format(new Date(date + "T00:00:00"), "EEEE, MMM d")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {grouped[date].map((s) => (
                <Badge
                  key={s.id}
                  variant={
                    s.severity === "severe"
                      ? "destructive"
                      : s.severity === "moderate"
                        ? "accent"
                        : "secondary"
                  }
                >
                  {s.symptom_name}
                  <span className="ml-1 opacity-60 text-[10px]">
                    ({s.severity})
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
