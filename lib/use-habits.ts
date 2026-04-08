"use client";
import { useEffect, useState } from "react";
import { onSnapshot, query, orderBy } from "firebase/firestore";
import { habitsCollection } from "./habits-db";
import type { Habit } from "./habit-types";
import { useAuth } from "./auth-context";

export interface UseHabitsResult {
  habits: Habit[];
  loading: boolean;
  error: Error | null;
}

export function useHabits(): UseHabitsResult {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      habitsCollection(user.uid),
      orderBy("order", "asc"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Habit[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Habit, "id">),
        }));
        setHabits(list);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  return { habits, loading, error };
}
