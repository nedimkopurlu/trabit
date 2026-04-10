/**
 * Heat Map Utilities
 * 
 * Generate 7-day heat map windows and map completion statuses to colors.
 */

import type { HabitCompletion } from "./completions-db";
import type { Habit } from "./habit-types";
import { getTodayInTimezone, formatDateAsKey, isHabitScheduledOnDate } from "./habit-schedule";

export interface HeatMapCell {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // "Mon", "Tue", "Wed", etc.
  status: "completed" | "quick" | "irrelevant" | "missed";
  tooltip?: string; // For hover: "Mon, Apr 8 - Completed"
}

export const STATUS_COLORS: Record<HeatMapCell["status"], string> = {
  completed: "bg-green-500", // Full completion
  quick: "bg-yellow-400", // 2dk quick completion
  irrelevant: "bg-gray-300 dark:bg-gray-700", // Not scheduled (weekend habit on weekday, etc.)
  missed: "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600", // Scheduled but empty
};

/**
 * Get day-of-week abbreviation from a Date
 * @param date - Date object
 * @param timezone - User's timezone
 * @returns Day abbreviation: "Mon", "Tue", etc.
 */
function getDayOfWeekAbbr(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  });
  return formatter.format(date);
}

/**
 * Generate 7-day heat map window (6 days before today + today)
 * 
 * @param timezone - User's timezone
 * @param completionsByDate - Map of date string to completion (for O(1) lookup)
 * @param habit - Habit object for schedule checking
 * @returns Array of HeatMapCell objects sorted oldest → newest
 */
export function getLast7DayWindow(
  timezone: string,
  completionsByDate: Map<string, HabitCompletion>,
  habit: Habit
): HeatMapCell[] {
  const cells: HeatMapCell[] = [];
  const today = getTodayInTimezone(timezone);

  // Generate 7 days: 6 before + today
  for (let i = 6; i >= 0; i--) {
    const cellDate = new Date(today);
    cellDate.setDate(cellDate.getDate() - i);

    const dateStr = formatDateAsKey(cellDate);
    const dayOfWeek = getDayOfWeekAbbr(cellDate, timezone);

    // Map completion to status
    const completion = completionsByDate.get(dateStr);
    const status = mapCompletionToStatus(completion, habit, cellDate, timezone);

    // Build tooltip
    const formatter = new Intl.DateTimeFormat("tr-TR", {
      month: "short",
      day: "numeric",
      timeZone: timezone,
    });
    const dateFormatted = formatter.format(cellDate);
    const tooltip = `${dateFormatted} - ${
      status === "completed"
        ? "Tamamlandı"
        : status === "quick"
          ? "Hızlı (2dk)"
          : status === "irrelevant"
            ? "Planlanmamış"
            : "Atlandı"
    }`;

    cells.push({
      date: dateStr,
      dayOfWeek,
      status,
      tooltip,
    });
  }

  return cells;
}

/**
 * Generate 30-day heat map window (29 days before today + today)
 *
 * @param timezone - User's timezone
 * @param completionsByDate - Map of date string to completion (for O(1) lookup)
 * @param habit - Habit object for schedule checking
 * @returns Array of HeatMapCell objects sorted oldest → newest
 */
export function getLast30DayWindow(
  timezone: string,
  completionsByDate: Map<string, HabitCompletion>,
  habit: Habit
): HeatMapCell[] {
  const cells: HeatMapCell[] = [];
  const today = getTodayInTimezone(timezone);

  for (let i = 29; i >= 0; i--) {
    const cellDate = new Date(today);
    cellDate.setDate(cellDate.getDate() - i);

    const dateStr = formatDateAsKey(cellDate);
    const dayOfWeek = getDayOfWeekAbbr(cellDate, timezone);

    const completion = completionsByDate.get(dateStr);
    const status = mapCompletionToStatus(completion, habit, cellDate, timezone);

    const formatter = new Intl.DateTimeFormat("tr-TR", {
      month: "short",
      day: "numeric",
      timeZone: timezone,
    });
    const dateFormatted = formatter.format(cellDate);
    const tooltip = `${dateFormatted} - ${
      status === "completed"
        ? "Tamamlandı"
        : status === "quick"
          ? "Hızlı (2dk)"
          : status === "irrelevant"
            ? "Planlanmamış"
            : "Atlandı"
    }`;

    cells.push({ date: dateStr, dayOfWeek, status, tooltip });
  }

  return cells;
}

/**
 * Map a completion (or lack thereof) to a heat map status
 * 
 * @param completion - Completion object or null if no completion
 * @param habit - Habit object for schedule checking
 * @param date - Date to check
 * @param timezone - User's timezone
 * @returns Status color: "completed", "quick", "irrelevant", or "missed"
 */
export function mapCompletionToStatus(
  completion: HabitCompletion | undefined,
  habit: Habit,
  date: Date,
  timezone: string
): HeatMapCell["status"] {
  if (!completion) {
    // No completion: check if habit is scheduled
    if (isHabitScheduledOnDate(date, habit.schedule, timezone)) {
      return "missed"; // Scheduled but no completion
    } else {
      return "irrelevant"; // Not scheduled
    }
  }

  // Completion exists: check if quick
  if (completion.quick) {
    return "quick"; // 2dk quick completion (yellow)
  } else {
    return "completed"; // Full completion (green)
  }
}
