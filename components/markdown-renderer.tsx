"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  compact?: boolean;
}

export function MarkdownRenderer({
  content,
  className,
  compact = false,
}: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-sm prose-neutral max-w-none",
        "prose-headings:font-lora prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-p:leading-relaxed prose-p:text-foreground",
        "prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 prose-a:decoration-2 prose-a:decoration-foreground/20 hover:prose-a:decoration-foreground/40",
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-code:bg-secondary/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:border prose-code:border-border prose-code:text-foreground prose-code:before:content-[''] prose-code:after:content-['']",
        "prose-pre:bg-secondary/30 prose-pre:border-2 prose-pre:border-border",
        "prose-blockquote:border-l-4 prose-blockquote:border-foreground/20 prose-blockquote:pl-4 prose-blockquote:italic",
        "prose-ul:list-disc prose-ol:list-decimal",
        "prose-li:text-foreground prose-li:marker:text-muted-foreground",
        "prose-hr:border-t-2 prose-hr:border-dashed prose-hr:border-border",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1
              className={cn(
                "font-lora font-semibold mb-2 mt-3 first:mt-0",
                compact ? "text-sm" : "text-xl"
              )}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={cn(
                "font-lora font-semibold mb-1.5 mt-2.5 first:mt-0",
                compact ? "text-sm" : "text-lg"
              )}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={cn(
                "font-lora font-semibold mb-1 mt-2 first:mt-0",
                compact ? "text-sm" : "text-base"
              )}
            >
              {children}
            </h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
