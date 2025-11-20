"use client";

import { memo, useMemo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Star, Pin, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { NoteNodeData } from "@/lib/canvas/types";

interface NoteNodeProps {
  data: NoteNodeData;
}

const nodeTypeStyles: Record<string, string> = {
  Idea: "before:bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(15,20,30,0.05)_14px,rgba(15,20,30,0.05)_15px)] before:opacity-70 dark:before:bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(255,255,255,0.04)_14px,rgba(255,255,255,0.04)_15px)]",
  Task: "before:bg-[repeating-linear-gradient(60deg,transparent,transparent_12px,rgba(15,20,30,0.06)_12px,rgba(15,20,30,0.06)_13px)] before:opacity-75 dark:before:bg-[repeating-linear-gradient(60deg,transparent,transparent_12px,rgba(255,255,255,0.05)_12px,rgba(255,255,255,0.05)_13px)]",
  Question:
    "before:bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(15,20,30,0.05)_14px,rgba(15,20,30,0.05)_15px)] before:opacity-70 dark:before:bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(255,255,255,0.04)_14px,rgba(255,255,255,0.04)_15px)]",
  Note: "before:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(15,20,30,0.07)_10px,rgba(15,20,30,0.07)_11px)] before:opacity-80 dark:before:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.06)_10px,rgba(255,255,255,0.06)_11px)]",
  Reflection:
    "before:bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(15,20,30,0.05)_14px,rgba(15,20,30,0.05)_15px)] before:opacity-70 dark:before:bg-[repeating-linear-gradient(45deg,transparent,transparent_14px,rgba(255,255,255,0.04)_14px,rgba(255,255,255,0.04)_15px)]",
  default:
    "before:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(15,20,30,0.07)_10px,rgba(15,20,30,0.07)_11px)] before:opacity-80 dark:before:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.06)_10px,rgba(255,255,255,0.06)_11px)]",
};

const categoryAccents: Record<string, string> = {
  work: "after:bg-linear-to-b after:from-orange-600 after:to-transparent",
  personal: "after:bg-linear-to-b after:from-green-500 after:to-transparent",
  idea: "after:bg-linear-to-b after:from-orange-500 after:to-transparent",
};

export const NoteNode = memo(({ data }: NoteNodeProps) => {
  const { note, isSelected, isFocused, isConnected } = data;

  const nodeType = useMemo(
    () => nodeTypeStyles[note.category || ""] || nodeTypeStyles.default,
    [note.category]
  );

  const categoryAccent = useMemo(
    () => categoryAccents[note.category?.toLowerCase() || ""] || "",
    [note.category]
  );

  const displayContent = useMemo(() => {
    const content = note.content.slice(0, 150);
    return content.length < note.content.length ? `${content}...` : content;
  }, [note.content]);

  return (
    <div
      data-category={note.category?.toLowerCase()}
      className={cn(
        "relative bg-white dark:bg-zinc-900/95",
        "border-2 border-stone-200 dark:border-zinc-800",
        "rounded-xl px-[18px] py-3.5 min-w-[200px] max-w-[320px]",
        "transition-all duration-200 ease-out",
        "overflow-hidden isolate cursor-grab active:cursor-grabbing",
        "hover:border-stone-300 dark:hover:border-zinc-700",
        "hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)]",
        "before:content-[''] before:absolute before:inset-0 before:z-0 before:pointer-events-none",
        nodeType,
        "after:content-[''] after:absolute after:left-0 after:top-3 after:bottom-3 after:w-[3px] after:rounded-r-sm",
        categoryAccent,
        isSelected &&
          "border-orange-500! ring-4 ring-orange-500/30 shadow-[0_4px_16px_rgba(249,115,22,0.2)] dark:shadow-[0_4px_16px_rgba(249,115,22,0.3)]",
        isFocused &&
          "border-orange-500! ring-4 ring-orange-500/40 shadow-[0_8px_24px_rgba(249,115,22,0.25)] dark:shadow-[0_8px_24px_rgba(249,115,22,0.4)]",
        isConnected &&
          "border-orange-400/70! ring-2 ring-orange-400/30 shadow-[0_4px_16px_rgba(251,146,60,0.15)]"
      )}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 relative z-10">
            {note.title && (
              <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 leading-snug font-lora">
                {note.title}
              </h3>
            )}
            {note.label && !note.title && (
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-lora">
                {note.label}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 relative z-10">
            {note.pinned && <Pin className="h-3 w-3 opacity-40" />}
            {note.favorite && (
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            )}
            {note.archived && <Archive className="h-3 w-3 opacity-40" />}
          </div>
        </div>

        <div className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3 relative z-10">
          <MarkdownRenderer content={displayContent} compact className="prose-p:text-[13px]" />
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 dark:text-zinc-400 relative z-10">
          {note.category && (
            <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 font-medium">
              {note.category}
            </span>
          )}
          {note.tags && note.tags.length > 0 && (
            <span className="truncate font-lora">
              {note.tags.slice(0, 2).join(", ")}
              {note.tags.length > 2 && ` +${note.tags.length - 2}`}
            </span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
});

NoteNode.displayName = "NoteNode";
