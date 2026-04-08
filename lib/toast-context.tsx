"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Toast } from "./toast-types";

interface ToastContextType {
  toasts: Toast[];
  addToast: (
    message: string,
    type: Toast["type"],
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast["type"], duration?: number) => {
      const id = `${Date.now()}-${Math.random()}`;
      const finalDuration = duration || (type === "success" ? 3000 : type === "error" ? 5000 : 4000);

      const newToast: Toast = {
        id,
        message,
        type,
        duration: finalDuration,
      };

      setToasts(prev => [...prev, newToast]);

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        removeToast(id);
      }, finalDuration);

      return () => clearTimeout(timer);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}
