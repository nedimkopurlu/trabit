---
phase: 02-habit-management
plan: 01
subsystem: data-layer
tags: [types, crud, hooks, firestore, realtime]
dependency_graph:
  requires: [firebase-init, auth-context]
  provides: [habit-types, habits-db, use-habits]
  affects: []
tech_stack:
  added: []
  patterns: [firestore-subcollections, realtime-hooks, ordered-queries]
key_files:
  created:
    - lib/habit-types.ts
    - lib/habits-db.ts
    - lib/use-habits.ts
  modified:
    - firestore.rules
decisions:
  - Habits stored in users/{uid}/habits subcollection for per-user isolation
  - Order field auto-calculated from importance for efficient sorting
  - useHabits returns pre-sorted list (order→createdAt) eliminating client-side sorting
  - Firestore security rules mirror user doc pattern (auth.uid === uid)
metrics:
  duration_minutes: 1
  tasks_completed: 3
  files_created: 3
  files_modified: 1
  commits: 3
  completed_at: "2026-04-08T16:01:21Z"
---

# Phase 02 Plan 01: Data Layer — Summary

**One-liner:** Habit type contract, Firestore CRUD primitives (users/{uid}/habits), realtime useHabits hook with importance-based sorting, and security rules.

## What Was Built

Established the complete data layer for Phase 2 habit management:

1. **Type contract** (`lib/habit-types.ts`): Habit interface with all fields (name, type, schedule, importance, emoji, color, notificationTime, targetAmount, order, timestamps), enum literal unions, HabitInput helper, and UI defaults (colors, emojis)

2. **CRUD module** (`lib/habits-db.ts`): Four primitives mirroring user-doc pattern:
   - `habitsCollection(uid)` → subcollection ref
   - `createHabit(uid, input)` → adds habit with auto-order and timestamps
   - `updateHabit(uid, habitId, patch)` → partial update with order recalculation
   - `deleteHabit(uid, habitId)` → removes habit

3. **Realtime hook** (`lib/use-habits.ts`): useHabits() returns {habits, loading, error} with onSnapshot listener, pre-sorted by order then createdAt

4. **Security rules**: Updated firestore.rules to allow authenticated user read/write on their habits subcollection

## Tasks Completed

| Task | Name                          | Commit  | Files                                     |
| ---- | ----------------------------- | ------- | ----------------------------------------- |
| 1    | Define Habit type contract    | d1cb4cf | lib/habit-types.ts                        |
| 2    | Firestore habits CRUD module  | 65f9fb9 | lib/habits-db.ts, firestore.rules         |
| 3    | useHabits realtime hook       | d14032f | lib/use-habits.ts                         |

## Deviations from Plan

None — plan executed exactly as written.

## Technical Details

**Type Safety:**
- All Firestore operations typed through Habit and HabitInput
- IMPORTANCE_ORDER constant ensures consistent order calculation
- Timestamp type imported from firebase/firestore (type-only)

**Realtime Architecture:**
- useHabits uses onSnapshot for automatic UI updates on create/update/delete
- Query sorts at Firestore level (`orderBy("order", "asc"), orderBy("createdAt", "asc")`)
- Hook cleans up listener on unmount (prevents memory leaks)

**Security:**
- Habits subcollection inherits user-level auth check (request.auth.uid == uid)
- Nested match rule follows Firestore best practice for subcollections

## Verification

✅ All acceptance criteria passed:
- `npx tsc --noEmit` exits 0 (no type errors)
- All exports present and correctly typed
- Firestore rules include habits subcollection match

## Known Stubs

None — data layer is fully functional and production-ready.

## Integration Points

**For Plan 02 (Form UI):**
- Import Habit, HabitInput, DEFAULT_COLORS, DEFAULT_EMOJIS from habit-types
- Import createHabit, updateHabit from habits-db
- Use HabitInput type for form state and validation

**For Plan 03 (Integration):**
- Import useHabits hook for realtime habit list
- Import deleteHabit for delete flow
- All CRUD operations work with current user via useAuth().user.uid

## Next Steps

Plan 02 (Form UI) can now build HabitForm and HabitFormSheet components using these contracts without further scaffolding.
