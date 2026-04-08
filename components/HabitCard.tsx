"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { deleteHabit } from "@/lib/habits-db";
import type { Habit } from "@/lib/habit-types";

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDeleted: () => void;
}

const scheduleLabels: Record<Habit["schedule"], string> = {
  daily: "Her gün",
  weekdays: "Hafta içi",
  weekends: "Hafta sonu",
};

const importanceColors: Record<Habit["importance"], string> = {
  critical: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export default function HabitCard({ habit, onEdit, onDeleted }: HabitCardProps) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    const confirmed = window.confirm(`"${habit.name}" alışkanlığını silmek istediğinizden emin misiniz?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteHabit(user.uid, habit.id);
      onDeleted();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Silme işlemi başarısız oldu.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    onEdit(habit);
  };

  return (
    <div className="rounded-xl border border-surface bg-surface dark:bg-neutral-800 p-4 flex items-center gap-3">
      {/* Emoji */}
      <div className="text-2xl">{habit.emoji}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-fg dark:text-fg truncate">{habit.name}</div>
        <div className="flex items-center gap-2 mt-1">
          {/* Importance dot */}
          <div className={`w-2 h-2 rounded-full ${importanceColors[habit.importance]}`} />
          {/* Schedule badge */}
          <span className="text-xs text-fg/60 dark:text-fg/60">{scheduleLabels[habit.schedule]}</span>
        </div>
        {/* Target amount for amount type */}
        {habit.type === "amount" && habit.targetAmount && (
          <div className="text-sm text-fg/60 dark:text-fg/60 mt-1">Hedef: {habit.targetAmount}</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleEdit}
          disabled={deleting}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface/50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
          aria-label="Düzenle"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface/50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
          aria-label="Sil"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
