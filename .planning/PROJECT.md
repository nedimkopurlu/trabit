# Trabit

## What This Is

Trabit, tek kullanıcılı bir alışkanlık takip PWA'sıdır. Google Auth ile giriş yapılır, alışkanlıklar bugün/seri/ayarlar üç sekmesinde yönetilir. iPhone ana ekranına kurulum desteği ile günlük, hafta içi veya hafta sonu alışkanlıkları takip edilir; her tamamlamada micro-animasyon ve kişisel bir kimlik mesajı gösterilir.

## Core Value

Kullanıcı, o güne ait alışkanlıklarını hızla görmeli, tamamlamalı ve serisinin kırılmadığını anında hissetmelidir.

## Requirements

### Validated

- ✓ Google Auth ile giriş yapılabilir — Phase 1
- ✓ İlk giriş kimlik cümlesi akışı — Phase 1
- ✓ Oturum yenileme sonrası korunur (browserLocalPersistence) — Phase 1
- ✓ Hesaptan çıkış yapılabilir — Phase 1
- ✓ PWA kurulum banner'ı (iOS one-time) — Phase 1
- ✓ iPhone ana ekranına PWA kurulumu (next-pwa, manifest, SW) — Phase 1

### Active

**Auth & Onboarding**
- [ ] Kullanıcı Google hesabıyla giriş yapabilir
- [ ] İlk girişte kimlik cümlesi (identity sentence) girilmesi istenir
- [ ] PWA kurulum banner'ı ilk açılışta bir kez gösterilir
- [ ] Oturum tarayıcı yenilenmesinde korunur

**Bugün Sekmesi**
- [ ] Bugün sekmesi yalnızca o güne ait alışkanlıkları listeler (akşam=hafta içi, hafta sonu=Cmt-Pzr, her gün=hepsi)
- [ ] Alışkanlıklar önem sırasına (kritik→orta→düşük) göre listelenir; renk kodu: kırmızı/sarı/yeşil
- [ ] Boolean alışkanlık kartı "2dk" ve "Yaptım" butonuna sahiptir
- [ ] Miktar alışkanlığı kartında progress bar ve [+]/[-] butonları bulunur; kullanıcı başlangıçta hedef sayı belirler
- [ ] Tamamlanan alışkanlıklar liste altına kayar (animasyonlu)
- [ ] Her tamamlamada Framer Motion micro-animasyon oynar ve kimlik cümlesi toast olarak gösterilir
- [ ] Günün tüm alışkanlıkları tamamlanınca tam ekran kutlama ekranı açılır

**Seri Sekmesi**
- [ ] Her alışkanlık için 7 günlük ısı haritası gösterilir (tam / 2dk / ilgisiz / boş renk kodları)
- [ ] Hafta sonu alışkanlıkları hafta içi günlerde boş/eksik sayılmaz (ve tersi)
- [ ] 2dk tamamlama seriyi kırmaz ama ısı haritasında ayrı renkte gösterilir
- [ ] Her alışkanlık için: en uzun seri, toplam tamamlama, bu haftaki tamamlama oranı istatistikleri gösterilir

**Ayarlar & Alışkanlık Yönetimi**
- [ ] Kullanıcı alışkanlık ekleyebilir, düzenleyebilir, silebilir (CRUD)
- [ ] Alışkanlık özellikleri: ad, tip (boolean/miktar), zamanlama (her gün/hafta içi/hafta sonu), önem seviyesi, emoji/ikon, özel renk, hedef bildirim saati
- [ ] Ana ekranda sağ üst "+" butonu ile hızlı alışkanlık ekleme
- [ ] Gece/gündüz modu toggle
- [ ] Kimlik cümlesi düzenlenebilir
- [ ] Hesaptan çıkış yapılabilir

**Bildirimler**
- [ ] Her alışkanlık için ayarlardan bağımsız bildirim saati belirlenebilir
- [ ] PWA push bildirimi olarak gönderilir (iOS PWA kısıtları dahilinde)

### Out of Scope

- Çok kullanıcılı paylaşım — tek kullanıcı odaklı uygulama
- OAuth (Google dışı) — Google yeterli
- Video/medya ekleme — alışkanlık takibi için gereksiz
- Gelişmiş analitik dashboard — Seri sekmesindeki istatistikler yeterli v1 için
- Backend API katmanı — Firebase doğrudan kullanılır, ayrı sunucu gereksiz

## Context

- **Stack:** Next.js 14 (App Router), Tailwind CSS, Firebase (Google Auth + Firestore), next-pwa, Framer Motion
- **Deployment:** Vercel, iPhone PWA olarak ana ekrana kurulabilir
- **Kimlik cümlesi:** Kullanıcının kendi motivasyon/kimlik ifadesi; ilk girişte alınır, tamamlama anında toast olarak gösterilir, ayarlardan düzenlenebilir
- **Kullanım senaryosu:** Tek kişisel kullanım — sosyal veya takım özelliği yok
- **2dk kuralı:** Kısa tamamlama seriyi kırmaz ancak ısı haritasında farklı renk; tam sayılmaz
- **Bildirimler:** PWA Service Worker aracılığıyla; iOS'ta arka plan push sınırlı, best-effort

## Constraints

- **Tech Stack:** Next.js 14 + Firebase + Tailwind + Framer Motion — değiştirilemez
- **Deployment:** Vercel — CI/CD sağlar
- **Platform:** iPhone PWA birinci öncelik — iOS Safari kısıtları (bildirim, arka plan sync) gözetilmeli
- **Kullanıcı:** Tek hesap — multi-tenant tasarım gereksiz
- **Veri:** Firestore gerçek zamanlı sync — offline destek next-pwa ile

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Firebase Firestore (doğrudan) | Backend API katmanı gerekmez, tek kullanıcı | — Pending |
| next-pwa + Service Worker | iOS PWA kurulum ve offline destek | — Pending |
| Framer Motion animasyonlar | Micro-animasyon + kutlama ekranı kalitesi | — Pending |
| 2dk = seri korur ama tam değil | Kullanıcı seçimi: ısı haritasında ayrı renk | — Pending |
| Kimlik cümlesi = toast | Kullanıcı seçimi: overlay yerine toast | — Pending |
| İstatistikler Seri sekmesinde | Kullanıcı seçimi: ayrı sayfa gereksiz | — Pending |
| Her alışkanlığa özel bildirim saati | Kullanıcı seçimi: tek genel saat yerine esnek | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-08 after initialization*
