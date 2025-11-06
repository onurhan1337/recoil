import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errorResponse, successResponse, authenticateUser } from "@/lib/api/utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return errorResponse("Rating must be between 1 and 5", 400);
    }

    if (comment && typeof comment !== "string") {
      return errorResponse("Comment must be a string", 400);
    }

    if (comment && comment.length > 1000) {
      return errorResponse("Comment must be 1000 characters or less", 400);
    }

    const { data: feedback, error: feedbackError } = await supabase
      .from("feedback")
      .insert({
        user_id: user.id,
        rating,
        comment: comment?.trim() || null,
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
