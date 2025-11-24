const RECENT_NOTES_LIMIT = 1000;
const TOP_CATEGORIES_LIMIT = 5;

export interface TopCategory {
  category: string;
  count: number;
  score?: number;
}

export function getTopCategories<
  T extends { category?: string | null; created_at: string }
>(notes: T[], limit = TOP_CATEGORIES_LIMIT): Array<TopCategory> {
  const total = notes.length;
  if (total === 0) return [];

  const counts: Record<string, number> = {};

  for (const n of notes) {
    if (n.category) {
      counts[n.category] = (counts[n.category] || 0) + 1;
    }
  }

  const recentNotes = notes.slice(0, RECENT_NOTES_LIMIT);

  const recentSet = new Set<string>();
  for (const n of recentNotes) {
    if (n.category) recentSet.add(n.category);
  }

  const scored = Object.entries(counts).map(([category, count]) => {
    const freq = count;
    const ratio = count / total;
    const recent = recentSet.has(category) ? 1 : 0;

    const score = freq + ratio * 2 + recent * 1.5;

    return { category, count, score };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
