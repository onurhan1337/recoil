import { LinkIcon, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatShortDate } from "@/lib/utils";
import type { NoteConnection } from "@/lib/api/hooks/use-note-connections";
import { MarkdownRenderer } from "../markdown-renderer";

interface NoteConnectionsProps {
  connections: NoteConnection[];
  isLoading: boolean;
  onConnectionClick: (connectionId: string) => void;
}

export function NoteConnections({
  connections,
  isLoading,
  onConnectionClick,
}: NoteConnectionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <LinkIcon className="h-4 w-4" />
          <span>Connected Notes</span>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Finding connections...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <LinkIcon className="h-4 w-4" />
        <span>Connected Notes</span>
      </div>
      {connections.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            No connected notes found
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {connections.map((connection) => (
            <button
              key={connection.id}
              onClick={() => onConnectionClick(connection.id)}
              className="w-full text-left rounded-lg border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-xs text-muted-foreground line-clamp-2 flex-1 min-w-0">
                  <MarkdownRenderer content={connection.content} />
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {Math.round(connection.similarity * 100)}% match
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {connection.category && (
                  <Badge variant="outline" className="text-[10px] h-5">
                    {connection.category}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {formatShortDate(connection.created_at)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
