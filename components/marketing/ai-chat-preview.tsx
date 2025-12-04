"use client";

import { ChatMessage } from "@/components/chat-message";
import { MarkdownRenderer } from "@/components/markdown-renderer";

export function AIChatPreview() {
  const mockMessages = [
    {
      id: "1",
      role: "user" as const,
      content: "What did I write about machine learning?",
      parts: [{ type: "text" as const, text: "What did I write about machine learning?" }],
    },
    {
      id: "2",
      role: "assistant" as const,
      content: "Based on your notes, you wrote about neural networks and deep learning. Here are the relevant notes:",
      parts: [
        { type: "text" as const, text: "Based on your notes, you wrote about neural networks and deep learning. Here are the relevant notes:" },
      ],
      notes: [
        {
          id: "1",
          content: "Machine Learning Basics",
          category: "work",
          similarity: 0.92,
          label: null,
        },
        {
          id: "2",
          content: "Deep Learning Architectures",
          category: "research",
          similarity: 0.87,
          label: null,
        },
      ],
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-card border border-border rounded-lg overflow-hidden">
      <div className="border-b px-6 py-4 bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground">AI Chat</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Ask questions about your notes and get instant answers with citations
        </p>
      </div>
      
      <div className="p-6 space-y-6 min-h-[400px] max-h-[600px] overflow-y-auto">
        {mockMessages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "justify-end" : ""
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium mt-1">
                A
              </div>
            )}
            <div
              className={`flex-1 space-y-2 ${
                message.role === "user" ? "flex flex-col items-end" : ""
              }`}
            >
              <div
                className={`inline-block rounded-lg px-4 py-2.5 max-w-[85%] ${
                  message.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-muted/50"
                }`}
              >
                <ChatMessage
                  content={message.content}
                  role={message.role}
                  parts={message.parts}
                  isStreaming={false}
                />
              </div>
              {message.role === "assistant" && message.notes && (
                <div className="space-y-2">
                  {message.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border bg-card/50 p-3 text-card-foreground shadow-sm hover:bg-card transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground/80 px-2 py-0.5 rounded-md bg-muted/50">
                            {note.category}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                          {(note.similarity * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-sm text-foreground/90 leading-relaxed">
                        <MarkdownRenderer content={note.content} compact />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {message.role === "user" && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium mt-1">
                U
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t px-6 py-4 bg-muted/30">
        <div className="relative flex items-center">
          <input
            disabled
            placeholder="Ask about your notes..."
            className="w-full rounded-full border bg-background px-4 py-2.5 pr-11 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
          />
          <button
            disabled
            className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground cursor-not-allowed"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

