# Phase 3: Today Tab - Planning Summary

**Phase Goal:** 
Kullanıcı o güne ait alışkanlıklarını görür, tamamlar ve her tamamlamada anlık görsel geri bildirim alır

**Status:** Plans created and ready for execution

---

## Plan Breakdown

### Wave 1: Foundation (Parallel Plans 01-02)

**Plan 03-01: Completion Data Layer** (1-2 hours)
- Habit schedule filtering (daily/weekdays/weekends) with native Intl API
- Firestore completion schema (subcollection pattern)
- `useHabitCompletion` hook with optimistic UI + listeners
- Test scaffolding for Wave 0 validation
- **Requirements:** TODAY-01, TODAY-03
- **Files modified:** 9 new files (lib + tests)

**Plan 03-02: UI Components & Animations** (1-2 hours)  
- `ProgressBar` component with Framer Motion spring physics
- `HabitCheckButton` with whileTap feedback
- `TodayHabitCard` (boolean habits) with exit animations
- `AmountHabitCard` (amount habits) with +/- controls
- Test scaffolding
- **Requirements:** TODAY-02, TODAY-03, TODAY-04
- **Files modified:** 9 new files (components + tests)

### Wave 2: Integration (Plan 03)

**Plan 03-03: Integration & Today Page** (1-2 hours)
- Custom toast system (context + components)
- Today page with habit filtering by schedule
- Toast notifications on completion (with identity sentence)
- Real-time sync wiring
- E2E test scaffolding
- **Requirements:** TODAY-01, TODAY-04, TODAY-06
- **Files modified:** 9 new files (lib + components + app + tests)

### Wave 3: Polish (Optional Plan 04)

**Plan 03-04: Celebration Screen** (1-2 hours) ← *Optional / Phase 3.1 prep*
- Full-screen celebration modal on all-complete
- Auto-dismiss and animation sequences
- Celebration utilities (confetti/sound hooks for Phase 3.1)
- Test scaffolding
- **Requirements:** TODAY-05, TODAY-07 (deferrable)
- **Files modified:** 5 new files (components + lib + tests)

---

## Execution Strategy

### Wave 1 (Parallel Execution)

**Plan 03-01** and **Plan 03-02** can run in parallel (no file conflicts):

| Plan | Focus | Output | Dependencies |
|------|-------|--------|--------------|
| 03-01 | Data/state | Hooks, CRUD, filtering logic | Phase 2 schema |
| 03-02 | UI/animations | Components, Framer Motion | Framer Motion v11 installed |

**Start both in parallel. Either can be completed first (no blocking).**

### Wave 2 (Dependent on Wave 1)

**Plan 03-03** depends on both 03-01 and 03-02:
- Consumes `useHabitCompletion` from 03-01
- Renders `TodayHabitCard` and `AmountHabitCard` from 03-02
- Creates Today page that ties everything together

**Start 03-03 after Wave 1 completes (both 01 and 02 must be done).**

### Wave 3 (Optional)

**Plan 03-04** depends on 03-03:
- Uses completion tracking from 03-03
- Renders over Today page
- Adds celebration polish

**Include only if time permits. Can be deferred to Phase 3.1.**

---

## Requirement Mapping

| Requirement | Plan(s) | Coverage |
|-------------|---------|----------|
| TODAY-01: Filter by schedule | 03-01, 03-03 | `isHabitScheduledToday()` + page filtering |
| TODAY-02: Sort by importance | 03-02, 03-03 | Color coding + sort algorithm |
| TODAY-03: Boolean/amount UI | 03-02, 03-03 | Components + Today page |
| TODAY-04: Exit animations + toast | 03-02, 03-03 | Framer Motion exit + toast system |
| TODAY-05: Celebration on all-complete | 03-04 | Celebration modal (optional) |
| TODAY-06: Identity sentence in toast | 03-03, 03-04 | Toast messages + celebration |
| TODAY-07: Full-screen celebration | 03-04 | Celebration modal (optional) |

**All core requirements (TODAY-01 through TODAY-04) covered by mandatory plans (03-01 through 03-03).**  
**Celebration requirements (TODAY-05, TODAY-07) in optional plan 03-04.**

---

## Key Technical Patterns

### Pattern 1: Native Timezone Handling (No date-fns)
```typescript
// lib/habit-schedule.ts
const formatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: timezone, // User's timezone, not server UTC
});
```
✓ Zero dependencies, works offline, iOS Safari compatible

### Pattern 2: Firestore Subcollections for Scalability
```
/users/{uid}/habits/{habitId}/completions/{dateStr}
```
✓ Date-keyed documents queryable by range, real-time sync, auto-cleanup

### Pattern 3: Optimistic UI + Real-time Listeners
```typescript
// Optimistic: setIsComplete(true) immediately
// Real-time: Firestore listener confirms or reverts
```
✓ Instant feedback + reliable sync, works offline

### Pattern 4: Custom Toast (Lightweight)
```typescript
// Context + Framer Motion animations
// ~2KB vs 60KB for react-toastify
```
✓ Consistent with habit card animations, smaller PWA bundle

---

## Testing Strategy

### Wave 0: Test Scaffolding
Each plan includes test skeleton files (failing tests):
- `tests/lib/habit-schedule.test.ts` (Plan 03-01)
- `tests/components/ProgressBar.test.tsx` (Plan 03-02)
- `tests/app/today/page.test.tsx` (Plan 03-03)
- `tests/components/CelebrationScreen.test.tsx` (Plan 03-04)

**These are failing/skipped initially. Implementation must make them pass (TDD).**

### Coverage Targets
- **Unit tests:** Utilities (habit-schedule, completions-db) — 100% coverage
- **Component tests:** Card rendering, animations, state changes — 80% coverage
- **E2E tests:** Complete today's habits flow, toast appears, etc. — key flows

### Run Commands
```bash
# Watch mode during development
npm test -- --testPathPattern="today" --watch

# Full suite before commit
npm test

# Specific test file
npm test -- lib/habit-schedule.test.ts
```

---

## Dependencies & Assumptions

### External Dependencies
- Firebase v10.12.0+ (already installed)
- Framer Motion v11.0.0+ (already installed)
- Next.js 14.2.0+ (already installed)
- React 18.3.0+ (already installed)
- Tailwind CSS (already configured)

### Internal Dependencies
- **Phase 1:** Auth context, identity sentence, useAuth hook
- **Phase 2:** Habit CRUD, useHabits hook, Firestore schema with `schedule` field
- **Codebase patterns:** Existing auth-context, habit-types, hooks patterns

### No Hand-Rolling
- ❌ No date libraries (moment, dayjs, date-fns) — use native Intl API
- ❌ No heavy toast libraries (react-toastify) — custom Framer Motion system
- ❌ No Redux/Zustand — use Context + React hooks
- ❌ No charting libraries — use SVG + Framer Motion progress bar

---

## Timeline & Effort

### Estimated Execution Time
| Wave | Plans | Effort | Parallelization |
|------|-------|--------|-----------------|
| W1 | 01-02 | 2-4 hours | Parallel (no conflicts) |
| W2 | 03 | 1-2 hours | Depends on W1 |
| W3 | 04 | 1-2 hours | Optional; depends on W2 |
| **Total** | **3-4 plans** | **4-8 hours** | **~4 hours if parallelized** |

### Optimization Opportunities
- Plans 03-01 and 03-02 run in parallel → saves ~1-2 hours
- Reuse existing Tailwind classes → faster styling
- Firebase listeners are pre-built → no custom sync logic needed
- Framer Motion patterns are common in codebase → familiar syntax

---

## Success Criteria (Phase Gate)

After executing all plans, verify:

1. ✓ Today tab shows only today's relevant habits (schedule filter working)
2. ✓ Habits sorted by importance (critical→medium→low)
3. ✓ Boolean habits have Yaptım/2dk buttons; amount habits have +/- buttons
4. ✓ Tapping complete slides habit with animation, shows toast with identity sentence
5. ✓ Data syncs in realtime from Firestore (completion persists)
6. ✓ Works offline (PWA): completions marked locally, sync on reconnect
7. ✓ Responsive on mobile (iPhone-first design)
8. ✓ Dark mode works (colors visible in both modes)
9. ✓ All tests pass: `npm test -- --testPathPattern="today"`
10. ✓ No TypeScript errors: `npm run typecheck`

---

## What's NOT in Phase 3 (Deferred)

- ❌ Celebration screen with confetti → Phase 3.1 (optional Plan 03-04 scaffolds it)
- ❌ Streak tracking (3-day streaks, badges) → Phase 4+
- ❌ Habit history/stats → Phase 5+
- ❌ Time-based habit scheduling (morning/evening) → Phase 4+
- ❌ "2dk" quick-complete with different tracking → Phase 4+
- ❌ Timezone storage in user doc → Phase 4+ (uses browser timezone for now)

---

## Next Steps

1. **Confirm Plan Structure:** Review all 4 plans, confirm task breakdown aligns with phase goal
2. **Start Wave 1:** Execute Plan 03-01 and 03-02 in parallel
3. **After Wave 1:** Execute Plan 03-03 (integration)
4. **Optional:** Execute Plan 03-04 if time permits, or defer to Phase 3.1
5. **Phase Gate:** Run `/gsd:verify-work` to validate all requirements met

---

## Metadata

**Created:** 2026-04-08  
**Phase:** 03-today-tab  
**Plans:** 4 (3 mandatory, 1 optional)  
**Waves:** 3 (first 2 parallel, third sequential)  
**Total Effort:** 4-8 hours (4 hours with parallelization)  
**Dependencies:** Phase 1 & 2 complete  
**Next Gate:** `/gsd:execute-phase 03-today-tab`
