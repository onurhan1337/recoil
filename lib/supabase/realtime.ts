import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeSubscriptionConfig {
  table: string;
  schema?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  invalidateQueryKey: readonly unknown[];
}

export function useRealtimeSubscription({
  table,
  schema = "public",
  event = "*",
  invalidateQueryKey,
}: RealtimeSubscriptionConfig) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (channelRef.current) return;

    const supabase = supabaseRef.current;
    const channelName = `${schema}:${table}:${event}`;

    channelRef.current = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event, schema, table },
        () => {
          queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient, table, schema, event, invalidateQueryKey]);
}
