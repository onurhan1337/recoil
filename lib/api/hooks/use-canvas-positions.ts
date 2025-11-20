import { useMutation } from "@tanstack/react-query";
import { apiPatch } from "../client";
import { useInvalidateCanvas } from "./use-canvas";

interface PositionUpdate {
  noteId: string;
  position: {
    x: number;
    y: number;
  };
}

interface UpdatePositionsRequest {
  positions: PositionUpdate[];
}

interface UpdatePositionsResponse {
  updated: number;
}

export function useUpdateCanvasPositions() {
  const invalidateCanvas = useInvalidateCanvas();

  return useMutation({
    mutationFn: async (request: UpdatePositionsRequest) => {
      return apiPatch<UpdatePositionsResponse>("/api/canvas/positions", request);
    },
    onSuccess: () => {
      invalidateCanvas();
    },
  });
}
