import type { CanvasLink } from "./types";

export function getConnectedNodeIds(
  nodeId: string,
  links: CanvasLink[]
): Set<string> {
  const connected = new Set<string>();
  connected.add(nodeId);

  for (const link of links) {
    if (link.source_note_id === nodeId) {
      connected.add(link.target_note_id);
    } else if (link.target_note_id === nodeId) {
      connected.add(link.source_note_id);
    }
  }

  return connected;
}

export function isEdgeConnectedToNode(
  edge: { source: string; target: string },
  nodeId: string
): boolean {
  return edge.source === nodeId || edge.target === nodeId;
}
