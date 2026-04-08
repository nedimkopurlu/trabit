"use client";

import { useEffect, useState } from "react";
import { getInitialTheme, applyTheme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // Hydrate from localStorage on mount to prevent mismatch
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    if (!theme) return;
    const newTheme = theme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
    setTheme(newTheme);
  };

  if (theme === null) {
    return null; // Don't render until hydrated
  }

  const label = theme === "dark" ? "🌙 Gece Modu" : "☀️ Gündüz Modu";

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded-lg bg-surface text-fg hover:opacity-80 transition-opacity"
    >
      {label}
    </button>
  );
}
