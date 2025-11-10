"use client";

import { useState, useRef, useEffect } from "react";
import { X, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTags } from "@/lib/api/hooks";
import { useHotkeys } from "react-hotkeys-hook";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  onBlur?: () => void;
}

export function TagInput({ value, onChange, placeholder = "Add tags...", onBlur }: TagInputProps) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const { data: allTags = [] } = useTags();
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const suggestions = allTags
    .filter((tag) => tag.toLowerCase().includes(input.toLowerCase()) && !value.includes(tag))
    .slice(0, 5);

  const reset = () => {
    setInput("");
    setIsOpen(false);
    setSelected(-1);
  };

  const add = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      reset();
    }
  };

  const remove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  useHotkeys("down", () => {
    if (suggestions.length === 0) return;
    if (!isOpen) setIsOpen(true);
    setSelected((prev) => Math.min(prev + 1, suggestions.length - 1));
  }, { enableOnFormTags: ["INPUT"], preventDefault: true }, [suggestions.length, isOpen]);

  useHotkeys("up", () => {
    setSelected((prev) => Math.max(prev - 1, -1));
  }, { enableOnFormTags: ["INPUT"], preventDefault: true });

  useHotkeys("enter, comma", () => {
    if (selected >= 0 && suggestions[selected]) {
      add(suggestions[selected]);
    } else if (input) {
      add(input);
    }
  }, { enableOnFormTags: ["INPUT"], preventDefault: true }, [selected, suggestions, input]);

  useHotkeys("backspace", () => {
    if (!input && value.length > 0) {
      remove(value[value.length - 1]);
    }
  }, { enableOnFormTags: ["INPUT"] }, [input, value]);

  useHotkeys("escape", () => {
    setIsOpen(false);
    setSelected(-1);
  }, { enableOnFormTags: ["INPUT"], enabled: isOpen }, [isOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setSelected(-1);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (selected >= 0 && menuRef.current) {
      menuRef.current.querySelectorAll("button")[selected]?.scrollIntoView({ block: "nearest" });
    }
  }, [selected]);

  return (
    <div className="relative">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <TagIcon className="h-3 w-3" />
          <span>Tags</span>
        </label>
        <div className="flex flex-wrap gap-2 p-2 rounded-md border bg-background min-h-[40px]">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="hover:bg-muted-foreground/20 rounded-sm p-0.5"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setIsOpen(e.target.value.length > 0);
              setSelected(-1);
            }}
            onFocus={() => setIsOpen(input.length > 0)}
            onBlur={(e) => {
              if (menuRef.current?.contains(e.relatedTarget as Node)) return;
              if (input.trim()) add(input);
              onBlur?.();
            }}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] border-0 shadow-none focus-visible:ring-0 p-0 h-6"
          />
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div ref={menuRef} className="absolute z-10 w-full mt-1 rounded-md border bg-popover p-1 shadow-md">
          <div className="text-[10px] text-muted-foreground px-2 py-1">Suggestions</div>
          {suggestions.map((tag, i) => (
            <button
              key={tag}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                add(tag);
                inputRef.current?.focus();
              }}
              className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                i === selected ? "bg-accent" : "hover:bg-accent"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
