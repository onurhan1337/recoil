"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, Mail, Smartphone, ChevronDownIcon } from "lucide-react";
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
import { format, isBefore, startOfToday, set, isValid } from "date-fns";
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
  const [calendarOpen, setCalendarOpen] = useState(false);
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
        setTime(format(reminderDate, "HH:mm"));
        setEmailEnabled(reminder.email_enabled);
        setInAppEnabled(reminder.in_app_enabled);
      } else {
        const defaultDate = new Date();
        defaultDate.setHours(defaultDate.getHours() + 1);
        defaultDate.setMinutes(0);
        setDate(defaultDate);
        setTime(format(defaultDate, "HH:mm"));
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

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      toast.error("Please enter a valid time");
      return;
    }

    const selectedDateTime = set(date, {
      hours,
      minutes,
      seconds: 0,
      milliseconds: 0,
    });

    if (!isValid(selectedDateTime)) {
      toast.error("Invalid date or time selected");
      return;
    }

    if (isBefore(selectedDateTime, new Date())) {
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
          reminder_date: selectedDateTime.toISOString(),
          email_enabled: emailEnabled,
          in_app_enabled: inAppEnabled,
        });
        toast.success("Reminder updated successfully");
      } else {
        await createReminderMutation.mutateAsync({
          note_id: noteId,
          reminder_date: selectedDateTime.toISOString(),
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
          <div className="flex gap-4">
            <div className="flex flex-col gap-3 flex-1">
              <Label htmlFor="date-picker" className="px-1">
                Date
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="justify-between font-normal"
                    disabled={isLoading}
                  >
                    {date ? format(date, "PPP") : "Select date"}
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => isBefore(date, startOfToday())}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-3 w-32">
              <Label htmlFor="time-picker" className="px-1">
                Time
              </Label>
              <Input
                type="time"
                id="time-picker"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={isLoading}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
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
