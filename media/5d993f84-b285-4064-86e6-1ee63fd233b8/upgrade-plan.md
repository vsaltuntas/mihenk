# HayatOS Genesis Upgrade Plan
## Orijinal → Genesis Taşıma Fazları

### FAZ 1: Dashboard Yeniden Tasarım ⭐ (En büyük etki)
**Dosya:** Dashboard.tsx (komple yeniden yaz)
- Canlı saat widget (üst sol)
- Level badge (üst sağ, halka progress)
- Adaptive selamlama + motivasyon quote
- 3 üst kart satırı: Acil Görevler | Bugünün Takvimi | Hızlı Eylem
- Bugünün Tek Aksiyonu kartı (Killer Flow mini)
- Durum kartı (XP halka, Streak, Focus durumu)
- AI Önerileri kartları (3 aksiyon)
- Risk Radarı mini widget
- Nakit Akışı widget (line chart + net varlık)
- Yaklaşan Etkinlikler
- Hızlı Erişim (son projeler/notlar)
**Etki:** Dashboard'u orijinalin yapısına çok yaklaştırır

### FAZ 2: Global UI — Footer Bar + Command Palette
**Dosyalar:** App.tsx, FooterBar.tsx, CommandPalette.tsx
- Alt footer bar: XP · Level · Streak · Sürüm · Saat
- Command Palette (⌘K) — cmdk paketi ile
- Sidebar iyileştirme (icon-only collapsed, tooltip)
**Etki:** Navigasyon ve genel UX büyük sıçrama

### FAZ 3: Notlar — 3 Panel Layout
**Dosya:** NotesModule.tsx (komple yeniden yaz)
- Sol panel: Defterler sidebar + Son Notlar listesi
- Orta/Sağ panel: Not içerik görüntüleyici (markdown render)
- Düzenle, Task'a Çevir, Kopyala, Yıldızla aksiyonları
- Arama + Grid/Liste toggle
**Etki:** Not deneyimi tamamen değişir

### FAZ 4: Wellness → ZenZone (Timer + Mood Heatmap)
**Dosya:** WellnessZone.tsx (büyük güncelleme)
- Pomodoro Timer (25:00, sinematik, Play/Pause/Reset)
- Deep Work / Mola toggle
- Motivasyon quote'ları
- 30 Günlük Mood Haritası (heatmap grid)
- Takviye + Alışkanlık tracker iyileştirme
**Etki:** Wellness modülü gerçek ZenZone olur

### FAZ 5: Takvim İyileştirme
**Dosya:** CalendarModule.tsx (büyük güncelleme)
- Sağ sidebar: Hızlı Ekleme preset butonları + mini stats
- Ay/Hafta görünüm toggle
- Her güne + butonu
- Etkinlik tür filtreleri
**Etki:** Takvim orijinale yaklaşır

### FAZ 6: Finans Tab Yapısı
**Dosya:** FinanceTracker.tsx (orta güncelleme)
- 4 tab: Genel Özet | Hareketler | Cüzdanlar | Bütçe & Hedef
- Nakit Akışı line chart (45 gün)
- Uyarılar + Aylık Projeksiyon bölümü
- AI Analiz butonu
**Etki:** Finans profesyonelleşir

### FAZ 7: Analytics Hub (Yeni Modül)
**Dosya:** AnalyticsHub.tsx (yeni)
- Dönem seçici (7/30/90/365 gün)
- Modül filtreleri (Genel/Müzik/Finans)
- 4 KPI kartı
- İş Modülleri Durumu + Gelir Özeti
**Etki:** Üst düzey overview eklenir

### FAZ 8: Projeler İyileştirme
**Dosya:** ProjectHub.tsx (orta güncelleme)
- Sol sidebar: Tüm Projeler, Inbox, Bugün
- İlerleme bar + kanal badge
- Grid/Liste toggle
- Arama + filtreler
**Etki:** Proje yönetimi olgunlaşır

### 🔮 İleri Fazlar (Opsiyonel)
- Maestro (basit prompt builder)
- Katalog tab yapısı (Yayınlar/Pipeline/Takvim)
- CRM iyileştirme (tab yapısı + etkileşim takibi)
- Ayarlar sayfası

## Mevcut Durum
- [x] Faz 0: Temel kurulum (9 proje, agent, 9 modül)
- [x] Faz 1: Dashboard ✅ (28.03.2026)
- [x] Faz 2: Footer + ⌘K ✅ (28.03.2026)
- [x] Faz 3: Notlar ✅ (28.03.2026) 3-panel
- [x] Faz 4: ZenZone ✅ (28.03.2026)
- [x] Faz 5: Takvim ✅ (28.03.2026)
- [x] Faz 6: Finans ✅ (28.03.2026)
- [x] Faz 7: Analytics ✅ (28.03.2026)
- [x] Faz 8: Projeler ✅ (28.03.2026)
