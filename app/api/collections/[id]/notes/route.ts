import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { validateRequest } from "@/lib/validation-utils";
import {
  AddNoteInput,
  addNoteSchema,
  removeNoteSchema,
  RemoveNoteInput,
} from "@/lib/validations";

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

    const { id: collectionId } = await params;
    const body = await request.json();
    const validation = validateRequest(addNoteSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { noteId }: AddNoteInput = validation.data;

    const { data: collection } = await supabase
      .from("collections")
      .select("id")
      .eq("id", collectionId)
      .eq("user_id", user.id)
      .single();

    if (!collection) {
      return errorResponse("Collection not found", 404);
    }

    const { data: note } = await supabase
      .from("notes")
      .select("id")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (!note) {
      return errorResponse("Note not found", 404);
    }

    const { error } = await supabase.from("note_collections").insert({
      note_id: noteId,
      collection_id: collectionId,
    });

    if (error) {
      if (error.code === "23505") {
        return errorResponse("Note already in collection", 409);
      }
      throw error;
    }

    return successResponse({ message: "Note added to collection" });
  } catch (error) {
    console.error("Error adding note to collection:", error);
    return errorResponse("Internal server error");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id: collectionId } = await params;
    const body = await request.json();
    const validation = validateRequest(removeNoteSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { noteId }: RemoveNoteInput = validation.data;

    const { data: collection } = await supabase
      .from("collections")
      .select("id")
      .eq("id", collectionId)
      .eq("user_id", user.id)
      .single();

    if (!collection) {
      return errorResponse("Collection not found", 404);
    }

    const { error } = await supabase
      .from("note_collections")
      .delete()
      .eq("note_id", noteId)
      .eq("collection_id", collectionId);

    if (error) {
      throw error;
    }

    return successResponse({ message: "Note removed from collection" });
  } catch (error) {
    console.error("Error removing note from collection:", error);
    return errorResponse("Internal server error");
  }
}
