import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete, apiPatch } from "../client";
import type {
  Conversation,
  ConversationsResponse,
  ConversationMessagesResponse,
  Message,
} from "../types";

export const CONVERSATIONS_QUERY_KEY = ["conversations"] as const;
export const conversationMessagesQueryKey = (id: string) =>
  ["conversations", id, "messages"] as const;

export function useConversations() {
  return useQuery({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: () => apiGet<ConversationsResponse>("/api/conversations"),
    select: (data) => data.conversations,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: conversationMessagesQueryKey(conversationId || ""),
    queryFn: () =>
      apiGet<ConversationMessagesResponse>(
        `/api/conversations/${conversationId}`
      ),
    select: (data) => data.messages,
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) =>
      apiPost<{ conversation: Conversation }>("/api/conversations", { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiDelete<{ success: boolean }>(`/api/conversations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });
}

export function useUpdateConversationTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      apiPatch<{ conversation: Conversation }>(`/api/conversations/${id}`, {
        title,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });
}

export function useOptimisticMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  const addOptimisticMessage = (message: Partial<Message>) => {
    if (!conversationId) return;

    queryClient.setQueryData<Message[]>(
      conversationMessagesQueryKey(conversationId),
      (old = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          conversation_id: conversationId,
          created_at: new Date().toISOString(),
          ...message,
        } as Message,
      ]
    );
  };

  const removeOptimisticMessage = (tempId: string) => {
    if (!conversationId) return;

    queryClient.setQueryData<Message[]>(
      conversationMessagesQueryKey(conversationId),
      (old = []) => old.filter((msg) => msg.id !== tempId)
    );
  };

  return { addOptimisticMessage, removeOptimisticMessage };
}
