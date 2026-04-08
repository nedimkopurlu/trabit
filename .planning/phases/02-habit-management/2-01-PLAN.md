---
phase: 02-habit-management
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/habit-types.ts
  - lib/habits-db.ts
  - lib/use-habits.ts
  - firestore.rules
autonomous: true
requirements: [HABIT-01, HABIT-02, HABIT-03, HABIT-04]
must_haves:
  truths:
    - "Habit type contract is defined and importable across the app"
    - "CRUD functions create, read, update, delete habits under users/{uid}/habits"
    - "useHabits hook returns realtime-sorted habit list for current user"
    - "Firestore security rules allow a signed-in user to read/write only their own habits subcollection"
  artifacts:
    - path: "lib/habit-types.ts"
      provides: "Habit interface + enum literal unions"
      contains: "export interface Habit"
    - path: "lib/habits-db.ts"
      provides: "createHabit, updateHabit, deleteHabit, habitsCollection"
      exports: ["createHabit", "updateHabit", "deleteHabit", "habitsCollection"]
    - path: "lib/use-habits.ts"
      provides: "useHabits() realtime hook"
      exports: ["useHabits"]
    - path: "firestore.rules"
      provides: "Security rule for users/{uid}/habits/{habitId}"
      contains: "match /habits/{habitId}"
  key_links:
    - from: "lib/use-habits.ts"
      to: "lib/habits-db.ts"
      via: "onSnapshot on habitsCollection(uid)"
      pattern: "onSnapshot\\(.*habitsCollection"
    - from: "lib/habits-db.ts"
      to: "lib/firebase.ts"
      via: "db import"
      pattern: "from \"./firebase\""
---

<objective>
Establish the Phase 2 data layer: Habit type contract (D-01, D-03), Firestore CRUD primitives for `users/{uid}/habits/{habitId}`, a realtime `useHabits` hook (D-14, D-15), and security rules updated to permit the habits subcollection.

Purpose: Plans 02 and 03 (form + list/FAB) need a stable contract and working CRUD before building UI. No UI in this plan.
Output: Type definitions, CRUD module, realtime hook, updated Firestore rules.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-habit-management/2-CONTEXT.md
@lib/firebase.ts
@lib/user-doc.ts
@lib/auth-context.tsx
@firestore.rules

<interfaces>
From lib/user-doc.ts (CRUD pattern to mirror):
```typescript
// Uses: doc(db, "users", uid), setDoc, updateDoc, serverTimestamp
// Pattern: async function <verb>(uid, ...payload): Promise<T>
```

From lib/auth-context.tsx:
```typescript
export function useAuth(): { user: User | null; loading: boolean; /* ... */ }
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Define Habit type contract</name>
  <files>lib/habit-types.ts</files>
  <read_first>
    - lib/user-doc.ts (existing type/pattern)
    - .planning/phases/02-habit-management/2-CONTEXT.md (D-01, D-03)
  </read_first>
  <action>
    Create `lib/habit-types.ts`. Export exactly these symbols (per D-01, D-03):

    ```ts
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
    ```

    Do NOT import from firebase/app (only `Timestamp` as type).
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - grep -q 'export interface Habit' lib/habit-types.ts
    - grep -q 'HabitType = "boolean" | "amount"' lib/habit-types.ts
    - grep -q 'HabitSchedule = "daily" | "weekdays" | "weekends"' lib/habit-types.ts
    - grep -q 'IMPORTANCE_ORDER' lib/habit-types.ts
    - grep -q 'DEFAULT_COLORS' lib/habit-types.ts
    - grep -q 'DEFAULT_EMOJIS' lib/habit-types.ts
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>File exists with all exports; tsc passes.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Firestore habits CRUD module</name>
  <files>lib/habits-db.ts, firestore.rules</files>
  <read_first>
    - lib/firebase.ts
    - lib/user-doc.ts
    - lib/habit-types.ts (from Task 1)
    - firestore.rules (current state)
  </read_first>
  <action>
    Create `lib/habits-db.ts` implementing the CRUD contract (per D-01, D-02, D-14):

    ```ts
    import {
      collection, doc, addDoc, updateDoc, deleteDoc,
      serverTimestamp, type CollectionReference,
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
      uid: string, habitId: string, patch: Partial<HabitInput>
    ): Promise<void> {
      const updates: Record<string, unknown> = { ...patch, updatedAt: serverTimestamp() };
      if (patch.importance) updates.order = IMPORTANCE_ORDER[patch.importance];
      await updateDoc(doc(db, "users", uid, "habits", habitId), updates);
    }

    export async function deleteHabit(uid: string, habitId: string): Promise<void> {
      await deleteDoc(doc(db, "users", uid, "habits", habitId));
    }
    ```

    Then update `firestore.rules` to allow the signed-in user to read/write their own `habits` subcollection. Inside the existing `match /users/{userId}` block, add:

    ```
    match /habits/{habitId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    ```

    If the file does not already contain a `match /users/{userId}` block, add one that also allows the parent user doc (matching Phase 1 behavior). Do NOT loosen any existing rules.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - grep -q 'export function habitsCollection' lib/habits-db.ts
    - grep -q 'export async function createHabit' lib/habits-db.ts
    - grep -q 'export async function updateHabit' lib/habits-db.ts
    - grep -q 'export async function deleteHabit' lib/habits-db.ts
    - grep -q 'match /habits/{habitId}' firestore.rules
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>CRUD module compiles; rules include habits subcollection.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: useHabits realtime hook</name>
  <files>lib/use-habits.ts</files>
  <read_first>
    - lib/auth-context.tsx (useAuth shape)
    - lib/habits-db.ts
    - lib/habit-types.ts
  </read_first>
  <action>
    Create `lib/use-habits.ts` (per D-14, D-15). Implements a realtime hook that returns habits sorted by `order` then `createdAt`:

    ```ts
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
        const q = query(habitsCollection(user.uid), orderBy("order", "asc"), orderBy("createdAt", "asc"));
        const unsub = onSnapshot(
          q,
          (snap) => {
            const list: Habit[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Habit, "id">) }));
            setHabits(list);
            setLoading(false);
          },
          (err) => { setError(err); setLoading(false); }
        );
        return () => unsub();
      }, [user]);

      return { habits, loading, error };
    }
    ```
  </action>
  <verify>
    <automated>npx tsc --noEmit && npx next build 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - grep -q 'export function useHabits' lib/use-habits.ts
    - grep -q 'onSnapshot' lib/use-habits.ts
    - grep -q 'orderBy("order"' lib/use-habits.ts
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Hook compiles, uses onSnapshot against habitsCollection, sorts by order then createdAt.</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes (no type errors)
- `lib/habit-types.ts`, `lib/habits-db.ts`, `lib/use-habits.ts` all exist
- `firestore.rules` contains `match /habits/{habitId}` inside user match
</verification>

<success_criteria>
Data layer for habits is ready and typed. Plans 02 and 03 can import `Habit`, `HabitInput`, `createHabit`, `updateHabit`, `deleteHabit`, and `useHabits` without further scaffolding.
</success_criteria>

<output>
After completion, create `.planning/phases/02-habit-management/2-01-SUMMARY.md`
</output>
