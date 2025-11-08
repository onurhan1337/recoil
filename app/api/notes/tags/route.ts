import { createClient } from "@/lib/supabase/server";
import { errorResponse, successResponse, authenticateUser } from "@/lib/api/utils";

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: notes, error } = await supabase
      .from("notes")
      .select("tags")
      .eq("user_id", user.id)
      .not("tags", "is", null);

    if (error) {
      throw error;
    }

    const tagsSet = new Set<string>();
    notes?.forEach((note) => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach((tag) => {
          if (tag && typeof tag === "string") {
            tagsSet.add(tag);
          }
        });
      }
    });

    const tags = Array.from(tagsSet).sort();

    return successResponse({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return errorResponse("Internal server error");
  }
}
