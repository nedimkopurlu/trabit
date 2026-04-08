"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export interface CelebrationScreenProps {
  habitCount: number; // How many habits completed today
  identitySentence: string; // User's affirmation (e.g., "Gücendim!")
  onDismiss: () => void; // Callback to close
}

export function CelebrationScreen({
  habitCount,
  identitySentence,
  onDismiss,
}: CelebrationScreenProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      setIsOpen(false);
      onDismiss();
    }, 6000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsOpen(false);
    onDismiss();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { type: "spring", stiffness: 100, damping: 20 },
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-md mx-auto"
          >
            <div className="text-center space-y-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl"
              >
                🎉
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tamamladın!
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-400">
                {habitCount} alışkanlık, {habitCount} başarı
              </p>

              <p className="text-xl font-semibold text-green-500">
                {identitySentence}
              </p>

              <motion.button
                onClick={handleDismiss}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-green-600"
              >
                Devam et
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
