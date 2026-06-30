/**
 * HayatOS MCP Client
 * Communicates with https://hayatos.pages.dev/api/mcp
 * Protocol: JSON-RPC 2.0 with MCP tools/call
 */

const MCP_ENDPOINT = 'https://hayatos.pages.dev/api/mcp';

let requestId = 1;

async function mcpCall<T = unknown>(toolName: string, args: Record<string, unknown> = {}): Promise<T> {
  const id = requestId++;
  const res = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: { name: toolName, arguments: args },
    }),
  });

  if (!res.ok) {
    console.warn(`MCP call ${toolName} failed: ${res.status} ${res.statusText}`);
    return [] as unknown as T;
  }

  let json: any;
  try {
    json = await res.json();
  } catch {
    console.warn(`MCP call ${toolName}: invalid JSON response`);
    return [] as unknown as T;
  }

  if (json.error) {
    console.warn(`MCP error (${toolName}): ${json.error.message}`);
    return [] as unknown as T;
  }

  // Response is nested: result.content[0].text → JSON string
  const textContent = json?.result?.content?.[0]?.text;
  if (!textContent) return [] as unknown as T;

  try {
    const parsed = JSON.parse(textContent);
    return parsed as T;
  } catch {
    return textContent as unknown as T;
  }
}

/** Safely ensure a value is an array (guards against MCP returning objects/strings) */
export function ensureArray<T>(val: T[] | null | undefined | unknown): T[] {
  if (Array.isArray(val)) return val;
  return [];
}

/* ─── Types ─── */

export interface HayatProject {
  id: string;
  user_id: string;
  name: string;
  channel_id: string;
  description: string;
  status: string;
  progress: number;
  deadline: string | null;
  tags: string;
  created_at: string;
  updated_at: string;
  is_ai_generated: number;
}

export interface HayatTask {
  id: string;
  user_id?: string;
  project_id?: string | null;
  title: string;
  description?: string;
  status: string; // 'todo' | 'in_progress' | 'done' | 'blocked'
  priority: string; // 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string | null;
  completed_at?: string | null;
  tags?: string;
  created_at: string;
  updated_at?: string;
}

export interface HayatFinanceAccount {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
  institution?: string;
  color?: string;
  created_at: string;
}

export interface HayatFinanceRecord {
  id: string;
  account_id: string;
  type: string; // 'income' | 'expense' | 'transfer'
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  created_at: string;
}

export interface HayatMood {
  id: string;
  mood_score: number; // 1-10
  mood_label: string;
  notes?: string;
  energy_level?: number;
  sleep_hours?: number;
  date: string;
  created_at: string;
}

export interface HayatContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  relationship_type?: string;
  tags?: string;
  notes?: string;
  created_at: string;
}

export interface HayatArtist {
  id: string;
  name: string;
  genre?: string;
  country?: string;
  era?: string;
  description?: string;
  tags?: string;
  created_at: string;
}

export interface HayatAlbum {
  id: string;
  artist_id: string;
  title: string;
  year?: number;
  genre?: string;
  format?: string;
  label?: string;
  created_at: string;
}

export interface HayatTrack {
  id: string;
  album_id?: string;
  artist_id?: string;
  title: string;
  duration?: number;
  status?: string;
  bpm?: number;
  key?: string;
  created_at: string;
}

export interface HayatGamification {
  level?: number;
  xp?: number;
  streak?: number;
  rank?: string;
  badges?: string[];
  total_tasks_completed?: number;
  // raw object — structure may vary
  [key: string]: unknown;
}

export interface HayatNote {
  id: string;
  title: string;
  content: string;
  tags?: string;
  folder?: string;
  is_pinned?: number;
  created_at: string;
  updated_at?: string;
}

export interface HayatEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  type?: string;
  tags?: string;
  created_at: string;
}

/* ─── Maestro Types ─── */

export interface MaestroProject {
  id: string;
  name: string;
  description?: string;
  status?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  tags?: string;
  created_at: string;
  [key: string]: unknown;
}

export interface MaestroPrompt {
  id: string;
  project_id?: string;
  prompt_text: string;
  prompt_type?: string;
  status?: string;
  result?: string;
  created_at: string;
  [key: string]: unknown;
}

export interface MaestroAnalysis {
  id: string;
  project_id?: string;
  analysis_type?: string;
  input_text?: string;
  result?: string;
  status?: string;
  created_at: string;
  [key: string]: unknown;
}

export interface MaestroGeneration {
  id: string;
  project_id?: string;
  prompt_id?: string;
  platform?: string;
  url?: string;
  status?: string;
  title?: string;
  created_at: string;
  [key: string]: unknown;
}

export interface MaestroDashboard {
  total_projects?: number;
  total_prompts?: number;
  total_analyses?: number;
  total_generations?: number;
  [key: string]: unknown;
}

/* ─── Ideas & YouTube Types ─── */

export interface HayatIdea {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  priority?: string;
  tags?: string;
  created_at: string;
  [key: string]: unknown;
}

export interface YouTubeChannel {
  id: string;
  channel_name: string;
  channel_id?: string;
  subscriber_count?: number;
  video_count?: number;
  created_at: string;
  [key: string]: unknown;
}

export interface YouTubeVideo {
  id: string;
  channel_id?: string;
  title: string;
  status?: string;
  views?: number;
  likes?: number;
  published_at?: string;
  created_at: string;
  [key: string]: unknown;
}

/* ─── API calls ─── */

export const hayatosAPI = {
  // ═══ READ ═══
  getProjects: () => mcpCall<HayatProject[]>('list_projects'),
  getTasks: () => mcpCall<HayatTask[]>('list_tasks'),
  getFinanceAccounts: () => mcpCall<HayatFinanceAccount[]>('list_finance_accounts'),
  getFinanceRecords: () => mcpCall<HayatFinanceRecord[]>('list_finance_records'),
  getMoods: () => mcpCall<HayatMood[]>('list_moods'),
  getContacts: () => mcpCall<HayatContact[]>('list_contacts'),
  getArtists: () => mcpCall<HayatArtist[]>('catalog_list_artists'),
  getAlbums: () => mcpCall<HayatAlbum[]>('catalog_list_albums'),
  getTracks: () => mcpCall<HayatTrack[]>('catalog_list_tracks'),
  getGamification: () => mcpCall<HayatGamification>('get_gamification_state'),
  getNotes: () => mcpCall<HayatNote[]>('list_notes'),
  getEvents: () => mcpCall<HayatEvent[]>('list_events'),
  getIdeas: () => mcpCall<HayatIdea[]>('list_ideas'),
  // Maestro
  getMaestroProjects: () => mcpCall<MaestroProject[]>('maestro_list_projects'),
  getMaestroPrompts: () => mcpCall<MaestroPrompt[]>('maestro_list_prompts'),
  getMaestroAnalyses: () => mcpCall<MaestroAnalysis[]>('maestro_list_analyses'),
  getMaestroGenerations: () => mcpCall<MaestroGeneration[]>('maestro_list_generations'),
  getMaestroDashboard: () => mcpCall<MaestroDashboard>('maestro_dashboard'),
  // YouTube
  getYouTubeChannels: () => mcpCall<YouTubeChannel[]>('list_youtube_channels'),
  getYouTubeVideos: () => mcpCall<YouTubeVideo[]>('list_youtube_videos'),

  // ═══ WRITE ═══
  createTask: (args: { title: string; priority?: string; status?: string; project_id?: string; description?: string; due_date?: string }) =>
    mcpCall('create_task', args),
  updateTask: (args: { id: string; status?: string; title?: string; priority?: string }) =>
    mcpCall('update_task', args),
  createFinanceRecord: (args: { amount: number; type: string; category: string; description: string; date: string; account_id?: string; currency?: string }) =>
    mcpCall('create_finance_record', args),
  createNote: (args: { title: string; content: string; category?: string; folder?: string; tags?: string }) =>
    mcpCall('create_note', args),
  updateNote: (args: { id: string; title?: string; content?: string; tags?: string }) =>
    mcpCall('update_note', args),
  deleteNote: (args: { id: string }) =>
    mcpCall('delete_note', args),
  createMood: (args: { score: number; energy?: number; notes?: string; sleep_hours?: number }) =>
    mcpCall('create_mood', args),
  createContact: (args: { name: string; email?: string; phone?: string; company?: string; role?: string; relationship_type?: string; notes?: string }) =>
    mcpCall('create_contact', args),
  createEvent: (args: { title: string; start_time?: string; end_time?: string; location?: string; type?: string; description?: string }) =>
    mcpCall('create_event', args),
  createArtist: (args: { name: string; type?: string; origin?: string; genre?: string }) =>
    mcpCall('catalog_create_artist', args),
  createIdea: (args: { title: string; description?: string; category?: string; priority?: string }) =>
    mcpCall('create_idea', args),
};

/* ─── React hook ─── */

import { useState, useEffect, useCallback } from 'react';

type ApiCall<T> = () => Promise<T>;

export function useHayatosData<T>(fetcher: ApiCall<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Veri yüklenemedi');
      setData(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
