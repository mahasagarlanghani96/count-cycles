import { PeriodHistory } from "@/features/periods/components/period-history";

export const metadata = {
  title: "Period History",
  description: "View and manage your logged periods",
};

export default function PeriodHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Period History
        </h1>
        <p className="text-sm text-muted mt-1">
          View, edit, and manage all your logged periods.
        </p>
      </div>
      <PeriodHistory />
    </div>
  );
}
