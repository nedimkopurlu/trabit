"use client";

import { motion } from "framer-motion";
import { Habit } from "@/lib/habit-types";
import { useHabitCompletion } from "@/lib/use-habit-completion";
import { HabitCheckButton } from "./HabitCheckButton";

export interface TodayHabitCardProps {
  habit: Habit;
}

export function TodayHabitCard({ habit }: TodayHabitCardProps) {
  const { isComplete, toggleComplete, loading } = useHabitCompletion(habit.id);

  const handleToggle = async () => {
    try {
      await toggleComplete(false);
    } catch (err) {
      console.error("Error toggling completion:", err);
    }
  };

  const handleQuick = async () => {
    try {
      await toggleComplete(true);
    } catch (err) {
      console.error("Error quick completing:", err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        x: 300,
        transition: { duration: 0.3 },
      }}
      className={`flex items-center justify-between p-4 rounded-lg mb-2 transition-colors border ${
        isComplete
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          : "bg-surface dark:bg-neutral-800 border-surface/50 dark:border-neutral-700"
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="text-3xl">{habit.emoji}</div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {habit.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {habit.schedule === "daily"
              ? "Günlük"
              : habit.schedule === "weekdays"
                ? "Hafta içi"
                : "Hafta sonu"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <HabitCheckButton
          isComplete={isComplete}
          loading={loading}
          onClick={handleQuick}
          label="2dk"
        />
        <HabitCheckButton
          isComplete={isComplete}
          loading={loading}
          onClick={handleToggle}
          label="Yaptım"
        />
      </div>
    </motion.div>
  );
}
