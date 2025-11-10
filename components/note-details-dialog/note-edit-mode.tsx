import { Info, Loader2, Save, X, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TiptapEditor } from "@/components/tiptap-editor";
import { TagInput } from "@/components/tag-input";
import type { Note, NoteCostEstimate } from "@/lib/api/types";

interface NoteEditModeProps {
  note: Note;
  editedContent: string;
  editedTitle: string;
  editedTags: string[];
  isPreview: boolean;
  costEstimate?: NoteCostEstimate;
  isPending: boolean;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onTagsChange: (tags: string[]) => void;
  onPreviewToggle: (preview: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function NoteEditMode({
  note,
  editedContent,
  editedTitle,
  editedTags,
  isPreview,
  costEstimate,
  isPending,
  onContentChange,
  onTitleChange,
  onTagsChange,
  onPreviewToggle,
  onCancel,
  onSave,
}: NoteEditModeProps) {
  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Title
          </label>
          <Input
            value={editedTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter note title..."
            className="font-medium"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Edit Content
            </label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isPreview ? "ghost" : "secondary"}
                size="sm"
                onClick={() => onPreviewToggle(false)}
                className="h-8"
              >
                <Edit3 className="h-3 w-3 mr-1.5" />
                Edit
              </Button>
              <Button
                type="button"
                variant={isPreview ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onPreviewToggle(true)}
                disabled={!editedContent.trim()}
                className="h-8"
              >
                <Eye className="h-3 w-3 mr-1.5" />
                Preview
              </Button>
            </div>
          </div>

          {isPreview ? (
            <div className="min-h-[200px] rounded-lg border bg-muted/30 p-4">
              {editedContent.trim() ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownRenderer content={editedContent} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Nothing to preview yet. Write some content first.
                </p>
              )}
            </div>
          ) : (
            <TiptapEditor
              content={editedContent}
              onChange={onContentChange}
              placeholder="Edit your note..."
            />
          )}
        </div>

        <TagInput value={editedTags} onChange={onTagsChange} />

        {costEstimate &&
          editedContent.trim() &&
          editedContent !== note.content && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Info className="h-3 w-3" />
              <span>
                Update cost:{" "}
                <strong className="text-foreground">
                  {costEstimate.estimated_cost}
                </strong>{" "}
                credits
                {costEstimate.estimated_chunks > 1 && (
                  <span className="ml-1 text-[10px]">
                    ({costEstimate.base_cost} base
                    {costEstimate.embedding_cost > 0 && (
                      <> + {costEstimate.embedding_cost} embedding</>
                    )}
                    {costEstimate.embedding_cost === 0 && (
                      <> • {costEstimate.estimated_chunks} chunks (free)</>
                    )}
                    )
                  </span>
                )}
              </span>
            </div>
          )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={isPending || !editedContent.trim()}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Updating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Update
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
