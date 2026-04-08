---
phase: 01-foundation
plan: 03
type: execute
wave: 2
depends_on: [01-foundation/01]
files_modified:
  - next.config.js
  - public/manifest.json
  - public/icons/icon-192.png
  - public/icons/icon-512.png
  - public/icons/apple-touch-icon.png
  - app/layout.tsx
  - components/IOSInstallBanner.tsx
  - lib/firestore-offline.ts
autonomous: false
requirements: [AUTH-03, PWA-01, PWA-02]
must_haves:
  truths:
    - "manifest.json served at /manifest.json with display: standalone"
    - "Service Worker registers and caches static assets after first visit"
    - "iOS Safari shows custom 'Add to Home Screen' banner once on first visit (localStorage flag)"
    - "App installable to iPhone home screen and launches standalone"
    - "Basic offline: previously visited pages load when offline"
  artifacts:
    - path: "public/manifest.json"
      provides: "PWA manifest"
      contains: "\"display\": \"standalone\""
    - path: "next.config.js"
      provides: "next-pwa wrapper"
      contains: "withPWA"
    - path: "components/IOSInstallBanner.tsx"
      provides: "iOS Safari custom install prompt"
      contains: "localStorage"
    - path: "lib/firestore-offline.ts"
      provides: "IndexedDB persistence enable"
      contains: "enableIndexedDbPersistence|persistentLocalCache"
  key_links:
    - from: "next.config.js"
      to: "@ducanh2912/next-pwa"
      via: "withPWA wrapper"
      pattern: "withPWA"
    - from: "app/layout.tsx"
      to: "public/manifest.json"
      via: "<link rel=manifest>"
      pattern: "rel=\"manifest\"|rel='manifest'"
    - from: "app/layout.tsx"
      to: "components/IOSInstallBanner.tsx"
      via: "import + render"
      pattern: "IOSInstallBanner"
---

<objective>
Make the app installable as an iPhone PWA with Service Worker offline support and a custom one-time iOS install banner.

Purpose: Phase 1 success criterion #5, requirements PWA-01, PWA-02, AUTH-03.
Output: Manifest, icons, registered Service Worker, iOS install banner, Firestore offline persistence.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundation/1-CONTEXT.md
@next.config.js
@app/layout.tsx
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: next-pwa wrapper, manifest, icons, Firestore offline</name>
  <files>next.config.js, public/manifest.json, public/icons/icon-192.png, public/icons/icon-512.png, public/icons/apple-touch-icon.png, lib/firestore-offline.ts</files>
  <read_first>
    - /Users/nedimkopurlu/Downloads/adsız klasör/next.config.js (current state from Plan 01)
    - /Users/nedimkopurlu/Downloads/adsız klasör/.planning/phases/01-foundation/1-CONTEXT.md (D-06, D-07, D-09)
    - /Users/nedimkopurlu/Downloads/adsız klasör/package.json (verify @ducanh2912/next-pwa is in deps)
  </read_first>
  <action>
    1. `next.config.js` — Wrap with `@ducanh2912/next-pwa` (already in deps from Plan 01):
       ```js
       const withPWA = require("@ducanh2912/next-pwa").default({
         dest: "public",
         register: true,
         disable: process.env.NODE_ENV === "development",
         workboxOptions: { disableDevLogs: true },
       });
       /** @type {import('next').NextConfig} */
       const nextConfig = { reactStrictMode: true };
       module.exports = withPWA(nextConfig);
       ```

    2. `public/manifest.json` — Per D-07:
       ```json
       {
         "name": "Trabit",
         "short_name": "Trabit",
         "description": "Alışkanlık takip uygulaman",
         "start_url": "/",
         "display": "standalone",
         "orientation": "portrait",
         "background_color": "#0a0a0c",
         "theme_color": "#0a0a0c",
         "icons": [
           { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
           { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
         ]
       }
       ```

    3. Generate placeholder icons (solid color PNG, Trabit "T") at three sizes. Use Node one-liner with sharp OR if unavailable, use ImageMagick `convert`. If neither available, create minimal valid PNGs via Node:
       ```bash
       node -e "
       const fs=require('fs');
       const path=require('path');
       fs.mkdirSync('public/icons',{recursive:true});
       // Minimal 1x1 PNG can't represent the design — use a small inline base64 of a solid colored square at each size
       // Use sharp if available
       try {
         const sharp = require('sharp');
         const svg = (size)=>'<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"'+size+'\" height=\"'+size+'\"><rect width=\"100%\" height=\"100%\" fill=\"#0a0a0c\"/><text x=\"50%\" y=\"58%\" font-size=\"'+(size*0.55)+'\" fill=\"#ef4444\" text-anchor=\"middle\" font-family=\"Arial\" font-weight=\"bold\">T</text></svg>';
         Promise.all([
           sharp(Buffer.from(svg(192))).png().toFile('public/icons/icon-192.png'),
           sharp(Buffer.from(svg(512))).png().toFile('public/icons/icon-512.png'),
           sharp(Buffer.from(svg(180))).png().toFile('public/icons/apple-touch-icon.png'),
         ]).then(()=>console.log('icons ok'));
       } catch(e) {
         console.error('install sharp first: npm i -D sharp');
         process.exit(1);
       }
       "
       ```
       If sharp isn't installed, run `npm i -D sharp` first, then run the script. The icons must be real PNGs at exactly 192x192, 512x512, and 180x180 pixels.

    4. `lib/firestore-offline.ts` — Per D-09:
       ```ts
       import { enableIndexedDbPersistence } from "firebase/firestore";
       import { db } from "./firebase";
       let enabled = false;
       export async function enableFirestoreOffline(): Promise<void> {
         if (enabled || typeof window === "undefined") return;
         enabled = true;
         try {
           await enableIndexedDbPersistence(db);
         } catch (err: any) {
           if (err.code === "failed-precondition") console.warn("Firestore offline: multiple tabs open");
           else if (err.code === "unimplemented") console.warn("Firestore offline: browser unsupported");
           else throw err;
         }
       }
       ```
  </action>
  <verify>
    <automated>cd "/Users/nedimkopurlu/Downloads/adsız klasör" && npm run typecheck && ls public/icons/icon-192.png public/icons/icon-512.png public/icons/apple-touch-icon.png public/manifest.json</automated>
  </verify>
  <acceptance_criteria>
    - `next.config.js` contains literal `withPWA` and `module.exports = withPWA(`
    - `public/manifest.json` contains `"display": "standalone"` and `"start_url": "/"`
    - `public/manifest.json` references `/icons/icon-192.png` and `/icons/icon-512.png`
    - Files exist: `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/apple-touch-icon.png`
    - `lib/firestore-offline.ts` contains `enableIndexedDbPersistence`
    - `tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>next-pwa configured, manifest valid, icons generated, offline helper ready.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: iOS install banner + manifest link + offline init wiring</name>
  <files>app/layout.tsx, components/IOSInstallBanner.tsx</files>
  <read_first>
    - /Users/nedimkopurlu/Downloads/adsız klasör/app/layout.tsx (current state — Plan 02 added AuthProvider)
    - /Users/nedimkopurlu/Downloads/adsız klasör/lib/firestore-offline.ts (created in Task 1)
    - /Users/nedimkopurlu/Downloads/adsız klasör/.planning/phases/01-foundation/1-CONTEXT.md (D-08, D-09)
  </read_first>
  <action>
    1. `components/IOSInstallBanner.tsx` — Per D-08, AUTH-03:
       ```tsx
       "use client";
       import { useEffect, useState } from "react";
       import { enableFirestoreOffline } from "@/lib/firestore-offline";

       const STORAGE_KEY = "trabit:ios-install-banner-dismissed";

       export function IOSInstallBanner() {
         const [show, setShow] = useState(false);
         useEffect(() => {
           enableFirestoreOffline();
           const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
           const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
           const dismissed = localStorage.getItem(STORAGE_KEY) === "1";
           if (isIOS && !isStandalone && !dismissed) setShow(true);
         }, []);
         if (!show) return null;
         const dismiss = () => { localStorage.setItem(STORAGE_KEY, "1"); setShow(false); };
         return (
           <div className="fixed bottom-20 left-2 right-2 z-50 mx-auto max-w-md rounded-xl bg-surface p-4 shadow-lg border border-fg/10">
             <div className="flex items-start gap-3">
               <div className="flex-1">
                 <p className="font-semibold mb-1">Trabit'i ana ekranına ekle</p>
                 <p className="text-sm opacity-80">Safari'de paylaş simgesine dokun, ardından "Ana Ekrana Ekle" seç.</p>
               </div>
               <button onClick={dismiss} aria-label="Kapat" className="text-xl leading-none px-2">×</button>
             </div>
           </div>
         );
       }
       ```

    2. `app/layout.tsx` — Add to existing layout (preserve AuthProvider from Plan 02 and ThemeScript from Plan 01):
       - In `metadata` export, add: `manifest: "/manifest.json"`, `themeColor: "#0a0a0c"`, `appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Trabit" }`, `icons: { apple: "/icons/apple-touch-icon.png" }`.
       - Inside `<body>`, render `<IOSInstallBanner />` as the LAST child after `{children}`. Import: `import { IOSInstallBanner } from "@/components/IOSInstallBanner";`
       - Verify (do NOT remove): `<AuthProvider>` wraps `{children}`, `<ThemeScript />` is in head, `lang="tr"` and viewport meta still present.
  </action>
  <verify>
    <automated>cd "/Users/nedimkopurlu/Downloads/adsız klasör" && npm run typecheck && npx next build 2>&1 | tail -30</automated>
  </verify>
  <acceptance_criteria>
    - `components/IOSInstallBanner.tsx` contains literal `trabit:ios-install-banner-dismissed`
    - `components/IOSInstallBanner.tsx` contains `iPad|iPhone|iPod` and `display-mode: standalone`
    - `components/IOSInstallBanner.tsx` calls `enableFirestoreOffline`
    - `app/layout.tsx` contains `manifest: "/manifest.json"` (in metadata)
    - `app/layout.tsx` contains `IOSInstallBanner` (rendered) and still contains `AuthProvider` and `ThemeScript`
    - `app/layout.tsx` contains `appleWebApp`
    - `next build` exits 0 and `public/sw.js` is generated (next-pwa output)
  </acceptance_criteria>
  <done>Build green, Service Worker generated, iOS banner component wired into root layout.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Human verification — PWA install + offline + iOS banner</name>
  <what-built>
    next-pwa Service Worker, PWA manifest with icons, iOS-specific install banner (one-time), Firestore offline persistence enabled on mount.
  </what-built>
  <how-to-verify>
    Build + serve production (Service Worker is disabled in dev):
    1. `npm run build && npm run start`
    2. Open http://localhost:3000 in Chrome → DevTools → Application → Manifest. Verify:
       - Name: Trabit
       - Display: standalone
       - Icons 192 and 512 load without errors
    3. DevTools → Application → Service Workers → confirm `sw.js` is "activated and running"
    4. DevTools → Network → check "Offline" → reload `/bugun`. Page should still render (cached). Static assets must not show as failed.
    5. iOS test (real iPhone, same Wi-Fi):
       - Open `http://<your-mac-lan-ip>:3000` in Safari
       - On first load, the custom install banner should appear at bottom
       - Tap × to dismiss → reload → banner should NOT reappear (localStorage flag works)
       - Clear Safari site data → reload → banner reappears (proves first-visit-only logic)
       - Tap Share → Add to Home Screen → confirm icon appears on home screen with "Trabit" label
       - Launch from home screen → app opens standalone (no Safari chrome) → banner does NOT appear (standalone mode detected)
    6. Confirm Firestore offline: in DevTools Console, no "failed-precondition" or "unimplemented" errors during first page load.
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- Lighthouse PWA audit (Chrome DevTools) passes installable criteria
- iOS device successfully installs and launches standalone
- Offline reload works for previously visited pages
- iOS install banner shows once and stays dismissed
</verification>

<success_criteria>
PWA-01 (installable iPhone PWA), PWA-02 (Service Worker offline), AUTH-03 (one-time install banner) all satisfied. Phase 1 complete after this plan + Plan 02 are approved.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/1-03-SUMMARY.md`
</output>
