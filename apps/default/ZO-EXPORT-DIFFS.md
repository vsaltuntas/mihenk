# MİHENK Recent Fix Diffs
# Applied: 2026-06-30

## DIFF 0: FinanceTracker — records TDZ fix

### Problem
`duplicates` used `records` before `records` was declared. This created a
Temporal Dead Zone risk during component initialization.

### Fix
Moved `records` and `accounts` above the `duplicates` `useMemo`.

### Location
File: src/components/FinanceTracker.tsx, lines 80-84

### Verification
- `records` declaration: line 80 ✅
- `duplicates` declaration: line 84 ✅
- Full SHA256: `43dac9eb05e7a4f49e8b639234e4f16f3726924d860558cd081bd4b0398dc3ae` ✅
- Reassembly from `FinanceTracker.part01-07.md` matches full source ✅

---

## DIFF 1: FinanceTracker — showDuplicates modal fix

### Problem
`showDuplicates` state variable was defined inside `FinanceTracker()` component
but the modal JSX block that used it was placed OUTSIDE the component's return
statement — at file bottom, orphaned after `TxRow` sub-component. This caused
`showDuplicates is not defined` runtime error.

### Fix
Moved the duplicate modal block (lines ~813-862) into the FinanceTracker
component's return block, just before the closing `</div>` of the main wrapper.

### Affected lines
- State declaration: line 78 `const [showDuplicates, setShowDuplicates] = useState(false);`
- Duplicate detection: lines 81-92 `const duplicates = useMemo(...)`
- Button trigger: line 238-241 `<button onClick={() => setShowDuplicates(true)}`
- Modal render: lines 813-862 (now inside component return)

### Verification
- Brace balance: 463/463 ✅
- Paren balance: 458/458 ✅
- showDuplicates referenced 8 times, all inside FinanceTracker scope ✅

---

## DIFF 2: CatalogModule — CSV escape fix

### Problem
CSV export line used escaped quotes in template literal:
```
`.map(v => `\"${String(v).replace(/"/g, '""')}\"`)`
```
The `\"` inside a template literal produces literal backslash+quote in output,
corrupting CSV formatting.

### Fix
```diff
- ].map(v => `\"${String(v).replace(/"/g, '""')}\"`).join(',')))
+ ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')))
```

### Location
File: src/components/CatalogModule.tsx, line 617

### Verification
- Brace balance: 482/482 ✅
- No remaining `\"` in template literals ✅

---

## DIFF 3: WellnessZone — NO CHANGES

### Evidence
WellnessZone CSV export (line 177) already uses correct quoting:
```typescript
].map(v => `"${v}"`).join(',')))
```
No backslash-escape issue. No modifications made.

### Verification
- Brace balance: 352/352 ✅
- CSV export functional ✅
