import type { CanvasNode, CanvasNote } from "./types";

const GRID_SPACING = 400;

interface NodeStyleOptions {
  note: CanvasNote;
  index: number;
  totalNotes: number;
  selectedNoteId: string | null;
  isFocused: boolean;
  isConnected: boolean;
  isDimmed: boolean;
}

export function createNodeStyle({
  note,
  index,
  totalNotes,
  selectedNoteId,
  isFocused,
  isConnected,
  isDimmed,
}: NodeStyleOptions): CanvasNode {
  const position = note.position || calculateGridPosition(index, totalNotes);

  return {
    id: note.id,
    type: "noteNode",
    position,
    data: {
      note,
      isSelected: selectedNoteId === note.id,
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
}

export function calculateGridPosition(
  index: number,
  totalNotes: number
): { x: number; y: number } {
  const gridSize = Math.ceil(Math.sqrt(totalNotes));
  const row = Math.floor(index / gridSize);
  const col = index % gridSize;

  return {
    x: col * GRID_SPACING,
    y: row * GRID_SPACING,
  };
}

export function resetToGridPositions(
  nodeIds: string[],
  totalNotes: number
): Array<{ noteId: string; position: { x: number; y: number } }> {
  return nodeIds.map((nodeId, index) => ({
    noteId: nodeId,
    position: calculateGridPosition(index, totalNotes),
  }));
}
