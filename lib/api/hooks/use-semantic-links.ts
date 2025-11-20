import { useMutation } from "@tanstack/react-query";
import { apiPost } from "../client";
import { useInvalidateCanvas } from "./use-canvas";

interface GenerateSemanticLinksResponse {
  message: string;
  linksCreated: number;
}

export function useGenerateSemanticLinks() {
  const invalidateCanvas = useInvalidateCanvas();

  return useMutation({
    mutationFn: () =>
      apiPost<GenerateSemanticLinksResponse>("/api/notes/semantic-links", {}),
    onSuccess: () => {
      invalidateCanvas();
    },
  });
}
