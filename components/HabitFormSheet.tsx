"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HabitForm from "./HabitForm";
import type { Habit } from "@/lib/habit-types";

interface HabitFormSheetProps {
  open: boolean;
  habit?: Habit;
  onClose: () => void;
}

export default function HabitFormSheet({ open, habit, onClose }: HabitFormSheetProps) {
  // Prevent body scroll while sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sheet Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-neutral-900 p-6 max-h-[90vh] overflow-y-auto md:inset-0 md:m-auto md:max-w-md md:max-h-[85vh] md:rounded-2xl md:h-fit"
          >
            <HabitForm habit={habit} onSubmitted={onClose} onCancel={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
