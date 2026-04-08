# Roadmap: Trabit

## Overview

Trabit, tek kullanıcılı bir alışkanlık takip PWA'sıdır. Yolculuk şu sırayla ilerler: Firebase + Google Auth altyapısı ve PWA kurulumu → alışkanlık CRUD yönetimi → günlük takip (Bugün sekmesi) → geçmiş ve seri görünümü (Seri sekmesi) → ayarlar ve push bildirimleri. Her faz bağımsız olarak doğrulanabilir bir kullanıcı deneyimi sunar.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Google Auth, Firebase persistence ve PWA kurulum altyapısı
- [ ] **Phase 2: Habit Management** - Alışkanlık ekleme, düzenleme, silme ve hızlı ekleme akışı
- [ ] **Phase 3: Today Tab** - Günlük alışkanlık listesi, tamamlama etkileşimleri ve animasyonlar
- [ ] **Phase 4: Streak Tab** - 7 günlük ısı haritası ve alışkanlık başarı istatistikleri
- [ ] **Phase 5: Settings & Notifications** - Tema, kimlik cümlesi yönetimi ve push bildirimleri

## Phase Details

### Phase 1: Foundation
**Goal**: Kullanıcı Google hesabıyla uygulamaya giriş yapabilir, oturumu korunur ve uygulama iPhone ana ekranına PWA olarak kurulabilir
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, PWA-01, PWA-02
**Success Criteria** (what must be TRUE):
  1. Kullanıcı Google hesabıyla giriş yapabilir ve uygulama içine yönlendirilir
  2. İlk girişte kimlik cümlesi ekranı açılır, kullanıcı cümlesini girip kaydedebilir
  3. Sayfa yenilendiğinde oturum kapanmaz, kullanıcı giriş ekranına dönmez
  4. Kullanıcı hesaptan çıkış yapabilir ve giriş ekranına yönlendirilir
  5. Safari'de "Ana Ekrana Ekle" banner'ı ilk açılışta bir kez görünür; uygulama PWA olarak kurulabilir ve offline temel çalışır
**Plans**: 3 plans
Plans:
- [ ] 1-01-PLAN.md — Scaffold Next.js 14 + Tailwind dark mode + 3-tab app shell
- [ ] 1-02-PLAN.md — Firebase + Google Auth + persistence + identity sentence onboarding (AUTH-01, AUTH-02, AUTH-04, AUTH-05)
- [ ] 1-03-PLAN.md — next-pwa Service Worker + manifest + iOS install banner (AUTH-03, PWA-01, PWA-02)

### Phase 2: Habit Management
**Goal**: Kullanıcı alışkanlıklarını oluşturabilir, düzenleyebilir ve silebilir; her alışkanlığın zamanlama, tip ve önem özellikleri tam olarak çalışır
**Depends on**: Phase 1
**Requirements**: HABIT-01, HABIT-02, HABIT-03, HABIT-04, HABIT-05
**Success Criteria** (what must be TRUE):
  1. Kullanıcı tüm özellikleriyle (ad, tip, zamanlama, önem, emoji, renk, bildirim saati) yeni bir alışkanlık oluşturabilir ve Firestore'a kaydedilir
  2. Miktar tipi alışkanlık için hedef sayı belirlenir ve kaydedilir
  3. Mevcut alışkanlığın herhangi bir özelliği düzenlenebilir
  4. Alışkanlık silinebilir ve listeden kalkar
  5. Ana ekrandaki "+" butonu tıklandığında hızlı alışkanlık ekleme akışı açılır
**Plans**: TBD

### Phase 3: Today Tab
**Goal**: Kullanıcı o güne ait alışkanlıklarını görür, tamamlar ve her tamamlamada anlık görsel geri bildirim alır
**Depends on**: Phase 2
**Requirements**: TODAY-01, TODAY-02, TODAY-03, TODAY-04, TODAY-05, TODAY-06, TODAY-07
**Success Criteria** (what must be TRUE):
  1. Bugün sekmesi yalnızca o güne uygun alışkanlıkları listeler (hafta içi/hafta sonu/her gün mantığı doğru çalışır)
  2. Alışkanlıklar kritik→orta→düşük sırasıyla renkli kart olarak görünür
  3. Boolean kart "2dk" ve "Yaptım" butonuyla tamamlanabilir; miktar kartında progress bar ve [+]/[-] ile hedef değiştirilebilir
  4. Tamamlanan alışkanlık micro-animasyonla liste altına kayar ve kimlik cümlesi toast olarak görünür
  5. Tüm alışkanlıklar tamamlandığında tam ekran kutlama ekranı açılır
**Plans**: TBD

### Phase 4: Streak Tab
**Goal**: Kullanıcı her alışkanlık için geçmiş 7 günün durumunu ısı haritasında görür ve istatistiklerle serisinin sağlığını takip eder
**Depends on**: Phase 3
**Requirements**: STREAK-01, STREAK-02, STREAK-03, STREAK-04, STREAK-05, STREAK-06
**Success Criteria** (what must be TRUE):
  1. Her alışkanlık için 7 günlük ısı haritası görünür; tam/2dk/ilgisiz/boş durumlar ayrı renklerde gösterilir
  2. Hafta sonu alışkanlıkları hafta içi günlerde, hafta içi alışkanlıkları hafta sonu günlerinde "ilgisiz" olarak gösterilir; eksik sayılmaz
  3. 2dk tamamlaması ısı haritasında ayrı renkte görünür
  4. Her alışkanlık kartı en uzun seri, toplam tamamlama ve bu hafta tamamlama oranını gösterir
**Plans**: TBD

### Phase 5: Settings & Notifications
**Goal**: Kullanıcı uygulama görünümünü ve kimlik cümlesini özelleştirebilir; her alışkanlık için push bildirimi alabilir
**Depends on**: Phase 4
**Requirements**: SETTINGS-01, SETTINGS-02, NOTIF-01, NOTIF-02
**Success Criteria** (what must be TRUE):
  1. Kullanıcı gece/gündüz modu arasında geçiş yapabilir ve tercih oturum boyunca korunur
  2. Kullanıcı kimlik cümlesini ayarlardan düzenleyebilir; güncelleme tamamlama toastlarına yansır
  3. Her alışkanlık için bağımsız bildirim saati ayarlanabilir
  4. Belirlenen saatte PWA push bildirimi gönderilir (iOS PWA kısıtları dahilinde best-effort)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Habit Management | 0/? | Not started | - |
| 3. Today Tab | 0/? | Not started | - |
| 4. Streak Tab | 0/? | Not started | - |
| 5. Settings & Notifications | 0/? | Not started | - |
