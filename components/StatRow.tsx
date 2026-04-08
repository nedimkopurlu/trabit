/**
 * StatRow Component
 * 
 * Displays a single statistic (number + label) with Framer Motion animation.
 */

"use client";

import { motion } from "framer-motion";
import React from "react";

interface StatRowProps {
  value: number; // The statistic value
  label: string; // Label text (e.g., "Current Streak")
  suffix?: string; // Optional suffix (e.g., "%" or "🔥")
  icon?: React.ReactNode; // Optional icon component
  variant?: "default" | "highlight"; // default vs larger/bolder
}

export default function StatRow({
  value,
  label,
  suffix,
  icon,
  variant = "default",
}: StatRowProps) {
  const isHighlight = variant === "highlight";

  return (
    <div
      className={`
        flex items-center gap-3 rounded-lg p-3 md:p-4
        ${
          isHighlight
            ? "flex-col items-start gap-2"
            : "justify-between"
        }
        bg-gray-50 dark:bg-gray-900
      `}
    >
      {/* Icon (if provided) */}
      {icon && (
        <div className={isHighlight ? "text-lg md:text-xl" : "text-base"}>
          {icon}
        </div>
      )}

      {/* Number section */}
      <motion.div
        className={isHighlight ? "w-full" : ""}
        initial={{ opacity: 0.5, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        key={value} // Re-animate when value changes
      >
        <div className={isHighlight ? "flex items-baseline gap-1" : "text-right"}>
          <span
            className={`
              font-bold
              ${isHighlight ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}
            `}
          >
            {value}
          </span>
          {suffix && (
            <span
              className={`
                ${isHighlight ? "text-lg" : "text-sm"}
                opacity-70
              `}
            >
              {suffix}
            </span>
          )}
        </div>
      </motion.div>

      {/* Label */}
      <p
        className={`
          ${isHighlight ? "text-sm font-medium" : "text-sm opacity-60 text-right"}
          dark:opacity-70
        `}
      >
        {label}
      </p>
    </div>
  );
}
