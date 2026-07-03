# MİHENK — Portability & Exit Plan v1.0

> **Anayasa Kuralı:** MİHENK hiçbir platforma kilitlenmez.
> Taskade Faz 1'de UI, ajan ve otomasyon yüzeyidir — ama canonical değil.

## Mimari İlkeler

1. **mihenk_id canonical'dir.** Taskade task ID, Supabase row ID, Zo record ID hepsi platform referansıdır.
2. **Modül sözleşmeleri platformdan bağımsızdır.** `mihenkSchema.ts` dosyası tüm field tanımlarını, tiplerini ve ilişkilerini taşır.
3. **Her kayıt JSON olarak export edilebilir.** `MihenkExportEnvelope` formatı standart.
4. **Her olay audit trail bırakır.** Platform değişse de olay geçmişi korunur.

## Faz 1: Taskade Kullanımı

| Katman | Taskade Rolü | Canonical Karşılığı |
|--------|-------------|---------------------|
| Veri   | Taskade Projects (custom fields) | mihenkSchema.ts contracts |
| ID     | Taskade task UUID | mihenk_{module}_{ulid} |
| UI     | Genesis App (React) | /app/src/ kodları |
| Ajan   | Taskade Agents | System prompt + knowledge config |
| Otomasyon | Taskade Flows | Trigger → Action tanımları |
| Dosya  | Taskade Media (referans) | Harici storage URL |

## Taskade'den Çıkış Senaryosu

### Adım 1: Veri Export
```bash
# Her aktif modül için export JSON üret
# Format: MihenkExportEnvelope
# mihenk_id korunur, platform_ids.taskade_task_id kaydedilir
```

### Adım 2: Hedef Platforma Import
| Hedef | Yöntem |
|-------|--------|
| Supabase | JSON → SQL insert (mihenk_id = primary key) |
| Zo (MCP) | JSON → Zo record API |
| VPS/VDS | JSON → PostgreSQL/SQLite |
| Dosya sistemi | JSON dosyalar olarak sakla |

### Adım 3: UI Geçişi
- `/app/src/` altındaki React kodu **Taskade'ye bağımlı değildir**
- API katmanı (`api.ts`) değiştirilerek Supabase/Zo/custom backend'e yönlendirilir
- Tek değişiklik: `fetchNodes()` → `supabase.from('mihenk_projects').select()`

### Adım 4: Ajan Geçişi
- Taskade Agent system prompt'ları → Zo/OpenRouter/custom agent runtime
- Knowledge base → Supabase veya vektör DB'den beslenecek şekilde

### Adım 5: Otomasyon Geçişi
- Taskade Flows → Zo cron/worker, n8n, Cloudflare Workers
- Trigger/Action mantığı `mihenkSchema.ts`'deki event type'larla korunur

## ID Standardı

```
mihenk_{module}_{ulid}

Örnekler:
  mihenk_katalog_01J5K3MN8P2QRST4UV6WX7YZ
  mihenk_finans_01J5K3QR2T4UV6WX7YZ8AB9CD
  mihenk_projeler_01J5K3ST4UV6WX7YZ8AB9CDEF
```

- ULID: zaman sıralı, unique, base32
- Modül prefix: cross-module çakışma yok
- mihenk_ prefix: global namespace güvenliği

## Export JSON Formatı

```json
{
  "mihenk_version": "1.0",
  "exported_at": "2026-06-16T12:00:00.000Z",
  "source": "taskade",
  "module": "katalog",
  "record_count": 1,
  "records": [{
    "mihenk_id": "mihenk_katalog_01J5...",
    "platform_ids": {
      "taskade_task_id": "d1000001-...",
      "taskade_project_id": "yEjrmczcFwSrYQBn"
    },
    "module": "katalog",
    "data": { "title": "Fly Me", "entity_type": "artist", "genre": "Indie Pop" },
    "created_at": "2026-06-16T12:00:00.000Z",
    "updated_at": "2026-06-16T12:00:00.000Z"
  }],
  "relations": [],
  "audit_trail": []
}
```

## Audit Event Formatı

```json
{
  "event_id": "01J5K3...",
  "timestamp": "2026-06-16T12:00:00.000Z",
  "module": "katalog",
  "action": "created",
  "mihenk_id": "mihenk_katalog_01J5...",
  "actor": "user",
  "summary": "Yeni sanatçı eklendi: Fly Me",
  "platform": "taskade"
}
```

## Kontrol Listesi

- [ ] Her yeni kayıtta mihenk_id zorunlu
- [ ] Taskade task ID ayrı saklanır (platform_ids)
- [ ] Export her zaman MihenkExportEnvelope formatında
- [ ] Modül sözleşmeleri mihenkSchema.ts'de tutulur
- [ ] Yeni modül aktifleştiğinde contract eklenir
- [ ] Supabase tablo isimleri şimdiden tanımlı (futureTable)
- [ ] Relation tipleri standardize (parent_of, belongs_to, etc.)
