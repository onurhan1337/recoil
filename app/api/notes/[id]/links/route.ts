import {
  authenticateUser,
  errorResponse,
  successResponse,
  isProPlan,
} from "@/lib/api/utils";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return errorResponse("Pro plan required", 403);
    }

    const { id: sourceNoteId } = await params;

    const body = await request.json();
    const { targetNoteId } = body;

    if (!targetNoteId) {
      return errorResponse("Target note ID is required", 400);
    }

    const { data: sourceNote, error: sourceError } = await supabase
      .from("notes")
      .select("id")
      .eq("id", sourceNoteId)
      .eq("user_id", user.id)
      .single();

    if (sourceError || !sourceNote) {
      return errorResponse("Source note not found", 404);
    }

    const { data: targetNote, error: targetError } = await supabase
      .from("notes")
      .select("id")
      .eq("id", targetNoteId)
      .eq("user_id", user.id)
      .single();

    if (targetError || !targetNote) {
      return errorResponse("Target note not found", 404);
    }

    const { data: link, error: linkError } = await supabase
      .from("note_links")
      .insert({
        user_id: user.id,
        source_note_id: sourceNoteId,
        target_note_id: targetNoteId,
        link_type: "manual",
      })
      .select()
      .single();

    if (linkError) {
      if (linkError.code === "23505") {
        return NextResponse.json(
          { error: "Link already exists" },
          { status: 409 }
        );
      }
      return errorResponse("Failed to create link", 500);
    }

    return successResponse({ data: link });
  } catch (error) {
    return errorResponse("Internal server error", 500);
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return errorResponse("Pro plan required", 403);
    }

    const { id: noteId } = await params;

    const { data: links, error } = await supabase
      .from("note_links")
      .select(
        `
        id,
        source_note_id,
        target_note_id,
        link_type,
        created_at,
        source:notes!note_links_source_note_id_fkey(id, content, category, label, created_at),
        target:notes!note_links_target_note_id_fkey(id, content, category, label, created_at)
      `
      )
      .eq("user_id", user.id)
      .or(`source_note_id.eq.${noteId},target_note_id.eq.${noteId}`);

    if (error) {
      return errorResponse("Failed to fetch links", 500);
    }

    const connectedNotes = links.map((link) => {
      const isSource = link.source_note_id === noteId;
      const connectedNote = isSource ? link.target : link.source;

      return {
        linkId: link.id,
        linkType: link.link_type,
        direction: isSource ? "outgoing" : "incoming",
        createdAt: link.created_at,
        note: {
          id: connectedNote.id,
          content: connectedNote.content,
          category: connectedNote.category,
          label: connectedNote.label,
          createdAt: connectedNote.created_at,
        },
      };
    });

    return successResponse({ data: connectedNotes });
  } catch (error) {
    return errorResponse("Internal server error", 500);
  }
}
