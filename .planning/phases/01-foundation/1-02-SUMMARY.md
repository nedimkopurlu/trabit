---
phase: 01-foundation
plan: 02
subsystem: auth
tags: [firebase, google-auth, firestore, auth-context, pwa, onboarding]
dependency_graph:
  requires: [01-foundation/01]
  provides: [lib/firebase.ts, lib/auth-context.tsx, lib/user-doc.ts, firestore.rules]
  affects: [all-subsequent-phases]
tech_stack:
  added: [firebase/auth, firebase/firestore, browserLocalPersistence, GoogleAuthProvider]
  patterns: [React Context, onAuthStateChanged, redirect-vs-popup iOS detection]
key_files:
  created:
    - lib/firebase.ts
    - lib/auth-context.tsx
    - lib/user-doc.ts
    - firestore.rules
    - components/SignOutButton.tsx
  modified:
    - app/layout.tsx
    - app/(app)/layout.tsx
    - app/login/page.tsx
    - app/onboarding/page.tsx
    - app/(app)/ayarlar/page.tsx
    - .env.local.example
decisions:
  - Firebase app initialized once with HMR guard (getApps().length check); placeholder env defaults prevent SSR build errors
  - iOS/PWA detection uses navigator.userAgent + display-mode media query to pick redirect vs popup sign-in
  - browserLocalPersistence set client-side only (typeof window guard)
  - AuthProvider wraps children in root layout as client boundary; layout stays server component
  - Route guard in (app)/layout.tsx uses useEffect + router.replace to redirect unauthenticated users
metrics:
  duration: ~8 minutes
  completed: "2026-04-08"
  tasks_completed: 2
  files_created: 5
  files_modified: 6
---

# Phase 1 Plan 2: Firebase Auth + Identity Onboarding Summary

**One-liner:** JWT-free Google Auth with Firebase SDK, browserLocalPersistence, iOS redirect flow, and Firestore user doc with identity sentence onboarding gating.

## What Was Built

Full authentication lifecycle for Trabit PWA:
- Firebase app singleton with HMR guard and graceful SSR fallbacks
- AuthContext providing `useAuth()` hook with `signInWithGoogle`, `signOut`, `setIdentitySentence`
- Firestore `users/{uid}` CRUD module with typed `UserDoc` interface
- Per-uid Firestore security rules (deny all except own document)
- Route guard in `(app)/layout.tsx` redirecting unauthenticated or un-onboarded users
- Login page with Google button and Google logo SVG, iOS redirect detection
- Onboarding page with controlled input, validation, save to Firestore
- `SignOutButton` component wired to `/ayarlar`
- All 6 Firebase env vars documented in `.env.local.example`

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Firebase singleton + AuthContext + user-doc | `3a9c1fb` | lib/firebase.ts, lib/auth-context.tsx, lib/user-doc.ts, firestore.rules |
| 2 | Wire AuthProvider, route guard, UI | `585542b` | app/layout.tsx, app/(app)/layout.tsx, app/login/page.tsx, app/onboarding/page.tsx, components/SignOutButton.tsx |

## Task 3: Checkpoint (Human Verification)

**Status:** APPROVED — Human verified the full auth lifecycle against real Firebase project on 2026-04-08.

**Verification steps completed:**
1. Create Firebase project and configure Google sign-in provider
2. Copy SDK config into `.env.local`
3. Deploy `firestore.rules` via `firebase deploy --only firestore:rules`
4. `npm run dev` → verify redirect to /login → Google sign-in → /onboarding → /bugun
5. Refresh page → stays on /bugun (persistence proof)
6. /ayarlar → sign out → /login
7. Sign in again → skips /onboarding (returns to /bugun)
8. Firestore Console confirms `users/{uid}` doc with `identitySentence`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Firebase SSR build failure with missing env vars**
- **Found during:** Task 2 build verification
- **Issue:** Firebase `getAuth()` throws `auth/invalid-api-key` during static prerendering when env vars are empty strings
- **Fix:** Changed env var access to use `?? "placeholder"` defaults so Firebase initializes with dummy values during SSR/build; real values are always present at runtime via `.env.local`
- **Files modified:** lib/firebase.ts
- **Commit:** `585542b`

## Known Stubs

None. All auth flows are fully wired with real Firebase SDK. Verification requires real Firebase project credentials.

## Requirements Satisfied

- AUTH-01: Google sign-in button wired to `signInWithGoogle()` (popup/redirect)
- AUTH-02: Identity sentence collected at `/onboarding`, saved to Firestore `users/{uid}`
- AUTH-04: `browserLocalPersistence` set, session survives page refresh
- AUTH-05: `SignOutButton` on `/ayarlar` calls `signOut()` → redirects to `/login`

AUTH-03 (PWA install banner) is handled in Plan 03.
