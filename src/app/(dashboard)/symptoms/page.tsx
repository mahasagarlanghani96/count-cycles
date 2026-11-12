import { SymptomLogger } from "@/features/symptoms/components/symptom-logger";
import { SymptomHistory } from "@/features/symptoms/components/symptom-history";

export const metadata = {
  title: "Log Symptoms",
  description: "Track your daily symptoms and patterns",
};

export default function SymptomsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Log Symptoms
        </h1>
        <p className="text-sm text-muted mt-1">
          Track what you&apos;re experiencing to discover patterns over time.
        </p>
      </div>
      <SymptomLogger />
      <SymptomHistory />
    </div>
  );
}
