import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../client";
import type { Feedback, CreateFeedbackResponse, FeedbackListResponse } from "../types";

export const FEEDBACK_QUERY_KEY = ["feedback"] as const;

export function useFeedback() {
  return useQuery({
    queryKey: FEEDBACK_QUERY_KEY,
    queryFn: () => apiGet<FeedbackListResponse>("/api/feedback"),
    select: (data) => data.feedback,
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
      apiPost<CreateFeedbackResponse>("/api/feedback", { rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEY });
    },
  });
}
