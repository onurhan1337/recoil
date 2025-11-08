import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authenticateUser, errorResponse, successResponse } from "@/lib/api/utils";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: analyses, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return successResponse(analyses);
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return errorResponse("Internal server error");
  }
}
