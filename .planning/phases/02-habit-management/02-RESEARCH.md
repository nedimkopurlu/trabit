# Phase 2: Habit Management - Research

**Researched:** 2025-01-20
**Domain:** Firestore CRUD operations, React form patterns, mobile-first UI components
**Confidence:** HIGH

## Summary

Phase 2 implements comprehensive habit CRUD (Create, Read, Update, Delete) functionality with a mobile-first, PWA-optimized design. Research confirms the existing Phase 1 patterns (auth context, Firestore CRUD, Tailwind styling, Framer Motion animations) provide a solid foundation. The phase requires implementing a reusable habit form component, Firestore real-time listeners via custom hook, and a floating action button in the app shell.

Key technical approach: subcollection pattern (`users/{uid}/habits/{habitId}`) with real-time `onSnapshot` listeners, manual form validation following existing patterns, and bottom-sheet mobile UI with Framer Motion animations. No new dependencies needed—everything can be built with the existing stack (Firebase 10.12.0, Framer Motion 11.0.0, Tailwind 3.4.0, Next.js 14.2.0).

**Primary recommendation:** Follow established Phase 1 conventions exactly—manual validation, subcollection Firestore paths, inline state management, and Tailwind utility classes. Build the `useHabits` hook as a reusable real-time data layer for Phase 3 and 4 consumption.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Firestore Veri Modeli**
- **D-01:** `users/{uid}/habits/{habitId}` koleksiyon yapısı. Her döküman: `{ id, name, type: "boolean"|"amount", schedule: "daily"|"weekdays"|"weekends", importance: "critical"|"medium"|"low", emoji: string, color: string (hex), notificationTime: string|null (HH:MM), targetAmount: number|null, createdAt, updatedAt, order: number }`.
- **D-02:** `order` alanı, alışkanlıkların önem sırasına göre sıralanmasını Firestore tarafında destekler. Önem sırası: critical=0, medium=1, low=2.
- **D-03:** Miktar alışkanlığı için `targetAmount` (sayı, zorunlu) ve `type: "amount"`. Boolean için `type: "boolean"`, `targetAmount: null`.

**Alışkanlık Formu UI**
- **D-04:** Tek bir `HabitForm` bileşeni hem ekleme hem düzenleme için kullanılır. Prop: `habit?: Habit` (düzenleme modu).
- **D-05:** Form alanları: ad (text), tip (boolean/miktar toggle), zamanlama (3 seçenek), önem seviyesi (3 seçenek renkli), emoji picker (basit grid, ~30 emoji), renk picker (önceden tanımlı 8-10 renk paleti), bildirim saati (time input, opsiyonel), hedef miktar (sayı, yalnızca tip=amount).
- **D-06:** Form validation: ad zorunlu (min 1 karakter, max 50). Miktar tipi seçiliyse hedef miktar zorunlu (min 1).
- **D-07:** Form mobilde bottom sheet (slide-up), masaüstünde modal veya full-page. Framer Motion ile açılır.

**Alışkanlık Listesi (Ayarlar'da)**
- **D-08:** Ayarlar sekmesinde alışkanlıklar listesi görünür; düzenle ve sil butonları (her kart için).
- **D-09:** Silme öncesi confirm dialog (basit `window.confirm` veya küçük inline confirm).
- **D-10:** Liste boşken "Henüz alışkanlık yok — + ile ekle" empty state gösterilir.

**Hızlı Ekleme (FAB)**
- **D-11:** Ana ekranda (app shell) sağ üstte veya sağ altta floating action button "+" — `HabitForm`'u açar.
- **D-12:** FAB yalnızca app route'larında görünür (login/onboarding'de yok). `app/(app)/layout.tsx`'e eklenir.

**Responsive**
- **D-13:** Mobil-önce. Form bottom sheet'i masaüstünde centered modal'a dönüşür (`md:` breakpoint). `max-w-md` korunur.

**State Management**
- **D-14:** Firestore realtime listener (`onSnapshot`) ile alışkanlıklar React state'ine bağlanır. `useHabits` custom hook.
- **D-15:** Optimistic UI yok — Firestore round-trip yeterince hızlı. Loading state gösterilir.

### Claude's Discretion
- Emoji picker kütüphanesi seçimi vs. basit grid (grid tercih edilir — kütüphane gereksiz)
- Renk paleti renkleri (Tailwind palette'den seçilir)
- Swipe-to-delete vs. button-based delete (button tercih edilir — iOS PWA'da swipe güvenilmez)
- Form animasyon detayları

### Deferred Ideas (OUT OF SCOPE)
- Alışkanlık sıralaması (drag-and-drop reorder) → backlog
- Alışkanlık arşivleme (soft delete) → backlog
- Tamamlama geçmişi okuma → Phase 3 ve 4
- Push bildirimi gönderme → Phase 5
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HABIT-01 | Kullanıcı alışkanlık ekleyebilir: ad, tip (boolean/miktar), zamanlama (her gün / hafta içi / hafta sonu), önem seviyesi (kritik/orta/düşük), emoji/ikon, özel renk, hedef bildirim saati | HabitForm component pattern, Firestore schema with all fields, form validation strategy |
| HABIT-02 | Miktar alışkanlığı için başlangıçta hedef sayı belirlenir | Conditional form field rendering based on type, targetAmount field in schema |
| HABIT-03 | Kullanıcı mevcut alışkanlığı düzenleyebilir | HabitForm reuse pattern with optional habit prop, Firestore updateDoc operation |
| HABIT-04 | Kullanıcı alışkanlığı silebilir | Firestore deleteDoc operation, confirmation dialog pattern |
| HABIT-05 | Ana ekranda sağ üst "+" butonu ile hızlı alışkanlık ekleme akışı açılır | FAB component in app shell layout, modal state management |
</phase_requirements>

---

## Standard Stack

All dependencies already installed in Phase 1. No new packages required.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Firebase | 10.12.0 | Firestore CRUD + real-time listeners | Official Google backend, already integrated in Phase 1 |
| Next.js | 14.2.0 | App Router, Server/Client Components | Project foundation, App Router for routing |
| React | 18.3.0 | UI state management, hooks | Required by Next.js, hooks for form state |
| TypeScript | 5.4.0 | Type safety | Entire project uses TypeScript |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Framer Motion | 11.0.0 | Bottom sheet slide-up animation, FAB micro-interactions | All form open/close transitions, button hover states |
| Tailwind CSS | 3.4.0 | Mobile-first styling, dark mode | All component styling—no CSS modules |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual validation | React Hook Form / Formik | RHF adds 40KB bundle size; manual validation already proven in onboarding form |
| Inline emoji grid | emoji-picker-react | Adds 180KB; simple grid of 30 emojis sufficient for MVP |
| Custom modal | Radix UI Dialog | Adds dependency; Framer Motion already handles animations |

**Installation:**
```bash
# No new packages needed
npm install  # All dependencies already in package.json
```

**Version verification:** Verified from package.json (2025-01-20). All packages are current stable releases.

---

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── auth-context.tsx         # Existing — provides useAuth()
├── firebase.ts              # Existing — exports db, auth
├── user-doc.ts              # Existing — UserDoc CRUD pattern
└── habits.ts                # NEW — Habit type, CRUD operations, useHabits hook

components/
├── TabBar.tsx               # Existing — bottom/sidebar navigation
├── HabitForm.tsx            # NEW — create/edit form (bottom sheet)
├── HabitList.tsx            # NEW — list in Ayarlar page
├── HabitCard.tsx            # NEW — individual habit item with edit/delete
├── FAB.tsx                  # NEW — floating action button
├── EmojiPicker.tsx          # NEW — simple emoji grid selector
└── ColorPicker.tsx          # NEW — color palette selector

app/(app)/
├── layout.tsx               # MODIFY — add FAB component
└── ayarlar/
    └── page.tsx             # MODIFY — add HabitList
```

---

### Pattern 1: Firestore Subcollection CRUD

**What:** Each user has a subcollection of habits under `users/{uid}/habits/{habitId}`.

**When to use:** Single-user app with user-specific data; follows existing Phase 1 pattern for `users/{uid}`.

**Example:**
```typescript
// lib/habits.ts
import { collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface Habit {
  id: string;
  name: string;
  type: "boolean" | "amount";
  schedule: "daily" | "weekdays" | "weekends";
  importance: "critical" | "medium" | "low";
  emoji: string;
  color: string; // hex: "#FF5733"
  notificationTime: string | null; // "HH:MM" or null
  targetAmount: number | null; // for type="amount"
  order: number; // for sorting (critical=0, medium=1, low=2)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function createHabit(uid: string, habit: Omit<Habit, "id" | "createdAt" | "updatedAt">) {
  const habitRef = doc(collection(db, "users", uid, "habits"));
  await setDoc(habitRef, {
    ...habit,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return habitRef.id;
}

export async function updateHabit(uid: string, habitId: string, updates: Partial<Habit>) {
  const habitRef = doc(db, "users", uid, "habits", habitId);
  await updateDoc(habitRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export async function deleteHabit(uid: string, habitId: string) {
  const habitRef = doc(db, "users", uid, "habits", habitId);
  await deleteDoc(habitRef);
}
```

**Source:** Firebase official docs (Firestore subcollections pattern), Phase 1 `lib/user-doc.ts` implementation

---

### Pattern 2: Real-time Listener Hook (useHabits)

**What:** Custom React hook that subscribes to Firestore `onSnapshot` and returns live habit array + loading state.

**When to use:** Whenever component needs real-time habit data (Ayarlar page, Today page in Phase 3).

**Example:**
```typescript
// lib/habits.ts (continued)
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useHabits(uid: string | null) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setHabits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "users", uid, "habits"),
      orderBy("order", "asc"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const habits = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Habit[];
        setHabits(habits);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useHabits error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { habits, loading, error };
}
```

**Benefits:**
- Auto-updates on any Firestore change (create/update/delete from any device)
- Cleanup on unmount (unsubscribe)
- Loading and error states built-in
- Reusable across Phase 3 (Today) and Phase 4 (Streaks)

**Source:** Firebase official docs (real-time listeners), existing Phase 1 auth-context pattern

---

### Pattern 3: Reusable Form Component (Create + Edit)

**What:** Single `HabitForm` component handles both create and edit modes based on optional `habit` prop.

**When to use:** Create new habit (habit=undefined) or edit existing (habit={...}).

**Example:**
```typescript
// components/HabitForm.tsx
interface HabitFormProps {
  habit?: Habit; // undefined = create mode, defined = edit mode
  onClose: () => void;
}

export function HabitForm({ habit, onClose }: HabitFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(habit?.name || "");
  const [type, setType] = useState<"boolean" | "amount">(habit?.type || "boolean");
  const [schedule, setSchedule] = useState<"daily" | "weekdays" | "weekends">(habit?.schedule || "daily");
  const [importance, setImportance] = useState<"critical" | "medium" | "low">(habit?.importance || "medium");
  const [emoji, setEmoji] = useState(habit?.emoji || "💪");
  const [color, setColor] = useState(habit?.color || "#3b82f6");
  const [notificationTime, setNotificationTime] = useState(habit?.notificationTime || null);
  const [targetAmount, setTargetAmount] = useState(habit?.targetAmount || 1);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      setError("Alışkanlık adı gerekli");
      return;
    }
    if (name.length > 50) {
      setError("Alışkanlık adı en fazla 50 karakter olabilir");
      return;
    }
    if (type === "amount" && targetAmount < 1) {
      setError("Hedef miktar en az 1 olmalı");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const order = importance === "critical" ? 0 : importance === "medium" ? 1 : 2;
      const habitData = {
        name: name.trim(),
        type,
        schedule,
        importance,
        emoji,
        color,
        notificationTime,
        targetAmount: type === "amount" ? targetAmount : null,
        order
      };

      if (habit) {
        // Edit mode
        await updateHabit(user!.uid, habit.id, habitData);
      } else {
        // Create mode
        await createHabit(user!.uid, habitData);
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="fixed inset-0 z-50 bg-bg md:flex md:items-center md:justify-center"
    >
      {/* Form implementation */}
    </motion.div>
  );
}
```

**Source:** Phase 1 onboarding form pattern, Framer Motion docs (spring animations)

---

### Pattern 4: Floating Action Button (FAB)

**What:** Fixed-position "+" button in bottom-right (mobile) that opens HabitForm.

**When to use:** Primary action for creating habits, visible on all app pages.

**Example:**
```typescript
// components/FAB.tsx
import { motion } from "framer-motion";

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center 
                 rounded-full bg-fg text-bg shadow-lg transition hover:shadow-xl
                 md:bottom-6"
      aria-label="Yeni alışkanlık ekle"
    >
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </motion.button>
  );
}

// app/(app)/layout.tsx
export default function AppLayout({ children }) {
  const [showHabitForm, setShowHabitForm] = useState(false);
  
  return (
    <>
      {children}
      <TabBar />
      <FAB onClick={() => setShowHabitForm(true)} />
      {showHabitForm && (
        <HabitForm onClose={() => setShowHabitForm(false)} />
      )}
    </>
  );
}
```

**Positioning:**
- Mobile: `bottom-24` (6rem above TabBar which is h-16 + padding)
- Desktop: `bottom-6` (no TabBar overlap)

**Source:** Material Design FAB guidelines, Phase 1 Tailwind/Framer Motion patterns

---

### Anti-Patterns to Avoid

- **❌ Top-level habits collection:** Don't use `habits/{habitId}` with userId field—subcollections enforce security and scoping
- **❌ Client-side timestamps:** Don't use `new Date()`—use `serverTimestamp()` for consistency across timezones
- **❌ Array fields for habits:** Don't store habits as array in UserDoc—Firestore queries on subcollections are more powerful
- **❌ Separate create/edit components:** Don't duplicate form logic—use optional prop pattern
- **❌ Optimistic UI for CRUD:** Don't add complexity—Firestore is fast enough with loading states

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Real-time data sync | Manual polling, setInterval | Firestore `onSnapshot` | Built-in, efficient, handles offline/reconnect |
| Form state | Complex reducer pattern | React useState | Simple forms don't need heavy state machines |
| Modal animations | CSS transitions only | Framer Motion | Already installed, spring physics, exit animations |
| Color picker | Full HSL/RGB picker | Predefined Tailwind palette | MVP needs 8-10 colors, not 16M |
| Emoji picker | Unicode search library | Hardcoded emoji grid | 30 common emojis sufficient, no search needed |
| Input validation | Zod, Yup schemas | Manual if/else checks | Only 2 rules (name required, targetAmount>0) |

**Key insight:** Phase 1 proved manual validation and inline state work well for simple forms. Habit form has similar complexity to onboarding form—no need for libraries.

---

## Common Pitfalls

### Pitfall 1: Firestore Subcollection Query Permissions
**What goes wrong:** Security rules deny access to `users/{uid}/habits` even with authenticated user.

**Why it happens:** Default Firestore rules don't auto-allow subcollections—must explicitly grant access.

**How to avoid:**
```javascript
// firestore.rules
match /users/{userId}/habits/{habitId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**Warning signs:** `onSnapshot` fires error callback with "Missing or insufficient permissions" even when user is authenticated.

---

### Pitfall 2: onSnapshot Memory Leaks
**What goes wrong:** Firestore listener keeps running after component unmounts, causing memory leaks.

**Why it happens:** Forgetting to call unsubscribe function returned by `onSnapshot`.

**How to avoid:**
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(query, (snap) => { /* ... */ });
  return () => unsubscribe(); // CRITICAL: cleanup function
}, [uid]);
```

**Warning signs:** Console warnings about setState on unmounted component; increasing memory usage over time.

---

### Pitfall 3: Bottom Sheet Scroll Conflicts
**What goes wrong:** Page scroll interferes with bottom sheet drag-to-dismiss gesture on mobile.

**Why it happens:** Body scroll not locked when modal opens.

**How to avoid:**
```typescript
// In HabitForm component
useEffect(() => {
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = "";
  };
}, []);
```

**Warning signs:** User can scroll page behind modal; iOS address bar shows/hides during form interaction.

---

### Pitfall 4: Type Narrowing for targetAmount
**What goes wrong:** TypeScript error when accessing `targetAmount` because it's nullable.

**Why it happens:** Field is `number | null` but code assumes it's always number for type="amount".

**How to avoid:**
```typescript
// Validate at form level
const targetAmount = type === "amount" ? (targetAmount || 1) : null;

// Or use type guards
if (habit.type === "amount" && habit.targetAmount !== null) {
  const amount: number = habit.targetAmount; // ✅ TypeScript happy
}
```

**Warning signs:** TypeScript errors like "Object is possibly 'null'"; runtime crashes when reading targetAmount.

---

### Pitfall 5: Order Field Calculation
**What goes wrong:** Habits don't sort correctly by importance in Firestore query.

**Why it happens:** `order` field not set correctly on create/update.

**How to avoid:**
```typescript
const importanceToOrder = {
  critical: 0,
  medium: 1,
  low: 2
};
const order = importanceToOrder[importance];
```

**Warning signs:** Habits appear in creation order instead of importance order; critical habits not at top.

---

## Code Examples

Verified patterns from Phase 1 codebase:

### Form Submit Pattern (from app/onboarding/page.tsx)
```typescript
const [value, setValue] = useState("");
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const trimmed = value.trim();
  if (!trimmed) {
    setError("Alan boş olamaz");
    return;
  }
  setError(null);
  setSaving(true);
  try {
    await someFirestoreOperation(trimmed);
    router.replace("/success-page");
  } catch (err: any) {
    setError(err.message || "Bir hata oluştu");
    console.error(err);
  } finally {
    setSaving(false);
  }
};
```

### Input Styling (from app/onboarding/page.tsx)
```typescript
<input
  className="w-full rounded-xl border border-surface bg-surface px-4 py-3 
             text-sm placeholder:opacity-40 focus:outline-none 
             focus:ring-2 focus:ring-fg/20"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  disabled={saving}
/>
```

### Button States (from app/onboarding/page.tsx)
```typescript
<button
  type="submit"
  disabled={saving || !value.trim()}
  className="w-full rounded-xl bg-fg text-bg px-6 py-3 font-medium 
             transition hover:opacity-80 disabled:opacity-40"
>
  {saving ? "Kaydediliyor..." : "Devam"}
</button>
```

### Framer Motion Spring Animation (from components/TabBar.tsx)
```typescript
<motion.div
  layoutId="tab-active"
  className="absolute bottom-0 left-0 right-0 h-0.5 bg-fg"
  transition={{ type: "spring", stiffness: 380, damping: 30 }}
/>
```

### Auth Context Usage (from app/(app)/layout.tsx)
```typescript
const { user, loading, hasOnboarded } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) {
  router.replace("/login");
  return null;
}
if (!hasOnboarded) {
  router.replace("/onboarding");
  return null;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Firestore v9 compat API | Modular v9+ API | 2021 | Use `import { doc } from "firebase/firestore"` not `firebase.firestore()` |
| CSS Modules in Next.js | Tailwind utility-first | 2020+ | Project uses Tailwind exclusively, no CSS modules |
| class components + lifecycle | Function components + hooks | React 16.8+ (2019) | All new code uses hooks (useState, useEffect, custom hooks) |
| React.FC type | Props interface | 2020+ | Don't use React.FC—use `function Component(props: Props)` |

**Deprecated/outdated:**
- `getServerSideProps` for auth checks → App Router uses server components and middleware
- `_app.tsx` for global providers → App Router uses `app/layout.tsx`
- Firestore `get()` for live data → Use `onSnapshot` for real-time updates

---

## Validation Architecture

> Nyquist validation enabled in .planning/config.json

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — recommend Vitest + React Testing Library |
| Config file | none — see Wave 0 |
| Quick run command | `npm run test -- --run` (after setup) |
| Full suite command | `npm run test` (after setup) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HABIT-01 | Create habit with all fields | integration | `npm run test -- HabitForm.test.tsx --run` | ❌ Wave 0 |
| HABIT-02 | Validate targetAmount required for type=amount | unit | `npm run test -- HabitForm.test.tsx --run` | ❌ Wave 0 |
| HABIT-03 | Edit existing habit updates Firestore | integration | `npm run test -- HabitForm.test.tsx --run` | ❌ Wave 0 |
| HABIT-04 | Delete habit removes from Firestore | integration | `npm run test -- habits.test.ts --run` | ❌ Wave 0 |
| HABIT-05 | FAB opens HabitForm modal | component | `npm run test -- AppLayout.test.tsx --run` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test -- --run` (quick run, < 30s)
- **Per wave merge:** `npm run test` (full suite with coverage)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` — test framework configuration
- [ ] `tests/setup.ts` — Firebase emulator setup for integration tests
- [ ] `tests/components/HabitForm.test.tsx` — covers HABIT-01, HABIT-02, HABIT-03
- [ ] `tests/lib/habits.test.ts` — covers HABIT-04 (CRUD operations)
- [ ] `tests/components/AppLayout.test.tsx` — covers HABIT-05 (FAB interaction)
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

**Rationale:** No existing test infrastructure detected. Vitest recommended over Jest for Vite-based projects (faster, better ESM support). React Testing Library for component testing. Firebase emulator for integration tests to avoid hitting production Firestore.

---

## Sources

### Primary (HIGH confidence)
- Trabit codebase (Phase 1 implementation) - Verified auth-context, Firestore patterns, form validation, Tailwind styling, Framer Motion usage
- Firebase official docs - Firestore subcollections, onSnapshot listeners, security rules
- Next.js 14 docs - App Router patterns, server/client components
- Framer Motion 11 docs - Spring animations, exit animations

### Secondary (MEDIUM confidence)
- Tailwind CSS docs - Utility classes, responsive design, dark mode
- React 18 docs - Hooks patterns, useEffect cleanup

### Tertiary (LOW confidence)
- None — all findings verified against codebase or official documentation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages already installed and verified in package.json
- Architecture: HIGH - Patterns directly copied from working Phase 1 code
- Pitfalls: HIGH - Based on known Firestore listener issues and TypeScript strictness

**Research date:** 2025-01-20
**Valid until:** ~30 days (Firebase/Next.js stable, slow-moving APIs)

---

*Research complete. Ready for planning.*
