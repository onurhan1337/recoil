import { useRef, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { ForceGraph2DRef } from "./types";
import { KEYBOARD_SPEEDS } from "./constants";

interface UseGraphKeyboardOptions {
  graphRef: ForceGraph2DRef;
  panSpeed?: number;
  zoomSpeed?: number;
  enabled?: boolean;
  enableOnFormTags?: boolean;
}

export interface UseGraphKeyboardReturn {
  setCenter: (center: { x: number; y: number }) => void;
}

/**
 * Attempts to get the current center position of the graph viewport.
 * Since centerAt() is setter-only, we use screen2GraphCoords to convert
 * the viewport center to graph coordinates.
 *
 * @param graphRef - Reference to the ForceGraph2D instance
 * @returns The center position in graph coordinates, or null if it cannot be determined
 */
export function getGraphCenter(
  graphRef: ForceGraph2DRef
): { x: number; y: number } | null {
  if (!graphRef.current) return null;

  try {
    // Access the internal container to find the canvas element
    const graphInstance = graphRef.current as unknown as {
      _container?: {
        querySelector?: (selector: string) => HTMLElement | null;
      };
    };
    const canvasElement = graphInstance._container?.querySelector?.("canvas");
    const canvas = canvasElement as HTMLCanvasElement | null;

    if (!canvas || !graphRef.current.screen2GraphCoords) {
      return null;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const center = graphRef.current.screen2GraphCoords(centerX, centerY);

    if (
      center &&
      typeof center.x === "number" &&
      typeof center.y === "number"
    ) {
      return { x: center.x, y: center.y };
    }
  } catch (error) {
    // Silently fail - will fall back to {x: 0, y: 0}
  }

  return null;
}

export function useGraphKeyboard({
  graphRef,
  panSpeed = KEYBOARD_SPEEDS.pan,
  zoomSpeed = KEYBOARD_SPEEDS.zoom,
  enabled = true,
  enableOnFormTags = false,
}: UseGraphKeyboardOptions): UseGraphKeyboardReturn {
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const centerInitializedRef = useRef(false);

  /**
   * Set the center position for keyboard panning.
   * This should be called from onEngineTick in the ForceGraph2D component
   * to initialize the center with the graph's actual position.
   */
  const setCenter = useCallback((center: { x: number; y: number }) => {
    if (!centerInitializedRef.current) {
      centerRef.current = center;
      centerInitializedRef.current = true;
    }
  }, []);

  /**
   * Pan the graph by the given delta
   * @param dx - The horizontal delta
   * @param dy - The vertical delta
   */
  const panBy = useCallback(
    (dx: number, dy: number) => {
      if (!graphRef.current) return;
      centerRef.current.x += dx;
      centerRef.current.y += dy;
      graphRef.current.centerAt(centerRef.current.x, centerRef.current.y);
    },
    [graphRef]
  );
  useHotkeys(
    "plus, =, shift+plus, shift+=",
    (e) => {
      if (!graphRef.current) return;
      e.preventDefault();
      const zoom = e.shiftKey
        ? zoomSpeed * KEYBOARD_SPEEDS.zoomMultiplier
        : zoomSpeed;
      graphRef.current.zoom(graphRef.current.zoom() + zoom);
    },
    { enabled, enableOnFormTags, preventDefault: true },
    [graphRef, zoomSpeed, enableOnFormTags]
  );

  useHotkeys(
    "minus, -, shift+minus, shift+-",
    (e) => {
      if (!graphRef.current) return;
      e.preventDefault();
      const zoom = e.shiftKey
        ? zoomSpeed * KEYBOARD_SPEEDS.zoomMultiplier
        : zoomSpeed;
      graphRef.current.zoom(graphRef.current.zoom() - zoom);
    },
    { enabled, enableOnFormTags, preventDefault: true },
    [graphRef, zoomSpeed, enableOnFormTags]
  );

  useHotkeys(
    "up, shift+up",
    (e) => {
      e.preventDefault();
      const speed = e.shiftKey
        ? panSpeed * KEYBOARD_SPEEDS.panMultiplier
        : panSpeed;
      panBy(0, -speed);
    },
    { enabled, enableOnFormTags, preventDefault: true },
    [panBy, panSpeed, enableOnFormTags]
  );

  useHotkeys(
    "down, shift+down",
    (e) => {
      e.preventDefault();
      const speed = e.shiftKey
        ? panSpeed * KEYBOARD_SPEEDS.panMultiplier
        : panSpeed;
      panBy(0, speed);
    },
    { enabled, enableOnFormTags, preventDefault: true },
    [panBy, panSpeed, enableOnFormTags]
  );

  useHotkeys(
    "left, shift+left",
    (e) => {
      e.preventDefault();
      const speed = e.shiftKey
        ? panSpeed * KEYBOARD_SPEEDS.panMultiplier
        : panSpeed;
      panBy(-speed, 0);
    },
    { enabled, enableOnFormTags, preventDefault: true },
    [panBy, panSpeed, enableOnFormTags]
  );

  useHotkeys(
    "right, shift+right",
    (e) => {
      e.preventDefault();
      const speed = e.shiftKey
        ? panSpeed * KEYBOARD_SPEEDS.panMultiplier
        : panSpeed;
      panBy(speed, 0);
    },
    { enabled, enableOnFormTags, preventDefault: true },
    [panBy, panSpeed, enableOnFormTags]
  );

  return { setCenter };
}
