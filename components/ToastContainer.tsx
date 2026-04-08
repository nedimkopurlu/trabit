"use client";

import { AnimatePresence } from "framer-motion";
import { useToast } from "@/lib/toast-context";
import { Toast } from "./Toast";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-4 sm:right-4 bottom-4 left-4">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onRemove={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
