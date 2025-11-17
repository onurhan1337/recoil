import type { Reminder } from "@/lib/api/types";

export interface ReminderDialogProps {
  noteId: string;
  reminder?: Reminder;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export interface DateTimePickerProps {
  date: Date | undefined;
  time: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  disabled: boolean;
}

export interface NotificationMethodsProps {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  onEmailChange: (enabled: boolean) => void;
  onInAppChange: (enabled: boolean) => void;
  disabled: boolean;
  isPro?: boolean;
}

export interface ReminderFormState {
  date: Date | undefined;
  time: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
}

export interface DateTimeValidation {
  isValid: boolean;
  error?: string;
  dateTime?: Date;
}
