interface Note {
  created_at: string;
  category?: string | null;
}

interface AnalyticsData {
  notesOverTime: Array<{
    date: string;
    notes: number;
    categories: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
    fill?: string;
  }>;
  topCategories: Array<{
    category: string;
    notes: number;
  }>;
  dayOfWeekData: Array<{
    day: string;
    notes: number;
  }>;
  radarData: Array<{
    category: string;
    value: number;
    fullMark: number;
  }>;
  metrics: {
    totalNotes: number;
    previousTotal: number;
    growthRate: number;
    avgNotesPerDay: number;
    mostActiveDay: string;
  };
}

export function calculateAnalyticsData(
  notes: Note[],
  timeRange: "7d" | "30d" | "90d"
): AnalyticsData | null {
  if (!notes.length) return null;

  const now = new Date();
  const referenceDate = new Date(now);
  referenceDate.setHours(23, 59, 59, 999);

  let daysToSubtract = 90;
  if (timeRange === "30d") {
    daysToSubtract = 30;
  } else if (timeRange === "7d") {
    daysToSubtract = 7;
  }

  const earliestNoteDate = notes.reduce((earliest, note) => {
    const noteDate = new Date(note.created_at);
    return noteDate < earliest ? noteDate : earliest;
  }, new Date(notes[0].created_at));

  const calculatedStartDate = new Date(referenceDate);
  calculatedStartDate.setDate(calculatedStartDate.getDate() - daysToSubtract);
  calculatedStartDate.setHours(0, 0, 0, 0);

  const startDate = new Date(
    calculatedStartDate > earliestNoteDate
      ? calculatedStartDate
      : earliestNoteDate
  );
  startDate.setHours(0, 0, 0, 0);

  const previousPeriodStart = new Date(startDate);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - daysToSubtract);

  const recentNotes = notes.filter((note) => {
    const noteDate = new Date(note.created_at);
    return noteDate >= startDate && noteDate <= referenceDate;
  });

  const previousPeriodNotes = notes.filter((note) => {
    const noteDate = new Date(note.created_at);
    return noteDate >= previousPeriodStart && noteDate < startDate;
  });

  const notesByDate = recentNotes.reduce((acc, note) => {
    const date = new Date(note.created_at);
    const dateKey = date.toISOString().split("T")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = { notes: 0, categories: new Set<string>() };
    }
    acc[dateKey].notes += 1;
    if (note.category) {
      acc[dateKey].categories.add(note.category);
    }
    return acc;
  }, {} as Record<string, { notes: number; categories: Set<string> }>);

  const notesOverTime: Array<{
    date: string;
    notes: number;
    categories: number;
  }> = [];
  const currentDate = new Date(startDate);

  while (currentDate <= referenceDate) {
    const dateKey = currentDate.toISOString().split("T")[0];
    const data = notesByDate[dateKey] || {
      notes: 0,
      categories: new Set<string>(),
    };
    notesOverTime.push({
      date: dateKey,
      notes: data.notes,
      categories: data.categories.size,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const categoryCount = recentNotes.reduce((acc, note) => {
    const cat = note.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCount)
    .map(([category, count]) => ({
      name: category,
      value: count,
      fill:
        category === "Uncategorized"
          ? "hsl(var(--muted-foreground))"
          : undefined,
    }))
    .sort((a, b) => b.value - a.value);

  const topCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, notes: count }))
    .sort((a, b) => b.notes - a.notes)
    .slice(0, 5);

  const notesByDayOfWeek = recentNotes.reduce((acc, note) => {
    const date = new Date(note.created_at);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dayOfWeekData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (day) => ({
      day,
      notes: notesByDayOfWeek[day] || 0,
    })
  );

  const totalNotes = recentNotes.length;
  const previousTotal = previousPeriodNotes.length;
  const growthRate =
    previousTotal > 0 ? ((totalNotes - previousTotal) / previousTotal) * 100 : 0;
  const avgNotesPerDay = totalNotes / daysToSubtract;
  const mostActiveDay =
    Object.entries(notesByDayOfWeek).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "N/A";

  const radarData = Object.entries(categoryCount)
    .map(([category, count]) => ({
      category,
      value: count,
      fullMark: Math.max(...Object.values(categoryCount)),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return {
    notesOverTime,
    categoryData,
    topCategories,
    dayOfWeekData,
    radarData,
    metrics: {
      totalNotes,
      previousTotal,
      growthRate,
      avgNotesPerDay: Math.round(avgNotesPerDay * 10) / 10,
      mostActiveDay,
    },
  };
}

