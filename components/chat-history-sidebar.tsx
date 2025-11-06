"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search } from "lucide-react";
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
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Chat History
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Chat History</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelect(conversation.id)}
                  className={`group flex items-center justify-between gap-3 rounded-md border p-4 text-sm cursor-pointer transition-all hover:border-foreground/20 hover:bg-muted/50 ${
                    currentConversationId === conversation.id ? "bg-muted border-foreground/20" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate mb-1">{conversation.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.updated_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => handleDelete(conversation.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t px-6 py-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-md"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
