import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reminderSchema } from "@/lib/validations";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { validateRequest } from "@/lib/validation-utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = validateRequest(reminderSchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { note_id, reminder_date, email_enabled, in_app_enabled } =
      validation.data;

    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("id, user_id")
      .eq("id", note_id)
      .single();

    if (noteError || !note) {
      return errorResponse("Note not found", 404);
    }

    if (note.user_id !== user.id) {
      return errorResponse("Forbidden", 403);
    }

    const { data: reminder, error: reminderError } = await supabase
      .from("reminders")
      .insert({
        user_id: user.id,
        note_id,
        reminder_date,
        email_enabled,
        in_app_enabled,
      })
      .select()
      .single();

    if (reminderError) {
      throw reminderError;
    }

    return successResponse({
      reminder,
      message: "Reminder created successfully",
    });
  } catch (error) {
    console.error("Error creating reminder:", error);
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

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("note_id");

    let query = supabase
      .from("reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("reminder_date", { ascending: true });

    if (noteId) {
      query = query.eq("note_id", noteId);
    }

    const { data: reminders, error: remindersError } = await query;

    if (remindersError) {
      throw remindersError;
    }

    return successResponse({
      reminders,
    });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return errorResponse("Internal server error");
  }
}
