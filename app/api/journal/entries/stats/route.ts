import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  successResponse,
  authenticateUser,
} from "@/lib/api/utils";
import { UTCDate } from "@date-fns/utc";
import { startOfDay, subDays, format } from "date-fns";

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await authenticateUser(supabase);
    if (!user) return errorResponse("Unauthorized", 401);

    const now = new UTCDate();
    const today = startOfDay(now);
    const yearAgo = subDays(today, 365);

    const { data: entries, error } = await supabase
      .from("journal_entries")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", yearAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) return errorResponse("Failed to fetch journal statistics", 500);
    if (!entries || entries.length === 0) return successResponse({ streak: 0 });

    const datesWithEntries = new Set(
      entries.map((entry) => {
        const entryDate = new UTCDate(entry.created_at);
        return format(startOfDay(entryDate), "yyyy-MM-dd");
      })
    );

    const todayKey = format(today, "yyyy-MM-dd");
    if (!datesWithEntries.has(todayKey)) return successResponse({ streak: 0 });

    let streak = 1;
    let currentDate = subDays(today, 1);
    while (datesWithEntries.has(format(currentDate, "yyyy-MM-dd"))) {
      streak++;
      currentDate = subDays(currentDate, 1);
    }

    return successResponse({ streak });
  } catch (error) {
    return errorResponse("Failed to fetch journal statistics", 500);
  }
}
