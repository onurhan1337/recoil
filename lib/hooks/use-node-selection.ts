import { useState, useCallback, useMemo } from "react";
import type { ReactFlowInstance } from "@xyflow/react";
import type { CanvasNode } from "@/lib/canvas/types";

export function useNodeSelection(reactFlowInstance: ReactFlowInstance | null) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const handleSelectionChange = useCallback(() => {
    if (!reactFlowInstance) return;

    const currentNodes = reactFlowInstance.getNodes();
    const selectedIds = currentNodes
      .filter((node) => node.selected)
      .map((node) => node.id);

    if (selectedIds.length === 1) {
      setSelectedNoteId(selectedIds[0]);
    } else if (selectedIds.length === 0) {
      setSelectedNoteId(null);
    }
  }, [reactFlowInstance]);

  const clearSelection = useCallback(() => {
    setSelectedNoteId(null);
  }, []);

  return {
    selectedNoteId,
    setSelectedNoteId,
    handleSelectionChange,
    clearSelection,
  };
}

export function useSelectedNodeIds(nodes: CanvasNode[]) {
  return useMemo(() => {
    return new Set(nodes.filter((n) => n.selected).map((n) => n.id));
  }, [nodes]);
}
