"use client";

import { motion } from "framer-motion";

export interface HabitCheckButtonProps {
  isComplete: boolean;
  loading: boolean;
  onClick: () => void | Promise<void>;
  label?: string; // Optional: "Yaptım" (default) or "2dk"
}

export function HabitCheckButton({
  isComplete,
  loading,
  onClick,
  label = "Yaptım",
}: HabitCheckButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${
        isComplete
          ? "bg-green-500 text-white"
          : "bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300"
      } ${loading ? "disabled:opacity-50" : ""}`}
      whileHover={!loading ? { scale: 1.05 } : {}}
      whileTap={!loading ? { scale: 0.95 } : {}}
      aria-label={label}
    >
      {isComplete ? (
        <span className="text-lg">✓</span>
      ) : (
        <span className="text-lg">○</span>
      )}
    </motion.button>
  );
}
