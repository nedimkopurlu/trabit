export default function BugunPage() {
  return <TodayPageClient />;
}

"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useHabits } from "@/lib/use-habits";
import { useAuth } from "@/lib/auth-context";
import { isHabitScheduledToday, getUserTimezone } from "@/lib/habit-schedule";
import { IMPORTANCE_ORDER } from "@/lib/habit-types";
import { TodayHabitCard } from "@/components/TodayHabitCard";
import { AmountHabitCard } from "@/components/AmountHabitCard";
import { ToastContainer } from "@/components/ToastContainer";
import { CelebrationScreen } from "@/components/CelebrationScreen";
import { useHabitCompletion } from "@/lib/use-habit-completion";

function TodayPageClient() {
  const { habits, loading } = useHabits();
  const { identitySentence } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);

  const timezone = getUserTimezone();

  // Filter habits scheduled for today and sort by importance
  const todayHabits = useMemo(() => {
    return habits
      .filter(h => isHabitScheduledToday(h.schedule, timezone))
      .sort((a, b) => {
        return IMPORTANCE_ORDER[a.importance] - IMPORTANCE_ORDER[b.importance];
      });
  }, [habits, timezone]);

  // Track completion count by listening to all today's habits
  const completionStates = todayHabits.map(h => useHabitCompletion(h.id));
  const completedCount = completionStates.filter(c => c.isComplete).length;

  // Show celebration when all habits are completed
  useEffect(() => {
    if (
      todayHabits.length > 0 &&
      completedCount === todayHabits.length &&
      !showCelebration
    ) {
      setShowCelebration(true);
    }
  }, [completedCount, todayHabits.length, showCelebration]);

  if (loading) {
    return (
      <main className="p-4 pb-20">
        <h1 className="text-2xl font-semibold mb-4">Bugün</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-neutral-700 border-t-gray-900 dark:border-t-gray-100"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 pb-20">
      <h1 className="text-2xl font-semibold mb-4">Bugün</h1>

      {todayHabits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Bugün alışkanlık yok
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {todayHabits.map(habit => 
            habit.type === "boolean" ? (
              <TodayHabitCard key={habit.id} habit={habit} />
            ) : (
              <AmountHabitCard key={habit.id} habit={habit} />
            )
          )}
        </AnimatePresence>
      )}

      {showCelebration && identitySentence && (
        <CelebrationScreen
          habitCount={completedCount}
          identitySentence={identitySentence}
          onDismiss={() => setShowCelebration(false)}
        />
      )}

      <ToastContainer />
    </main>
  );
}
