import { MoodLogger } from "@/features/mood/components/mood-logger";
import { MoodHistory } from "@/features/mood/components/mood-history";

export const metadata = {
  title: "Log Mood",
  description: "Track your mood, energy, and sleep quality",
};

export default function MoodPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Log Mood
        </h1>
        <p className="text-sm text-muted mt-1">
          Track your mood, energy levels, and sleep quality.
        </p>
      </div>
      <MoodLogger />
      <MoodHistory />
    </div>
  );
}
