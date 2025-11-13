import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, successResponse, authenticateUser } from "@/lib/api/utils";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread_only") === "true";

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const [notificationsResult, unreadCountResult] = await Promise.all([
      query,
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false),
    ]);

    if (notificationsResult.error) {
      throw notificationsResult.error;
    }

    return successResponse({
      notifications: notificationsResult.data,
      unreadCount: unreadCountResult.count || 0,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return errorResponse("Internal server error");
  }
}
