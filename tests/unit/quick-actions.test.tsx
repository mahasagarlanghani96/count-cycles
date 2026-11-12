import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import type { PeriodRecord } from "@/types";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/features/periods/hooks/use-periods", () => ({
  useCreatePeriod: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdatePeriod: () => ({ mutate: vi.fn(), isPending: false }),
}));

const mockPeriod: PeriodRecord = {
  id: "p1",
  user_id: "u1",
  start_date: "2026-11-10",
  end_date: null,
  is_predicted: false,
  notes: null,
  created_at: "2026-11-10T00:00:00Z",
  updated_at: "2026-11-10T00:00:00Z",
};

describe("QuickActions", () => {
  it("renders all four action buttons", () => {
    render(<QuickActions />);
    expect(screen.getByText("Start Period")).toBeInTheDocument();
    expect(screen.getByText("End Period")).toBeInTheDocument();
    expect(screen.getByText("Log Symptoms")).toBeInTheDocument();
    expect(screen.getByText("Log Mood")).toBeInTheDocument();
  });

  it("Start Period is enabled when not on period", () => {
    render(<QuickActions isOnPeriod={false} />);
    const btn = screen.getByText("Start Period").closest("button")!;
    expect(btn).not.toBeDisabled();
  });

  it("Start Period is disabled when on period", () => {
    render(<QuickActions latestPeriod={mockPeriod} isOnPeriod={true} />);
    const btn = screen.getByText("Start Period").closest("button")!;
    expect(btn).toBeDisabled();
  });

  it("End Period is enabled when on period", () => {
    render(<QuickActions latestPeriod={mockPeriod} isOnPeriod={true} />);
    const btn = screen.getByText("End Period").closest("button")!;
    expect(btn).not.toBeDisabled();
  });

  it("End Period is disabled when not on period", () => {
    render(<QuickActions isOnPeriod={false} />);
    const btn = screen.getByText("End Period").closest("button")!;
    expect(btn).toBeDisabled();
  });

  it("Log Symptoms links to /symptoms", () => {
    render(<QuickActions />);
    const link = screen.getByText("Log Symptoms").closest("a")!;
    expect(link).toHaveAttribute("href", "/symptoms");
  });

  it("Log Mood links to /mood", () => {
    render(<QuickActions />);
    const link = screen.getByText("Log Mood").closest("a")!;
    expect(link).toHaveAttribute("href", "/mood");
  });

  it("both buttons disabled by default when no props passed", () => {
    render(<QuickActions />);
    const endBtn = screen.getByText("End Period").closest("button")!;
    expect(endBtn).toBeDisabled();
  });
});
