/**
 * MİHENK Data Layer — Taskade API Bridge
 * Direct Taskade project API calls for MİHENK Personal OS
 */
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = '/api/taskade';

export const PROJECT_IDS = {
  gorevler: 'qujHhVX1pJpC2Jh4',
  finans: 'w5EPpzmGJ3pnwZtS',
  notlar: 'Ba6qULrBj9iCmoBw',
  kisiler: 'CYeN3eSk4BASymrF',
  sanatcilar: 'yEjrmczcFwSrYQBn',
  albumler: 'JYDvWUVTRtjtN9Hx',
  takvim: 'FwJpuE4BjZoB7zif',
  wellness: 'dBt8bMYNG8aL41Fv',
  gamification: 'ZHw56T7Z3B4WymwS',
  fikirler: 'vRBUsv5XdkdYfB4q',
  // MİHENK Snapshot Projects — Zo/Karargah Bridge
  mihenkProviderInventory: 'pJsnhEo6f4P6dUqT',
  mihenkYoutubeKanallar: 'R55VGCjHnqfjgJza',
  mihenkYoutubeVideolar: 'AXnusfRB19J1egMB',
  mihenkYoutubeGunlukMetrikler: 'LaizDDw2U2RSPWoG',
  mihenkProviderSyncLog: 'FjZiQ3rpx2jKNFe8',
} as const;

interface TaskadeNode {
  id: string;
  parentId: string | null;
  fieldValues: Record<string, unknown>;
}

async function fetchProjectNodes(projectId: string): Promise<TaskadeNode[]> {
  try {
    const res = await axios.get(`${API_BASE}/projects/${projectId}/nodes`);
    return res.data?.payload?.nodes ?? [];
  } catch (e) {
    console.warn(`[MİHENK] Failed to fetch ${projectId}:`, e);
    return [];
  }
}

function field(node: TaskadeNode, key: string): string {
  return (node.fieldValues?.[`/attributes/${key}`] as string) ?? '';
}
function fieldNum(node: TaskadeNode, key: string): number {
  const v = node.fieldValues?.[`/attributes/${key}`];
  return typeof v === 'number' ? v : 0;
}
function text(node: TaskadeNode): string {
  return (node.fieldValues?.['/text'] as string) ?? '';
}

/* ─── Types ─── */
export interface HayatTask {
  id: string; title: string; status: string; priority: string;
  due_date?: string | null; project_id?: string | null;
  description?: string; tags?: string; created_at: string; mihenk_id: string;
}
export interface HayatProject {
  id: string; name: string; status: string; progress: number;
  channel_id: string; description: string; deadline: string | null;
  tags: string; created_at: string; mihenk_id: string;
}
export interface HayatFinanceRecord {
  id: string; type: string; category: string; amount: number;
  currency: string; wallet: string; description: string;
  created_at: string; mihenk_id: string;
}
export interface HayatNote {
  id: string; title: string; content: string; notebook: string;
  note_type: string; tags?: string; created_at: string; mihenk_id: string;
}
export interface HayatContact {
  id: string; name: string; email?: string; phone?: string;
  company?: string; role?: string; contact_type: string;
  notes?: string; created_at: string; mihenk_id: string;
}
export interface HayatArtist {
  id: string; name: string; artist_type: string; origin: string;
  genre?: string; bio?: string; sonic_dna?: string;
  created_at: string; mihenk_id: string;
}
export interface HayatAlbumTrack {
  id: string; title: string; artist: string; album: string;
  pipeline: string; bpm: number; key: string; genre: string;
  distribution: string; parentId: string | null; mihenk_id: string;
  artist_mihenk_id: string;
}
export interface HayatEvent {
  id: string; title: string; event_type: string; location: string;
  notes: string; start_date: string; created_at: string; mihenk_id: string;
}
export interface HayatMood {
  id: string; mood_score: number; energy_level: number;
  sleep_hours: number; water: number; habits: string;
  supplements: string; notes: string; created_at: string;
}
export interface HayatGamification {
  xp: number; level: number; rank: string; streak: number;
}
export interface HayatIdea {
  id: string; title: string; category: string; status: string;
  priority: string; description: string; created_at: string; mihenk_id: string;
}

/* ─── MIHENK YouTube / Snapshot Types ─── */
export interface MIHENKProviderRecord {
  id: string; status: string; source: string; endpoints: string[];
  counts: Record<string, unknown>; mihenkTargets: string[]; nextFix: string;
}
export interface MIHENKYoutubeChannel {
  channel_id: string; title: string; handle: string;
  subscribers: number; total_views: number; declared_video_count: number;
  in_data_api: boolean; in_analytics_api: boolean;
  snapshot_date: string; views_window: number | null;
  revenue_window: number | null; net_subs_window: number | null;
  avg_cpm: number | null; last_analytics_date: string | null;
  day_count: number | null;
}
export interface MIHENKBatchManifest {
  provider: string; bridge_endpoint: string; payload_path: string;
  batch: number; record_count: number; sha16: string;
  includes_revenue?: boolean; status: string; note: string;
}
export interface MIHENKSyncLogRecord {
  status: string; freshness: { stale: boolean; last_analytics_date: string; last_video_fetch_at: string; rule: string };
  summary: { channel_count: number; video_count: number; daily_row_count: number; analytics_channel_count: number; first_analytics_date: string; last_analytics_date: string; last_video_fetch_at: string; revenue_sum: number; analytics_views_sum: number; total_subscribers: number; total_channel_views: number };
  counts: { channels: number; videos: number; daily: number };
  source: string; note: string;
}

function parseInlineJSON(textVal: string): Record<string, unknown> | null {
  try { return JSON.parse(textVal.trim()); } catch { return null; }
}
const STATUS: Record<string, string> = { 'stat-fikir': 'idea', 'stat-plan': 'todo', 'stat-uret': 'in_progress', 'stat-yayin': 'done', 'stat-arsiv': 'archived' };
const PRIO: Record<string, string> = { 'pr-acil': 'urgent', 'pr-yuksek': 'high', 'pr-normal': 'medium', 'pr-dusuk': 'low' };
const CHAN: Record<string, string> = { 'ch-nikbin': 'Nikbinler', 'ch-analab': 'Anatolian Lab', 'ch-person': 'Personal', 'ch-other': 'Other' };
const FTYP: Record<string, string> = { 'ft-gelir': 'income', 'ft-gider': 'expense', 'ft-trans': 'transfer' };
const FCAT: Record<string, string> = { 'fc-yemek': 'Yemek', 'fc-ulasim': 'Ulaşım', 'fc-kira': 'Kira', 'fc-fatura': 'Fatura', 'fc-saglik': 'Sağlık', 'fc-eglence': 'Eğlence', 'fc-maas': 'Maaş', 'fc-freelance': 'Freelance', 'fc-youtube': 'YouTube', 'fc-muzik': 'Müzik', 'fc-alisveris': 'Alışveriş', 'fc-egitim': 'Eğitim', 'fc-abone': 'Abonelik', 'fc-tasarruf': 'Tasarruf', 'fc-diger': 'Diğer' };
const FCUR: Record<string, string> = { 'cur-try': 'TRY', 'cur-usd': 'USD', 'cur-eur': 'EUR' };
const FWAL: Record<string, string> = { 'w-tombank': 'TomBank', 'w-adsense': 'YouTube AdSense', 'w-ziraat': 'Ziraat', 'w-isbank': 'İş Bankası', 'w-wise': 'Wise' };
const ICAT: Record<string, string> = { 'ic-muzik': 'Müzik', 'ic-icerik': 'İçerik', 'ic-urun': 'Ürün', 'ic-is': 'İş', 'ic-kisisel': 'Kişisel', 'ic-teknik': 'Teknik', 'ic-diger': 'Diğer' };
const ISTAT: Record<string, string> = { 'is-yeni': 'Yeni', 'is-deger': 'Değerlendirmede', 'is-plan': 'Planlandı', 'is-aktif': 'Aktif', 'is-arsiv': 'Arşiv' };
const now = () => new Date().toISOString();

/* ─── Transformers ─── */
const toTask = (n: TaskadeNode): HayatTask => ({ id: n.id, title: text(n), status: STATUS[field(n, '@statu')] ?? 'todo', priority: PRIO[field(n, '@prior')] ?? 'medium', project_id: null, description: field(n, '@notla'), tags: field(n, '@kategori'), due_date: null, created_at: now(), mihenk_id: field(n, '@mhkid') });
const toProject = (n: TaskadeNode): HayatProject => ({ id: n.id, name: text(n), status: STATUS[field(n, '@statu')] ?? 'active', progress: 0, channel_id: CHAN[field(n, '@kanal')] ?? '', description: field(n, '@notla'), deadline: null, tags: field(n, '@kategori'), created_at: now(), mihenk_id: field(n, '@mhkid') });
const toFinance = (n: TaskadeNode): HayatFinanceRecord => ({ id: n.id, type: FTYP[field(n, '@ftype')] ?? 'expense', category: FCAT[field(n, '@fcat')] ?? 'Diğer', amount: fieldNum(n, '@famt'), currency: FCUR[field(n, '@fcur')] ?? 'TRY', wallet: FWAL[field(n, '@fwall')] ?? '', description: field(n, '@fnote'), created_at: now(), mihenk_id: field(n, '@mhkid') });
const toNote = (n: TaskadeNode): HayatNote => ({ id: n.id, title: text(n), content: field(n, '@ncont'), notebook: field(n, '@ndeft'), note_type: field(n, '@ntype'), tags: field(n, '@ntags'), created_at: now(), mihenk_id: field(n, '@mhkid') });
const toContact = (n: TaskadeNode): HayatContact => ({ id: n.id, name: text(n), email: field(n, '@cemail') || undefined, phone: field(n, '@cphone') || undefined, company: field(n, '@ccomp') || undefined, role: field(n, '@crole') || undefined, contact_type: field(n, '@ctype'), notes: field(n, '@cnote') || undefined, created_at: now(), mihenk_id: field(n, '@mhkid') });
const toArtist = (n: TaskadeNode): HayatArtist => ({ id: n.id, name: text(n), artist_type: field(n, '@atype'), origin: field(n, '@aorigj'), genre: field(n, '@agenr') || undefined, bio: field(n, '@abio') || undefined, sonic_dna: field(n, '@asonc') || undefined, created_at: now(), mihenk_id: field(n, '@mhkid') });
const toAlbumTrack = (n: TaskadeNode): HayatAlbumTrack => ({ id: n.id, title: text(n), artist: field(n, '@tart'), album: field(n, '@talbm'), pipeline: field(n, '@tpipe'), bpm: fieldNum(n, '@tbpm'), key: field(n, '@tkey'), genre: field(n, '@tgenr'), distribution: field(n, '@tdist'), parentId: n.parentId, mihenk_id: field(n, '@mhkid'), artist_mihenk_id: field(n, '@tartid') });
const toEvent = (n: TaskadeNode): HayatEvent => ({ id: n.id, title: text(n), event_type: field(n, '@etype'), location: field(n, '@eloc'), notes: field(n, '@enote'), start_date: field(n, '@edate') || now().slice(0, 10), created_at: now(), mihenk_id: field(n, '@mhkid') });
const toMood = (n: TaskadeNode): HayatMood => ({ id: n.id, mood_score: fieldNum(n, '@wmood'), energy_level: fieldNum(n, '@wenrg'), sleep_hours: fieldNum(n, '@wslep'), water: fieldNum(n, '@wwatr'), habits: field(n, '@whabi'), supplements: field(n, '@wtakv'), notes: field(n, '@wnote'), created_at: now() });
const IPRIO: Record<string, string> = { 'ip-high': 'high', 'ip-medium': 'medium', 'ip-low': 'low' };
const toIdea = (n: TaskadeNode): HayatIdea => ({ id: n.id, title: text(n), category: ICAT[field(n, '@icat0')] ?? 'Diğer', status: ISTAT[field(n, '@istat')] ?? 'Yeni', priority: IPRIO[field(n, '@iprio')] ?? 'medium', description: field(n, '@inote'), created_at: now(), mihenk_id: field(n, '@mhkid') });

/* ─── Public API ─── */
export const mihenkAPI = {
  getProjects: async () => { const ns = await fetchProjectNodes(PROJECT_IDS.gorevler); return ns.filter(n => n.parentId === null).map(toProject); },
  getTasks: async () => { const ns = await fetchProjectNodes(PROJECT_IDS.gorevler); return ns.map(toTask); },
  getFinanceRecords: async () => (await fetchProjectNodes(PROJECT_IDS.finans)).map(toFinance),
  getNotes: async () => (await fetchProjectNodes(PROJECT_IDS.notlar)).map(toNote),
  getContacts: async () => (await fetchProjectNodes(PROJECT_IDS.kisiler)).map(toContact),
  getArtists: async () => (await fetchProjectNodes(PROJECT_IDS.sanatcilar)).map(toArtist),
  getAlbumTracks: async () => (await fetchProjectNodes(PROJECT_IDS.albumler)).map(toAlbumTrack),
  getEvents: async () => (await fetchProjectNodes(PROJECT_IDS.takvim)).map(toEvent),
  getMoods: async () => (await fetchProjectNodes(PROJECT_IDS.wellness)).map(toMood),
  getGamification: async (): Promise<HayatGamification> => {
    const ns = await fetchProjectNodes(PROJECT_IDS.gamification);
    const n = ns[0];
    if (!n) return { xp: 0, level: 1, rank: 'Çırak', streak: 0 };
    return { xp: fieldNum(n, '@gxp'), level: fieldNum(n, '@glvl'), rank: field(n, '@grank') || 'Çırak', streak: fieldNum(n, '@gstrk') };
  },
  // Backward compat aliases
  getTracks: async () => (await fetchProjectNodes(PROJECT_IDS.albumler)).map(toAlbumTrack),
  getAlbums: async () => {
    const ns = await fetchProjectNodes(PROJECT_IDS.albumler);
    return ns.filter(n => n.parentId === null).map(toAlbumTrack);
  },
  getIdeas: async () => (await fetchProjectNodes(PROJECT_IDS.fikirler)).map(toIdea),
  // ─── MIHENK Provider Inventory ────────────
  getProviderInventory: async (): Promise<MIHENKProviderRecord[]> => {
    const ns = await fetchProjectNodes(PROJECT_IDS.mihenkProviderInventory);
    return ns
      .filter(n => n.parentId !== null)
      .map(n => {
        const t = text(n);
        const json = parseInlineJSON(t);
        if (!json) return null;
        return { id: (json.id as string) || '', status: (json.status as string) || '', source: (json.source as string) || '', endpoints: (json.endpoints as string[]) || [], counts: (json.counts as Record<string, unknown>) || {}, mihenkTargets: (json.mihenkTargets as string[]) || [], nextFix: (json.nextFix as string) || '' } as MIHENKProviderRecord;
      })
      .filter((r): r is MIHENKProviderRecord => r !== null && r.id !== '');
  },

  // ─── MIHENK YouTube Kanallar ────────────
  getYouTubeChannels: async (): Promise<MIHENKYoutubeChannel[]> => {
    const ns = await fetchProjectNodes(PROJECT_IDS.mihenkYoutubeKanallar);
    return ns
      .filter(n => n.parentId !== null)
      .map(n => {
        const t = text(n);
        const json = parseInlineJSON(t);
        if (!json) return null;
        return {
          channel_id: (json.channel_id as string) || '', title: (json.title as string) || '', handle: (json.handle as string) || '',
          subscribers: (json.subscribers as number) || 0, total_views: (json.total_views as number) || 0, declared_video_count: (json.declared_video_count as number) || 0,
          in_data_api: Boolean(json.in_data_api), in_analytics_api: Boolean(json.in_analytics_api),
          snapshot_date: (json.snapshot_date as string) || '', views_window: (json.views_window as number | null) ?? null,
          revenue_window: (json.revenue_window as number | null) ?? null, net_subs_window: (json.net_subs_window as number | null) ?? null,
          avg_cpm: (json.avg_cpm as number | null) ?? null, last_analytics_date: (json.last_analytics_date as string | null) ?? null,
          day_count: (json.day_count as number | null) ?? null,
        } as MIHENKYoutubeChannel;
      })
      .filter((r): r is MIHENKYoutubeChannel => r !== null && r.channel_id !== '');
  },

  // ─── MIHENK YouTube Videolar (batch manifests) ────
  getYouTubeVideoBatches: async (): Promise<MIHENKBatchManifest[]> => {
    const ns = await fetchProjectNodes(PROJECT_IDS.mihenkYoutubeVideolar);
    return ns
      .filter(n => n.parentId !== null)
      .map(n => {
        const t = text(n);
        const json = parseInlineJSON(t);
        if (!json) return null;
        return {
          provider: (json.provider as string) || '', bridge_endpoint: (json.bridge_endpoint as string) || '', payload_path: (json.payload_path as string) || '',
          batch: (json.batch as number) || 1, record_count: (json.record_count as number) || 0, sha16: (json.sha16 as string) || '',
          status: (json.status as string) || '', note: (json.note as string) || '',
        } as MIHENKBatchManifest;
      })
      .filter((r): r is MIHENKBatchManifest => r !== null && r.batch > 0);
  },

  // ─── MIHENK YouTube Günlük Metrikler (batch manifests) ────
  getYouTubeDailyBatches: async (): Promise<MIHENKBatchManifest[]> => {
    const ns = await fetchProjectNodes(PROJECT_IDS.mihenkYoutubeGunlukMetrikler);
    return ns
      .filter(n => n.parentId !== null)
      .map(n => {
        const t = text(n);
        const json = parseInlineJSON(t);
        if (!json) return null;
        return {
          provider: (json.provider as string) || '', bridge_endpoint: (json.bridge_endpoint as string) || '', payload_path: (json.payload_path as string) || '',
          batch: (json.batch as number) || 1, record_count: (json.record_count as number) || 0, sha16: (json.sha16 as string) || '',
          includes_revenue: Boolean(json.includes_revenue), status: (json.status as string) || '', note: (json.note as string) || '',
        } as MIHENKBatchManifest;
      })
      .filter((r): r is MIHENKBatchManifest => r !== null && r.batch > 0);
  },

  // ─── MIHENK Provider Sync Log ────────────
  getProviderSyncLog: async (): Promise<MIHENKSyncLogRecord | null> => {
    const ns = await fetchProjectNodes(PROJECT_IDS.mihenkProviderSyncLog);
    const record = ns.filter(n => n.parentId !== null)[0];
    if (!record) return null;
    const t = text(record);
    const json = parseInlineJSON(t);
    if (!json) return null;
    return {
      status: (json.status as string) || '', freshness: (json.freshness as MIHENKSyncLogRecord['freshness']) || { stale: true, last_analytics_date: '', last_video_fetch_at: '', rule: '' },
      summary: (json.summary as MIHENKSyncLogRecord['summary']) || { channel_count: 0, video_count: 0, daily_row_count: 0, analytics_channel_count: 0, first_analytics_date: '', last_analytics_date: '', last_video_fetch_at: '', revenue_sum: 0, analytics_views_sum: 0, total_subscribers: 0, total_channel_views: 0 },
      counts: (json.counts as MIHENKSyncLogRecord['counts']) || { channels: 0, videos: 0, daily: 0 },
      source: (json.source as string) || '', note: (json.note as string) || '',
    } as MIHENKSyncLogRecord;
  },

  // Legacy data API stubs — channels now read from snapshot project
  getYouTubeVideos: async () => [] as any[],
  getMaestroProjects: async () => [] as any[],
  getMaestroPrompts: async () => [] as any[],
  getMaestroAnalyses: async () => [] as any[],
  getMaestroGenerations: async () => [] as any[],
  getMaestroDashboard: async () => ({} as any),
  getFinanceAccounts: async () => [] as any[],

  // ─── WRITE: NOTES ─────────────────────────────
  createNote: async (data: { title: string; content?: string; folder?: string; tags?: string; note_type?: string }) => {
    const mhkid = `mihenk_not_${Date.now().toString(36).toUpperCase()}`;
    const body: Record<string, unknown> = {
      '/text': data.title,
      '/attributes/@ncont': data.content || '',
      '/attributes/@ndeft': data.folder?.startsWith('nb-') ? data.folder : `nb-${data.folder || 'kisisel'}`,
      '/attributes/@ntype': data.note_type?.startsWith('nt-') ? data.note_type : `nt-${data.note_type || 'taslak'}`,
      '/attributes/@ntags': data.tags || '',
      '/attributes/@ndate': new Date().toISOString(),
      '/attributes/@npinned': '0',
      '/attributes/@mhkid': mhkid,
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.notlar}/nodes`, body);
    return res.data;
  },
  updateNote: async (data: { id: string; title?: string; content?: string; folder?: string; tags?: string; note_type?: string; pinned?: boolean }) => {
    const body: Record<string, unknown> = {};
    if (data.title !== undefined) body['/text'] = data.title;
    if (data.content !== undefined) body['/attributes/@ncont'] = data.content;
    if (data.folder !== undefined) body['/attributes/@ndeft'] = data.folder.startsWith('nb-') ? data.folder : `nb-${data.folder}`;
    if (data.note_type !== undefined) body['/attributes/@ntype'] = data.note_type.startsWith('nt-') ? data.note_type : `nt-${data.note_type}`;
    if (data.tags !== undefined) body['/attributes/@ntags'] = data.tags;
    if (data.pinned !== undefined) body['/attributes/@npinned'] = data.pinned ? '1' : '0';
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.notlar}/nodes/${data.id}`, body);
    return res.data;
  },
  deleteNote: async (data: { id: string }) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.notlar}/nodes/${data.id}`);
    return res.data;
  },

  // ─── WRITE: FINANCE ─────────────────────────────
  createFinanceRecord: async (data: { description: string; amount: number; type?: string; category?: string; currency?: string; wallet?: string }) => {
    const mhkid = `mihenk_finans_${Date.now().toString(36).toUpperCase()}`;
    const body: Record<string, unknown> = {
      '/text': data.description,
      '/attributes/@ftype': data.type?.startsWith('ft-') ? data.type : `ft-${data.type || 'gider'}`,
      '/attributes/@fcat': data.category?.startsWith('fc-') ? data.category : `fc-${data.category || 'diger'}`,
      '/attributes/@famt': data.amount || 0,
      '/attributes/@fcur': data.currency?.startsWith('cur-') ? data.currency : `cur-${(data.currency || 'try').toLowerCase()}`,
      '/attributes/@fwall': data.wallet?.startsWith('w-') ? data.wallet : `w-${data.wallet || 'tombank'}`,
      '/attributes/@fnote': data.description,
      '/attributes/@mhkid': mhkid,
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.finans}/nodes`, body);
    return res.data;
  },
  updateFinanceRecord: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.description !== undefined) { body['/text'] = data.description; body['/attributes/@fnote'] = data.description; }
    if (data.type !== undefined) body['/attributes/@ftype'] = (data.type as string).startsWith('ft-') ? data.type : `ft-${data.type}`;
    if (data.category !== undefined) body['/attributes/@fcat'] = (data.category as string).startsWith('fc-') ? data.category : `fc-${data.category}`;
    if (data.amount !== undefined) body['/attributes/@famt'] = data.amount;
    if (data.currency !== undefined) body['/attributes/@fcur'] = (data.currency as string).startsWith('cur-') ? data.currency : `cur-${(data.currency as string).toLowerCase()}`;
    if (data.wallet !== undefined) body['/attributes/@fwall'] = (data.wallet as string).startsWith('w-') ? data.wallet : `w-${data.wallet}`;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.finans}/nodes/${nodeId}`, body);
    return res.data;
  },
  deleteFinanceRecord: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.finans}/nodes/${nodeId}`);
    return res.data;
  },

  // ─── WRITE: TASKS ─────────────────────────────
  createTask: async (data: { title: string; status?: string; priority?: string; description?: string; tags?: string; parentId?: string }) => {
    const mhkid = `mihenk_gorev_${Date.now().toString(36).toUpperCase()}`;
    const statusMap: Record<string, string> = { idea: 'stat-fikir', todo: 'stat-plan', in_progress: 'stat-uret', done: 'stat-yayin', archived: 'stat-arsiv' };
    const prioMap: Record<string, string> = { urgent: 'pr-acil', high: 'pr-yuksek', medium: 'pr-normal', low: 'pr-dusuk' };
    const body: Record<string, unknown> = {
      '/text': data.title,
      '/attributes/@statu': statusMap[data.status || 'todo'] || 'stat-plan',
      '/attributes/@prior': prioMap[data.priority || 'medium'] || 'pr-normal',
      '/attributes/@notla': data.description || '',
      '/attributes/@kategori': data.tags || '',
      '/attributes/@mhkid': mhkid,
    };
    if (data.parentId) body.parentId = data.parentId;
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.gorevler}/nodes`, body);
    return res.data;
  },
  updateTask: async (data: { id: string; title?: string; status?: string; priority?: string; description?: string; tags?: string }) => {
    const body: Record<string, unknown> = {};
    const statusMap: Record<string, string> = { idea: 'stat-fikir', todo: 'stat-plan', in_progress: 'stat-uret', done: 'stat-yayin', archived: 'stat-arsiv' };
    const prioMap: Record<string, string> = { urgent: 'pr-acil', high: 'pr-yuksek', medium: 'pr-normal', low: 'pr-dusuk' };
    if (data.title !== undefined) body['/text'] = data.title;
    if (data.status !== undefined) body['/attributes/@statu'] = statusMap[data.status] || data.status;
    if (data.priority !== undefined) body['/attributes/@prior'] = prioMap[data.priority] || data.priority;
    if (data.description !== undefined) body['/attributes/@notla'] = data.description;
    if (data.tags !== undefined) body['/attributes/@kategori'] = data.tags;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.gorevler}/nodes/${data.id}`, body);
    return res.data;
  },
  deleteTask: async (data: { id: string }) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.gorevler}/nodes/${data.id}`);
    return res.data;
  },

  // ─── WRITE: IDEAS ─────────────────────────────
  createIdea: async (data: { title: string; category?: string; description?: string; priority?: string }) => {
    const mhkid = `mihenk_fikir_${Date.now().toString(36).toUpperCase()}`;
    const prioMap: Record<string, string> = { high: 'ip-high', medium: 'ip-medium', low: 'ip-low' };
    const body: Record<string, unknown> = {
      '/text': data.title,
      '/attributes/@icat0': data.category?.startsWith('ic-') ? data.category : `ic-${data.category || 'diger'}`,
      '/attributes/@istat': 'is-yeni',
      '/attributes/@iprio': prioMap[data.priority || 'medium'] || 'ip-medium',
      '/attributes/@inote': data.description || '',
      '/attributes/@mhkid': mhkid,
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.fikirler}/nodes`, body);
    return res.data;
  },
  updateIdea: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.title !== undefined) body['/text'] = data.title;
    if (data.category !== undefined) body['/attributes/@icat0'] = (data.category as string).startsWith('ic-') ? data.category : `ic-${data.category}`;
    if (data.status !== undefined) body['/attributes/@istat'] = (data.status as string).startsWith('is-') ? data.status : `is-${data.status}`;
    if (data.description !== undefined) body['/attributes/@inote'] = data.description;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.fikirler}/nodes/${nodeId}`, body);
    return res.data;
  },
  deleteIdea: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.fikirler}/nodes/${nodeId}`);
    return res.data;
  },

  // ─── WRITE: CATALOG ─────────────────────────────
  createArtist: async (data: { name: string; type?: string; origin?: string; genre?: string; sonic_dna?: string; bio?: string }) => {
    const mhkid = `mihenk_katalog_${Date.now().toString(36).toUpperCase()}`;
    const atype = data.type?.startsWith('at-') ? data.type : `at-${data.type || 'solo'}`;
    const aorigin = data.origin?.startsWith('ao-') ? data.origin : `ao-${data.origin || 'gercek'}`;
    const body: Record<string, unknown> = {
      '/text': data.name,
      '/attributes/@atype': atype,
      '/attributes/@aorigj': aorigin,
      '/attributes/@agenr': data.genre || '',
      '/attributes/@asoni': data.sonic_dna || '',
      '/attributes/@abio': data.bio || '',
      '/attributes/@mhkid': mhkid,
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.sanatcilar}/nodes`, body);
    return res.data;
  },

  updateArtist: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.name !== undefined) body['/text'] = data.name;
    if (data.type !== undefined) body['/attributes/@atype'] = data.type;
    if (data.origin !== undefined) body['/attributes/@aorigj'] = data.origin;
    if (data.genre !== undefined) body['/attributes/@agenr'] = data.genre;
    if (data.sonic_dna !== undefined) body['/attributes/@asoni'] = data.sonic_dna;
    if (data.bio !== undefined) body['/attributes/@abio'] = data.bio;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.sanatcilar}/nodes/${nodeId}`, body);
    return res.data;
  },

  deleteArtist: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.sanatcilar}/nodes/${nodeId}`);
    return res.data;
  },

  createTrack: async (data: { title: string; artist: string; artistMhkid?: string; album?: string; genre?: string; bpm?: number; key?: string; pipeline?: string; distribution?: string; parentId?: string }) => {
    const mhkid = `mihenk_katalog_${Date.now().toString(36).toUpperCase()}`;
    const body: Record<string, unknown> = {
      '/text': data.title,
      '/attributes/@tart': data.artist,
      '/attributes/@tartid': data.artistMhkid || '',
      '/attributes/@talbm': data.album || '',
      '/attributes/@tgenr': data.genre || '',
      '/attributes/@tbpm': data.bpm || 0,
      '/attributes/@tkey': data.key || '',
      '/attributes/@tpipe': data.pipeline || 'tp-taslak',
      '/attributes/@tdist': data.distribution || '',
      '/attributes/@mhkid': mhkid,
    };
    if (data.parentId) body.parentId = data.parentId;
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.albumler}/nodes`, body);
    return res.data;
  },

  updateTrack: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.title !== undefined) body['/text'] = data.title;
    if (data.artist !== undefined) body['/attributes/@tart'] = data.artist;
    if (data.artistMhkid !== undefined) body['/attributes/@tartid'] = data.artistMhkid;
    if (data.album !== undefined) body['/attributes/@talbm'] = data.album;
    if (data.genre !== undefined) body['/attributes/@tgenr'] = data.genre;
    if (data.bpm !== undefined) body['/attributes/@tbpm'] = data.bpm;
    if (data.key !== undefined) body['/attributes/@tkey'] = data.key;
    if (data.pipeline !== undefined) body['/attributes/@tpipe'] = data.pipeline;
    if (data.distribution !== undefined) body['/attributes/@tdist'] = data.distribution;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.albumler}/nodes/${nodeId}`, body);
    return res.data;
  },

  deleteTrack: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.albumler}/nodes/${nodeId}`);
    return res.data;
  },

  // ─── WRITE: CALENDAR EVENTS ─────────────────────────────
  createEvent: async (data: { title: string; type?: string; description?: string; location?: string; start_time?: string }) => {
    const mhkid = `mihenk_event_${Date.now().toString(36).toUpperCase()}`;
    const eventDate = data.start_time ? new Date(data.start_time).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const etype = data.type?.startsWith('ev-') ? data.type : `ev-${data.type || 'genel'}`;
    const body: Record<string, unknown> = {
      '/text': data.title,
      '/attributes/@etype': etype,
      '/attributes/@eloc': data.location || '',
      '/attributes/@enote': data.description || '',
      '/attributes/@edate': eventDate,
      '/attributes/@mhkid': mhkid,
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.takvim}/nodes`, body);
    return res.data;
  },
  updateEvent: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.title !== undefined) body['/text'] = data.title;
    if (data.type !== undefined) body['/attributes/@etype'] = data.type;
    if (data.location !== undefined) body['/attributes/@eloc'] = data.location;
    if (data.description !== undefined) body['/attributes/@enote'] = data.description;
    if (data.date !== undefined) body['/attributes/@edate'] = data.date;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.takvim}/nodes/${nodeId}`, body);
    return res.data;
  },
  deleteEvent: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.takvim}/nodes/${nodeId}`);
    return res.data;
  },

  // ─── WRITE: CRM CONTACTS ─────────────────────────────
  createContact: async (data: { name: string; email?: string; phone?: string; company?: string; role?: string; relationship_type?: string; notes?: string }) => {
    const mhkid = `mihenk_contact_${Date.now().toString(36).toUpperCase()}`;
    const body: Record<string, unknown> = {
      '/text': data.name,
      '/attributes/@cemail': data.email || '',
      '/attributes/@cphone': data.phone || '',
      '/attributes/@ccomp': data.company || '',
      '/attributes/@crole': data.role || '',
      '/attributes/@ctype': data.relationship_type || 'personal',
      '/attributes/@cnote': data.notes || '',
      '/attributes/@mhkid': mhkid,
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.kisiler}/nodes`, body);
    return res.data;
  },
  updateContact: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.name !== undefined) body['/text'] = data.name;
    if (data.email !== undefined) body['/attributes/@cemail'] = data.email;
    if (data.phone !== undefined) body['/attributes/@cphone'] = data.phone;
    if (data.company !== undefined) body['/attributes/@ccomp'] = data.company;
    if (data.role !== undefined) body['/attributes/@crole'] = data.role;
    if (data.notes !== undefined) body['/attributes/@cnote'] = data.notes;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.kisiler}/nodes/${nodeId}`, body);
    return res.data;
  },
  deleteContact: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.kisiler}/nodes/${nodeId}`);
    return res.data;
  },

  // ─── WRITE: WELLNESS / MOOD ─────────────────────────────
  createMood: async (data: { score?: number; energy?: number; sleep_hours?: number; water?: number; habits?: string; supplements?: string; notes?: string }) => {
    const today = new Date().toLocaleDateString('tr-TR');
    const body: Record<string, unknown> = {
      '/text': `Check-in ${today}`,
      '/attributes/@wmood': data.score ?? 5,
      '/attributes/@wenrg': data.energy ?? 5,
      '/attributes/@wslep': data.sleep_hours ?? 7,
      '/attributes/@wwatr': data.water ?? 0,
      '/attributes/@whabi': data.habits || '',
      '/attributes/@wtakv': data.supplements || '',
      '/attributes/@wnote': data.notes || '',
    };
    const res = await axios.post(`${API_BASE}/projects/${PROJECT_IDS.wellness}/nodes`, body);
    return res.data;
  },
  updateMood: async (nodeId: string, data: Record<string, unknown>) => {
    const body: Record<string, unknown> = {};
    if (data.score !== undefined) body['/attributes/@wmood'] = data.score;
    if (data.energy !== undefined) body['/attributes/@wenrg'] = data.energy;
    if (data.sleep_hours !== undefined) body['/attributes/@wslep'] = data.sleep_hours;
    if (data.water !== undefined) body['/attributes/@wwatr'] = data.water;
    if (data.notes !== undefined) body['/attributes/@wnote'] = data.notes;
    const res = await axios.patch(`${API_BASE}/projects/${PROJECT_IDS.wellness}/nodes/${nodeId}`, body);
    return res.data;
  },
  deleteMood: async (nodeId: string) => {
    const res = await axios.delete(`${API_BASE}/projects/${PROJECT_IDS.wellness}/nodes/${nodeId}`);
    return res.data;
  },
};

// Backward compat exports
export const hayatosAPI = mihenkAPI;

/* ─── Utilities ─── */
export function ensureArray<T>(val: T[] | null | undefined | unknown): T[] {
  if (Array.isArray(val)) return val;
  return [];
}

type ApiCall<T> = () => Promise<T>;

export function useMihenkData<T>(fetcher: ApiCall<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fetcher()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Veri yüklenemedi'); setData(null); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}

// Backward compat
export const useHayatosData = useMihenkData;
