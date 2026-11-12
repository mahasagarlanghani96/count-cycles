"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import type { LoginSession } from "@/types";

export function useSessions() {
  const supabase = createClient();
  const { user } = useAuth();

  return useQuery<LoginSession[]>({
    queryKey: ["login_sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("login_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_in_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useCreateSession() {
  const supabase = createClient();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceInfo: string | null) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("login_sessions")
        .insert({
          user_id: user.id,
          logged_in_at: new Date().toISOString(),
          logged_out_at: null,
          device_info: deviceInfo,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login_sessions"] });
    },
  });
}

export function useEndSession() {
  const supabase = createClient();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("login_sessions")
        .update({
          logged_out_at: new Date().toISOString(),
          is_active: false,
        })
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login_sessions"] });
    },
  });
}

export function useEndAllOtherSessions() {
  const supabase = createClient();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currentSessionId: string) => {
      if (!user) return;
      const { error } = await supabase
        .from("login_sessions")
        .update({
          logged_out_at: new Date().toISOString(),
          is_active: false,
        })
        .eq("user_id", user.id)
        .eq("is_active", true)
        .neq("id", currentSessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["login_sessions"] });
    },
  });
}
