"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import type { DailyLog, Database } from "@/types";

type DailyLogInsert = Database["public"]["Tables"]["daily_logs"]["Insert"];
type DailyLogUpdate = Database["public"]["Tables"]["daily_logs"]["Update"];

export function useDailyLogs(options?: { startDate?: string; endDate?: string }) {
  const supabase = createClient();
  const { user } = useAuth();

  return useQuery<DailyLog[]>({
    queryKey: ["daily_logs", user?.id, options?.startDate, options?.endDate],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: false });

      if (options?.startDate) {
        query = query.gte("log_date", options.startDate);
      }
      if (options?.endDate) {
        query = query.lte("log_date", options.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useCreateDailyLog() {
  const supabase = createClient();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<DailyLogInsert, "user_id">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("daily_logs")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily_logs"] });
    },
  });
}

export function useUpdateDailyLog() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: DailyLogUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("daily_logs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily_logs"] });
    },
  });
}

export function useDeleteDailyLog() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("daily_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily_logs"] });
    },
  });
}
