import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "./client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];
type TableName = keyof Tables;
type TableRow<T extends TableName> = Tables[T]["Row"];

interface RealtimeSubscriptionConfig<T extends TableName = TableName> {
  table: T;
  schema?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  invalidateQueryKey: readonly unknown[];
}

type PostgresChangesPayload<T extends TableName> = RealtimePostgresChangesPayload<TableRow<T>>;

export function useRealtimeSubscription<T extends TableName>({
  table,
  schema = "public",
  event = "*",
  invalidateQueryKey,
}: RealtimeSubscriptionConfig<T>) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (channelRef.current) return;

    const supabase = supabaseRef.current;
    const channelName = `${schema}:${table}:${event}`;

    console.log(`[Realtime] Subscribing to ${channelName}`);

    const channel = supabase.channel(channelName);

    channelRef.current = (
      channel as unknown as {
        on: (
          type: "postgres_changes",
          config: { event: typeof event; schema: string; table: string },
          callback: (payload: PostgresChangesPayload<T>) => void
        ) => RealtimeChannel;
      }
    )
      .on(
        "postgres_changes",
        {
          event,
          schema,
          table: table as string,
        },
        (payload: PostgresChangesPayload<T>) => {
          console.log(`[Realtime] Change detected in ${table}:`, payload);
          queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
        }
      )
      .subscribe((status: string) => {
        console.log(`[Realtime] Subscription status for ${channelName}:`, status);
      });

    return () => {
      if (channelRef.current) {
        console.log(`[Realtime] Unsubscribing from ${channelName}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient, table, schema, event, invalidateQueryKey]);
}
