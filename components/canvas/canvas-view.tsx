"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
  type ReactFlowInstance,
  type OnNodesChange,
  type OnEdgesChange,
  type NodePositionChange,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { NoteNode } from "./note-node";
import { CanvasControls } from "./canvas-controls";
import { NoteDetailsPanel } from "./note-details-panel";
import { CanvasSearchDialog } from "./canvas-search-dialog";
import { useCanvasShortcuts } from "@/lib/hooks/use-canvas-shortcuts";
import { useUpdateCanvasPositions, useCreateCanvasLink } from "@/lib/api/hooks";
import type { CanvasData, CanvasNode, CanvasEdge } from "@/lib/canvas/types";
import {
  applyGridLayout,
  applyHierarchicalLayout,
  applyForceLayout,
  type LayoutAlgorithm,
} from "@/lib/canvas/layouts";

interface CanvasViewProps {
  data: CanvasData;
  showSemanticLinks: boolean;
  onShowSemanticLinksChange: (show: boolean) => void;
  onGenerateSemanticLinks: () => void;
  isGenerating: boolean;
  availableCategories: string[];
  availableTags: string[];
}

const nodeTypes: NodeTypes = {
  noteNode: NoteNode,
};

const edgeColors: Record<string, string> = {
  manual: "oklch(37.1% 0 0)",
  semantic: "oklch(62.3% 0.214 259.815)",
  collection: "oklch(62.3% 0.214 259.815)",
  tag: "oklch(62.3% 0.214 259.815)",
};

const edgeHoverColor = "oklch(62.3% 0.214 259.815)";

const DEBOUNCE_SAVE_MS = 1000;
const GRID_SPACING = 400;

function createInitialNodes(
  notes: CanvasData["notes"],
  selectedNoteId: string | null,
  connectedNodeIds: Set<string>,
  hasHoveredNode: boolean,
  hoveredNoteId: string | null
): CanvasNode[] {
  return notes.map((note, index) => {
    const gridSize = Math.ceil(Math.sqrt(notes.length));
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    const isDimmed = hasHoveredNode && !connectedNodeIds.has(note.id);
    const isConnected =
      hasHoveredNode &&
      connectedNodeIds.has(note.id) &&
      note.id !== hoveredNoteId;
    const isFocused = hasHoveredNode && note.id === hoveredNoteId;

    return {
      id: note.id,
      type: "noteNode",
      position: note.position || {
        x: col * GRID_SPACING,
        y: row * GRID_SPACING,
      },
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
  });
}

function createInitialEdges(
  links: CanvasData["links"],
  showSemanticLinks: boolean,
  hoveredNoteId: string | null,
  isCtrlPressed: boolean
): CanvasEdge[] {
  const filteredLinks = showSemanticLinks
    ? links
    : links.filter((link) => link.link_type !== "semantic");

  const activeNodeId = isCtrlPressed && hoveredNoteId ? hoveredNoteId : null;

  return filteredLinks.map((link) => {
    const isConnected = activeNodeId
      ? link.source_note_id === activeNodeId ||
        link.target_note_id === activeNodeId
      : false;
    const isDimmed = activeNodeId && !isConnected;

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
    };
  });
}

export function CanvasView({
  data,
  showSemanticLinks,
  onShowSemanticLinksChange,
  onGenerateSemanticLinks,
  isGenerating,
  availableCategories,
  availableTags,
}: CanvasViewProps) {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const updatePositions = useUpdateCanvasPositions();
  const createLink = useCreateCanvasLink();
  const pendingPositionUpdates = useRef<Map<string, { x: number; y: number }>>(
    new Map()
  );
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevNoteIdsRef = useRef<string>("");

  const connectedNodeIds = useMemo(() => {
    const activeNodeId = isCtrlPressed && hoveredNoteId;
    if (!activeNodeId) return new Set<string>();

    const connected = new Set<string>();
    connected.add(activeNodeId);

    data.links.forEach((link) => {
      if (link.source_note_id === activeNodeId) {
        connected.add(link.target_note_id);
      }
      if (link.target_note_id === activeNodeId) {
        connected.add(link.source_note_id);
      }
    });

    return connected;
  }, [hoveredNoteId, isCtrlPressed, data.links]);

  const hasHoveredNode = Boolean(isCtrlPressed && hoveredNoteId);

  const initialNodes = useMemo(
    () =>
      createInitialNodes(
        data.notes,
        selectedNoteId,
        connectedNodeIds,
        hasHoveredNode,
        hoveredNoteId
      ),
    [
      data.notes,
      selectedNoteId,
      connectedNodeIds,
      hasHoveredNode,
      hoveredNoteId,
    ]
  );

  const initialEdges = useMemo(
    () =>
      createInitialEdges(
        data.links,
        showSemanticLinks,
        hoveredNoteId,
        isCtrlPressed
      ),
    [data.links, showSemanticLinks, hoveredNoteId, isCtrlPressed]
  );

  const [nodes, setNodes, onNodesChangeInternal] =
    useNodesState<CanvasNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<CanvasEdge>(initialEdges);

  const currentNoteIds = useMemo(
    () =>
      data.notes
        .map((n) => n.id)
        .sort()
        .join(","),
    [data.notes]
  );
  const prevHighlightStateRef = useRef<string>("");

  if (currentNoteIds !== prevNoteIdsRef.current) {
    prevNoteIdsRef.current = currentNoteIds;
    setNodes(initialNodes);
    setEdges(initialEdges);
  }

  const highlightState = `${isCtrlPressed}-${hoveredNoteId}`;
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

    setEdges((eds) =>
      eds.map((edge) => {
        const activeNodeId =
          isCtrlPressed && hoveredNoteId ? hoveredNoteId : null;
        const isConnected = activeNodeId
          ? edge.source === activeNodeId || edge.target === activeNodeId
          : false;
        const isDimmed = activeNodeId && !isConnected;
        const baseColor =
          edgeColors[edge.data?.link_type as string] || edgeColors.manual;

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

  const savePendingPositions = useCallback(() => {
    if (pendingPositionUpdates.current.size === 0) return;

    const positions = Array.from(pendingPositionUpdates.current.entries()).map(
      ([noteId, position]) => ({ noteId, position })
    );

    updatePositions.mutate({ positions });
    pendingPositionUpdates.current.clear();
  }, [updatePositions]);

  const handleNodesChange = useCallback(
    (changes: Parameters<OnNodesChange>[0]) => {
      onNodesChangeInternal(
        changes as Parameters<typeof onNodesChangeInternal>[0]
      );

      const selectionChanges = changes.filter(
        (change) => change.type === "select"
      );
      if (selectionChanges.length > 0) {
        setTimeout(() => {
          const currentNodes = reactFlowInstance?.getNodes() || [];
          const selectedIds = currentNodes
            .filter((node) => node.selected)
            .map((node) => node.id);

          if (selectedIds.length === 1) {
            setSelectedNoteId(selectedIds[0]);
          } else if (selectedIds.length === 0) {
            setSelectedNoteId(null);
          }
        }, 0);
      }

      const positionChanges = changes.filter(
        (change): change is NodePositionChange =>
          change.type === "position" &&
          change.dragging === false &&
          change.position !== undefined
      );

      if (positionChanges.length > 0) {
        positionChanges.forEach((change) => {
          if (change.position) {
            pendingPositionUpdates.current.set(change.id, change.position);
          }
        });

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          savePendingPositions();
        }, DEBOUNCE_SAVE_MS);
      }
    },
    [onNodesChangeInternal, savePendingPositions, reactFlowInstance]
  );

  const selectedNote = useMemo(() => {
    if (!selectedNoteId) return null;
    return data.notes.find((note) => note.id === selectedNoteId) || null;
  }, [selectedNoteId, data.notes]);

  const connectedNotes = useMemo(() => {
    if (!selectedNoteId) return [];
    return data.links
      .filter(
        (link) =>
          link.source_note_id === selectedNoteId ||
          link.target_note_id === selectedNoteId
      )
      .map((link) => {
        const connectedNoteId =
          link.source_note_id === selectedNoteId
            ? link.target_note_id
            : link.source_note_id;
        const connectedNote = data.notes.find(
          (note) => note.id === connectedNoteId
        );
        return {
          id: connectedNoteId,
          label: connectedNote?.label || null,
          category: connectedNote?.category || null,
          linkType: link.link_type,
        };
      });
  }, [selectedNoteId, data.links, data.notes]);

  const selectedNoteIds = useMemo(() => {
    return new Set(nodes.filter((n) => n.selected).map((n) => n.id));
  }, [nodes]);

  const handleSearchOpen = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleSearchSelectNote = useCallback(
    (noteId: string) => {
      setSelectedNoteId(noteId);
      const node = nodes.find((n) => n.id === noteId);
      if (node && reactFlowInstance) {
        reactFlowInstance.setCenter(
          node.position.x + 150,
          node.position.y + 100,
          {
            zoom: 1,
            duration: 800,
          }
        );
      }
    },
    [nodes, reactFlowInstance]
  );

  const handleEscape = useCallback(() => {
    setSelectedNoteId(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control" || e.key === "Meta") {
        setIsCtrlPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control" || e.key === "Meta") {
        setIsCtrlPressed(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useCanvasShortcuts({
    reactFlowInstance,
    onSearch: handleSearchOpen,
    onEscape: handleEscape,
    enabled: !isSearchOpen,
  });

  const handlePaneClick = useCallback(() => {
    setSelectedNoteId(null);
  }, []);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, _node: { id: string }) => {},
    []
  );

  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: { id: string }) => {
      setSelectedNoteId(node.id);
    },
    []
  );

  const handleNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node: { id: string }) => {
      setHoveredNoteId(node.id);
    },
    []
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNoteId(null);
  }, []);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) return;

      const existingLink = data.links.find(
        (link) =>
          link.source_note_id === connection.source &&
          link.target_note_id === connection.target &&
          link.link_type === "manual"
      );

      if (existingLink) return;

      createLink.mutate({
        sourceNoteId: connection.source,
        targetNoteId: connection.target,
      });
    },
    [data.links, createLink]
  );

  const handleApplyLayout = useCallback(
    (layout: LayoutAlgorithm) => {
      let newNodes: CanvasNode[];

      if (layout === "grid") {
        newNodes = applyGridLayout(nodes);
      } else if (layout === "hierarchical") {
        newNodes = applyHierarchicalLayout(nodes, data.links);
      } else {
        newNodes = applyForceLayout(nodes, data.links);
      }

      setNodes(newNodes);

      const positions = newNodes.map((node) => ({
        noteId: node.id,
        position: node.position,
      }));

      updatePositions.mutate({ positions });

      if (reactFlowInstance) {
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
        }, 100);
      }
    },
    [nodes, data.links, setNodes, updatePositions, reactFlowInstance]
  );

  const handleResetPositions = useCallback(async () => {
    const gridSize = Math.ceil(Math.sqrt(data.notes.length));

    const resetNodes = nodes.map((node, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;

      return {
        ...node,
        position: {
          x: col * GRID_SPACING,
          y: row * GRID_SPACING,
        },
      };
    });

    setNodes(resetNodes);

    const positions = resetNodes.map((node) => ({
      noteId: node.id,
      position: node.position,
    }));

    updatePositions.mutate({ positions });

    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
      }, 100);
    }
  }, [nodes, data.notes.length, setNodes, updatePositions, reactFlowInstance]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setIsCtrlPressed(true);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey) {
      setIsCtrlPressed(false);
    }
  }, []);

  return (
    <div
      className="w-full h-full relative bg-white dark:bg-zinc-950"
      onKeyDown={handleKeyDown as unknown as React.KeyboardEventHandler}
      onKeyUp={handleKeyUp as unknown as React.KeyboardEventHandler}
    >
      <style jsx global>{`
        .react-flow__edge.custom-edge:hover .react-flow__edge-path {
          stroke: ${edgeHoverColor} !important;
          stroke-width: 2.5px;
        }
        .react-flow__edge.selected .react-flow__edge-path {
          stroke: ${edgeHoverColor} !important;
          stroke-width: 2.5px;
        }
        @media (prefers-reduced-motion: reduce) {
          .react-flow__edge-path {
            transition: none !important;
          }
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange as OnNodesChange}
        onEdgesChange={onEdgesChange as OnEdgesChange}
        onConnect={handleConnect}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        onPaneClick={handlePaneClick}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        panOnDrag={[1, 2]}
        selectNodesOnDrag={false}
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        preventScrolling
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={3}
          color="rgba(15, 20, 30, 0.08)"
          style={{
            backgroundColor: "transparent",
          }}
        />
      </ReactFlow>

      <CanvasControls
        reactFlowInstance={reactFlowInstance}
        showSemanticLinks={showSemanticLinks}
        onShowSemanticLinksChange={onShowSemanticLinksChange}
        onSearchOpen={handleSearchOpen}
        onGenerateSemanticLinks={onGenerateSemanticLinks}
        isGenerating={isGenerating}
        onApplyLayout={handleApplyLayout}
        onResetPositions={handleResetPositions}
        availableCategories={availableCategories}
        availableTags={availableTags}
      />

      {selectedNote && selectedNoteIds.size === 1 && (
        <NoteDetailsPanel
          note={selectedNote}
          onClose={() => setSelectedNoteId(null)}
          connectedNotes={connectedNotes}
        />
      )}

      {selectedNoteIds.size > 1 && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-background/95 backdrop-blur-xl border rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-medium">
                {selectedNoteIds.size} nodes selected
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Use Ctrl/Cmd+A to select all, or drag to select multiple nodes
            </div>
          </div>
        </div>
      )}

      <CanvasSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        notes={data.notes}
        onSelectNote={handleSearchSelectNote}
      />
    </div>
  );
}
