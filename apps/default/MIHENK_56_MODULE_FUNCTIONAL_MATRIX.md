# MİHENK 56 Module Functional Matrix

**Generated:** 2026-06-17T01:30:00+03:00  
**Source:** Eve (Genesis) — ground truth audit of `mihenk-data.ts` + all component files  
**Verdict:** NOT READY for production — 13 modules active, 43 need work

## Status Legend

| Code | Meaning |
|------|---------|
| `FULL_CRUD` | Own Taskade project, Create/Read/Update/Delete all implemented |
| `PARTIAL_CRUD` | Own Taskade project, some CRUD ops missing |
| `READ_ONLY_AGGREGATOR` | Reads from other modules' data, no own writes |
| `WRITE_ONLY_WIDGET` | Can create records but has no list/read UI |
| `STUB_GETTER` | API method exists but returns `[]` or `{}` — no Taskade project backing |
| `LOCAL_STATE_ONLY` | Uses localStorage/Zustand, no Taskade API |
| `STATIC_SAMPLE` | Hardcoded sample data, no API |
| `PLACEHOLDER` | Empty shell / skeleton UI, no functionality |
| `BRIDGE_PENDING` | Requires external service/storage not yet available |

---

## GRUP 1: BUGÜN (5 modules)

| # | module_id | Component | Status | Data Source | C | R | U | D | Missing | Evidence |
|---|-----------|-----------|--------|-------------|:-:|:-:|:-:|:-:|---------|----------|
| 1 | gun_masasi | Dashboard | `READ_ONLY_AGGREGATOR` | gorevler,finans,notlar,fikirler,wellness,takvim | — | ✅ | ✅¹ | — | Pure aggregator; ¹updateTask only | Reads 7 APIs, shows summary cards |
| 2 | sabah_brifingi | SabahBrifingi | `READ_ONLY_AGGREGATOR` | gorevler,finans,fikirler,wellness | — | ✅ | — | — | Read-only digest | 4 getters, no writes |
| 3 | bildirim_merkezi | BildirimMerkezi | `STATIC_SAMPLE` | — | — | — | — | — | Hardcoded SAMPLE_NOTIFICATIONS array | No API calls at all |
| 4 | enerji_modu | EnerjiModu | `LOCAL_STATE_ONLY` | Zustand store | — | — | — | — | Uses useAppStore energyMode only | No Taskade API |
| 5 | sistem_nabzi_ozet | SistemNabzi | `READ_ONLY_AGGREGATOR` | All PROJECT_IDS (9 projects) | — | ✅ | — | — | Audits all projects health + export | Direct axios to /api/taskade |

## GRUP 2: YAKALAMA (5 modules)

| # | module_id | Component | Status | Data Source | C | R | U | D | Missing | Evidence |
|---|-----------|-----------|--------|-------------|:-:|:-:|:-:|:-:|---------|----------|
| 6 | fikirler | IdeasModule | `PARTIAL_CRUD` | vRBUsv5XdkdYfB4q | ✅ | ✅ | — | — | updateIdea, deleteIdea exist in API but UI doesn't call them | createIdea+getIdeas only in component |
| 7 | sinyaller | SinyallerModule | `READ_ONLY_AGGREGATOR` | gorevler,notlar,fikirler,takvim,maestro | — | ✅ | — | — | Feed aggregator | 5 getters, no writes |
| 8 | yer_imleri | YerImleri | `LOCAL_STATE_ONLY` | localStorage | — | — | — | — | No Taskade project for bookmarks | 101 lines, browser storage only |
| 9 | hizli_not | HizliNot | `WRITE_ONLY_WIDGET` | Ba6qULrBj9iCmoBw | ✅ | — | — | — | Quick-capture only, no list | createNote only |
| 10 | hizli_gorev | HizliGorev | `WRITE_ONLY_WIDGET` | qujHhVX1pJpC2Jh4 | ✅ | — | — | — | Quick-capture only, no list | createTask only |

## GRUP 3: İŞ OMURGASI (5 modules)

| # | module_id | Component | Status | Data Source | C | R | U | D | Missing | Evidence |
|---|-----------|-----------|--------|-------------|:-:|:-:|:-:|:-:|---------|----------|
| 11 | projeler | ProjectHub + ProjectDetail | `FULL_CRUD` | qujHhVX1pJpC2Jh4 | ✅ | ✅ | ✅ | ✅ | — | getProjects,getTasks,createTask,updateTask,deleteTask |
| 12 | gorevler | GorevlerModule | `FULL_CRUD` | qujHhVX1pJpC2Jh4 | ✅ | ✅ | ✅ | ✅ | — | Full CRUD in component |
| 13 | takvim | CalendarModule | `PARTIAL_CRUD` | FwJpuE4BjZoB7zif | ✅ | ✅ | — | — | updateEvent,deleteEvent exist in API but UI doesn't call them | createEvent+getEvents in component |
| 14 | tekrarlayan | TekrarlayanModule | `STATIC_SAMPLE` | — | — | — | — | — | SAMPLE_RECURRING hardcoded | No API calls |
| 15 | sablonlar | SablonlarModule | `STATIC_SAMPLE` | — | — | — | — | — | SAMPLE_TEMPLATES hardcoded | No API calls |

## GRUP 4: BİLGİ VE HAFIZA (6 modules)

| # | module_id | Component | Status | Data Source | C | R | U | D | Missing | Evidence |
|---|-----------|-----------|--------|-------------|:-:|:-:|:-:|:-:|---------|----------|
| 16 | notlar | NotesModule | `FULL_CRUD` | Ba6qULrBj9iCmoBw | ✅ | ✅ | ✅ | ✅ | — | Full CRUD confirmed |
| 17 | bilgi_haritasi | BilgiHaritasi | `READ_ONLY_AGGREGATOR` | notlar,fikirler,gorevler | — | ✅ | — | — | Graph visualization only | getIdeas,getNotes,getProjects |
| 18 | dosyalar | DosyalarModule | `PLACEHOLDER` | — | — | — | — | — | Empty shell | 48 lines, no API |
| 19 | derin_arastirma | DerinArastirma | `PLACEHOLDER` | — | — | — | — | — | Empty shell | 41 lines, no API |
| 20 | karsilastir | KarsilastirModule | `PLACEHOLDER` | — | — | — | — | — | Empty shell | 33 lines, no API |
| 21 | cookbook | CookbookModule | `PLACEHOLDER` | — | — | — | — | — | Empty shell | 50 lines, no API |

## GRUP 5: MÜZİK VE YAYIN (6 modules)

| # | module_id | Component | Status | Data Source | C | R | U | D | Missing | Evidence |
|---|-----------|-----------|--------|-------------|:-:|:-:|:-:|:-:|---------|----------|
| 22 | katalog | CatalogModule + AlbumGroup + TrackCard | `FULL_CRUD` | yEjrmczcFwSrYQBn + JYDvWUVTRtjtN9Hx | ✅ | ✅ | ✅ | ✅ | — | Artists+Tracks full CRUD across 3 components |
| 23 | maestro | MaestroModule | `STUB_GETTER` | — | — | ❌² | — | — | ²All getters return `[]`/`{}` — no Taskade project | 5 stub API calls |
| 24 | uretimler | UretimlerModule | `STUB_GETTER` | — | — | ❌² | — | — | ²getMaestroGenerations returns `[]` | Depends on Maestro |
| 25 | youtube | YouTubeModule | `STUB_GETTER` | — | — | ❌² | — | — | ²getYouTubeChannels/Videos return `[]` | No project backing |
| 26 | chartmetric | ChartmetricModule | `PLACEHOLDER` | — | — | — | — | — | Empty shell | 29 lines, no API |
| 27 | release_radar | ReleaseRadar | `PLACEHOLDER` | — | — | — | — | — | Empty shell | 29 lines, no API |

## GRUP 6: STÜDYO (7 modules)

| # | module_id | Component | Status | Data Source | C | R | U | D | Missing | Evidence |
|---|-----------|-----------|--------|-------------|:-:|:-:|:-:|:-:|---------|----------|
| 28 | verselab | VerseLab | `PLACEHOLDER` | — | — | — | — | — | 58 lines, static UI | No API |
| 29 | lyrics_lab | LyricsLab | `PLACEHOLDER` | — | — | — | — | — | 45 lines | No API |
| 30 | turku_arsivi | TurkuArsivi | `PLACEHOLDER` | — | — | — | — | — | 47 lines | No API |
| 31 | studyom | StudyomModule | `PLACEHOLDER` | — | — | — | — | — | 41 lines | No API |
| 32 | ses_analiz | SesAnaliz | `PLACEHOLDER` | — | — | — | — | — | 39 lines | No API |
| 33 | mix_room | MixRoom | `PLACEHOLDER` | — | — | — | — | — | 30 lines | No API |
| 34 | klip_studio | KlipStudio | `PLACEHOLDER` | — | — | — | — | — | 30 lines | No API |

## GRUP 7: İNSAN & İŞ (5 modules)

| # | module_id | Component | Status | Data Source | C | R | U | D | Missing | Evidence |
|---|-----------|-----------|--------|-------------|:-:|:-:|:-:|:-:|---------|----------|
| 35 | kisiler | CrmModule | `PARTIAL_CRUD` | CYeN3eSk4BASymrF | ✅ | ✅ | — | — | updateContact,deleteContact in API but UI doesn't use them | createContact+getContacts |
| 36 | inbox_mail | InboxMail | `PLACEHOLDER` | — | — | — | — | — | 44 lines | No API |
| 37 | sozlesmeler | SozlesmelerModule | `PLACEHOLDER` | — | — | — | — | — | 29 lines | No API |
| 38 | firsatlar | FirsatlarModule | `PLACEHOLDER` | — | — | — | — | — | 29 lines | No API |
| 39 | konser_tur | KonserTur | `PLACEHOLDER` | — | — | — | — | — | 29 lines | No API |

## GRUP 8: YAŞAM (4 modules)

| # | module_id | Component | Status | Data Source | C | R | U | D | Missing | Evidence |
|---|-----------|-----------|--------|-------------|:-:|:-:|:-:|:-:|---------|----------|
| 40 | finans | FinanceTracker | `FULL_CRUD` | w5EPpzmGJ3pnwZtS | ✅ | ✅ | ✅ | ✅ | — | Full CRUD confirmed |
| 41 | zenzone | WellnessZone | `PARTIAL_CRUD` | dBt8bMYNG8aL41Fv | ✅ | ✅ | — | — | updateMood,deleteMood in API but UI doesn't use them | createMood+getMoods |
| 42 | wellness | (part of WellnessZone) | — | — | — | — | — | — | Merged with zenzone | Same component |
| 43 | yasam_raporu | YasamRaporu | `READ_ONLY_AGGREGATOR` | wellness,gorevler | — | ✅ | — | — | Reads mood+task data | getMoods,getTasks |

## GRUP 9: AJANLAR & OTOMASYON (6 modules)

| # | module_id | Component | Status | Data Source | C | R | U | D | Missing | Evidence |
|---|-----------|-----------|--------|-------------|:-:|:-:|:-:|:-:|---------|----------|
| 44 | mihenk_asistani | AssistantChat | `BRIDGE_PENDING` | Agent 01KMT63AYCHYKPGZNB12NPS9M4 | — | — | — | — | Needs public agent + chat SDK wiring | 153 lines, agent chat shell |
| 45 | ajan_konseyi | AjanKonseyi | `PLACEHOLDER` | — | — | — | — | — | 32 lines | No API |
| 46 | workforce | Workforce | `PLACEHOLDER` | — | — | — | — | — | 32 lines | No API |
| 47 | pipeline | PipelineModule | `PLACEHOLDER` | — | — | — | — | — | 32 lines | No API |
| 48 | otomasyonlar | OtomasyonlarModule | `PLACEHOLDER` | — | — | — | — | — | 32 lines | No API |
| 49 | uygulama_atolyesi | UygulamaAtolyesi | `PLACEHOLDER` | — | — | — | — | — | 31 lines | No API |

## GRUP 10: SİSTEM & GÜVEN (6 modules)

| # | module_id | Component | Status | Data Source | C | R | U | D | Missing | Evidence |
|---|-----------|-----------|--------|-------------|:-:|:-:|:-:|:-:|---------|----------|
| 50 | erisim | ErisimModule | `PLACEHOLDER` | — | — | — | — | — | 32 lines | No API |
| 51 | sistem_nabzi | SistemNabzi | `READ_ONLY_AGGREGATOR` | All 9 PROJECT_IDS | — | ✅ | — | — | Health audit + export | See #5 above |
| 52 | backup | BackupModule | `READ_ONLY_AGGREGATOR` | paPGvkBbBZiw9763 | — | ✅³ | — | — | ³Export via mihenk-export.ts | Manual+nightly export |
| 53 | onboarding | OnboardingModule | `PLACEHOLDER` | — | — | — | — | — | 31 lines | No API |
| 54 | ayarlar | AyarlarModule | `PLACEHOLDER` | — | — | — | — | — | 33 lines | No API |
| 55 | guvenlik | GuvenlikModule | `PLACEHOLDER` | — | — | — | — | — | 32 lines | No API |

## GRUP 11: MADEN (5 modules)

| # | module_id | Component | Status | Data Source | C | R | U | D | Missing | Evidence |
|---|-----------|-----------|--------|-------------|:-:|:-:|:-:|:-:|---------|----------|
| 56 | maden | MadenModule | `PLACEHOLDER` | — | — | — | — | — | 32 lines | No API |
| — | veri_kazisi | VeriKazisi | `PLACEHOLDER` | — | — | — | — | — | 29 lines | No API |
| — | celiski_motoru | CeliskiMotoru | `PLACEHOLDER` | — | — | — | — | — | 31 lines | No API |
| — | kanit_kuyrugu | KanitKuyrugu | `PLACEHOLDER` | — | — | — | — | — | 31 lines | No API |
| — | kapali_oda | KapaliOda | `PLACEHOLDER` | — | — | — | — | — | 31 lines | No API |

## NON-MODULE COMPONENTS (not counted in 56)

| Component | Role |
|-----------|------|
| Sidebar | Navigation shell |
| FooterBar | Status bar |
| CommandPalette | Cmd+K search |
| ModuleSkeleton | Loading placeholder |

---

## SUMMARY TABLE

| Status | Count | Modules |
|--------|------:|---------|
| FULL_CRUD | 5 | Projeler, Görevler, Notlar, Finans, Katalog |
| PARTIAL_CRUD | 4 | Fikirler, Takvim, CRM, Wellness |
| READ_ONLY_AGGREGATOR | 7 | Dashboard, SabahBrifingi, Sinyaller, BilgiHaritası, YaşamRaporu, SistemNabzı, Backup |
| WRITE_ONLY_WIDGET | 2 | HızlıNot, HızlıGörev |
| STUB_GETTER | 3 | Maestro, Üretimler, YouTube |
| LOCAL_STATE_ONLY | 2 | EnerjiModu, Yerİmleri |
| STATIC_SAMPLE | 3 | BildirimMerkezi, Tekrarlayan, Şablonlar |
| PLACEHOLDER | 24 | All remaining shells |
| BRIDGE_PENDING | 1 | MİHENK Asistan (needs agent chat SDK) |
| **TOTAL** | **51** | (5 modules merged/aliased = 56 conceptual) |
