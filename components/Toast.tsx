"use client";

import { motion } from "framer-motion";
import type { Toast } from "@/lib/toast-types";

export interface ToastProps extends Toast {
  onRemove: (id: string) => void;
}

const typeStyles = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-blue-500 text-white",
};

const typeIcons = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export function Toast({
  id,
  message,
  type,
  icon,
  onRemove,
}: ToastProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, x: 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 20, x: 100, transition: { duration: 0.2 } }}
      className={`${typeStyles[type]} px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 max-w-sm`}
    >
      <span className="text-lg">{icon || typeIcons[type]}</span>
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={() => onRemove(id)}
        className="ml-2 text-lg opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        ×
      </button>
    </motion.div>
  );
}
