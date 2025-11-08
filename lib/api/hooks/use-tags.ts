import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../client";

export interface TagsResponse {
  tags: string[];
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => apiGet<TagsResponse>("/api/notes/tags"),
    select: (data) => data.tags,
  });
}
