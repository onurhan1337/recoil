import { stripMarkdown } from "@/lib/utils";
import type { Note } from "@/lib/api/types";
import type { CanvasLink } from "@/lib/canvas/types";
import type {
  GraphNode,
  GraphLink,
  GraphData,
  GraphSettings,
  GraphNodeData,
} from "./types";
import { CATEGORY_COLORS } from "./constants";

export function calculateConnectionCounts(
  links: CanvasLink[]
): Map<string, number> {
  const counts = new Map<string, number>();
  links.forEach((link) => {
    counts.set(link.source_note_id, (counts.get(link.source_note_id) || 0) + 1);
    counts.set(link.target_note_id, (counts.get(link.target_note_id) || 0) + 1);
  });
  return counts;
}

export function filterNotesBySearch(notes: Note[], query: string): Note[] {
  if (!query) return notes;
  const lowerQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      (note.title ?? "").toLowerCase().includes(lowerQuery) ||
      (note.label ?? "").toLowerCase().includes(lowerQuery) ||
      (note.content ?? "").toLowerCase().includes(lowerQuery)
  );
}

export function filterOrphanNotes(notes: Note[], links: CanvasLink[]): Note[] {
  const linkedNoteIds = new Set<string>();
  links.forEach((link) => {
    linkedNoteIds.add(link.source_note_id);
    linkedNoteIds.add(link.target_note_id);
  });
  return notes.filter((note) => linkedNoteIds.has(note.id));
}

export function createGraphNode(
  note: Note,
  connectionCount: number,
  baseNodeSize: number
): GraphNode {
  const category = note.category?.toLowerCase() || "default";
  const nodeData: GraphNodeData = {
    id: note.id,
    label: stripMarkdown(note.label || note.title || "Untitled"),
    category: note.category || null,
    color: CATEGORY_COLORS[category] || CATEGORY_COLORS.default,
    size: baseNodeSize + connectionCount * 0.5,
    __originalSize: baseNodeSize + connectionCount * 0.5,
  };
  return nodeData as GraphNode;
}

export function applyGraphFilters(
  notes: Note[],
  links: CanvasLink[],
  settings: GraphSettings["filters"]
): Note[] {
  let filtered = notes;

  if (settings.searchQuery) {
    filtered = filterNotesBySearch(filtered, settings.searchQuery);
  }

  if (!settings.showOrphans) {
    filtered = filterOrphanNotes(filtered, links);
  }

  return filtered;
}

export function createGraphData(
  notes: Note[],
  links: CanvasLink[],
  settings: GraphSettings
): GraphData {
  const connectionCounts = calculateConnectionCounts(links);

  const filteredNodes = applyGraphFilters(notes, links, settings.filters);

  const nodeMap = new Map<string, GraphNode>();
  filteredNodes.forEach((note) => {
    const connections = connectionCounts.get(note.id) || 0;
    nodeMap.set(
      note.id,
      createGraphNode(note, connections, settings.display.nodeSize)
    );
  });

  const filteredLinks = links.filter(
    (link) =>
      nodeMap.has(link.source_note_id) && nodeMap.has(link.target_note_id)
  );

  const nodes = Array.from(nodeMap.values());
  const graphLinks: GraphLink[] = filteredLinks.map((link) => ({
    source: link.source_note_id,
    target: link.target_note_id,
    linkType: link.link_type,
  }));

  return { nodes, links: graphLinks };
}
