import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../client";
import type { UsageResponse } from "../types";
import { createClient } from "@/lib/supabase/client";

export const USAGE_QUERY_KEY = ["usage"] as const;

export function useUsage() {
  const queryClient = useQueryClient();
  const supabase = useMemo(() => createClient(), []);

  const query = useQuery({
    queryKey: USAGE_QUERY_KEY,
    queryFn: () => apiGet<UsageResponse>("/api/usage"),
  });

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtimeSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase.channel("usage-changes").on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "usage",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const oldStatus = payload.old?.subscription_status;
          const newStatus = payload.new?.subscription_status;

          if (oldStatus !== newStatus) {
          }

          queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEY });
        }
      );
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, queryClient]);

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
