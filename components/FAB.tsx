"use client";

import { motion } from "framer-motion";

interface FABProps {
  onClick: () => void;
}

export default function FAB({ onClick }: FABProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-24 right-6 z-30 md:bottom-8 w-14 h-14 rounded-full bg-fg text-bg shadow-lg hover:scale-110 transition-transform flex items-center justify-center font-bold text-2xl"
      aria-label="Alışkanlık ekle"
    >
      +
    </motion.button>
  );
}
