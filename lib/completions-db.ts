/**
 * Firestore Completion Database Layer
 * 
 * Habits completion stored as subcollection at:
 * /users/{uid}/habits/{habitId}/completions/{dateStr}
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  onSnapshot,
  Query,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export interface HabitCompletion {
  date: string; // YYYY-MM-DD in user's timezone
  completed: boolean; // Always true (soft-delete: remove doc instead)
  amount?: number; // For "amount" type habits, current value
  quick?: boolean; // true if marked complete via "2dk" quick action
  completedAt: Timestamp; // server timestamp when marked complete
}

/**
 * Mark a habit as complete for a given date (idempotent)
 * 
 * @param uid - User ID from Firebase Auth
 * @param habitId - Habit ID
 * @param dateStr - Date string in YYYY-MM-DD format (user's timezone)
 * @param amount - Optional amount value (for amount-type habits)
 * @param quick - Optional flag for quick completion
 */
export async function markComplete(
  uid: string,
  habitId: string,
  dateStr: string,
  amount?: number,
  quick?: boolean
): Promise<void> {
  const completionRef = doc(
    db,
    `users/${uid}/habits/${habitId}/completions/${dateStr}`
  );

  const data: HabitCompletion = {
    date: dateStr,
    completed: true,
    quick: quick || false,
    completedAt: Timestamp.now(),
  };

  if (amount !== undefined) {
    data.amount = amount;
  }

  // Use merge: true for idempotency (calling twice = no issue)
  await setDoc(completionRef, data, { merge: true });
}

/**
 * Undo a completion (delete the document)
 * 
 * @param uid - User ID
 * @param habitId - Habit ID
 * @param dateStr - Date string in YYYY-MM-DD format
 */
export async function undoCompletion(
  uid: string,
  habitId: string,
  dateStr: string
): Promise<void> {
  const completionRef = doc(
    db,
    `users/${uid}/habits/${habitId}/completions/${dateStr}`
  );
  await deleteDoc(completionRef);
}

/**
 * Get completion for a specific date
 * 
 * @param uid - User ID
 * @param habitId - Habit ID
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Completion object or null if not found
 */
export async function getCompletionForDate(
  uid: string,
  habitId: string,
  dateStr: string
): Promise<HabitCompletion | null> {
  try {
    const completionRef = doc(
      db,
      `users/${uid}/habits/${habitId}/completions/${dateStr}`
    );
    const snapshot = await getDoc(completionRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as HabitCompletion;
  } catch (error) {
    console.error("Error fetching completion:", error);
    return null;
  }
}

/**
 * Get completions within a date range (for streak calculations)
 * 
 * @param uid - User ID
 * @param habitId - Habit ID
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 * @returns Array of completions in range
 */
export async function getCompletionsInRange(
  uid: string,
  habitId: string,
  startDate: string,
  endDate: string
): Promise<HabitCompletion[]> {
  try {
    const completionsRef = collection(
      db,
      `users/${uid}/habits/${habitId}/completions`
    );

    // Firestore doesn't support range queries on doc IDs directly,
    // so we fetch all and filter in-memory
    // For production, consider using a "date" field with proper indexing
    const snapshot = await getDocs(completionsRef);

    return snapshot.docs
      .map(doc => doc.data() as HabitCompletion)
      .filter(c => c.date >= startDate && c.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching completions in range:", error);
    return [];
  }
}

/**
 * Set up real-time listener for today's completion document
 * 
 * @param uid - User ID
 * @param habitId - Habit ID
 * @param dateStr - Date string (YYYY-MM-DD)
 * @param callback - Function to call when completion state changes
 * @returns Unsubscribe function
 */
export function listenToTodaysCompletions(
  uid: string,
  habitId: string,
  dateStr: string,
  callback: (completion: HabitCompletion | null) => void
): Unsubscribe {
  const completionRef = doc(
    db,
    `users/${uid}/habits/${habitId}/completions/${dateStr}`
  );

  return onSnapshot(
    completionRef,
    snapshot => {
      if (!snapshot.exists()) {
        callback(null);
      } else {
        callback(snapshot.data() as HabitCompletion);
      }
    },
    error => {
      console.error("Error listening to completions:", error);
      callback(null);
    }
  );
}
