"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { UIMessagePart, UIDataTypes, UITools } from "ai";

interface NoteCard {
  id: string;
  category: string;
  label: string;
  content: string;
  similarity: number;
}

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  isStreaming?: boolean;
}

interface ChatMessagePropsWithParts extends ChatMessageProps {
  parts?: UIMessagePart<UIDataTypes, UITools>[];
}

export function ChatMessage({
  content,
  role,
  parts,
  isStreaming,
}: ChatMessagePropsWithParts) {
  if (role === "user") {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    );
  }

  const textContent = parts
    ? parts
        .filter((p) => p.type === "text")
        .map((p) => {
          if (p.type === "text") {
            return p.text;
          }
          return "";
        })
        .join("")
    : content;

  const notes = parts
    ? parts
        .filter(
          (p) =>
            p.type === "data-note" &&
            p.data != null &&
            typeof p.data === "object" &&
            "id" in p.data &&
            "category" in p.data &&
            "content" in p.data &&
            "similarity" in p.data
        )
        .map((p) => {
          if (p.type === "data-note" && "data" in p) {
            return p.data as NoteCard;
          }
          return null;
        })
        .filter((note): note is NoteCard => note !== null)
    : [];

  // Show friendly loading message when content is empty and streaming
  const isEmptyAndStreaming =
    (!textContent || textContent.trim() === "") && isStreaming;

  return (
    <div className="space-y-3">
      {isEmptyAndStreaming ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <div
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span className="font-lora">Searching thoughts...</span>
        </div>
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
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
                <ul
                  {...props}
                  className="list-disc list-outside ml-4 space-y-2 my-3"
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  {...props}
                  className="list-decimal list-outside ml-4 space-y-2 my-3"
                />
              ),
              li: ({ node, ...props }) => (
                <li {...props} className="leading-relaxed pl-1" />
              ),
              p: ({ node, ...props }) => (
                <p {...props} className="leading-relaxed mb-3 last:mb-0" />
              ),
              h1: ({ node, ...props }) => (
                <h1
                  {...props}
                  className="text-xl font-lora font-semibold tracking-tight mb-3 mt-4 first:mt-0"
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  {...props}
                  className="text-lg font-lora font-semibold tracking-tight mb-2 mt-3 first:mt-0"
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  {...props}
                  className="text-base font-lora font-semibold mb-2 mt-3 first:mt-0"
                />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  {...props}
                  className="border-l-2 border-muted-foreground/30 pl-3 italic my-3 text-muted-foreground"
                />
              ),
              hr: ({ node, ...props }) => (
                <hr {...props} className="border-muted-foreground/20 my-4" />
              ),
              strong: ({ node, ...props }) => (
                <strong {...props} className="font-semibold" />
              ),
              em: ({ node, ...props }) => <em {...props} className="italic" />,
            }}
          >
            {textContent}
          </ReactMarkdown>
        </div>
      )}

      {notes.length > 0 && (
        <div className="space-y-2 mt-4">
          {notes.map((note, index) => (
            <div
              key={index}
              className="rounded-lg border bg-card/50 p-3 text-card-foreground shadow-sm hover:bg-card transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground/80 px-2 py-0.5 rounded-md bg-muted/50">
                    {note.category}
                  </span>
                  {note.label && (
                    <span className="text-xs text-muted-foreground font-medium">
                      {note.label}
                    </span>
                  )}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                  {(note.similarity * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-sm text-foreground/90 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p {...props} className="mb-2 last:mb-0" />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        {...props}
                        className="list-disc list-outside ml-4 space-y-1 my-2"
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        {...props}
                        className="list-decimal list-outside ml-4 space-y-1 my-2"
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li {...props} className="leading-relaxed" />
                    ),
                    h1: ({ node, ...props }) => (
                      <h1
                        {...props}
                        className="text-base font-lora font-semibold tracking-tight mb-2 mt-2 first:mt-0"
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        {...props}
                        className="text-sm font-lora font-semibold tracking-tight mb-1 mt-2 first:mt-0"
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        {...props}
                        className="text-sm font-lora font-semibold mb-1 mt-2 first:mt-0"
                      />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong {...props} className="font-semibold" />
                    ),
                    em: ({ node, ...props }) => (
                      <em {...props} className="italic" />
                    ),
                    code: ({ node, className, children, ...props }: any) => {
                      const isInline =
                        !className || !className.includes("language-");
                      return isInline ? (
                        <code
                          {...props}
                          className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-xs"
                        >
                          {children}
                        </code>
                      ) : (
                        <code
                          {...props}
                          className="block p-2 rounded bg-muted text-foreground font-mono text-xs overflow-x-auto my-2"
                        >
                          {children}
                        </code>
                      );
                    },
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        {...props}
                        className="border-l-2 border-muted-foreground/30 pl-2 italic my-2 text-muted-foreground text-sm"
                      />
                    ),
                  }}
                >
                  {note.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
