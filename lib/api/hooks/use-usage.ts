import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../client";
import type { UsageResponse } from "../types";
import { createClient } from "@/lib/supabase/client";

export const USAGE_QUERY_KEY = ["usage"] as const;

export function useUsage(options?: { userId?: string | null }) {
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);

  const query = useQuery({
    queryKey: USAGE_QUERY_KEY,
    queryFn: () => apiGet<UsageResponse>("/api/usage"),
  });

  useEffect(() => {
    if (!options?.userId) return;

    const channel = supabase
      .channel("usage-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "usage",
          filter: `user_id=eq.${options.userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options?.userId, supabase, queryClient]);

  return query;
}

export function useResetCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<UsageResponse>("/api/usage"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEY });
    },
  });
}
