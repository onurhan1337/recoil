"use client";

import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "./date-time-picker";
import { NotificationMethods } from "./notification-methods";
import { useReminderForm } from "./use-reminder-form";
import type { ReminderDialogProps } from "./types";

export function ReminderDialog({
  noteId,
  reminder,
  trigger,
  onSuccess,
}: ReminderDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    formState,
    updateFormState,
    handleSubmit,
    handleDelete,
    resetForm,
    isLoading,
    isDeleting,
  } = useReminderForm({
    noteId,
    reminder,
    onSuccess,
    onOpenChange: setOpen,
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            {reminder ? "Edit Reminder" : "Set Reminder"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg flex items-center justify-start">
              <Bell className="h-5 w-5" />
            </div>
            <span className="font-lora tracking-tight text-md font-semibold">
              {reminder ? "Edit Reminder" : "Set Reminder"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <DateTimePicker
            date={formState.date}
            time={formState.time}
            onDateChange={(date) => updateFormState({ date })}
            onTimeChange={(time) => updateFormState({ time })}
            disabled={isLoading}
          />

          <div className="rounded-lg bg-muted/30 p-3 border border-muted">
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <Bell className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                Reminders are checked every 15 minutes for best accuracy.
              </span>
            </p>
          </div>

          <NotificationMethods
            emailEnabled={formState.emailEnabled}
            inAppEnabled={formState.inAppEnabled}
            onEmailChange={(emailEnabled) => updateFormState({ emailEnabled })}
            onInAppChange={(inAppEnabled) => updateFormState({ inAppEnabled })}
            disabled={isLoading}
          />

          <div className="flex gap-2 pt-2">
            {reminder && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 tracking-tight text-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 tracking-tight text-sm"
            >
              {isLoading && !isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : reminder ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
