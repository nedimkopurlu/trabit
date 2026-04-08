# Phase 4: Streak Tab - Research

**Researched:** 2026-04-08
**Domain:** Heat map visualization, streak calculation, statistics aggregation, and Firestore historical data queries
**Confidence:** HIGH

## Summary

Phase 4 implements the "Seri" (Streak) tab to show users a visual 7-day completion history with color-coded status, longest streak statistics, and this-week completion percentage. The technical foundation builds on Phase 3's completion tracking (date-keyed subcollections) and enables powerful insights into habit consistency.

Key findings:
- **7-day heat map**: Query last 7 days of completions for each habit; color code by status (tam/2dk/ilgisiz/boş)
- **Streak calculation**: Traverse ordered completions backward, break only on "full" completions (not 2dk), count consecutive days
- **Timezone complexity**: Day boundaries must respect user's timezone + schedule (weekday/weekend); Firestore queries use date strings, filtering happens post-query
- **Statistics aggregation**: Total completions, longest streak, and this-week percentage are all calculated from the same completion set with simple array operations
- **No hand-rolling**: Completion state management is built; heat map visualization uses Tailwind grid + Framer Motion; stats are pure JavaScript calculations
- **Real-time sync**: Use `onSnapshot` listeners on the completions collection to keep statistics fresh as user completes habits

**Primary recommendation:**
Build a `useStreakStats` hook that listens to a habit's completions subcollection in real-time. Calculate all four statistics (current streak, longest streak, total, this-week %) from the completion set using simple O(n) traversals. Render 7-day heat map with a Tailwind grid of color-coded cells. No external libraries needed — Firestore listeners + React state + native Date handling + Tailwind colors.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STREAK-01 | Her alışkanlık için 7 günlük ısı haritası gösterilir (tam / 2dk / ilgisiz / boş renk kodları) | 7-day window calculation with getTodayInTimezone(); completion colors based on `quick` flag and schedule mismatch |
| STREAK-02 | Hafta sonu alışkanlıkları hafta içi günlerde boş/eksik sayılmaz; "ilgisiz" rengiyle gösterilir | Schedule filtering + color mapping: weekday habits on weekend = "ilgisiz" (neutral gray), vice versa |
| STREAK-03 | 2dk tamamlama seriyi kırmaz ama ısı haritasında ayrı renkte gösterilir | Streak calculation skips quick completions; heat map colors distinguish `quick: true` vs `quick: false` |
| STREAK-04 | Her alışkanlık için en uzun seri istatistiği gösterilir | Traverse completion history backward; longest unbroken sequence of "full" completions wins; track max |
| STREAK-05 | Her alışkanlık için toplam tamamlama sayısı gösterilir | Count all completion documents where `completed: true` and `quick: false` |
| STREAK-06 | Her alışkanlık için bu haftaki tamamlama oranı gösterilir | Count this week's completions ÷ expected habits this week; percentage format |

</phase_requirements>

---

## Standard Stack

### Core Libraries (Already in package.json)

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| **firebase** | ^10.12.0 | Real-time listeners on completions subcollection, historical date range queries | HIGH |
| **framer-motion** | ^11.0.0 | Heat map cell animations (stagger, fade-in), statistics counter animations | HIGH |
| **next** | ^14.2.0 | App router, server/client boundaries | HIGH |
| **react** | ^18.3.0 | Hooks (useEffect, useState, useMemo) for stats calculation | HIGH |
| **tailwindcss** | ^3.4.0 | Grid layout for heat map, color tokens (critical/medium/low), responsive design | HIGH |

### New Utilities (to create)

| Module | Purpose | Approach |
|--------|---------|----------|
| `lib/streak-stats.ts` | Streak calculation (current, longest, total, this-week %) from completion array | Pure JavaScript: array traversal, date arithmetic |
| `lib/use-streak-stats.ts` | Hook: real-time listener on completions subcollection + stats calculation | React hook with `onSnapshot` listener, memoized calculations |
| `lib/heat-map-utils.ts` | 7-day window generation, completion color mapping, schedule-aware cell status | Date arithmetic, Intl API for timezone, schedule logic reuse from Phase 3 |
| `components/StreakHabitCard.tsx` | Single habit card with 7-day heat map grid, stats display, colors | Tailwind grid, Framer Motion stagger animation |
| `components/HeatMapGrid.tsx` | Reusable 7-day grid component with tooltips | Grid layout, hover states, color mapping |
| `components/StatRow.tsx` | Stat display (number + label) with animated counter | Framer Motion motion.div for number animation |
| `app/(app)/seri/page.tsx` | Streak tab main page, list all habits with streak cards | Already exists; add population logic |

### Not Included (Hand-Rolling Prevention)

- ❌ `react-calendar`, `react-day-picker`, `react-date-range` — Use Tailwind grid + native Date for 7-day window
- ❌ `chart.js`, `recharts`, `visx` — Heat map is simple 7-cell grid, not complex visualization
- ❌ Custom streak calculation algorithm — Use simple O(n) traversal of ordered completions
- ❌ Real-time aggregation service (Cloud Functions) — Calculate stats on client; Firestore listeners handle sync
- ❌ Date libraries (date-fns, dayjs, moment) — Native Intl API + Date arithmetic, already in Phase 3

---

## Architecture Patterns

### 1. 7-Day Heat Map Window

**Pattern: Generate last 7 calendar days in user's timezone, map to completions**

```typescript
// lib/heat-map-utils.ts
export interface HeatMapCell {
  date: string;           // YYYY-MM-DD
  dayOfWeek: string;      // "Mon", "Tue", etc.
  status: "completed" | "quick" | "irrelevant" | "empty"; // Color mapping
  isRelevantToday?: boolean; // true if habit's schedule allows today
}

export function getLast7DayWindow(
  timezone: string = getUserTimezone()
): HeatMapCell[] {
  const today = getTodayInTimezone(timezone);
  const days: HeatMapCell[] = [];

  // Generate 6 days back + today = 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDateToString(date); // YYYY-MM-DD

    const formatter = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: timezone,
    });
    const dayOfWeek = formatter.format(date);

    days.push({
      date: dateStr,
      dayOfWeek,
      status: "empty", // Will be filled by completion query
    });
  }

  return days;
}
```

**Why this pattern:**
- ✓ Respects timezone-aware day boundaries (same as Phase 3 filtering)
- ✓ Separates "not scheduled" from "missed" — important UX distinction
- ✓ Sortable date strings enable easy lookup of completion docs
- ✓ O(1) lookup per day if completions pre-fetched

---

### 2. Real-Time Streak Statistics Hook

**Pattern: `onSnapshot` listener on completions + memoized stats calculation**

The `useStreakStats` hook listens to ALL completions in real-time and calculates four stats:
- Current streak: Unbroken sequence ending today (full completions only)
- Longest streak: Maximum historical streak
- Total completions: Count of full completions (quick=false)
- This-week percentage: (Completions this week ÷ Expected this week) × 100

**Key detail:** Quick completions do NOT break streaks but are counted separately in heat map.

---

### 3. Heat Map Grid Component

**Pattern: Tailwind grid of colored cells with Framer Motion stagger animation**

7 cells in a row (oldest to newest), stagger animation on entry, hover states for desktop.

**Color Mapping:**
- Green: Full completion
- Yellow: "2dk" quick completion
- Gray: Habit not scheduled (weekday habit on weekend)
- Light/white: Scheduled but not completed

---

## Common Pitfalls

### Pitfall 1: Timezone Mismatches in Streak Calculation
- **Problem**: Server UTC vs. user timezone = wrong "today" boundary
- **Prevention**: Always use `getTodayInTimezone(timezone)` never `new Date()`
- **Signs**: Streak jumps unexpectedly at day boundary

### Pitfall 2: Quick Completions Break Streak
- **Problem**: Streaks drop to 0 after "2dk" mark
- **Prevention**: Filter to `quick !== true` BEFORE streak calc
- **Signs**: Streak shows "0" but "2dk" visible in heat map

### Pitfall 3: Irrelevant Days Counted as Misses
- **Problem**: Weekend habit shows as "missed" on Saturday
- **Prevention**: Apply schedule filter in streak walk-back
- **Signs**: Streaks include irrelevant days; this-week % wrong

### Pitfall 4: Excessive Re-renders from Listener
- **Problem**: Stats recalculate on every change
- **Prevention**: Memoize stats with `useMemo([completions, schedule, timezone])`
- **Signs**: CPU spike when marking habits complete

### Pitfall 5: Week Start Locale-Dependent
- **Problem**: Week boundaries shift by timezone
- **Prevention**: Define week as ISO (Mon-Sun) explicitly
- **Signs**: This-week % changes at boundary days

---

## Validation Architecture

### Test Coverage
| Requirement | Test Type | Priority |
|-------------|-----------|----------|
| STREAK-01 | 7-day window generation + color mapping | unit |
| STREAK-02 | Schedule-aware irrelevant day detection | unit |
| STREAK-03 | Quick completion filtering for streak | unit |
| STREAK-04 | Longest streak calculation with gaps | unit |
| STREAK-05 | Total count excludes quick | unit |
| STREAK-06 | This-week % respects schedule | unit |

### Wave 0 Gaps
- [ ] `__tests__/streak-stats.test.ts` — Streak calculation tests
- [ ] `__tests__/heat-map-utils.test.ts` — Window + color mapping tests
- [ ] `__tests__/StreakHabitCard.test.tsx` — Component render tests
- [ ] Test fixtures for various schedules/quick mixes

---

## Sources

### Primary (HIGH confidence)
- **Firebase Firestore v10.12.0** — Real-time listeners, subcollections
- **React 18.3** — Hooks (useEffect, useState, useMemo)
- **Intl.DateTimeFormat API** — Timezone handling (MDN verified)
- **Tailwind CSS v3.4** — Grid layout, CSS variables, dark mode
- **Framer Motion v11** — Animations (stagger, spring physics)
- **Existing codebase** — Phase 3 patterns for completion tracking

### Secondary (MEDIUM confidence)
- Browser Intl API compatibility with iOS Safari 11+
- Firestore listener scalability for 365+ docs/year

---

## Metadata

**Confidence:** HIGH (established patterns, verified libraries)
**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (one month)
**Status:** Ready for planning

---

**Research complete. Ready for `/gsd:plan-phase 4`.**
