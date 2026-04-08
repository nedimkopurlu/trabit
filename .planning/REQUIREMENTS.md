# Requirements: Trabit

**Defined:** 2026-04-08
**Core Value:** Kullanıcı, o güne ait alışkanlıklarını hızla görmeli, tamamlamalı ve serisinin kırılmadığını anında hissetmelidir.

## v1 Requirements

### Auth

- [ ] **AUTH-01**: Kullanıcı Google hesabıyla giriş yapabilir
- [ ] **AUTH-02**: İlk girişte kimlik cümlesi (identity sentence) girilmesi istenir ve Firestore'a kaydedilir
- [ ] **AUTH-03**: PWA kurulum banner'ı ilk açılışta bir kez gösterilir
- [ ] **AUTH-04**: Kullanıcı oturumu tarayıcı yenilenmesinde korunur (Firebase persistence)
- [ ] **AUTH-05**: Kullanıcı hesaptan çıkış yapabilir

### Habit

- [ ] **HABIT-01**: Kullanıcı alışkanlık ekleyebilir: ad, tip (boolean/miktar), zamanlama (her gün / hafta içi / hafta sonu), önem seviyesi (kritik/orta/düşük), emoji/ikon, özel renk, hedef bildirim saati
- [ ] **HABIT-02**: Miktar alışkanlığı için başlangıçta hedef sayı belirlenir
- [ ] **HABIT-03**: Kullanıcı mevcut alışkanlığı düzenleyebilir
- [ ] **HABIT-04**: Kullanıcı alışkanlığı silebilir
- [ ] **HABIT-05**: Ana ekranda sağ üst "+" butonu ile hızlı alışkanlık ekleme akışı açılır

### Today

- [ ] **TODAY-01**: Bugün sekmesi yalnızca o güne ait alışkanlıkları listeler (hafta içi / hafta sonu / her gün mantığına göre)
- [ ] **TODAY-02**: Alışkanlıklar önem seviyesi sırasına göre listelenir (kritik→orta→düşük); renk kodu kırmızı/sarı/yeşil
- [ ] **TODAY-03**: Boolean alışkanlık kartında "2dk" ve "Yaptım" butonları bulunur
- [ ] **TODAY-04**: Miktar alışkanlığı kartında progress bar ve [+]/[-] butonları bulunur; progress bar hedefe göre dolar
- [ ] **TODAY-05**: Tamamlanan alışkanlık animasyonla liste altına kayar
- [ ] **TODAY-06**: Her tamamlamada Framer Motion micro-animasyon oynar ve kimlik cümlesi toast olarak gösterilir
- [ ] **TODAY-07**: Günün tüm alışkanlıkları tamamlanınca tam ekran kutlama ekranı açılır

### Streak

- [ ] **STREAK-01**: Her alışkanlık için 7 günlük ısı haritası gösterilir (tam / 2dk / ilgisiz / boş renk kodları)
- [ ] **STREAK-02**: Hafta sonu alışkanlıkları hafta içi günlerde boş/eksik sayılmaz (ve tersi); "ilgisiz" rengiyle gösterilir
- [ ] **STREAK-03**: 2dk tamamlama seriyi kırmaz ama ısı haritasında ayrı renkte gösterilir
- [ ] **STREAK-04**: Her alışkanlık için en uzun seri istatistiği gösterilir
- [ ] **STREAK-05**: Her alışkanlık için toplam tamamlama sayısı gösterilir
- [ ] **STREAK-06**: Her alışkanlık için bu haftaki tamamlama oranı gösterilir

### Settings

- [ ] **SETTINGS-01**: Kullanıcı gece/gündüz modu arasında geçiş yapabilir
- [ ] **SETTINGS-02**: Kullanıcı kimlik cümlesini düzenleyebilir

### PWA

- [ ] **PWA-01**: Uygulama iPhone ana ekranına PWA olarak kurulabilir (next-pwa + manifest)
- [ ] **PWA-02**: Service Worker ile temel offline desteği sağlanır

### Notifications

- [ ] **NOTIF-01**: Her alışkanlık için ayarlardan bağımsız bildirim saati belirlenebilir
- [ ] **NOTIF-02**: Belirlenen saatte PWA push bildirimi gönderilir (iOS PWA kısıtları dahilinde)

## v2 Requirements

### Analytics

- **ANALYTICS-01**: Aylık tamamlama grafiği
- **ANALYTICS-02**: Alışkanlık bazlı ilerleme trendleri

### Social

- **SOCIAL-01**: Alışkanlık paylaşma linki

## Out of Scope

| Feature | Reason |
|---------|--------|
| Çok kullanıcılı paylaşım | Tek kullanıcı odaklı uygulama |
| Google dışı OAuth | Google yeterli v1 için |
| Video/medya ekleme | Alışkanlık takibi için gereksiz |
| Ayrı backend API | Firebase doğrudan kullanılır |
| Real-time chat | Kapsam dışı |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| PWA-01 | Phase 1 | Pending |
| PWA-02 | Phase 1 | Pending |
| HABIT-01 | Phase 2 | Pending |
| HABIT-02 | Phase 2 | Pending |
| HABIT-03 | Phase 2 | Pending |
| HABIT-04 | Phase 2 | Pending |
| HABIT-05 | Phase 2 | Pending |
| TODAY-01 | Phase 3 | Pending |
| TODAY-02 | Phase 3 | Pending |
| TODAY-03 | Phase 3 | Pending |
| TODAY-04 | Phase 3 | Pending |
| TODAY-05 | Phase 3 | Pending |
| TODAY-06 | Phase 3 | Pending |
| TODAY-07 | Phase 3 | Pending |
| STREAK-01 | Phase 4 | Pending |
| STREAK-02 | Phase 4 | Pending |
| STREAK-03 | Phase 4 | Pending |
| STREAK-04 | Phase 4 | Pending |
| STREAK-05 | Phase 4 | Pending |
| STREAK-06 | Phase 4 | Pending |
| SETTINGS-01 | Phase 5 | Pending |
| SETTINGS-02 | Phase 5 | Pending |
| NOTIF-01 | Phase 5 | Pending |
| NOTIF-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-08*
*Last updated: 2026-04-08 after initial definition*
