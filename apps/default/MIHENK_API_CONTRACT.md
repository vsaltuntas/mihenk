# MİHENK API Contract

**Generated:** 2026-06-17  
**Source:** Eve — audited from `/app/src/lib/mihenk-data.ts`  
**Base URL:** `/api/taskade`

---

## Getter Methods

### `getProjects(): Promise<HayatProject[]>`
- **Endpoint:** `GET /projects/qujHhVX1pJpC2Jh4/nodes`
- **Filter:** `parentId === null` (top-level only)
- **Transform:** `toProject()`
- **Used by:** Dashboard, ProjectHub, SabahBrifingi, BilgiHaritasi, GorevlerModule
- **Error:** Returns `[]` on failure (catch in fetchProjectNodes)

### `getTasks(): Promise<HayatTask[]>`
- **Endpoint:** `GET /projects/qujHhVX1pJpC2Jh4/nodes`
- **Filter:** All nodes (including children)
- **Transform:** `toTask()`
- **Used by:** Dashboard, GorevlerModule, ProjectDetail, SabahBrifingi, SinyallerModule, YasamRaporu
- **Error:** Returns `[]`

### `getFinanceRecords(): Promise<HayatFinanceRecord[]>`
- **Endpoint:** `GET /projects/w5EPpzmGJ3pnwZtS/nodes`
- **Transform:** `toFinance()`
- **Used by:** FinanceTracker, Dashboard, SabahBrifingi
- **Error:** Returns `[]`

### `getNotes(): Promise<HayatNote[]>`
- **Endpoint:** `GET /projects/Ba6qULrBj9iCmoBw/nodes`
- **Transform:** `toNote()`
- **Used by:** NotesModule, Dashboard, SinyallerModule, BilgiHaritasi
- **Error:** Returns `[]`

### `getContacts(): Promise<HayatContact[]>`
- **Endpoint:** `GET /projects/CYeN3eSk4BASymrF/nodes`
- **Transform:** `toContact()`
- **Used by:** CrmModule, AnalyticsHub
- **Error:** Returns `[]`

### `getArtists(): Promise<HayatArtist[]>`
- **Endpoint:** `GET /projects/yEjrmczcFwSrYQBn/nodes`
- **Transform:** `toArtist()`
- **Used by:** CatalogModule, AnalyticsHub
- **Error:** Returns `[]`

### `getAlbumTracks(): Promise<HayatAlbumTrack[]>`
- **Endpoint:** `GET /projects/JYDvWUVTRtjtN9Hx/nodes`
- **Transform:** `toAlbumTrack()`
- **Used by:** CatalogModule
- **Error:** Returns `[]`

### `getTracks(): Promise<HayatAlbumTrack[]>`
- **Alias:** Same as `getAlbumTracks()`
- **Used by:** CatalogModule, AnalyticsHub

### `getAlbums(): Promise<HayatAlbumTrack[]>`
- **Endpoint:** `GET /projects/JYDvWUVTRtjtN9Hx/nodes`
- **Filter:** `parentId === null`
- **Used by:** CatalogModule

### `getEvents(): Promise<HayatEvent[]>`
- **Endpoint:** `GET /projects/FwJpuE4BjZoB7zif/nodes`
- **Transform:** `toEvent()`
- **Used by:** CalendarModule, Dashboard, SinyallerModule
- **Error:** Returns `[]`

### `getMoods(): Promise<HayatMood[]>`
- **Endpoint:** `GET /projects/dBt8bMYNG8aL41Fv/nodes`
- **Transform:** `toMood()`
- **Used by:** WellnessZone, Dashboard, SabahBrifingi, YasamRaporu
- **Error:** Returns `[]`

### `getGamification(): Promise<HayatGamification>`
- **Endpoint:** `GET /projects/ZHw56T7Z3B4WymwS/nodes`
- **Transform:** First node → `{ xp, level, rank, streak }`
- **Fallback:** `{ xp: 0, level: 1, rank: 'Çırak', streak: 0 }`
- **Used by:** Dashboard, AnalyticsHub

### `getIdeas(): Promise<HayatIdea[]>`
- **Endpoint:** `GET /projects/vRBUsv5XdkdYfB4q/nodes`
- **Transform:** `toIdea()`
- **Used by:** IdeasModule, Dashboard, SabahBrifingi, SinyallerModule, BilgiHaritasi
- **Error:** Returns `[]`

### `getFinanceAccounts(): Promise<any[]>`
- **Status:** STUB — returns `[]`
- **Used by:** FinanceTracker, AnalyticsHub
- **Action needed:** Create Taskade project or remove from UI

### `getYouTubeChannels(): Promise<any[]>`
- **Status:** STUB — returns `[]`
- **Used by:** YouTubeModule, AnalyticsHub

### `getYouTubeVideos(): Promise<any[]>`
- **Status:** STUB — returns `[]`
- **Used by:** YouTubeModule, AnalyticsHub

### `getMaestroProjects(): Promise<any[]>`
- **Status:** STUB — returns `[]`
- **Used by:** MaestroModule

### `getMaestroPrompts(): Promise<any[]>`
- **Status:** STUB — returns `[]`
- **Used by:** MaestroModule

### `getMaestroAnalyses(): Promise<any[]>`
- **Status:** STUB — returns `[]`
- **Used by:** MaestroModule

### `getMaestroGenerations(): Promise<any[]>`
- **Status:** STUB — returns `[]`
- **Used by:** MaestroModule, UretimlerModule, SinyallerModule

### `getMaestroDashboard(): Promise<any>`
- **Status:** STUB — returns `{}`
- **Used by:** MaestroModule

---

## Create Methods

### `createNote(data): Promise<any>`
- **Input:** `{ title: string, content?: string, folder?: string, tags?: string, note_type?: string }`
- **Endpoint:** `POST /projects/Ba6qULrBj9iCmoBw/nodes`
- **ID format:** `mihenk_not_{base36_timestamp}`
- **Used by:** NotesModule, HizliNot

### `createFinanceRecord(data): Promise<any>`
- **Input:** `{ description: string, amount: number, type?: string, category?: string, currency?: string, wallet?: string }`
- **Endpoint:** `POST /projects/w5EPpzmGJ3pnwZtS/nodes`
- **ID format:** `mihenk_finans_{base36_timestamp}`
- **Used by:** FinanceTracker

### `createTask(data): Promise<any>`
- **Input:** `{ title: string, status?: string, priority?: string, description?: string, tags?: string, parentId?: string }`
- **Endpoint:** `POST /projects/qujHhVX1pJpC2Jh4/nodes`
- **ID format:** `mihenk_gorev_{base36_timestamp}`
- **Used by:** GorevlerModule, ProjectDetail, HizliGorev

### `createIdea(data): Promise<any>`
- **Input:** `{ title: string, category?: string, description?: string }`
- **Endpoint:** `POST /projects/vRBUsv5XdkdYfB4q/nodes`
- **ID format:** `mihenk_fikir_{base36_timestamp}`
- **Used by:** IdeasModule

### `createArtist(data): Promise<any>`
- **Input:** `{ name: string, type?: string, origin?: string, genre?: string, sonic_dna?: string, bio?: string }`
- **Endpoint:** `POST /projects/yEjrmczcFwSrYQBn/nodes`
- **ID format:** `mihenk_katalog_{base36_timestamp}`
- **Used by:** CatalogModule

### `createTrack(data): Promise<any>`
- **Input:** `{ title: string, artist: string, artistMhkid?: string, album?: string, genre?: string, bpm?: number, key?: string, pipeline?: string, distribution?: string, parentId?: string }`
- **Endpoint:** `POST /projects/JYDvWUVTRtjtN9Hx/nodes`
- **ID format:** `mihenk_katalog_{base36_timestamp}`
- **Used by:** CatalogModule

### `createEvent(data): Promise<any>`
- **Input:** `{ title: string, type?: string, description?: string, location?: string, start_time?: string }`
- **Endpoint:** `POST /projects/FwJpuE4BjZoB7zif/nodes`
- **ID format:** `mihenk_event_{base36_timestamp}`
- **Used by:** CalendarModule

### `createContact(data): Promise<any>`
- **Input:** `{ name: string, email?: string, phone?: string, company?: string, role?: string, relationship_type?: string, notes?: string }`
- **Endpoint:** `POST /projects/CYeN3eSk4BASymrF/nodes`
- **ID format:** `mihenk_contact_{base36_timestamp}`
- **Used by:** CrmModule

### `createMood(data): Promise<any>`
- **Input:** `{ score?: number, energy?: number, sleep_hours?: number, water?: number, habits?: string, supplements?: string, notes?: string }`
- **Endpoint:** `POST /projects/dBt8bMYNG8aL41Fv/nodes`
- **Text:** `Check-in {today_tr}`
- **Used by:** WellnessZone

---

## Update Methods

### `updateNote(data): Promise<any>`
- **Input:** `{ id: string, title?: string, content?: string, folder?: string, tags?: string, note_type?: string, pinned?: boolean }`
- **Endpoint:** `PATCH /projects/Ba6qULrBj9iCmoBw/nodes/{id}`
- **Used by:** NotesModule

### `updateFinanceRecord(nodeId, data): Promise<any>`
- **Input:** `nodeId: string, data: { description?, type?, category?, amount?, currency?, wallet? }`
- **Endpoint:** `PATCH /projects/w5EPpzmGJ3pnwZtS/nodes/{nodeId}`
- **Used by:** FinanceTracker

### `updateTask(data): Promise<any>`
- **Input:** `{ id: string, title?: string, status?: string, priority?: string, description?: string, tags?: string }`
- **Endpoint:** `PATCH /projects/qujHhVX1pJpC2Jh4/nodes/{id}`
- **Used by:** GorevlerModule, ProjectDetail, Dashboard

### `updateIdea(nodeId, data): Promise<any>`
- **Input:** `nodeId: string, data: { title?, category?, status?, description? }`
- **Endpoint:** `PATCH /projects/vRBUsv5XdkdYfB4q/nodes/{nodeId}`
- **Used by:** (API exists, no UI caller yet)

### `updateArtist(nodeId, data): Promise<any>`
- **Input:** `nodeId: string, data: { name?, type?, origin?, genre?, sonic_dna?, bio? }`
- **Endpoint:** `PATCH /projects/yEjrmczcFwSrYQBn/nodes/{nodeId}`
- **Used by:** CatalogModule

### `updateTrack(nodeId, data): Promise<any>`
- **Input:** `nodeId: string, data: { title?, artist?, artistMhkid?, album?, genre?, bpm?, key?, pipeline?, distribution? }`
- **Endpoint:** `PATCH /projects/JYDvWUVTRtjtN9Hx/nodes/{nodeId}`
- **Used by:** TrackCard

### `updateEvent(nodeId, data): Promise<any>`
- **Input:** `nodeId: string, data: { title?, type?, location?, description? }`
- **Endpoint:** `PATCH /projects/FwJpuE4BjZoB7zif/nodes/{nodeId}`
- **Used by:** (API exists, no UI caller yet)

### `updateContact(nodeId, data): Promise<any>`
- **Input:** `nodeId: string, data: { name?, email?, phone?, company?, role?, notes? }`
- **Endpoint:** `PATCH /projects/CYeN3eSk4BASymrF/nodes/{nodeId}`
- **Used by:** (API exists, no UI caller yet)

### `updateMood(nodeId, data): Promise<any>`
- **Input:** `nodeId: string, data: { score?, energy?, sleep_hours?, water?, notes? }`
- **Endpoint:** `PATCH /projects/dBt8bMYNG8aL41Fv/nodes/{nodeId}`
- **Used by:** (API exists, no UI caller yet)

---

## Delete Methods

### `deleteNote(data): Promise<any>`
- **Input:** `{ id: string }`
- **Endpoint:** `DELETE /projects/Ba6qULrBj9iCmoBw/nodes/{id}`
- **Used by:** NotesModule

### `deleteFinanceRecord(nodeId): Promise<any>`
- **Endpoint:** `DELETE /projects/w5EPpzmGJ3pnwZtS/nodes/{nodeId}`
- **Used by:** FinanceTracker

### `deleteTask(data): Promise<any>`
- **Input:** `{ id: string }`
- **Endpoint:** `DELETE /projects/qujHhVX1pJpC2Jh4/nodes/{id}`
- **Used by:** GorevlerModule, ProjectDetail

### `deleteIdea(nodeId): Promise<any>`
- **Endpoint:** `DELETE /projects/vRBUsv5XdkdYfB4q/nodes/{nodeId}`
- **Used by:** (API exists, no UI caller yet)

### `deleteArtist(nodeId): Promise<any>`
- **Endpoint:** `DELETE /projects/yEjrmczcFwSrYQBn/nodes/{nodeId}`
- **Used by:** CatalogModule

### `deleteTrack(nodeId): Promise<any>`
- **Endpoint:** `DELETE /projects/JYDvWUVTRtjtN9Hx/nodes/{nodeId}`
- **Used by:** TrackCard

### `deleteEvent(nodeId): Promise<any>`
- **Endpoint:** `DELETE /projects/FwJpuE4BjZoB7zif/nodes/{nodeId}`
- **Used by:** (API exists, no UI caller yet)

### `deleteContact(nodeId): Promise<any>`
- **Endpoint:** `DELETE /projects/CYeN3eSk4BASymrF/nodes/{nodeId}`
- **Used by:** (API exists, no UI caller yet)

### `deleteMood(nodeId): Promise<any>`
- **Endpoint:** `DELETE /projects/dBt8bMYNG8aL41Fv/nodes/{nodeId}`
- **Used by:** (API exists, no UI caller yet)

---

## Utility Exports

### `useMihenkData<T>(fetcher, deps): { data, loading, error, refetch }`
- React hook for data fetching with loading/error states
- **Alias:** `useHayatosData`

### `ensureArray<T>(val): T[]`
- Safely converts nullable/unknown to array

### `hayatosAPI`
- **Alias:** Same as `mihenkAPI` (backward compat)

### `PROJECT_IDS`
- Exported constant with all 10 project IDs

---

## Error Handling Pattern

All methods follow:
1. `fetchProjectNodes()` catches errors and returns `[]`
2. Write methods (create/update/delete) throw on failure — callers must try/catch
3. UI components show `toast.error()` on write failures
