import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "../client";
import type { CanvasData } from "@/lib/canvas/types";

export const CANVAS_QUERY_KEY = ["canvas"] as const;

interface UseCanvasOptions {
  includeSemanticLinks?: boolean;
}

export function useCanvas(options: UseCanvasOptions = {}) {
  const { includeSemanticLinks = false } = options;

  return useQuery({
    queryKey: [...CANVAS_QUERY_KEY, { includeSemanticLinks }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (includeSemanticLinks) {
        params.append("includeSemanticLinks", "true");
      }
      const queryString = params.toString();
      const url = queryString ? `/api/canvas?${queryString}` : "/api/canvas";
      return apiGet<CanvasData>(url);
    },
    staleTime: 30000,
  });
}

export function useInvalidateCanvas() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: CANVAS_QUERY_KEY });
  };
}
