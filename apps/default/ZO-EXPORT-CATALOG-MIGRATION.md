# Catalog 131-Track Structured Migration Plan

## Current State

### Taskade Project: JYDvWUVTRtjtN9Hx (Katalog Albüm & Track)
- Total task nodes: 300
- Structured tracks (with @tart custom field): 10
- Unique artists in structured data: 5 (Fly Me, Concubanas, K.Tangözess, Tarkan, Deneme)

### KARARGAH Import Block
- Parent node: `a180a913-6980-489b-bd75-aaa2dd2053e9`
- Import timestamp: 2026-06-28T220426Z
- Declared: catalog_albums_local=11, catalog_tracks_local=131
- Contains: 11 album description nodes + child track descriptions
- Format: **PLAIN TEXT** — no custom fields populated
- Example: `"KARARGAH Album: Anonim Türküler Albümü id=calbum_...; artist_id=artist_aprl; album_type=album; status=draft; track_count=38"`

## The Problem

The `toAlbumTrack` mapper in mihenk-data.ts reads structured custom fields:
```typescript
const toAlbumTrack = (n: TaskadeNode): HayatAlbumTrack => ({
  id: n.id,
  title: text(n),
  artist: field(n, '@tart'),
  album: field(n, '@talbm'),
  pipeline: field(n, '@tpipe'),
  bpm: fieldNum(n, '@tbpm'),
  key: field(n, '@tkey'),
  genre: field(n, '@tgenr'),
  distribution: field(n, '@tdist'),
  parentId: n.parentId,
  mihenk_id: field(n, '@mhkid'),
  artist_mihenk_id: field(n, '@tartid'),
});
```

KARARGAH import nodes have NO custom fields — only `/text` with semicolon-delimited metadata.
These nodes return empty strings for all mapped fields → invisible in catalog UI.

## Required Custom Fields for Structured Tracks

| Field ID | Name | Type | Example |
|----------|------|------|---------|
| @tart | Sanatçı | string | "Fly Me" |
| @tartid | Sanatçı MİHENK ID | string | "mihenk_katalog_01JWNE5KA1FlyMe" |
| @talbm | Albüm | string | "Neon Pastoral" |
| @tpipe | Pipeline | select | tp-taslak / tp-demo / tp-hazir / tp-dagitim / tp-yayinda |
| @tbpm | BPM | number | 128 |
| @tkey | Key/Makam | string | "C Major" |
| @tgenr | Tür | string | "Indie Pop / Dream Pop" |
| @tdist | Dağıtım Platformları | string | "Spotify, Apple Music" |
| @mhkid | MİHENK ID | string | "mihenk_katalog_01JX6B01NEON" |

## Pipeline Select Options

| Option ID | Title |
|-----------|-------|
| tp-taslak | 📝 Taslak |
| tp-demo | 🎙️ Demo |
| tp-hazir | ✅ Hazır |
| tp-dagitim | 📦 Dağıtım |
| tp-yayinda | 🚀 Yayında |

## Migration Strategy for Zo/Codex

### Option A: Parse KARARGAH text → structured Taskade nodes
1. Read all child nodes under parent `a180a913...`
2. Parse semicolon-delimited text: `id=...; artist_id=...; album_type=...; status=...; track_count=...`
3. Map to custom fields (@tart, @tpipe, etc.)
4. PATCH each node via `/api/taskade/projects/JYDvWUVTRtjtN9Hx/nodes/{nodeId}`
5. Delete the KARARGAH parent wrapper after migration

### Option B: Import from Zo SQLite → Taskade (recommended)
1. Zo already has the canonical 131 tracks in SQLite `catalog_tracks_local`
2. For each track, POST to Taskade with proper custom fields
3. Link artist IDs to sanatcilar project (yEjrmczcFwSrYQBn)
4. Clean up KARARGAH plain-text import block

### Option C: Zo owns catalog, Taskade is read-only mirror
1. Zo SQLite is source of truth
2. Periodic sync writes summary/status to Taskade project
3. Genesis UI reads from Zo API, not Taskade nodes
4. Taskade project becomes operational dashboard only

## Artist Project: yEjrmczcFwSrYQBn (Katalog Sanatçılar)
- 16 artist nodes with structured custom fields
- Fields: @atype, @aorigj, @agenr, @asoni, @mhkid
- This project is correctly structured and functional

## Recommendation
Option C aligns with the new Zo-first strategy. Zo owns data,
Taskade/Genesis becomes the cockpit view.
