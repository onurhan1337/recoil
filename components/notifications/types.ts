import type { Notification } from "@/lib/api/types";

export interface NotificationsData {
  notifications: Notification[];
  unreadCount: number;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingRead: boolean;
  isDeleting: boolean;
}
