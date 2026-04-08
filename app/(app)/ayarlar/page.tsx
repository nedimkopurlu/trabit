"use client";

import { useState } from "react";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IdentitySentenceForm } from "@/components/IdentitySentenceForm";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import HabitList from "@/components/HabitList";
import HabitFormSheet from "@/components/HabitFormSheet";
import type { Habit } from "@/lib/habit-types";

export default function AyarlarPage() {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditSheetOpen(true);
  };

  const handleCloseEdit = () => {
    setEditSheetOpen(false);
    setEditingHabit(null);
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-fg dark:text-fg mb-6">Ayarlar</h1>

      {/* Appearance Section */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-fg dark:text-fg mb-3">Görünüm</h2>
        <ThemeToggle />
      </section>

      {/* Identity Section */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-fg dark:text-fg mb-3">Kimlik</h2>
        <IdentitySentenceForm />
      </section>

      {/* Notifications Section */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-fg dark:text-fg mb-3">Bildirimler</h2>
        <NotificationPermissionBanner />
        <p className="text-xs text-fg/60 mt-2 p-3 bg-surface rounded-lg">
          Bildirimler, uygulama açık iken gönderilir.
          iOS PWA kısıtlaması nedeniyle arka planda bildirim gönderilemez.
          Bildirimler hakkında daha fazla bilgi için lütfen ayarlarınızı kontrol ediniz.
        </p>
      </section>

      {/* Habits Section */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-fg dark:text-fg mb-3">Alışkanlıklar</h2>
        <HabitList onEditHabit={handleEditHabit} />
      </section>

      {/* Account Section */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-fg dark:text-fg mb-3">Hesap</h2>
        <SignOutButton />
      </section>

      {/* Edit Sheet */}
      <HabitFormSheet
        open={editSheetOpen}
        habit={editingHabit || undefined}
        onClose={handleCloseEdit}
      />
    </main>
  );
}
