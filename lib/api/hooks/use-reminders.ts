import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "../client";
import type {
  Reminder,
  RemindersListResponse,
  CreateReminderResponse,
} from "../types";

export const REMINDERS_QUERY_KEY = ["reminders"] as const;

export function useReminders(noteId?: string) {
  return useQuery({
    queryKey: noteId
      ? [...REMINDERS_QUERY_KEY, noteId]
      : REMINDERS_QUERY_KEY,
    queryFn: () => {
      const url = noteId
        ? `/api/reminders?note_id=${noteId}`
        : "/api/reminders";
      return apiGet<RemindersListResponse>(url);
    },
    select: (data) => data.reminders,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      note_id: string;
      reminder_date: string;
      email_enabled?: boolean;
      in_app_enabled?: boolean;
    }) => apiPost<CreateReminderResponse>("/api/reminders", data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
      if (variables.note_id) {
        queryClient.invalidateQueries({
          queryKey: [...REMINDERS_QUERY_KEY, variables.note_id],
        });
      }
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      reminder_date?: string;
      email_enabled?: boolean;
      in_app_enabled?: boolean;
    }) => apiPatch<{ reminder: Reminder }>(`/api/reminders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/reminders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REMINDERS_QUERY_KEY });
    },
  });
}
