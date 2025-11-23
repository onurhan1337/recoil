import type { Note } from "@/lib/api/types";
import type { CanvasLink } from "@/lib/canvas/types";
import type {
  NodeObject,
  LinkObject,
  GraphData as ForceGraphData,
  ForceGraphMethods,
} from "react-force-graph-2d";

export interface GraphSettings {
  filters: {
    searchQuery: string;
    showTags: boolean;
    showAttachments: boolean;
    existingFilesOnly: boolean;
    showOrphans: boolean;
  };
  display: {
    showArrows: boolean;
    textFadeThreshold: number;
    nodeSize: number;
    linkThickness: number;
  };
  forces: {
    centerForce: number;
    repelForce: number;
    linkForce: number;
    linkDistance: number;
  };
}

export interface GraphNodeData {
  id: string;
  label: string;
  category: string | null;
  color: string;
  size: number;
  __originalSize?: number;
}

export type GraphNode = NodeObject<GraphNodeData>;

export interface GraphLinkData {
  linkType: string;
}

export type GraphLink = LinkObject<GraphNodeData, GraphLinkData>;

export type GraphData = ForceGraphData<GraphNode, GraphLink>;

export interface KnowledgeGraphProps {
  notes: Note[];
  links: CanvasLink[];
  onNodeClick?: (noteId: string) => void;
  selectedNoteId?: string | null;
  settings: GraphSettings;
  filteredNotes?: Note[];
}

export type ForceGraph2DRef = React.RefObject<
  ForceGraphMethods<GraphNode, GraphLink> | undefined
>;

export interface NodeRenderParams {
  node: GraphNode;
  ctx: CanvasRenderingContext2D;
  globalScale: number;
  nodeSize: number;
  isSelected: boolean;
  isHovered: boolean;
  nodeColor: string;
  textColor: string;
  textOpacity: number;
  textFadeThreshold: number;
}

export interface KeyboardHandlerOptions {
  panSpeed: number;
  zoomSpeed: number;
}

export interface GraphStats {
  nodes: number;
  connections: number;
}

export interface GraphControlsProps {
  settings: GraphSettings;
  onSettingsChange: (settings: GraphSettings) => void;
  stats: GraphStats;
}
