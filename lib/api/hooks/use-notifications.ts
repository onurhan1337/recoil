import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiDelete } from "../client";
import { useRealtimeSubscription } from "@/lib/supabase/realtime";
import type { Notification, NotificationsListResponse } from "../types";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export function useNotifications(unreadOnly = false) {
  const queryKey = unreadOnly
    ? [...NOTIFICATIONS_QUERY_KEY, "unread"]
    : NOTIFICATIONS_QUERY_KEY;

  const query = useQuery({
    queryKey,
    queryFn: () => {
      const url = unreadOnly
        ? "/api/notifications?unread_only=true"
        : "/api/notifications";
      return apiGet<NotificationsListResponse>(url);
    },
  });

  useRealtimeSubscription({
    table: "notifications",
    invalidateQueryKey: NOTIFICATIONS_QUERY_KEY,
  });

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
