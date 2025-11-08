import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "../client";

export interface ThinkingPatternsResponse {
  insights: string;
  noteCount: number;
}

const THINKING_PATTERNS_QUERY_KEY = ["thinking-patterns"] as const;

export function useThinkingPatterns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<ThinkingPatternsResponse>("/api/analytics/thinking-patterns"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: THINKING_PATTERNS_QUERY_KEY });
    },
  });
}

