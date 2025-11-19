import {
  authenticateUser,
  errorResponse,
  successResponse,
  isProPlan,
} from "@/lib/api/utils";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
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

    const { id: sourceNoteId, linkId } = await params;

    const { error } = await supabase
      .from("note_links")
      .delete()
      .eq("id", linkId)
      .eq("user_id", user.id)
      .eq("source_note_id", sourceNoteId);

    if (error) {
      return errorResponse("Failed to delete link", 500);
    }

    return successResponse({ message: "Link deleted successfully" });
  } catch (error) {
    return errorResponse("Internal server error", 500);
  }
}
