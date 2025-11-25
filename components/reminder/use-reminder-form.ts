import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
} from "@/lib/api/hooks";
import { format, set, isBefore, addHours, differenceInMinutes } from "date-fns";
import type { Reminder } from "@/lib/api/types";
import type { ReminderFormState, DateTimeValidation } from "./types";

const roundToNearest15Minutes = (date: Date) => {
  const minutes = date.getMinutes();
  const rounded = Math.ceil(minutes / 15) * 15;
  const newDate = new Date(date);
  newDate.setMinutes(rounded, 0, 0);
  return newDate;
};

const getDefaultDateTime = () => {
  // Round to the nearest 15-minute interval, 1 hour from now
  // This creates a nice UX by defaulting to a reasonable future time
  const defaultDate = roundToNearest15Minutes(addHours(new Date(), 1));
  return { date: defaultDate, time: format(defaultDate, "HH:mm") };
};

const getReminderDateTime = (reminder: Reminder) => {
  // Parse the UTC timestamp from the database and convert to local time for display
  const reminderDate = new Date(reminder.reminder_date);
  return { date: reminderDate, time: format(reminderDate, "HH:mm") };
};

const validateDateTime = (
  date: Date | undefined,
  time: string
): DateTimeValidation => {
  if (!date) return { isValid: false, error: "Please select a reminder date" };
  if (!time) return { isValid: false, error: "Please select a reminder time" };

  const [hours, minutes] = time.split(":").map(Number);
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return { isValid: false, error: "Please enter a valid time" };
  }

  // Validate 15-minute intervals
  if (minutes % 15 !== 0) {
    return {
      isValid: false,
      error: "Please select a time in 15-minute intervals (00, 15, 30, 45)",
    };
  }

  const selectedDateTime = set(date, {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  });

  if (isBefore(selectedDateTime, new Date())) {
    const diff = Math.max(1, differenceInMinutes(new Date(), selectedDateTime));
    const timeAgo =
      diff < 60
        ? `${diff} minute${diff !== 1 ? "s" : ""} ago`
        : `${Math.floor(diff / 60)} hour${
            Math.floor(diff / 60) !== 1 ? "s" : ""
          } ago`;
    return {
      isValid: false,
      error: `This time was ${timeAgo}. Please select a future time.`,
    };
  }

  return { isValid: true, dateTime: selectedDateTime };
};

interface UseReminderFormProps {
  noteId: string;
  reminder?: Reminder;
  onSuccess?: () => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function useReminderForm({
  noteId,
  reminder,
  onSuccess,
  onOpenChange,
}: UseReminderFormProps) {
  const initialDateTime = reminder
    ? getReminderDateTime(reminder)
    : getDefaultDateTime();

  const [formState, setFormState] = useState<ReminderFormState>({
    date: initialDateTime.date,
    time: initialDateTime.time,
    emailEnabled: reminder?.email_enabled ?? true,
    inAppEnabled: reminder?.in_app_enabled ?? true,
  });

  const createReminderMutation = useCreateReminder();
  const updateReminderMutation = useUpdateReminder();
  const deleteReminderMutation = useDeleteReminder();

  const resetForm = () => {
    const newDateTime = reminder
      ? getReminderDateTime(reminder)
      : getDefaultDateTime();
    setFormState({
      date: newDateTime.date,
      time: newDateTime.time,
      emailEnabled: reminder?.email_enabled ?? true,
      inAppEnabled: reminder?.in_app_enabled ?? true,
    });
  };

  const handleSubmit = async () => {
    const validation = validateDateTime(formState.date, formState.time);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    if (!formState.emailEnabled && !formState.inAppEnabled) {
      toast.error("Please enable at least one notification method");
      return;
    }

    try {
      // TIMEZONE HANDLING:
      // validation.dateTime is a Date object in the user's local timezone
      // toISOString() converts it to UTC format (e.g., "2024-11-13T10:15:00.000Z")
      // Supabase stores this as timestamptz (timestamp with timezone) in UTC
      // When displayed back, new Date() automatically converts UTC → local time
      //
      // Example flow:
      // 1. User in PST (UTC-8) selects "10:15 AM" on Nov 13
      // 2. Date object: Wed Nov 13 2024 10:15:00 GMT-0800 (PST)
      // 3. toISOString(): "2024-11-13T18:15:00.000Z" (stored in DB as UTC)
      // 4. Cron job checks: 18:15 UTC = 10:15 AM PST ✓
      // 5. Display: new Date("2024-11-13T18:15:00.000Z") → shows as 10:15 AM PST ✓
      const payload = {
        reminder_date: validation.dateTime!.toISOString(),
        email_enabled: formState.emailEnabled,
        in_app_enabled: formState.inAppEnabled,
      };

      if (reminder) {
        await updateReminderMutation.mutateAsync({
          id: reminder.id,
          ...payload,
        });
        toast.success("Updated", {
          description: `${format(
            validation.dateTime!,
            "PPP"
          )} at ${formState.time}`,
        });
      } else {
        await createReminderMutation.mutateAsync({
          note_id: noteId,
          ...payload,
        });
        toast.success("Set", {
          description: `${format(
            validation.dateTime!,
            "PPP"
          )} at ${formState.time}`,
        });
      }

      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Save failed"
      );
    }
  };

  const handleDelete = async () => {
    if (!reminder) return;

    if (
      !confirm(
        "Are you sure you want to delete this reminder? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteReminderMutation.mutateAsync(reminder.id);
      toast.success("Removed");
      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Delete failed"
      );
    }
  };

  const isLoading =
    createReminderMutation.isPending ||
    updateReminderMutation.isPending ||
    deleteReminderMutation.isPending;

  const updateFormState = (updates: Partial<ReminderFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  return {
    formState,
    updateFormState,
    handleSubmit,
    handleDelete,
    resetForm,
    isLoading,
    isDeleting: deleteReminderMutation.isPending,
  };
}
