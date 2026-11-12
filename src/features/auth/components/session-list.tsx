"use client";

import { format } from "date-fns";
import { Monitor, Smartphone, Globe, ShieldCheck, LogOut } from "lucide-react";
import { useSessions, useEndAllOtherSessions } from "@/features/auth/hooks/use-sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function parseDeviceInfo(ua: string | null) {
  if (!ua) return { label: "Unknown device", icon: Globe };
  const lower = ua.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    return { label: "Mobile device", icon: Smartphone };
  }
  return { label: "Desktop browser", icon: Monitor };
}

export function SessionList() {
  const { data: sessions, isLoading } = useSessions();
  const endAllOther = useEndAllOtherSessions();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    );
  }

  const activeSessions = sessions?.filter((s) => s.is_active) ?? [];
  const currentSession = activeSessions[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Login Sessions</CardTitle>
        {activeSessions.length > 1 && currentSession && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => endAllOther.mutate(currentSession.id)}
            loading={endAllOther.isPending}
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            Sign out others
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!sessions?.length ? (
          <p className="text-sm text-muted">No login sessions recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const device = parseDeviceInfo(session.device_info);
              const DeviceIcon = device.icon;
              return (
                <div
                  key={session.id}
                  className="flex items-start gap-3 rounded-xl border border-border p-3"
                >
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950/30">
                    <DeviceIcon className="h-4 w-4 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{device.label}</p>
                      {session.is_active && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800 text-[10px] px-1.5 py-0">
                          <ShieldCheck className="h-3 w-3 mr-0.5" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      Logged in {format(new Date(session.logged_in_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {session.logged_out_at && (
                      <p className="text-xs text-muted">
                        Logged out {format(new Date(session.logged_out_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
