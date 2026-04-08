/**
 * HeatMapGrid Component
 * 
 * Displays a 7-day heat map grid with color-coded completion status cells.
 * Uses Framer Motion for stagger animation on mount.
 */

"use client";

import { motion } from "framer-motion";
import type { HeatMapCell } from "@/lib/heat-map-utils";
import { STATUS_COLORS } from "@/lib/heat-map-utils";

interface HeatMapGridProps {
  cells: HeatMapCell[]; // Array of 7 HeatMapCell objects
  showTooltip?: boolean; // Default: true
  animated?: boolean; // Default: true; stagger animation on mount
}

export default function HeatMapGrid({
  cells,
  showTooltip = true,
  animated = true,
}: HeatMapGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: animated ? 0.1 : 0,
        delayChildren: animated ? 0.05 : 0,
      },
    },
  };

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-7 gap-2"
      role="grid"
      initial={animated ? "hidden" : "visible"}
      animate="visible"
      variants={containerVariants}
    >
      {cells.map((cell) => (
        <motion.div
          key={cell.date}
          className={`
            aspect-square rounded-md transition-transform
            hover:scale-110 cursor-pointer
            ${STATUS_COLORS[cell.status]}
          `}
          variants={cellVariants}
          aria-label={`${cell.dayOfWeek} - ${cell.status}`}
          title={showTooltip ? cell.tooltip : undefined}
        />
      ))}
    </motion.div>
  );
}
