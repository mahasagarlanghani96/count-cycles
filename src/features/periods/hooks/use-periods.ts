"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import type { PeriodRecord, Database } from "@/types";

type PeriodInsert = Database["public"]["Tables"]["period_records"]["Insert"];
type PeriodUpdate = Database["public"]["Tables"]["period_records"]["Update"];

export function usePeriods() {
  const supabase = createClient();
  const { user } = useAuth();

  return useQuery<PeriodRecord[]>({
    queryKey: ["period_records", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("period_records")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useCreatePeriod() {
  const supabase = createClient();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: Omit<PeriodInsert, "user_id">
    ) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("period_records")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["period_records"] });
    },
  });
}

export function useUpdatePeriod() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: PeriodUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("period_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["period_records"] });
    },
  });
}

export function useDeletePeriod() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("period_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["period_records"] });
    },
  });
}
