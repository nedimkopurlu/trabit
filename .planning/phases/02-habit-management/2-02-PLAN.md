---
phase: 02-habit-management
plan: 02
type: execute
wave: 2
depends_on: ["02-01"]
files_modified:
  - components/HabitForm.tsx
  - components/HabitFormSheet.tsx
autonomous: true
requirements: [HABIT-01, HABIT-02, HABIT-03]
must_haves:
  truths:
    - "User can fill a form with name, type, schedule, importance, emoji, color, notification time, and (when type=amount) target amount"
    - "Form enforces: name 1-50 chars, target amount >= 1 when type=amount"
    - "Form works in both create and edit mode based on optional `habit` prop"
    - "On mobile, form slides up as a bottom sheet; on md+ it is a centered modal"
  artifacts:
    - path: "components/HabitForm.tsx"
      provides: "Controlled HabitForm with validation + submit"
      exports: ["default HabitForm", "HabitFormProps"]
    - path: "components/HabitFormSheet.tsx"
      provides: "Animated sheet/modal wrapper that hosts HabitForm"
      exports: ["default HabitFormSheet"]
  key_links:
    - from: "components/HabitForm.tsx"
      to: "lib/habits-db.ts"
      via: "createHabit / updateHabit on submit"
      pattern: "createHabit\\(|updateHabit\\("
    - from: "components/HabitForm.tsx"
      to: "lib/habit-types.ts"
      via: "Habit, HabitInput, DEFAULT_COLORS, DEFAULT_EMOJIS"
      pattern: "from \"@/lib/habit-types\""
---

<objective>
Build the single `HabitForm` component (D-04) that handles both create and edit (HABIT-01, HABIT-02, HABIT-03), plus the animated sheet wrapper (D-07) that presents it as a bottom sheet on mobile and a centered modal on md+.

Purpose: Plan 03 wires this form into the FAB and the Ayarlar list (edit). This plan produces the reusable UI.
Output: `components/HabitForm.tsx`, `components/HabitFormSheet.tsx`.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-habit-management/2-CONTEXT.md
@.planning/phases/02-habit-management/2-01-PLAN.md
@lib/habit-types.ts
@lib/habits-db.ts
@lib/auth-context.tsx
@tailwind.config.ts
@components/TabBar.tsx

<interfaces>
From lib/habit-types.ts (Plan 01):
```typescript
export interface Habit { id; name; type: "boolean"|"amount"; schedule: "daily"|"weekdays"|"weekends"; importance: "critical"|"medium"|"low"; emoji; color; notificationTime: string|null; targetAmount: number|null; order; createdAt; updatedAt }
export type HabitInput = Omit<Habit, "id"|"createdAt"|"updatedAt"|"order">
export const DEFAULT_COLORS: string[]
export const DEFAULT_EMOJIS: string[]
```

From lib/habits-db.ts (Plan 01):
```typescript
export async function createHabit(uid, input: HabitInput): Promise<string>
export async function updateHabit(uid, habitId, patch: Partial<HabitInput>): Promise<void>
```

From lib/auth-context.tsx:
```typescript
useAuth(): { user: User | null, ... }
```

framer-motion is already installed (Phase 1). Import: `import { motion, AnimatePresence } from "framer-motion"`.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: HabitForm component (controlled, validated)</name>
  <files>components/HabitForm.tsx</files>
  <read_first>
    - lib/habit-types.ts
    - lib/habits-db.ts
    - lib/auth-context.tsx
    - components/TabBar.tsx (existing Tailwind conventions)
  </read_first>
  <action>
    Create `components/HabitForm.tsx` as a client component. Requirements per D-04, D-05, D-06:

    Props:
    ```ts
    export interface HabitFormProps {
      habit?: import("@/lib/habit-types").Habit; // edit mode if present
      onSubmitted: () => void; // called after successful save
      onCancel: () => void;
    }
    ```

    State fields (initialized from `habit` when editing, else defaults: `type="boolean"`, `schedule="daily"`, `importance="medium"`, first emoji, first color, `notificationTime=null`, `targetAmount=null`):
    - name (string)
    - type ("boolean" | "amount")
    - schedule ("daily" | "weekdays" | "weekends")
    - importance ("critical" | "medium" | "low")
    - emoji (string)
    - color (string, hex)
    - notificationTime (string | null) — rendered as `<input type="time">`; a checkbox "Bildirim" toggles null vs. "09:00"
    - targetAmount (number | null) — rendered only when type === "amount"

    Validation (per D-06):
    - `name.trim().length >= 1 && name.trim().length <= 50`
    - if `type === "amount"`: `targetAmount != null && targetAmount >= 1`
    - Disable submit button when invalid; show inline error text under fields.

    Layout (mobile-first, `max-w-md` friendly):
    - Form title: "Alışkanlık Ekle" when create, "Alışkanlığı Düzenle" when edit
    - Name text input (maxLength 50)
    - Type toggle: two buttons "Yap / Yapma" (boolean) and "Miktar" (amount), selected style highlighted
    - Schedule: 3 segmented buttons "Her gün" / "Hafta içi" / "Hafta sonu"
    - Importance: 3 buttons colored critical=red-500, medium=yellow-500, low=green-500 (per D-05); selected state has ring
    - Emoji picker: grid (grid-cols-8 on mobile) using `DEFAULT_EMOJIS`; click sets selection; selected has ring
    - Color picker: row of 10 circular swatches using `DEFAULT_COLORS`; selected has ring-2 ring-offset-2
    - Notification: checkbox "Bildirim saati" — when checked show `<input type="time">` bound to notificationTime; default "09:00" when enabled
    - Target amount: number input, shown ONLY when type === "amount", min=1, placeholder "Hedef sayı"
    - Buttons row: "İptal" (ghost) and "Kaydet" (primary). Kaydet is disabled while submitting or invalid.

    On submit:
    ```ts
    const { user } = useAuth();
    if (!user) return;
    setSubmitting(true);
    const input: HabitInput = { name: name.trim(), type, schedule, importance, emoji, color, notificationTime, targetAmount: type === "amount" ? targetAmount : null };
    if (habit) await updateHabit(user.uid, habit.id, input);
    else await createHabit(user.uid, input);
    onSubmitted();
    ```
    Wrap in try/catch; on error setSubmitting(false) and show `error` text above the buttons.

    All text MUST be Turkish (matches Phase 1). All elements must support dark mode via `dark:` classes. Use `max-w-md mx-auto` and standard Tailwind conventions seen in existing pages. No new npm packages.

    Per D-04: This is the SINGLE form component — do NOT create separate AddHabit and EditHabit components.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - grep -q '"use client"' components/HabitForm.tsx
    - grep -q 'export interface HabitFormProps' components/HabitForm.tsx
    - grep -q 'habit?:' components/HabitForm.tsx
    - grep -q 'createHabit\|updateHabit' components/HabitForm.tsx
    - grep -q 'DEFAULT_EMOJIS' components/HabitForm.tsx
    - grep -q 'DEFAULT_COLORS' components/HabitForm.tsx
    - grep -q 'type="time"' components/HabitForm.tsx
    - grep -q 'type === "amount"' components/HabitForm.tsx
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>HabitForm renders, validates, and calls create/update from habits-db; compiles cleanly.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: HabitFormSheet animated wrapper</name>
  <files>components/HabitFormSheet.tsx</files>
  <read_first>
    - components/HabitForm.tsx (from Task 1)
    - .planning/phases/02-habit-management/2-CONTEXT.md (D-07, D-13)
  </read_first>
  <action>
    Create `components/HabitFormSheet.tsx` as a client component. It presents `HabitForm` as:
    - Mobile (default): bottom sheet that slides up from `y: "100%"` to `y: 0` with framer-motion spring.
    - md+ breakpoint: centered modal with scale/opacity fade-in (still using framer-motion).

    Props:
    ```ts
    interface HabitFormSheetProps {
      open: boolean;
      habit?: import("@/lib/habit-types").Habit;
      onClose: () => void;
    }
    ```

    Implementation:
    - Use `AnimatePresence` + `motion.div`.
    - Render a full-screen backdrop `fixed inset-0 bg-black/50 z-40` that closes on click.
    - Sheet container: `fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-neutral-900 p-4 max-h-[90vh] overflow-y-auto md:inset-0 md:m-auto md:max-w-md md:max-h-[85vh] md:rounded-2xl md:h-fit`.
    - Mobile initial `{ y: "100%" }`, animate `{ y: 0 }`, exit `{ y: "100%" }`, transition spring damping 25 stiffness 300.
    - On md+ screens you can keep the same animation — acceptable.
    - Embed `<HabitForm habit={habit} onSubmitted={onClose} onCancel={onClose} />`.
    - Prevent body scroll while open (add/remove `overflow-hidden` on `document.body` in a useEffect).

    Export default.
  </action>
  <verify>
    <automated>npx tsc --noEmit && npx next build 2>&1 | tail -20</automated>
  </verify>
  <acceptance_criteria>
    - grep -q '"use client"' components/HabitFormSheet.tsx
    - grep -q 'AnimatePresence' components/HabitFormSheet.tsx
    - grep -q 'HabitForm' components/HabitFormSheet.tsx
    - grep -q 'open: boolean' components/HabitFormSheet.tsx
    - grep -q 'onClose' components/HabitFormSheet.tsx
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Sheet wraps HabitForm with framer-motion bottom-sheet-to-modal transition.</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes
- Both files exist and import from `lib/habit-types.ts` + `lib/habits-db.ts`
- No new packages added (framer-motion already present)
</verification>

<success_criteria>
A reusable `<HabitFormSheet open habit onClose />` exists that Plan 03 can mount from both the FAB and the Ayarlar edit buttons, covering HABIT-01, HABIT-02, HABIT-03 UI needs.
</success_criteria>

<output>
After completion, create `.planning/phases/02-habit-management/2-02-SUMMARY.md`
</output>
