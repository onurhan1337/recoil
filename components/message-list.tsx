"use client";

import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No search results yet. Try searching your notes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <Card
          key={message.id}
          className={`p-4 transition-all ${
            message.role === "user"
              ? "bg-primary/10 border-primary/20"
              : "bg-background/50 border-border/50 hover:border-border"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {message.role === "user" ? "Query" : "Results"}
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
