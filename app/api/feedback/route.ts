import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, successResponse, authenticateUser } from "@/lib/api/utils";
import { feedbackSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = feedbackSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues[0]?.message || "Invalid request",
        400
      );
    }

    const { rating, comment } = validation.data;

    const { data: feedback, error: feedbackError } = await supabase
      .from("feedback")
      .insert({
        user_id: user.id,
        rating,
        comment: comment || null,
      })
      .select()
      .single();

    if (feedbackError) {
      throw feedbackError;
    }

    return successResponse({
      feedback,
      message: "Thank you for your feedback!",
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return errorResponse("Internal server error");
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: feedback, error } = await supabase
      .from("feedback")
      .select("id, rating, comment, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return successResponse({ feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return errorResponse("Internal server error");
  }
}
