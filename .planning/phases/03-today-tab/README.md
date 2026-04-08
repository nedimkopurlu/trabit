# Phase 3: Today Tab - Execution Guide

## 📋 Quick Reference

**Phase Goal:** Users see today's relevant habits, complete them, and get instant visual feedback with animations

**Phase Requirements:** TODAY-01 through TODAY-07 (see PLANNING_SUMMARY.md for detailed mapping)

**Status:** ✅ Plans created and ready to execute

---

## 🚀 How to Get Started

### 1. Read Planning Summary
```bash
# Understand wave structure, timeline, and requirement mapping
cat .planning/phases/03-today-tab/PLANNING_SUMMARY.md
```

### 2. Review Individual Plans (in order)
- **Plan 03-01:** Data layer (completions, schedule filtering)
- **Plan 03-02:** UI components (progress bar, buttons, cards)
- **Plan 03-03:** Integration (Today page, toast system, real-time sync)
- **Plan 03-04:** Celebration (optional, deferred polish)

```bash
# Read each plan
cat .planning/phases/03-today-tab/03-01-PLAN.md  # Data layer
cat .planning/phases/03-today-tab/03-02-PLAN.md  # UI components
cat .planning/phases/03-today-tab/03-03-PLAN.md  # Integration
cat .planning/phases/03-today-tab/03-04-PLAN.md  # Celebration (optional)
```

---

## 🔄 Execution Waves

### Wave 1: Foundation (Parallel) — 2-4 hours

**Run Plan 03-01 and Plan 03-02 in parallel** (different files, no conflicts):

| Plan | Focus | Key Files | Task Count |
|------|-------|-----------|-----------|
| 03-01 | Data/state | `lib/habit-schedule.ts`, `lib/completions-db.ts`, `lib/use-habit-completion.ts` | 4 tasks |
| 03-02 | UI/animations | `components/*.tsx` (4 components), test files | 5 tasks |

**Both can complete independently. Start both now.**

### Wave 2: Integration — 1-2 hours (after Wave 1)

**Run Plan 03-03 after Wave 1 complete** (depends on 03-01 + 03-02):

| Plan | Focus | Key Files | Task Count |
|------|-------|-----------|-----------|
| 03-03 | Integration | `app/today/page.tsx`, toast system, E2E tests | 5 tasks |

**Start after both 03-01 and 03-02 finish.**

### Wave 3: Polish (Optional) — 1-2 hours (after Wave 2)

**Run Plan 03-04 if time permits** (depends on 03-03, can defer to Phase 3.1):

| Plan | Focus | Key Files | Task Count |
|------|-------|-----------|-----------|
| 03-04 | Celebration | `components/CelebrationScreen.tsx`, `lib/celebration-utils.ts` | 4 tasks |

**Include only if time allows. Can defer to Phase 3.1 without breaking core features.**

---

## 📊 Technical Highlights

### What's New (Not in existing code)

| Component/Utility | Purpose | Library | Size |
|-------------------|---------|---------|------|
| `lib/habit-schedule.ts` | Day-of-week filtering | Native Intl API | ~100 lines |
| `lib/completions-db.ts` | Firestore CRUD | Firebase SDK | ~150 lines |
| `lib/use-habit-completion.ts` | Optimistic UI hook | React hooks | ~120 lines |
| `components/ProgressBar.tsx` | Animated progress | Framer Motion | ~80 lines |
| `components/HabitCheckButton.tsx` | Toggle button | Framer Motion | ~60 lines |
| `components/TodayHabitCard.tsx` | Boolean habit card | Framer Motion | ~100 lines |
| `components/AmountHabitCard.tsx` | Amount habit card | Framer Motion | ~120 lines |
| `lib/toast-context.tsx` | Toast system | React Context | ~80 lines |
| `components/Toast.tsx` | Toast display | Framer Motion | ~80 lines |
| `components/ToastContainer.tsx` | Toast manager | React Context | ~60 lines |
| `app/today/page.tsx` | Today page | React hooks | ~100 lines |
| `components/CelebrationScreen.tsx` | Celebration modal | Framer Motion | ~100 lines |

**Total:** ~1,200 lines of new code across 12+ files

### What's Reused (From Phase 1-2)

- ✓ Firebase auth context
- ✓ useAuth hook (get uid)
- ✓ useHabits hook (get habit list)
- ✓ Habit schema (type, schedule, importance, color)
- ✓ Tailwind theme + dark mode
- ✓ Framer Motion patterns (already used in UI)

### Key Design Decisions

1. **Native Intl API** (not date-fns)
   - Zero dependencies, works offline, iOS Safari compatible
   - Handles timezone-aware day calculations

2. **Firestore Subcollections** (not arrays)
   - Scales infinitely (1 doc/day per habit)
   - Queryable by date range for streaks
   - Real-time listeners work at subcollection level

3. **Optimistic UI + Listeners** (not Redux)
   - Component-level state with Firebase listeners
   - Instant feedback + reliable sync
   - Works offline with PWA persistence

4. **Custom Toast** (not react-toastify)
   - ~2KB vs 60KB for heavy toast library
   - Consistent Framer Motion animations
   - Fewer dependencies for PWA bundle

---

## ✅ Verification Checklist

After completing all plans, verify:

- [ ] **Schedule filtering:** `/today` shows only today's habits (not Monday's habits on Tuesday)
- [ ] **Importance sorting:** Cards appear critical→medium→low (colors match)
- [ ] **Boolean habits:** "Yaptım" and "2dk" buttons visible and clickable
- [ ] **Amount habits:** +/- buttons, progress bar animates on change
- [ ] **Exit animation:** When completing, card slides right and exits list smoothly
- [ ] **Toast notification:** Identity sentence appears (e.g., "Yoga tamamlandı! Gücendim!")
- [ ] **Real-time sync:** Complete habit, refresh page, habit still marked complete
- [ ] **Offline mode:** Turn off network, complete habit, toast shows, sync when back online
- [ ] **Dark mode:** Toggle dark mode, colors readable in both modes
- [ ] **Mobile responsive:** Layout works on iPhone SE (375px width)
- [ ] **Tests pass:** `npm test -- --testPathPattern="today"`
- [ ] **No errors:** `npm run typecheck` passes

---

## 🔗 Key File Locations

### Libraries
```
lib/
  habit-schedule.ts          # Day-of-week filtering
  completions-db.ts          # Firestore CRUD
  use-habit-completion.ts    # State hook
  toast-context.tsx          # Toast provider
  celebration-utils.ts       # Phase 3.1 prep
```

### Components
```
components/
  ProgressBar.tsx            # Animated progress (0-100%)
  HabitCheckButton.tsx       # Toggle button
  TodayHabitCard.tsx         # Boolean habit card
  AmountHabitCard.tsx        # Amount habit card
  Toast.tsx                  # Toast display
  ToastContainer.tsx         # Toast manager
  CelebrationScreen.tsx      # Celebration modal
```

### App
```
app/
  today/
    page.tsx                 # Today page
```

### Tests
```
tests/
  lib/
    habit-schedule.test.ts
    completions-db.test.ts
    use-habit-completion.test.ts
    toast-context.test.ts
    celebration-utils.test.ts
  components/
    ProgressBar.test.tsx
    HabitCheckButton.test.tsx
    TodayHabitCard.test.tsx
    AmountHabitCard.test.tsx
    Toast.test.tsx
    ToastContainer.test.tsx
    CelebrationScreen.test.tsx
  app/
    today/
      page.test.tsx
```

---

## 📝 Dependency Tree

```
Wave 1 (Parallel)
├── Plan 03-01: Completion Data Layer
│   └── Files: lib/habit-schedule.ts, lib/completions-db.ts, lib/use-habit-completion.ts
│   └── Tests: tests/lib/*
│
└── Plan 03-02: UI Components & Animations
    └── Files: components/{ProgressBar,HabitCheckButton,TodayHabitCard,AmountHabitCard}.tsx
    └── Tests: tests/components/*

Wave 2 (After Wave 1)
└── Plan 03-03: Integration & Today Page
    ├── Depends on: 03-01 + 03-02
    └── Files: app/today/page.tsx, lib/toast-context.tsx, components/{Toast,ToastContainer}.tsx
    └── Tests: tests/app/today/page.test.tsx, tests/components/{Toast,ToastContainer}.test.tsx

Wave 3 (Optional, After Wave 2)
└── Plan 03-04: Celebration Screen
    ├── Depends on: 03-03
    └── Files: components/CelebrationScreen.tsx, lib/celebration-utils.ts
    └── Tests: tests/components/CelebrationScreen.test.tsx, tests/lib/celebration-utils.test.ts
```

---

## 🎯 Next Actions

### Immediate (Now)
1. Read `PLANNING_SUMMARY.md` to understand phase structure
2. Review `03-01-PLAN.md` and `03-02-PLAN.md`
3. Start execution of Wave 1 plans in parallel

### After Wave 1 (When both 03-01 and 03-02 complete)
4. Review `03-03-PLAN.md`
5. Start execution of Wave 2 (Plan 03-03)

### After Wave 2 (If time permits)
6. Review `03-04-PLAN.md` (optional celebration)
7. Execute Plan 03-04 or defer to Phase 3.1

### After All Plans
8. Run full test suite: `npm test -- --testPathPattern="today"`
9. Run type check: `npm run typecheck`
10. Manual verification (see checklist above)
11. Commit changes
12. Run phase verification: `/gsd:verify-work`

---

## 🆘 Common Questions

**Q: Can I run all plans at once?**  
A: No. Waves must respect dependencies. Run 01-02 in parallel (Wave 1), then 03 (Wave 2), then 04 optional (Wave 3).

**Q: What if a test fails?**  
A: Each plan includes skeleton tests (failing initially). Your job is to implement the code to make them pass (TDD). Run `npm test -- [filename] --watch` to develop.

**Q: Do I need to use date-fns?**  
A: No. Research explicitly chose native Intl API to avoid adding another dependency. Use `lib/habit-schedule.ts` functions.

**Q: Can I use react-toastify instead of custom toast?**  
A: No. Research decided against it to keep PWA bundle small. Custom Framer Motion toast is lightweight and consistent.

**Q: What about the "2dk" quick complete?**  
A: It's a UI button for now (Plan 03-02). The hook implementation comes later (Phase 4). For Phase 3, treat "2dk" same as "Yaptım" (marks complete).

**Q: Is celebration required?**  
A: No. Plans 03-01 through 03-03 are mandatory. Plan 03-04 (celebration) is optional and can be deferred to Phase 3.1.

---

## 📞 Research Reference

For technical details on patterns and decisions, see `03-RESEARCH.md`:
- Why native Intl API over date-fns
- Why Firestore subcollections
- Why optimistic UI + listeners
- Why custom toast system
- Complete code examples
- Pattern explanations

---

## 🎓 Learning Resources

### Framer Motion Patterns (Plan 03-02)
- Spring physics: `transition: { type: "spring", stiffness: 100, damping: 30 }`
- Exit animations: `exit: { opacity: 0, x: 300 }`
- AnimatePresence: `<AnimatePresence mode="popLayout">`

### Firebase Patterns (Plan 03-01)
- Firestore subcollections: `users/{uid}/habits/{habitId}/completions/{date}`
- Real-time listeners: `onSnapshot(query, (snapshot) => {})`
- Offline persistence: Built into Firebase SDK

### React Patterns (Plans 03-01, 03-03)
- Custom hooks: `useHabitCompletion`, `useToast`
- Context providers: `ToastProvider`
- Client components: `"use client"` directive (Next.js 14)

---

## 📈 Success Metrics

Phase 3 is **complete** when:

1. ✅ All core requirements working (TODAY-01 through TODAY-04)
2. ✅ Optional celebration working or deferred (TODAY-05, TODAY-07)
3. ✅ User can complete a full workflow: see habits → complete habit → see animation + toast
4. ✅ Offline mode works: complete habit offline, sync on reconnect
5. ✅ All tests pass (80%+ coverage on components, 100% on utils)
6. ✅ No TypeScript errors
7. ✅ Responsive mobile layout
8. ✅ Dark mode works

**Timeline:** 4-8 hours (4 hours if Wave 1 runs in parallel)

---

**Ready to start? Begin with Wave 1: Plans 03-01 and 03-02 in parallel.**
