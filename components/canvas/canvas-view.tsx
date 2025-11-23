"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type ReactFlowInstance,
  type Connection,
  type OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { NoteNode } from "./note-node";
import { CanvasControls } from "./canvas-controls";
import { NoteDetailsPanel } from "./note-details-panel";
import { CanvasSearchDialog } from "./canvas-search-dialog";
import { useCanvasShortcuts } from "@/lib/hooks/use-canvas-shortcuts";
import { useUpdateCanvasPositions, useCreateCanvasLink } from "@/lib/api/hooks";
import { useCanvasNodes } from "@/lib/hooks/use-canvas-nodes";
import { useCanvasEdges } from "@/lib/hooks/use-canvas-edges";
import { useNodeSelection, useSelectedNodeIds } from "@/lib/hooks/use-node-selection";
import { useDebouncedSave } from "@/lib/hooks/use-debounced-save";
import { useKeyboardState } from "@/lib/hooks/use-keyboard-state";
import { getConnectedNodeIds } from "@/lib/canvas/connection-utils";
import { resetToGridPositions } from "@/lib/canvas/node-styles";
import { edgeHoverColor } from "@/lib/canvas/edge-styles";
import type { CanvasData, CanvasNode } from "@/lib/canvas/types";
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

const nodeTypes = {
  noteNode: NoteNode,
};

const DEBOUNCE_SAVE_MS = 1000;

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
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { isCtrlPressed } = useKeyboardState();
  const updatePositions = useUpdateCanvasPositions();
  const createLink = useCreateCanvasLink();

  const { selectedNoteId, setSelectedNoteId, handleSelectionChange, clearSelection } =
    useNodeSelection(reactFlowInstance);

  const connectedNodeIds = useMemo(() => {
    if (!isCtrlPressed || !hoveredNoteId) return new Set<string>();
    return getConnectedNodeIds(hoveredNoteId, data.links);
  }, [hoveredNoteId, isCtrlPressed, data.links]);

  const hasHoveredNode = isCtrlPressed && Boolean(hoveredNoteId);

  const { scheduleUpdate } = useDebouncedSave<{
    noteId: string;
    position: { x: number; y: number };
  }>({
    onSave: (positions) => updatePositions.mutate({ positions }),
    delay: DEBOUNCE_SAVE_MS,
  });

  const handleNodePositionChange = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      scheduleUpdate(nodeId, { noteId: nodeId, position });
    },
    [scheduleUpdate]
  );

  const { nodes, setNodes, onNodesChange } = useCanvasNodes({
    notes: data.notes,
    selectedNoteId,
    connectedNodeIds,
    hasHoveredNode,
    hoveredNoteId,
    onPositionChange: handleNodePositionChange,
  });

  const { edges, onEdgesChange } = useCanvasEdges({
    links: data.links,
    showSemanticLinks,
    hoveredNoteId,
    isCtrlPressed,
  });

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

  const selectedNoteIds = useSelectedNodeIds(nodes);

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
    [nodes, reactFlowInstance, setSelectedNoteId]
  );

  useCanvasShortcuts({
    reactFlowInstance,
    onSearch: handleSearchOpen,
    onEscape: clearSelection,
    enabled: !isSearchOpen,
  });

  const handlePaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleNodeClick = useCallback(() => {}, []);

  const handleNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: { id: string }) => {
      setSelectedNoteId(node.id);
    },
    [setSelectedNoteId]
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

  const handleNodesChangeWithSelection: OnNodesChange<CanvasNode> = useCallback(
    (changes) => {
      onNodesChange(changes);

      const hasSelectionChange = changes.some(
        (change) => change.type === "select"
      );
      if (hasSelectionChange) {
        setTimeout(handleSelectionChange, 0);
      }
    },
    [onNodesChange, handleSelectionChange]
  );

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

  const handleResetPositions = useCallback(() => {
    const positions = resetToGridPositions(
      nodes.map((n) => n.id),
      data.notes.length
    );

    const resetNodes = nodes.map((node) => {
      const newPosition = positions.find((p) => p.noteId === node.id)?.position;
      return newPosition ? { ...node, position: newPosition } : node;
    });

    setNodes(resetNodes);
    updatePositions.mutate({ positions });

    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
      }, 100);
    }
  }, [nodes, data.notes.length, setNodes, updatePositions, reactFlowInstance]);

  return (
    <div className="w-full h-full relative bg-white dark:bg-zinc-950">
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
        onNodesChange={handleNodesChangeWithSelection as OnNodesChange}
        onEdgesChange={onEdgesChange}
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
          onClose={clearSelection}
          connectedNotes={connectedNotes}
          onFocusNode={(nodeId) => {
            const node = nodes.find((n) => n.id === nodeId);
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
          }}
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
