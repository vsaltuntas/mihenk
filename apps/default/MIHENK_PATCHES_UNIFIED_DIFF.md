# MİHENK Patches — Unified Diff

**Generated:** 2026-06-17  
**Status:** Patch applied in Genesis (Taskade app sandbox). Codex must verify/apply to local repo.

---

## PATCH-001: Add Calendar/CRM/Wellness CRUD to mihenk-data.ts

**File:** `src/lib/mihenk-data.ts`  
**Location:** After `deleteTrack` method, before the closing `};` of `mihenkAPI`  
**Status:** ✅ Applied in Genesis sandbox  

### Insertion point:

Find this line:
```typescript
  deleteTrack: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.albumler}/nodes/${nodeId}`);
    return res.data;
  },
};
```

Replace the closing `};` with the 9 new methods + `};`. The full code block of methods is in `MIHENK_API_CONTRACT.md` under Create/Update/Delete sections for Event, Contact, and Mood.

### Verification command:
```bash
grep -c "createEvent\|createContact\|createMood\|updateEvent\|updateContact\|updateMood\|deleteEvent\|deleteContact\|deleteMood" src/lib/mihenk-data.ts
# Expected: 9 (one per method)
```

---

## PATCH-002: .env.example (new file)

```env
# MİHENK Taskade Project IDs
VITE_PROJECT_GOREVLER=qujHhVX1pJpC2Jh4
VITE_PROJECT_FINANS=w5EPpzmGJ3pnwZtS
VITE_PROJECT_NOTLAR=Ba6qULrBj9iCmoBw
VITE_PROJECT_KISILER=CYeN3eSk4BASymrF
VITE_PROJECT_SANATCILAR=yEjrmczcFwSrYQBn
VITE_PROJECT_ALBUMLER=JYDvWUVTRtjtN9Hx
VITE_PROJECT_TAKVIM=FwJpuE4BjZoB7zif
VITE_PROJECT_WELLNESS=dBt8bMYNG8aL41Fv
VITE_PROJECT_GAMIFICATION=ZHw56T7Z3B4WymwS
VITE_PROJECT_FIKIRLER=vRBUsv5XdkdYfB4q
VITE_PROJECT_BACKUP=paPGvkBbBZiw9763
# Automation Flow IDs
VITE_FLOW_XP_UPDATE=01KMT6422AST3VWNT3X9QRWD99
VITE_FLOW_NIGHTLY_BACKUP=01KV8K6SZ40BA3BHNEXHTZSR3H
# Agent ID
VITE_AGENT_ASSISTANT=01KMT63AYCHYKPGZNB12NPS9M4
```

---

## PATCH-003: Bridge-Pending UI (24 placeholder modules)

**Status:** 🔲 Codex should apply  
Replace each placeholder with:

```tsx
import { Construction } from 'lucide-react';
export default function MODULE_NAME() {
  return (
    <div className="module-transition flex flex-col items-center justify-center py-16 text-center">
      <Construction className="w-12 h-12 text-muted-foreground/50 mb-4" />
      <h3 className="font-serif font-semibold text-lg mb-2">Bridge Pending</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Bu modül {SPECIFIC_SERVICE} entegrasyonu bekliyor.
      </p>
      <span className="mt-4 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-3 py-1 rounded-full">
        bridge-pending
      </span>
    </div>
  );
}
```

---

## PATCH-004: Wire update/delete to 4 partial-CRUD modules

**Status:** 🔲 Not yet applied  
**Modules:** IdeasModule, CalendarModule, CrmModule, WellnessZone  
**Action:** Add edit modals + delete buttons calling existing API methods.

---

## Summary

| Patch | Status | Codex Action |
|-------|--------|-------------|
| PATCH-001 (mihenk-data.ts CRUD) | ✅ Genesis | Verify in local; apply diff if missing |
| PATCH-002 (.env.example) | 🔲 | Create new file |
| PATCH-003 (bridge-pending UI) | 🔲 | Apply to 24 modules |
| PATCH-004 (wire CRUD UI) | 🔲 | Wire 4 modules |
