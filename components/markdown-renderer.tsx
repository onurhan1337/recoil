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
        "prose-code:bg-secondary/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-foreground prose-code:before:content-[''] prose-code:after:content-[''] prose-code:break-all prose-code:max-w-full",
        "prose-pre:bg-secondary/30 prose-pre:overflow-x-auto prose-pre:max-w-full",
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
          p: ({ children }) => (
            <p
              className={cn(
                "mb-2 last:mb-0",
                compact ? "text-sm" : "text-base"
              )}
            >
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul
              className={cn(
                "list-disc list-outside ml-4 space-y-1 my-2",
                compact ? "text-sm" : "text-base"
              )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={cn(
                "list-decimal list-outside ml-4 space-y-1 my-2",
                compact ? "text-sm" : "text-base"
              )}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              className={cn(
                "leading-relaxed",
                compact ? "text-sm" : "text-base"
              )}
            >
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong
              className={cn("font-semibold", compact ? "text-sm" : "text-base")}
            >
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={cn("italic", compact ? "text-sm" : "text-base")}>
              {children}
            </em>
          ),
          code: ({ children, className: codeClassName }) => {
            const isInline = !codeClassName?.includes("language");
            return (
              <code
                className={cn(
                  "bg-secondary/50 px-1.5 py-0.5 text-foreground",
                  isInline && "break-all max-w-full",
                  compact ? "text-sm" : "text-base",
                  codeClassName
                )}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre
              className={cn(
                "bg-secondary/30 rounded-md p-4 overflow-x-auto max-w-full",
                compact ? "text-sm" : "text-base"
              )}
            >
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={cn(
                "my-4 flex items-start text-muted-foreground tracking-tight",
                compact ? "text-xs" : "text-sm"
              )}
            >
              <div className="flex items-center w-4 mr-4">↪</div>
              <div className="w-full">{children}</div>
            </blockquote>
          ),
          hr: ({ children }) => (
            <hr
              className={cn(
                "border-t-2 border-dashed border-border",
                compact ? "text-sm" : "text-base"
              )}
            />
          ),
          table: ({ children }) => (
            <table className={cn("w-full", compact ? "text-sm" : "text-base")}>
              {children}
            </table>
          ),
          tbody: ({ children }) => (
            <tbody
              className={cn(
                "divide-y divide-stone-200",
                compact ? "text-sm" : "text-base"
              )}
            >
              {children}
            </tbody>
          ),
          thead: ({ children }) => (
            <thead
              className={cn("bg-stone-100", compact ? "text-sm" : "text-base")}
            >
              {children}
            </thead>
          ),
          tr: ({ children }) => (
            <tr
              className={cn(
                "hover:bg-stone-50",
                compact ? "text-sm" : "text-base"
              )}
            >
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td
              className={cn("px-4 py-2.5", compact ? "text-sm" : "text-base")}
            >
              {children}
            </td>
          ),
          th: ({ children }) => (
            <th
              className={cn(
                "px-4 py-2.5 font-semibold",
                compact ? "text-sm" : "text-base"
              )}
            >
              {children}
            </th>
          ),
          tfoot: ({ children }) => (
            <tfoot
              className={cn("bg-stone-100", compact ? "text-sm" : "text-base")}
            >
              {children}
            </tfoot>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
