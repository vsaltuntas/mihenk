# HayatOS v2 — Tam Analiz ve Master Plan
*Güncelleme: 28.03.2026*

## 🔍 SORUNLAR (Kullanıcı Raporu)
1. Projeler → proje kartlarına tıklanmıyor, iç sayfa yok
2. Katalog → sanatçılara tıklanmıyor, 4 tab yok, ekleme formu yok
3. Finans → Cüzdan Ekle, Hedef Ekle, Hesap Ekle, Kart Ekle butonları eksik
4. Wellness → ZenZone var ama Wellness Center (orijinal) hiç gösterilmiyor
5. Genel → pek çok modül read-only, interaktiflik çok düşük

## 📊 MODÜL BAZLI DURUM

### 1. Projeler (ProjectHub.tsx) — %40
- [x] Kanban board var
- [x] Liste görünüm var
- [x] Sol sidebar var
- [ ] Proje kartına tıklayınca → iç detay sayfası YOK
- [ ] Proje iç sayfası: Görevler listesi, alt görevler, açıklama, kanal, durum değiştirme
- [ ] "Yeni Proje" butonu modali YOK
- [ ] Orijinal: İçeriğe sahip proje kartları (Velvet Parish, MARKUT vs)
- [ ] Stat kartları üstte (Aktif Proje | Toplam Görev | Tamamlanan %)

### 2. Finans (FinanceTracker.tsx) — %55
- [x] 4 tab yapısı var
- [x] İşlem Ekle modal var
- [x] AreaChart var
- [ ] "Cüzdan Ekle" butonu YOK (sadece statik liste var)
- [ ] "AI Analiz" butonu YOK
- [ ] Hedef Ekle YOK (bütçe hedefleri statik)
- [ ] Orijinal header: 3 buton (+ İşlem Ekle | Cüzdan Ekle | AI Analiz)

### 3. Katalog (CatalogModule.tsx) — %20
- [x] Sanatçı listesi var
- [x] Track listesi var
- [ ] 4 TAB YOK (Sanatçılar | Yayınlar | Pipeline | Takvim)
- [ ] Sanatçıya tıklayınca detay sayfası YOK
- [ ] Sanatçı ekleme modal YOK
- [ ] Single/Albüm ekleme YOK
- [ ] 8 stat kart YOK (Sanatçı/Albüm/Track/Yayında + Pipeline)
- [ ] Arama + Grid/Liste toggle YOK
- [ ] "Bu Ay üretim" + Platform coverage YOK

### 4. Wellness (WellnessZone.tsx) — %45
- [x] Pomodoro Timer var (harika)
- [x] Check-in var
- [x] 30 günlük mood heatmap var
- [ ] "Wellness Center" ayrı sekme YOK (orijinal ayrı modül)
- [ ] Takviyeler tracker YOK
- [ ] Alışkanlıklar tracker YOK  
- [ ] Su Tüketimi tracker YOK
- [ ] AI Wellness Koçu YOK
- [ ] Bugünkü Skor YOK

### 5. CRM (CrmModule.tsx) — %30
- [x] Kişi ekleme formu var
- [x] Kişi kartları var
- [ ] 4 tab YOK (Tümü | Network | Ekip | Kurumlar)
- [ ] 5 stat kart YOK
- [ ] Kişi detay sayfası YOK
- [ ] 3 filtre dropdown YOK
- [ ] Etkileşim takibi YOK

### 6. Dashboard — %70
- [x] Selamlama, saat, quote var
- [x] Stat kartları var
- [x] AI önerileri var
- [ ] Risk Radarı widget YOK (şu an var ama statik)
- [ ] Level halka progress YOK (badge var ama halka yok)
- [ ] v6 Killer Flow step tracker YOK

### 7. Notlar — %75 (en iyi durumdaki)
### 8. Takvim — %70
### 9. Analytics — %80 (yeni yapıldı)

## 🚀 YENİ FAZ PLANI (v2)

### FAZ A: Projeler — İç Detay Sayfası + Modal ⭐
- Proje kartına tıklayınca → ProjectDetail bileşeni (slide-in veya full)
- ProjectDetail: başlık, durum badge, kanal badge, ilerleme, açıklama, alt görevler listesi
- Alt görev ekleme + tamamlama toggle
- Durum değiştirme dropdown
- "Yeni Proje" modal → başlık, açıklama, kanal, durum, öncelik
- Stat kartları üste (Aktif/Toplam/Tamamlanan)

### FAZ B: Katalog — Tam 4-Tab Yapısı ⭐
- Tab 1: Sanatçılar — grid/liste, arama, Sanatçı Ekle modal
- Sanatçıya tıklayınca detay: bio, genre, tracks, albümler
- Tab 2: Yayınlar — Single/EP/Albüm ekleme, durum, yayın tarihi
- Tab 3: Pipeline — kanban (Taslak→Demo→Hazır→Dağıtım→Yayında)
- Tab 4: Takvim — yayın takvimi
- 8 stat kart + platform coverage

### FAZ C: Finans — Eksik Butonlar + Cüzdan Modal ⭐
- Header: 3 buton (İşlem Ekle | Cüzdan Ekle | AI Analiz)
- Cüzdan Ekle: modal → isim, banka, para birimi, başlangıç bakiye
- Bütçe & Hedef tab: Hedef Ekle modal
- AI Analiz: mock AI analiz sonucu göster

### FAZ D: Wellness Center — 2 Modül Tek Çatı ⭐
- WellnessZone → 2 ana bölüm: "Wellness Center" + "ZenZone"
- Wellness Center tab:
  - Takviyeler (check ile tamamlama)
  - Alışkanlıklar (günlük tik)
  - Su Tüketimi (8 bardak tracker)
  - Bugünkü Skor (%)
  - AI Wellness Koçu mesajı
- ZenZone tab: mevcut Pomodoro + Check-in + History (zaten var)

### FAZ E: CRM — 4 Tab + Detay Sayfası
- Header stat kartları (Toplam/Ekip/Network/Takip/Kurum)
- 4 tab: Tümü | Network | Ekip | Kurumlar
- Kişi kartına tıklayınca detay panel
- 3 filtre: Kanal | Etkileşim | Sıralama
- Etkileşim takibi (son görüşme tarihi, not)

## Tamamlanan Fazlar
- [x] FAZ A: Projeler iç detay + Yeni Proje modali ✅ (28.03.2026)
- [x] FAZ B: Katalog 4-tab + Sanatçı/Track detay + Ekleme modalları ✅ (28.03.2026)
- [x] FAZ C: Finans — Cüzdan Ekle + AI Analiz + Hedef Ekle ✅ (28.03.2026)
- [x] FAZ D: Wellness Center — Takviyeler + Alışkanlıklar + Su + AI Koç ✅ (28.03.2026)
- [x] FAZ E: CRM 4-Tab + Stat Kartlar + Detay Paneli ✅ (28.03.2026)
