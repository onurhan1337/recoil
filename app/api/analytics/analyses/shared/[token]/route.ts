import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, successResponse } from "@/lib/api/utils";
import { uuidSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const tokenValidation = uuidSchema.safeParse(token);

    if (!tokenValidation.success) {
      return errorResponse("Invalid token format", 400);
    }

    const supabase = await createClient();

    const { data: analysis, error } = await supabase
      .from("analyses")
      .select("insights, note_count, created_at, start_date, end_date")
      .eq("share_token", token)
      .eq("is_public", true)
      .single();

    if (error || !analysis) {
      return errorResponse("Analysis not found", 404);
    }

    return successResponse(analysis);
  } catch (error) {
    console.error("Error fetching shared analysis:", error);
    return errorResponse("Internal server error");
  }
}
