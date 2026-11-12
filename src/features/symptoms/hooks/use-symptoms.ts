"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import type { SymptomLog, Database } from "@/types";

type SymptomInsert = Database["public"]["Tables"]["symptom_logs"]["Insert"];

export function useSymptoms(startDate: string, endDate: string) {
  const supabase = createClient();
  const { user } = useAuth();

  return useQuery<SymptomLog[]>({
    queryKey: ["symptom_logs", user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("symptom_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("log_date", startDate)
        .lte("log_date", endDate)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useCreateSymptom() {
  const supabase = createClient();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<SymptomInsert, "user_id">) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("symptom_logs")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptom_logs"] });
    },
  });
}

export function useDeleteSymptom() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("symptom_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["symptom_logs"] });
    },
  });
}
