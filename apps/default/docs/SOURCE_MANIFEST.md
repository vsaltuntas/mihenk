# MİHENK v1.0 — Source Manifest
**Generated:** 2026-06-16T20:00:00+03:00
**Total Files:** 163 (.tsx/.ts/.css)
**Total Lines:** 23,861
**Stack:** React 18 + TypeScript + Tailwind CSS 3 + esbuild
**Deploy:** https://genesis-insight-dashboard-3584.taskade.app

---

## 1. Entry Points

| File | Lines | Role |
|------|------:|------|
| `src/main.tsx` | 19 | App bootstrap, leaflet setup |
| `src/App.tsx` | 188 | Router + layout shell + module loader |
| `src/index.css` | 172 | Tailwind config + theme variables |
| `index.html` | — | HTML shell (esbuild entry) |
| `package.json` | — | Dependencies manifest |

## 2. Core Modules (V1.0 Scope)

| Module | Primary File | Lines | Sub-files | CRUD |
|--------|-------------|------:|-----------|:----:|
| Gün Masası | `Dashboard.tsx` | 214 | — | R |
| Görevler | `GorevlerModule.tsx` | 330 | — | CRUD |
| Projeler | `ProjectHub.tsx` | 166 | `projects/ProjectDetail.tsx` (238) | CRD |
| Katalog | `CatalogModule.tsx` | 889 | `catalog/AlbumGroup.tsx` (147), `catalog/TrackCard.tsx` (169) | CRUD |
| Notlar | `NotesModule.tsx` | 244 | — | CRUD |
| Finans | `FinanceTracker.tsx` | 662 | — | CRUD |
| Sinyaller | `SinyallerModule.tsx` | 119 | — | R |
| Sistem Nabzı | `SistemNabzi.tsx` | 77 | — | R |
| Backup | `BackupModule.tsx` | 97 | — | R+Export |

## 3. Data Layer

| File | Lines | Role |
|------|------:|------|
| `lib/mihenk-data.ts` | 388 | API client, CRUD ops, type defs, PROJECT_IDS |
| `lib/mihenk-export.ts` | 158 | Portable JSON export for migration |
| `lib/mihenkSchema.ts` | 364 | Field maps, transformers, validators |
| `lib/api.ts` | 39 | Base axios config |
| `lib/store.ts` | 181 | Zustand global state |

## 4. Supporting Modules (Beyond V1.0 Core)

| Module | File | Lines | Status |
|--------|------|------:|--------|
| Analytics | `AnalyticsHub.tsx` | 382 | Active |
| Calendar | `CalendarModule.tsx` | 494 | Active |
| CRM | `CrmModule.tsx` | 401 | Active |
| Wellness | `WellnessZone.tsx` | 718 | Active |
| Ideas | `IdeasModule.tsx` | 205 | Active |
| Maestro AI | `MaestroModule.tsx` | 329 | Active |
| Command | `CommandPalette.tsx` | 146 | Active |
| Hızlı Görev | `HizliGorev.tsx` | 74 | Active |
| Hızlı Not | `HizliNot.tsx` | 61 | Active |
| Sabah Brifingi | `SabahBrifingi.tsx` | 119 | Active |
| YouTube | `YouTubeModule.tsx` | 182 | Active |
| Enerji Modu | `EnerjiModu.tsx` | 92 | Active |
| Bookmark | `YerImleri.tsx` | 101 | Active |
| Şablonlar | `SablonlarModule.tsx` | 90 | Active |
| Tekrarlayan | `TekrarlayanModule.tsx` | 71 | Active |
| VerseLab | `VerseLab.tsx` | 58 | Stub |
| LyricsLab | `LyricsLab.tsx` | 45 | Stub |
| Cookbook | `CookbookModule.tsx` | 50 | Stub |
| Türkü Arşivi | `TurkuArsivi.tsx` | 47 | Stub |
| Dosyalar | `DosyalarModule.tsx` | 48 | Stub — bridge-pending |
| Stüdyo | `StudyomModule.tsx` | 41 | Stub |
| Others | ~20 stubs | ~30 ea | Placeholder |

## 5. UI Framework

| File | Lines | Role |
|------|------:|------|
| `ui/sidebar.tsx` | 726 | App sidebar system |
| `Sidebar.tsx` | 210 | MİHENK sidebar config |
| `FooterBar.tsx` | 79 | Status footer |
| `ModuleSkeleton.tsx` | 118 | Loading states |
| `ui/*.tsx` (46 files) | ~5,400 | Radix-based component library |

## 6. AI / Agent Layer

| File | Lines | Role |
|------|------:|------|
| `AssistantChat.tsx` | 153 | Floating chat widget |
| `lib/agent-chat/v2/*` | 271 | Agent chat SDK v2 |
| `lib/agent-chat/*` | 1,405 | Agent chat SDK v1 (legacy) |
| `ai-elements/*.tsx` (16) | 4,776 | AI chat UI components |
| `lib/hayatos-mcp.ts` | 384 | MCP bridge (backward compat) |

## 7. Theme & Utilities

| File | Lines | Role |
|------|------:|------|
| `lib/theme-bridge.ts` | 168 | Dark/light mode bridge |
| `lib/genesis-auth.tsx` | 49 | OIDC auth wrapper |
| `lib/genesis.tsx` | 153 | Genesis client wrapper |
| `lib/utils.ts` | 6 | cn() helper |
| `hooks/use-mobile.ts` | 19 | Mobile detection |
| `hooks/use-theme.ts` | 9 | Theme hook |

## 8. Taskade Projects (Data Storage)

| Project | ID | Custom Fields |
|---------|-----|------|
| Projeler & Görevler | `qujHhVX1pJpC2Jh4` | @gstat, @gprio, @gdue, @gdesc, @gtags, @gproj, @mhkid |
| Finans İşlemleri | `w5EPpzmGJ3pnwZtS` | @ftype, @fcat, @famt, @fcur, @fwall, @fnote, @mhkid |
| Notlar | `Ba6qULrBj9iCmoBw` | @ndftr, @ncont, @ntags, @mhkid |
| Kişiler / CRM | `CYeN3eSk4BASymrF` | @ceml, @ctel, @cfrm, @ctags, @cnote, @mhkid |
| Katalog — Sanatçılar | `yEjrmczcFwSrYQBn` | @agenr, @acntr, @alang, @abio, @mhkid |
| Katalog — Albüm & Track | `JYDvWUVTRtjtN9Hx` | @tartid, @tyear, @tgenr, @tlang, @tdur, @mhkid |
| Takvim Etkinlikleri | `FwJpuE4BjZoB7zif` | @edate, @etime, @eloc, @edesc, @etype, @mhkid |
| Wellness & Mood | `dBt8bMYNG8aL41Fv` | @wmood, @wenrg, @wslep, @wwatr, @whabi, @wtakv, @wnote |
| Gamification State | `ZHw56T7Z3B4WymwS` | @gxp, @glvl, @grnk, @gstr |
| Fikirler | `vRBUsv5XdkdYfB4q` | @icat0, @istat, @inote, @mhkid |
| Nightly Backups | `paPGvkBbBZiw9763` | @bproj, @mhkid, @bdate |

## 9. Automation Workflows

| Workflow | ID | Trigger |
|----------|-----|---------|
| Görev Tamamlandı → XP Güncelle | `01KMT6422AST3VWNT3X9QRWD99` | task.completed |
| Nightly Export Backup | `01KV8K6SZ40BA3BHNEXHTZSR3H` | scheduled 03:00 IST |

## 10. Agent

| Agent | ID | Visibility |
|-------|-----|-----------|
| HayatOS Asistan | `01KMT63AYCHYKPGZNB12NPS9M4` | Public |
| Public URL | `https://hayatos.taskade.site/a/01KMT63AZ8YZCHK8HDY2PYV4Y0` | — |
