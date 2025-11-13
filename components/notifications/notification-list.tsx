"use client";

import { Bell, Loader2 } from "lucide-react";
import { NotificationItem } from "./notification-item";
import type { Notification } from "@/lib/api/types";

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingRead: boolean;
  isDeleting: boolean;
}

export function NotificationList({
  notifications,
  isLoading,
  onMarkAsRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <Bell className="h-10 w-10 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          isMarkingRead={isMarkingRead}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}
