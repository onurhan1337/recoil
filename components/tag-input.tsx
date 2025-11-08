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
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tags...",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { data: allTags = [] } = useTags();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const suggestions = allTags.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tag)
  );

  useHotkeys(
    "arrowdown",
    (e) => {
      if (showSuggestions && suggestions.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      }
    },
    { enabled: showSuggestions && suggestions.length > 0 }
  );

  useHotkeys(
    "arrowup",
    (e) => {
      if (showSuggestions && suggestions.length > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    },
    { enabled: showSuggestions && suggestions.length > 0 }
  );

  useHotkeys(
    "enter",
    (e) => {
      if (
        showSuggestions &&
        selectedIndex >= 0 &&
        selectedIndex < suggestions.length
      ) {
        e.preventDefault();
        addTag(suggestions[selectedIndex]);
        setSelectedIndex(-1);
      }
    },
    { enabled: showSuggestions && selectedIndex >= 0 }
  );

  useHotkeys(
    "escape",
    () => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    },
    { enabled: showSuggestions }
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        addTag(suggestions[selectedIndex]);
        setSelectedIndex(-1);
      } else if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    } else {
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const suggestionElements =
        suggestionsRef.current.querySelectorAll("button");
      if (suggestionElements[selectedIndex]) {
        suggestionElements[selectedIndex].scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative" ref={inputRef}>
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <TagIcon className="h-3 w-3" />
          <span>Tags</span>
        </label>
        <div className="flex flex-wrap gap-2 p-2 rounded-md border bg-background min-h-[40px]">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs flex items-center gap-1 pr-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-muted-foreground/20 rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] border-0 shadow-none focus-visible:ring-0 p-0 h-6"
          />
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 rounded-md border bg-popover p-1 shadow-md"
        >
          <div className="text-[10px] text-muted-foreground px-2 py-1">
            Suggestions
          </div>
          {suggestions.slice(0, 5).map((tag, index) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                addTag(tag);
                setSelectedIndex(-1);
              }}
              className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                index === selectedIndex ? "bg-accent" : "hover:bg-accent"
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
