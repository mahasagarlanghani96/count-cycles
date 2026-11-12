"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { isDateInPeriod, predictNextPeriods } from "@/lib/dates";
import { usePeriods } from "@/features/periods/hooks/use-periods";
import { useSymptoms } from "@/features/symptoms/hooks/use-symptoms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DayDetailDialog } from "./day-detail-dialog";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: periods = [] } = usePeriods();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const { data: symptoms = [] } = useSymptoms(
    format(calendarStart, "yyyy-MM-dd"),
    format(calendarEnd, "yyyy-MM-dd")
  );

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  const predictions = useMemo(
    () => predictNextPeriods(periods, 3),
    [periods]
  );

  const predictedPeriods = useMemo(
    () =>
      predictions.map((p) => ({
        id: `predicted-${p.startDate}`,
        user_id: "",
        start_date: p.startDate,
        end_date: p.endDate,
        is_predicted: true,
        notes: null,
        created_at: "",
        updated_at: "",
      })),
    [predictions]
  );

  const symptomsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of symptoms) {
      const key = s.log_date;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [symptoms]);

  function getDayClasses(day: Date) {
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isToday = isSameDay(day, today);
    const periodMatch = isDateInPeriod(day, periods);
    const predictedMatch = isDateInPeriod(day, predictedPeriods);
    const dateKey = format(day, "yyyy-MM-dd");
    const hasSymptoms = (symptomsByDate.get(dateKey) ?? 0) > 0;

    return {
      isCurrentMonth,
      isToday,
      isPeriod: !!periodMatch,
      isPredicted: !!predictedMatch && !periodMatch,
      hasSymptoms,
    };
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted py-1"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const info = getDayClasses(day);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl p-1.5 text-sm transition-colors min-h-[44px]",
                    !info.isCurrentMonth && "text-muted/40",
                    info.isCurrentMonth && "text-foreground",
                    info.isToday && "ring-2 ring-primary-500 font-bold",
                    info.isPeriod &&
                      "bg-primary-100 text-primary-700 font-semibold",
                    info.isPredicted &&
                      "border-2 border-dashed border-primary-300",
                    !info.isPeriod &&
                      !info.isPredicted &&
                      info.isCurrentMonth &&
                      "hover:bg-surface-alt"
                  )}
                >
                  <span>{format(day, "d")}</span>
                  {info.hasSymptoms && (
                    <span className="absolute bottom-1 flex gap-0.5">
                      <span className="h-1 w-1 rounded-full bg-accent-500" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-primary-100 border border-primary-200" />
              Period
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border-2 border-dashed border-primary-300" />
              Predicted
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              Symptoms
            </div>
          </div>
        </CardContent>
      </Card>

      <DayDetailDialog
        date={selectedDate}
        open={!!selectedDate}
        onOpenChange={(open) => {
          if (!open) setSelectedDate(null);
        }}
      />
    </div>
  );
}
