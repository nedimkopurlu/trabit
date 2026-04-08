"use client";

import { motion } from "framer-motion";
import { Habit } from "@/lib/habit-types";
import { useHabitCompletion } from "@/lib/use-habit-completion";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";
import { ProgressBar } from "./ProgressBar";

export interface AmountHabitCardProps {
  habit: Habit;
}

export function AmountHabitCard({ habit }: AmountHabitCardProps) {
  const { amount, loading, setAmount } = useHabitCompletion(habit.id);
  const { addToast } = useToast();
  const { identitySentence } = useAuth();

  const targetAmount = habit.targetAmount || 10;

  const handleDecrement = async () => {
    await setAmount(Math.max(0, amount - 1));
  };

  const handleIncrement = async () => {
    const newAmount = Math.min(amount + 1, targetAmount);
    await setAmount(newAmount);

    // Show toast when reaching target
    if (newAmount === targetAmount && identitySentence) {
      addToast(
        `✓ ${habit.name} tamamlandı! ${identitySentence}`,
        "success",
        3000
      );
    }
  };

  const isAtTarget = amount >= targetAmount;

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
      className={`flex flex-col gap-3 p-4 rounded-lg mb-2 transition-colors border ${
        isAtTarget
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          : "bg-surface dark:bg-neutral-800 border-surface/50 dark:border-neutral-700"
      }`}
    >
      <div className="flex items-center gap-3">
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

      <ProgressBar
        current={amount}
        target={targetAmount}
        color={habit.color}
        size="md"
        animated={true}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {amount} / {targetAmount}
        </span>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleDecrement}
            disabled={loading || amount === 0}
            whileTap={!loading && amount > 0 ? { scale: 0.9 } : {}}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
              amount === 0
                ? "bg-gray-100 dark:bg-neutral-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            aria-label="Decrease"
          >
            −
          </motion.button>

          <motion.button
            onClick={handleIncrement}
            disabled={loading || isAtTarget}
            whileTap={!loading && !isAtTarget ? { scale: 0.9 } : {}}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${
              isAtTarget
                ? "bg-gray-100 dark:bg-neutral-700 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
            aria-label="Increase"
          >
            +
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
