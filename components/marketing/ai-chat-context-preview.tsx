"use client";

import { useState, useEffect } from "react";
import { ChatMessage } from "@/components/chat-message";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Sparkles } from "lucide-react";

export function AIChatContextPreview() {
  const [showMessages, setShowMessages] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowMessages(true), 500);
    const timer2 = setTimeout(() => setCurrentStep(1), 2000);
    const timer3 = setTimeout(() => setCurrentStep(2), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

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
    <div className="w-full h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="border-b px-6 py-4 bg-muted/30 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">AI Chat with Context</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Google Gemini answers questions using your notes as context with citations
        </p>
      </div>
      
      <div className="flex-1 p-6 space-y-4 overflow-y-auto min-h-0">
        {showMessages && mockMessages.map((message, msgIndex) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 animate-fade-in ${
              message.role === "user" ? "justify-end" : ""
            }`}
            style={{ 
              animationDelay: `${msgIndex * 300}ms`,
              animationFillMode: 'both'
            }}
          >
            {message.role === "assistant" && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium mt-1 animate-scale-in">
                A
              </div>
            )}
            <div
              className={`flex-1 space-y-2 ${
                message.role === "user" ? "flex flex-col items-end" : ""
              }`}
            >
              <div
                className={`inline-block rounded-lg px-4 py-2.5 max-w-[85%] animate-fade-in ${
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
              {message.role === "assistant" && message.notes && currentStep >= 2 && (
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
                  {message.notes.map((note, noteIndex) => (
                    <div
                      key={note.id}
                      className="rounded-lg border bg-card/50 p-3 text-card-foreground shadow-sm hover:bg-card transition-colors animate-fade-in"
                      style={{ 
                        animationDelay: `${500 + noteIndex * 150}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground/80 px-2 py-0.5 rounded-md bg-muted/50">
                            {note.category}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0 animate-scale-in">
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
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium mt-1 animate-scale-in">
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
