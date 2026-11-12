import {
  differenceInDays,
  addDays,
  parseISO,
  isBefore,
  isAfter,
  isEqual,
  startOfDay,
  format,
} from "date-fns";
import type { CyclePhase, PeriodRecord } from "@/types";

export interface CycleStats {
  averageCycleLength: number | null;
  medianCycleLength: number | null;
  averagePeriodLength: number | null;
  shortestCycle: number | null;
  longestCycle: number | null;
  cycleLengthVariability: number | null;
  totalRecordedCycles: number;
  isRegular: boolean | null;
}

export interface PredictedPeriod {
  startDate: string;
  endDate: string;
  confidence: "low" | "medium" | "high";
  isEstimate: true;
}

export interface CurrentCycleInfo {
  cycleDay: number | null;
  phase: CyclePhase;
  daysUntilNextPeriod: number | null;
  nextPeriodEstimate: string | null;
  lastPeriodStart: string | null;
  lastPeriodEnd: string | null;
  isOnPeriod: boolean;
}

function sortPeriodsByDate(periods: PeriodRecord[]): PeriodRecord[] {
  return [...periods]
    .filter((p) => !p.is_predicted)
    .sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime());
}

export function calculateCycleLengths(periods: PeriodRecord[]): number[] {
  const sorted = sortPeriodsByDate(periods);
  if (sorted.length < 2) return [];

  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const days = differenceInDays(
      parseISO(sorted[i].start_date),
      parseISO(sorted[i - 1].start_date)
    );
    if (days > 0 && days <= 90) {
      lengths.push(days);
    }
  }
  return lengths;
}

export function calculatePeriodLengths(periods: PeriodRecord[]): number[] {
  return sortPeriodsByDate(periods)
    .filter((p) => p.end_date)
    .map((p) => differenceInDays(parseISO(p.end_date!), parseISO(p.start_date)) + 1)
    .filter((d) => d > 0 && d <= 14);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function standardDeviation(values: number[]): number | null {
  if (values.length < 2) return null;
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squareDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(squareDiffs.reduce((sum, v) => sum + v, 0) / values.length);
}

export function calculateCycleStats(periods: PeriodRecord[]): CycleStats {
  const cycleLengths = calculateCycleLengths(periods);
  const periodLengths = calculatePeriodLengths(periods);
  const variability = standardDeviation(cycleLengths);

  return {
    averageCycleLength: average(cycleLengths),
    medianCycleLength: median(cycleLengths),
    averagePeriodLength: average(periodLengths),
    shortestCycle: cycleLengths.length > 0 ? Math.min(...cycleLengths) : null,
    longestCycle: cycleLengths.length > 0 ? Math.max(...cycleLengths) : null,
    cycleLengthVariability: variability !== null ? Math.round(variability * 10) / 10 : null,
    totalRecordedCycles: cycleLengths.length,
    isRegular: variability !== null ? variability <= 4 : null,
  };
}

export function predictNextPeriods(
  periods: PeriodRecord[],
  count: number = 3,
  fallbackCycleLength?: number
): PredictedPeriod[] {
  const sorted = sortPeriodsByDate(periods);
  if (sorted.length === 0) return [];

  const stats = calculateCycleStats(periods);
  const cycleLength = stats.averageCycleLength ?? fallbackCycleLength ?? null;
  if (cycleLength === null) return [];

  const periodLength = stats.averagePeriodLength ?? 5;
  const lastStart = parseISO(sorted[sorted.length - 1].start_date);

  let confidence: PredictedPeriod["confidence"] = "low";
  if (stats.totalRecordedCycles >= 6 && stats.isRegular) {
    confidence = "high";
  } else if (stats.totalRecordedCycles >= 3) {
    confidence = "medium";
  }

  const predictions: PredictedPeriod[] = [];
  for (let i = 1; i <= count; i++) {
    const startDate = addDays(lastStart, cycleLength * i);
    const endDate = addDays(startDate, periodLength - 1);
    predictions.push({
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      confidence: i === 1 ? confidence : confidence === "high" ? "medium" : "low",
      isEstimate: true,
    });
  }
  return predictions;
}

export function getCurrentCycleInfo(
  periods: PeriodRecord[],
  referenceDate: Date = new Date(),
  fallbackCycleLength?: number
): CurrentCycleInfo {
  const sorted = sortPeriodsByDate(periods);
  const today = startOfDay(referenceDate);

  if (sorted.length === 0) {
    return {
      cycleDay: null,
      phase: "unknown",
      daysUntilNextPeriod: null,
      nextPeriodEstimate: null,
      lastPeriodStart: null,
      lastPeriodEnd: null,
      isOnPeriod: false,
    };
  }

  const lastPeriod = sorted[sorted.length - 1];
  const lastStart = parseISO(lastPeriod.start_date);
  const lastEnd = lastPeriod.end_date ? parseISO(lastPeriod.end_date) : null;

  const isOnPeriod =
    (isAfter(today, lastStart) || isEqual(today, lastStart)) &&
    (lastEnd === null || isBefore(today, addDays(lastEnd, 1)));

  const cycleDay = differenceInDays(today, lastStart) + 1;

  const stats = calculateCycleStats(periods);
  const cycleLength = stats.averageCycleLength ?? fallbackCycleLength ?? 28;
  const periodLength = stats.averagePeriodLength ?? 5;

  const phase = estimatePhase(cycleDay, cycleLength, periodLength);
  const nextPeriodStart = addDays(lastStart, cycleLength);
  const daysUntil = differenceInDays(nextPeriodStart, today);

  return {
    cycleDay: cycleDay > 0 ? cycleDay : null,
    phase,
    daysUntilNextPeriod: daysUntil > 0 ? daysUntil : null,
    nextPeriodEstimate: format(nextPeriodStart, "yyyy-MM-dd"),
    lastPeriodStart: lastPeriod.start_date,
    lastPeriodEnd: lastPeriod.end_date,
    isOnPeriod: isOnPeriod && cycleDay > 0,
  };
}

export function estimatePhase(
  cycleDay: number,
  cycleLength: number,
  periodLength: number
): CyclePhase {
  if (cycleDay <= 0 || cycleDay > cycleLength) return "unknown";
  if (cycleDay <= periodLength) return "menstrual";

  const ovulationDay = Math.round(cycleLength - 14);
  const follicularEnd = ovulationDay - 2;
  const ovulatoryEnd = ovulationDay + 1;

  if (cycleDay <= follicularEnd) return "follicular";
  if (cycleDay <= ovulatoryEnd) return "ovulatory";
  return "luteal";
}

export function isDateInPeriod(
  date: Date,
  periods: PeriodRecord[]
): PeriodRecord | null {
  const day = startOfDay(date);
  for (const period of periods) {
    const start = parseISO(period.start_date);
    const end = period.end_date
      ? parseISO(period.end_date)
      : start;
    if (
      (isAfter(day, start) || isEqual(day, start)) &&
      (isBefore(day, addDays(end, 1)))
    ) {
      return period;
    }
  }
  return null;
}
