import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "../client";

export interface Analysis {
  id: string;
  user_id: string;
  insights: string;
  note_count: number;
  start_date: string;
  end_date: string;
  created_at: string;
  is_public: boolean;
  share_token: string | null;
  metadata: Record<string, unknown>;
}

const ANALYSES_QUERY_KEY = ["analyses"] as const;

export function useAnalyses() {
  return useQuery({
    queryKey: ANALYSES_QUERY_KEY,
    queryFn: () => apiGet<Analysis[]>("/api/analytics/analyses"),
  });
}

export function useShareAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiPost<{ shareToken: string }>(`/api/analytics/analyses/${id}/share`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYSES_QUERY_KEY });
    },
  });
}

export function useUnshareAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiDelete(`/api/analytics/analyses/${id}/share`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYSES_QUERY_KEY });
    },
  });
}
