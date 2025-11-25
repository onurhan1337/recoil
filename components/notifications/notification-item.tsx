"use client";

import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import type { NotificationItemProps } from "./types";

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}: NotificationItemProps) {
  return (
    <div
      className={`group px-4 py-3 hover:bg-muted/50 transition-colors ${
        !notification.read ? "bg-muted/30" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-lora font-semibold tracking-tight line-clamp-1 flex items-center gap-2">
              {notification.title}
              {!notification.read && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              )}
            </h4>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 font-lora leading-relaxed">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground/70 font-lora tracking-wide">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>

        <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onMarkAsRead(notification.id)}
              disabled={isMarkingRead}
              aria-label="Mark as read"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(notification.id)}
            disabled={isDeleting}
            aria-label="Delete notification"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
