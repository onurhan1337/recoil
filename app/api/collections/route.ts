import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  withRateLimit,
} from "@/lib/api/utils";
import { validateRequest } from "@/lib/validation-utils";

const collectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: collections, error } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return successResponse({ collections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return errorResponse("Internal server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    return withRateLimit(
      request,
      "/api/collections",
      "POST",
      async () => {
        const body = await request.json();
        const validation = validateRequest(collectionSchema, body);

        if (!validation.success) {
          return validation.response;
        }

        const { name, description, color } = validation.data;

        const { data: collection, error } = await supabase
          .from("collections")
          .insert({
            user_id: user.id,
            name,
            description: description || null,
            color: color || null,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return successResponse({ collection });
      },
      supabase,
      user.id
    );
  } catch (error) {
    console.error("Error creating collection:", error);
    return errorResponse("Internal server error");
  }
}
