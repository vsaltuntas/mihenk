# Zo-First MİHENK Module Map

## Architecture Split

### Zo Owns (production runtime)
- Backend/API server
- SQLite/DuckDB data layer
- Worker/sync jobs (YouTube, provider inventory)
- Build/test/deploy pipeline
- Source of truth for all data

### Taskade/Genesis Owns (cockpit)
- Project & task organization
- Hafıza / backlog / kanıt kayıtları
- User-friendly monitoring dashboard
- Decision workspace
- Agent-assisted operations

## Module Status Table

| Module | File paths | Diff/source | Build | UI smoke | Data source | Known limits | Status |
|--------|-----------|-------------|-------|----------|-------------|-------------|--------|
| **FinanceTracker** | `src/components/FinanceTracker.tsx` (932L) | ✅ showDuplicates fix applied, diff in ZO-EXPORT-DIFFS.md | ✅ PASS (463/463 braces) | ✅ Duplicate modal now in scope | Taskade `w5EPpzmGJ3pnwZtS` via `/api/taskade/` | No multi-currency aggregation, no recurring tx | ✅ FIXED |
| **CatalogModule** | `src/components/CatalogModule.tsx` (915L), `src/components/catalog/AlbumGroup.tsx` (147L), `src/components/catalog/TrackCard.tsx` (169L) | ✅ CSV escape fix applied, diff in ZO-EXPORT-DIFFS.md | ✅ PASS (482/482 braces) | ✅ CSV export correct | Taskade `JYDvWUVTRtjtN9Hx` (tracks) + `yEjrmczcFwSrYQBn` (artists) | 131 KARARGAH tracks are plain-text, not structured. Only 10 structured tracks visible. See ZO-EXPORT-CATALOG-MIGRATION.md | ⚠️ PARTIAL |
| **WellnessZone** | `src/components/WellnessZone.tsx` (826L) | ✅ No changes needed — CSV already correct | ✅ PASS (352/352 braces) | ✅ CSV export functional | Taskade `dBt8bMYNG8aL41Fv` | No trend charting beyond basic stats | ✅ OK |

## Data Layer Files

| File | Lines | Role | Zo migration note |
|------|-------|------|-------------------|
| `src/lib/mihenk-data.ts` | 606 | All CRUD, mappers, hooks | Core file. Contains PROJECT_IDS, toFinance/toAlbumTrack/toMood mappers, write functions. Zo replaces with own API client. |
| `src/lib/api.ts` | 36 | Axios base config + PROJECT_IDS duplicate | Redundant with mihenk-data.ts. Zo can merge. |
| `src/lib/store.ts` | 182 | Zustand — module list, sidebar, theme | UI-only. Zo can reuse or replace with own state management. |

## Infra Files

| File | Lines | Role |
|------|-------|------|
| `src/App.tsx` | 190 | Module router — lazy loads 40+ modules |
| `src/main.tsx` | 431 | Entry — providers, leaflet, theme |
| `src/lib/utils.ts` | 169 | cn(), date formatters |
| `package.json` | 115 | React 18, recharts, framer-motion, zustand, axios, lucide |

## Suggested Zo File Structure

```
zo/
├── apps/
│   └── mihenk/
│       ├── src/
│       │   ├── modules/
│       │   │   ├── finance/         ← from FinanceTracker.tsx
│       │   │   ├── catalog/         ← from CatalogModule.tsx + catalog/
│       │   │   └── wellness/        ← from WellnessZone.tsx
│       │   ├── lib/
│       │   │   ├── api-client.ts    ← replaces mihenk-data.ts
│       │   │   ├── store.ts         ← from store.ts
│       │   │   └── utils.ts         ← from utils.ts
│       │   └── App.tsx
│       └── package.json
├── packages/
│   └── mihenk-core/
│       ├── db/                      ← SQLite/DuckDB schemas
│       ├── sync/                    ← worker jobs
│       └── api/                     ← backend routes
└── taskade-bridge/
    ├── sync-to-taskade.ts           ← periodic Zo → Taskade mirror
    └── read-from-taskade.ts         ← cockpit data pull
```

## Source Access

All source files remain readable at `/app/src/` in this Genesis sandbox.
Codex can read them via file_manager view commands.

File list for batch read:
1. /app/src/components/FinanceTracker.tsx (51KB)
2. /app/src/components/CatalogModule.tsx (53KB)
3. /app/src/components/WellnessZone.tsx (42KB)
4. /app/src/components/catalog/AlbumGroup.tsx (5KB)
5. /app/src/components/catalog/TrackCard.tsx (9KB)
6. /app/src/lib/mihenk-data.ts (35KB)
7. /app/src/lib/api.ts (1KB)
8. /app/src/lib/store.ts (8KB)
9. /app/src/App.tsx (7KB)
10. /app/package.json (4KB)
