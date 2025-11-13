"use client";

import { useState } from "react";
import { Bell, Loader2, Mail, Smartphone, ChevronDownIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
} from "@/lib/api/hooks";
import { toast } from "sonner";
import { format, isBefore, startOfToday, set, isValid, addHours } from "date-fns";
import type { Reminder } from "@/lib/api/types";

interface ReminderDialogProps {
  noteId: string;
  reminder?: Reminder;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const roundToNearest15Minutes = (date: Date) => {
  const minutes = date.getMinutes();
  const rounded = Math.ceil(minutes / 15) * 15;
  const newDate = new Date(date);
  newDate.setMinutes(rounded, 0, 0);
  return newDate;
};

const getDefaultDateTime = () => {
  const defaultDate = roundToNearest15Minutes(addHours(new Date(), 1));
  return { date: defaultDate, time: format(defaultDate, "HH:mm") };
};

const getReminderDateTime = (reminder: Reminder) => {
  const reminderDate = new Date(reminder.reminder_date);
  return { date: reminderDate, time: format(reminderDate, "HH:mm") };
};

const validateDateTime = (date: Date | undefined, time: string) => {
  if (!date) return { isValid: false, error: "Please select a reminder date" };
  if (!time) return { isValid: false, error: "Please select a reminder time" };

  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return { isValid: false, error: "Please enter a valid time" };
  }

  // Validate 15-minute intervals
  if (minutes % 15 !== 0) {
    return { isValid: false, error: "Please select a time in 15-minute intervals (00, 15, 30, 45)" };
  }

  const selectedDateTime = set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
  if (!isValid(selectedDateTime)) {
    return { isValid: false, error: "Invalid date or time selected" };
  }

  if (isBefore(selectedDateTime, new Date())) {
    return { isValid: false, error: "Reminder date must be in the future" };
  }

  return { isValid: true, dateTime: selectedDateTime };
};

export function ReminderDialog({
  noteId,
  reminder,
  trigger,
  onSuccess,
}: ReminderDialogProps) {
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const initialDateTime = reminder ? getReminderDateTime(reminder) : getDefaultDateTime();
  const [date, setDate] = useState<Date | undefined>(initialDateTime.date);
  const [time, setTime] = useState(initialDateTime.time);
  const [emailEnabled, setEmailEnabled] = useState(reminder?.email_enabled ?? true);
  const [inAppEnabled, setInAppEnabled] = useState(reminder?.in_app_enabled ?? true);

  const createReminderMutation = useCreateReminder();
  const updateReminderMutation = useUpdateReminder();
  const deleteReminderMutation = useDeleteReminder();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      const newDateTime = reminder ? getReminderDateTime(reminder) : getDefaultDateTime();
      setDate(newDateTime.date);
      setTime(newDateTime.time);
      setEmailEnabled(reminder?.email_enabled ?? true);
      setInAppEnabled(reminder?.in_app_enabled ?? true);
    }
  };

  const handleSubmit = async () => {
    const validation = validateDateTime(date, time);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    if (!emailEnabled && !inAppEnabled) {
      toast.error("Please enable at least one notification method");
      return;
    }

    try {
      const payload = {
        reminder_date: validation.dateTime!.toISOString(),
        email_enabled: emailEnabled,
        in_app_enabled: inAppEnabled,
      };

      if (reminder) {
        await updateReminderMutation.mutateAsync({ id: reminder.id, ...payload });
        toast.success("Reminder updated successfully");
      } else {
        await createReminderMutation.mutateAsync({ note_id: noteId, ...payload });
        toast.success("Reminder created successfully");
      }

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save reminder");
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
      toast.error(error instanceof Error ? error.message : "Failed to delete reminder");
    }
  };

  const isLoading =
    createReminderMutation.isPending ||
    updateReminderMutation.isPending ||
    deleteReminderMutation.isPending;

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
              <Select value={time} onValueChange={setTime} disabled={isLoading}>
                <SelectTrigger id="time-picker">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Array.from({ length: 96 }, (_, i) => {
                    const hours = Math.floor(i / 4);
                    const minutes = (i % 4) * 15;
                    const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
                    return (
                      <SelectItem key={timeString} value={timeString}>
                        {timeString}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-xs text-muted-foreground px-1">
            <p>Reminders are checked every 15 minutes. Choose a time in 15-minute intervals for best accuracy.</p>
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
            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
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
