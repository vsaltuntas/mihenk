# MİHENK v1.0 — Data Export & Migration Guide

## Export Yöntemleri

### 1. Manuel JSON Export (Anlık)
**Konum:** SistemNabzı → "JSON Export İndir"
**Format:** Tek JSON dosyası, tüm modüllerin verileri

```json
{
  "schema_version": "1.0.0",
  "exported_at": "2026-06-16T20:00:00.000Z",
  "source": "taskade-genesis",
  "modules": [
    {
      "module_id": "gorevler",
      "module_name": "Projeler & Görevler",
      "taskade_project_id": "qujHhVX1pJpC2Jh4",
      "field_map": {
        "@gstat": "status",
        "@gprio": "priority",
        "@gdue": "due_date",
        "@mhkid": "mihenk_id"
      },
      "records": [
        {
          "id": "uuid",
          "mihenk_id": "mihenk_gorev_ABC123",
          "title": "Görev başlığı",
          "parent_id": null,
          "fields": { "status": "todo", "priority": "high" }
        }
      ],
      "relations": [],
      "audit_events": []
    }
  ]
}
```

### 2. Otomatik Nightly Backup (Markdown)
**Workflow:** `01KV8K6SZ40BA3BHNEXHTZSR3H`
**Hedef:** Taskade projesi `paPGvkBbBZiw9763`
**Saat:** Her gece 03:00 İstanbul
**Format:** Okunabilir Markdown, Taskade'de doğrudan görüntülenebilir

### 3. Taskade API ile Çekme (Programatik)
```bash
# Tek proje verisi:
curl -s "https://genesis-insight-dashboard-3584.taskade.app/api/taskade/projects/qujHhVX1pJpC2Jh4/nodes" | jq .

# Tüm projeler sırayla:
for id in qujHhVX1pJpC2Jh4 w5EPpzmGJ3pnwZtS Ba6qULrBj9iCmoBw \
          CYeN3eSk4BASymrF yEjrmczcFwSrYQBn JYDvWUVTRtjtN9Hx \
          FwJpuE4BjZoB7zif dBt8bMYNG8aL41Fv ZHw56T7Z3B4WymwS \
          vRBUsv5XdkdYfB4q; do
  curl -s ".../api/taskade/projects/$id/nodes" > "${id}.json"
done
```

---

## Migration Paths

### → Supabase / PostgreSQL
1. JSON export al
2. Her `module.records` → SQL INSERT
3. `field_map` → column mapping
4. `relations` → foreign keys
5. `mihenk_id` → unique constraint

### → Local JSON Files
1. JSON export al
2. `jq '.modules[] | {(.module_id): .records}' export.json > modules/`

### → GitHub Repo
1. JSON export al
2. `git init && git add data/ && git commit`
3. CI/CD ile periyodik backup

### → Notion / Obsidian
1. Nightly Markdown backup'ları kopyala
2. Her modül → bir sayfa/dosya
3. @mhkid → internal link olarak kullanılabilir

---

## Schema Versioning

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-06-16 | Initial: 10 modules, 18 CRUD ops |

Gelecek schema değişikliklerinde `schema_version` artırılır.
Eski export'lar her zaman `schema_version` ile tanınabilir.
