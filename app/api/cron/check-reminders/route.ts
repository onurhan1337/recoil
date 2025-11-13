import { NextRequest } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { errorResponse, successResponse } from "@/lib/api/utils";
import { sendReminderEmail } from "@/lib/email";
import type { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET is not configured");
      return errorResponse("Cron secret not configured", 500);
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("Unauthorized", 401);
    }

    // Use service role key to bypass RLS for cron job
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
      emailsSent: 0,
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

        const promises: Promise<unknown>[] = [];

        if (reminder.email_enabled) {
          const { data: userData } = await supabase.auth.admin.getUserById(
            reminder.user_id
          );

          if (userData?.user?.email) {
            promises.push(
              sendReminderEmail({
                userEmail: userData.user.email,
                note: {
                  id: note.id,
                  title: note.title,
                  content: note.content,
                  user_id: note.user_id,
                  created_at: new Date().toISOString(),
                },
                reminderDate: reminder.reminder_date,
              })
                .then(() => {
                  results.emailsSent++;
                })
                .catch((error) => {
                  console.error(
                    `Failed to send email for reminder ${reminder.id}:`,
                    error
                  );
                  results.errors.push(
                    `Email failed for reminder ${reminder.id}: ${error.message}`
                  );
                })
            );
          }
        }

        if (reminder.in_app_enabled) {
          const notificationPromise = (async () => {
            try {
              const { error } = await supabase.from("notifications").insert({
                user_id: reminder.user_id,
                reminder_id: reminder.id,
                note_id: note.id,
                title: "Note Reminder",
                message: `Reminder for: ${note.title || "Untitled Note"}`,
              });

              if (error) throw error;
              results.notificationsCreated++;
            } catch (error) {
              console.error(
                `Failed to create notification for reminder ${reminder.id}:`,
                error
              );
              results.errors.push(
                `Notification failed for reminder ${reminder.id}: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              );
            }
          })();

          promises.push(notificationPromise);
        }

        await Promise.all(promises);

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
    console.error("Error in check-reminders cron job:", error);
    return errorResponse("Internal server error");
  }
}
