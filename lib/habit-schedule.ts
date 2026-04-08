/**
 * Habit Schedule Utilities
 * 
 * Timezone-aware day-of-week filtering using native Intl API.
 * No external date library dependencies.
 */

export type HabitSchedule = "daily" | "weekdays" | "weekends";

/**
 * Get user's timezone string
 * Returns browser timezone via Intl API, or 'UTC' on server
 */
export function getUserTimezone(): string {
  if (typeof window === "undefined") {
    return "UTC";
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

/**
 * Get today's date as YYYY-MM-DD string in user's timezone
 */
export function getTodayKeyInTimezone(timezone: string = getUserTimezone()): string {
  const today = getTodayInTimezone(timezone);
  return formatDateAsKey(today);
}

/**
 * Convert Date to YYYY-MM-DD string (used as Firestore document ID)
 * Sortable and reversible format
 */
export function formatDateAsKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get today's midnight (00:00:00) in user's timezone as Date object
 * Returns UTC Date, but calculated from user's local midnight
 */
export function getTodayInTimezone(timezone: string = getUserTimezone()): Date {
  // Create a formatter for the given timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  });

  // Get today's date in user's timezone
  const now = new Date();
  const parts = formatter.formatToParts(now);
  
  const year = parseInt(
    parts.find(p => p.type === "year")?.value || "2026",
    10
  );
  const month = parseInt(
    parts.find(p => p.type === "month")?.value || "1",
    10
  );
  const day = parseInt(
    parts.find(p => p.type === "day")?.value || "1",
    10
  );

  // Create a UTC date from these values
  // Note: This is the midnight in the user's timezone, but represented as UTC
  // For example, if user is in UTC-5 and it's midnight for them,
  // the UTC time would be 05:00 (5 hours ahead)
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Get day of week index for a given date in a specific timezone
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
function getDayOfWeekInTimezone(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: timezone,
  });

  const dayName = formatter.format(date);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days.indexOf(dayName);
}

/**
 * Check if a habit's schedule matches today in given timezone
 * 
 * @param schedule - The habit's schedule type
 * @param timezone - Optional timezone (defaults to user's browser timezone)
 * @returns true if habit is scheduled for today
 */
export function isHabitScheduledToday(
  schedule: HabitSchedule,
  timezone: string = getUserTimezone()
): boolean {
  if (schedule === "daily") {
    return true;
  }

  const today = new Date();
  const dayOfWeek = getDayOfWeekInTimezone(today, timezone);

  if (schedule === "weekdays") {
    // Monday (1) through Friday (5)
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (schedule === "weekends") {
    // Saturday (6) or Sunday (0)
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  return false;
}
