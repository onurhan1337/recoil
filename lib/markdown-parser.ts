import { BulkNoteInput } from "./validations";

export function parseMarkdownToNotes(markdown: string): BulkNoteInput[] {
  const notes: BulkNoteInput[] = [];

  const h1Sections = markdown.split(/^# /gm).filter(Boolean);

  if (h1Sections.length === 0) {
    return [{
      content: markdown.trim(),
      title: undefined,
      tags: [],
    }];
  }

  for (const section of h1Sections) {
    const lines = section.split("\n");
    const title = lines[0].trim();
    const remainingContent = lines.slice(1).join("\n").trim();

    if (!remainingContent) {
      continue;
    }

    const tags: string[] = [];
    let content = remainingContent;

    const tagMatches = remainingContent.match(/(?:^|\s)#(\w+)/g);
    if (tagMatches) {
      tagMatches.forEach((match) => {
        const tag = match.trim().substring(1);
        if (tag && !tags.includes(tag)) {
          tags.push(tag);
        }
      });
      content = remainingContent.replace(/(?:^|\s)#(\w+)/g, "").trim();
    }

    if (content) {
      notes.push({
        content: content.trim(),
        title: title || undefined,
        tags: tags.length > 0 ? tags : [],
      });
    }
  }

  if (notes.length === 0) {
    return [{
      content: markdown.trim(),
      title: undefined,
      tags: [],
    }];
  }

  return notes;
}

export function validateMarkdownSize(markdown: string): {
  isValid: boolean;
  error?: string;
} {
  if (markdown.length > 100000) {
    return {
      isValid: false,
      error: "Markdown file is too large. Maximum size is 100,000 characters.",
    };
  }

  const notes = parseMarkdownToNotes(markdown);

  if (notes.length > 50) {
    return {
      isValid: false,
      error: `Too many notes detected (${notes.length}). Maximum is 50 notes per import.`,
    };
  }

  for (let i = 0; i < notes.length; i++) {
    if (notes[i].content.length > 10000) {
      return {
        isValid: false,
        error: `Note ${i + 1} is too large (${notes[i].content.length} characters). Maximum is 10,000 characters per note.`,
      };
    }
  }

  return { isValid: true };
}
