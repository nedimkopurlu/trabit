---
phase: 01-foundation
plan: 02
type: execute
wave: 2
depends_on: [01-foundation/01]
files_modified:
  - lib/firebase.ts
  - lib/auth-context.tsx
  - lib/user-doc.ts
  - app/layout.tsx
  - app/login/page.tsx
  - app/onboarding/page.tsx
  - app/(app)/layout.tsx
  - app/(app)/ayarlar/page.tsx
  - components/SignOutButton.tsx
  - .env.local.example
  - firestore.rules
autonomous: false
requirements: [AUTH-01, AUTH-02, AUTH-04, AUTH-05]
user_setup:
  - service: firebase
    why: "Google Auth + Firestore persistence"
    env_vars:
      - name: NEXT_PUBLIC_FIREBASE_API_KEY
        source: "Firebase Console → Project Settings → General → Your apps → Web → SDK config"
      - name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        source: "same"
      - name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
        source: "same"
      - name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        source: "same"
      - name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
        source: "same"
      - name: NEXT_PUBLIC_FIREBASE_APP_ID
        source: "same"
    dashboard_config:
      - task: "Enable Google sign-in provider"
        location: "Firebase Console → Authentication → Sign-in method → Google → Enable"
      - task: "Create Firestore database (production mode)"
        location: "Firebase Console → Firestore Database → Create database"
      - task: "Add localhost and Vercel domain to Authorized domains"
        location: "Firebase Console → Authentication → Settings → Authorized domains"
must_haves:
  truths:
    - "User can click Google sign-in button and complete OAuth via redirect"
    - "First-time user is sent to /onboarding to enter identity sentence; saved to Firestore users/{uid}"
    - "Returning user with identitySentence skips /onboarding and lands on /bugun"
    - "Page refresh preserves session (no re-login)"
    - "Sign out button on /ayarlar returns user to /login"
  artifacts:
    - path: "lib/firebase.ts"
      provides: "Firebase app, auth, db singletons"
      contains: "initializeApp"
    - path: "lib/auth-context.tsx"
      provides: "AuthProvider + useAuth() hook"
      contains: "createContext"
    - path: "lib/user-doc.ts"
      provides: "getUserDoc, createUserDoc, updateIdentitySentence"
      contains: "users"
    - path: "firestore.rules"
      provides: "Per-uid access rules"
      contains: "request.auth.uid"
  key_links:
    - from: "lib/auth-context.tsx"
      to: "lib/firebase.ts"
      via: "import auth"
      pattern: "from \"@/lib/firebase\""
    - from: "app/(app)/layout.tsx"
      to: "lib/auth-context.tsx"
      via: "useAuth() guard"
      pattern: "useAuth"
    - from: "app/onboarding/page.tsx"
      to: "lib/user-doc.ts"
      via: "updateIdentitySentence call"
      pattern: "updateIdentitySentence|setDoc.*users"
---

<objective>
Wire Firebase Authentication (Google provider, redirect flow for iOS PWA compatibility), browser-local persistence, Firestore user document, and the first-login identity sentence onboarding flow. Plus auth route guard and sign-out.

Purpose: Phase 1 success criteria #1, #2, #3, #4 — full auth lifecycle. Every later phase depends on `useAuth()` and `users/{uid}` document existing.
Output: Working Google sign-in, persistent session, /onboarding gating, /bugun protected, sign-out from /ayarlar.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundation/1-CONTEXT.md
@app/layout.tsx
@app/(app)/layout.tsx
@app/login/page.tsx
@app/onboarding/page.tsx

<interfaces>
<!-- This plan creates the AuthContext that all subsequent phases consume. -->
<!-- Contracts defined here MUST NOT change in later phases without migration. -->

```typescript
// lib/firebase.ts
export const app: FirebaseApp;
export const auth: Auth;
export const db: Firestore;

// lib/auth-context.tsx
export interface AuthState {
  user: User | null;          // Firebase User
  loading: boolean;            // initial auth check pending
  identitySentence: string | null;
  hasOnboarded: boolean;       // true if users/{uid} doc exists with identitySentence
}
export function AuthProvider(props: { children: React.ReactNode }): JSX.Element;
export function useAuth(): AuthState & {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setIdentitySentence: (s: string) => Promise<void>;
};

// lib/user-doc.ts
export interface UserDoc {
  identitySentence: string;
  createdAt: Timestamp;
  theme: "light" | "dark";
}
export async function getUserDoc(uid: string): Promise<UserDoc | null>;
export async function createUserDoc(uid: string, identitySentence: string): Promise<void>;
export async function updateIdentitySentence(uid: string, sentence: string): Promise<void>;
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Firebase singleton + Auth context + user document module</name>
  <files>lib/firebase.ts, lib/auth-context.tsx, lib/user-doc.ts, .env.local.example, firestore.rules</files>
  <read_first>
    - /Users/nedimkopurlu/Downloads/adsız klasör/.planning/phases/01-foundation/1-CONTEXT.md (D-01, D-02, D-04, D-05, D-17)
    - /Users/nedimkopurlu/Downloads/adsız klasör/.env.local.example (created in Plan 01)
  </read_first>
  <action>
    1. `lib/firebase.ts` — Initialize Firebase app once (guard against HMR re-init):
       ```ts
       import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
       import { getAuth, browserLocalPersistence, setPersistence, GoogleAuthProvider, type Auth } from "firebase/auth";
       import { getFirestore, type Firestore } from "firebase/firestore";

       const firebaseConfig = {
         apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
         authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
         projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
         storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
         messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
         appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
       };
       export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
       export const auth: Auth = getAuth(app);
       export const db: Firestore = getFirestore(app);
       export const googleProvider = new GoogleAuthProvider();
       if (typeof window !== "undefined") {
         setPersistence(auth, browserLocalPersistence).catch(console.error); // D-04
       }
       ```

    2. `lib/user-doc.ts` — Per D-17 schema:
       ```ts
       import { doc, getDoc, setDoc, updateDoc, serverTimestamp, type Timestamp } from "firebase/firestore";
       import { db } from "./firebase";
       export interface UserDoc { identitySentence: string; createdAt: Timestamp; theme: "light" | "dark"; }
       export async function getUserDoc(uid: string): Promise<UserDoc | null> {
         const snap = await getDoc(doc(db, "users", uid));
         return snap.exists() ? (snap.data() as UserDoc) : null;
       }
       export async function createUserDoc(uid: string, identitySentence: string): Promise<void> {
         await setDoc(doc(db, "users", uid), { identitySentence, createdAt: serverTimestamp(), theme: "light" });
       }
       export async function updateIdentitySentence(uid: string, sentence: string): Promise<void> {
         await updateDoc(doc(db, "users", uid), { identitySentence: sentence });
       }
       ```

    3. `lib/auth-context.tsx` — `"use client"` React Context implementing the AuthState interface above.
       - On mount: subscribe via `onAuthStateChanged(auth, ...)`. When user appears, call `getUserDoc(user.uid)` and set `identitySentence` + `hasOnboarded`. Set `loading: false`.
       - Also call `getRedirectResult(auth)` on mount to complete iOS redirect sign-in (D-01).
       - `signInWithGoogle()`: Detect iOS Safari OR PWA standalone display mode → use `signInWithRedirect(auth, googleProvider)`. Otherwise `signInWithPopup(auth, googleProvider)`. iOS detection: `/iPad|iPhone|iPod/.test(navigator.userAgent) || window.matchMedia('(display-mode: standalone)').matches`.
       - `signOut()`: call `firebaseSignOut(auth)` then `router.push("/login")` (use `useRouter` from `next/navigation`).
       - `setIdentitySentence(s)`: if no user doc exists, `createUserDoc(user.uid, s)`; else `updateIdentitySentence(user.uid, s)`. Update local state.

    4. `firestore.rules` — Deny all except own user doc:
       ```
       rules_version = '2';
       service cloud.firestore {
         match /databases/{database}/documents {
           match /users/{uid} {
             allow read, write: if request.auth != null && request.auth.uid == uid;
           }
           match /{document=**} { allow read, write: if false; }
         }
       }
       ```

    5. Update `.env.local.example` to include all six `NEXT_PUBLIC_FIREBASE_*` keys with empty values and a comment pointing to Firebase Console.
  </action>
  <verify>
    <automated>cd "/Users/nedimkopurlu/Downloads/adsız klasör" && npm run typecheck</automated>
  </verify>
  <acceptance_criteria>
    - `lib/firebase.ts` contains `browserLocalPersistence` and `getApps().length ? getApp() : initializeApp`
    - `lib/auth-context.tsx` contains `onAuthStateChanged`, `signInWithRedirect`, `getRedirectResult`, `signInWithPopup`
    - `lib/auth-context.tsx` exports `AuthProvider` and `useAuth` (grep both)
    - `lib/user-doc.ts` exports `getUserDoc`, `createUserDoc`, `updateIdentitySentence` (grep all three)
    - `firestore.rules` contains `request.auth.uid == uid`
    - `.env.local.example` contains all 6 keys: API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID
    - `tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>Firebase singleton initializes, AuthContext implements full interface contract, Firestore rules deny non-owner access.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Wire AuthProvider, route guard, login/onboarding/signout UI</name>
  <files>app/layout.tsx, app/(app)/layout.tsx, app/login/page.tsx, app/onboarding/page.tsx, app/(app)/ayarlar/page.tsx, components/SignOutButton.tsx</files>
  <read_first>
    - /Users/nedimkopurlu/Downloads/adsız klasör/app/layout.tsx (current state from Plan 01)
    - /Users/nedimkopurlu/Downloads/adsız klasör/app/(app)/layout.tsx (current state from Plan 01)
    - /Users/nedimkopurlu/Downloads/adsız klasör/app/login/page.tsx (stub from Plan 01)
    - /Users/nedimkopurlu/Downloads/adsız klasör/app/onboarding/page.tsx (stub from Plan 01)
    - /Users/nedimkopurlu/Downloads/adsız klasör/lib/auth-context.tsx (created in Task 1)
    - /Users/nedimkopurlu/Downloads/adsız klasör/.planning/phases/01-foundation/1-CONTEXT.md (D-02, D-03, D-12)
  </read_first>
  <action>
    1. `app/layout.tsx` — Wrap `{children}` in `<AuthProvider>` (imported from `@/lib/auth-context`). Keep `<ThemeScript />` from Plan 01. Mark file with `"use client"` is NOT needed — keep server component, AuthProvider is the client boundary.

    2. `app/(app)/layout.tsx` — Convert to client component (keep `"use client"`). Add route guard using `useAuth()`:
       ```tsx
       const { user, loading, hasOnboarded } = useAuth();
       const router = useRouter();
       useEffect(() => {
         if (loading) return;
         if (!user) router.replace("/login");
         else if (!hasOnboarded) router.replace("/onboarding"); // D-12
       }, [user, loading, hasOnboarded, router]);
       if (loading || !user || !hasOnboarded) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
       ```
       Then render the existing `<div className="mx-auto max-w-md ..."><TabBar />{children}</div>`.

    3. `app/login/page.tsx` — Convert to `"use client"`. Use `useAuth()`. On mount, if `user && hasOnboarded`, `router.replace("/bugun")`; if `user && !hasOnboarded`, `router.replace("/onboarding")`. Button onClick calls `signInWithGoogle()`. Show error state if sign-in throws. Layout: full-screen, centered, max-w-md, brand "Trabit" + tagline + Google button styled with Google logo SVG inline.

    4. `app/onboarding/page.tsx` — `"use client"`. Use `useAuth()`. Guard: if no user → redirect `/login`; if `hasOnboarded` → redirect `/bugun` (per D-03 — once saved, never shown again). Form with controlled `<input>` (state via useState) and submit button. On submit: validate non-empty, trim, call `setIdentitySentence(value)`, then `router.replace("/bugun")`. Show loading state during save. No tab bar (this is outside `(app)` group per D-03).

    5. `components/SignOutButton.tsx` — `"use client"` component:
       ```tsx
       "use client";
       import { useAuth } from "@/lib/auth-context";
       export function SignOutButton() {
         const { signOut } = useAuth();
         return <button onClick={() => signOut()} className="rounded-lg border border-surface px-4 py-2 text-critical">Çıkış Yap</button>;
       }
       ```

    6. `app/(app)/ayarlar/page.tsx` — Update Plan 01's stub to render the SignOutButton:
       ```tsx
       import { SignOutButton } from "@/components/SignOutButton";
       export default function AyarlarPage() {
         return (
           <main className="p-4">
             <h1 className="text-2xl font-semibold mb-6">Ayarlar</h1>
             <SignOutButton />
           </main>
         );
       }
       ```
       (Theme toggle and identity sentence editing land in Phase 5 — leave room.)
  </action>
  <verify>
    <automated>cd "/Users/nedimkopurlu/Downloads/adsız klasör" && npm run typecheck && npx next build 2>&1 | tail -30</automated>
  </verify>
  <acceptance_criteria>
    - `app/layout.tsx` contains `<AuthProvider>` and imports from `@/lib/auth-context`
    - `app/(app)/layout.tsx` contains `useAuth()` and `router.replace("/login")` AND `router.replace("/onboarding")`
    - `app/login/page.tsx` contains `signInWithGoogle` call (grep)
    - `app/onboarding/page.tsx` contains `setIdentitySentence` call (grep)
    - `app/onboarding/page.tsx` contains `router.replace("/bugun")`
    - `components/SignOutButton.tsx` calls `signOut` from `useAuth`
    - `app/(app)/ayarlar/page.tsx` imports `SignOutButton`
    - `next build` exits 0
  </acceptance_criteria>
  <done>All auth flows wired. Build green. Ready for human verification.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Human verification — full auth lifecycle</name>
  <what-built>
    Google Sign-In, Firebase persistence, identity sentence onboarding, route guard, sign-out — fully wired against real Firebase project.
  </what-built>
  <how-to-verify>
    Prerequisites (one-time):
    1. Create Firebase project at https://console.firebase.google.com
    2. Enable Google sign-in: Authentication → Sign-in method → Google → Enable
    3. Create Firestore database (production mode, region close to you)
    4. Copy Web SDK config into `.env.local` (use `.env.local.example` as template)
    5. Deploy `firestore.rules`: install firebase-tools (`npm i -g firebase-tools`), `firebase login`, `firebase init firestore` (choose existing project, accept default rules file path), then `firebase deploy --only firestore:rules`

    Test steps:
    1. `npm run dev`, open http://localhost:3000 — should redirect/show /login
    2. Click "Google ile Giriş Yap" — Google account picker should appear (popup on desktop, redirect on mobile)
    3. Pick account → should land on /onboarding (first time)
    4. Type identity sentence "Ben her gün öğrenen biriyim" → click Devam
    5. Should land on /bugun with tab bar visible
    6. Refresh the page (Cmd+R) → should stay on /bugun (no re-login) — proves AUTH-04 persistence
    7. Navigate to /ayarlar → click "Çıkış Yap" → should land on /login
    8. Sign in again → should skip /onboarding and go straight to /bugun (proves identity sentence persisted in Firestore)
    9. Open Firebase Console → Firestore → confirm `users/{your-uid}` document exists with `identitySentence` field
    10. Mobile test (iOS Safari, optional but recommended): same flow on real iPhone — should use redirect not popup
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- Sign-in completes on desktop and (ideally) iOS Safari
- Identity sentence saved exactly once on first login
- Page refresh preserves session
- Sign-out returns to /login
- Firestore `users/{uid}` doc visible in Firebase Console
</verification>

<success_criteria>
AUTH-01 (Google sign-in), AUTH-02 (identity sentence stored), AUTH-04 (persistence), AUTH-05 (sign-out) all satisfied. AUTH-03 (PWA install banner) handled in Plan 03.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/1-02-SUMMARY.md`
</output>
