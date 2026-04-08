# Phase 1: Foundation - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Google Auth ile giriş, Firebase persistence, ilk giriş kimlik cümlesi akışı, PWA manifest + Service Worker, Safari install banner (bir kez), ve 3-tab uygulama kabuğu (Bugün/Seri/Ayarlar). Alışkanlık CRUD veya UI içeriği bu fazda yok — yalnızca altyapı ve shell.

</domain>

<decisions>
## Implementation Decisions

### Auth & Onboarding Flow
- **D-01:** Google Sign-In (Firebase `signInWithPopup` + `GoogleAuthProvider`). Mobil Safari'de popup yerine `signInWithRedirect` kullanılır (iOS PWA uyumu için).
- **D-02:** İlk giriş tespiti: Firestore `users/{uid}` dökümanı yoksa → kimlik cümlesi ekranı gösterilir → kaydedilir → ana uygulamaya yönlendirilir.
- **D-03:** Kimlik cümlesi onboarding ekranı tam sayfadır; tabs veya nav barı olmaz. Kaydedildikten sonra bir daha gösterilmez.
- **D-04:** Firebase `setPersistence(browserLocalPersistence)` — oturum kalıcı olur.
- **D-05:** Çıkış: `signOut()` → giriş sayfasına yönlendirir. Firestore kullanıcı verisi silinmez.

### PWA & Install Banner
- **D-06:** `next-pwa` (Serwist tabanlı) ile Service Worker üretilir. `next.config.js` içinde `withPWA` wrapper.
- **D-07:** `manifest.json`: `display: "standalone"`, `theme_color`, `background_color`, 192x192 ve 512x512 ikonlar (Trabit için). `start_url: "/"`.
- **D-08:** iOS Safari "Ana Ekrana Ekle" banner'ı: standart Web App Install Prompt iOS'ta desteklenmediği için özel bir banner bileşeni gösterilir (ilk ziyarette, `localStorage` flag ile bir kez).
- **D-09:** Offline: Service Worker Next.js statik asset'leri ve anasayfayı önbelleğe alır. Firestore offline persistence aktif edilir (`enableIndexedDbPersistence`).

### App Shell & Routing
- **D-10:** Next.js 14 App Router. Root layout: `/app/layout.tsx`. Sekme navigasyonu için `/app/(app)/bugun`, `/app/(app)/seri`, `/app/(app)/ayarlar` route'ları.
- **D-11:** Tab bar mobilde bottom navigation (iOS HIG tarzı), masaüstünde sol sidebar veya top nav olarak uyarlanır. `md:` breakpoint ile geçiş.
- **D-12:** Auth route guard: `/(app)` layout'u oturumu kontrol eder; giriş yoksa `/login`'e yönlendirir. İlk kez giren ve kimlik cümlesi yoksa `/onboarding`'e yönlendirilir.
- **D-13:** Aktif sekme rengi marka rengiyle vurgulanır; tıklama Framer Motion ile kısa spring animasyonu yapar.

### Theming
- **D-14:** Tailwind `darkMode: "class"` — `<html>` üzerinde `dark` sınıfı toggle edilir. Tercih `localStorage`'da saklanır.
- **D-15:** Tailwind CSS değişkenleri ile renk sistemi: `--color-critical`, `--color-medium`, `--color-low` (kırmızı/sarı/yeşil) hem light hem dark için tanımlanır.
- **D-16:** Varsayılan tema: sistem tercihine göre (`prefers-color-scheme`), ilk yüklemede flash olmadan uygulanır (inline script ile).

### Firestore Data Model (Phase 1 scope)
- **D-17:** `users/{uid}` dökümanı: `{ identitySentence: string, createdAt: timestamp, theme: "light"|"dark" }`.
- **D-18:** Alışkanlık koleksiyonu bu fazda sadece placeholder — gerçek şema Phase 2'de.

### Responsive Design
- **D-19:** Mobile-first: tüm bileşenler 375px (iPhone SE) baz alınarak tasarlanır. `sm:`, `md:`, `lg:` breakpoint'lerle masaüstü uyarlaması.
- **D-20:** Max content width masaüstünde `max-w-md` (448px) veya `max-w-lg` (512px) ile ortalanır — PWA his hissini korur.

### Claude's Discretion
- Loading skeleton ve spinner tasarımı
- Giriş sayfası illüstrasyon/görsel seçimi
- Firestore güvenlik kurallarının tam detayı (sadece kendi verisine erişim yeterli)
- Error toast'larının konumu ve süresi

</decisions>

<specifics>
## Specific Ideas

- iOS Safari'de `signInWithRedirect` kullanılmalı — popup iOS PWA'da güvenilmez
- Install banner: "Safari'de 'Paylaş → Ana Ekrana Ekle' adımlarını" gösteren özel UI (iOS standart prompt yok)
- Tab bar bottom navigation — iPhone'da parmak erişimi kolay olsun
- Masaüstünde içerik ortalansın, telefon görünümü hissi korunsun (`max-w-md mx-auto`)

</specifics>

<canonical_refs>
## Canonical References

No external specs — requirements are fully captured in decisions above and in:
- `.planning/PROJECT.md` — Proje bağlamı, kısıtlar, tech stack
- `.planning/REQUIREMENTS.md` — AUTH-01..05, PWA-01..02 gereksinimleri
- `.planning/ROADMAP.md` — Phase 1 success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Yok — greenfield proje, bu faz Next.js projesini sıfırdan oluşturur

### Established Patterns
- Yok henüz — bu faz temel pattern'leri belirler

### Integration Points
- Firebase SDK Phase 1'de kurulur; sonraki tüm fazlar buradan import eder
- Tailwind config Phase 1'de dark mode + renk sistemiyle tanımlanır; sonraki fazlar bu değişkenleri kullanır
- Auth context (React Context veya Zustand) Phase 1'de oluşturulur; tüm fazlar kullanır

</code_context>

<deferred>
## Deferred Ideas

- Alışkanlık CRUD → Phase 2
- Today tab içeriği → Phase 3
- Push bildirim Service Worker → Phase 5
- Kimlik cümlesi toast animasyonu → Phase 3 (tamamlama akışında kullanılacak)

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-08*
