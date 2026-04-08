/**
 * useStreakStats Hook
 * 
 * Real-time streak statistics with Firestore listener.
 * Returns current streak, longest streak, total completions, and this-week percentage.
 */

import { useEffect, useMemo, useState } from "react";
import type { HabitCompletion } from "./completions-db";
import type { HabitSchedule } from "./habit-types";
import { getCompletionsInRange, listenToAllCompletions } from "./completions-db";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateTotalCompletions,
  calculateThisWeekPercentage,
  type StreakStats,
} from "./streak-stats";
import { getUserTimezone } from "./habit-schedule";

interface UseStreakStatsReturn extends StreakStats {
  loading: boolean;
  error: string | null;
}

/**
 * Hook to get real-time streak statistics for a habit
 * 
 * @param uid - User ID (null-safe)
 * @param habitId - Habit ID (null-safe)
 * @param schedule - Habit schedule (daily, weekdays, weekends)
 * @param timezone - User's timezone (defaults to browser timezone)
 * @returns Streak stats + loading/error state
 */
export function useStreakStats(
  uid: string | null,
  habitId: string | null,
  schedule: HabitSchedule,
  timezone: string = getUserTimezone()
): UseStreakStatsReturn {
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(!uid || !habitId);
  const [error, setError] = useState<string | null>(null);

  // Set up real-time listener and fetch all-time history
  useEffect(() => {
    if (!uid || !habitId) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      try {
        // Fetch all-time completions first (for longest streak)
        // Use a large range: year 2000 to year 2100 to get everything
        const allCompletions = await getCompletionsInRange(
          uid,
          habitId,
          "2000-01-01",
          "2100-12-31"
        );

        setCompletions(allCompletions);
        setLoading(false);
        setError(null);

        // Then set up real-time listener for ongoing updates
        unsubscribe = listenToAllCompletions(uid, habitId, (updates) => {
          setCompletions(updates);
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [uid, habitId]);

  // Memoized calculations
  const stats = useMemo<StreakStats>(() => {
    if (!completions.length) {
      return {
        current: 0,
        longest: 0,
        total: 0,
        thisWeekPercentage: 0,
      };
    }

    // Sort completions by date ascending (oldest first)
    const sortedCompletions = [...completions].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return {
      current: calculateCurrentStreak(sortedCompletions, schedule, timezone),
      longest: calculateLongestStreak(sortedCompletions, schedule, timezone),
      total: calculateTotalCompletions(sortedCompletions),
      thisWeekPercentage: calculateThisWeekPercentage(
        sortedCompletions,
        schedule,
        timezone
      ),
    };
  }, [completions, schedule, timezone]);

  return {
    ...stats,
    loading,
    error,
  };
}
