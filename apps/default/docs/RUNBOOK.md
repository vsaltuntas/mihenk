# MİHENK v1.0 — Production Runbook

## Quick Reference

| Item | Value |
|------|-------|
| **Deploy URL** | https://genesis-insight-dashboard-3584.taskade.app |
| **Space ID** | `t9rg9ursyzgycpap` |
| **Platform** | Taskade Genesis (React 18 + esbuild) |
| **Build** | `cd /app && npm run build` |
| **Agent URL** | https://hayatos.taskade.site/a/01KMT63AZ8YZCHK8HDY2PYV4Y0 |

---

## 1. Deployment

Genesis uygulaması Taskade altyapısında host edilir. Dosya değişiklikleri otomatik olarak build edilir ve deploy edilir.

### Manual Rebuild
```bash
# Sandbox'ta:
cd /app && npm run build
```

### Post-Deploy Kontrol
1. Deploy URL'i aç
2. Gün Masası yüklendiğini kontrol et
3. Herhangi bir modülde veri geldiğini doğrula
4. Console'da kırmızı hata olmadığını kontrol et

---

## 2. Data Backup

### Otomatik (Nightly)
- **Workflow:** `01KV8K6SZ40BA3BHNEXHTZSR3H`
- **Saat:** 03:00 İstanbul
- **Hedef:** Taskade projesi `paPGvkBbBZiw9763` (MİHENK Nightly Backups)
- **Format:** Markdown (okunabilir, Taskade'de görüntülenebilir)

### Manuel JSON Export
1. SistemNabzı → "JSON Export İndir" butonuna tıkla
2. Tarayıcı `mihenk_export_YYYY-MM-DD.json` dosyasını indirir
3. JSON formatı: `{ schema_version, exported_at, modules: [...] }`
4. Her modülde: `records`, `relations`, `audit_events`, `field_map`

### GitHub'a Taşıma
```bash
# JSON export'u al, sonra:
git init mihenk-backup
cd mihenk-backup
cp ~/Downloads/mihenk_export_*.json ./data/
git add . && git commit -m "MİHENK backup $(date +%Y-%m-%d)"
git remote add origin git@github.com:USER/mihenk-backup.git
git push -u origin main
```

---

## 3. Source Code Backup

### Dosya Listesi (Kopyalanacak)
Tüm uygulama kodu `/app/src/` altındadır. Kritik dosyalar:

```
src/
├── App.tsx                          # Ana router
├── main.tsx                         # Bootstrap
├── index.css                        # Tema
├── lib/
│   ├── mihenk-data.ts              # ⭐ API + CRUD + types
│   ├── mihenk-export.ts            # Export engine
│   ├── mihenkSchema.ts             # Field maps
│   ├── store.ts                    # Zustand state
│   └── api.ts                      # Axios base
├── components/
│   ├── Dashboard.tsx               # Gün Masası
│   ├── GorevlerModule.tsx          # Görevler
│   ├── ProjectHub.tsx              # Projeler
│   ├── projects/ProjectDetail.tsx  # Proje detay
│   ├── CatalogModule.tsx           # Katalog
│   ├── NotesModule.tsx             # Notlar
│   ├── FinanceTracker.tsx          # Finans
│   ├── SinyallerModule.tsx         # Sinyaller
│   ├── SistemNabzi.tsx             # Sistem
│   ├── BackupModule.tsx            # Backup
│   └── Sidebar.tsx                 # Navigasyon
└── hooks/
    └── useProjectData.ts           # Data hook
```

### Local Kopyalama
Genesis sandbox'tan doğrudan `git clone` yapılamaz. Kodun kopyası:
1. Eve'den dosya içeriklerini iste
2. Veya bu dokümanı + SOURCE_MANIFEST'i referans olarak kullan
3. GitHub repo oluştur ve dosyaları sırayla kopyala

---

## 4. Troubleshooting

### Veri Yüklenmiyor
1. Network tab'da `/api/taskade/projects/*/nodes` çağrılarını kontrol et
2. 401 → Session expired, sayfayı yenile
3. 404 → Proje ID yanlış veya silinmiş
4. 500 → Taskade API geçici sorun, 1 dk bekle

### Modül Boş Gösteriyor
1. SistemNabzı → İlgili proje sağlık durumunu kontrol et
2. Proje yeşil ama modül boş → `ensureArray()` ile data null check
3. Field values boş → Taskade projesinde custom field'lar silinmiş olabilir

### Build Hatası
1. JSX'te raw `<` veya `>` → Değişkene çıkar
2. Import eksik → Lucide icon adı kontrol et
3. Tailwind class hata → `cn()` ile koşullu class kullan

---

## 5. Monitoring

### Sağlık Göstergeleri
- **SistemNabzı sayfası:** 10 proje bağlantı durumu (yeşil/kırmızı)
- **Nightly Backup workflow:** Taskade Flows → çalışma logları
- **Agent sağlığı:** Public URL'den test mesajı gönder

### Metriklerin Yeri
- Görev tamamlama oranı → Dashboard
- Finans özet → FinanceTracker summary cards
- Backup geçmişi → BackupModule nightly list
