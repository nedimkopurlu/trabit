---
phase: 01-foundation
plan: "01"
subsystem: ui
tags: [next.js, tailwind, framer-motion, typescript, pwa, dark-mode]

# Dependency graph
requires: []
provides:
  - Next.js 14 App Router project scaffold with TypeScript strict mode
  - Tailwind CSS with darkMode class strategy and CSS variable color system
  - Three-tab app shell: /bugun, /seri, /ayarlar with TabBar component
  - Dark mode theme infrastructure: ThemeScript (no flash) + lib/theme.ts
  - Mobile-first responsive layout (max-w-md, iPhone PWA framing)
  - Login and onboarding route stubs for Plan 02 auth wiring
affects:
  - 01-foundation plan 02 (auth and Firebase setup)
  - 01-foundation plan 03 (PWA manifest and service worker)
  - All subsequent plans (use routes, Tailwind vars, dark mode)

# Tech tracking
tech-stack:
  added:
    - next@14.2.x (App Router)
    - react@18.3.x
    - tailwindcss@3.4.x (darkMode class)
    - framer-motion@11.x
    - firebase@10.12.x (dependency only, not wired yet)
    - "@ducanh2912/next-pwa@10.2.x" (dependency only, wired in Plan 03)
    - typescript@5.4.x (strict)
  patterns:
    - CSS variable color system for light/dark theming
    - Inline ThemeScript before hydration to prevent flash
    - App Router route groups: (app) for tab-bar pages, standalone for login/onboarding
    - Mobile bottom nav + desktop sidebar via md: breakpoint in single component
    - Framer Motion layoutId spring for active tab indicator

key-files:
  created:
    - package.json
    - tsconfig.json
    - next.config.js
    - tailwind.config.ts
    - postcss.config.js
    - app/globals.css
    - .gitignore
    - .env.local.example
    - lib/theme.ts
    - components/ThemeScript.tsx
    - components/TabBar.tsx
    - app/layout.tsx
    - app/page.tsx
    - app/(app)/layout.tsx
    - app/(app)/bugun/page.tsx
    - app/(app)/seri/page.tsx
    - app/(app)/ayarlar/page.tsx
    - app/login/page.tsx
    - app/onboarding/page.tsx
  modified: []

key-decisions:
  - "darkMode: class strategy in tailwind.config.ts — toggled via document.documentElement.classList, persisted in localStorage"
  - "ThemeScript inline script prevents flash before React hydration"
  - "Route group (app) for pages with TabBar; login and onboarding are outside the group (no TabBar)"
  - "max-w-md container in (app)/layout.tsx preserves iPhone PWA feel on desktop"
  - "Framer Motion layoutId spring for tab indicator — established animation pattern for Plan 03+"

patterns-established:
  - "CSS vars pattern: --color-{name} in :root and .dark, consumed as rgb(var(...)) in Tailwind config"
  - "ThemeScript pattern: server component with dangerouslySetInnerHTML inline script for pre-hydration theme"
  - "Route group pattern: (app) wraps authenticated tab pages, standalone routes for auth flows"

requirements-completed: [AUTH-01, AUTH-02]

# Metrics
duration: 5min
completed: 2026-04-08
---

# Phase 1 Plan 01: Foundation Summary

**Next.js 14 App Router scaffold with Tailwind CSS dark mode class strategy, CSS variable color system, Framer Motion tab bar, and three-tab app shell (/bugun /seri /ayarlar) ready for auth wiring**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-08T15:18:39Z
- **Completed:** 2026-04-08T15:23:xx Z
- **Tasks:** 2 of 2
- **Files modified:** 19

## Accomplishments

- Next.js 14 App Router project initialized from scratch with TypeScript strict mode, Tailwind CSS, Framer Motion, Firebase, and next-pwa dependencies
- Dark mode infrastructure wired from day one: CSS variable color system, ThemeScript inline script (no flash), localStorage persistence, applyTheme/getInitialTheme utilities
- App shell with three navigable tab routes (/bugun /seri /ayarlar) using mobile-first bottom nav and md: desktop sidebar, animated active indicator via Framer Motion layoutId spring

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 14 + Tailwind + dependencies** - `bc3c16c` (chore)
2. **Task 2: Build app shell with routes, tab bar, and theme infrastructure** - `1cff0a1` (feat)

**Plan metadata:** (pending this commit)

## Files Created/Modified

- `package.json` - Project metadata and all dependencies (next, react, tailwind, framer-motion, firebase, next-pwa)
- `tsconfig.json` - TypeScript strict mode, bundler moduleResolution, @/* paths
- `next.config.js` - Next.js config with reactStrictMode
- `tailwind.config.ts` - darkMode: "class", CSS variable color system (critical/medium/low/bg/surface/fg)
- `postcss.config.js` - Tailwind + autoprefixer plugins
- `app/globals.css` - @tailwind directives, light/dark CSS variable definitions
- `.gitignore` - node_modules, .next, .env*.local, etc.
- `.env.local.example` - Firebase env var placeholders for Plan 02
- `lib/theme.ts` - getInitialTheme (prefers-color-scheme + localStorage) and applyTheme (classList toggle)
- `components/ThemeScript.tsx` - Server component with pre-hydration inline theme script
- `components/TabBar.tsx` - Mobile bottom nav + desktop sidebar with Framer Motion spring active indicator
- `app/layout.tsx` - Root layout with ThemeScript, viewport meta, Turkish lang, suppressHydrationWarning
- `app/page.tsx` - Root redirect placeholder to /bugun
- `app/(app)/layout.tsx` - App shell: max-w-md container, pb-20 mobile safe area, TabBar
- `app/(app)/bugun/page.tsx` - Bugün tab stub
- `app/(app)/seri/page.tsx` - Seri tab stub
- `app/(app)/ayarlar/page.tsx` - Ayarlar tab stub
- `app/login/page.tsx` - Full-screen login stub (no TabBar)
- `app/onboarding/page.tsx` - Full-screen identity sentence stub (no TabBar)

## Decisions Made

- Used `darkMode: "class"` in Tailwind config — dark class toggled on `<html>` element, not media query, so user preference survives system setting changes
- ThemeScript runs as inline script in `<head>` before hydration — prevents the white flash on dark mode reload (D-16)
- Route group `(app)` separates tab-bar pages from auth flow pages — login and onboarding render without TabBar naturally
- `max-w-md mx-auto` in `(app)/layout.tsx` preserves the iPhone PWA feel on desktop (D-20)
- Framer Motion `layoutId="tab-active"` spring animation established as the active state pattern; extends naturally to Plan 03+ animations

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required for this plan. Firebase env vars are documented in `.env.local.example` for Plan 02.

## Known Stubs

The following pages are intentional stubs to be wired in subsequent plans:

- `app/login/page.tsx` - Google auth button is visual only; Plan 02 wires Firebase `signInWithRedirect`
- `app/onboarding/page.tsx` - Input and button are visual only; Plan 02 wires Firestore identity sentence save
- `app/page.tsx` - Uses `<meta httpEquiv="refresh">` redirect; Plan 02 replaces with auth-aware server-side redirect
- `app/(app)/bugun/page.tsx`, `seri/page.tsx`, `ayarlar/page.tsx` - Stub content; Phase 2/3 implement actual features

These stubs are intentional scaffolding — they fulfill the routing structure required by this plan. Future plans will replace the stub content.

## Next Phase Readiness

- Next.js 14 App Router scaffold is ready for Plan 02 (Firebase Auth + Firestore)
- Tailwind dark mode CSS variables are defined — Plans 02+ use `text-critical`, `bg-surface`, etc. without modification
- Route structure established: `(app)` for authenticated pages, standalone for auth flows
- No modifications needed to these files other than auth wiring in Plan 02

---
*Phase: 01-foundation*
*Completed: 2026-04-08*
