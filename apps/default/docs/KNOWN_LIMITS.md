# MİHENK v1.0 — Known Limits & Bridge-Pending

## Platform Constraints (Taskade Genesis)

| Limit | Impact | Workaround |
|-------|--------|-----------|
| No file upload API | Katalog galeri/foto, Proje dosyaları kullanılamaz | Harici URL referans ekle |
| No sharing/collab API | Katalog paylaşım butonu çalışmaz | Taskade'den doğrudan paylaş |
| No relational graph API | Projeler arası graf çizilemez | Flat liste ile göster |
| API rate limits | Çok fazla concurrent fetch yavaşlatabilir | useMihenkData cache + refetch |
| No real-time sync | Başka sekmede yapılan değişiklikler anlık görünmez | Manuel refresh |
| No offline mode | İnternet kesilince veri yazılamaz | Sonner toast ile uyar |
| Single space binding | Uygulama tek Taskade space'e bağlı | Space ID: t9rg9ursyzgycpap |

## Bridge-Pending Features (V1.0'da Yok)

| # | Feature | Neden | Çözüm Yolu |
|---|---------|-------|-----------|
| 1 | Katalog paylaşım butonu | Taskade sharing API yok | V2: Taskade API veya deeplink |
| 2 | Galeri/Foto yükleme | Taskade file upload yok | V2: Harici storage (S3/Supabase) |
| 3 | Proje dosyalar sekmesi | Taskade file storage yok | V2: Harici file system |
| 4 | Graph visualization | Relation graph API yok | V2: D3.js ile client-side graf |

## Stub Modules (Placeholder — Kullanılmaz)

Aşağıdaki modüller sadece "Çok Yakında" placeholder gösterir:

```
AjanKonseyi, AyarlarModule, BilgiHaritasi, CeliskiMotoru,
ChartmetricModule, DerinArastirma, ErisimModule, FirsatlarModule,
GuvenlikModule, InboxMail, KanitKuyrugu, KapaliOda,
KarsilastirModule, KlipStudio, KonserTur, MadenModule,
MixRoom, OnboardingModule, OtomasyonlarModule, PipelineModule,
ReleaseRadar, SesAnaliz, SozlesmelerModule, UygulamaAtolyesi,
VeriKazisi, Workforce
```

## Data Integrity Notes

- **@mhkid format:** `mihenk_{module}_{id}` — 25 generation points in write ops
- **Select field IDs:** Hardcoded in mihenk-data.ts field maps (FTYP, FCAT, etc.)
- **Backward compat:** `hayatosAPI` ve `useHayatosData` aliases kept in mihenk-data.ts
- **Agent naming:** Agent hala "HayatOS Asistan" (UI'da görünmez, sadece API'de)
