import { useCallback, useRef } from "react";
import { useNodesState, type OnNodesChange, type NodeChange } from "@xyflow/react";
import type { CanvasNode, CanvasNote } from "@/lib/canvas/types";
import { createNodeStyle } from "@/lib/canvas/node-styles";

interface UseCanvasNodesParams {
  notes: CanvasNote[];
  selectedNoteId: string | null;
  connectedNodeIds: Set<string>;
  hasHoveredNode: boolean;
  hoveredNoteId: string | null;
  onPositionChange: (nodeId: string, position: { x: number; y: number }) => void;
}

export function useCanvasNodes({
  notes,
  selectedNoteId,
  connectedNodeIds,
  hasHoveredNode,
  hoveredNoteId,
  onPositionChange,
}: UseCanvasNodesParams) {
  const prevNoteIdsRef = useRef("");
  const prevHighlightStateRef = useRef("");

  const createNodes = useCallback(
    (notesData: CanvasNote[]): CanvasNode[] => {
      return notesData.map((note, index) => {
        const isDimmed = hasHoveredNode && !connectedNodeIds.has(note.id);
        const isConnected =
          hasHoveredNode &&
          connectedNodeIds.has(note.id) &&
          note.id !== hoveredNoteId;
        const isFocused = hasHoveredNode && note.id === hoveredNoteId;

        return createNodeStyle({
          note,
          index,
          totalNotes: notesData.length,
          selectedNoteId,
          isFocused,
          isConnected,
          isDimmed,
        });
      });
    },
    [selectedNoteId, connectedNodeIds, hasHoveredNode, hoveredNoteId]
  );

  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<CanvasNode>(
    createNodes(notes)
  );

  const currentNoteIds = notes.map((n) => n.id).sort().join(",");
  if (currentNoteIds !== prevNoteIdsRef.current) {
    prevNoteIdsRef.current = currentNoteIds;
    setNodes(createNodes(notes));
  }

  const highlightState = `${hasHoveredNode}-${hoveredNoteId}`;
  if (highlightState !== prevHighlightStateRef.current) {
    prevHighlightStateRef.current = highlightState;
    setNodes((nds) =>
      nds.map((node) => {
        const isDimmed = hasHoveredNode && !connectedNodeIds.has(node.id);
        const isConnected =
          hasHoveredNode &&
          connectedNodeIds.has(node.id) &&
          node.id !== hoveredNoteId;
        const isFocused = hasHoveredNode && node.id === hoveredNoteId;

        return {
          ...node,
          data: {
            ...node.data,
            isFocused,
            isConnected,
          },
          style: isDimmed
            ? {
                opacity: 0.25,
                transition: "opacity 0.2s ease-in-out",
              }
            : undefined,
        };
      })
    );
  }

  const handleNodesChange: OnNodesChange<CanvasNode> = useCallback(
    (changes: NodeChange<CanvasNode>[]) => {
      onNodesChangeInternal(changes);

      for (const change of changes) {
        if (
          change.type === "position" &&
          change.dragging === false &&
          change.position
        ) {
          onPositionChange(change.id, change.position);
        }
      }
    },
    [onNodesChangeInternal, onPositionChange]
  );

  return {
    nodes,
    setNodes,
    onNodesChange: handleNodesChange,
  };
}
