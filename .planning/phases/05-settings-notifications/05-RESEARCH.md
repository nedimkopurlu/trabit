# Phase 5: Settings & Notifications - Research

**Researched:** 2026-04-08
**Domain:** Theme persistence and management, user identity settings, PWA push notifications, scheduled notifications, iOS PWA limitations
**Confidence:** HIGH

## Summary

Phase 5 implements two core user-customization features for the Trabit PWA:

1. **Settings (Appearance + Identity)** — Theme toggle (light/dark) stored in localStorage + identity sentence editing in Firestore. Identity sentence is already displayed in celebration screens and completion toasts; Phase 5 adds the ability to edit it.

2. **Notifications** — Per-habit notification times stored in Firestore. PWA push notifications at scheduled times via Service Worker + Notification API. iOS PWA has critical limitations: no background task scheduling, no push from server. Best-effort approach: scheduled checks when app is open or browser is running.

**Key findings:**

- **Theme system:** Already 90% implemented—`lib/theme.ts` handles localStorage persistence, `ThemeScript.tsx` prevents flash, Tailwind `darkMode: "class"` is configured, CSS variables defined for light/dark. Only missing: UI toggle in settings page.
- **Identity sentence:** Already stored in Firestore (`users/{uid}.identitySentence`), already loaded in AuthContext, already displayed in CelebrationScreen and toasts. Only missing: edit form + toast feedback in settings page.
- **Notification storage:** `Habit.notificationTime` field exists as `string | null` (HH:MM format). `HabitForm.tsx` already has UI and validation for notification toggle + time picker. Firestore writes working. Only missing: service-side schedule trigger + iOS best-effort fallback.
- **iOS PWA limitations:** No background sync, no server push support, no scheduled local notifications via standard Web APIs. Workarounds: client-side polling when app is active, Notification API for local alerts, browser foreground check via Service Worker events.

**Primary recommendation:**

1. Add theme toggle to settings page—wire to `applyTheme()`, refresh immediately via `useEffect` on localStorage + React state
2. Add identity sentence edit form to settings page—reuse HabitForm pattern (input + submit button), call `updateIdentitySentence()`, show success toast
3. Create `lib/notification-scheduler.ts` utility for client-side notification scheduling—calculate next trigger time, compare to current time, fire local `Notification` when time arrives
4. Register notification scheduler in Service Worker message handler—app sends scheduled habits on each page load; SW checks every N minutes (30-60s polling on mobile)
5. For iOS: rely on app-open notifications only—users must open app to receive alerts. Document this as "best-effort on iOS PWA"

**Tech Stack:** No new libraries needed. Use existing Firestore, Notification API (native), Service Worker (via next-pwa), localStorage (native).

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SETTINGS-01 | Kullanıcı gece/gündüz modu arasında geçiş yapabilir | Theme toggle in settings → calls `applyTheme()` → updates localStorage + `<html class="dark">` + Tailwind variables |
| SETTINGS-02 | Kullanıcı kimlik cümlesini düzenleyebilir; güncelleme tamamlama toastlarına yansır | Edit form in settings → calls `updateIdentitySentence()` → updates Firestore + AuthContext.identitySentence state → reflected in next completion toast |
| NOTIF-01 | Her alışkanlık için bağımsız bildirim saati ayarlanabilir | Already in HabitForm UI + Habit.notificationTime field. Plan extends to settings-specific UI if needed. |
| NOTIF-02 | Belirlenen saatte PWA push bildirimi gönderilir (iOS PWA kısıtları dahilinde best-effort) | Client-side scheduler: check on app load + periodic SW polling. For iOS: best-effort when app is open only. Use Notification API for local alerts. |

</phase_requirements>

---

## User Constraints (from CONTEXT.md)

> No CONTEXT.md exists for this phase. Claude has full discretion on research and recommendations.

---

## Standard Stack

### Core Libraries (Already in package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **firebase** | ^10.12.0 | Read/write Firestore user doc (theme, identity sentence) + real-time listeners | Already used for habits; built-in |
| **next** | ^14.2.0 | App router, Server Components for settings layout | Already used throughout |
| **react** | ^18.3.0 | Hooks for theme state, form handling, identity sentence edit | Already used throughout |
| **framer-motion** | ^11.0.0 | Toggle animations, form transitions (optional but consistent) | Matches Phase 3-4 patterns |
| **tailwindcss** | ^3.4.0 | Dark mode class-based theming, responsive settings layout | Already configured with `darkMode: "class"` |
| **@ducanh2912/next-pwa** | ^10.2.0 | Service Worker registration, Notification API support | Already in project; auto-generates sw.js |

### Supporting Utilities (No Installation Needed)

| Module | Purpose | Approach |
|--------|---------|----------|
| **Notification API** (native) | Local notification display + permissions | Standard Web API; no npm package |
| **localStorage** (native) | Theme persistence | Standard Web Storage API; no npm package |
| **Service Worker** (via next-pwa) | Message passing, notification scheduling checks | Managed by next-pwa; custom listeners in sw.js |

### Not Included (Hand-Rolling Prevention)

- ❌ `react-toastify`, `sonner` — Use existing ToastContext + Toast component
- ❌ `zustand`, `redux` — Theme state fits in localStorage + React useState
- ❌ `react-hook-form` — Use form pattern from HabitForm (useState + validation)
- ❌ `date-fns`, `dayjs` — Time picker is simple string input (HH:MM), no complex date math
- ❌ `node-cron`, `react-scheduler`, `cron-parser` — Scheduling happens on client; no server background jobs needed
- ❌ `react-select`, `react-datetime-picker` — Use native HTML5 `<input type="time">` (works on iOS PWA)

---

## Architecture Patterns

### Pattern 1: Theme Toggle (Light/Dark Mode)

**What:** User clicks toggle in settings → apply theme → persist to localStorage → sync across all tabs → Tailwind dark mode colors auto-update via CSS variables.

**When to use:** Every PWA needs theme persistence; Trabit already has the foundation.

**Implementation:**

```typescript
// lib/theme.ts (ALREADY EXISTS, no changes needed)
export function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: "light" | "dark"): void {
  if (typeof window === "undefined") return;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
}
```

**Component pattern:**

```typescript
// components/ThemeToggle.tsx (NEW)
"use client";

import { useState, useEffect } from "react";
import { getInitialTheme, applyTheme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // On mount, read from localStorage + sync to state
  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
  }, []);

  const handleToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    applyTheme(newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="px-4 py-2 rounded-lg bg-surface text-fg hover:opacity-80"
    >
      {theme === "light" ? "🌙 Gece Modu" : "☀️ Gündüz Modu"}
    </button>
  );
}
```

**CSS already supports it:**

```css
/* app/globals.css (ALREADY EXISTS) */
:root {
  --color-bg: 255 255 255;
  --color-surface: 245 245 247;
  --color-fg: 17 17 17;
}
.dark {
  --color-bg: 10 10 12;
  --color-surface: 24 24 28;
  --color-fg: 245 245 247;
}
```

---

### Pattern 2: Identity Sentence Editing

**What:** User navigates to settings, clicks "Edit Identity Sentence" → form opens → updates Firestore → AuthContext state updates → next completion toast reflects new sentence.

**When to use:** Whenever user-customizable identity content is stored and displayed.

**Firestore schema (already exists):**

```typescript
// users/{uid} document
{
  identitySentence: "I am strong",  // String, UTF-8, max 100 chars recommended
  theme: "light",                    // "light" | "dark"
  createdAt: Timestamp,
}
```

**Update function (already exists):**

```typescript
// lib/user-doc.ts
export async function updateIdentitySentence(
  uid: string,
  sentence: string
): Promise<void> {
  await updateDoc(doc(db, "users", uid), { identitySentence: sentence });
}
```

**Component pattern:**

```typescript
// components/IdentitySentenceForm.tsx (NEW)
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateIdentitySentence } from "@/lib/user-doc";
import { useToast } from "@/lib/toast-context";

export function IdentitySentenceForm() {
  const { user, identitySentence, setIdentitySentence } = useAuth();
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(identitySentence || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmed = input.trim();
    if (!trimmed) {
      addToast("Kimlik cümlesi boş olamaz", "error");
      return;
    }

    setSubmitting(true);
    try {
      await updateIdentitySentence(user.uid, trimmed);
      await setIdentitySentence(trimmed);
      addToast("✓ Kimlik cümlesi güncellendi", "success");
      setEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
      addToast("Güncelleme başarısız oldu", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!editing) {
    return (
      <div className="p-4 rounded-lg bg-surface">
        <p className="text-fg mb-2">Kimlik Cümlen:</p>
        <p className="text-lg font-semibold italic text-fg/80 mb-3">
          "{identitySentence || "Henüz ayarlanmamış"}"
        </p>
        <button
          onClick={() => setEditing(true)}
          className="px-4 py-2 bg-critical text-white rounded-lg hover:opacity-90"
        >
          Düzenle
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg bg-surface space-y-4">
      <label className="block">
        <span className="text-fg mb-2 block">Yeni Kimlik Cümlesi</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={100}
          placeholder="Örn: Güçlüyüm, Başarabilirim"
          className="w-full px-3 py-2 rounded-lg bg-bg text-fg border border-fg/20"
          disabled={submitting}
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2 bg-critical text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setInput(identitySentence || "");
          }}
          className="flex-1 px-4 py-2 bg-surface border border-fg/20 text-fg rounded-lg"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
```

---

### Pattern 3: Per-Habit Notification Scheduling

**What:** Each habit can have a `notificationTime` (e.g., "09:00"). When that time arrives, the app fires a local Notification. On iOS PWA, this only works if the app/browser is running (best-effort).

**Firestore schema (already exists):**

```typescript
// users/{uid}/habits/{habitId} document
{
  name: "Morning Run",
  notificationTime: "06:30" | null,  // HH:MM format or null if disabled
  // ... other fields
}
```

**Client-side scheduler (NEW):**

```typescript
// lib/notification-scheduler.ts
import type { Habit } from "./habit-types";

export interface ScheduledNotification {
  habitId: string;
  habitName: string;
  notificationTime: string; // HH:MM
  nextTrigger: Date; // when to fire
}

/**
 * Calculate when to trigger a notification.
 * If time has already passed today, target tomorrow.
 */
export function getNextNotificationTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  const nextTrigger = new Date(now);
  nextTrigger.setHours(hours, minutes, 0, 0);

  // If time already passed, move to tomorrow
  if (nextTrigger <= now) {
    nextTrigger.setDate(nextTrigger.getDate() + 1);
  }

  return nextTrigger;
}

/**
 * Check if any scheduled notifications are due.
 * Call this periodically or on app load.
 */
export function checkNotifications(habits: Habit[]): string[] {
  const now = new Date();
  const toFire: string[] = [];

  habits.forEach((habit) => {
    if (!habit.notificationTime) return;

    const nextTime = getNextNotificationTime(habit.notificationTime);
    const timeSinceNext = now.getTime() - nextTime.getTime();

    // Fire if we're within 1 minute of scheduled time (1-minute window)
    if (timeSinceNext >= 0 && timeSinceNext < 60000) {
      toFire.push(habit.id);
    }
  });

  return toFire;
}

/**
 * Fire a local notification for a habit.
 */
export async function fireNotification(
  habitId: string,
  habitName: string
): Promise<void> {
  if (!("Notification" in window)) {
    console.warn("Notifications not supported");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return;
  }

  new Notification(`${habitName}`, {
    body: "Bildirimi görmek için buraya dokunun",
    badge: "/icons/icon-192.png",
    tag: `habit-${habitId}`,
    requireInteraction: false,
    data: { habitId },
  });
}
```

**Request permissions (NEW):**

```typescript
// lib/notification-permissions.ts
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("Notifications not supported");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  // Request permission (shows browser dialog)
  const permission = await Notification.requestPermission();
  return permission === "granted";
}
```

**App integration (NEW):**

```typescript
// app/(app)/layout.tsx (MODIFIED)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useHabits } from "@/lib/use-habits";
import { requestNotificationPermission } from "@/lib/notification-permissions";
import { checkNotifications, fireNotification } from "@/lib/notification-scheduler";
import TabBar from "@/components/TabBar";
import FAB from "@/components/FAB";
import HabitFormSheet from "@/components/HabitFormSheet";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, hasOnboarded } = useAuth();
  const { habits } = useHabits(user?.uid || "");
  const router = useRouter();
  const [fabSheetOpen, setFabSheetOpen] = useState(false);

  // Request notification permission on first app load
  useEffect(() => {
    if (!user || !hasOnboarded) return;
    requestNotificationPermission().catch(console.error);
  }, [user, hasOnboarded]);

  // Check for due notifications on app load + every minute
  useEffect(() => {
    if (!user || !hasOnboarded || !habits.length) return;

    const check = async () => {
      const dueHabitIds = checkNotifications(habits);
      for (const habitId of dueHabitIds) {
        const habit = habits.find((h) => h.id === habitId);
        if (habit) {
          await fireNotification(habitId, habit.name);
        }
      }
    };

    check();
    const interval = setInterval(check, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, habits, hasOnboarded]);

  // ... rest of existing layout code
}
```

---

### Pattern 4: iOS PWA Limitations & Workarounds

**The Problem:**

iOS PWA (installed via "Add to Home Screen") does NOT support:
- ❌ Background sync (`sync` event in Service Worker never fires)
- ❌ Server push notifications (no Push API)
- ❌ Scheduled local notifications (Web Scheduled Notification API doesn't exist)
- ❌ Background timers (iOS pauses/kills background JS)

**The Workaround (best-effort):**

✅ **Client-side scheduling:** Notifications fire ONLY when:
1. App is open (foreground), OR
2. Browser tab is active (foreground)

✅ **How to implement:**

- Check scheduled habits when app loads (page transition, tab focus)
- Run periodic check every 60 seconds (polling) while app is open
- Fire local `Notification` API alert
- iOS will show notification in notification center even if app is backgrounded _during the notification call itself_, but future checks won't happen in background

✅ **Communication to users:**

Document in app: "Bildirimler, uygulama açık iken gönderilir. iOS PWA kısıtlaması nedeniyle arka planda bildirim gönderilemez."

---

### Pattern 5: Service Worker Message Passing (Optional Enhancement)

**Advanced:** If implementing real-time sync across tabs, send scheduled habits to SW via `postMessage()`:

```typescript
// app/(app)/layout.tsx (optional enhancement)
useEffect(() => {
  if (!navigator.serviceWorker) return;

  const controller = navigator.serviceWorker.controller;
  if (controller) {
    controller.postMessage({
      type: "UPDATE_SCHEDULED_HABITS",
      habits: habits.filter((h) => h.notificationTime),
    });
  }
}, [habits]);
```

Service Worker listener (generated by next-pwa, custom handler can be added):

```javascript
// public/sw.js (or custom service-worker.ts if using next-pwa custom config)
self.addEventListener("message", (event) => {
  if (event.data.type === "UPDATE_SCHEDULED_HABITS") {
    // Store habits for reference; polling happens from app side
    self.scheduledHabits = event.data.habits;
  }
});
```

**For this phase:** Start with client-side polling; SW message passing is optional optimization.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **Notification scheduling** | Custom cron-like engine, setTimeout trees, wake-lock logic | Client-side polling (60s interval) + Notification API | iOS PWA kills background timers; polling is reliable when app is open |
| **Theme persistence** | Redux theme state, context provider with complex logic | localStorage + React useState + CSS variables | Simple key-value, no need for state management overhead |
| **Identity sentence validation** | Custom form state machine | useState hook + simple string trim/length checks | ~3 form fields, validation is trivial |
| **Notification permissions** | Manual permission UI + retry logic | Single `Notification.requestPermission()` call | Standard API handles UI + retry |
| **Time picker UI** | Custom date/time picker library | Native `<input type="time">` | Works on iOS Safari PWA, no extra dependencies |

**Key insight:** Most "hard" problems in this phase are already solved by the platform (Notification API, localStorage, CSS variables). The challenge is architecture—knowing when to use client-side polling vs. persistent background sync (which iOS PWA doesn't support).

---

## Runtime State Inventory

> This section applies to rename/refactor/migration phases only. Not applicable to Phase 5 (greenfield features).

**Status:** N/A — Phase 5 adds new features, doesn't rename or migrate existing data.

---

## Common Pitfalls

### Pitfall 1: iOS PWA Push Notifications "Should Just Work"

**What goes wrong:** Developer implements Web Push API (`push` event) expecting it to work on iOS PWA. It doesn't; iOS PWA never fires `push` events. App waits forever for server-sent notifications.

**Why it happens:** Web Push requires service worker background execution + server APNS tokens. iOS doesn't expose either for PWA.

**How to avoid:**
- Test on actual iOS device in PWA mode (not browser)
- Verify `push` event fires on Android (control) vs. iOS PWA (fails)
- Document iOS limitation upfront
- Implement client-side polling as fallback

**Warning signs:**
- `push` event listeners in Service Worker never trigger on iOS
- Browser console shows no push subscription registered
- Server-sent push works on Android but not iOS

---

### Pitfall 2: setTimeout/setInterval Don't Persist After App Backgrounding

**What goes wrong:** Developer sets `setInterval` to check notifications every minute. User minimizes app. Checks stop. App is backgrounded for 30 minutes. User opens app. Notifications are 30 minutes late.

**Why it happens:** iOS (and Android) pause/kill background JavaScript. Timers don't fire.

**How to avoid:**
- Always run critical checks on app mount/tab focus
- Use `visibilitychange` event to detect foreground state
- Don't rely on background timers for iOS PWA

**Warning signs:**
- Notifications fire while app is open, but never while backgrounded
- Console logs don't appear after app is backgrounded

---

### Pitfall 3: Theme Flash on Page Load

**What goes wrong:** Page loads with system preference (light), then JavaScript runs, switches to user's stored theme (dark). Visual flash.

**Why it happens:** `getInitialTheme()` runs after HTML is rendered. CSS hasn't read the theme yet.

**How to avoid:**
- Use `ThemeScript` (already implemented) — inline script in `<head>` runs before render
- Script reads localStorage and adds `dark` class BEFORE page paints
- Subsequent React hydration just syncs state to already-correct DOM

**Warning signs:**
- Page flashes light, then dark on load
- Happens on refresh, not after navigation (because cache on navigation)

---

### Pitfall 4: Notification Permission Dialog Appears Unexpectedly

**What goes wrong:** Developer calls `Notification.requestPermission()` on every app load. User sees permission dialog every visit.

**Why it happens:** Developer doesn't check current permission state before requesting.

**How to avoid:**
- Check `Notification.permission` before calling `requestPermission()`
- Only request if permission is `"default"` (undecided)
- Request once on first app load, never again

```typescript
// ❌ BAD: requests every load
useEffect(() => {
  Notification.requestPermission();
}, []);

// ✅ GOOD: only request if undecided
useEffect(() => {
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}, []);
```

---

### Pitfall 5: Notification Time "09:00" Interpreted in Wrong Timezone

**What goes wrong:** Habit set to notify at "09:00". Device timezone is UTC+3. User expects notification at 09:00 local time. Notification fires at 09:00 UTC instead (6 hours off).

**Why it happens:** Developer assumes system timezone without explicit handling. String "09:00" is ambiguous.

**How to avoid:**
- Store time as string "HH:MM" (always local time, no timezone conversion)
- When calculating `nextTrigger`, use local device timezone (default `Date()` behavior)
- Document that times are always in device's local timezone

```typescript
// ✅ CORRECT: uses device's local timezone
const nextTrigger = new Date();
nextTrigger.setHours(9, 0, 0, 0); // 9:00 AM in device timezone

// ❌ WRONG: converts to UTC, loses device timezone
const nextTrigger = new Date("2026-04-09T09:00:00Z"); // Always UTC, wrong
```

---

## Code Examples

### Complete Settings Page Example

```typescript
// app/(app)/ayarlar/page.tsx (UPDATED)
"use client";

import { useState } from "react";
import { SignOutButton } from "@/components/SignOutButton";
import HabitList from "@/components/HabitList";
import HabitFormSheet from "@/components/HabitFormSheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IdentitySentenceForm } from "@/components/IdentitySentenceForm";
import type { Habit } from "@/lib/habit-types";

export default function AyarlarPage() {
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

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold text-fg dark:text-fg mb-6">Ayarlar</h1>

      {/* Appearance Settings */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-fg dark:text-fg mb-3">Görünüm</h2>
        <ThemeToggle />
      </section>

      {/* Identity Settings */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-fg dark:text-fg mb-3">Kimlik</h2>
        <IdentitySentenceForm />
      </section>

      {/* Habits Section (Habit Management) */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-fg dark:text-fg mb-3">Alışkanlıklar</h2>
        <HabitList onEditHabit={handleEditHabit} />
      </section>

      {/* Other Settings */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-fg dark:text-fg mb-3">Hesap</h2>
        <SignOutButton />
      </section>

      {/* Edit Sheet */}
      <HabitFormSheet
        open={editSheetOpen}
        habit={editingHabit || undefined}
        onClose={handleCloseEdit}
      />
    </main>
  );
}
```

### Notification Permission Request

```typescript
// components/NotificationPermissionBanner.tsx (NEW, optional)
"use client";

import { useState, useEffect } from "react";
import { requestNotificationPermission } from "@/lib/notification-permissions";

export function NotificationPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only show if permission is undecided (not granted, not denied)
    if ("Notification" in window && Notification.permission === "default") {
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) return null;

  return (
    <div className="bg-medium/20 border border-medium p-4 rounded-lg mb-4">
      <p className="text-sm text-fg mb-2">
        Alışkanlık bildirimlerini almak için izin verin
      </p>
      <button
        onClick={async () => {
          const granted = await requestNotificationPermission();
          if (granted) {
            setShowBanner(false);
          }
        }}
        className="px-4 py-2 bg-medium text-white rounded-lg text-sm"
      >
        İzin Ver
      </button>
    </div>
  );
}
```

---

## State of the Art

| Aspect | Current Approach | Notes |
|--------|------------------|-------|
| **Local theme persistence** | localStorage + CSS `dark` class | Standard PWA pattern; no changes needed |
| **Notification scheduling on web** | Client-side polling + Notification API | Only reliable approach for iOS PWA. Server Push requires service worker + APNS, unavailable on iOS. |
| **iOS PWA limitations** | Accept and document best-effort | Apple doesn't provide full web capabilities for PWA. This is platform-level, not app-level issue. |

**Deprecated/outdated:**
- ❌ Web Scheduled Notification API (proposed but never standardized; abandoned)
- ❌ Periodic Background Sync (not implemented in iOS Safari)
- ❌ Push notifications to PWA on iOS (requires native app)

---

## Open Questions

1. **Should notifications persist across app restarts?**
   - Current design: Checks run in-memory while app is open. After restart, app re-loads habits and checks again.
   - Alternative: Store last-fired notification in localStorage to avoid duplicate alerts.
   - Recommendation: For MVP, accept in-memory approach. If user restarts app at exact notification time, they might see duplicate. Rare edge case.

2. **Should identity sentence changes appear in-flight toasts?**
   - User edits identity sentence at 09:00. They complete a habit at 09:00. Does toast show old or new sentence?
   - Recommendation: AuthContext updates immediately after Firestore write. React re-renders. Toast shows new sentence. Expected behavior.

3. **What time format should be used for editing?**
   - Current: HabitForm uses `<input type="time">` which returns "09:00" (24-hour format).
   - Alternative: 12-hour AM/PM picker.
   - Recommendation: Keep 24-hour. Works on iOS. User can see it in habit list. Clear.

4. **Should there be a "test notification" button in settings?**
   - User clicks button → fires test notification immediately.
   - Useful for verifying permissions are granted + notifications work.
   - Recommendation: Out of scope for Phase 5 MVP. Can be Phase 6 QoL feature.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest (via Next.js) / Vitest (optional) |
| Config file | `jest.config.js` or `vitest.config.ts` (not yet detected; may be implicit Next.js default) |
| Quick run command | `npm run test -- --testPathPattern="(theme\|notification)" --watch` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SETTINGS-01 | Theme toggle persists to localStorage | unit | `npm run test -- theme.test.ts -x` | ❌ Wave 0 |
| SETTINGS-01 | Theme toggle updates document.documentElement.classList | unit | `npm run test -- theme.test.ts -x` | ❌ Wave 0 |
| SETTINGS-02 | Identity sentence form submits valid input | unit | `npm run test -- identity.test.ts -x` | ❌ Wave 0 |
| SETTINGS-02 | Identity sentence updates AuthContext state | unit | `npm run test -- auth-context.test.ts -x` | ❌ Wave 0 |
| NOTIF-01 | Habit with notificationTime persists to Firestore | unit | `npm run test -- habits-db.test.ts -x` | ❌ Wave 0 |
| NOTIF-02 | Notification fires when current time matches habit time | unit | `npm run test -- notification-scheduler.test.ts -x` | ❌ Wave 0 |
| NOTIF-02 | Notification permission is requested only once | unit | `npm run test -- notification-permissions.test.ts -x` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run lint && npm run typecheck`
- **Per wave merge:** `npm run test` (full suite)
- **Phase gate:** Full suite green + manual test on iOS PWA device

### Wave 0 Gaps

- [ ] `lib/__tests__/theme.test.ts` — Unit tests for `getInitialTheme()`, `applyTheme()`
- [ ] `lib/__tests__/notification-scheduler.test.ts` — Unit tests for `getNextNotificationTime()`, `checkNotifications()`
- [ ] `lib/__tests__/notification-permissions.test.ts` — Unit tests for `requestNotificationPermission()`
- [ ] `components/__tests__/ThemeToggle.test.tsx` — Component render + click behavior
- [ ] `components/__tests__/IdentitySentenceForm.test.tsx` — Component render + form submission
- [ ] Test setup: `jest.config.js` or implicit Next.js default
- [ ] Manual iOS PWA test: Install on iPhone, verify notifications appear when app is open, verify dark mode persists

---

## Sources

### Primary (HIGH confidence)

- **MDN Notification API** — https://developer.mozilla.org/en-US/docs/Web/API/Notification
  - API reference, permission model, browser support checked ✅
- **MDN Service Worker API** — https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
  - Background sync limitations on iOS verified ✅
- **Project codebase exploration** — `/lib/theme.ts`, `/lib/user-doc.ts`, `/lib/habit-types.ts`
  - Theme system verified as working ✅
  - Identity sentence Firestore schema verified ✅
  - Notification time field in Habit type verified ✅

### Secondary (MEDIUM confidence)

- **CanIUse notifications support** — https://caniuse.com/
  - iOS PWA notification support: NOT supported via Web Push API ✅
- **WebKit status** — https://webkit.org/standards-positions/
  - Scheduled Notification API not on WebKit roadmap ✅

### Tertiary (LOW confidence)

- None—all critical claims verified against official sources or project code

---

## Metadata

**Confidence breakdown:**
- **Standard stack**: HIGH — All libraries already in project; no new dependencies needed
- **Architecture**: HIGH — Built on verified existing code (theme.ts, user-doc.ts, HabitForm.tsx patterns)
- **Pitfalls**: HIGH — iOS PWA limitations verified against MDN + project constraints in CLAUDE.md
- **Notification scheduling**: MEDIUM → HIGH after manual iOS PWA testing (polling approach is sound; test required)

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (30 days—stable domain, no major API changes expected)

---

## Next Steps (For Planner)

1. **Plan UI components**: Theme toggle, identity sentence form, notification time picker (extends existing HabitForm)
2. **Plan util modules**: `notification-scheduler.ts`, `notification-permissions.ts`
3. **Plan app integration**: Update `/app/(app)/layout.tsx` with notification checking + permission request
4. **Plan settings page layout**: Reorganize `/app/(app)/ayarlar/page.tsx` with new sections
5. **Plan test coverage**: Theme, identity, scheduler, permissions (Wave 0 gaps)
6. **Plan iOS PWA testing**: Manual verification on iPhone before Phase 5 gate
7. **Plan documentation**: Add inline comments about iOS best-effort limitations

---
