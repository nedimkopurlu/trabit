---
phase: 02-habit-management
plan: 03
type: execute
wave: 3
depends_on: ["02-02"]
files_modified:
  - app/(app)/layout.tsx
  - app/(app)/ayarlar/page.tsx
  - components/FAB.tsx
  - components/HabitList.tsx
  - components/HabitCard.tsx
autonomous: false
requirements: [HABIT-04, HABIT-05]
must_haves:
  truths:
    - "FAB (+) appears on all app pages and opens HabitFormSheet in create mode"
    - "Ayarlar page shows realtime habit list sorted by importance"
    - "Each habit card has edit and delete buttons that work correctly"
    - "Delete shows confirmation dialog before removing habit from Firestore"
    - "Empty state appears when no habits exist"
  artifacts:
    - path: "components/FAB.tsx"
      provides: "Floating action button with click handler"
      exports: ["default FAB"]
    - path: "components/HabitList.tsx"
      provides: "Realtime habit list with empty state"
      exports: ["default HabitList"]
    - path: "components/HabitCard.tsx"
      provides: "Individual habit display with edit/delete actions"
      exports: ["default HabitCard"]
    - path: "app/(app)/layout.tsx"
      provides: "FAB mounted in app shell"
      contains: "<FAB"
    - path: "app/(app)/ayarlar/page.tsx"
      provides: "HabitList + HabitFormSheet integrated"
      contains: "<HabitList"
  key_links:
    - from: "components/FAB.tsx"
      to: "components/HabitFormSheet.tsx"
      via: "onClick opens sheet modal"
      pattern: "setOpen\\(true\\)"
    - from: "components/HabitCard.tsx"
      to: "lib/habits-db.ts"
      via: "deleteHabit on confirm"
      pattern: "deleteHabit\\("
    - from: "components/HabitList.tsx"
      to: "lib/use-habits.ts"
      via: "useHabits hook"
      pattern: "useHabits\\(\\)"
    - from: "app/(app)/ayarlar/page.tsx"
      to: "components/HabitFormSheet.tsx"
      via: "edit flow passes habit prop"
      pattern: "habit=\\{editingHabit\\}"
---

<objective>
Wire Phase 2 together: mount FAB in app layout (HABIT-05), display habits list in Ayarlar page with edit/delete actions (HABIT-04), and ensure all CRUD flows work end-to-end.

Purpose: Complete Phase 2 integration so users can create, read, update, and delete habits through the UI.
Output: `components/FAB.tsx`, `components/HabitList.tsx`, `components/HabitCard.tsx`, updated app layout and Ayarlar page.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-habit-management/2-CONTEXT.md
@.planning/phases/02-habit-management/2-01-PLAN.md
@.planning/phases/02-habit-management/2-02-PLAN.md
@lib/use-habits.ts
@lib/habits-db.ts
@lib/habit-types.ts
@components/HabitForm.tsx
@components/HabitFormSheet.tsx
@app/(app)/layout.tsx
@app/(app)/ayarlar/page.tsx

<interfaces>
From lib/use-habits.ts (Plan 01):
```typescript
export interface UseHabitsResult {
  habits: Habit[];
  loading: boolean;
  error: Error | null;
}
export function useHabits(): UseHabitsResult
```

From lib/habits-db.ts (Plan 01):
```typescript
export async function deleteHabit(uid: string, habitId: string): Promise<void>
```

From components/HabitFormSheet.tsx (Plan 02):
```typescript
interface HabitFormSheetProps {
  open: boolean;
  habit?: Habit;
  onClose: () => void;
}
```

From lib/auth-context.tsx:
```typescript
useAuth(): { user: User | null, ... }
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: FAB component with animation</name>
  <files>components/FAB.tsx, app/(app)/layout.tsx</files>
  <read_first>
    - .planning/phases/02-habit-management/2-CONTEXT.md (D-11, D-12)
    - app/(app)/layout.tsx
    - components/TabBar.tsx (for styling reference)
  </read_first>
  <action>
    Create `components/FAB.tsx` as a client component (per D-11):

    Props:
    ```ts
    interface FABProps {
      onClick: () => void;
    }
    ```

    Implementation:
    - Fixed position button: `fixed bottom-24 right-6 z-30 md:bottom-8` (above TabBar on mobile)
    - Circular button: `w-14 h-14 rounded-full bg-fg text-bg shadow-lg`
    - Plus icon: "+" text or SVG, centered
    - Hover state: `hover:scale-110 transition-transform`
    - Use framer-motion for subtle scale on mount: `initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}`
    - Dark mode support via Tailwind `dark:` classes
    - aria-label="Alışkanlık ekle" for accessibility

    Then modify `app/(app)/layout.tsx`:
    - Import `FAB` and `HabitFormSheet` (both client components)
    - Add state: `const [fabSheetOpen, setFabSheetOpen] = useState(false);`
    - Render `<FAB onClick={() => setFabSheetOpen(true)} />` after `{children}` and before `<TabBar />`
    - Render `<HabitFormSheet open={fabSheetOpen} onClose={() => setFabSheetOpen(false)} />` at the end
    - Mark layout as client component: `"use client"` at top

    Per D-12: FAB only appears in `app/(app)` layout (not in login/onboarding, which are outside this layout).
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - grep -q '"use client"' components/FAB.tsx
    - grep -q 'export default' components/FAB.tsx
    - grep -q 'motion\.' components/FAB.tsx
    - grep -q 'onClick' components/FAB.tsx
    - grep -q 'FAB' app/\(app\)/layout.tsx
    - grep -q 'HabitFormSheet' app/\(app\)/layout.tsx
    - grep -q '"use client"' app/\(app\)/layout.tsx
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>FAB renders in app layout, opens HabitFormSheet on click.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: HabitCard component with edit/delete</name>
  <files>components/HabitCard.tsx</files>
  <read_first>
    - lib/habit-types.ts
    - lib/habits-db.ts
    - lib/auth-context.tsx
    - .planning/phases/02-habit-management/2-CONTEXT.md (D-09)
  </read_first>
  <action>
    Create `components/HabitCard.tsx` as a client component (per D-08):

    Props:
    ```ts
    interface HabitCardProps {
      habit: import("@/lib/habit-types").Habit;
      onEdit: (habit: Habit) => void;
      onDeleted: () => void; // called after successful delete
    }
    ```

    Layout (mobile-first card):
    - Card container: `rounded-xl border border-surface bg-surface p-4 flex items-center gap-3`
    - Left: emoji as text (text-2xl)
    - Middle: habit name and metadata (schedule + importance badge)
    - Right: edit button (pencil icon) and delete button (trash icon) — both icon-only, small, ghost style
    - Display schedule as badge: "Her gün" | "Hafta içi" | "Hafta sonu" (text-xs, opacity-60)
    - Display importance as colored dot (w-2 h-2 rounded-full) — critical=red-500, medium=yellow-500, low=green-500
    - If type === "amount", show "Hedef: {targetAmount}" below name (text-sm, opacity-60)

    Delete handler (per D-09):
    ```ts
    const { user } = useAuth();
    const handleDelete = async () => {
      if (!user) return;
      const confirmed = window.confirm(`"${habit.name}" alışkanlığını silmek istediğinizden emin misiniz?`);
      if (!confirmed) return;
      setDeleting(true);
      try {
        await deleteHabit(user.uid, habit.id);
        onDeleted();
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Silme işlemi başarısız oldu.");
      } finally {
        setDeleting(false);
      }
    };
    ```

    Edit handler:
    ```ts
    const handleEdit = () => onEdit(habit);
    ```

    Buttons should be disabled while deleting. Use Tailwind classes for icons or simple text ("✏️" and "🗑️" emojis acceptable if no icon library).
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - grep -q '"use client"' components/HabitCard.tsx
    - grep -q 'export default' components/HabitCard.tsx
    - grep -q 'window.confirm' components/HabitCard.tsx
    - grep -q 'deleteHabit' components/HabitCard.tsx
    - grep -q 'onEdit' components/HabitCard.tsx
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>HabitCard displays habit info with working edit/delete actions.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: HabitList component with realtime data</name>
  <files>components/HabitList.tsx</files>
  <read_first>
    - lib/use-habits.ts
    - components/HabitCard.tsx (from Task 2)
    - .planning/phases/02-habit-management/2-CONTEXT.md (D-10)
  </read_first>
  <action>
    Create `components/HabitList.tsx` as a client component (per D-08, D-10):

    Props:
    ```ts
    interface HabitListProps {
      onEditHabit: (habit: Habit) => void;
    }
    ```

    Implementation:
    - Call `const { habits, loading, error } = useHabits();`
    - While loading: show skeleton or "Yükleniyor..." text
    - If error: show error message (text-red-500)
    - If habits.length === 0 (per D-10): show empty state:
      ```tsx
      <div className="text-center py-12">
        <p className="text-lg opacity-60">Henüz alışkanlık yok</p>
        <p className="text-sm opacity-40 mt-1">+ ile yeni alışkanlık ekle</p>
      </div>
      ```
    - If habits exist: map over habits and render `<HabitCard habit={h} onEdit={onEditHabit} onDeleted={() => {}} />` (onDeleted no-op because useHabits already reacts to deletion via realtime listener)
    - Container: `space-y-3` for vertical spacing between cards
    - No pagination or infinite scroll needed (MVP)

    The list is automatically sorted by `order` then `createdAt` because useHabits returns pre-sorted data (per Plan 01).
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - grep -q '"use client"' components/HabitList.tsx
    - grep -q 'useHabits' components/HabitList.tsx
    - grep -q 'HabitCard' components/HabitList.tsx
    - grep -q 'Henüz alışkanlık yok' components/HabitList.tsx
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>HabitList shows realtime habits with empty state.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Integrate HabitList into Ayarlar page</name>
  <files>app/(app)/ayarlar/page.tsx</files>
  <read_first>
    - app/(app)/ayarlar/page.tsx (current state)
    - components/HabitList.tsx (from Task 3)
    - components/HabitFormSheet.tsx (from Plan 02)
  </read_first>
  <action>
    Modify `app/(app)/ayarlar/page.tsx` to integrate habit management (per D-08):

    Make it a client component: `"use client"` at top.

    State for edit flow:
    ```ts
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [editSheetOpen, setEditSheetOpen] = useState(false);

    const handleEditHabit = (habit: Habit) => {
      setEditingHabit(habit);
      setEditSheetOpen(true);
    };

    const handleCloseEdit = () => {
      setEditSheetOpen(false);
      setEditingHabit(null);
    };
    ```

    Layout:
    - Page title: "Ayarlar" (h1, text-2xl font-bold)
    - Section: "Alışkanlıklar" (h2, text-lg font-medium mt-6 mb-3)
    - Render `<HabitList onEditHabit={handleEditHabit} />`
    - Render `<HabitFormSheet open={editSheetOpen} habit={editingHabit || undefined} onClose={handleCloseEdit} />`
    - Keep any existing content (user email, logout button) below the habit list section

    Import: `HabitList`, `HabitFormSheet`, `Habit` type from `@/lib/habit-types`.

    Do NOT duplicate FAB here — FAB is in the layout and handles create flow globally.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <acceptance_criteria>
    - grep -q '"use client"' app/\(app\)/ayarlar/page.tsx
    - grep -q 'HabitList' app/\(app\)/ayarlar/page.tsx
    - grep -q 'HabitFormSheet' app/\(app\)/ayarlar/page.tsx
    - grep -q 'handleEditHabit' app/\(app\)/ayarlar/page.tsx
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Ayarlar page displays HabitList with edit flow.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Complete Phase 2 habit management system:
    - FAB opens create flow from any app page
    - Ayarlar page shows realtime habit list
    - Create, edit, delete all work end-to-end
    - Firestore persistence and realtime sync
  </what-built>
  <how-to-verify>
    Start dev server: `npm run dev`
    
    1. **FAB Create Flow (HABIT-05):**
       - Open any app page (Bugün, Seri, or Ayarlar)
       - Click FAB (+) button (bottom-right)
       - Verify HabitFormSheet slides up
       - Fill form: name="Test Alışkanlık", type=boolean, schedule=daily, importance=critical, pick emoji/color
       - Click "Kaydet"
       - Verify sheet closes and habit appears in Ayarlar list

    2. **Habit List Display (HABIT-01):**
       - Navigate to Ayarlar tab
       - Verify created habit shows: emoji, name, schedule badge, importance dot
       - Verify habits are sorted by importance (critical→medium→low)

    3. **Edit Flow (HABIT-03):**
       - Click edit button (pencil) on a habit card
       - Verify form opens with pre-filled values
       - Change name or importance
       - Click "Kaydet"
       - Verify changes appear immediately (realtime)

    4. **Delete Flow (HABIT-04):**
       - Click delete button (trash) on a habit card
       - Verify confirmation dialog appears with habit name
       - Click OK
       - Verify habit disappears from list

    5. **Amount Type (HABIT-02):**
       - Click FAB, create habit with type=Miktar
       - Verify "Hedef sayı" field appears
       - Enter target=5, submit
       - Verify habit shows "Hedef: 5" in card

    6. **Empty State (D-10):**
       - Delete all habits
       - Verify "Henüz alışkanlık yok — + ile ekle" message appears

    7. **Responsive (D-13):**
       - Test on mobile viewport (iPhone width)
       - Verify bottom sheet slides from bottom
       - Test on desktop viewport
       - Verify form appears as centered modal

    Expected: All flows work, no console errors, data persists across refresh.
  </how-to-verify>
  <resume-signal>Reply "approved" when verification complete or describe any issues found</resume-signal>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes
- All files exist: FAB.tsx, HabitCard.tsx, HabitList.tsx, modified layout and Ayarlar page
- Manual verification checkpoint confirms all CRUD flows work
</verification>

<success_criteria>
Phase 2 complete: Users can create, edit, and delete habits through the UI. FAB opens create flow from anywhere. Ayarlar page shows realtime habit list with edit/delete actions. All requirements (HABIT-01 through HABIT-05) satisfied.
</success_criteria>

<output>
After completion, create `.planning/phases/02-habit-management/2-03-SUMMARY.md`
</output>
