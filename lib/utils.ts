import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow as fnsFormatDistanceToNow } from "date-fns";
import { Coffee, Sun, Moon } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, h:mm a');
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function formatDistanceToNow(date: Date): string {
  return fnsFormatDistanceToNow(date, { addSuffix: true });
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

export function getUserDisplayName(user: User | null): string {
  if (!user) return "there";
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "there"
  );
}

export function getTimeBasedGreeting(user: User | null) {
  const time = getTimeOfDay();
  const name = getUserDisplayName(user);

  const greetings = {
    morning: {
      text: `Good morning, ${name}!`,
      Icon: Coffee,
    },
    afternoon: {
      text: `Good afternoon, ${name}!`,
      Icon: Sun,
    },
    evening: {
      text: `Good evening, ${name}!`,
      Icon: Moon,
    },
  };

  return greetings[time];
}
