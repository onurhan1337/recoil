import { useMutation } from "@tanstack/react-query";
import { apiPost, apiDelete } from "../client";
import { useInvalidateCanvas } from "./use-canvas";
import type { CanvasLink } from "@/lib/canvas/types";

interface CreateLinkRequest {
  sourceNoteId: string;
  targetNoteId: string;
}

interface CreateLinkResponse {
  link: CanvasLink;
}

interface DeleteLinkRequest {
  linkId: string;
}

interface DeleteLinkResponse {
  deleted: boolean;
}

export function useCreateCanvasLink() {
  const invalidateCanvas = useInvalidateCanvas();

  return useMutation({
    mutationFn: async (request: CreateLinkRequest) => {
      return apiPost<CreateLinkResponse>("/api/canvas/links", request);
    },
    onSuccess: () => {
      invalidateCanvas();
    },
  });
}

export function useDeleteCanvasLink() {
  const invalidateCanvas = useInvalidateCanvas();

  return useMutation({
    mutationFn: async (request: DeleteLinkRequest) => {
      return apiDelete<DeleteLinkResponse>(
        `/api/canvas/links?linkId=${request.linkId}`
      );
    },
    onSuccess: () => {
      invalidateCanvas();
    },
  });
}
