import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useMarkNotificationRead,
  useDeleteNotification,
} from "@/lib/api/hooks";
import type { NotificationsData } from "./types";

export function useNotificationActions() {
  const queryClient = useQueryClient();
  const markAsReadMutation = useMarkNotificationRead();
  const deleteMutation = useDeleteNotification();

  const handleMarkAsRead = async (id: string) => {
    try {
      queryClient.setQueryData<NotificationsData>(["notifications"], (old) => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, old.unreadCount - 1),
        };
      });

      await markAsReadMutation.mutateAsync(id);
    } catch (error) {
      toast.error("Failed to mark notification as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      queryClient.setQueryData<NotificationsData>(["notifications"], (old) => {
        if (!old) return old;
        const notification = old.notifications.find((n) => n.id === id);
        return {
          ...old,
          notifications: old.notifications.filter((n) => n.id !== id),
          unreadCount: notification?.read
            ? old.unreadCount
            : Math.max(0, old.unreadCount - 1),
        };
      });

      await deleteMutation.mutateAsync(id);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  };

  return {
    handleMarkAsRead,
    handleDelete,
    isMarkingRead: markAsReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
