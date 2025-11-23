import type { GraphSettings } from "./types";

export const DEFAULT_SETTINGS: GraphSettings = {
  filters: {
    searchQuery: "",
    showTags: true,
    showAttachments: true,
    existingFilesOnly: true,
    showOrphans: true,
  },
  display: {
    showArrows: true,
    textFadeThreshold: 0.5,
    nodeSize: 6,
    linkThickness: 1,
  },
  forces: {
    centerForce: 0.35,
    repelForce: 250,
    linkForce: 0.5,
    linkDistance: 30,
  },
};

export interface SettingDescription {
  label: string;
  description: string;
}

export const SETTING_DESCRIPTIONS: Record<string, SettingDescription> = {
  searchQuery: {
    label: "Search Notes",
    description: "Type to filter notes by title or content",
  },
  showTags: {
    label: "Show Tags",
    description: "Display tags as nodes in the graph",
  },
  showAttachments: {
    label: "Show Attachments",
    description: "Display file attachments in the graph",
  },
  existingFilesOnly: {
    label: "Created Notes Only",
    description: "Show only notes that have been created (hide broken links)",
  },
  showOrphans: {
    label: "Show Isolated Notes",
    description: "Display notes that aren't connected to any other notes",
  },
  showArrows: {
    label: "Show Link Direction",
    description: "Display arrows on links to show connection direction",
  },
  textFadeThreshold: {
    label: "Label Visibility",
    description: "Control when note labels fade out when zooming out",
  },
  nodeSize: {
    label: "Note Size",
    description: "Adjust the size of note circles in the graph",
  },
  linkThickness: {
    label: "Connection Line Thickness",
    description: "Control how thick the lines between notes appear",
  },
  centerForce: {
    label: "Graph Density",
    description: "Higher values create a more compact, circular layout",
  },
  repelForce: {
    label: "Note Spacing",
    description: "Control how much notes push away from each other",
  },
  linkForce: {
    label: "Connection Strength",
    description: "How strongly connected notes are pulled together",
  },
  linkDistance: {
    label: "Connection Length",
    description: "Preferred distance between connected notes",
  },
};
