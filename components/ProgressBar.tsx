"use client";

import { motion } from "framer-motion";

export interface ProgressBarProps {
  current: number; // Current value (0+)
  target: number; // Target value (1+)
  color: string; // Hex color (e.g., "#ef4444" for red)
  size?: "sm" | "md" | "lg"; // Height: sm=h-2, md=h-3, lg=h-4
  animated?: boolean; // Start from 0 if true, else jump to current
}

const sizeClasses: Record<string, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export function ProgressBar({
  current,
  target,
  color,
  size = "md",
  animated = false,
}: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div
      className={`${sizeClasses[size]} w-full rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden`}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: animated ? "0%" : `${percentage}%` }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: 0.8,
          type: "spring",
          stiffness: 100,
          damping: 30,
        }}
      />
    </div>
  );
}
