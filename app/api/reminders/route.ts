import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reminderSchema } from "@/lib/validations";
import {
  errorResponse,
  successResponse,
  authenticateUser,
  isProPlan,
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

    // Check user plan for email reminders - Pro only feature
    const { data: usage } = await supabase
      .from("usage")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    const isPro = isProPlan(usage?.plan);

    const finalEmailEnabled = isPro ? email_enabled : false;

    // TIMEZONE HANDLING: reminder_date is already in UTC from frontend
    // It's validated by reminderSchema and stored directly as timestamptz in Supabase
    const { data: reminder, error: reminderError } = await supabase
      .from("reminders")
      .insert({
        user_id: user.id,
        note_id,
        reminder_date, // UTC ISO string, e.g., "2024-11-13T18:15:00.000Z"
        email_enabled: finalEmailEnabled,
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

    // TIMEZONE HANDLING: reminder_date is stored as UTC in database
    // When fetched, it's returned as ISO string which frontend converts to local time
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
