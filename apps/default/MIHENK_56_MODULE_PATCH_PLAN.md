# MİHENK 56 Module Patch Plan

**Generated:** 2026-06-17  
**Purpose:** Module-by-module changes needed to bring each module to its target state

---

## Priority Tiers

### TIER 1 — Already Working (verify only)
These 5 modules have full CRUD. No code changes needed, just smoke tests.

| Module | Component | Status | Action |
|--------|-----------|--------|--------|
| projeler | ProjectHub + ProjectDetail | FULL_CRUD | Smoke test only |
| gorevler | GorevlerModule | FULL_CRUD | Smoke test only |
| notlar | NotesModule | FULL_CRUD | Smoke test only |
| finans | FinanceTracker | FULL_CRUD | Smoke test only |
| katalog | CatalogModule + subs | FULL_CRUD | Smoke test only |

### TIER 2 — Partial CRUD → Full CRUD (UI wiring only)
These 4 modules have API methods but UI doesn't call update/delete yet.

#### 2.1 Fikirler (IdeasModule)
- **File:** `src/components/IdeasModule.tsx`
- **API exists:** `updateIdea()`, `deleteIdea()` ✅
- **UI change:** Add edit modal + delete button to idea cards
- **Buttons to wire:** "Düzenle" → `mihenkAPI.updateIdea(id, data)`, "Sil" → `mihenkAPI.deleteIdea(id)`

#### 2.2 Takvim (CalendarModule)
- **File:** `src/components/CalendarModule.tsx`
- **API exists:** `updateEvent()`, `deleteEvent()` ✅
- **UI change:** Add edit/delete to event detail popover
- **Buttons to wire:** "Düzenle" → `mihenkAPI.updateEvent(id, data)`, "Sil" → `mihenkAPI.deleteEvent(id)`

#### 2.3 Kişiler/CRM (CrmModule)
- **File:** `src/components/CrmModule.tsx`
- **API exists:** `updateContact()`, `deleteContact()` ✅
- **UI change:** Add edit modal + delete button to contact rows
- **Buttons to wire:** "Düzenle" → `mihenkAPI.updateContact(id, data)`, "Sil" → `mihenkAPI.deleteContact(id)`

#### 2.4 Wellness (WellnessZone)
- **File:** `src/components/WellnessZone.tsx`
- **API exists:** `updateMood()`, `deleteMood()` ✅
- **UI change:** Add edit/delete to mood history entries
- **Buttons to wire:** "Düzenle" → `mihenkAPI.updateMood(id, data)`, "Sil" → `mihenkAPI.deleteMood(id)`

### TIER 3 — Stub Getters → Real Modules (need Taskade projects)

#### 3.1 Maestro
- **New Taskade project needed:** "Maestro AI Üretim"
- **Fields:** `@mhkid, @mprompt, @mstyle, @mgenre, @mprovider, @mstatus, @mrating, @maudio_url`
- **mihenk-data.ts changes:**
  - Add `maestro` to `PROJECT_IDS`
  - Replace 5 stub getters with real `fetchProjectNodes()` calls
  - Add `createMaestroGeneration()`, `updateMaestroGeneration()`, `deleteMaestroGeneration()`
- **Component:** Rewrite MaestroModule.tsx (329 lines) to use real data
- **Bridge pending:** Audio file storage (external provider needed)

#### 3.2 YouTube
- **New Taskade project needed:** "YouTube İçerik"
- **Fields:** `@mhkid, @yurl, @ytitle, @ydesc, @ystatus, @ypublished, @yviews, @ychannel`
- **mihenk-data.ts changes:**
  - Add `youtube` to `PROJECT_IDS`
  - Replace 2 stub getters with real calls
  - Add `createYouTubeVideo()`, `updateYouTubeVideo()`, `deleteYouTubeVideo()`
- **Component:** Rewrite YouTubeModule.tsx to use real data
- **Bridge pending:** YouTube API OAuth integration for live analytics

#### 3.3 Üretimler
- **Depends on:** Maestro (#3.1)
- **No separate project needed** — reads from Maestro project
- **Component:** Wire UretimlerModule.tsx to real Maestro data

#### 3.4 Finans Hesaplar
- **New Taskade project needed:** "Finans Hesaplar"
- **Fields:** `@mhkid, @faname, @fatype, @fabalance, @facur`
- **mihenk-data.ts changes:**
  - Add `finans_hesaplar` to `PROJECT_IDS`
  - Replace `getFinanceAccounts` stub
  - Add `createFinanceAccount()`, `updateFinanceAccount()`, `deleteFinanceAccount()`

### TIER 4 — Static/Local → Taskade-backed

#### 4.1 BildirimMerkezi
- **Current:** Hardcoded `SAMPLE_NOTIFICATIONS`
- **Target:** Read-only aggregator pulling from recent activity across all modules
- **No new project needed** — aggregate from existing projects + add timestamp filtering
- **File:** Rewrite `BildirimMerkezi.tsx`

#### 4.2 TekrarlayanModule
- **Current:** Hardcoded `SAMPLE_RECURRING`
- **Option A:** New Taskade project "Tekrarlayan İşler" with cron fields
- **Option B:** Bridge pending — requires cron/scheduler service
- **Recommended:** BRIDGE_PENDING with clear label

#### 4.3 SablonlarModule
- **Current:** Hardcoded `SAMPLE_TEMPLATES`
- **Target:** Taskade project "Şablonlar" or read from existing projects
- **Option:** Could stay as static reference content (acceptable)

#### 4.4 YerImleri
- **Current:** localStorage only
- **New Taskade project needed:** "Yer İmleri / Bookmarks"
- **Fields:** `@mhkid, @burl, @btitle, @btags, @bfolder, @brating`

#### 4.5 EnerjiModu
- **Current:** Zustand store only (acceptable)
- **Target:** Could persist to Taskade but Zustand is fine for session state
- **Recommended:** Keep as LOCAL_STATE_ONLY

### TIER 5 — Placeholders → Real or Bridge Pending

Each placeholder module needs a decision: build it or mark bridge-pending.

#### CAN become READ_ONLY_AGGREGATOR (no new project needed):
- **CookbookModule** → Read from Notlar (filter by note_type)
- **OnboardingModule** → Static guide content (acceptable as-is)

#### NEED new Taskade project to activate:
| Module | Proposed Project | Key Fields |
|--------|-----------------|------------|
| DosyalarModule | N/A — BRIDGE_PENDING (needs file storage) | — |
| DerinArastirma | "Araştırmalar" | @mhkid, @rtopic, @rsources, @rfindings, @rstatus |
| KarsilastirModule | N/A — Could use Fikirler + custom view | — |
| InboxMail | N/A — BRIDGE_PENDING (needs email integration) | — |
| SozlesmelerModule | "Sözleşmeler" | @mhkid, @sparty, @stype, @sstatus, @sdate |
| FirsatlarModule | "Fırsatlar" | @mhkid, @oname, @ovalue, @ostage, @ocontact |
| KonserTur | "Konser/Etkinlik Takibi" | @mhkid, @kvenue, @kdate, @kstatus, @krevenue |

#### MUST be BRIDGE_PENDING (needs external services):
| Module | Reason |
|--------|--------|
| DosyalarModule | File storage service needed |
| InboxMail | Email provider integration |
| SesAnaliz | Audio analysis service |
| MixRoom | DAW/audio engine |
| KlipStudio | Video editing service |
| StudyomModule | Recording studio integration |
| ChartmetricModule | Chartmetric API + OAuth |
| ReleaseRadar | Distribution platform API |
| VeriKazisi | Data mining/scraping service |
| CeliskiMotoru | AI reasoning engine |
| KanitKuyrugu | AI verification pipeline |
| KapaliOda | Secure environment |
| MadenModule | Data mining infrastructure |

#### SYSTEM modules (can be activated without new projects):
| Module | Target State | How |
|--------|-------------|-----|
| AyarlarModule | LOCAL_STATE_ONLY | Zustand store for app settings |
| GuvenlikModule | LOCAL_STATE_ONLY | Security settings UI |
| ErisimModule | BRIDGE_PENDING | Needs auth/RBAC |
| PipelineModule | BRIDGE_PENDING | Needs CI/CD integration |
| OtomasyonlarModule | READ_ONLY_AGGREGATOR | Can list existing Taskade flows |
| Workforce | BRIDGE_PENDING | Needs team management |
| AjanKonseyi | READ_ONLY_AGGREGATOR | Can list existing agents |
| UygulamaAtolyesi | BRIDGE_PENDING | App builder concept |

---

## mihenk-data.ts Change Summary

### Already done (this session):
- ✅ `createEvent()`, `updateEvent()`, `deleteEvent()`
- ✅ `createContact()`, `updateContact()`, `deleteContact()`
- ✅ `createMood()`, `updateMood()`, `deleteMood()`

### Needs Codex to verify in local repo:
All above methods — Codex must confirm they exist in the local/GitHub copy of mihenk-data.ts

### Future additions (when projects are created):
- `createMaestroGeneration()`, `updateMaestroGeneration()`, `deleteMaestroGeneration()`
- `createYouTubeVideo()`, `updateYouTubeVideo()`, `deleteYouTubeVideo()`
- `createFinanceAccount()`, `updateFinanceAccount()`, `deleteFinanceAccount()`
- `createBookmark()`, `updateBookmark()`, `deleteBookmark()`

---

## UI Bridge-Pending Pattern

For all BRIDGE_PENDING modules, replace current placeholder content with:

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Construction className="w-12 h-12 text-muted-foreground/50 mb-4" />
  <h3 className="font-serif font-semibold text-lg mb-2">Bridge Pending</h3>
  <p className="text-sm text-muted-foreground max-w-md">
    Bu modül harici servis entegrasyonu bekliyor.
    Gerekli: {specific_service_needed}
  </p>
  <span className="mt-4 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-3 py-1 rounded-full">
    bridge-pending
  </span>
</div>
```
