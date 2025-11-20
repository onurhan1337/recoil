import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";
import type { Note } from "../api/types";

export interface CanvasNote extends Note {
  position?: {
    x: number;
    y: number;
  };
}

export interface CanvasLink {
  id: string;
  source_note_id: string;
  target_note_id: string;
  link_type: "manual" | "semantic" | "collection" | "tag";
  strength?: number;
  created_at: string;
}

export interface CanvasData {
  notes: CanvasNote[];
  links: CanvasLink[];
}

export interface NoteNodeData extends Record<string, unknown> {
  note: CanvasNote;
  isSelected: boolean;
  isFocused?: boolean;
  isConnected?: boolean;
}

export type CanvasNode = ReactFlowNode<NoteNodeData>;
export type CanvasEdge = ReactFlowEdge;

export interface CanvasFilters {
  category?: string | null;
  tags?: string[];
  linkTypes?: Array<"manual" | "semantic" | "collection" | "tag">;
  searchQuery?: string;
  focusMode?: boolean;
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}
