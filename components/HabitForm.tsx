"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createHabit, updateHabit } from "@/lib/habits-db";
import type {
  Habit,
  HabitInput,
  HabitType,
  HabitSchedule,
  HabitImportance,
} from "@/lib/habit-types";
import { DEFAULT_COLORS, DEFAULT_EMOJIS } from "@/lib/habit-types";

export interface HabitFormProps {
  habit?: Habit;
  onSubmitted: () => void;
  onCancel: () => void;
}

export default function HabitForm({ habit, onSubmitted, onCancel }: HabitFormProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(habit?.name || "");
  const [type, setType] = useState<HabitType>(habit?.type || "boolean");
  const [schedule, setSchedule] = useState<HabitSchedule>(habit?.schedule || "daily");
  const [importance, setImportance] = useState<HabitImportance>(habit?.importance || "medium");
  const [emoji, setEmoji] = useState(habit?.emoji || DEFAULT_EMOJIS[0]);
  const [color, setColor] = useState(habit?.color || DEFAULT_COLORS[0]);
  const [notificationEnabled, setNotificationEnabled] = useState(!!habit?.notificationTime);
  const [notificationTime, setNotificationTime] = useState(habit?.notificationTime || "09:00");
  const [targetAmount, setTargetAmount] = useState<number | null>(habit?.targetAmount || null);

  // Validation
  const trimmedName = name.trim();
  const isNameValid = trimmedName.length >= 1 && trimmedName.length <= 50;
  const isAmountValid = type === "boolean" || (targetAmount !== null && targetAmount >= 1);
  const isValid = isNameValid && isAmountValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isValid) return;

    setSubmitting(true);
    setError(null);

    try {
      const input: HabitInput = {
        name: trimmedName,
        type,
        schedule,
        importance,
        emoji,
        color,
        notificationTime: notificationEnabled ? notificationTime : null,
        targetAmount: type === "amount" ? targetAmount : null,
      };

      if (habit) {
        await updateHabit(user.uid, habit.id, input);
      } else {
        await createHabit(user.uid, input);
      }

      onSubmitted();
    } catch (err) {
      console.error("Habit save failed:", err);
      setError("Kaydetme işlemi başarısız oldu. Lütfen tekrar deneyin.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
      {/* Title */}
      <h2 className="text-2xl font-bold text-fg dark:text-fg">
        {habit ? "Alışkanlığı Düzenle" : "Alışkanlık Ekle"}
      </h2>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-fg/80 dark:text-fg/80 mb-1">
          İsim
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          placeholder="Alışkanlık adı"
          className="w-full px-3 py-2 border border-surface rounded-lg bg-bg dark:bg-neutral-800 text-fg dark:text-fg focus:outline-none focus:ring-2 focus:ring-critical"
        />
        {!isNameValid && trimmedName.length > 0 && (
          <p className="mt-1 text-xs text-red-500">İsim 1-50 karakter arasında olmalı</p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-fg/80 dark:text-fg/80 mb-2">
          Tür
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("boolean")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              type === "boolean"
                ? "bg-critical text-white"
                : "bg-surface dark:bg-neutral-800 text-fg/60 dark:text-fg/60"
            }`}
          >
            Yap / Yapma
          </button>
          <button
            type="button"
            onClick={() => setType("amount")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              type === "amount"
                ? "bg-critical text-white"
                : "bg-surface dark:bg-neutral-800 text-fg/60 dark:text-fg/60"
            }`}
          >
            Miktar
          </button>
        </div>
      </div>

      {/* Target Amount (only for amount type) */}
      {type === "amount" && (
        <div>
          <label htmlFor="targetAmount" className="block text-sm font-medium text-fg/80 dark:text-fg/80 mb-1">
            Hedef Sayı
          </label>
          <input
            id="targetAmount"
            type="number"
            min="1"
            value={targetAmount || ""}
            onChange={(e) => setTargetAmount(e.target.value ? parseInt(e.target.value) : null)}
            placeholder="Hedef sayı"
            className="w-full px-3 py-2 border border-surface rounded-lg bg-bg dark:bg-neutral-800 text-fg dark:text-fg focus:outline-none focus:ring-2 focus:ring-critical"
          />
          {!isAmountValid && (
            <p className="mt-1 text-xs text-red-500">Hedef en az 1 olmalı</p>
          )}
        </div>
      )}

      {/* Schedule */}
      <div>
        <label className="block text-sm font-medium text-fg/80 dark:text-fg/80 mb-2">
          Sıklık
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSchedule("daily")}
            className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              schedule === "daily"
                ? "bg-critical text-white"
                : "bg-surface dark:bg-neutral-800 text-fg/60 dark:text-fg/60"
            }`}
          >
            Her gün
          </button>
          <button
            type="button"
            onClick={() => setSchedule("weekdays")}
            className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              schedule === "weekdays"
                ? "bg-critical text-white"
                : "bg-surface dark:bg-neutral-800 text-fg/60 dark:text-fg/60"
            }`}
          >
            Hafta içi
          </button>
          <button
            type="button"
            onClick={() => setSchedule("weekends")}
            className={`flex-1 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              schedule === "weekends"
                ? "bg-critical text-white"
                : "bg-surface dark:bg-neutral-800 text-fg/60 dark:text-fg/60"
            }`}
          >
            Hafta sonu
          </button>
        </div>
      </div>

      {/* Importance */}
      <div>
        <label className="block text-sm font-medium text-fg/80 dark:text-fg/80 mb-2">
          Önem
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setImportance("critical")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              importance === "critical"
                ? "bg-red-500 text-white ring-2 ring-red-500 ring-offset-2 ring-offset-bg dark:ring-offset-neutral-900"
                : "bg-red-500/20 dark:bg-red-500/20 text-red-500"
            }`}
          >
            Kritik
          </button>
          <button
            type="button"
            onClick={() => setImportance("medium")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              importance === "medium"
                ? "bg-yellow-500 text-white ring-2 ring-yellow-500 ring-offset-2 ring-offset-bg dark:ring-offset-neutral-900"
                : "bg-yellow-500/20 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500"
            }`}
          >
            Orta
          </button>
          <button
            type="button"
            onClick={() => setImportance("low")}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              importance === "low"
                ? "bg-green-500 text-white ring-2 ring-green-500 ring-offset-2 ring-offset-bg dark:ring-offset-neutral-900"
                : "bg-green-500/20 dark:bg-green-500/20 text-green-600 dark:text-green-500"
            }`}
          >
            Düşük
          </button>
        </div>
      </div>

      {/* Emoji Picker */}
      <div>
        <label className="block text-sm font-medium text-fg/80 dark:text-fg/80 mb-2">
          Emoji
        </label>
        <div className="grid grid-cols-8 gap-2">
          {DEFAULT_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                emoji === e
                  ? "ring-2 ring-critical bg-surface dark:bg-neutral-800"
                  : "hover:bg-surface dark:hover:bg-neutral-800"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-fg/80 dark:text-fg/80 mb-2">
          Renk
        </label>
        <div className="flex gap-2 flex-wrap">
          {DEFAULT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full transition-all ${
                color === c ? "ring-2 ring-offset-2 ring-offset-bg dark:ring-offset-neutral-900" : ""
              }`}
              style={{
                backgroundColor: c,
                borderColor: color === c ? c : "transparent",
              }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      {/* Notification Time */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-fg/80 dark:text-fg/80 mb-2">
          <input
            type="checkbox"
            checked={notificationEnabled}
            onChange={(e) => setNotificationEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-surface"
          />
          Bildirim saati
        </label>
        {notificationEnabled && (
          <input
            type="time"
            value={notificationTime}
            onChange={(e) => setNotificationTime(e.target.value)}
            className="w-full px-3 py-2 border border-surface rounded-lg bg-bg dark:bg-neutral-800 text-fg dark:text-fg focus:outline-none focus:ring-2 focus:ring-critical"
          />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 px-4 py-2 rounded-lg font-medium text-fg/60 dark:text-fg/60 bg-surface dark:bg-neutral-800 hover:bg-surface/80 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="flex-1 px-4 py-2 rounded-lg font-medium bg-critical text-white hover:bg-critical/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}
