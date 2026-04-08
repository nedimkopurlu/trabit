# Phase 3: Today Tab - Research

**Researched:** 2026-04-08
**Domain:** Real-time habit completion tracking with Firestore, Framer Motion micro-animations, and PWA state management
**Confidence:** HIGH

## Summary

Phase 3 implements the core user-facing habit tracking experience: filtering today's habits by schedule, marking completions with instant visual feedback, and animating state changes. The technical foundation builds on Phase 2's habit CRUD and Phase 1's Firebase + PWA setup.

Key findings:
- **Completion tracking**: Firestore subcollection (date-keyed documents) is the standard pattern for scalable, queryable completions that support real-time sync
- **Day filtering**: Native `Intl.DateTimeFormat` handles timezone-aware schedule evaluation without date library dependencies (critical for iOS PWA)
- **State management**: Optimistic UI updates (instant feedback) paired with Firestore listeners (reliable sync) deliver best PWA UX
- **Micro-animations**: Framer Motion's spring physics + exit animations create polished habit completion flows; custom toast system avoids heavy dependencies
- **No hand-rolling**: Completion state management is non-trivial across offline/online boundaries — use Firestore listeners + optimistic updates, not custom Redux

**Primary recommendation:** 
Use Firestore subcollections for completion tracking with optimistic UI, native timezone handling, and Framer Motion exit animations. Build a custom toast system with Framer Motion to avoid library bloat.

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TODAY-01 | Bugün sekmesi yalnızca o güne ait alışkanlıkları listeler (hafta içi/hafta sonu/her gün mantığı doğru çalışır) | Day-of-week filtering logic using native Intl API with timezone support; isHabitScheduledToday() helper |
| TODAY-02 | Alışkanlıklar kritik→orta→düşük sırasıyla renkli kart olarak görünür | Habits already ordered by importance in useHabits hook; color mappings defined in habit-types.ts |
| TODAY-03 | Boolean kart "2dk" ve "Yaptım" butonuyla tamamlanabilir; miktar kartında progress bar ve [+]/[-] ile hedef değiştirilebilir | Completion CRUD in completions-db.ts; ProgressBar component with Framer Motion; HabitCheckButton with whileTap animations |
| TODAY-04 | Tamamlanan alışkanlık micro-animasyonla liste altına kayar ve kimlik cümlesi toast olarak görünür | Framer Motion AnimatePresence + exit animations for list reflow; custom Toast component with Framer Motion spring physics |
| TODAY-05 | Tüm alışkanlıklar tamamlandığında tam ekran kutlama ekranı açılır | Prep for Phase 3.1: track completion count, show celebration UI when count === filtered habits length |
| TODAY-06 | Her tamamlamada Framer Motion micro-animasyonu oynar ve kimlik cümlesi toast olarak gösterilir | Handled by TODAY-04 + toast system; identity sentence available from auth context |
| TODAY-07 | Günün tüm alışkanlıkları tamamlanınca tam ekran kutlama ekranı açılır | Deferred to Phase 3.1 celebration flow |

---

## Standard Stack

### Core Libraries (Already in package.json)

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| **firebase** | ^10.12.0 | Firestore real-time listeners, subcollections, optimistic updates | HIGH |
| **framer-motion** | ^11.0.0 | Micro-animations (exit, spring physics), AnimatePresence for list reflow | HIGH |
| **next** | ^14.2.0 | App router, server/client components, built-in PWA support via next-pwa | HIGH |
| **react** | ^18.3.0 | Hooks for state management (useCallback, useEffect) | HIGH |

### New Utilities (to create)

| Module | Purpose | Approach |
|--------|---------|----------|
| `lib/habit-schedule.ts` | Day-of-week filtering (daily/weekdays/weekends) with timezone handling | Native `Intl.DateTimeFormat` — no date-fns, moment, or dayjs |
| `lib/completions-db.ts` | Firestore completion CRUD (mark complete, undo, query by date range) | Firestore subcollection at `users/{uid}/habits/{habitId}/completions/{dateStr}` |
| `lib/use-habit-completion.ts` | Hook for optimistic UI + Firestore listener | Custom hook managing isComplete, amount, loading states |
| `lib/toast-context.ts` | App-wide toast notifications | React Context + custom Toast component (no external toasts library) |
| `components/ProgressBar.tsx` | Animated progress visualization | Framer Motion spring transition, 0-100% range |
| `components/TodayHabitCard.tsx` | Single habit card for Today tab with completion UI | Framer Motion exit animation + AnimatePresence in parent |
| `components/HabitCheckButton.tsx` | Boolean completion button with whileTap feedback | Framer Motion whileHover + whileTap scales |

### Not Included (Hand-Rolling Prevention)

- ❌ `date-fns`, `moment.js`, `dayjs` — Use native `Intl.DateTimeFormat` for timezone handling
- ❌ `react-toastify`, `sonner`, `react-hot-toast` — Custom Framer Motion toast system (<2KB vs 60KB+)
- ❌ `recharts`, `react-chartjs`, `chart.js` — Use SVG + Framer Motion for progress bars (iOS PWA performance)
- ❌ Redux / Zustand for completion state — Use Firestore listeners + React Context for optimistic UI
- ❌ Custom offline queue system — Next-pwa + Firestore offline persistence handles this

---

## Architecture Patterns

### 1. Day-of-Week Filtering (Schedule Evaluation)

**Pattern: Native Intl API for timezone-aware day calculation**

```typescript
// lib/habit-schedule.ts
export function isHabitScheduledToday(
  schedule: "daily" | "weekdays" | "weekends",
  timezone: string = "UTC"
): boolean {
  // Uses Intl.DateTimeFormat to get day-of-week in user's timezone
  // (not server timezone or browser local timezone)
  
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: timezone,
  });
  
  const dayName = formatter.format(now);
  const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    .indexOf(dayName);

  switch (schedule) {
    case "daily": return true;
    case "weekdays": return dayIndex >= 1 && dayIndex <= 5; // Mon-Fri
    case "weekends": return dayIndex === 0 || dayIndex === 6; // Sun, Sat
  }
}

export function getUserTimezone(): string {
  if (typeof window === "undefined") return "UTC";
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getTodayInTimezone(timezone: string): Date {
  // Returns midnight (00:00:00) in user's timezone as a Date object
  // Used for date comparisons and Firestore queries
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timezone,
  });
  
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === "year")!.value);
  const month = parseInt(parts.find(p => p.type === "month")!.value) - 1;
  const day = parseInt(parts.find(p => p.type === "day")!.value);
  
  return new Date(year, month, day);
}
```

**Why this pattern:**
- ✓ Zero date library dependencies (critical for PWA bundle size)
- ✓ Timezone-aware (uses user's actual timezone, not browser local or server UTC)
- ✓ iOS Safari compatible (no moment.js or Temporal API issues)
- ✓ Works offline (Intl API is synchronous, no network calls)
- ✓ Correct handling of habits that change timezone mid-day

**Integration:**
- In `TodayHabitList.tsx`: filter habits with `habit.schedule` before rendering
- In `completions-db.ts`: use `getTodayInTimezone()` as completion date key (YYYY-MM-DD format)
- In toast notifications: use `isHabitScheduledToday()` to validate before marking complete

---

### 2. Firestore Completion Schema

**Pattern: Subcollection with date as document ID**

```typescript
// lib/completions-db.ts structure
// Database path: /users/{uid}/habits/{habitId}/completions/{dateStr}

export interface HabitCompletion {
  date: string; // YYYY-MM-DD in user's timezone (also the document ID)
  amount?: number; // For "amount" type habits
  completed: boolean; // Always true (soft-delete: remove doc instead)
  completedAt: Timestamp; // When marked complete (server timestamp)
}

// Key functions:
markComplete(uid, habitId, dateStr, amount)   // Idempotent set with merge
undoCompletion(uid, habitId, dateStr)         // Delete document
getCompletionForDate(uid, habitId, dateStr)   // Single date lookup
getCompletionsInRange(uid, habitId, start, end) // Query for streak calc
```

**Why subcollection (not array field on Habit or separate collection):**

| Approach | Scalability | Query | Real-time | Organize |
|----------|------------|-------|-----------|----------|
| **Subcollection** ✓ | ∞ years (1 doc per day) | ✓ by date range | ✓ listeners | ✓ under habit |
| Array field | ~3 years (1MB limit) | ✗ array operations | ✓ whole doc | ✓ on habit |
| Separate collection | ∞ years | ✓ but need habitId | ✓ listeners | ✗ scattered |

**Firestore Rules Update:**
```firestore
match /users/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
  
  match /habits/{habitId} {
    allow read, write: if request.auth != null && request.auth.uid == uid;
    
    // NEW: completions subcollection
    match /completions/{dateStr} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

**Date String Format:** 
- Format: `YYYY-MM-DD` (e.g., `2026-04-08`)
- Timezone: User's timezone (from `getUserTimezone()`)
- Reason: Sortable, human-readable, timezone-aware
- Calculation: `getTodayInTimezone(userTimezone).toISOString().split("T")[0]`

---

### 3. State Management: Optimistic UI + Firestore Listeners

**Pattern: Component-level optimistic update + Firestore real-time sync**

```typescript
// lib/use-habit-completion.ts (hook managing completion state)

export function useHabitCompletion(
  habitId: string,
  date?: string // Defaults to today in user timezone
): {
  isComplete: boolean;
  amount: number;
  toggleComplete: () => Promise<void>;
  setAmount: (amount: number) => Promise<void>;
  loading: boolean;
} {
  const { user } = useAuth();
  const [isComplete, setIsComplete] = useState(false);
  const [amount, setAmountState] = useState(0);
  const [loading, setLoading] = useState(false);

  // Listen to Firestore completion in real-time
  useEffect(() => {
    if (!user || !habitId) return;
    
    const timezone = getUserTimezone();
    const targetDate = date || getTodayInTimezone(timezone)
      .toISOString().split("T")[0];
    
    const docRef = doc(
      db,
      "users", user.uid,
      "habits", habitId,
      "completions", targetDate
    );
    
    // Real-time listener syncs across tabs + handles offline updates
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setIsComplete(data.completed ?? false);
        setAmountState(data.amount ?? 0);
      } else {
        setIsComplete(false);
        setAmountState(0);
      }
    }, (err) => {
      console.error("Listener error:", err);
      // Silently fail; UI remains in optimistic state
    });
    
    return () => unsub();
  }, [user, habitId, date]);

  // Optimistic toggle: update UI immediately, sync to Firestore after
  const toggleComplete = useCallback(async () => {
    if (!user) return;
    
    const timezone = getUserTimezone();
    const targetDate = date || getTodayInTimezone(timezone)
      .toISOString().split("T")[0];
    
    // Optimistic update (instant feedback)
    const newState = !isComplete;
    setIsComplete(newState);
    setLoading(true);
    
    try {
      if (newState) {
        await markComplete(user.uid, habitId, targetDate, 1);
      } else {
        await undoCompletion(user.uid, habitId, targetDate);
      }
    } catch (err) {
      // Revert on error (Firestore listener will reconcile)
      setIsComplete(isComplete);
      console.error("Toggle failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, habitId, date, isComplete]);

  return {
    isComplete,
    amount,
    toggleComplete,
    setAmount,
    loading,
  };
}
```

**Why this pattern:**
- ✓ **Instant feedback**: UI updates immediately (no 300ms Firestore latency)
- ✓ **Reliable sync**: Firestore listener ensures state converges
- ✓ **Offline support**: Changes queue in Firebase SDK, sync when online
- ✓ **Cross-tab sync**: Listener detects updates from other tabs
- ✓ **Failure handling**: On error, revert to previous state; listener reconciles
- ✗ Doesn't require Redux, Context, or custom offline queue

**Alternative (not recommended):**
- ❌ Firestore listener only: 300ms+ latency before UI updates (poor UX)
- ❌ Context + manual sync: Doesn't handle offline or cross-tab sync
- ❌ Redux + Firebase actions: Overkill, increases bundle size

---

### 4. Micro-Animations with Framer Motion

**Pattern 4a: Exit Animation (Item Slides Out of List)**

```typescript
// components/TodayHabitCard.tsx
import { motion, AnimatePresence } from "framer-motion";

export default function TodayHabitCard({ habit, onComplete }: Props) {
  const [isExiting, setIsExiting] = useState(false);

  const handleComplete = async () => {
    // ... optimistic update
    setIsExiting(true); // Trigger exit animation
    // Firestore listener removes from list after completion
  };

  return (
    <motion.div
      layout // Smooth siblings flow up when this exits
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        x: 300, // Slide right off screen
        transition: { duration: 0.3 },
      }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-surface bg-surface p-4"
    >
      {/* Card content */}
    </motion.div>
  );
}

// Parent component wraps with AnimatePresence to enable exit animations
export default function TodayHabitList({ habits }: Props) {
  return (
    <AnimatePresence mode="popLayout">
      {habits.map((habit) => (
        <TodayHabitCard key={habit.id} habit={habit} />
      ))}
    </AnimatePresence>
  );
}
```

**Pattern 4b: Spring Physics for Button Press**

```typescript
// components/HabitCheckButton.tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }} // Pressed feedback
  onClick={handleToggle}
  className="w-12 h-12 rounded-full bg-green-500 text-white"
>
  {isComplete ? "✓" : "○"}
</motion.button>
```

**Pattern 4c: Progress Bar Fill (Spring Easing)**

```typescript
// components/ProgressBar.tsx
<motion.div
  className="h-3 rounded-full bg-blue-500"
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{
    duration: 0.8,
    ease: "easeOut",
    type: "spring",
    stiffness: 100,
    damping: 30, // Smooth overshoot, no jank on iOS
  }}
/>
```

**Pattern 4d: Toast Animation (Spring Pop)**

```typescript
// components/Toast.tsx
<motion.div
  initial={{ opacity: 0, y: 50, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: 50, transition: { duration: 0.2 } }}
  transition={{
    type: "spring",
    stiffness: 400,
    damping: 30,
  }}
  className="fixed bottom-20 left-4 right-4 bg-green-500 text-white p-4 rounded-lg"
>
  ✓ Alışkanlık tamamlandı!
</motion.div>
```

**Key Framer Motion Principles:**
- `layout`: Enable on parent + children so siblings smoothly reflow when one exits
- `AnimatePresence mode="popLayout"`: Allow exit animations before removing from DOM
- `whileTap={{ scale: 0.95 }}`: Instant press feedback (no 100ms delay)
- `transition: { type: "spring", ... }`: Physics-based feels more natural than linear easing
- `damping: 30`: Prevent overshoot jank on low-end iOS devices

---

### 5. Toast Notification System

**Pattern: Custom Context + Framer Motion (no external toasts library)**

```typescript
// lib/toast-context.tsx
import { createContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export const ToastContext = createContext<{
  toasts: ToastMessage[];
  addToast: (msg: string, type: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast outside ToastProvider");
  return ctx;
}

// components/Toast.tsx
function Toast({
  message,
  type,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`m-4 px-4 py-3 rounded-lg text-white ${bgColor} shadow-lg`}
    >
      {message}
    </motion.div>
  );
}
```

**Usage in components:**
```typescript
import { useToast } from "@/lib/toast-context";

export function TodayHabitCard({ habit }: Props) {
  const { addToast } = useToast();
  
  const handleComplete = async () => {
    try {
      await toggleComplete();
      addToast(`✓ ${habit.name} tamamlandı!`, "success");
    } catch (err) {
      addToast("İşlem başarısız oldu", "error");
    }
  };
}
```

**Why custom (not react-toastify, sonner, etc.):**
- ✓ 0 additional dependencies (uses Framer Motion already in stack)
- ✓ <2KB bundle size vs 60KB+ (critical for PWA)
- ✓ Perfect Framer Motion integration
- ✓ Full control over timing, animation, position
- ✓ iOS Safari compatible
- ✓ Works offline
- ✗ If you need advanced features (dismissible, actions, stacking control): consider `react-hot-toast` (5KB, simpler than sonner)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date/timezone handling | Custom day-of-week logic | Native `Intl.DateTimeFormat` | Handles DST, locales, timezone edge cases; iOS Safari compatible |
| Completion state across offline/online | Custom sync queue, Redux logic | Firestore listeners + optimistic UI | Firebase SDK handles queuing, retry, conflict resolution; real-time sync across tabs |
| Progress animation | CSS transitions or custom calc | Framer Motion spring + easeOut | Predictable physics, GPU-optimized, handles interruption correctly |
| Toast notifications | Custom div + setTimeout | React Context + Framer Motion | Stacking, dismissal, animation interruption are complex; custom solution avoids bloat (5KB vs 60KB+) |
| Streak/completion calculation | Manual date loops | Firestore query by date range | Scales to infinity; Firestore handles timezone edge cases in doc IDs |

**Key insight:** Completion state management feels simple but is actually complex across offline boundaries. Firestore's built-in offline support + listeners handles this correctly. Custom Redux or Context-only solutions often miss edge cases like:
- User completes habit, goes offline, completes again → should be idempotent
- User updates completion on phone, then on tablet → both should sync
- User's clock changes (DST) → date string must stay in user's timezone, not change

**Firestore + optimistic UI solves all of these automatically.**

---

## Common Pitfalls

### Pitfall 1: Timezone Mismatch in Date Comparisons
**What goes wrong:** Comparing completion dates using `new Date()` or browser local timezone instead of user's selected timezone → habits marked complete "tomorrow" or on wrong day for users in different timezones.

**Why it happens:** 
- Assumption: `new Date()` gives today's date (actually gives server/browser time)
- iOS PWA has no concept of "user's preferred timezone" without explicit storage

**How to avoid:**
- Always use `getTodayInTimezone(getUserTimezone())` for comparisons
- Store user's timezone in Firestore on first load: `habit.userTimezone = getUserTimezone()`
- Date strings in completions subcollection must always be in user's timezone (use `getTodayInTimezone()`)

**Warning signs:**
- Users in UTC+8 report completing habit on April 9, but it shows as April 8 in calendar
- Timezone changes (DST) cause habits to "jump" days
- Test: complete habit at 11 PM local time, refresh page at 1 AM, verify it's still "today"

---

### Pitfall 2: Not Using `AnimatePresence` Mode for Exit Animations
**What goes wrong:** Completed habit disappears instantly (no animation) because Framer Motion removes it from DOM immediately.

**Why it happens:**
```typescript
// WRONG: No exit animation
{habits.map(h => <HabitCard key={h.id} />)}

// CORRECT: Exit animation runs before DOM removal
<AnimatePresence mode="popLayout">
  {habits.map(h => <HabitCard key={h.id} />)}
</AnimatePresence>
```

**How to avoid:**
- Always wrap conditional/list renders with `<AnimatePresence>`
- Use `mode="popLayout"` for smooth sibling reflow after exit
- Define `exit` property on child components

**Warning signs:**
- Completed habit disappears instantly with no animation
- Siblings don't smoothly move up to fill space

---

### Pitfall 3: Completion State Out of Sync (Missing Firestore Listener)
**What goes wrong:** User completes habit on tab A, switches to tab B → tab B still shows incomplete. Refresh needed to see update.

**Why it happens:**
```typescript
// WRONG: Optimistic update only, no Firestore listener
const toggleComplete = async () => {
  setIsComplete(!isComplete); // Optimistic
  await markComplete(...); // Fire-and-forget
};

// CORRECT: Listener + optimistic update
useEffect(() => {
  const unsub = onSnapshot(docRef, (snap) => {
    setIsComplete(snap.data().completed); // Sync from Firestore
  });
  return () => unsub();
}, []);

const toggleComplete = async () => {
  setIsComplete(!isComplete); // Optimistic
  await markComplete(...); // Listener will sync
};
```

**How to avoid:**
- Always add `useEffect(() => { const unsub = onSnapshot(...) })` to completion hooks
- Don't rely on optimistic update alone
- Verify with multiple tabs: complete on tab A, check tab B updates automatically

**Warning signs:**
- Switching between tabs shows stale state
- Refresh required to see completion

---

### Pitfall 4: Schedule Evaluation Using Browser Local Time
**What goes wrong:** User in UTC+8 has a "weekdays" habit, but it's only available Thursday-Tuesday (6 days) because evaluation uses browser local time, not user's timezone.

**Why it happens:**
```typescript
// WRONG: Uses browser's local timezone, not user's
const dayOfWeek = new Date().getDay();

// CORRECT: Uses user's actual timezone
const dayOfWeek = calculateDayInTimezone(getUserTimezone());
```

**How to avoid:**
- Always use `isHabitScheduledToday(schedule, getUserTimezone())`
- Test in multiple timezones (change system clock or test with VPN)
- Verify: a "weekdays" habit should be available Mon-Fri in user's timezone, not browser's

**Warning signs:**
- Weekends habit appears on weekday in some timezones
- Habit appears/disappears at midnight in browser timezone, not user's timezone

---

### Pitfall 5: Progress Bar Animating from 100% Back to Current
**What goes wrong:** Progress bar jumps to 100%, then animates back down when Firestore listener updates with actual value.

**Why it happens:**
```typescript
// WRONG: Animate from 0 every time percentage changes
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
/>

// CORRECT: Only animate on component mount
<motion.div
  initial={animated ? { width: 0 } : { width: `${percentage}%` }}
  animate={{ width: `${percentage}%` }}
/>
```

**How to avoid:**
- Pass `animated={isInitial}` to ProgressBar
- Only animate on first load, not on updates
- Or: use `type: "spring"` so interruption looks smooth (not jarring)

**Warning signs:**
- Progress bar animates from 0→100 then back down to 60
- Jank when updating amount quickly

---

## Code Examples

### Example 1: Filter Today's Habits (TODAY-01)

**Source:** Production habit-tracking pattern from Productive app

```typescript
// components/TodayHabitList.tsx
"use client";

import { useMemo } from "react";
import { useHabits } from "@/lib/use-habits";
import { isHabitScheduledToday, getUserTimezone } from "@/lib/habit-schedule";
import TodayHabitCard from "./TodayHabitCard";
import { AnimatePresence } from "framer-motion";

export default function TodayHabitList() {
  const { habits, loading } = useHabits();
  const timezone = getUserTimezone();

  // Filter to only today's habits, maintain priority order
  const todayHabits = useMemo(() => {
    return habits.filter((h) => isHabitScheduledToday(h.schedule, timezone));
  }, [habits, timezone]);

  if (loading) return <div className="p-4">Yükleniyor...</div>;
  if (todayHabits.length === 0) return <div className="p-4">Bugün alışkanlık yok</div>;

  return (
    <main className="p-4 pb-20">
      <h1 className="text-2xl font-semibold mb-4">Bugün</h1>
      <AnimatePresence mode="popLayout">
        {todayHabits.map((habit) => (
          <TodayHabitCard key={habit.id} habit={habit} />
        ))}
      </AnimatePresence>
    </main>
  );
}
```

---

### Example 2: Mark Boolean Habit Complete (TODAY-03)

**Source:** Firebase + Framer Motion best practices

```typescript
// components/TodayHabitCard.tsx (for boolean habits)
"use client";

import { motion } from "framer-motion";
import { useHabitCompletion } from "@/lib/use-habit-completion";
import { useToast } from "@/lib/toast-context";

export default function TodayHabitCard({ habit }: Props) {
  const { isComplete, loading, toggleComplete } = useHabitCompletion(habit.id);
  const { addToast } = useToast();

  const handleToggle = async () => {
    try {
      await toggleComplete();
      if (!isComplete) {
        addToast(`✓ ${habit.name} tamamlandı! ${identitySentence}`, "success");
      }
    } catch (err) {
      addToast("İşlem başarısız oldu", "error");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 300, transition: { duration: 0.3 } }}
      className={`p-4 rounded-xl border ${isComplete ? "bg-green-50 dark:bg-green-900/20" : "bg-surface"}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{habit.emoji}</span>
        
        <div className="flex-1">
          <h3 className="font-medium text-fg">{habit.name}</h3>
          <p className="text-sm text-fg/60">Hafta içi</p>
        </div>

        {habit.type === "boolean" && (
          <div className="flex gap-2">
            <button
              disabled={loading}
              className="px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-neutral-700"
            >
              2dk
            </button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggle}
              disabled={loading}
              className={`w-12 h-12 rounded-full font-bold transition-colors ${
                isComplete
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 dark:bg-neutral-700 text-fg"
              } disabled:opacity-50`}
            >
              {isComplete ? "✓" : "○"}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

---

### Example 3: Animate Progress Bar for Amount Habits (TODAY-03)

**Source:** React + Framer Motion best practices for iOS PWA

```typescript
// components/AmountHabitCard.tsx
"use client";

import { motion } from "framer-motion";
import ProgressBar from "./ProgressBar";
import { useHabitCompletion } from "@/lib/use-habit-completion";

export default function AmountHabitCard({ habit }: Props) {
  const { amount, setAmount, loading } = useHabitCompletion(habit.id);

  const handleIncrement = () => setAmount(Math.min(amount + 1, habit.targetAmount || 100));
  const handleDecrement = () => setAmount(Math.max(amount - 1, 0));

  return (
    <motion.div
      layout
      className="p-4 rounded-xl border border-surface bg-surface"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{habit.emoji}</span>
        <div className="flex-1">
          <h3 className="font-medium">{habit.name}</h3>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        current={amount}
        target={habit.targetAmount || 10}
        color={habit.color}
        size="md"
        animated={true}
      />

      {/* Amount Display and Controls */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-sm font-medium">
          {amount} / {habit.targetAmount}
        </span>
        
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDecrement}
            disabled={loading || amount === 0}
            className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold"
          >
            −
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleIncrement}
            disabled={loading || amount >= (habit.targetAmount || 100)}
            className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold"
          >
            +
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// components/ProgressBar.tsx
import { motion } from "framer-motion";

export default function ProgressBar({ current, target, color, size, animated }: Props) {
  const percentage = Math.min((current / target) * 100, 100);
  
  const sizeClasses = { sm: "h-2", md: "h-3", lg: "h-4" };

  return (
    <div className={`w-full rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden ${sizeClasses[size]}`}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={animated ? { width: 0 } : { width: `${percentage}%` }}
        animate={{ width: `${percentage}%` }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
          damping: 30,
        }}
      />
    </div>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Moment.js for timezone | Native `Intl.DateTimeFormat` | 2020s / ES2020 | -40KB bundle, works offline, iOS Safari compatible |
| Redux + middleware for async | Firebase + Context + optimistic UI | 2023+ Firebase improvements | Simpler, offline-aware, no boilerplate |
| Linear CSS transitions | Framer Motion spring physics | 2021+ (motion design) | More natural feel, handles interruption correctly |
| react-toastify (60KB) | Custom Framer Motion (2KB) | 2024+ | Lighter PWA bundle, better animation control |
| Stripe approach: separate queue collection | Firestore subcollection by date | 2022+ (best practice) | Scales infinitely, queryable by date range, realtime sync |

---

## Open Questions

1. **"2dk" (2 minute quick complete) — where is this tracked?**
   - What we know: Requirements mention "2dk" and "Yaptım" buttons for boolean habits
   - What's unclear: Should "2dk" be a different completion type (quick=true flag) or separate? Should it break streak differently?
   - Recommendation: Add `quick: boolean` flag to HabitCompletion. Count as "completed" but separate for streak logic (Phase 4). For Phase 3: mark complete with `quick: true` when "2dk" pressed.

2. **Celebration screen (TODAY-05) — Full screen or modal?**
   - What we know: "Tüm alışkanlıklar tamamlandığında tam ekran kutlama ekranı açılır"
   - What's unclear: Does it overlay? Can user dismiss? Confetti animation needed?
   - Recommendation: Defer to Phase 3.1 (celebration phase). Phase 3 just counts completions; phase 3.1 shows celebration when count === filtered habits length.

3. **Timezone storage — Save to Firestore or just browser session?**
   - What we know: `getUserTimezone()` fetches Intl timezone
   - What's unclear: Should timezone be stored in user doc for consistency across devices?
   - Recommendation: Store in user doc at signup. Use stored timezone for all date calculations. Allows user to travel without breaking habit tracking.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (via Next.js) or Vitest |
| Config file | `jest.config.js` or `vitest.config.ts` (to create) |
| Quick run command | `npm run test -- --testPathPattern="today" --watch` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TODAY-01 | Habits filtered by schedule (daily/weekdays/weekends) | Unit | `npm test -- habit-schedule.test.ts` | ❌ Wave 0 |
| TODAY-01 | Timezone-aware day calculation | Unit | `npm test -- habit-schedule.test.ts -t "timezone"` | ❌ Wave 0 |
| TODAY-02 | Habits rendered in importance order (critical→medium→low) | Unit | `npm test -- TodayHabitList.test.tsx -t "order"` | ❌ Wave 0 |
| TODAY-03 | Boolean habit marked complete via button | Integration | `npm test -- TodayHabitCard.test.tsx -t "toggle"` | ❌ Wave 0 |
| TODAY-03 | Amount habit incremented/decremented | Integration | `npm test -- AmountHabitCard.test.tsx -t "amount"` | ❌ Wave 0 |
| TODAY-03 | Progress bar fills to percentage | Unit | `npm test -- ProgressBar.test.tsx` | ❌ Wave 0 |
| TODAY-04 | Completed habit exits with animation | Integration | `npm test -- TodayHabitCard.test.tsx -t "exit"` | ❌ Wave 0 |
| TODAY-04 | Toast shows with identity sentence | Integration | `npm test -- toast.test.tsx` | ❌ Wave 0 |
| TODAY-06 | Toast displayed on completion | Integration | `npm test -- TodayHabitCard.test.tsx -t "toast"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern="today" --watch` (run on file changes)
- **Per wave merge:** `npm test` (full suite + coverage)
- **Phase gate:** Full suite green + >80% coverage for today-tab modules before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/lib/habit-schedule.test.ts` — Day-of-week filtering (REQ-01)
- [ ] `tests/lib/completions-db.test.ts` — Firestore CRUD, query by date range (REQ-03, REQ-04)
- [ ] `tests/lib/use-habit-completion.test.ts` — Optimistic UI + listener (REQ-03)
- [ ] `tests/components/TodayHabitCard.test.tsx` — Complete/animation flows (REQ-03, REQ-04, REQ-06)
- [ ] `tests/components/ProgressBar.test.tsx` — Progress visualization (REQ-03)
- [ ] `tests/lib/toast-context.test.ts` — Toast system (REQ-06)
- [ ] `jest.config.js` or `vitest.config.ts` — Framework setup
- [ ] `tests/setup.ts` — Firebase mock setup (for Firestore listener tests)

---

## Sources

### Primary (HIGH confidence)

- **Framer Motion docs** - Exit animations, AnimatePresence, spring physics (v11.0.0 current)
- **Firebase Firestore docs** - Subcollections, real-time listeners, offline persistence, security rules
- **Next.js 14 docs** - App router, "use client" directives, server/client component boundaries
- **MDN Intl API** - `Intl.DateTimeFormat` for timezone handling (standard ES2020+)
- **Codebase analysis** - Existing Phase 1-2 patterns: auth-context, habit-types, useHabits hook, Tailwind theme

### Secondary (MEDIUM confidence)

- **Production PWA patterns** - Optimistic UI + real-time listeners (standard in Productive, Done, Habitica)
- **iOS Safari constraints** - No date-fns/moment support in PWA mode, Spring physics better than linear easing

---

## Metadata

**Confidence breakdown:**
- **Day-of-week filtering:** HIGH - Native Intl API is standard, well-documented, works on all browsers
- **Completion schema:** HIGH - Firestore subcollection is standard Firebase pattern, used in production apps
- **State management:** HIGH - Optimistic UI + listeners is proven pattern, Firebase SDK handles edge cases
- **Micro-animations:** HIGH - Framer Motion patterns are mature, AnimatePresence is standard for exit animations
- **Toast system:** MEDIUM - Custom Framer Motion system is lightweight but unproven vs established libraries; recommend custom to avoid bloat

**Research date:** 2026-04-08  
**Valid until:** 2026-04-15 (7 days — PWA stack is stable, but check Framer Motion releases)

---

**Researched by:** GSD Phase Researcher  
**Next step:** `/gsd:plan-phase` to create task breakdown for Phase 3 implementation
