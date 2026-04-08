---
phase: 01-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - tsconfig.json
  - next.config.js
  - tailwind.config.ts
  - postcss.config.js
  - app/layout.tsx
  - app/page.tsx
  - app/globals.css
  - app/(app)/layout.tsx
  - app/(app)/bugun/page.tsx
  - app/(app)/seri/page.tsx
  - app/(app)/ayarlar/page.tsx
  - app/login/page.tsx
  - app/onboarding/page.tsx
  - components/TabBar.tsx
  - components/ThemeScript.tsx
  - lib/theme.ts
  - .gitignore
  - .env.local.example
autonomous: true
requirements: [AUTH-01, AUTH-02]
must_haves:
  truths:
    - "Next.js 14 dev server starts without errors on localhost:3000"
    - "Tailwind classes render correctly on all routes"
    - "Dark mode toggles via `dark` class on <html>, persisted in localStorage"
    - "Bottom tab bar visible on mobile, three tabs route to /bugun /seri /ayarlar"
    - "Mobile-first layout: content centered max-w-md on desktop"
  artifacts:
    - path: "package.json"
      provides: "Next.js 14 + Tailwind + Framer Motion deps"
      contains: "next"
    - path: "tailwind.config.ts"
      provides: "darkMode class strategy + color CSS vars"
      contains: "darkMode: \"class\""
    - path: "app/layout.tsx"
      provides: "Root layout with ThemeScript + html lang"
    - path: "app/(app)/layout.tsx"
      provides: "App shell with TabBar"
    - path: "components/TabBar.tsx"
      provides: "Bottom nav mobile / sidebar desktop"
  key_links:
    - from: "app/layout.tsx"
      to: "components/ThemeScript.tsx"
      via: "inline script before hydration"
      pattern: "ThemeScript"
    - from: "app/(app)/layout.tsx"
      to: "components/TabBar.tsx"
      via: "import + render"
      pattern: "import.*TabBar"
---

<objective>
Scaffold the Next.js 14 App Router project with Tailwind CSS (dark mode class strategy), Framer Motion, and the 3-tab application shell (Bugün / Seri / Ayarlar). Establish mobile-first responsive baseline with iPhone PWA framing (max-w-md centered on desktop). No auth or Firebase yet — pure UI shell.

Purpose: Every subsequent plan and phase depends on this scaffold. Tailwind dark mode and the routing structure must be wired from day one so we never retrofit.
Output: Working Next.js dev server with three navigable tab routes, dark mode toggle infrastructure, and login/onboarding route placeholders.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation/1-CONTEXT.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold Next.js 14 + Tailwind + dependencies</name>
  <files>package.json, tsconfig.json, next.config.js, tailwind.config.ts, postcss.config.js, app/globals.css, .gitignore, .env.local.example</files>
  <read_first>
    - /Users/nedimkopurlu/Downloads/adsız klasör/.planning/phases/01-foundation/1-CONTEXT.md (D-06, D-10, D-14, D-15, D-19, D-20)
    - /Users/nedimkopurlu/Downloads/adsız klasör/CLAUDE.md
  </read_first>
  <action>
    Initialize a Next.js 14 App Router project at the repo root (do NOT use `npx create-next-app` interactively — create files manually to avoid prompts and to keep the working directory clean).

    1. Create `package.json` with these EXACT dependencies (use latest stable matching majors):
       ```json
       {
         "name": "trabit",
         "version": "0.1.0",
         "private": true,
         "scripts": {
           "dev": "next dev",
           "build": "next build",
           "start": "next start",
           "lint": "next lint",
           "typecheck": "tsc --noEmit"
         },
         "dependencies": {
           "next": "^14.2.0",
           "react": "^18.3.0",
           "react-dom": "^18.3.0",
           "firebase": "^10.12.0",
           "framer-motion": "^11.0.0",
           "@ducanh2912/next-pwa": "^10.2.0"
         },
         "devDependencies": {
           "typescript": "^5.4.0",
           "@types/node": "^20.12.0",
           "@types/react": "^18.3.0",
           "@types/react-dom": "^18.3.0",
           "tailwindcss": "^3.4.0",
           "postcss": "^8.4.0",
           "autoprefixer": "^10.4.0",
           "eslint": "^8.57.0",
           "eslint-config-next": "^14.2.0"
         }
       }
       ```
    2. Run `npm install` to generate `package-lock.json` and `node_modules`.
    3. Create `tsconfig.json` with Next.js 14 App Router defaults: `"target": "es2020"`, `"strict": true`, `"jsx": "preserve"`, `"moduleResolution": "bundler"`, `"plugins": [{"name": "next"}]`, `"paths": { "@/*": ["./*"] }`, include `["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]`.
    4. Create `next.config.js` as plain CommonJS:
       ```js
       /** @type {import('next').NextConfig} */
       const nextConfig = { reactStrictMode: true };
       module.exports = nextConfig;
       ```
       (next-pwa wrapper is added in Plan 03 — leave clean here.)
    5. Create `postcss.config.js`: `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };`
    6. Create `tailwind.config.ts` with `darkMode: "class"` (per D-14), content globs `["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"]`, and theme.extend.colors using CSS variables:
       ```ts
       import type { Config } from "tailwindcss";
       const config: Config = {
         darkMode: "class",
         content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
         theme: {
           extend: {
             colors: {
               critical: "rgb(var(--color-critical) / <alpha-value>)",
               medium: "rgb(var(--color-medium) / <alpha-value>)",
               low: "rgb(var(--color-low) / <alpha-value>)",
               bg: "rgb(var(--color-bg) / <alpha-value>)",
               surface: "rgb(var(--color-surface) / <alpha-value>)",
               fg: "rgb(var(--color-fg) / <alpha-value>)",
             },
           },
         },
         plugins: [],
       };
       export default config;
       ```
    7. Create `app/globals.css` with Tailwind directives and CSS variables for both light and dark per D-15:
       ```css
       @tailwind base;
       @tailwind components;
       @tailwind utilities;

       :root {
         --color-bg: 255 255 255;
         --color-surface: 245 245 247;
         --color-fg: 17 17 17;
         --color-critical: 239 68 68;
         --color-medium: 234 179 8;
         --color-low: 34 197 94;
       }
       .dark {
         --color-bg: 10 10 12;
         --color-surface: 24 24 28;
         --color-fg: 245 245 247;
         --color-critical: 248 113 113;
         --color-medium: 250 204 21;
         --color-low: 74 222 128;
       }
       html, body { background: rgb(var(--color-bg)); color: rgb(var(--color-fg)); }
       ```
    8. Create `.gitignore` with: `node_modules`, `.next`, `out`, `.env*.local`, `.DS_Store`, `next-env.d.ts`, `public/sw.js`, `public/workbox-*.js`.
    9. Create `.env.local.example` with placeholder Firebase keys (NEXT_PUBLIC_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID) — Plan 02 will consume these.
  </action>
  <verify>
    <automated>cd "/Users/nedimkopurlu/Downloads/adsız klasör" && npm run typecheck && npx next build 2>&1 | tail -20</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` contains `"next": "^14.2.0"` (grep)
    - `tailwind.config.ts` contains literal string `darkMode: "class"`
    - `app/globals.css` contains `@tailwind base;` and `.dark {`
    - `tsconfig.json` contains `"strict": true`
    - `next.config.js` exports `reactStrictMode: true`
    - `npm install` exits 0 and `node_modules/next/package.json` exists
    - `.gitignore` contains `node_modules` and `.next`
  </acceptance_criteria>
  <done>npm install completes, typecheck passes, no Tailwind/Next config errors.</done>
</task>

<task type="auto">
  <name>Task 2: Build app shell — root layout, theme bootstrap, three-tab routes, login/onboarding stubs</name>
  <files>app/layout.tsx, app/page.tsx, app/(app)/layout.tsx, app/(app)/bugun/page.tsx, app/(app)/seri/page.tsx, app/(app)/ayarlar/page.tsx, app/login/page.tsx, app/onboarding/page.tsx, components/TabBar.tsx, components/ThemeScript.tsx, lib/theme.ts</files>
  <read_first>
    - /Users/nedimkopurlu/Downloads/adsız klasör/.planning/phases/01-foundation/1-CONTEXT.md (D-10, D-11, D-13, D-14, D-16, D-19, D-20)
    - /Users/nedimkopurlu/Downloads/adsız klasör/app/globals.css (created in Task 1)
    - /Users/nedimkopurlu/Downloads/adsız klasör/tailwind.config.ts (created in Task 1)
  </read_first>
  <action>
    Build the App Router shell with routes and a mobile-first tab bar. NO auth logic yet — login and onboarding pages are visual stubs. NO Firebase imports.

    1. `lib/theme.ts` — exports `getInitialTheme()` (reads `localStorage.theme` then `prefers-color-scheme`, returns `"light"|"dark"`) and `applyTheme(theme)` (toggles `.dark` on `document.documentElement`, writes localStorage). Per D-14, D-16.

    2. `components/ThemeScript.tsx` — Server component that returns a `<script dangerouslySetInnerHTML>` block executing BEFORE hydration:
       ```js
       (function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();
       ```
       Prevents flash per D-16.

    3. `app/layout.tsx` — Root layout. Imports `./globals.css`, renders `<html lang="tr" suppressHydrationWarning>`, `<head>` includes `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />` and `<ThemeScript />`. `<body className="min-h-screen bg-bg text-fg antialiased">{children}</body>`. Export metadata `{ title: "Trabit", description: "Alışkanlık takip PWA" }`.

    4. `app/page.tsx` — Server component that renders a simple redirect placeholder: `<meta httpEquiv="refresh" content="0;url=/bugun" />` and a `<a href="/bugun">Bugün</a>` link. (Actual auth-aware redirect comes in Plan 02.)

    5. `app/(app)/layout.tsx` — Client component (`"use client"`). Wraps children with mobile-first container: `<div className="mx-auto max-w-md min-h-screen pb-20 md:pb-0 md:pl-56">{children}<TabBar /></div>` (per D-20). Renders `<TabBar />`.

    6. `components/TabBar.tsx` — Client component using `usePathname` from `next/navigation` and `framer-motion` for the active indicator. Three tabs with hrefs `/bugun`, `/seri`, `/ayarlar` and labels `Bugün`, `Seri`, `Ayarlar`. Mobile (default): `fixed bottom-0 left-0 right-0 h-16 border-t border-surface bg-bg flex justify-around items-center md:hidden`. Desktop (`md:` and up): `hidden md:fixed md:top-0 md:left-0 md:bottom-0 md:w-56 md:flex md:flex-col md:border-r md:border-surface md:p-4`. Active tab gets `text-critical` (brand color); use `motion.div` with `layoutId="tab-active"` and a `spring` transition for the active indicator (per D-13).

    7. `app/(app)/bugun/page.tsx`, `app/(app)/seri/page.tsx`, `app/(app)/ayarlar/page.tsx` — Each is a server component returning `<main className="p-4"><h1 className="text-2xl font-semibold">{Tab Title}</h1><p className="text-sm opacity-70">Phase 1 stub</p></main>`. Titles: "Bugün", "Seri", "Ayarlar" respectively.

    8. `app/login/page.tsx` — Stub: `<main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto"><h1 className="text-3xl font-bold mb-2">Trabit</h1><p className="opacity-70 mb-8">Alışkanlıklarını takip et.</p><button className="rounded-lg bg-fg text-bg px-6 py-3">Google ile Giriş Yap (stub)</button></main>`. No auth wiring — Plan 02.

    9. `app/onboarding/page.tsx` — Stub: identity sentence form skeleton. `<main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto"><h1 className="text-2xl font-bold mb-4">Kimlik cümlen nedir?</h1><input className="w-full rounded-lg border border-surface bg-surface px-4 py-3 mb-4" placeholder="Ben her gün öğrenen biriyim..." /><button className="w-full rounded-lg bg-fg text-bg px-6 py-3">Devam (stub)</button></main>`. No save logic — Plan 02 wires to Firestore.
  </action>
  <verify>
    <automated>cd "/Users/nedimkopurlu/Downloads/adsız klasör" && npm run typecheck && npx next build 2>&1 | tail -30</automated>
  </verify>
  <acceptance_criteria>
    - `app/layout.tsx` imports `./globals.css` and renders `<ThemeScript />` (grep `ThemeScript`)
    - `components/TabBar.tsx` contains all three hrefs: `/bugun`, `/seri`, `/ayarlar`
    - `components/TabBar.tsx` imports from `framer-motion` (grep `from "framer-motion"`)
    - `app/(app)/layout.tsx` contains `max-w-md` and `<TabBar`
    - `components/ThemeScript.tsx` contains literal `prefers-color-scheme: dark`
    - `lib/theme.ts` exports `getInitialTheme` and `applyTheme` (grep `export function getInitialTheme` and `export function applyTheme`)
    - `next build` exits 0 and reports the routes `/bugun`, `/seri`, `/ayarlar`, `/login`, `/onboarding` in its output
    - `tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>All five routes build successfully. Tab bar renders on /bugun, /seri, /ayarlar. Dark mode CSS variables resolve.</done>
</task>

</tasks>

<verification>
- `npm run dev` starts without errors
- Visiting `/bugun`, `/seri`, `/ayarlar` shows respective stubs with tab bar
- Visiting `/login` and `/onboarding` shows full-screen stubs WITHOUT tab bar
- Toggling `.dark` class on `<html>` in devtools changes background and text color
- Mobile viewport (375px) shows bottom tab bar; ≥768px shows left sidebar
</verification>

<success_criteria>
Shell builds, routes navigate, Tailwind dark mode infrastructure ready, mobile-first responsive container in place. Plans 02 and 03 can build on top without modifying these files (other than wiring auth state).
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/1-01-SUMMARY.md`
</output>
