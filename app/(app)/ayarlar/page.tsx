"use client";

import { useState } from "react";
import { SignOutButton } from "@/components/SignOutButton";
import HabitList from "@/components/HabitList";
import HabitFormSheet from "@/components/HabitFormSheet";
import type { Habit } from "@/lib/habit-types";

export default function AyarlarPage() {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditSheetOpen(true);
  };

  const handleCloseEdit = () => {
    setEditSheetOpen(false);
    setEditingHabit(null);
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-fg dark:text-fg mb-6">Ayarlar</h1>
      
      {/* Habits Section */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-fg dark:text-fg mb-3">Alışkanlıklar</h2>
        <HabitList onEditHabit={handleEditHabit} />
      </section>

      {/* Other Settings */}
      <SignOutButton />

      {/* Edit Sheet */}
      <HabitFormSheet
        open={editSheetOpen}
        habit={editingHabit || undefined}
        onClose={handleCloseEdit}
      />
    </main>
  );
}
