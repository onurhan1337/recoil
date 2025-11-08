import {
  subDays,
  subMonths,
  startOfDay,
  endOfDay,
  parseISO,
  isValid,
} from "date-fns";

const timeBasedKeywords = {
  en: [
    "this week",
    "last week",
    "this month",
    "last month",
    "today",
    "yesterday",
    "recent",
    "summarize",
    "summary",
    "overview",
  ],
  tr: [
    "bugün",
    "dün",
    "bu hafta",
    "geçen hafta",
    "bu ay",
    "geçen ay",
    "son",
    "özet",
  ],
} as const;

const monthNames = {
  en: [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ],
  tr: [
    "ocak",
    "şubat",
    "mart",
    "nisan",
    "mayıs",
    "haziran",
    "temmuz",
    "ağustos",
    "eylül",
    "ekim",
    "kasım",
    "aralık",
  ],
} as const;

const datePatterns = [
  /\d{4}-\d{2}-\d{2}/,
  /\d{1,2}\/\d{1,2}\/\d{4}/,
  /\d{1,2}\.\d{1,2}\.\d{4}/,
  /\d{1,2}-\d{1,2}-\d{4}/,
  /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
  /(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)\s+\d{1,2}/i,
  /\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
  /\d{1,2}\s+(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)/i,
] as const;

export function isTimeBasedQuery(query: string): boolean {
  const queryLower = query.toLowerCase();

  const allKeywords = [...timeBasedKeywords.en, ...timeBasedKeywords.tr];
  if (allKeywords.some((keyword) => queryLower.includes(keyword))) {
    return true;
  }

  return datePatterns.some((pattern) => pattern.test(query));
}

function parseSpecificDate(query: string): Date | null {
  const queryLower = query.toLowerCase();

  const isoDate = parseISODate(query);
  if (isoDate) return isoDate;

  const slashDate = parseSlashDate(query);
  if (slashDate) return slashDate;

  const dotDate = parseDotDate(query);
  if (dotDate) return dotDate;

  const dashDate = parseDashDate(query);
  if (dashDate) return dashDate;

  const namedDate = parseNamedMonthDate(queryLower);
  if (namedDate) return namedDate;

  return null;
}

function parseISODate(query: string): Date | null {
  const match = query.match(/\d{4}-\d{2}-\d{2}/);
  if (!match) return null;

  const parsed = parseISO(match[0]);
  return isValid(parsed) ? parsed : null;
}

function parseSlashDate(query: string): Date | null {
  const match = query.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;

  const [, month, day, year] = match;
  const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? parsed : null;
}

function parseDotDate(query: string): Date | null {
  const match = query.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!match) return null;

  const [, day, month, year] = match;
  const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? parsed : null;
}

function parseDashDate(query: string): Date | null {
  const match = query.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (!match) return null;

  const [, month, day, year] = match;
  const dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? parsed : null;
}

function parseNamedMonthDate(queryLower: string): Date | null {
  for (const [, months] of Object.entries(monthNames)) {
    for (let i = 0; i < months.length; i++) {
      const monthName = months[i];

      const monthFirstDate = parseMonthFirstFormat(
        queryLower,
        monthName,
        i
      );
      if (monthFirstDate) return monthFirstDate;

      const dayFirstDate = parseDayFirstFormat(queryLower, monthName, i);
      if (dayFirstDate) return dayFirstDate;
    }
  }

  return null;
}

function parseMonthFirstFormat(
  queryLower: string,
  monthName: string,
  monthIndex: number
): Date | null {
  const pattern = new RegExp(
    `${monthName}\\s+(\\d{1,2})(?:\\s+(\\d{4}))?`,
    "i"
  );
  const match = queryLower.match(pattern);
  if (!match) return null;

  const day = parseInt(match[1]);
  const year = match[2] ? parseInt(match[2]) : new Date().getFullYear();
  const parsed = new Date(year, monthIndex, day);
  return isValid(parsed) ? parsed : null;
}

function parseDayFirstFormat(
  queryLower: string,
  monthName: string,
  monthIndex: number
): Date | null {
  const pattern = new RegExp(
    `(\\d{1,2})\\s+${monthName}(?:\\s+(\\d{4}))?`,
    "i"
  );
  const match = queryLower.match(pattern);
  if (!match) return null;

  const day = parseInt(match[1]);
  const year = match[2] ? parseInt(match[2]) : new Date().getFullYear();
  const parsed = new Date(year, monthIndex, day);
  return isValid(parsed) ? parsed : null;
}

export function getDateRange(
  query: string
): { start: Date; end?: Date } | null {
  const queryLower = query.toLowerCase();
  const now = new Date();

  const specificDate = parseSpecificDate(query);
  if (specificDate) {
    return {
      start: startOfDay(specificDate),
      end: endOfDay(specificDate),
    };
  }

  if (includesAny(queryLower, ["this week", "bu hafta"])) {
    return { start: subDays(now, 7) };
  }

  if (includesAny(queryLower, ["last week", "geçen hafta"])) {
    return {
      start: subDays(now, 14),
      end: subDays(now, 7),
    };
  }

  if (includesAny(queryLower, ["this month", "bu ay"])) {
    return { start: subMonths(now, 1) };
  }

  if (includesAny(queryLower, ["last month", "geçen ay"])) {
    return {
      start: subMonths(now, 2),
      end: subMonths(now, 1),
    };
  }

  if (includesAny(queryLower, ["today", "bugün"])) {
    return {
      start: startOfDay(now),
      end: endOfDay(now),
    };
  }

  if (includesAny(queryLower, ["yesterday", "dün"])) {
    const yesterday = subDays(now, 1);
    return {
      start: startOfDay(yesterday),
      end: endOfDay(yesterday),
    };
  }

  if (
    includesAny(queryLower, [
      "recent",
      "summarize",
      "summary",
      "overview",
      "son",
      "özet",
    ])
  ) {
    return { start: subDays(now, 30) };
  }

  return null;
}

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}
