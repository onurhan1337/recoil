import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  isProPlan,
} from "@/lib/api/utils";
import type { CanvasData } from "@/lib/canvas/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: usage } = await supabase
      .from("usage")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    if (!isProPlan(usage?.plan)) {
      return errorResponse("Pro plan required for Canvas feature", 403);
    }

    const { searchParams } = new URL(request.url);
    const includeSemanticLinks = searchParams.get("includeSemanticLinks") === "true";

    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (notesError) {
      console.error("Error fetching notes:", notesError);
      return errorResponse("Failed to fetch notes", 500);
    }

    let linkTypes = ["manual"];
    if (includeSemanticLinks) {
      linkTypes.push("semantic");
    }

    const { data: links, error: linksError } = await supabase
      .from("note_links")
      .select("id, source_note_id, target_note_id, link_type, created_at")
      .eq("user_id", user.id)
      .in("link_type", linkTypes);

    if (linksError) {
      console.error("Error fetching links:", linksError);
      return errorResponse("Failed to fetch links", 500);
    }

    const canvasData: CanvasData = {
      notes: notes.map((note) => ({
        id: note.id,
        content: note.content,
        title: note.title,
        label: note.label,
        category: note.category,
        tags: note.tags,
        related_notes: note.related_notes,
        created_at: note.created_at,
        user_id: note.user_id,
        pinned: note.pinned,
        favorite: note.favorite,
        archived: note.archived,
        position: (note.canvas_position as { x: number; y: number } | null) || undefined,
      })),
      links: links.map((link) => ({
        id: link.id,
        source_note_id: link.source_note_id,
        target_note_id: link.target_note_id,
        link_type: link.link_type as "manual" | "semantic" | "collection" | "tag",
        created_at: link.created_at,
      })),
    };

    return successResponse(canvasData);
  } catch (error) {
    console.error("Error in canvas API:", error);
    return errorResponse("Internal server error", 500);
  }
}
