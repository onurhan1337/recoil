"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, Mail, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
} from "@/lib/api/hooks";
import { toast } from "sonner";
import type { Reminder } from "@/lib/api/types";

interface ReminderDialogProps {
  noteId: string;
  reminder?: Reminder;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ReminderDialog({
  noteId,
  reminder,
  trigger,
  onSuccess,
}: ReminderDialogProps) {
  const [open, setOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);

  const createReminderMutation = useCreateReminder();
  const updateReminderMutation = useUpdateReminder();
  const deleteReminderMutation = useDeleteReminder();

  useEffect(() => {
    if (reminder) {
      const date = new Date(reminder.reminder_date);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setReminderDate(localDate);
      setEmailEnabled(reminder.email_enabled);
      setInAppEnabled(reminder.in_app_enabled);
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 60);
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setReminderDate(localDate);
      setEmailEnabled(true);
      setInAppEnabled(true);
    }
  }, [reminder, open]);

  const handleSubmit = async () => {
    if (!reminderDate) {
      toast.error("Please select a reminder date and time");
      return;
    }

    const selectedDate = new Date(reminderDate);
    const now = new Date();

    if (selectedDate <= now) {
      toast.error("Reminder date must be in the future");
      return;
    }

    if (!emailEnabled && !inAppEnabled) {
      toast.error("Please enable at least one notification method");
      return;
    }

    try {
      if (reminder) {
        await updateReminderMutation.mutateAsync({
          id: reminder.id,
          reminder_date: selectedDate.toISOString(),
          email_enabled: emailEnabled,
          in_app_enabled: inAppEnabled,
        });
        toast.success("Reminder updated successfully");
      } else {
        await createReminderMutation.mutateAsync({
          note_id: noteId,
          reminder_date: selectedDate.toISOString(),
          email_enabled: emailEnabled,
          in_app_enabled: inAppEnabled,
        });
        toast.success("Reminder created successfully");
      }

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save reminder"
      );
    }
  };

  const handleDelete = async () => {
    if (!reminder) return;

    try {
      await deleteReminderMutation.mutateAsync(reminder.id);
      toast.success("Reminder deleted successfully");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete reminder"
      );
    }
  };

  const isLoading =
    createReminderMutation.isPending ||
    updateReminderMutation.isPending ||
    deleteReminderMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <DialogTitle className="text-xl font-lora font-semibold">
            {reminder ? "Edit Reminder" : "Set Reminder"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-date">Date and Time</Label>
            <Input
              id="reminder-date"
              type="datetime-local"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <Label>Notification Methods</Label>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">
                    Send reminder via email
                  </p>
                </div>
              </div>
              <Switch
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">In-App</p>
                  <p className="text-xs text-muted-foreground">
                    Show notification in app
                  </p>
                </div>
              </div>
              <Switch
                checked={inAppEnabled}
                onCheckedChange={setInAppEnabled}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {reminder && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1"
              >
                {deleteReminderMutation.isPending ? (
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
              className="flex-1"
            >
              {isLoading && !deleteReminderMutation.isPending ? (
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
