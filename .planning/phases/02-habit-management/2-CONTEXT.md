# Phase 2: Habit Management - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Alışkanlık CRUD (oluşturma, okuma, güncelleme, silme) ve ana ekrandaki hızlı ekleme butonu. Her alışkanlığın özellikleri: ad, tip (boolean/miktar), zamanlama (her gün / hafta içi / hafta sonu), önem seviyesi (kritik/orta/düşük), emoji/ikon, özel renk, hedef bildirim saati. Miktar alışkanlığı için hedef sayı belirlenir. Alışkanlık tamamlama mantığı (Today Tab) bu fazda yok — Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Firestore Veri Modeli
- **D-01:** `users/{uid}/habits/{habitId}` koleksiyon yapısı. Her döküman: `{ id, name, type: "boolean"|"amount", schedule: "daily"|"weekdays"|"weekends", importance: "critical"|"medium"|"low", emoji: string, color: string (hex), notificationTime: string|null (HH:MM), targetAmount: number|null, createdAt, updatedAt, order: number }`.
- **D-02:** `order` alanı, alışkanlıkların önem sırasına göre sıralanmasını Firestore tarafında destekler. Önem sırası: critical=0, medium=1, low=2.
- **D-03:** Miktar alışkanlığı için `targetAmount` (sayı, zorunlu) ve `type: "amount"`. Boolean için `type: "boolean"`, `targetAmount: null`.

### Alışkanlık Formu UI
- **D-04:** Tek bir `HabitForm` bileşeni hem ekleme hem düzenleme için kullanılır. Prop: `habit?: Habit` (düzenleme modu).
- **D-05:** Form alanları: ad (text), tip (boolean/miktar toggle), zamanlama (3 seçenek), önem seviyesi (3 seçenek renkli), emoji picker (basit grid, ~30 emoji), renk picker (önceden tanımlı 8-10 renk paleti), bildirim saati (time input, opsiyonel), hedef miktar (sayı, yalnızca tip=amount).
- **D-06:** Form validation: ad zorunlu (min 1 karakter, max 50). Miktar tipi seçiliyse hedef miktar zorunlu (min 1).
- **D-07:** Form mobilde bottom sheet (slide-up), masaüstünde modal veya full-page. Framer Motion ile açılır.

### Alışkanlık Listesi (Ayarlar'da)
- **D-08:** Ayarlar sekmesinde alışkanlıklar listesi görünür; düzenle ve sil butonları (her kart için).
- **D-09:** Silme öncesi confirm dialog (basit `window.confirm` veya küçük inline confirm).
- **D-10:** Liste boşken "Henüz alışkanlık yok — + ile ekle" empty state gösterilir.

### Hızlı Ekleme (FAB)
- **D-11:** Ana ekranda (app shell) sağ üstte veya sağ altta floating action button "+" — `HabitForm`'u açar.
- **D-12:** FAB yalnızca app route'larında görünür (login/onboarding'de yok). `app/(app)/layout.tsx`'e eklenir.

### Responsive
- **D-13:** Mobil-önce. Form bottom sheet'i masaüstünde centered modal'a dönüşür (`md:` breakpoint). `max-w-md` korunur.

### State Management
- **D-14:** Firestore realtime listener (`onSnapshot`) ile alışkanlıklar React state'ine bağlanır. `useHabits` custom hook.
- **D-15:** Optimistic UI yok — Firestore round-trip yeterince hızlı. Loading state gösterilir.

### Claude's Discretion
- Emoji picker kütüphanesi seçimi vs. basit grid (grid tercih edilir — kütüphane gereksiz)
- Renk paleti renkleri (Tailwind palette'den seçilir)
- Swipe-to-delete vs. button-based delete (button tercih edilir — iOS PWA'da swipe güvenilmez)
- Form animasyon detayları

</decisions>

<specifics>
## Specific Ideas

- Önem seviyesi seçici renkli — kritik=kırmızı, orta=sarı, düşük=yeşil
- Emoji picker: basit 4x8 grid, yaygın emoji'ler (🏃‍♂️💪🧘‍♀️💧📚🛌🍎🧹 vb.)
- Renk picker: 10 Tailwind rengi (sağ üst "+" ile aynı renk sistemi)
- FAB: sağ alt sabit pozisyon, tab bar'ın üzerinde

</specifics>

<canonical_refs>
## Canonical References

No external specs — requirements are fully captured in decisions above and in:
- `.planning/PROJECT.md` — Proje bağlamı, kısıtlar
- `.planning/REQUIREMENTS.md` — HABIT-01..05 gereksinimleri
- `.planning/ROADMAP.md` — Phase 2 success criteria
- `.planning/phases/01-foundation/1-CONTEXT.md` — Phase 1 kararları (Firestore yapısı, auth context)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/auth-context.tsx` — `useAuth()` hook, `AuthContext`; Phase 2'de `uid` almak için kullanılır
- `lib/user-doc.ts` — Firestore CRUD pattern; `habits` koleksiyonu için aynı pattern uygulanır
- `lib/firebase.ts` — `db` ve `auth` singleton; import edilir
- `components/TabBar.tsx` — App shell; FAB buraya veya `app/(app)/layout.tsx`'e eklenir
- `app/(app)/ayarlar/page.tsx` — Ayarlar sayfası; alışkanlık listesi ve CRUD buraya eklenir
- `tailwind.config.ts` — Renk değişkenleri ve dark mode; form stilleri için kullanılır

### Established Patterns
- Firestore CRUD: `setDoc`, `updateDoc`, `deleteDoc` ile `users/{uid}/...` path'i
- Framer Motion: `motion.div` spring animasyonları Phase 1'de kuruldu
- `max-w-md mx-auto` responsive container pattern
- `darkMode: "class"` — tüm bileşenler `dark:` prefix ile dark mode destekler

### Integration Points
- Phase 2 alışkanlıkları Phase 3 (Today Tab) ve Phase 4 (Streak Tab) tarafından okunur
- `useHabits` hook Phase 3 ve 4'te de kullanılacak — generic ve reusable yapılmalı

</code_context>

<deferred>
## Deferred Ideas

- Alışkanlık sıralaması (drag-and-drop reorder) → backlog
- Alışkanlık arşivleme (soft delete) → backlog
- Tamamlama geçmişi okuma → Phase 3 ve 4
- Push bildirimi gönderme → Phase 5

</deferred>

---

*Phase: 02-habit-management*
*Context gathered: 2026-04-08*
