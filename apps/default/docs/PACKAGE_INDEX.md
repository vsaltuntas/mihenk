# MİHENK v1.0 — Copyable Package Index
**Purpose:** Codex'in local/GitHub'a taşıyabileceği referans dokümanı

---

## Package Contents

```
mihenk-v1.0/
├── docs/
│   ├── SOURCE_MANIFEST.md        # Tam dosya envanteri
│   ├── KNOWN_LIMITS.md           # Bilinen limitler + bridge-pending
│   ├── RUNBOOK.md                # Deployment, backup, troubleshooting
│   ├── DATA_EXPORT.md            # Export format + migration yolları
│   └── PACKAGE_INDEX.md          # Bu dosya
├── MIHENK_V1_CORE_FREEZE_2026-06-16.md  # Core freeze raporu
└── src/                          # Uygulama kaynak kodu (163 dosya)
```

## Critical Files (Öncelikli Kopyalanacak)

### Tier 1: Data Layer (SİSTEMİN KALBİ)
```
src/lib/mihenk-data.ts       388 lines  # API + CRUD + PROJECT_IDS + types
src/lib/mihenk-export.ts     158 lines  # Export engine
src/lib/mihenkSchema.ts      364 lines  # Schema + field maps
src/lib/store.ts             181 lines  # Global state
src/lib/api.ts                39 lines  # Axios config
```

### Tier 2: Core Modules (KULLANICI ARAYÜZÜ)
```
src/App.tsx                  188 lines  # Router
src/components/Dashboard.tsx  214 lines  # Gün Masası
src/components/GorevlerModule.tsx  330 lines  # Görevler
src/components/ProjectHub.tsx      166 lines  # Projeler
src/components/projects/ProjectDetail.tsx  238 lines
src/components/CatalogModule.tsx   889 lines  # Katalog
src/components/catalog/AlbumGroup.tsx  147 lines
src/components/catalog/TrackCard.tsx   169 lines
src/components/NotesModule.tsx     244 lines  # Notlar
src/components/FinanceTracker.tsx  662 lines  # Finans
src/components/SinyallerModule.tsx 119 lines  # Sinyaller
src/components/SistemNabzi.tsx      77 lines  # Sistem
src/components/BackupModule.tsx     97 lines  # Backup
src/components/Sidebar.tsx         210 lines  # Navigasyon
```

### Tier 3: Theme & Config
```
src/index.css                172 lines  # Tailwind + theme
src/main.tsx                  19 lines  # Bootstrap
src/lib/theme-bridge.ts     168 lines  # Dark/light
src/lib/utils.ts               6 lines  # cn()
```

### Tier 4: Supporting (Gerektiğinde Kopyala)
```
src/components/ui/*.tsx              46 files  # Radix UI library
src/components/ai-elements/*.tsx     16 files  # AI chat elements
src/lib/agent-chat/v2/*               3 files  # Agent SDK
src/components/{other modules}      ~40 files  # Active + stub modules
```

## Taskade Configuration (Kod Dışı)

Bu öğeler Taskade platformunda yaşar, source code'da değil:

| Resource | ID | Type |
|----------|-----|------|
| Space | `t9rg9ursyzgycpap` | Workspace |
| Agent | `01KMT63AYCHYKPGZNB12NPS9M4` | AI Agent |
| XP Workflow | `01KMT6422AST3VWNT3X9QRWD99` | Automation |
| Nightly Workflow | `01KV8K6SZ40BA3BHNEXHTZSR3H` | Automation |
| 11 Projects | See SOURCE_MANIFEST §8 | Data Storage |

## Replication Steps

1. **GitHub repo oluştur:** `mihenk-v1.0`
2. **docs/ kopyala:** Bu 5 dokümanı repo'ya ekle
3. **Tier 1 dosyaları kopyala:** Data layer — en kritik
4. **Tier 2 dosyaları kopyala:** Core modules
5. **package.json kopyala:** Dependency listesi
6. **JSON data export al:** SistemNabzı → Export
7. **Commit & push**

## Checksum (Integrity Verification)

| Metric | Value |
|--------|-------|
| Total source files | 163 |
| Total source lines | 23,861 |
| Core module files | 14 |
| Core module lines | 3,277 |
| Data layer files | 5 |
| Data layer lines | 1,130 |
| CRUD methods | 18 |
| @mhkid gen points | 25 |
| Taskade projects | 11 |
| Automation workflows | 2 |
| Agents | 1 |
