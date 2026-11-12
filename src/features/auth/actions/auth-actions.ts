"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function deleteAccount() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Delete user data from all tables in order (respecting FK constraints)
  await supabase.from("symptom_logs").delete().eq("user_id", user.id);
  await supabase.from("daily_logs").delete().eq("user_id", user.id);
  await supabase.from("period_records").delete().eq("user_id", user.id);
  await supabase.from("reminders").delete().eq("user_id", user.id);
  await supabase.from("user_preferences").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("user_id", user.id);

  // Sign out the user (account deletion from auth.users requires admin/edge function)
  await supabase.auth.signOut();
  redirect("/login");
}

export async function exportUserData() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const [profile, preferences, periods, dailyLogs, symptoms, reminders] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("period_records")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false }),
      supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false }),
      supabase
        .from("symptom_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false }),
      supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: profile.data,
    preferences: preferences.data,
    periodRecords: periods.data ?? [],
    dailyLogs: dailyLogs.data ?? [],
    symptomLogs: symptoms.data ?? [],
    reminders: reminders.data ?? [],
  };
}
