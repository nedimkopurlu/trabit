"use client";

import { useHabits } from "@/lib/use-habits";
import HabitCard from "./HabitCard";
import type { Habit } from "@/lib/habit-types";

interface HabitListProps {
  onEditHabit: (habit: Habit) => void;
}

export default function HabitList({ onEditHabit }: HabitListProps) {
  const { habits, loading, error } = useHabits();

  if (loading) {
    return (
      <div className="text-center py-8 text-fg/60 dark:text-fg/60">
        Yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Hata: {error.message}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-fg/60 dark:text-fg/60">Henüz alışkanlık yok</p>
        <p className="text-sm text-fg/40 dark:text-fg/40 mt-1">+ ile yeni alışkanlık ekle</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onEdit={onEditHabit}
          onDeleted={() => {
            // No-op: useHabits realtime listener automatically updates list
          }}
        />
      ))}
    </div>
  );
}
