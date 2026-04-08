/**
 * useHabitCompletion Hook
 * 
 * Manages habit completion state with optimistic UI updates and Firestore real-time sync.
 */

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { useHabits } from "./use-habits";
import {
  markComplete,
  undoCompletion,
  listenToTodaysCompletions,
  HabitCompletion,
} from "./completions-db";
import { getTodayKeyInTimezone, getUserTimezone } from "./habit-schedule";

export interface UseHabitCompletionReturn {
  isComplete: boolean; // Is habit marked complete today?
  amount: number; // Current amount (for amount-type habits)
  loading: boolean; // True while Firestore operation pending
  error: Error | null; // Last error (if any)
  toggleComplete(quick?: boolean): Promise<void>; // Toggle completion
  setAmount(newAmount: number): Promise<void>; // Update amount
}

/**
 * Hook to manage completion state for a habit
 * 
 * @param habitId - Habit ID to track
 * @returns Completion state and handlers
 */
export function useHabitCompletion(habitId: string): UseHabitCompletionReturn {
  const { user } = useAuth();
  const uid = user?.uid;
  const { habits } = useHabits();
  const [isComplete, setIsComplete] = useState(false);
  const [amount, setAmountState] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const habit = habits.find(h => h.id === habitId);
  const timezone = getUserTimezone();
  const todayKey = getTodayKeyInTimezone(timezone);

  // Set up real-time listener on mount
  useEffect(() => {
    if (!uid || !habitId) {
      return;
    }

    // Start listening to today's completion
    const unsubscribe = listenToTodaysCompletions(
      uid,
      habitId,
      todayKey,
      (completion: HabitCompletion | null) => {
        if (completion) {
          setIsComplete(true);
          if (habit?.type === "amount" && completion.amount !== undefined) {
            setAmountState(completion.amount);
          } else {
            setAmountState(completion.completed ? 1 : 0);
          }
        } else {
          setIsComplete(false);
          setAmountState(0);
        }
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [uid, habitId, todayKey, habit?.type]);

  const toggleComplete = useCallback(
    async (quick: boolean = false) => {
      if (!uid || !habitId) {
        setError(new Error("Not authenticated"));
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (isComplete) {
          // Uncomplete: delete the document
          await undoCompletion(uid, habitId, todayKey);
          setIsComplete(false);
          setAmountState(0);
        } else {
          // Complete: mark the document
          await markComplete(uid, habitId, todayKey, 1, quick);
          setIsComplete(true);
          setAmountState(1);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        // Revert optimistic update on error
        setIsComplete(prev => !prev);
      } finally {
        setLoading(false);
      }
    },
    [uid, habitId, todayKey, isComplete]
  );

  const setAmount = useCallback(
    async (newAmount: number) => {
      if (!uid || !habitId || habit?.type !== "amount") {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Clamp to valid range
        const clamped = Math.max(0, Math.min(newAmount, habit.targetAmount || 999));

        await markComplete(uid, habitId, todayKey, clamped, false);
        setAmountState(clamped);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        // Don't revert amount here; let listener handle it
      } finally {
        setLoading(false);
      }
    },
    [uid, habitId, todayKey, habit?.type, habit?.targetAmount]
  );

  return {
    isComplete,
    amount,
    loading,
    error,
    toggleComplete,
    setAmount,
  };
}
