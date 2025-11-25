"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/lib/api/hooks";
import { NotificationList } from "./notification-list";
import { useNotificationActions } from "./use-notification-actions";

export function NotificationsDropdown() {
  const { data, isLoading } = useNotifications();
  const { handleMarkAsRead, handleDelete, isMarkingRead, isDeleting } =
    useNotificationActions();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative focus:outline-none focus:ring-0 focus:border-none"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-semibold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="w-80 p-0 rounded-lg border shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-lora font-semibold tracking-tight">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground font-lora tracking-wide">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          <NotificationList
            notifications={notifications}
            isLoading={isLoading}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            isMarkingRead={isMarkingRead}
            isDeleting={isDeleting}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
