import type { GraphNode, NodeRenderParams } from "./types";
import { GRAPH_SETTINGS, HOVERED_NODE_STROKE } from "./constants";

export function drawNode(params: NodeRenderParams): void {
  const {
    node,
    ctx,
    globalScale,
    nodeSize,
    isSelected,
    isHovered,
    nodeColor,
    textColor,
    textOpacity,
    textFadeThreshold,
  } = params;

  ctx.beginPath();
  ctx.arc(node.x ?? 0, node.y ?? 0, nodeSize, 0, 2 * Math.PI);
  ctx.fillStyle = nodeColor;
  ctx.fill();

  if (isSelected || isHovered) {
    const strokeWidth = isSelected ? 3 : 2;
    ctx.strokeStyle = HOVERED_NODE_STROKE;
    ctx.lineWidth = strokeWidth / globalScale;
    ctx.stroke();
  }

  if (textOpacity > 0 && globalScale > textFadeThreshold) {
    const fontSize = GRAPH_SETTINGS.fontSize / globalScale;
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = textColor;
    ctx.globalAlpha = textOpacity;

    const truncatedLabel =
      node.label.length > GRAPH_SETTINGS.textTruncationLength
        ? node.label.substring(0, GRAPH_SETTINGS.textTruncationLength) + "..."
        : node.label;

    ctx.fillText(
      truncatedLabel,
      node.x ?? 0,
      (node.y ?? 0) + nodeSize + fontSize
    );
    ctx.globalAlpha = 1;
  }
}

