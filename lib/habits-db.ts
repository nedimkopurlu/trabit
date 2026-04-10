import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  type CollectionReference,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Habit, HabitInput } from "./habit-types";
import { IMPORTANCE_ORDER } from "./habit-types";

export function habitsCollection(uid: string): CollectionReference {
  return collection(db, "users", uid, "habits");
}

export async function createHabit(uid: string, input: HabitInput): Promise<string> {
  const ref = await addDoc(habitsCollection(uid), {
    ...input,
    order: IMPORTANCE_ORDER[input.importance],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateHabit(
  uid: string,
  habitId: string,
  patch: Partial<HabitInput>
): Promise<void> {
  const updates: Record<string, unknown> = { ...patch, updatedAt: serverTimestamp() };
  if (patch.importance) updates.order = IMPORTANCE_ORDER[patch.importance];
  await updateDoc(doc(db, "users", uid, "habits", habitId), updates);
}

export async function deleteHabit(uid: string, habitId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "habits", habitId));
}

// Reorder habits by writing each habit's new index as its `order` field
export async function reorderHabits(uid: string, orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((habitId, index) => {
    batch.update(doc(db, "users", uid, "habits", habitId), { order: index });
  });
  await batch.commit();
}
