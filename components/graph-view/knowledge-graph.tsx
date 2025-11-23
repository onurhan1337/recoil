"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useTheme } from "next-themes";
import type {
  KnowledgeGraphProps,
  GraphNode,
  ForceGraph2DRef,
} from "@/lib/graph/types";
import { createGraphData } from "@/lib/graph/utils";
import { useGraphKeyboard } from "@/lib/graph/keyboard-handler";
import { drawNode } from "@/lib/graph/node-renderer";
import {
  SELECTED_NODE_COLOR,
  HOVERED_NODE_COLOR,
  DEFAULT_DIMENSIONS,
  PARTICLE_SETTINGS,
  ARROW_SETTINGS,
  GRAPH_SETTINGS,
} from "@/lib/graph/constants";

export function KnowledgeGraph({
  notes,
  links,
  onNodeClick,
  selectedNoteId,
  settings,
  filteredNotes,
}: KnowledgeGraphProps) {
  const graphRef = useRef<ForceGraph2DRef["current"]>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState(DEFAULT_DIMENSIONS);
  const [mounted, setMounted] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const forcesInitializedRef = useRef(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const graphData = useMemo(() => {
    const notesToUse = filteredNotes || notes;
    return createGraphData(notesToUse, links, settings);
  }, [notes, links, settings, filteredNotes]);

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node?.id || null);
  }, []);

  const applyForces = useCallback(() => {
    if (!graphRef.current || !settings.forces) return;

    const centerForce = graphRef.current.d3Force("center") as unknown as {
      strength: (value?: number) => unknown;
    };
    if (centerForce) {
      centerForce.strength(settings.forces.centerForce);
    }
    const chargeForce = graphRef.current.d3Force("charge") as unknown as {
      strength: (value?: number) => unknown;
    };
    if (chargeForce) {
      chargeForce.strength(-settings.forces.repelForce);
    }
    const linkForce = graphRef.current.d3Force("link") as unknown as {
      distance: (value?: number) => unknown;
      strength: (value?: number) => unknown;
    };
    if (linkForce) {
      linkForce.distance(settings.forces.linkDistance);
      linkForce.strength(settings.forces.linkForce);
    }
  }, [settings.forces]);

  useEffect(() => {
    if (mounted && graphData.nodes.length > 0) {
      const timer = setTimeout(() => {
        applyForces();
        if (graphRef.current && !forcesInitializedRef.current) {
          graphRef.current.d3ReheatSimulation();
          forcesInitializedRef.current = true;
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mounted, graphData.nodes.length, applyForces]);

  useEffect(() => {
    if (forcesInitializedRef.current) {
      applyForces();
      if (graphRef.current) {
        graphRef.current.d3ReheatSimulation();
      }
    }
  }, [applyForces]);

  useGraphKeyboard({
    graphRef,
    enabled: mounted,
  });

  const isDark = theme === "dark";
  const backgroundColor = isDark ? "#09090b" : "#ffffff";
  const linkColor = isDark ? "#3f3f46" : "#d4d4d8";
  const textColor = isDark ? "#fafafa" : "#09090b";

  const getNodeColor = useCallback(
    (node: GraphNode) => {
      if (node.id === selectedNoteId) return SELECTED_NODE_COLOR;
      if (node.id === hoveredNode) return HOVERED_NODE_COLOR;
      return node.color;
    },
    [selectedNoteId, hoveredNode]
  );

  const getLinkColor = useCallback(
    (link: { source: GraphNode; target: GraphNode }) => {
      if (
        hoveredNode &&
        (link.source.id === hoveredNode || link.target.id === hoveredNode)
      ) {
        return SELECTED_NODE_COLOR;
      }
      return linkColor;
    },
    [hoveredNode, linkColor]
  );

  const getTextOpacity = useCallback(
    (globalScale: number) => {
      const threshold = settings.display.textFadeThreshold;
      if (globalScale < threshold) return 0;
      if (globalScale > 1) return 1;
      return (globalScale - threshold) / (1 - threshold);
    },
    [settings.display.textFadeThreshold]
  );

  if (!mounted) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      >
        <div className="text-sm text-muted-foreground">Loading graph...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <ForceGraph2D
        ref={graphRef as never}
        graphData={graphData as never}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor={backgroundColor}
        nodeLabel="label"
        nodeColor={getNodeColor}
        nodeRelSize={settings.display.nodeSize}
        nodeVal={(node: GraphNode) => node.size}
        linkColor={getLinkColor}
        linkWidth={settings.display.linkThickness}
        linkDirectionalArrowLength={
          settings.display.showArrows ? ARROW_SETTINGS.length : 0
        }
        linkDirectionalArrowRelPos={ARROW_SETTINGS.position}
        linkDirectionalParticles={hoveredNode ? PARTICLE_SETTINGS.count : 0}
        linkDirectionalParticleWidth={PARTICLE_SETTINGS.width}
        linkDirectionalParticleSpeed={PARTICLE_SETTINGS.speed}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onNodeRightClick={handleNodeClick}
        nodeCanvasObject={(
          node: GraphNode,
          ctx: CanvasRenderingContext2D,
          globalScale: number
        ) => {
          const nodeSize = node.size || GRAPH_SETTINGS.defaultNodeSize;
          const isSelected = node.id === selectedNoteId;
          const isHovered = node.id === hoveredNode;
          const nodeColor = getNodeColor(node);
          const textOpacity = getTextOpacity(globalScale);

          drawNode({
            node,
            ctx,
            globalScale,
            nodeSize,
            isSelected,
            isHovered,
            nodeColor,
            textColor,
            textOpacity,
            textFadeThreshold: settings.display.textFadeThreshold,
          });
        }}
        cooldownTicks={GRAPH_SETTINGS.cooldownTicks}
        onEngineTick={() => {
          if (!forcesInitializedRef.current && graphRef.current) {
            applyForces();
            graphRef.current.d3ReheatSimulation();
            forcesInitializedRef.current = true;
          }
        }}
      />
    </div>
  );
}
