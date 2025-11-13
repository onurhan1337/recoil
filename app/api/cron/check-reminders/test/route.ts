import { NextRequest } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { errorResponse, successResponse } from "@/lib/api/utils";
import type { Database } from "@/types/database";

// This is a TEST-ONLY endpoint for local development
// Remove or disable in production
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return errorResponse("Not available in production", 404);
  }

  try {
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // TIMEZONE HANDLING: Same logic as production cron
    // Both reminder_date (from DB) and new Date().toISOString() are in UTC
    // This comparison is timezone-agnostic and works correctly for all users
    const { data: dueReminders, error: remindersError } = await supabase
      .from("reminders")
      .select(
        `
        *,
        notes (
          id,
          title,
          content,
          user_id
        )
      `
      )
      .eq("sent", false)
      .lte("reminder_date", new Date().toISOString());

    if (remindersError) {
      console.error("Error fetching due reminders:", remindersError);
      throw remindersError;
    }

    if (!dueReminders || dueReminders.length === 0) {
      return successResponse({
        message: "No due reminders found",
        processed: 0,
      });
    }

    const results = {
      processed: 0,
      notificationsCreated: 0,
      errors: [] as string[],
    };

    for (const reminder of dueReminders) {
      try {
        const note = Array.isArray(reminder.notes)
          ? reminder.notes[0]
          : reminder.notes;

        if (!note) {
          results.errors.push(`Note not found for reminder ${reminder.id}`);
          continue;
        }

        if (reminder.in_app_enabled) {
          const { error } = await supabase.from("notifications").insert({
            user_id: reminder.user_id,
            reminder_id: reminder.id,
            note_id: note.id,
            title: "Note Reminder",
            message: `Reminder for: ${note.title || "Untitled Note"}`,
          });

          if (error) {
            console.error(
              `Failed to create notification for reminder ${reminder.id}:`,
              error
            );
            results.errors.push(
              `Notification failed for reminder ${reminder.id}: ${error.message}`
            );
          } else {
            results.notificationsCreated++;
          }
        }

        await supabase
          .from("reminders")
          .update({ sent: true })
          .eq("id", reminder.id);

        results.processed++;
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        results.errors.push(
          `Processing failed for reminder ${reminder.id}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    return successResponse({
      message: "Reminders processed successfully",
      ...results,
    });
  } catch (error) {
    console.error("Error in check-reminders test:", error);
    return errorResponse("Internal server error");
  }
}
