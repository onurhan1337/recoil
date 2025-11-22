import { useCallback, useRef } from "react";
import { useEdgesState, type OnEdgesChange } from "@xyflow/react";
import type { CanvasEdge, CanvasLink } from "@/lib/canvas/types";
import { createEdgeStyle, getEdgeBaseColor } from "@/lib/canvas/edge-styles";
import { isEdgeConnectedToNode } from "@/lib/canvas/connection-utils";

interface UseCanvasEdgesParams {
  links: CanvasLink[];
  showSemanticLinks: boolean;
  hoveredNoteId: string | null;
  isCtrlPressed: boolean;
}

export function useCanvasEdges({
  links,
  showSemanticLinks,
  hoveredNoteId,
  isCtrlPressed,
}: UseCanvasEdgesParams) {
  const prevHighlightStateRef = useRef("");

  const createEdges = useCallback(
    (linksData: CanvasLink[]): CanvasEdge[] => {
      const filteredLinks = showSemanticLinks
        ? linksData
        : linksData.filter((link) => link.link_type !== "semantic");

      const activeNodeId = isCtrlPressed && hoveredNoteId ? hoveredNoteId : null;

      return filteredLinks.map((link) => {
        const isConnected = activeNodeId
          ? link.source_note_id === activeNodeId ||
            link.target_note_id === activeNodeId
          : false;
        const isDimmed = Boolean(activeNodeId && !isConnected);

        return createEdgeStyle({ link, isConnected, isDimmed });
      });
    },
    [showSemanticLinks, hoveredNoteId, isCtrlPressed]
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState<CanvasEdge>(
    createEdges(links)
  );

  const prevLinksRef = useRef("");
  const currentLinksKey = links.map((l) => l.id).sort().join(",");
  if (currentLinksKey !== prevLinksRef.current || showSemanticLinks !== prevLinksRef.current.includes("semantic")) {
    prevLinksRef.current = currentLinksKey;
    setEdges(createEdges(links));
  }

  const highlightState = `${isCtrlPressed}-${hoveredNoteId}`;
  if (highlightState !== prevHighlightStateRef.current) {
    prevHighlightStateRef.current = highlightState;

    setEdges((eds) =>
      eds.map((edge) => {
        const activeNodeId =
          isCtrlPressed && hoveredNoteId ? hoveredNoteId : null;
        const isConnected = activeNodeId
          ? isEdgeConnectedToNode(edge, activeNodeId)
          : false;
        const isDimmed = activeNodeId && !isConnected;
        const baseColor = getEdgeBaseColor(edge.data?.link_type as string);

        return {
          ...edge,
          style: {
            stroke: baseColor,
            strokeWidth: isConnected ? 3 : 1.5,
            opacity: isDimmed ? 0.15 : 0.7,
            transition: "all 0.2s ease-in-out",
          },
        };
      })
    );
  }

  return {
    edges,
    setEdges,
    onEdgesChange: onEdgesChange as OnEdgesChange,
  };
}
