"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface NoteCard {
  id: string;
  content: string;
  similarity: number;
}

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
}

export function ChatMessage({ content, role }: ChatMessageProps) {
  if (role === "user") {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  const parseNotesFromContent = (text: string) => {
    const notePattern = /\[NOTE:([^\]]+)\]/g;
    const notes: NoteCard[] = [];
    let match;

    while ((match = notePattern.exec(text)) !== null) {
      const [id, similarity, ...contentParts] = match[1].split(":");
      notes.push({
        id,
        similarity: parseFloat(similarity),
        content: contentParts.join(":"),
      });
    }

    const cleanText = text.replace(notePattern, "");
    return { cleanText, notes };
  };

  const { cleanText, notes } = parseNotesFromContent(content);

  return (
    <div className="space-y-3">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, ...props }) => (
              <a
                {...props}
                className="text-foreground underline underline-offset-4 hover:text-foreground/80"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
            code: ({ node, className, children, ...props }: any) => {
              const isInline = !className || !className.includes("language-");
              return isInline ? (
                <code
                  {...props}
                  className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs"
                >
                  {children}
                </code>
              ) : (
                <code
                  {...props}
                  className="block p-3 rounded-md bg-muted text-foreground font-mono text-xs overflow-x-auto"
                >
                  {children}
                </code>
              );
            },
            ul: ({ node, ...props }) => (
              <ul {...props} className="list-disc list-inside space-y-1" />
            ),
            ol: ({ node, ...props }) => (
              <ol {...props} className="list-decimal list-inside space-y-1" />
            ),
            p: ({ node, ...props }) => (
              <p {...props} className="leading-relaxed" />
            ),
          }}
        >
          {cleanText}
        </ReactMarkdown>
      </div>

      {notes.length > 0 && (
        <div className="space-y-2 mt-3">
          {notes.map((note, idx) => (
            <div
              key={note.id || idx}
              className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Note {idx + 1}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {(note.similarity * 100).toFixed(0)}% match
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap text-foreground">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
