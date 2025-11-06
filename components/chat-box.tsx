"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { ArrowUp, History, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatHistorySidebar } from "./chat-history-sidebar";
import { ChatMessage } from "./chat-message";

export function ChatBox() {
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        conversation_id: conversationId,
      },
    }),
  });
  const isLoading = status === "submitted" || status === "streaming";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (response.ok) {
        const data = await response.json();
        const loadedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          parts: [{ type: "text" as const, text: msg.content }],
        }));
        setMessages(loadedMessages);
        setConversationId(id);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(undefined);
    setInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <ChatHistorySidebar
            onSelectConversation={loadConversation}
            onNewConversation={handleNewConversation}
            currentConversationId={conversationId}
          />
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground max-w-md text-center">
              Ask me anything about your notes. I can help you find, summarize,
              and explore your thoughts.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "user" && "justify-end"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium mt-1">
                      A
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex-1 space-y-1",
                      message.role === "user" && "flex flex-col items-end"
                    )}
                  >
                    <div
                      className={cn(
                        "inline-block rounded-lg px-4 py-2.5 max-w-[85%]",
                        message.role === "user"
                          ? "bg-foreground text-background"
                          : "bg-muted/50"
                      )}
                    >
                      <ChatMessage
                        content={message.parts
                          .filter((part) => part.type === "text")
                          .map((part) => part.text)
                          .join("")}
                        role={message.role as "user" | "assistant"}
                      />
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium mt-1">
                      U
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium mt-1">
                  A
                </div>
                <div className="inline-block rounded-lg px-4 py-3 bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">Searching notes...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t px-6 py-4">
        <form onSubmit={handleSubmit}>
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Ask about your notes..."
                className="w-full rounded-full border bg-background px-4 py-2.5 pr-11 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input?.trim()}
                className={cn(
                  "absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-full transition-all",
                  input?.trim() && !isLoading
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
