---
phase: 01-foundation
plan: 03
subsystem: pwa
tags: [next-pwa, service-worker, manifest, pwa, ios, firestore-offline, indexeddb]

# Dependency graph
requires:
  - phase: 01-foundation/01
    provides: Next.js scaffold, Tailwind config, app shell with routes
  - phase: 01-foundation/02
    provides: Firebase init, AuthProvider, auth-context

provides:
  - PWA manifest at /manifest.json with display:standalone
  - Service Worker via next-pwa (sw.js generated at build)
  - iOS Safari custom install banner (one-time, localStorage flag)
  - Firestore offline persistence via enableIndexedDbPersistence
  - App icons at 192x192, 512x512, 180x180 (apple-touch-icon)

affects: [all future phases using PWA features, offline caching, iOS install flow]

# Tech tracking
tech-stack:
  added: ["@ducanh2912/next-pwa@^10.2.0", "sharp (devDependency, icon generation)"]
  patterns:
    - "next-pwa withPWA wrapper in next.config.js, disabled in development"
    - "localStorage flag pattern for one-time UI (trabit:ios-install-banner-dismissed)"
    - "enableIndexedDbPersistence called once on client mount (singleton guard)"

key-files:
  created:
    - "next.config.js (withPWA wrapper)"
    - "public/manifest.json"
    - "public/icons/icon-192.png"
    - "public/icons/icon-512.png"
    - "public/icons/apple-touch-icon.png"
    - "lib/firestore-offline.ts"
    - "components/IOSInstallBanner.tsx"
  modified:
    - "app/layout.tsx (manifest metadata, appleWebApp, IOSInstallBanner)"
    - "package.json (sharp devDependency)"

key-decisions:
  - "next-pwa disabled in development (NODE_ENV check) to avoid SW interference with HMR"
  - "sharp installed as devDependency for SVG-to-PNG icon generation at exact sizes"
  - "IOSInstallBanner placed as last child in body (outside AuthProvider) to always render"
  - "enableFirestoreOffline called from IOSInstallBanner useEffect for client-side init"

patterns-established:
  - "PWA-singleton-guard: enabled flag prevents double-call to enableIndexedDbPersistence"
  - "iOS-install-detect: check /iPad|iPhone|iPod/ + display-mode:standalone + localStorage flag"

requirements-completed: [AUTH-03, PWA-01, PWA-02]

# Metrics
duration: 3min
completed: 2026-04-08
---

# Phase 1 Plan 03: PWA Install + Service Worker + iOS Banner Summary

**next-pwa Service Worker with manifest, app icons, iOS Safari install banner (one-time localStorage), and Firestore IndexedDB offline persistence**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-08T15:27:15Z
- **Completed:** 2026-04-08T15:30:00Z
- **Tasks:** 2 of 3 automated tasks complete (Task 3 is human-verify checkpoint)
- **Files modified:** 8

## Accomplishments

- next-pwa configured with withPWA wrapper; sw.js generated at build time
- PWA manifest with display:standalone, portrait orientation, Trabit branding
- App icons generated at 192x192, 512x512, and 180x180 via sharp (SVG-to-PNG)
- Firestore offline persistence helper with singleton guard and graceful error handling
- iOS Safari install banner with one-time show logic (localStorage dismiss flag)
- layout.tsx updated with full PWA metadata: manifest link, themeColor, appleWebApp, apple icon

## Task Commits

Each task was committed atomically:

1. **Task 1: next-pwa wrapper, manifest, icons, Firestore offline** - `40713c0` (feat)
2. **Task 2: iOS install banner + manifest link + offline init wiring** - `45f944c` (feat)
3. **Task 3: Human verification checkpoint** - (awaiting human verification)

## Files Created/Modified

- `next.config.js` - Wrapped with @ducanh2912/next-pwa, disabled in development
- `public/manifest.json` - PWA manifest with display:standalone, Trabit branding, icon references
- `public/icons/icon-192.png` - 192x192 app icon (dark bg + red T)
- `public/icons/icon-512.png` - 512x512 app icon (dark bg + red T)
- `public/icons/apple-touch-icon.png` - 180x180 apple touch icon
- `lib/firestore-offline.ts` - enableIndexedDbPersistence with singleton guard and error codes
- `components/IOSInstallBanner.tsx` - iOS Safari install prompt with localStorage dismiss, standalone detection
- `app/layout.tsx` - Added manifest, themeColor, appleWebApp metadata + IOSInstallBanner render

## Decisions Made

- sharp installed as devDependency to generate real PNG icons (required exact pixel dimensions)
- IOSInstallBanner calls enableFirestoreOffline on mount — keeps offline init tied to first client render
- next-pwa disabled in dev (default behavior) to avoid Service Worker conflicts with HMR

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed sharp devDependency for icon generation**
- **Found during:** Task 1 (icon generation)
- **Issue:** Plan specified using sharp for PNG generation but it wasn't installed
- **Fix:** Ran `npm i -D sharp` before icon generation script
- **Files modified:** package.json, package-lock.json
- **Verification:** Icons generated successfully at correct sizes
- **Committed in:** 40713c0 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking dependency)
**Impact on plan:** Necessary to fulfill plan requirement for real PNGs at exact sizes. No scope creep.

## Issues Encountered

- `next build` produces Firebase `auth/invalid-api-key` errors during static prerendering — this is a pre-existing issue from Plan 02 (Firebase configured with env vars not set in build environment). The Service Worker (`public/sw.js`) was still generated successfully. This is out of scope for Plan 03.

## Known Stubs

None - all files are fully wired. IOSInstallBanner renders real UI and contains actual logic. The icons are placeholder artwork (solid dark background with red "T") but are valid PNGs at the correct sizes.

## Next Phase Readiness

- PWA manifest and Service Worker are ready for production testing
- iOS install banner will show on first iOS Safari visit (requires real device test at checkpoint)
- Firestore offline persistence will activate on first client render
- Task 3 human-verify checkpoint is awaiting: run `npm run build && npm run start`, test manifest in DevTools, verify sw.js activates, test iOS install flow on device

---
*Phase: 01-foundation*
*Completed: 2026-04-08*
