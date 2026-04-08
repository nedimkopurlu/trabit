import type { Timestamp } from "firebase/firestore";

export type HabitType = "boolean" | "amount";
export type HabitSchedule = "daily" | "weekdays" | "weekends";
export type HabitImportance = "critical" | "medium" | "low";

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  schedule: HabitSchedule;
  importance: HabitImportance;
  emoji: string;
  color: string; // hex "#rrggbb"
  notificationTime: string | null; // "HH:MM"
  targetAmount: number | null; // required when type === "amount"
  order: number; // 0=critical, 1=medium, 2=low (D-02)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type HabitInput = Omit<Habit, "id" | "createdAt" | "updatedAt" | "order">;

export const IMPORTANCE_ORDER: Record<HabitImportance, number> = {
  critical: 0,
  medium: 1,
  low: 2,
};

export const DEFAULT_COLORS: string[] = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#64748b", "#14b8a6",
];

export const DEFAULT_EMOJIS: string[] = [
  "🏃‍♂️","💪","🧘‍♀️","💧","📚","🛌","🍎","🧹",
  "🚶","🥗","☕","🧠","✍️","🧺","🦷","🧴",
  "🎯","⏰","🙏","🌱","🪥","🧘","🚴","🏋️",
  "📖","✅","🧾","🧊","🛁","🌞",
];
