/**
 * StreakHabitCard Component
 * 
 * Complete habit card for Seri tab showing:
 * - Habit name, emoji, schedule tag
 * - 7-day heat map grid
 * - Three statistics: longest streak, total completions, this week %
 */

"use client";

import { useMemo } from "react";
import type { Habit } from "@/lib/habit-types";
import { useStreakStats } from "@/lib/use-streak-stats";
import { getLast7DayWindow } from "@/lib/heat-map-utils";
import { getCompletionsInRange } from "@/lib/completions-db";
import { getTodayKeyInTimezone, getTodayInTimezone, getUserTimezone } from "@/lib/habit-schedule";
import HeatMapGrid from "./HeatMapGrid";
import StatRow from "./StatRow";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import type { HabitCompletion } from "@/lib/completions-db";

interface StreakHabitCardProps {
  habit: Habit;
  uid: string;
}

export default function StreakHabitCard({ habit, uid }: StreakHabitCardProps) {
  const { user } = useAuth();
  const timezone = getUserTimezone();

  // Get real-time streak stats
  const stats = useStreakStats(uid || user?.uid || null, habit.id, habit.schedule, timezone);

  // Get all completions for heat map
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [completionsLoading, setCompletionsLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const fetchCompletions = async () => {
      try {
        const completions = await getCompletionsInRange(
          uid,
          habit.id,
          "2000-01-01",
          "2100-12-31"
        );
        setCompletions(completions);
      } catch (error) {
        console.error("Error fetching completions:", error);
      } finally {
        setCompletionsLoading(false);
      }
    };

    fetchCompletions();
  }, [uid, habit.id]);

  // Generate heat map cells
  const heatMapCells = useMemo(() => {
    const completionsByDate = new Map(completions.map(c => [c.date, c]));
    return getLast7DayWindow(timezone, completionsByDate, habit);
  }, [completions, timezone, habit]);

  // Get schedule label
  const scheduleLabel =
    habit.schedule === "daily"
      ? "Daily"
      : habit.schedule === "weekdays"
        ? "Weekdays"
        : "Weekends";

  return (
    <div
      className={`
        rounded-xl shadow-sm p-4 md:p-6
        border-l-4 transition-shadow hover:shadow-md
        bg-white dark:bg-gray-900
      `}
      style={{ borderLeftColor: habit.color }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{habit.emoji}</span>
          <div>
            <h2 className="text-lg font-semibold">{habit.name}</h2>
            <p className="text-xs opacity-50">{scheduleLabel}</p>
          </div>
        </div>
      </div>

      {/* Heat Map Section */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-medium opacity-60">Last 7 Days</p>
        {completionsLoading ? (
          <div className="grid grid-cols-7 gap-2">
            {Array(7)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
                />
              ))}
          </div>
        ) : (
          <HeatMapGrid cells={heatMapCells} />
        )}
      </div>

      {/* Statistics Section */}
      <div className="space-y-3">
        {stats.loading ? (
          <>
            <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </>
        ) : stats.error ? (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
            Error loading stats
          </div>
        ) : (
          <>
            <StatRow
              value={stats.longest}
              label="Longest Streak"
              suffix="🔥"
            />
            <StatRow
              value={stats.total}
              label="Total Completions"
              suffix="✓"
            />
            <StatRow
              value={stats.thisWeekPercentage}
              label="This Week"
              suffix="%"
            />
          </>
        )}
      </div>
    </div>
  );
}
