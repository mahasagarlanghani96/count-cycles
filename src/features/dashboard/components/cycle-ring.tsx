"use client";

import type { CyclePhase } from "@/types";

const PHASE_COLORS: Record<string, string> = {
  menstrual: "#F4A8C1",
  follicular: "#B5A0FF",
  ovulatory: "#FFD6BE",
  luteal: "#8971E8",
  unknown: "#D1D5DB",
};

interface CycleRingProps {
  cycleDay: number | null;
  cycleLength: number;
  phase: CyclePhase;
  periodLength?: number;
}

export function CycleRing({
  cycleDay,
  cycleLength,
  phase,
  periodLength = 5,
}: CycleRingProps) {
  const size = 240;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const ovulationDay = Math.round(cycleLength - 14);
  const follicularEnd = ovulationDay - 2;
  const ovulatoryEnd = ovulationDay + 1;

  const phases = [
    { name: "menstrual", start: 0, end: periodLength },
    { name: "follicular", start: periodLength, end: follicularEnd },
    { name: "ovulatory", start: follicularEnd, end: ovulatoryEnd },
    { name: "luteal", start: ovulatoryEnd, end: cycleLength },
  ];

  const progress = cycleDay !== null ? cycleDay / cycleLength : 0;
  const progressOffset = circumference * (1 - progress);

  const phaseLabel =
    phase === "unknown"
      ? "No cycle data"
      : `${phase.charAt(0).toUpperCase() + phase.slice(1)} phase`;

  return (
    <div
      className="relative mx-auto w-[200px] h-[200px] md:w-[240px] md:h-[240px]"
      role="img"
      aria-label={`Cycle day ${cycleDay ?? "unknown"} of ${cycleLength}. ${phaseLabel}.`}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />

        {/* Phase segments */}
        {phases.map((p) => {
          const startFraction = p.start / cycleLength;
          const endFraction = p.end / cycleLength;
          const segmentLength = (endFraction - startFraction) * circumference;
          const segmentOffset = circumference * (1 - endFraction);

          return (
            <circle
              key={p.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={PHASE_COLORS[p.name]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={segmentOffset}
              opacity={0.35}
            />
          );
        })}

        {/* Progress arc */}
        {cycleDay !== null && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={PHASE_COLORS[phase] ?? PHASE_COLORS.unknown}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl md:text-4xl font-bold text-foreground">
          {cycleDay ?? "--"}
        </span>
        <span className="text-xs md:text-sm text-muted mt-0.5">
          {cycleDay !== null ? `of ${cycleLength} days` : "No data"}
        </span>
        <span
          className="mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${PHASE_COLORS[phase] ?? PHASE_COLORS.unknown}25`,
            color: PHASE_COLORS[phase] ?? PHASE_COLORS.unknown,
          }}
        >
          {phaseLabel}
        </span>
      </div>
    </div>
  );
}
