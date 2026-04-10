/**
 * StreakHabitCard Component
 *
 * Complete habit card for Seri tab showing:
 * - Habit name, emoji, schedule tag
 * - 7-day or 30-day heat map grid (togglable)
 * - Three statistics: longest streak, total completions, this week %
 */

"use client";

import { useMemo, useState, useEffect } from "react";
import type { Habit } from "@/lib/habit-types";
import { useStreakStats } from "@/lib/use-streak-stats";
import { getLast7DayWindow, getLast30DayWindow } from "@/lib/heat-map-utils";
import { getCompletionsInRange } from "@/lib/completions-db";
import { getUserTimezone } from "@/lib/habit-schedule";
import HeatMapGrid from "./HeatMapGrid";
import StatRow from "./StatRow";
import { useAuth } from "@/lib/auth-context";
import type { HabitCompletion } from "@/lib/completions-db";

type HeatMapRange = "7" | "30";

interface StreakHabitCardProps {
  habit: Habit;
  uid: string;
}

export default function StreakHabitCard({ habit, uid }: StreakHabitCardProps) {
  const { user } = useAuth();
  const timezone = getUserTimezone();
  const [range, setRange] = useState<HeatMapRange>("7");

  // Get real-time streak stats
  const stats = useStreakStats(uid || user?.uid || null, habit.id, habit.schedule, timezone);

  // Get all completions for heat map
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [completionsLoading, setCompletionsLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const fetchCompletions = async () => {
      try {
        const data = await getCompletionsInRange(
          uid,
          habit.id,
          "2000-01-01",
          "2100-12-31"
        );
        setCompletions(data);
      } catch (error) {
        console.error("Error fetching completions:", error);
      } finally {
        setCompletionsLoading(false);
      }
    };

    fetchCompletions();
  }, [uid, habit.id]);

  // Generate heat map cells based on selected range
  const heatMapCells = useMemo(() => {
    const completionsByDate = new Map(completions.map(c => [c.date, c]));
    return range === "7"
      ? getLast7DayWindow(timezone, completionsByDate, habit)
      : getLast30DayWindow(timezone, completionsByDate, habit);
  }, [completions, timezone, habit, range]);

  const scheduleLabel =
    habit.schedule === "daily"
      ? "Her gün"
      : habit.schedule === "weekdays"
        ? "Hafta içi"
        : "Hafta sonu";

  const gridColumns = range === "7" ? 7 : 6;
  const skeletonCount = range === "7" ? 7 : 30;

  return (
    <div
      className="rounded-xl shadow-sm p-4 md:p-6 border-l-4 transition-shadow hover:shadow-md bg-white dark:bg-gray-900"
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
        {/* Range toggle + label */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium opacity-60">
            {range === "7" ? "Son 7 Gün" : "Son 30 Gün"}
          </p>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-xs">
            <button
              onClick={() => setRange("7")}
              className={`px-2 py-1 transition-colors ${
                range === "7"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              7G
            </button>
            <button
              onClick={() => setRange("30")}
              className={`px-2 py-1 transition-colors ${
                range === "30"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              30G
            </button>
          </div>
        </div>

        {completionsLoading ? (
          <div className={range === "7" ? "grid grid-cols-7 gap-1.5" : "grid grid-cols-6 gap-1.5"}>
            {Array(skeletonCount)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
                />
              ))}
          </div>
        ) : (
          <HeatMapGrid cells={heatMapCells} columns={gridColumns as 6 | 7} />
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
            İstatistikler yüklenemedi
          </div>
        ) : (
          <>
            <StatRow value={stats.longest} label="En uzun seri" suffix="🔥" />
            <StatRow value={stats.total} label="Toplam tamamlama" suffix="✓" />
            <StatRow value={stats.thisWeekPercentage} label="Bu hafta" suffix="%" />
          </>
        )}
      </div>
    </div>
  );
}
