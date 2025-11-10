import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { TemplateUpdateInput, uuidSchema } from "@/lib/validations";
import { validateParams, validateRequest } from "@/lib/validation-utils";
import { templateUpdateSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const idValidation = validateParams(uuidSchema, id, "template ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const body = await request.json();
    const validation = validateRequest<TemplateUpdateInput>(
      templateUpdateSchema,
      body
    );

    if (!validation.success) {
      return validation.response;
    }

    const { data: existingTemplate, error: fetchError } = await supabase
      .from("note_templates")
      .select("user_id")
      .eq("id", idValidation.data)
      .single();

    if (fetchError || !existingTemplate) {
      return errorResponse("Template not found", 404);
    }

    if (existingTemplate.user_id !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const updateData = Object.entries(validation.data).reduce(
      (acc, [key, value]) => {
        if (value === undefined) return acc;

        if (key === "tags") {
          acc[key] = Array.isArray(value) && value.length > 0 ? value : null;
        } else if (typeof value === "string") {
          acc[key] = value || null;
        } else {
          acc[key] = value;
        }

        return acc;
      },
      {} as Record<string, unknown>
    );

    const { data: updatedTemplate, error: updateError } = await supabase
      .from("note_templates")
      .update(updateData)
      .eq("id", idValidation.data)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return successResponse({ template: updatedTemplate });
  } catch (error) {
    console.error("Error updating template:", error);
    return errorResponse("Internal server error");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const idValidation = validateParams(uuidSchema, id, "template ID");

    if (!idValidation.success) {
      return idValidation.response;
    }

    const { data: existingTemplate, error: fetchError } = await supabase
      .from("note_templates")
      .select("user_id")
      .eq("id", idValidation.data)
      .single();

    if (fetchError || !existingTemplate) {
      return errorResponse("Template not found", 404);
    }

    if (existingTemplate.user_id !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const { error: deleteError } = await supabase
      .from("note_templates")
      .delete()
      .eq("id", idValidation.data);

    if (deleteError) {
      throw deleteError;
    }

    return successResponse({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return errorResponse("Internal server error");
  }
}
