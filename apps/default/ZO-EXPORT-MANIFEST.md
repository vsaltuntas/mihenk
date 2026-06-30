# MİHENK → Zo Source Export Manifest
# Generated: 2026-06-30
# Purpose: Source map + diffs + migration plan for Zo-side development

## FILE INVENTORY (read from /app/src/)

| File | Lines | Bytes | Role |
|------|-------|-------|------|
| src/components/FinanceTracker.tsx | 932 | 51704 | Finance module — gelir/gider/cüzdan/bütçe |
| src/components/CatalogModule.tsx | 915 | 53118 | Catalog module — sanatçı/track/pipeline |
| src/components/WellnessZone.tsx | 826 | 42601 | Wellness module — mood/uyku/su/alışkanlık |
| src/components/catalog/AlbumGroup.tsx | 147 | 5512 | Catalog sub — album grouping component |
| src/components/catalog/TrackCard.tsx | 169 | 8861 | Catalog sub — track card component |
| src/lib/mihenk-data.ts | 606 | 35628 | Data layer — API calls, mappers, hooks |
| src/lib/api.ts | 36 | 1183 | API config — axios base, PROJECT_IDS |
| src/lib/store.ts | 182 | 7925 | Zustand store — modules, sidebar, prefs |
| src/lib/utils.ts | 169 | — | Utility — cn(), formatters |
| src/App.tsx | 190 | 6586 | Root — module routing, layout |
| src/main.tsx | 431 | — | Entry point — providers, leaflet setup |
| package.json | 115 | 3625 | Dependencies — react, recharts, framer, etc |

## PROJECT IDS (Taskade → API mapping)

| Key | Project ID | Taskade Project |
|-----|-----------|----------------|
| gorevler | qujHhVX1pJpC2Jh4 | Projeler & Görevler |
| finans | w5EPpzmGJ3pnwZtS | Finans İşlemleri |
| notlar | Ba6qULrBj9iCmoBw | Notlar |
| kisiler | CYeN3eSk4BASymrF | Kişiler CRM |
| sanatcilar | yEjrmczcFwSrYQBn | Katalog Sanatçılar |
| albumler | JYDvWUVTRtjtN9Hx | Katalog Albüm & Track |
| takvim | FwJpuE4BjZoB7zif | Takvim Etkinlikleri |
| wellness | dBt8bMYNG8aL41Fv | Wellness & Mood |
| gamification | ZHw56T7Z3B4WymwS | Gamification State |
| fikirler | vRBUsv5XdkdYfB4q | Fikirler |
| mihenkProviderInventory | pJsnhEo6f4P6dUqT | MİHENK Provider Inventory |
| mihenkYoutubeKanallar | R55VGCjHnqfjgJza | MİHENK YouTube Kanallar |
| mihenkYoutubeVideolar | AXnusfRB19J1egMB | MİHENK YouTube Videolar |
| mihenkYoutubeGunlukMetrikler | LaizDDw2U2RSPWoG | MİHENK YouTube Günlük Metrikler |
| mihenkProviderSyncLog | FjZiQ3rpx2jKNFe8 | MİHENK Provider Sync Log |

## API PATTERN

All data flows through: `/api/taskade/projects/{projectId}/nodes`
- GET → list nodes
- POST → create node (body: { '/text': ..., '/attributes/@fieldId': ... })
- PATCH → update node
- DELETE → delete node

No auth tokens in client code. Gateway handles auth.

## ENV / SECRETS

No environment variables or secrets are embedded in client code.
API base is relative: `/api/taskade`
Agent ID (public): `01KMT63AYCHYKPGZNB12NPS9M4`

## BUILD

```
cd /app && npm run dev   # esbuild dev server
```

Dependencies in package.json — no custom build scripts beyond standard React+esbuild.
