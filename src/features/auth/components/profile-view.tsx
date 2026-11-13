"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Moon, Sun, Monitor, LogOut, Trash2, Download, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionList } from "@/features/auth/components/session-list";
import type { Profile, UserPreferences } from "@/types";

export function ProfileView() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      return data as Profile | null;
    },
    enabled: !!user,
  });

  const { data: preferences } = useQuery({
    queryKey: ["preferences", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      return data as UserPreferences | null;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      const { error } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["preferences"] }),
  });

  async function handleExportData() {
    const [periods, symptoms, dailyLogs] = await Promise.all([
      supabase.from("period_records").select("*").eq("user_id", user!.id).order("start_date"),
      supabase.from("symptom_logs").select("*").eq("user_id", user!.id).order("log_date"),
      supabase.from("daily_logs").select("*").eq("user_id", user!.id).order("log_date"),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      profile,
      periods: periods.data,
      symptoms: symptoms.data,
      daily_logs: dailyLogs.data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cyclecare-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;

    await supabase.from("login_sessions").delete().eq("user_id", user!.id);
    await supabase.from("symptom_logs").delete().eq("user_id", user!.id);
    await supabase.from("daily_logs").delete().eq("user_id", user!.id);
    await supabase.from("period_records").delete().eq("user_id", user!.id);
    await supabase.from("reminders").delete().eq("user_id", user!.id);
    await supabase.from("user_preferences").delete().eq("user_id", user!.id);
    await supabase.from("profiles").delete().eq("user_id", user!.id);

    await signOut();
    router.push("/");
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted">Email</Label>
            <p className="text-sm mt-1">{user?.email}</p>
          </div>
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              defaultValue={profile?.display_name ?? ""}
              onBlur={(e) => {
                if (e.target.value !== (profile?.display_name ?? "")) {
                  updateProfile.mutate({ display_name: e.target.value || null });
                }
              }}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { value: "light" as const, icon: Sun, label: "Light" },
              { value: "dark" as const, icon: Moon, label: "Dark" },
              { value: "system" as const, icon: Monitor, label: "System" },
            ].map((opt) => (
              <Button
                key={opt.value}
                variant={theme === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setTheme(opt.value);
                  updatePreferences.mutate({ theme: opt.value });
                }}
              >
                <opt.icon className="h-4 w-4 mr-1" />
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted" />
              <span className="text-sm">Period reminders</span>
            </div>
            <input
              type="checkbox"
              checked={preferences?.notifications_enabled ?? true}
              onChange={(e) =>
                updatePreferences.mutate({
                  notifications_enabled: e.target.checked,
                })
              }
              className="h-5 w-5 rounded accent-primary-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm">Daily tracking reminder</span>
            <input
              type="checkbox"
              checked={preferences?.daily_tracking_reminder ?? false}
              onChange={(e) =>
                updatePreferences.mutate({
                  daily_tracking_reminder: e.target.checked,
                })
              }
              className="h-5 w-5 rounded accent-primary-500"
            />
          </label>
        </CardContent>
      </Card>

      <SessionList />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export all my data
          </Button>
          <Button
            variant="outline"
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete my account and data
          </Button>
        </CardContent>
      </Card>

      <Button
        variant="ghost"
        className="w-full text-muted"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign out
      </Button>

      <p className="text-xs text-muted text-center pb-4">
        CycleCare provides educational information and is not a substitute for
        medical care.
      </p>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all associated health
              data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Type DELETE to confirm</Label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirm("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={deleteConfirm !== "DELETE"}
                onClick={handleDeleteAccount}
              >
                Delete permanently
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
