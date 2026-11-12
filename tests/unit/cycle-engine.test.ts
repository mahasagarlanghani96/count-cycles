import { describe, it, expect } from "vitest";
import type { PeriodRecord } from "@/types";
import {
  calculateCycleLengths,
  calculatePeriodLengths,
  calculateCycleStats,
  predictNextPeriods,
  getCurrentCycleInfo,
  estimatePhase,
  isDateInPeriod,
} from "@/lib/dates/cycle-engine";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makePeriod(
  startDate: string,
  endDate: string | null = null,
  overrides: Partial<PeriodRecord> = {}
): PeriodRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    user_id: overrides.user_id ?? "user-1",
    start_date: startDate,
    end_date: endDate,
    is_predicted: overrides.is_predicted ?? false,
    notes: overrides.notes ?? null,
    created_at: overrides.created_at ?? "2025-01-01T00:00:00Z",
    updated_at: overrides.updated_at ?? "2025-01-01T00:00:00Z",
  };
}

// Standard 28-day cycles with 5-day periods
const regularPeriods: PeriodRecord[] = [
  makePeriod("2025-01-01", "2025-01-05"),
  makePeriod("2025-01-29", "2025-02-02"),
  makePeriod("2025-02-26", "2025-03-02"),
  makePeriod("2025-03-26", "2025-03-30"),
  makePeriod("2025-04-23", "2025-04-27"),
  makePeriod("2025-05-21", "2025-05-25"),
  makePeriod("2025-06-18", "2025-06-22"),
];

// Short 21-day cycles
const shortCyclePeriods: PeriodRecord[] = [
  makePeriod("2025-01-01", "2025-01-03"),
  makePeriod("2025-01-22", "2025-01-24"),
  makePeriod("2025-02-12", "2025-02-14"),
  makePeriod("2025-03-05", "2025-03-07"),
];

// Long 35-day cycles
const longCyclePeriods: PeriodRecord[] = [
  makePeriod("2025-01-01", "2025-01-06"),
  makePeriod("2025-02-05", "2025-02-10"),
  makePeriod("2025-03-12", "2025-03-17"),
  makePeriod("2025-04-16", "2025-04-21"),
];

// Irregular cycles
const irregularPeriods: PeriodRecord[] = [
  makePeriod("2025-01-01", "2025-01-05"),
  makePeriod("2025-01-22", "2025-01-26"), // 21 days
  makePeriod("2025-02-26", "2025-03-02"), // 35 days
  makePeriod("2025-03-24", "2025-03-28"), // 26 days
  makePeriod("2025-04-25", "2025-04-29"), // 32 days
];

// ---------------------------------------------------------------------------
// calculateCycleLengths
// ---------------------------------------------------------------------------

describe("calculateCycleLengths", () => {
  it("calculates standard 28-day cycles", () => {
    const lengths = calculateCycleLengths(regularPeriods);
    expect(lengths).toEqual([28, 28, 28, 28, 28, 28]);
  });

  it("calculates short 21-day cycles", () => {
    const lengths = calculateCycleLengths(shortCyclePeriods);
    expect(lengths).toEqual([21, 21, 21]);
  });

  it("calculates long 35-day cycles", () => {
    const lengths = calculateCycleLengths(longCyclePeriods);
    expect(lengths).toEqual([35, 35, 35]);
  });

  it("calculates mixed irregular cycle lengths", () => {
    const lengths = calculateCycleLengths(irregularPeriods);
    expect(lengths).toEqual([21, 35, 26, 32]);
  });

  it("returns empty array with less than 2 periods", () => {
    const single = [makePeriod("2025-01-01", "2025-01-05")];
    expect(calculateCycleLengths(single)).toEqual([]);
  });

  it("returns empty array with no periods", () => {
    expect(calculateCycleLengths([])).toEqual([]);
  });

  it("skips gaps greater than 90 days", () => {
    const withGap: PeriodRecord[] = [
      makePeriod("2025-01-01", "2025-01-05"),
      makePeriod("2025-01-29", "2025-02-02"), // 28 days - kept
      makePeriod("2025-06-01", "2025-06-05"), // 123 days - skipped
      makePeriod("2025-06-29", "2025-07-03"), // 28 days - kept
    ];
    const lengths = calculateCycleLengths(withGap);
    expect(lengths).toEqual([28, 28]);
  });

  it("keeps exactly 90-day gap", () => {
    const periods: PeriodRecord[] = [
      makePeriod("2025-01-01", "2025-01-05"),
      makePeriod("2025-04-01", "2025-04-05"), // exactly 90 days
    ];
    expect(calculateCycleLengths(periods)).toEqual([90]);
  });

  it("skips 91-day gap", () => {
    const periods: PeriodRecord[] = [
      makePeriod("2025-01-01", "2025-01-05"),
      makePeriod("2025-04-02", "2025-04-06"), // 91 days
    ];
    expect(calculateCycleLengths(periods)).toEqual([]);
  });

  it("ignores predicted periods", () => {
    const periods: PeriodRecord[] = [
      makePeriod("2025-01-01", "2025-01-05"),
      makePeriod("2025-01-29", "2025-02-02", { is_predicted: true }),
      makePeriod("2025-02-26", "2025-03-02"),
    ];
    // predicted period is filtered, so gap is 56 days (Jan 1 -> Feb 26)
    expect(calculateCycleLengths(periods)).toEqual([56]);
  });

  it("sorts periods by start date regardless of input order", () => {
    const unordered: PeriodRecord[] = [
      makePeriod("2025-02-26", "2025-03-02"),
      makePeriod("2025-01-01", "2025-01-05"),
      makePeriod("2025-01-29", "2025-02-02"),
    ];
    expect(calculateCycleLengths(unordered)).toEqual([28, 28]);
  });
});

// ---------------------------------------------------------------------------
// calculatePeriodLengths
// ---------------------------------------------------------------------------

describe("calculatePeriodLengths", () => {
  it("calculates normal 5-day periods", () => {
    const lengths = calculatePeriodLengths(regularPeriods);
    expect(lengths).toEqual([5, 5, 5, 5, 5, 5, 5]);
  });

  it("calculates short 2-day periods", () => {
    const periods: PeriodRecord[] = [
      makePeriod("2025-01-01", "2025-01-02"),
      makePeriod("2025-02-01", "2025-02-02"),
    ];
    expect(calculatePeriodLengths(periods)).toEqual([2, 2]);
  });

  it("calculates 1-day periods", () => {
    const periods: PeriodRecord[] = [
      makePeriod("2025-01-01", "2025-01-01"),
    ];
    // differenceInDays("2025-01-01","2025-01-01") + 1 = 1
    expect(calculatePeriodLengths(periods)).toEqual([1]);
  });

  it("filters out periods without end dates", () => {
    const periods: PeriodRecord[] = [
      makePeriod("2025-01-01", "2025-01-05"),
      makePeriod("2025-02-01", null),
      makePeriod("2025-03-01", "2025-03-04"),
    ];
    expect(calculatePeriodLengths(periods)).toEqual([5, 4]);
  });

  it("filters out periods longer than 14 days", () => {
    const periods: PeriodRecord[] = [
      makePeriod("2025-01-01", "2025-01-05"), // 5 days
      makePeriod("2025-02-01", "2025-02-15"), // 15 days - filtered
      makePeriod("2025-03-01", "2025-03-04"), // 4 days
    ];
    expect(calculatePeriodLengths(periods)).toEqual([5, 4]);
  });

  it("keeps exactly 14-day period", () => {
    const periods: PeriodRecord[] = [
      makePeriod("2025-01-01", "2025-01-14"), // 14 days
    ];
    expect(calculatePeriodLengths(periods)).toEqual([14]);
  });

  it("ignores predicted periods", () => {
    const periods: PeriodRecord[] = [
      makePeriod("2025-01-01", "2025-01-05"),
      makePeriod("2025-02-01", "2025-02-05", { is_predicted: true }),
    ];
    expect(calculatePeriodLengths(periods)).toEqual([5]);
  });

  it("returns empty for all periods without end dates", () => {
    const periods: PeriodRecord[] = [
      makePeriod("2025-01-01", null),
      makePeriod("2025-02-01", null),
    ];
    expect(calculatePeriodLengths(periods)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// calculateCycleStats
// ---------------------------------------------------------------------------

describe("calculateCycleStats", () => {
  it("returns null values with insufficient data (no periods)", () => {
    const stats = calculateCycleStats([]);
    expect(stats).toEqual({
      averageCycleLength: null,
      medianCycleLength: null,
      averagePeriodLength: null,
      shortestCycle: null,
      longestCycle: null,
      cycleLengthVariability: null,
      totalRecordedCycles: 0,
      isRegular: null,
    });
  });

  it("returns null values with a single period", () => {
    const stats = calculateCycleStats([makePeriod("2025-01-01", "2025-01-05")]);
    expect(stats.averageCycleLength).toBeNull();
    expect(stats.medianCycleLength).toBeNull();
    expect(stats.totalRecordedCycles).toBe(0);
    expect(stats.isRegular).toBeNull();
    // averagePeriodLength should still be computed
    expect(stats.averagePeriodLength).toBe(5);
  });

  it("calculates correct averages for regular cycles", () => {
    const stats = calculateCycleStats(regularPeriods);
    expect(stats.averageCycleLength).toBe(28);
    expect(stats.averagePeriodLength).toBe(5);
  });

  it("calculates correct median for regular cycles", () => {
    const stats = calculateCycleStats(regularPeriods);
    expect(stats.medianCycleLength).toBe(28);
  });

  it("calculates correct median for even number of values", () => {
    // irregular periods have lengths [21, 35, 26, 32], sorted: [21, 26, 32, 35]
    // median = round((26 + 32) / 2) = 29
    const stats = calculateCycleStats(irregularPeriods);
    expect(stats.medianCycleLength).toBe(29);
  });

  it("calculates correct average for irregular cycles", () => {
    // [21, 35, 26, 32] -> average = round(114 / 4) = round(28.5) = 29 (Math.round)
    const stats = calculateCycleStats(irregularPeriods);
    expect(stats.averageCycleLength).toBe(29);
  });

  it("calculates variability as standard deviation", () => {
    const stats = calculateCycleStats(regularPeriods);
    // All 28s -> SD = 0
    expect(stats.cycleLengthVariability).toBe(0);
  });

  it("marks regular cycles as isRegular (variability <= 4)", () => {
    const stats = calculateCycleStats(regularPeriods);
    expect(stats.isRegular).toBe(true);
  });

  it("marks irregular cycles as not regular (variability > 4)", () => {
    const stats = calculateCycleStats(irregularPeriods);
    // [21, 35, 26, 32] -> mean=28.5, SD ~ 5.36
    expect(stats.isRegular).toBe(false);
    expect(stats.cycleLengthVariability).toBeGreaterThan(4);
  });

  it("calculates shortest and longest cycle", () => {
    const stats = calculateCycleStats(irregularPeriods);
    expect(stats.shortestCycle).toBe(21);
    expect(stats.longestCycle).toBe(35);
  });

  it("reports correct totalRecordedCycles", () => {
    const stats = calculateCycleStats(regularPeriods);
    expect(stats.totalRecordedCycles).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// predictNextPeriods
// ---------------------------------------------------------------------------

describe("predictNextPeriods", () => {
  it("returns empty array with no periods", () => {
    expect(predictNextPeriods([])).toEqual([]);
  });

  it("predicts based on average cycle length", () => {
    const predictions = predictNextPeriods(regularPeriods, 1);
    expect(predictions).toHaveLength(1);
    // Last period starts 2025-06-18, average cycle = 28
    // Next: 2025-06-18 + 28 = 2025-07-16
    expect(predictions[0].startDate).toBe("2025-07-16");
  });

  it("predicts correct end date based on average period length", () => {
    const predictions = predictNextPeriods(regularPeriods, 1);
    // avg period = 5, so end = start + 4 = 2025-07-20
    expect(predictions[0].endDate).toBe("2025-07-20");
  });

  it("uses fallback cycle length when insufficient data", () => {
    const single = [makePeriod("2025-01-01", "2025-01-05")];
    const predictions = predictNextPeriods(single, 1, 30);
    expect(predictions).toHaveLength(1);
    // 2025-01-01 + 30 = 2025-01-31
    expect(predictions[0].startDate).toBe("2025-01-31");
  });

  it("returns empty when single period and no fallback", () => {
    const single = [makePeriod("2025-01-01", "2025-01-05")];
    const predictions = predictNextPeriods(single, 1);
    expect(predictions).toEqual([]);
  });

  it("returns high confidence for >= 6 regular cycles", () => {
    const predictions = predictNextPeriods(regularPeriods, 1);
    // 6 recorded cycles, all regular (SD=0)
    expect(predictions[0].confidence).toBe("high");
  });

  it("returns medium confidence for >= 3 cycles", () => {
    const fourPeriods = regularPeriods.slice(0, 4); // 3 cycle lengths
    const predictions = predictNextPeriods(fourPeriods, 1);
    expect(predictions[0].confidence).toBe("medium");
  });

  it("returns low confidence for < 3 cycles", () => {
    const twoPeriods = regularPeriods.slice(0, 2); // 1 cycle length
    const predictions = predictNextPeriods(twoPeriods, 1);
    expect(predictions[0].confidence).toBe("low");
  });

  it("decreases confidence for subsequent predictions (high -> medium)", () => {
    const predictions = predictNextPeriods(regularPeriods, 3);
    expect(predictions[0].confidence).toBe("high");
    expect(predictions[1].confidence).toBe("medium");
    expect(predictions[2].confidence).toBe("medium");
  });

  it("decreases confidence for subsequent predictions (medium -> low)", () => {
    const fourPeriods = regularPeriods.slice(0, 4);
    const predictions = predictNextPeriods(fourPeriods, 3);
    expect(predictions[0].confidence).toBe("medium");
    expect(predictions[1].confidence).toBe("low");
    expect(predictions[2].confidence).toBe("low");
  });

  it("all predictions have isEstimate true", () => {
    const predictions = predictNextPeriods(regularPeriods, 3);
    predictions.forEach((p) => {
      expect(p.isEstimate).toBe(true);
    });
  });

  it("spaces multiple predictions by cycle length increments", () => {
    const predictions = predictNextPeriods(regularPeriods, 3);
    // Last start: 2025-06-18, cycle = 28
    expect(predictions[0].startDate).toBe("2025-07-16"); // +28
    expect(predictions[1].startDate).toBe("2025-08-13"); // +56
    expect(predictions[2].startDate).toBe("2025-09-10"); // +84
  });

  it("defaults to count of 3", () => {
    const predictions = predictNextPeriods(regularPeriods);
    expect(predictions).toHaveLength(3);
  });

  it("uses fallback period length of 5 when no end dates", () => {
    const noEndDates: PeriodRecord[] = [
      makePeriod("2025-01-01", null),
      makePeriod("2025-01-29", null),
    ];
    const predictions = predictNextPeriods(noEndDates, 1);
    expect(predictions).toHaveLength(1);
    // endDate = startDate + 4 (period length 5 - 1)
    const start = predictions[0].startDate;
    const end = predictions[0].endDate;
    // parse and check difference
    const diffMs =
      new Date(end).getTime() - new Date(start).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(4); // 5-day period means end is 4 days after start
  });
});

// ---------------------------------------------------------------------------
// getCurrentCycleInfo
// ---------------------------------------------------------------------------

describe("getCurrentCycleInfo", () => {
  it("returns unknown phase with no data", () => {
    const info = getCurrentCycleInfo([], new Date("2025-03-15"));
    expect(info.phase).toBe("unknown");
    expect(info.cycleDay).toBeNull();
    expect(info.daysUntilNextPeriod).toBeNull();
    expect(info.nextPeriodEstimate).toBeNull();
    expect(info.lastPeriodStart).toBeNull();
    expect(info.lastPeriodEnd).toBeNull();
    expect(info.isOnPeriod).toBe(false);
  });

  it("calculates correct cycle day", () => {
    const periods = [makePeriod("2025-03-01", "2025-03-05")];
    // Reference date: March 10 -> cycle day = 10
    const info = getCurrentCycleInfo(periods, new Date("2025-03-10"), 28);
    expect(info.cycleDay).toBe(10);
  });

  it("cycle day 1 on period start date", () => {
    const periods = [makePeriod("2025-03-01", "2025-03-05")];
    const info = getCurrentCycleInfo(periods, new Date("2025-03-01"), 28);
    expect(info.cycleDay).toBe(1);
  });

  it("identifies when on period (within start and end)", () => {
    const periods = [makePeriod("2025-03-01", "2025-03-05")];
    const info = getCurrentCycleInfo(periods, new Date("2025-03-03"), 28);
    expect(info.isOnPeriod).toBe(true);
  });

  it("identifies when on period at start boundary", () => {
    const periods = [makePeriod("2025-03-01", "2025-03-05")];
    const info = getCurrentCycleInfo(periods, new Date("2025-03-01"), 28);
    expect(info.isOnPeriod).toBe(true);
  });

  it("identifies when on period at end boundary", () => {
    const periods = [makePeriod("2025-03-01", "2025-03-05")];
    const info = getCurrentCycleInfo(periods, new Date("2025-03-05"), 28);
    expect(info.isOnPeriod).toBe(true);
  });

  it("identifies when not on period", () => {
    const periods = [makePeriod("2025-03-01", "2025-03-05")];
    const info = getCurrentCycleInfo(periods, new Date("2025-03-10"), 28);
    expect(info.isOnPeriod).toBe(false);
  });

  it("estimates next period date", () => {
    const periods = [makePeriod("2025-03-01", "2025-03-05")];
    const info = getCurrentCycleInfo(periods, new Date("2025-03-10"), 28);
    // next period = 2025-03-01 + 28 = 2025-03-29
    expect(info.nextPeriodEstimate).toBe("2025-03-29");
  });

  it("calculates days until next period", () => {
    const periods = [makePeriod("2025-03-01", "2025-03-05")];
    const info = getCurrentCycleInfo(periods, new Date("2025-03-10"), 28);
    // next: 2025-03-29, today: 2025-03-10 -> 19 days
    expect(info.daysUntilNextPeriod).toBe(19);
  });

  it("returns null daysUntilNextPeriod when past expected date", () => {
    const periods = [makePeriod("2025-03-01", "2025-03-05")];
    // March 1 + 28 = March 29, reference = April 5 -> diff is negative
    const info = getCurrentCycleInfo(periods, new Date("2025-04-05"), 28);
    expect(info.daysUntilNextPeriod).toBeNull();
  });

  it("returns lastPeriodStart and lastPeriodEnd", () => {
    const periods = [makePeriod("2025-03-01", "2025-03-05")];
    const info = getCurrentCycleInfo(periods, new Date("2025-03-10"), 28);
    expect(info.lastPeriodStart).toBe("2025-03-01");
    expect(info.lastPeriodEnd).toBe("2025-03-05");
  });

  it("uses average cycle length when enough data", () => {
    const info = getCurrentCycleInfo(regularPeriods, new Date("2025-06-20"));
    // average cycle = 28, last start = 2025-06-18
    // next = 2025-06-18 + 28 = 2025-07-16
    expect(info.nextPeriodEstimate).toBe("2025-07-16");
  });

  it("uses fallback 28 when no stats and no fallback provided", () => {
    const periods = [makePeriod("2025-03-01", "2025-03-05")];
    const info = getCurrentCycleInfo(periods, new Date("2025-03-10"));
    // default fallback = 28
    expect(info.nextPeriodEstimate).toBe("2025-03-29");
  });

  it("returns null cycleDay when reference is before period start", () => {
    const periods = [makePeriod("2025-03-10", "2025-03-15")];
    // reference is before the period start: cycleDay would be <= 0
    const info = getCurrentCycleInfo(periods, new Date("2025-03-05"), 28);
    expect(info.cycleDay).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// estimatePhase
// ---------------------------------------------------------------------------

describe("estimatePhase", () => {
  // 28-day cycle, 5-day period
  it("returns menstrual phase on day 1", () => {
    expect(estimatePhase(1, 28, 5)).toBe("menstrual");
  });

  it("returns menstrual phase on last period day", () => {
    expect(estimatePhase(5, 28, 5)).toBe("menstrual");
  });

  it("returns follicular phase after period", () => {
    expect(estimatePhase(6, 28, 5)).toBe("follicular");
  });

  it("returns follicular phase before ovulation window", () => {
    // ovulationDay = round(28-14) = 14, follicularEnd = 14-2 = 12
    expect(estimatePhase(12, 28, 5)).toBe("follicular");
  });

  it("returns ovulatory phase at ovulation start", () => {
    // ovulatoryStart = follicularEnd + 1 = 13
    expect(estimatePhase(13, 28, 5)).toBe("ovulatory");
  });

  it("returns ovulatory phase at ovulation day", () => {
    expect(estimatePhase(14, 28, 5)).toBe("ovulatory");
  });

  it("returns ovulatory phase at ovulation end", () => {
    // ovulatoryEnd = 14 + 1 = 15
    expect(estimatePhase(15, 28, 5)).toBe("ovulatory");
  });

  it("returns luteal phase after ovulation", () => {
    expect(estimatePhase(16, 28, 5)).toBe("luteal");
  });

  it("returns luteal phase on last day of cycle", () => {
    expect(estimatePhase(28, 28, 5)).toBe("luteal");
  });

  it("returns unknown for day 0", () => {
    expect(estimatePhase(0, 28, 5)).toBe("unknown");
  });

  it("returns unknown for negative day", () => {
    expect(estimatePhase(-1, 28, 5)).toBe("unknown");
  });

  it("returns unknown for day exceeding cycle length", () => {
    expect(estimatePhase(29, 28, 5)).toBe("unknown");
  });

  // 21-day cycle
  it("works with 21-day cycle - menstrual", () => {
    expect(estimatePhase(1, 21, 3)).toBe("menstrual");
    expect(estimatePhase(3, 21, 3)).toBe("menstrual");
  });

  it("works with 21-day cycle - follicular", () => {
    // ovulationDay = round(21-14) = 7, follicularEnd = 5
    expect(estimatePhase(4, 21, 3)).toBe("follicular");
    expect(estimatePhase(5, 21, 3)).toBe("follicular");
  });

  it("works with 21-day cycle - ovulatory", () => {
    // ovulatoryEnd = 7 + 1 = 8
    expect(estimatePhase(6, 21, 3)).toBe("ovulatory");
    expect(estimatePhase(7, 21, 3)).toBe("ovulatory");
    expect(estimatePhase(8, 21, 3)).toBe("ovulatory");
  });

  it("works with 21-day cycle - luteal", () => {
    expect(estimatePhase(9, 21, 3)).toBe("luteal");
    expect(estimatePhase(21, 21, 3)).toBe("luteal");
  });

  // 35-day cycle
  it("works with 35-day cycle - menstrual", () => {
    expect(estimatePhase(1, 35, 6)).toBe("menstrual");
    expect(estimatePhase(6, 35, 6)).toBe("menstrual");
  });

  it("works with 35-day cycle - follicular", () => {
    // ovulationDay = round(35-14) = 21, follicularEnd = 19
    expect(estimatePhase(7, 35, 6)).toBe("follicular");
    expect(estimatePhase(19, 35, 6)).toBe("follicular");
  });

  it("works with 35-day cycle - ovulatory", () => {
    // ovulationDay = 21, ovulatoryEnd = 22
    expect(estimatePhase(20, 35, 6)).toBe("ovulatory");
    expect(estimatePhase(21, 35, 6)).toBe("ovulatory");
    expect(estimatePhase(22, 35, 6)).toBe("ovulatory");
  });

  it("works with 35-day cycle - luteal", () => {
    expect(estimatePhase(23, 35, 6)).toBe("luteal");
    expect(estimatePhase(35, 35, 6)).toBe("luteal");
  });
});

// ---------------------------------------------------------------------------
// isDateInPeriod
// ---------------------------------------------------------------------------

describe("isDateInPeriod", () => {
  const periods: PeriodRecord[] = [
    makePeriod("2025-03-01", "2025-03-05"),
    makePeriod("2025-03-29", "2025-04-02"),
  ];

  it("returns the period when date falls within it", () => {
    const result = isDateInPeriod(new Date("2025-03-03"), periods);
    expect(result).not.toBeNull();
    expect(result!.start_date).toBe("2025-03-01");
  });

  it("returns null when date is outside all periods", () => {
    const result = isDateInPeriod(new Date("2025-03-15"), periods);
    expect(result).toBeNull();
  });

  it("returns the period on start date boundary", () => {
    const result = isDateInPeriod(new Date("2025-03-01"), periods);
    expect(result).not.toBeNull();
    expect(result!.start_date).toBe("2025-03-01");
  });

  it("returns the period on end date boundary", () => {
    const result = isDateInPeriod(new Date("2025-03-05"), periods);
    expect(result).not.toBeNull();
    expect(result!.start_date).toBe("2025-03-01");
  });

  it("returns null for date just after period end", () => {
    const result = isDateInPeriod(new Date("2025-03-06"), periods);
    expect(result).toBeNull();
  });

  it("returns null for date just before period start", () => {
    const result = isDateInPeriod(new Date("2025-02-28"), periods);
    expect(result).toBeNull();
  });

  it("matches second period correctly", () => {
    const result = isDateInPeriod(new Date("2025-03-31"), periods);
    expect(result).not.toBeNull();
    expect(result!.start_date).toBe("2025-03-29");
  });

  it("only matches start date when end_date is null", () => {
    const noEndPeriods: PeriodRecord[] = [
      makePeriod("2025-03-01", null),
    ];
    const onStart = isDateInPeriod(new Date("2025-03-01"), noEndPeriods);
    expect(onStart).not.toBeNull();

    const dayAfter = isDateInPeriod(new Date("2025-03-02"), noEndPeriods);
    expect(dayAfter).toBeNull();
  });

  it("returns null for empty periods array", () => {
    const result = isDateInPeriod(new Date("2025-03-03"), []);
    expect(result).toBeNull();
  });

  it("includes predicted periods (no filter in isDateInPeriod)", () => {
    const predicted: PeriodRecord[] = [
      makePeriod("2025-03-01", "2025-03-05", { is_predicted: true }),
    ];
    const result = isDateInPeriod(new Date("2025-03-03"), predicted);
    // isDateInPeriod iterates all periods, does not filter predicted
    expect(result).not.toBeNull();
  });
});
