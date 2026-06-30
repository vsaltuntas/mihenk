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
