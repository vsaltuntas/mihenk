# MİHENK Acceptance Tests

**Generated:** 2026-06-17  
**Smoke test format:** `SMOKE_DELETE_ME mihenk_{module}_{YYYYMMDD}`  
**Rule:** All test records MUST be deleted after verification

---

## Test Protocol

1. Create test record with `SMOKE_DELETE_ME` prefix
2. Read back and verify fields
3. Update a field
4. Read back and verify update
5. Delete the record
6. Verify deletion (read returns empty or record absent)

---

## TIER 1: FULL_CRUD — Must pass all 6 steps

### TEST-001: Görevler (GorevlerModule)
```
1. CREATE: mihenkAPI.createTask({ title: "SMOKE_DELETE_ME mihenk_gorev_20260617", status: "todo", priority: "medium" })
2. READ: mihenkAPI.getTasks() → find record by title
3. UPDATE: mihenkAPI.updateTask({ id: "<id>", status: "in_progress" })
4. READ: verify status changed
5. DELETE: mihenkAPI.deleteTask({ id: "<id>" })
6. READ: verify record gone
```
**Expected:** All 6 steps pass  
**Project:** qujHhVX1pJpC2Jh4

### TEST-002: Notlar (NotesModule)
```
1. CREATE: mihenkAPI.createNote({ title: "SMOKE_DELETE_ME mihenk_not_20260617", content: "Test content", folder: "kisisel" })
2. READ: mihenkAPI.getNotes() → find record
3. UPDATE: mihenkAPI.updateNote({ id: "<id>", content: "Updated content" })
4. READ: verify content changed
5. DELETE: mihenkAPI.deleteNote({ id: "<id>" })
6. READ: verify record gone
```
**Expected:** All 6 steps pass  
**Project:** Ba6qULrBj9iCmoBw

### TEST-003: Finans (FinanceTracker)
```
1. CREATE: mihenkAPI.createFinanceRecord({ description: "SMOKE_DELETE_ME mihenk_finans_20260617", amount: 99.99, type: "expense", category: "diger" })
2. READ: mihenkAPI.getFinanceRecords() → find record
3. UPDATE: mihenkAPI.updateFinanceRecord("<id>", { amount: 150 })
4. READ: verify amount changed
5. DELETE: mihenkAPI.deleteFinanceRecord("<id>")
6. READ: verify record gone
```
**Expected:** All 6 steps pass  
**Project:** w5EPpzmGJ3pnwZtS

### TEST-004: Katalog — Sanatçı
```
1. CREATE: mihenkAPI.createArtist({ name: "SMOKE_DELETE_ME mihenk_katalog_20260617", type: "solo", origin: "gercek" })
2. READ: mihenkAPI.getArtists() → find record
3. UPDATE: mihenkAPI.updateArtist("<id>", { genre: "Electronic" })
4. READ: verify genre changed
5. DELETE: mihenkAPI.deleteArtist("<id>")
6. READ: verify record gone
```
**Expected:** All 6 steps pass  
**Project:** yEjrmczcFwSrYQBn

### TEST-005: Katalog — Track
```
1. CREATE: mihenkAPI.createTrack({ title: "SMOKE_DELETE_ME mihenk_katalog_20260617", artist: "Test Artist", bpm: 120 })
2. READ: mihenkAPI.getTracks() → find record
3. UPDATE: mihenkAPI.updateTrack("<id>", { bpm: 140 })
4. READ: verify bpm changed
5. DELETE: mihenkAPI.deleteTrack("<id>")
6. READ: verify record gone
```
**Expected:** All 6 steps pass  
**Project:** JYDvWUVTRtjtN9Hx

### TEST-006: Projeler (ProjectHub)
```
1. CREATE: mihenkAPI.createTask({ title: "SMOKE_DELETE_ME mihenk_proje_20260617", status: "idea" })
   (Projects are top-level tasks in the same project)
2. READ: mihenkAPI.getProjects() → find record
3. UPDATE: mihenkAPI.updateTask({ id: "<id>", status: "in_progress" })
4. READ: verify status
5. DELETE: mihenkAPI.deleteTask({ id: "<id>" })
6. READ: verify gone
```
**Expected:** All 6 steps pass  
**Project:** qujHhVX1pJpC2Jh4

---

## TIER 2: PARTIAL_CRUD — Must pass CREATE + READ (update/delete UI pending)

### TEST-007: Fikirler (IdeasModule)
```
1. CREATE: mihenkAPI.createIdea({ title: "SMOKE_DELETE_ME mihenk_fikir_20260617", category: "teknik" })
2. READ: mihenkAPI.getIdeas() → find record
3. UPDATE: mihenkAPI.updateIdea("<id>", { status: "deger" }) — API only, no UI yet
4. DELETE: mihenkAPI.deleteIdea("<id>") — API only, no UI yet
```
**Expected:** Steps 1-2 pass from UI; steps 3-4 pass from console/API  
**Project:** vRBUsv5XdkdYfB4q

### TEST-008: Takvim (CalendarModule)
```
1. CREATE: mihenkAPI.createEvent({ title: "SMOKE_DELETE_ME mihenk_event_20260617", type: "genel" })
2. READ: mihenkAPI.getEvents() → find record
3. UPDATE: mihenkAPI.updateEvent("<id>", { location: "Test Location" }) — API only
4. DELETE: mihenkAPI.deleteEvent("<id>") — API only
```
**Expected:** Steps 1-2 pass from UI; steps 3-4 pass from console/API  
**Project:** FwJpuE4BjZoB7zif

### TEST-009: Kişiler/CRM (CrmModule)
```
1. CREATE: mihenkAPI.createContact({ name: "SMOKE_DELETE_ME mihenk_contact_20260617", email: "test@test.com" })
2. READ: mihenkAPI.getContacts() → find record
3. UPDATE: mihenkAPI.updateContact("<id>", { company: "Test Corp" }) — API only
4. DELETE: mihenkAPI.deleteContact("<id>") — API only
```
**Expected:** Steps 1-2 pass from UI; steps 3-4 pass from console/API  
**Project:** CYeN3eSk4BASymrF

### TEST-010: Wellness (WellnessZone)
```
1. CREATE: mihenkAPI.createMood({ score: 7, energy: 6, sleep_hours: 8, notes: "SMOKE_DELETE_ME mihenk_mood_20260617" })
2. READ: mihenkAPI.getMoods() → find record by notes
3. UPDATE: mihenkAPI.updateMood("<id>", { score: 9 }) — API only
4. DELETE: mihenkAPI.deleteMood("<id>") — API only
```
**Expected:** Steps 1-2 pass from UI; steps 3-4 pass from console/API  
**Project:** dBt8bMYNG8aL41Fv

---

## TIER 3: READ_ONLY_AGGREGATOR — Must verify data loads

### TEST-011: Dashboard (gun_masasi)
```
1. OPEN: Navigate to Dashboard
2. VERIFY: Shows task count, finance total, recent notes, upcoming events, mood status
3. VERIFY: No console errors
4. VERIFY: Loading skeleton shown then replaced by data
```
**Expected:** All panels show real data from Taskade projects

### TEST-012: SabahBrifingi
```
1. OPEN: Navigate to Sabah Brifingi
2. VERIFY: Shows today's tasks, financial summary, mood, ideas
3. VERIFY: Data matches what's in individual modules
```

### TEST-013: SinyallerModule
```
1. OPEN: Navigate to Sinyaller
2. VERIFY: Shows feed items from tasks, notes, ideas, events, maestro
3. VERIFY: Maestro items show empty (stub) without error
```

### TEST-014: BilgiHaritasi
```
1. OPEN: Navigate to Bilgi Haritası
2. VERIFY: Graph visualization renders with nodes from notes, ideas, projects
```

### TEST-015: SistemNabzi
```
1. OPEN: Navigate to Sistem Nabzı
2. VERIFY: Shows health status for all 9 registered projects
3. VERIFY: Export button produces valid JSON
```

### TEST-016: BackupModule
```
1. OPEN: Navigate to Backup
2. VERIFY: Manual export button works
3. VERIFY: Downloads valid mihenk-export JSON
```

### TEST-017: YasamRaporu
```
1. OPEN: Navigate to Yaşam Raporu
2. VERIFY: Shows mood trends + task completion data
```

---

## TIER 4: WRITE_ONLY_WIDGET — Must verify quick-create works

### TEST-018: HizliNot
```
1. OPEN: Quick note widget
2. CREATE: Type "SMOKE_DELETE_ME mihenk_not_quick_20260617" and submit
3. VERIFY: Toast success appears
4. VERIFY: Note appears in NotesModule
5. CLEANUP: Delete via NotesModule
```

### TEST-019: HizliGorev
```
1. OPEN: Quick task widget
2. CREATE: Type "SMOKE_DELETE_ME mihenk_gorev_quick_20260617" and submit
3. VERIFY: Toast success appears
4. VERIFY: Task appears in GorevlerModule
5. CLEANUP: Delete via GorevlerModule
```

---

## TIER 5: STUB_GETTER — Must verify graceful empty state

### TEST-020: MaestroModule
```
1. OPEN: Navigate to Maestro
2. VERIFY: Shows empty state (no crash)
3. VERIFY: No "Failed to fetch" error
4. VERIFY: Empty arrays handled gracefully
```

### TEST-021: YouTubeModule
```
1. OPEN: Navigate to YouTube
2. VERIFY: Shows empty state (no crash)
3. VERIFY: No "Failed to fetch" error
```

### TEST-022: UretimlerModule
```
1. OPEN: Navigate to Üretimler
2. VERIFY: Shows empty state (no crash)
```

---

## TIER 6: LOCAL_STATE_ONLY — Must verify state persists in session

### TEST-023: EnerjiModu
```
1. OPEN: Navigate to Enerji Modu
2. CHANGE: Switch to "Yaratıcı" mode
3. VERIFY: Mode changes in sidebar/footer
4. NAVIGATE: Go to another module and back
5. VERIFY: Mode preserved
```

### TEST-024: YerImleri
```
1. OPEN: Navigate to Yer İmleri
2. VERIFY: LocalStorage-based bookmarks display
```

---

## TIER 7: STATIC_SAMPLE — Must verify renders without error

### TEST-025: BildirimMerkezi
```
1. OPEN: Navigate to Bildirim Merkezi
2. VERIFY: Shows hardcoded sample notifications
3. VERIFY: Filter tabs work
```

### TEST-026: TekrarlayanModule
```
1. OPEN: Navigate to Tekrarlayan
2. VERIFY: Shows sample recurring items
3. VERIFY: Tab filtering works
```

### TEST-027: SablonlarModule
```
1. OPEN: Navigate to Şablonlar
2. VERIFY: Shows template categories and items
```

---

## TIER 8: PLACEHOLDER — Must not crash

### TEST-028 through TEST-051: All Placeholder Modules
For each of the 24 placeholder modules:
```
1. OPEN: Navigate to module
2. VERIFY: No crash, no "Failed to fetch"
3. VERIFY: Shows either "Çok Yakında" or bridge-pending label
4. VERIFY: No fake functional buttons
```

Modules: AjanKonseyi, AyarlarModule, CeliskiMotoru, ChartmetricModule, CookbookModule, DerinArastirma, DosyalarModule, ErisimModule, FirsatlarModule, GuvenlikModule, InboxMail, KanitKuyrugu, KapaliOda, KarsilastirModule, KlipStudio, KonserTur, LyricsLab, MadenModule, MixRoom, OnboardingModule, OtomasyonlarModule, PipelineModule, ReleaseRadar, SesAnaliz, SozlesmelerModule, StudyomModule, UygulamaAtolyesi, VeriKazisi, VerseLab, Workforce

---

## CLEANUP PROTOCOL

After all tests:
1. Search all projects for records containing "SMOKE_DELETE_ME"
2. Delete every match
3. Verify no test artifacts remain
