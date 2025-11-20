import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  isProPlan,
} from "@/lib/api/utils";

interface PositionUpdate {
  noteId: string;
  position: {
    x: number;
    y: number;
  };
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const updates = body.positions as PositionUpdate[];

    if (!Array.isArray(updates) || updates.length === 0) {
      return errorResponse("Invalid positions data", 400);
    }

    for (const update of updates) {
      if (!update.noteId || !update.position ||
          typeof update.position.x !== 'number' ||
          typeof update.position.y !== 'number') {
        return errorResponse("Invalid position format", 400);
      }
    }

    const updatePromises = updates.map((update) =>
      supabase
        .from("notes")
        .update({ canvas_position: update.position })
        .eq("id", update.noteId)
        .eq("user_id", user.id)
    );

    const results = await Promise.all(updatePromises);

    const hasError = results.some((result) => result.error);
    if (hasError) {
      console.error("Error updating positions:", results);
      return errorResponse("Failed to update positions", 500);
    }

    return successResponse({ updated: updates.length });
  } catch (error) {
    console.error("Error in canvas positions API:", error);
    return errorResponse("Internal server error", 500);
  }
}
