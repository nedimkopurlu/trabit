/**
 * Seri (Streak) Tab Page
 * 
 * Displays all user habits with 7-day heat maps and streak statistics.
 * Real-time updates via Firestore listeners in StreakHabitCard components.
 */

"use client";

import { useAuth } from "@/lib/auth-context";
import { useHabits } from "@/lib/use-habits";
import StreakHabitCard from "@/components/StreakHabitCard";
import { useMemo } from "react";

export default function SeriPage() {
  const { user } = useAuth();
  const uid = user?.uid;
  const { habits, loading, error } = useHabits();

  // Sort habits by importance (critical → medium → low)
  const sortedHabits = useMemo(() => {
    if (!habits) return [];
    return [...habits].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [habits]);

  // Authentication check
  if (!uid) {
    return (
      <main className="px-4 py-6">
        <h1 className="text-2xl font-semibold">Seri</h1>
        <p className="mt-4 text-sm opacity-60">
          Not authenticated. Please sign in to view your streaks.
        </p>
      </main>
    );
  }

  // Loading state
  if (loading) {
    return (
      <main className="px-4 py-6 pb-24">
        <h1 className="text-2xl font-semibold">Seri</h1>
        <p className="mt-2 text-sm opacity-60">Track your habit streaks</p>
        
        <div className="mt-6 space-y-4">
          {Array(3)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))}
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="px-4 py-6 pb-24">
        <h1 className="text-2xl font-semibold">Seri</h1>
        <p className="mt-2 text-sm opacity-60">Track your habit streaks</p>
        
        <div className="mt-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to load habits: {error.message}
          </p>
        </div>
      </main>
    );
  }

  // Empty state
  if (!sortedHabits || sortedHabits.length === 0) {
    return (
      <main className="px-4 py-6 pb-24">
        <h1 className="text-3xl font-bold">Seri</h1>
        <p className="mt-2 text-sm opacity-60">Track your habit streaks</p>
        
        <div className="mt-6 rounded-lg bg-gray-50 dark:bg-gray-900 p-8 text-center">
          <p className="text-sm opacity-60">Henüz alışkanlık yok</p>
          <p className="mt-2 text-xs opacity-40">
            Alışkanlık eklemek için Ayarlar sekmesini kullanın
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Seri</h1>
        <p className="mt-1 text-sm opacity-60">Track your habit streaks and completion history</p>
      </div>

      {/* Habit Cards */}
      <div className="flex flex-col gap-4">
        {sortedHabits.map(habit => (
          <StreakHabitCard key={habit.id} habit={habit} uid={uid} />
        ))}
      </div>
    </main>
  );
}
