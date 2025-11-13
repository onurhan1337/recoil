import { useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { apiGet, apiPatch, apiDelete } from "../client";
import type { Notification, NotificationsListResponse } from "../types";
import type { RealtimeChannel } from "@supabase/supabase-js";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export function useNotifications(unreadOnly = false) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());

  const query = useQuery({
    queryKey: unreadOnly
      ? [...NOTIFICATIONS_QUERY_KEY, "unread"]
      : NOTIFICATIONS_QUERY_KEY,
    queryFn: () => {
      const url = unreadOnly
        ? "/api/notifications?unread_only=true"
        : "/api/notifications";
      return apiGet<NotificationsListResponse>(url);
    },
  });

  useEffect(() => {
    if (channelRef.current) return;

    const supabase = supabaseRef.current;

    channelRef.current = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient]);

  return query;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiPatch<{ notification: Notification }>(`/api/notifications/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}
