"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TabBar from "@/components/TabBar";
import FAB from "@/components/FAB";
import HabitFormSheet from "@/components/HabitFormSheet";
import { useAuth } from "@/lib/auth-context";
import { useHabits } from "@/lib/use-habits";
import { requestNotificationPermission } from "@/lib/notification-permissions";
import { checkNotifications, fireNotification } from "@/lib/notification-scheduler";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, hasOnboarded } = useAuth();
  const { habits } = useHabits();
  const router = useRouter();
  const [fabSheetOpen, setFabSheetOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!hasOnboarded) router.replace("/onboarding"); // D-12
  }, [user, loading, hasOnboarded, router]);

  // Request notification permission once on first login
  useEffect(() => {
    if (!user || !hasOnboarded) return;
    requestNotificationPermission().catch(console.error);
  }, [user, hasOnboarded]);

  // Check for due notifications on app load and every 60 seconds
  useEffect(() => {
    if (!user || !hasOnboarded || !habits.length) return;

    const checkAndFire = async () => {
      const dueHabitIds = checkNotifications(habits);
      for (const habitId of dueHabitIds) {
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          await fireNotification(habitId, habit.name);
        }
      }
    };

    // Check immediately on mount
    checkAndFire();

    // Then check every 60 seconds
    const interval = setInterval(checkAndFire, 60000);

    return () => clearInterval(interval);
  }, [user, hasOnboarded, habits]);

  if (loading || !user || !hasOnboarded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md min-h-screen pb-20 md:pb-0 md:pl-56">
      {children}
      <FAB onClick={() => setFabSheetOpen(true)} />
      <TabBar />
      <HabitFormSheet open={fabSheetOpen} onClose={() => setFabSheetOpen(false)} />
    </div>
  );
}
