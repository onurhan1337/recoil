"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, Mail, Smartphone, CalendarIcon, Clock } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
} from "@/lib/api/hooks";
import { toast } from "sonner";
import { format } from "date-fns";
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
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("12:00");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);

  const createReminderMutation = useCreateReminder();
  const updateReminderMutation = useUpdateReminder();
  const deleteReminderMutation = useDeleteReminder();

  useEffect(() => {
    if (open) {
      if (reminder) {
        const reminderDate = new Date(reminder.reminder_date);
        setDate(reminderDate);
        setTime(
          `${String(reminderDate.getHours()).padStart(2, "0")}:${String(reminderDate.getMinutes()).padStart(2, "0")}`
        );
        setEmailEnabled(reminder.email_enabled);
        setInAppEnabled(reminder.in_app_enabled);
      } else {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        setDate(now);
        setTime(
          `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
        );
        setEmailEnabled(true);
        setInAppEnabled(true);
      }
    }
  }, [reminder, open]);

  const handleSubmit = async () => {
    if (!date) {
      toast.error("Please select a reminder date");
      return;
    }

    if (!time) {
      toast.error("Please select a reminder time");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const selectedDate = new Date(date);
    selectedDate.setHours(hours, minutes, 0, 0);

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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={isLoading}
                  className="pl-9"
                />
              </div>
            </div>
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
