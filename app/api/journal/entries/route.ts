import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { validateRequest } from "@/lib/validation-utils";
import { entryDateSchema, journalEntrySchema } from "@/lib/validations";
import { UTCDate } from "@date-fns/utc";
import { parseISO, startOfDay, endOfDay } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validation = validateRequest(journalEntrySchema, body);

    if (!validation.success) {
      return validation.response;
    }

    const { content } = validation.data;

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const { data: entry, error: insertError } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        content,
        word_count: wordCount,
      })
      .select()
      .single();

    if (insertError) {
      return errorResponse("Failed to create journal entry", 500);
    }

    return successResponse({
      success: true,
      entry,
    });
  } catch (error) {
    return errorResponse("Failed to create journal entry", 500);
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
    const dateParam = searchParams.get("date");

    let query = supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dateParam) {
      if (entryDateSchema.safeParse({ date: dateParam }).success) {
        const parsedDate = parseISO(dateParam + "T00:00:00.000Z");
        const date = new UTCDate(parsedDate);

        if (!isNaN(date.getTime())) {
          const start = startOfDay(date).toISOString();
          const end = endOfDay(date).toISOString();

          query = query
            .gte("created_at", start)
            .lte("created_at", end)
            .limit(30);
        }
      }
    }

    const { data: entries, error } = await query;

    if (error) {
      return errorResponse("Failed to fetch journal entries", 500);
    }

    return successResponse({
      entries: entries || [],
    });
  } catch (error) {
    return errorResponse("Failed to fetch journal entries", 500);
  }
}
