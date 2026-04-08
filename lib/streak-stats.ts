/**
 * Streak Statistics Calculations
 * 
 * Pure JavaScript utilities for calculating streak statistics from habit completions.
 * All functions are timezone-aware and schedule-aware.
 */

import type { HabitCompletion } from "./completions-db";
import type { HabitSchedule } from "./habit-types";
import {
  getTodayInTimezone,
  formatDateAsKey,
  isHabitScheduledOnDate,
  getDateFromString,
} from "./habit-schedule";

export interface StreakStats {
  current: number; // Today's streak count
  longest: number; // All-time longest
  total: number; // Total full completions
  thisWeekPercentage: number; // 0-100
}

/**
 * Calculate the current streak for a habit
 * 
 * Traverses from today backward, counting consecutive full (non-quick) completions.
 * Stops at:
 * - First scheduled day with no completion (real miss)
 * - First day habit not scheduled (irrelevant, not a miss)
 * 
 * @param completions - All completions for the habit (sorted ascending)
 * @param schedule - Habit schedule (daily, weekdays, weekends)
 * @param timezone - User's timezone
 * @returns Current streak count (0 if no completion today or yesterday is a miss)
 */
export function calculateCurrentStreak(
  completions: HabitCompletion[],
  schedule: HabitSchedule,
  timezone: string
): number {
  if (completions.length === 0) {
    return 0;
  }

  const today = getTodayInTimezone(timezone);
  let currentDate = new Date(today);
  let streak = 0;

  // Traverse backward from today
  while (true) {
    const dateStr = formatDateAsKey(currentDate);

    // Check if habit is scheduled for this day
    if (!isHabitScheduledOnDate(currentDate, schedule, timezone)) {
      // Not scheduled = irrelevant, skip this day (don't count as miss, don't count as streak)
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    }

    // Habit is scheduled, check if completed
    const completion = completions.find(c => c.date === dateStr);

    if (!completion) {
      // Scheduled but not completed = real miss, stop streak
      break;
    }

    // Completed: if not quick, increment streak
    if (!completion.quick) {
      streak++;
    }

    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

/**
 * Calculate the longest streak ever for a habit
 * 
 * Traverses entire completion history backward, finding the longest unbroken sequence.
 * A "break" is a scheduled day with no completion (quick completions don't break).
 * 
 * @param completions - All completions for the habit (sorted ascending)
 * @param schedule - Habit schedule
 * @param timezone - User's timezone
 * @returns Longest streak count
 */
export function calculateLongestStreak(
  completions: HabitCompletion[],
  schedule: HabitSchedule,
  timezone: string
): number {
  if (completions.length === 0) {
    return 0;
  }

  // Get the earliest date to start from
  const earliestDateStr = completions[0].date;
  const earliestDate = getDateFromString(earliestDateStr);

  let maxStreak = 0;
  let currentStreak = 0;
  let checkDate = new Date(earliestDate);
  const today = getTodayInTimezone(timezone);

  // Traverse forward from earliest date to today
  while (checkDate <= today) {
    const dateStr = formatDateAsKey(checkDate);

    // Check if habit is scheduled for this day
    if (!isHabitScheduledOnDate(checkDate, schedule, timezone)) {
      // Irrelevant day, skip (don't count as miss, don't count as streak)
      checkDate.setDate(checkDate.getDate() + 1);
      continue;
    }

    // Scheduled day: check for completion
    const completion = completions.find(c => c.date === dateStr);

    if (!completion) {
      // Scheduled but not completed = break
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 0;
    } else if (!completion.quick) {
      // Completed with full (non-quick) = increment streak
      currentStreak++;
    }
    // If quick, don't count but don't break either

    checkDate.setDate(checkDate.getDate() + 1);
  }

  // Don't forget the final streak
  maxStreak = Math.max(maxStreak, currentStreak);

  return maxStreak;
}

/**
 * Count total full (non-quick) completions
 * 
 * @param completions - All completions for the habit
 * @returns Count of completions where quick !== true
 */
export function calculateTotalCompletions(
  completions: HabitCompletion[]
): number {
  return completions.filter(c => !c.quick).length;
}

/**
 * Calculate this week's completion percentage
 * 
 * "This week" is Monday (today) going backward to previous Monday (7 calendar days).
 * Uses ISO week definition (Mon-Sun).
 * 
 * @param completions - All completions for the habit
 * @param schedule - Habit schedule
 * @param timezone - User's timezone
 * @returns Percentage 0-100, rounded to nearest integer
 */
export function calculateThisWeekPercentage(
  completions: HabitCompletion[],
  schedule: HabitSchedule,
  timezone: string
): number {
  const today = getTodayInTimezone(timezone);

  // Find the start of the current week (Monday)
  const weekStartDate = new Date(today);
  const dayOfWeek = weekStartDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const distance = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday
  weekStartDate.setDate(weekStartDate.getDate() - distance);

  let completed = 0;
  let expected = 0;
  let checkDate = new Date(weekStartDate);

  // Traverse the week (7 days)
  for (let i = 0; i < 7; i++) {
    if (!isHabitScheduledOnDate(checkDate, schedule, timezone)) {
      // Not scheduled this day, don't count as expected
      checkDate.setDate(checkDate.getDate() + 1);
      continue;
    }

    // Scheduled, so this counts as expected
    expected++;

    // Check if completed (non-quick)
    const dateStr = formatDateAsKey(checkDate);
    const completion = completions.find(c => c.date === dateStr);
    if (completion && !completion.quick) {
      completed++;
    }

    checkDate.setDate(checkDate.getDate() + 1);
  }

  // Handle edge case: if expected = 0 (habit not scheduled this week), return 0
  if (expected === 0) {
    return 0;
  }

  return Math.round((completed / expected) * 100);
}
