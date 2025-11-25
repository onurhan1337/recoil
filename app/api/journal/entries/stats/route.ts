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

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const now = new UTCDate();
    const today = startOfDay(now);
    const yearAgo = subDays(today, 365);

    const { data: entries, error } = await supabase
      .from("journal_entries")
      .select("created_at")
      .eq("user_id", user.id)
      .gte("created_at", yearAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      return errorResponse("Failed to fetch journal statistics", 500);
    }

    if (!entries || entries.length === 0) {
      return successResponse({
        streak: 0,
      });
    }

    const datesWithEntries = new Set<string>();
    entries.forEach((entry) => {
      const entryDate = new UTCDate(entry.created_at);
      const dateKey = format(startOfDay(entryDate), "yyyy-MM-dd");
      datesWithEntries.add(dateKey);
    });

    let streak = 0;
    let currentDate = today;
    while (true) {
      const dateKey = format(currentDate, "yyyy-MM-dd");
      if (datesWithEntries.has(dateKey)) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    return successResponse({
      streak,
    });
  } catch (error) {
    return errorResponse("Failed to fetch journal statistics", 500);
  }
}
