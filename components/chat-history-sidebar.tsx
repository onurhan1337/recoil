"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useConversations, useDeleteConversation } from "@/lib/api/hooks";
import { useQueryClient } from "@tanstack/react-query";

interface ChatHistorySidebarProps {
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  currentConversationId?: string;
}

export function ChatHistorySidebar({
  onSelectConversation,
  onNewConversation,
  currentConversationId,
}: ChatHistorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversations = [], isLoading } = useConversations();
  const deleteMutation = useDeleteConversation();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;

    await deleteMutation.mutateAsync(id);
    if (currentConversationId === id) {
      onNewConversation();
    }
  };

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    setIsOpen(false);
  };

  const filteredConversations = useMemo(
    () =>
      conversations.filter((conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [conversations, searchQuery]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors font-lora">
          Chat History
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-lora font-semibold tracking-tight">
            Chat History
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 pb-4 border-b bg-muted/30">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-11 rounded-md bg-background border-input/70 focus-visible:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring/20 transition-all font-lora placeholder:text-muted-foreground/70 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground font-lora">
                {searchQuery
                  ? "No conversations found"
                  : "No conversations yet"}
              </p>
              {!searchQuery && (
                <p className="text-xs text-muted-foreground mt-2 font-lora">
                  Start a new chat to see it here
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelect(conversation.id)}
                  className={`group relative flex items-start gap-3 rounded-md border bg-card p-4 cursor-pointer transition-all hover:border-foreground/30 hover:bg-muted/50 hover:shadow-sm ${
                    currentConversationId === conversation.id
                      ? "bg-muted/80 border-foreground/30 shadow-sm"
                      : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-lora font-medium text-sm leading-relaxed mb-2 line-clamp-2">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-muted-foreground font-lora tracking-wide">
                      {formatDistanceToNow(new Date(conversation.updated_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                    onClick={(e) => handleDelete(conversation.id, e)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
