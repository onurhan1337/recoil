import { Note } from "@/lib/api/types";

interface SendReminderEmailParams {
  userEmail: string;
  note: Note;
  reminderDate: string;
}

export async function sendReminderEmail({
  userEmail,
  note,
  reminderDate,
}: SendReminderEmailParams): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!resendApiKey) {
    console.error("RESEND_API_KEY is not configured");
    throw new Error("Email service not configured");
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendApiKey);

    const noteTitle = note.title || "Untitled Note";
    const noteContent =
      note.content.length > 200
        ? note.content.substring(0, 200) + "..."
        : note.content;

    const formattedDate = new Date(reminderDate).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    await resend.emails.send({
      from: "Recoil <reminders@recoil.app>",
      to: userEmail,
      subject: `Reminder: ${noteTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Note Reminder</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Note Reminder</h1>
            </div>

            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">You set a reminder for:</p>

              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 20px;">
                <h2 style="margin: 0 0 10px 0; color: #333; font-size: 20px;">${noteTitle}</h2>
                <p style="margin: 0; color: #666; white-space: pre-wrap;">${noteContent}</p>
              </div>

              <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                <strong>Reminder Date:</strong> ${formattedDate}
              </p>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${siteUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Note</a>
              </div>
            </div>

            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>This is an automated reminder from Recoil</p>
            </div>
          </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send reminder email:", error);
    throw error;
  }
}
