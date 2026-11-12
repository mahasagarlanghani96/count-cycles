"use client";

import { RefreshCw } from "lucide-react";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { Button } from "@/components/ui/button";

export function UpdatePrompt() {
  const { updateAvailable, applyUpdate } = useServiceWorker();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-80 z-50 bg-surface border border-border rounded-2xl shadow-xl p-4 flex items-center gap-3">
      <RefreshCw className="h-5 w-5 text-primary-500 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">Update available</p>
        <p className="text-xs text-muted">Refresh for the latest version</p>
      </div>
      <Button size="sm" onClick={applyUpdate}>
        Update
      </Button>
    </div>
  );
}
