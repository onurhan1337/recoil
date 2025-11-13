import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiDelete } from "../client";
import type { Notification, NotificationsListResponse } from "../types";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: unreadOnly
      ? [...NOTIFICATIONS_QUERY_KEY, "unread"]
      : NOTIFICATIONS_QUERY_KEY,
    queryFn: () => {
      const url = unreadOnly
        ? "/api/notifications?unread_only=true"
        : "/api/notifications";
      return apiGet<NotificationsListResponse>(url);
    },
    refetchInterval: 60000,
  });
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
