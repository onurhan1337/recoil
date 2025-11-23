import { useHotkeys } from "react-hotkeys-hook";
import type { ForceGraph2DRef } from "./types";
import { KEYBOARD_SPEEDS } from "./constants";

interface UseGraphKeyboardOptions {
  graphRef: ForceGraph2DRef;
  panSpeed?: number;
  zoomSpeed?: number;
  enabled?: boolean;
}

export function useGraphKeyboard({
  graphRef,
  panSpeed = KEYBOARD_SPEEDS.pan,
  zoomSpeed = KEYBOARD_SPEEDS.zoom,
  enabled = true,
}: UseGraphKeyboardOptions) {
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
    { enabled, enableOnFormTags: true, preventDefault: true },
    [graphRef, zoomSpeed]
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
    { enabled, enableOnFormTags: true, preventDefault: true },
    [graphRef, zoomSpeed]
  );

  useHotkeys(
    "up, shift+up",
    (e) => {
      if (!graphRef.current) return;
      e.preventDefault();
      const speed = e.shiftKey
        ? panSpeed * KEYBOARD_SPEEDS.panMultiplier
        : panSpeed;
      const center = graphRef.current.centerAt();
      graphRef.current.centerAt(center.x, center.y - speed);
    },
    { enabled, enableOnFormTags: true, preventDefault: true },
    [graphRef, panSpeed]
  );

  useHotkeys(
    "down, shift+down",
    (e) => {
      if (!graphRef.current) return;
      e.preventDefault();
      const speed = e.shiftKey
        ? panSpeed * KEYBOARD_SPEEDS.panMultiplier
        : panSpeed;
      const center = graphRef.current.centerAt();
      graphRef.current.centerAt(center.x, center.y + speed);
    },
    { enabled, enableOnFormTags: true, preventDefault: true },
    [graphRef, panSpeed]
  );

  useHotkeys(
    "left, shift+left",
    (e) => {
      if (!graphRef.current) return;
      e.preventDefault();
      const speed = e.shiftKey
        ? panSpeed * KEYBOARD_SPEEDS.panMultiplier
        : panSpeed;
      const center = graphRef.current.centerAt();
      graphRef.current.centerAt(center.x - speed, center.y);
    },
    { enabled, enableOnFormTags: true, preventDefault: true },
    [graphRef, panSpeed]
  );

  useHotkeys(
    "right, shift+right",
    (e) => {
      if (!graphRef.current) return;
      e.preventDefault();
      const speed = e.shiftKey
        ? panSpeed * KEYBOARD_SPEEDS.panMultiplier
        : panSpeed;
      const center = graphRef.current.centerAt();
      graphRef.current.centerAt(center.x + speed, center.y);
    },
    { enabled, enableOnFormTags: true, preventDefault: true },
    [graphRef, panSpeed]
  );
}
