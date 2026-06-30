/**
 * MİHENK Export — Portable JSON export for Taskade→Zo/Supabase/VPS migration
 */
import axios from 'axios';
import { PROJECT_IDS } from './mihenk-data';

const API = '/api/taskade';

interface MihenkExport {
  schema_version: string;
  exported_at: string;
  source: string;
  modules: MihenkModuleExport[];
}

interface MihenkModuleExport {
  module_id: string;
  module_name: string;
  taskade_project_id: string;
  field_map: Record<string, string>;
  records: MihenkRecord[];
  relations: MihenkRelation[];
  audit_events: MihenkAuditEvent[];
}

interface MihenkRecord {
  id: string;
  mihenk_id: string;
  title: string;
  parent_id: string | null;
  fields: Record<string, unknown>;
}

interface MihenkRelation {
  from_mihenk_id: string;
  to_mihenk_id: string;
  relation_type: string;
}

interface MihenkAuditEvent {
  type: 'exported';
  timestamp: string;
  module_id: string;
  record_count: number;
}

const MODULES: { id: string; name: string; projectId: string }[] = [
  { id: 'gorevler', name: 'Projeler & Görevler', projectId: PROJECT_IDS.gorevler },
  { id: 'finans', name: 'Finans İşlemleri', projectId: PROJECT_IDS.finans },
  { id: 'notlar', name: 'Notlar', projectId: PROJECT_IDS.notlar },
  { id: 'kisiler', name: 'Kişiler / CRM', projectId: PROJECT_IDS.kisiler },
  { id: 'sanatcilar', name: 'Katalog Sanatçılar', projectId: PROJECT_IDS.sanatcilar },
  { id: 'albumler', name: 'Katalog Albüm & Track', projectId: PROJECT_IDS.albumler },
  { id: 'takvim', name: 'Takvim Etkinlikleri', projectId: PROJECT_IDS.takvim },
  { id: 'wellness', name: 'Wellness & Mood', projectId: PROJECT_IDS.wellness },
  { id: 'gamification', name: 'Gamification State', projectId: PROJECT_IDS.gamification },
];

export async function generateMihenkExport(): Promise<MihenkExport> {
  const now = new Date().toISOString();
  const modules: MihenkModuleExport[] = [];

  for (const mod of MODULES) {
    try {
      const res = await axios.get(`${API}/projects/${mod.projectId}/nodes`);
      const nodes: any[] = res.data?.payload?.nodes ?? [];

      // Build field map from first node
      const fieldMap: Record<string, string> = {};
      if (nodes.length > 0) {
        const fv = nodes[0].fieldValues || {};
        for (const key of Object.keys(fv)) {
          if (key.startsWith('/attributes/@')) {
            const shortKey = key.replace('/attributes/', '');
            fieldMap[shortKey] = typeof fv[key];
          }
        }
      }

      const records: MihenkRecord[] = nodes.map(n => {
        const fields: Record<string, unknown> = {};
        const fv = n.fieldValues || {};
        for (const [k, v] of Object.entries(fv)) {
          if (k.startsWith('/attributes/@')) {
            fields[k.replace('/attributes/', '')] = v;
          }
        }
        return {
          id: n.id,
          mihenk_id: (fv['/attributes/@mhkid'] as string) || '',
          title: (fv['/text'] as string) || '',
          parent_id: n.parentId,
          fields,
        };
      });

      // Extract relations
      const relations: MihenkRelation[] = [];
      for (const rec of records) {
        const tartid = rec.fields['@tartid'] as string;
        if (tartid && rec.mihenk_id) {
          relations.push({
            from_mihenk_id: rec.mihenk_id,
            to_mihenk_id: tartid,
            relation_type: 'artist_of',
          });
        }
      }

      modules.push({
        module_id: mod.id,
        module_name: mod.name,
        taskade_project_id: mod.projectId,
        field_map: fieldMap,
        records,
        relations,
        audit_events: [{
          type: 'exported',
          timestamp: now,
          module_id: mod.id,
          record_count: records.length,
        }],
      });
    } catch (e) {
      modules.push({
        module_id: mod.id,
        module_name: mod.name,
        taskade_project_id: mod.projectId,
        field_map: {},
        records: [],
        relations: [],
        audit_events: [{
          type: 'exported',
          timestamp: now,
          module_id: mod.id,
          record_count: 0,
        }],
      });
    }
  }

  return {
    schema_version: '1.0.0',
    exported_at: now,
    source: 'MİHENK Personal OS / Taskade',
    modules,
  };
}

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
