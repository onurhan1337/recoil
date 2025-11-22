import { useRef, useCallback, useEffect } from "react";

interface UseDebouncedSaveParams<T> {
  onSave: (data: T[]) => void;
  delay: number;
}

export function useDebouncedSave<T>({
  onSave,
  delay,
}: UseDebouncedSaveParams<T>) {
  const pendingUpdates = useRef<Map<string, T>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const save = useCallback(() => {
    if (pendingUpdates.current.size === 0) return;

    const updates = Array.from(pendingUpdates.current.values());
    onSave(updates);
    pendingUpdates.current.clear();
  }, [onSave]);

  const scheduleUpdate = useCallback(
    (key: string, value: T) => {
      pendingUpdates.current.set(key, value);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(save, delay);
    },
    [save, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { scheduleUpdate, save };
}
