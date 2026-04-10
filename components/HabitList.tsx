"use client";

import { useCallback, useEffect, useState } from "react";
import { Reorder } from "framer-motion";
import { useHabits } from "@/lib/use-habits";
import { useAuth } from "@/lib/auth-context";
import { reorderHabits } from "@/lib/habits-db";
import HabitCard from "./HabitCard";
import type { Habit } from "@/lib/habit-types";

interface HabitListProps {
  onEditHabit: (habit: Habit) => void;
}

export default function HabitList({ onEditHabit }: HabitListProps) {
  const { habits, loading, error } = useHabits();
  const { user } = useAuth();
  const [orderedHabits, setOrderedHabits] = useState<Habit[]>([]);

  // Sync local order with Firestore data (on first load and additions/deletions)
  useEffect(() => {
    if (habits.length === 0) {
      setOrderedHabits([]);
      return;
    }
    // Merge: keep existing local order for habits still present, append new ones
    setOrderedHabits(prev => {
      const prevIds = prev.map(h => h.id);
      const habitMap = new Map(habits.map(h => [h.id, h]));
      // Keep current order for existing habits, filtering removed ones
      const kept = prev
        .filter(h => habitMap.has(h.id))
        .map(h => habitMap.get(h.id)!);
      // Append any new habits not yet in local list
      const newHabits = habits.filter(h => !prevIds.includes(h.id));
      return [...kept, ...newHabits];
    });
  }, [habits]);

  const handleReorderEnd = useCallback(async () => {
    if (!user) return;
    await reorderHabits(user.uid, orderedHabits.map(h => h.id));
  }, [user, orderedHabits]);

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

  if (orderedHabits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-fg/60 dark:text-fg/60">Henüz alışkanlık yok</p>
        <p className="text-sm text-fg/40 dark:text-fg/40 mt-1">+ ile yeni alışkanlık ekle</p>
      </div>
    );
  }

  return (
    <Reorder.Group
      axis="y"
      values={orderedHabits}
      onReorder={setOrderedHabits}
      className="space-y-3"
    >
      {orderedHabits.map((habit) => (
        <Reorder.Item
          key={habit.id}
          value={habit}
          onDragEnd={handleReorderEnd}
          className="cursor-grab active:cursor-grabbing"
        >
          <HabitCard
            habit={habit}
            onEdit={onEditHabit}
            onDeleted={() => {
              // No-op: useHabits realtime listener automatically updates list
            }}
          />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
