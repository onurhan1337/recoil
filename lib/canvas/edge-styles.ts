import { MarkerType } from "@xyflow/react";
import type { CanvasEdge, CanvasLink } from "./types";

const edgeColors: Record<string, string> = {
  manual: "oklch(37.1% 0 0)",
  semantic: "oklch(62.3% 0.214 259.815)",
  collection: "oklch(62.3% 0.214 259.815)",
  tag: "oklch(62.3% 0.214 259.815)",
};

export const edgeHoverColor = "oklch(62.3% 0.214 259.815)";

interface EdgeStyleOptions {
  link: CanvasLink;
  isConnected: boolean;
  isDimmed: boolean;
}

export function createEdgeStyle({
  link,
  isConnected,
  isDimmed,
}: EdgeStyleOptions): CanvasEdge {
  const baseColor = edgeColors[link.link_type] || edgeColors.manual;

  return {
    id: link.id,
    source: link.source_note_id,
    target: link.target_note_id,
    type: "default",
    animated: link.link_type === "semantic",
    style: {
      stroke: baseColor,
      strokeWidth: isConnected ? 3 : 1.5,
      opacity: isDimmed ? 0.15 : 0.7,
      transition: "all 0.2s ease-in-out",
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: baseColor,
    },
    className: "custom-edge",
    data: { link_type: link.link_type },
  };
}

export function getEdgeBaseColor(linkType: string): string {
  return edgeColors[linkType] || edgeColors.manual;
}
