export const CATEGORY_COLORS: Record<string, string> = {
  default: "oklch(43.9% 0 0)",
} as const;

export const SELECTED_NODE_COLOR = "oklch(37.1% 0 0)";
export const HOVERED_NODE_COLOR = "oklch(37.1% 0 0)";
export const HOVERED_NODE_STROKE = "oklch(64.6% 0.222 41.116)";

export const DEFAULT_DIMENSIONS = {
  width: 800,
  height: 600,
};

export const KEYBOARD_SPEEDS = {
  pan: 20,
  zoom: 0.1,
  panMultiplier: 5,
  zoomMultiplier: 2,
} as const;

export const PARTICLE_SETTINGS = {
  count: 4,
  width: 2,
  speed: 0.003,
} as const;

export const ARROW_SETTINGS = {
  length: 6,
  position: 1,
} as const;

export const GRAPH_SETTINGS = {
  cooldownTicks: 100,
  textTruncationLength: 20,
  fontSize: 12,
  defaultNodeSize: 4,
} as const;
