import { useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { ReactFlowInstance } from "@xyflow/react";
import { blockDefaultHotkey, isCtrlOrCmdPressed } from "../utils";

interface UseCanvasShortcutsOptions {
  reactFlowInstance: ReactFlowInstance | null;
  onSearch?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

const PAN_DISTANCE = 50;
const isMacOS = () => /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);

export function useCanvasShortcuts({
  reactFlowInstance,
  onSearch,
  onEscape,
  enabled = true,
}: UseCanvasShortcutsOptions) {
  const selectAllNodes = useCallback(() => {
    if (!reactFlowInstance) return;
    const nodes = reactFlowInstance.getNodes();
    reactFlowInstance.setNodes(
      nodes.map((node) => ({ ...node, selected: true }))
    );
  }, [reactFlowInstance]);

  const deselectAllNodes = useCallback(() => {
    if (!reactFlowInstance) return;
    const nodes = reactFlowInstance.getNodes();
    reactFlowInstance.setNodes(
      nodes.map((node) => ({ ...node, selected: false }))
    );
  }, [reactFlowInstance]);

  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const cmdOrCtrl = isCtrlOrCmdPressed(e);
      const key = e.key.toLowerCase();

      if (cmdOrCtrl && key === "a") {
        blockDefaultHotkey(e);
        selectAllNodes();
        return false;
      }

      if (cmdOrCtrl && key === "f") {
        blockDefaultHotkey(e);
        onSearch?.();
        return false;
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [enabled, selectAllNodes, onSearch]);

  useHotkeys(
    "plus, =, ctrl+=, cmd+=",
    (e) => {
      e.preventDefault();
      reactFlowInstance?.zoomIn({ duration: 200 });
    },
    { enabled, enableOnFormTags: true, preventDefault: true },
    [reactFlowInstance]
  );

  useHotkeys(
    "minus, -, ctrl+-, cmd+-",
    (e) => {
      e.preventDefault();
      reactFlowInstance?.zoomOut({ duration: 200 });
    },
    { enabled, enableOnFormTags: true, preventDefault: true },
    [reactFlowInstance]
  );

  useHotkeys(
    "0, ctrl+0, cmd+0",
    (e) => {
      e.preventDefault();
      reactFlowInstance?.fitView({ padding: 0.2, duration: 400 });
    },
    { enabled, enableOnFormTags: true, preventDefault: true },
    [reactFlowInstance]
  );

  useHotkeys(
    "up, w",
    (e) => {
      e.preventDefault();
      if (!reactFlowInstance) return;
      const viewport = reactFlowInstance.getViewport();
      reactFlowInstance.setViewport({
        ...viewport,
        y: viewport.y + PAN_DISTANCE,
      });
    },
    { enabled, enableOnFormTags: true, preventDefault: true },
    [reactFlowInstance]
  );

  useHotkeys(
    "down, s",
    (e) => {
      e.preventDefault();
      if (!reactFlowInstance) return;
      const viewport = reactFlowInstance.getViewport();
      reactFlowInstance.setViewport({
        ...viewport,
        y: viewport.y - PAN_DISTANCE,
      });
    },
    { enabled, enableOnFormTags: true, preventDefault: true },
    [reactFlowInstance]
  );

  useHotkeys(
    "left, a",
    (e) => {
      e.preventDefault();
      if (!reactFlowInstance) return;
      const viewport = reactFlowInstance.getViewport();
      reactFlowInstance.setViewport({
        ...viewport,
        x: viewport.x + PAN_DISTANCE,
      });
    },
    { enabled, enableOnFormTags: true, preventDefault: true },
    [reactFlowInstance]
  );

  useHotkeys(
    "right, d",
    (e) => {
      e.preventDefault();
      if (!reactFlowInstance) return;
      const viewport = reactFlowInstance.getViewport();
      reactFlowInstance.setViewport({
        ...viewport,
        x: viewport.x - PAN_DISTANCE,
      });
    },
    { enabled, enableOnFormTags: true, preventDefault: true },
    [reactFlowInstance]
  );

  useHotkeys(
    "escape",
    () => {
      if (onEscape) {
        onEscape();
      } else {
        deselectAllNodes();
      }
    },
    { enabled },
    [onEscape, deselectAllNodes]
  );
}
