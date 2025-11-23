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

export function useGraphKeyboard({
  graphRef,
  panSpeed = KEYBOARD_SPEEDS.pan,
  zoomSpeed = KEYBOARD_SPEEDS.zoom,
  enabled = true,
  enableOnFormTags = false,
}: UseGraphKeyboardOptions) {
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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
}
