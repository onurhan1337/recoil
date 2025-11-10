import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  getUserPlan,
} from "@/lib/api/utils";
import { validateRequest } from "@/lib/validation-utils";
import { TemplateInput, templateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: templates, error } = await supabase
      .from("note_templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return successResponse({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
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

    const body = await request.json();
    const validation = validateRequest<TemplateInput>(templateSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { name, description, content, category, tags } = validation.data;

    const { data: usage } = await supabase
      .from("usage")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    const userPlan = getUserPlan(usage?.plan);

    if (userPlan === "free") {
      const { count: templateCount } = await supabase
        .from("note_templates")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (templateCount !== null && templateCount >= 1) {
        return errorResponse(
          "Free plan allows only 1 custom template. Upgrade to Pro for unlimited templates.",
          403
        );
      }
    }

    const { data: template, error: templateError } = await supabase
      .from("note_templates")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        content,
        category: category || null,
        tags: tags && tags.length > 0 ? tags : null,
      })
      .select()
      .single();

    if (templateError) {
      throw templateError;
    }

    return successResponse({ template });
  } catch (error) {
    console.error("Error creating template:", error);
    return errorResponse("Internal server error");
  }
}
