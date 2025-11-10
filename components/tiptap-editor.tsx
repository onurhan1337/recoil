"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useMemo } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

marked.setOptions({
  breaks: true,
  gfm: true,
});

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
}: TiptapEditorProps) {
  const contentRef = useRef(content);
  const isInternalUpdateRef = useRef(false);

  const initialHtml = useMemo(() => {
    if (!content) return "";
    const parseResult = marked.parse(content);
    return typeof parseResult === "string" ? parseResult : "";
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialHtml,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (isInternalUpdateRef.current) return;
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      contentRef.current = markdown;
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-6 py-4 font-lora",
      },
    },
  });

  if (
    editor &&
    content !== contentRef.current &&
    !isInternalUpdateRef.current
  ) {
    isInternalUpdateRef.current = true;
    contentRef.current = content;
    const parseResult = marked.parse(content);
    const parsePromise =
      typeof parseResult === "string"
        ? Promise.resolve(parseResult)
        : parseResult;

    parsePromise.then((html: string) => {
      if (editor && !editor.isDestroyed) {
        editor.commands.setContent(String(html) || "");
      }
      isInternalUpdateRef.current = false;
    });
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-md border overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/30">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1.5 rounded-sm hover:bg-muted transition-colors",
            editor.isActive("bold") && "bg-muted"
          )}
          type="button"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1.5 rounded-sm hover:bg-muted transition-colors",
            editor.isActive("italic") && "bg-muted"
          )}
          type="button"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="w-px h-4 bg-border mx-0.5" />
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={cn(
            "p-1.5 rounded-sm hover:bg-muted transition-colors",
            editor.isActive("heading", { level: 2 }) && "bg-muted"
          )}
          type="button"
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-1.5 rounded-sm hover:bg-muted transition-colors",
            editor.isActive("bulletList") && "bg-muted"
          )}
          type="button"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-1.5 rounded-sm hover:bg-muted transition-colors",
            editor.isActive("orderedList") && "bg-muted"
          )}
          type="button"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "p-1.5 rounded-sm hover:bg-muted transition-colors",
            editor.isActive("blockquote") && "bg-muted"
          )}
          type="button"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <div className="w-px h-4 bg-border mx-0.5" />
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-sm hover:bg-muted transition-colors"
          type="button"
          title="Divider"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
