import { useState } from "react";
import { toast } from "sonner";
import { downloadFile, getDateString } from "@/lib/utils/download";
import type { Note } from "../types";

interface ExportData {
  exported_at: string;
  user_email?: string;
  note_count: number;
  notes: Array<{
    id: string;
    content: string;
    label: string | null;
    category: string | null;
    tags: string[] | null;
    created_at: string;
  }>;
}

function formatNoteAsMarkdown(note: Note): string {
  const parts = [`## ${note.label || "Untitled Note"}`, ""];

  if (note.category) {
    parts.push(`**Category:** ${note.category}`);
  }
  if (note.tags?.length) {
    parts.push(`**Tags:** ${note.tags.join(", ")}`);
  }
  if (note.category || note.tags?.length) {
    parts.push("");
  }

  parts.push(
    note.content,
    "",
    `*Created: ${new Date(note.created_at).toLocaleString()}*`,
    "",
    "---",
    ""
  );

  return parts.join("\n");
}

export function useExportNotes(notes: Note[], userEmail?: string) {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsJSON = () => {
    try {
      setIsExporting(true);

      const exportData: ExportData = {
        exported_at: new Date().toISOString(),
        user_email: userEmail,
        note_count: notes.length,
        notes: notes.map((note) => ({
          id: note.id,
          content: note.content,
          label: note.label || null,
          category: note.category || null,
          tags: note.tags || null,
          created_at: note.created_at,
        })),
      };

      downloadFile(
        JSON.stringify(exportData, null, 2),
        `recoil-notes-${getDateString()}.json`,
        "application/json"
      );

      toast.success(`Exported ${notes.length} notes as JSON`);
    } catch (error) {
      toast.error("Failed to export notes");
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsMarkdown = () => {
    try {
      setIsExporting(true);

      const header = `# Recoil Notes Export\n\nExported on: ${new Date().toLocaleString()}\nTotal notes: ${
        notes.length
      }\n\n---\n\n`;
      const content = header + notes.map(formatNoteAsMarkdown).join("\n");

      downloadFile(
        content,
        `recoil-notes-${getDateString()}.md`,
        "text/markdown"
      );

      toast.success(`Exported ${notes.length} notes as Markdown`);
    } catch (error) {
      toast.error("Failed to export notes");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportAsJSON,
    exportAsMarkdown,
  };
}
