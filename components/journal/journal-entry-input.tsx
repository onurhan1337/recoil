"use client";

import { useState, useRef, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateJournalEntry } from "@/lib/api/hooks";
import { Loader2, ArrowRight } from "lucide-react";

interface JournalEntryInputProps {
  onEntryCreated?: () => void;
}

const placeholders = ["Write...", "Think...", "Remember..."];

export function JournalEntryInput({ onEntryCreated }: JournalEntryInputProps) {
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [placeholder, setPlaceholder] = useState(placeholders[0]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createEntryMutation = useCreateJournalEntry();

  useEffect(() => {
    textareaRef.current?.focus();
    const randomPlaceholder =
      placeholders[Math.floor(Math.random() * placeholders.length)];
    setPlaceholder(randomPlaceholder);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!content.trim()) {
      return;
    }

    try {
      await createEntryMutation.mutateAsync({ content: content.trim() });
      setContent("");
      setIsSaved(true);
      onEntryCreated?.();

      setTimeout(() => setIsSaved(false), 3000);

      setTimeout(() => {
        textareaRef.current?.focus();
        const randomPlaceholder =
          placeholders[Math.floor(Math.random() * placeholders.length)];
        setPlaceholder(randomPlaceholder);
      }, 100);
    } catch (err) {
      console.error("Error creating journal entry:", err);
    }
  };

  useHotkeys(
    "meta+enter, ctrl+enter",
    (e) => {
      e.preventDefault();
      handleSubmit();
    },
    {
      enableOnFormTags: ["TEXTAREA"],
      preventDefault: true,
      enabled: !createEntryMutation.isPending && !!content.trim(),
    },
    [content, createEntryMutation.isPending]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3 overflow-visible">
      <div className="relative overflow-visible">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="min-h-[140px] resize-none border border-border/60 bg-background text-[15px] leading-relaxed placeholder:text-muted-foreground/50 ring-1 ring-border/50 ring-offset-2 focus:border-border/70 focus:ring-border/60 focus-visible:ring-border/60 focus-visible:ring-1 focus-visible:ring-offset-2 focus:shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-lg p-4 pr-12 transition-all duration-200 font-lora tracking-wide shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.25)] dark:ring-border/60 dark:focus:shadow-[0_2px_10px_rgba(0,0,0,0.35)] dark:focus:ring-border/70 dark:focus-visible:ring-border/70"
          disabled={createEntryMutation.isPending}
        />
        {!isSaved && (
          <Button
            type="submit"
            size="icon"
            disabled={createEntryMutation.isPending || !content.trim()}
            className="absolute bottom-3 right-3 z-10 h-7 w-7 rounded-md border border-border/40 bg-background/95 backdrop-blur-sm hover:border-border/60 hover:bg-background hover:shadow-[0_1px_2px_rgba(0,0,0,0.04)] shadow-[0_1px_1px_rgba(0,0,0,0.02)] transition-all duration-200 dark:border-border/50 dark:bg-background/80 dark:hover:border-border/70 dark:hover:bg-background/90 dark:shadow-[0_1px_1px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.15)] disabled:opacity-40"
          >
            {createEntryMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin text-foreground/60" />
            ) : (
              <ArrowRight className="h-3 w-3 text-foreground/60" />
            )}
          </Button>
        )}
        {isSaved && (
          <div className="absolute bottom-3 right-3 z-10 text-[11px] text-muted-foreground/60 animate-scale-in font-normal">
            Saved
          </div>
        )}
      </div>
    </form>
  );
}
