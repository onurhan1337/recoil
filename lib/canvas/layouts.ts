import dagre from "dagre";
import type { CanvasNode, CanvasLink } from "./types";

export type LayoutAlgorithm = "grid" | "hierarchical" | "force";

interface LayoutOptions {
  spacing?: number;
  direction?: "TB" | "LR" | "BT" | "RL";
}

export function applyGridLayout(
  nodes: CanvasNode[],
  options: LayoutOptions = {}
): CanvasNode[] {
  const { spacing = 400 } = options;
  const gridSize = Math.ceil(Math.sqrt(nodes.length));

  return nodes.map((node, index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    return {
      ...node,
      position: {
        x: col * spacing,
        y: row * spacing,
      },
    };
  });
}

export function applyHierarchicalLayout(
  nodes: CanvasNode[],
  links: CanvasLink[],
  options: LayoutOptions = {}
): CanvasNode[] {
  const { direction = "TB" } = options;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100,
    ranksep: 150,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: 300,
      height: 200
    });
  });

  links.forEach((link) => {
    dagreGraph.setEdge(link.source_note_id, link.target_note_id);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 150,
        y: nodeWithPosition.y - 100,
      },
    };
  });
}

export function applyForceLayout(
  nodes: CanvasNode[],
  links: CanvasLink[],
  options: LayoutOptions = {}
): CanvasNode[] {
  const { spacing = 300 } = options;

  const centerX = (nodes.length * spacing) / 4;
  const centerY = (nodes.length * spacing) / 4;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const positions = new Map<string, { x: number; y: number }>();

  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    const radius = Math.min(nodes.length * 50, 800);
    positions.set(node.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  });

  const iterations = 50;
  const k = spacing;
  const c = 0.1;

  for (let iter = 0; iter < iterations; iter++) {
    const forces = new Map<string, { x: number; y: number }>();

    nodes.forEach((node) => {
      forces.set(node.id, { x: 0, y: 0 });
    });

    nodes.forEach((node1) => {
      nodes.forEach((node2) => {
        if (node1.id === node2.id) return;

        const pos1 = positions.get(node1.id)!;
        const pos2 = positions.get(node2.id)!;

        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const repulsion = (k * k) / distance;
        const force1 = forces.get(node1.id)!;
        force1.x += (dx / distance) * repulsion;
        force1.y += (dy / distance) * repulsion;
      });
    });

    links.forEach((link) => {
      const pos1 = positions.get(link.source_note_id);
      const pos2 = positions.get(link.target_note_id);

      if (!pos1 || !pos2) return;

      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;

      const attraction = distance / k;

      const force1 = forces.get(link.source_note_id)!;
      const force2 = forces.get(link.target_note_id)!;

      force1.x += (dx / distance) * attraction;
      force1.y += (dy / distance) * attraction;
      force2.x -= (dx / distance) * attraction;
      force2.y -= (dy / distance) * attraction;
    });

    nodes.forEach((node) => {
      const pos = positions.get(node.id)!;
      const force = forces.get(node.id)!;

      pos.x += force.x * c;
      pos.y += force.y * c;
    });
  }

  return nodes.map((node) => ({
    ...node,
    position: positions.get(node.id)!,
  }));
}
