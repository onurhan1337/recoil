import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "../client";
import type { UsageResponse } from "../types";

export const USAGE_QUERY_KEY = ["usage"] as const;

export function useUsage() {
  return useQuery({
    queryKey: USAGE_QUERY_KEY,
    queryFn: () => apiGet<UsageResponse>("/api/usage"),
  });
}

export function useResetCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<UsageResponse>("/api/usage"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USAGE_QUERY_KEY });
    },
  });
}
